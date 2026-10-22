import { createContext, useContext, type ReactNode } from 'react';
import type { InstaQLEntity, User } from '@instantdb/react-native';

import type { AppSchema } from '../../instant.schema';
import { db } from '@/lib/db';

export type Miembro = InstaQLEntity<AppSchema, 'miembros'>;
export type Hogar = InstaQLEntity<AppSchema, 'hogares'>;

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

const SesionContext = createContext<Sesion | null>(null);

export function SesionProvider({ children }: { children: ReactNode }) {
  const auth = db.useAuth();
  const usuarioId = auth.user?.id;

  const consulta = db.useQuery(
    usuarioId
      ? { miembros: { $: { where: { '$user.id': usuarioId } }, hogar: {} } }
      : null
  );

  const miembroConHogar = consulta.data?.miembros?.[0] ?? null;
  const { hogar, ...miembro } = miembroConHogar ?? { hogar: undefined };

  let estado: EstadoSesion;
  let error: string | null = null;

  if (auth.isLoading) {
    estado = 'cargando';
  } else if (auth.error) {
    estado = 'error';
    error = auth.error.message;
  } else if (!auth.user) {
    estado = 'sinNombre';
  } else if (consulta.isLoading) {
    estado = 'cargando';
  } else if (consulta.error) {
    estado = 'error';
    error = consulta.error.message;
  } else if (!miembroConHogar) {
    estado = 'sinNombre';
  } else if (!hogar) {
    estado = 'sinHogar';
  } else {
    estado = 'listo';
  }

  const valor: Sesion = {
    estado,
    usuario: auth.user ?? null,
    miembro: miembroConHogar ? (miembro as Miembro) : null,
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
