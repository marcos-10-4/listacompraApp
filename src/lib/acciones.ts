// Todo lo que escribe en la base de datos está aquí, para que las pantallas solo pinten.
import { id } from '@instantdb/react-native';

import { db } from './db';
import { generarCodigo, normalizarCodigo } from './codigo';
import { capitalizar, colorAleatorio } from './miembros';

/** Primera vez: entra como invitado (sin contraseña) y crea su perfil con su nombre. */
export async function crearPerfil(nombre: string, usuarioIdActual?: string) {
  let usuarioId = usuarioIdActual;
  if (!usuarioId) {
    const respuesta = await db.auth.signInAsGuest();
    usuarioId = respuesta.user.id;
  }
  await db.transact(
    db.tx.miembros[id()]
      .update({ nombre: capitalizar(nombre), color: colorAleatorio(), creadoEn: Date.now() })
      .link({ $user: usuarioId })
  );
}

export function cambiarNombre(miembroId: string, nombre: string) {
  return db.transact(db.tx.miembros[miembroId].update({ nombre: capitalizar(nombre) }));
}

/** Crea la casa con un código de invitación y mete dentro a quien la crea. */
export async function crearHogar(miembroId: string) {
  // El código es único en el esquema; si por mala suerte ya existe, se prueba otro.
  for (let intento = 0; intento < 3; intento++) {
    const hogarId = id();
    try {
      await db.transact([
        db.tx.hogares[hogarId].update({
          nombre: 'Casa',
          codigo: generarCodigo(),
          creadoEn: Date.now(),
        }),
        db.tx.miembros[miembroId].link({ hogar: hogarId }),
      ]);
      return;
    } catch (e) {
      if (intento === 2) throw e;
    }
  }
}

/** Busca la casa por su código y se une a ella. Necesita conexión. */
export async function unirseConCodigo(miembroId: string, texto: string) {
  const codigo = normalizarCodigo(texto);
  if (codigo.length !== 6) {
    throw new Error('El código tiene 6 caracteres, por ejemplo K7P-4QX.');
  }

  const { data } = await db.queryOnce(
    { hogares: { $: { where: { codigo } } } },
    { ruleParams: { codigo } }
  );
  const hogar = data.hogares[0];
  if (!hogar) {
    throw new Error('No hay ninguna casa con ese código. Revísalo con quien te lo pasó.');
  }

  await db.transact(
    db.tx.hogares[hogar.id].ruleParams({ codigo }).link({ miembros: miembroId })
  );
}

export function salirDeCasa(miembroId: string, hogarId: string) {
  return db.transact(db.tx.miembros[miembroId].unlink({ hogar: hogarId }));
}

export function anadirProducto(hogarId: string, miembroId: string, nombre: string) {
  return db.transact(
    db.tx.productos[id()]
      .update({ nombre: capitalizar(nombre), comprado: false, creadoEn: Date.now() })
      .link({ hogar: hogarId, anadidoPor: miembroId })
  );
}

export function marcarComprado(productoId: string, miembroId: string) {
  return db.transact(
    db.tx.productos[productoId]
      .update({ comprado: true, compradoEn: Date.now() })
      .link({ compradoPor: miembroId })
  );
}

export function desmarcarComprado(productoId: string, compradoPorId?: string) {
  const chunk = db.tx.productos[productoId].update({ comprado: false, compradoEn: null });
  return db.transact(compradoPorId ? chunk.unlink({ compradoPor: compradoPorId }) : chunk);
}

export function borrarProducto(productoId: string) {
  return db.transact(db.tx.productos[productoId].delete());
}

export function vaciarComprados(productoIds: string[]) {
  return db.transact(productoIds.map((pid) => db.tx.productos[pid].delete()));
}
