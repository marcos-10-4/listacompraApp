// Todo lo que escribe en la base de datos está aquí, para que las pantallas solo pinten.
import { signInAnonymously } from 'firebase/auth';
import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

import { auth, db } from './firebase';
import { generarCodigo, normalizarCodigo } from './codigo';
import { capitalizar, colorAleatorio } from './miembros';
import type { Miembro } from './tipos';

// Las escrituras de productos no se esperan (no se hace await): Firestore las aplica al momento
// en el móvil y las manda al servidor cuando hay conexión. Si se esperasen, sin cobertura la
// app se quedaría "colgada" hasta recuperar la señal.
function enSegundoPlano(promesa: Promise<unknown>) {
  promesa.catch((e) => console.warn('No se pudo guardar el cambio:', e));
}

/* ───────────── Perfil ───────────── */

/** Primera vez: entra como usuario anónimo (sin contraseña) y crea su perfil con su nombre. */
export async function crearPerfil(nombre: string) {
  const usuario = auth.currentUser ?? (await signInAnonymously(auth)).user;
  await setDoc(doc(db, 'miembros', usuario.uid), {
    nombre: capitalizar(nombre),
    color: colorAleatorio(),
    hogarId: null,
    creadoEn: Date.now(),
  });
}

/** Cambia el nombre en su perfil y en la ficha de la casa (donde lo ven los demás). */
export async function cambiarNombre(miembro: Miembro, nombre: string) {
  const limpio = capitalizar(nombre);
  const lote = writeBatch(db);
  lote.update(doc(db, 'miembros', miembro.id), { nombre: limpio });
  if (miembro.hogarId) {
    lote.update(doc(db, 'hogares', miembro.hogarId), { [`perfiles.${miembro.id}.nombre`]: limpio });
  }
  enSegundoPlano(lote.commit());
}

/* ───────────── Casa ───────────── */

/** Crea la casa con un código de invitación único y mete dentro a quien la crea. */
export async function crearHogar(miembro: Miembro) {
  // Si el código ya existiera, las reglas rechazan el lote y se prueba con otro.
  for (let intento = 0; intento < 3; intento++) {
    const codigo = generarCodigo();
    const hogarRef = doc(collection(db, 'hogares'));
    const ahora = Date.now();
    const lote = writeBatch(db);

    lote.set(hogarRef, {
      nombre: 'Casa',
      codigo,
      creadorId: miembro.id,
      creadoEn: ahora,
      miembros: [miembro.id],
      perfiles: { [miembro.id]: { nombre: miembro.nombre, color: miembro.color, unidoEn: ahora } },
    });
    lote.set(doc(db, 'codigos', codigo), { hogarId: hogarRef.id, creadoEn: ahora });
    lote.update(doc(db, 'miembros', miembro.id), { hogarId: hogarRef.id });

    try {
      await lote.commit();
      return;
    } catch (e) {
      if (intento === 2) throw e;
    }
  }
}

/** Busca la casa por su código y se une a ella. Necesita conexión. */
export async function unirseConCodigo(miembro: Miembro, texto: string) {
  const codigo = normalizarCodigo(texto);
  if (codigo.length !== 6) {
    throw new Error('El código tiene 6 caracteres, por ejemplo K7P-4QX.');
  }

  const snap = await getDoc(doc(db, 'codigos', codigo));
  if (!snap.exists()) {
    throw new Error('No hay ninguna casa con ese código. Revísalo con quien te lo pasó.');
  }
  const hogarId = snap.data().hogarId as string;
  const ahora = Date.now();

  const lote = writeBatch(db);
  // Esta "unión" demuestra a las reglas de seguridad que conoce el código.
  lote.set(doc(db, 'codigos', codigo, 'uniones', miembro.id), { creadoEn: ahora });
  lote.update(doc(db, 'hogares', hogarId), {
    miembros: arrayUnion(miembro.id),
    [`perfiles.${miembro.id}`]: { nombre: miembro.nombre, color: miembro.color, unidoEn: ahora },
  });
  lote.update(doc(db, 'miembros', miembro.id), { hogarId });
  await lote.commit();
}

export async function salirDeCasa(miembro: Miembro) {
  if (!miembro.hogarId) return;
  const lote = writeBatch(db);
  lote.update(doc(db, 'hogares', miembro.hogarId), {
    miembros: arrayRemove(miembro.id),
    [`perfiles.${miembro.id}`]: deleteField(),
  });
  lote.update(doc(db, 'miembros', miembro.id), { hogarId: null });
  await lote.commit();
}

/* ───────────── Productos ───────────── */

function productos(hogarId: string) {
  return collection(db, 'hogares', hogarId, 'productos');
}

export function anadirProducto(hogarId: string, miembro: Miembro, nombre: string) {
  enSegundoPlano(
    setDoc(doc(productos(hogarId)), {
      nombre: capitalizar(nombre),
      comprado: false,
      creadoEn: Date.now(),
      anadidoPorId: miembro.id,
      anadidoPorNombre: miembro.nombre,
    })
  );
}

export function marcarComprado(hogarId: string, productoId: string, miembro: Miembro) {
  enSegundoPlano(
    updateDoc(doc(productos(hogarId), productoId), {
      comprado: true,
      compradoEn: Date.now(),
      compradoPorId: miembro.id,
      compradoPorNombre: miembro.nombre,
    })
  );
}

export function desmarcarComprado(hogarId: string, productoId: string) {
  enSegundoPlano(
    updateDoc(doc(productos(hogarId), productoId), {
      comprado: false,
      compradoEn: null,
      compradoPorId: null,
      compradoPorNombre: null,
    })
  );
}

export function borrarProducto(hogarId: string, productoId: string) {
  enSegundoPlano(deleteDoc(doc(productos(hogarId), productoId)));
}

export function vaciarComprados(hogarId: string, productoIds: string[]) {
  // Un lote admite hasta 500 operaciones; de sobra para una lista de la compra.
  const lote = writeBatch(db);
  productoIds.forEach((id) => lote.delete(doc(productos(hogarId), id)));
  enSegundoPlano(lote.commit());
}
