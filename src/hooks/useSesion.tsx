import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { auth, db } from '@/lib/firebase';
import type { Hogar, Miembro } from '@/lib/tipos';

/**
 * En qué punto está la persona:
 * - cargando: leyendo la sesión guardada
 * - sinNombre: aún no ha dicho cómo se llama → Bienvenida
 * - sinHogar: tiene nombre pero no está en ninguna casa → Crear o unirse
 * - listo: tiene casa → Lista
 */
export type EstadoSesion = 'cargando' | 'sinNombre' | 'sinHogar' | 'listo' | 'error';

type Sesion = {
  estado: EstadoSesion;
  usuario: User | null;
  miembro: Miembro | null;
  hogar: Hogar | null;
  error: string | null;
};

/** Último resultado de una suscripción, recordando de qué documento era. */
type Lectura<T> = { id: string; valor: T | null };

const SesionContext = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  // undefined = aún no sabemos si hay sesión guardada
  const [usuario, setUsuario] = useState<User | null | undefined>(undefined);
  const [lecturaMiembro, setLecturaMiembro] = useState<Lectura<Miembro> | null>(null);
  const [lecturaHogar, setLecturaHogar] = useState<Lectura<Hogar> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Usuario de Firebase Auth (anónimo)
  useEffect(() => onAuthStateChanged(auth, setUsuario), []);

  // 2. Su perfil: miembros/{uid}
  const uid = usuario?.uid;
  useEffect(() => {
    if (!uid) return;
    return onSnapshot(
      doc(db, 'miembros', uid),
      (snap) =>
        setLecturaMiembro({
          id: uid,
          valor: snap.exists() ? ({ id: snap.id, ...snap.data() } as Miembro) : null,
        }),
      (e) => setError(e.message)
    );
  }, [uid]);

  // undefined mientras carga; null si no tiene perfil
  const miembro: Miembro | null | undefined =
    usuario === undefined
      ? undefined
      : !uid
        ? null
        : lecturaMiembro?.id === uid
          ? lecturaMiembro.valor
          : undefined;

  // 3. Su casa: hogares/{hogarId} (solo se vuelve a suscribir si cambia de casa)
  const hogarId = miembro?.hogarId ?? null;
  useEffect(() => {
    if (!hogarId) return;
    return onSnapshot(
      doc(db, 'hogares', hogarId),
      (snap) =>
        setLecturaHogar({
          id: hogarId,
          valor: snap.exists() ? ({ id: snap.id, ...snap.data() } as Hogar) : null,
        }),
      // Si ya no es miembro, las reglas deniegan la lectura: se trata como "sin casa".
      () => setLecturaHogar({ id: hogarId, valor: null })
    );
  }, [hogarId]);

  const hogar: Hogar | null | undefined = !hogarId
    ? null
    : lecturaHogar?.id === hogarId
      ? lecturaHogar.valor
      : undefined;

  let estado: EstadoSesion;
  if (error) estado = 'error';
  else if (miembro === undefined) estado = 'cargando';
  else if (!miembro) estado = 'sinNombre';
  else if (hogar === undefined) estado = 'cargando';
  else if (!hogar) estado = 'sinHogar';
  else estado = 'listo';

  const valor: Sesion = {
    estado,
    usuario: usuario ?? null,
    miembro: miembro ?? null,
    hogar: hogar ?? null,
    error,
  };

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion(): Sesion {
  const sesion = useContext(SesionContext);
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return sesion;
}
