// Forma de los documentos en Firestore.
//
//   miembros/{uid}                     perfil de cada persona
//   hogares/{hogarId}                  la casa (una sola lista)
//   hogares/{hogarId}/productos/{id}   cada cosa que falta
//   codigos/{codigo}                   código de invitación → hogarId
//   codigos/{codigo}/uniones/{uid}     prueba de que quien se une conoce el código

export type Perfil = {
  nombre: string;
  color: string;
};

export type Miembro = Perfil & {
  id: string; // = uid de Firebase Auth
  hogarId: string | null;
  creadoEn: number;
};

export type Hogar = {
  id: string;
  nombre: string;
  codigo: string;
  creadorId: string;
  creadoEn: number;
  miembros: string[]; // uids; las reglas de seguridad se basan en esta lista
  perfiles: Record<string, Perfil & { unidoEn: number }>;
};

export type Producto = {
  id: string;
  nombre: string;
  cantidad?: string;
  comprado: boolean;
  creadoEn: number;
  compradoEn?: number | null;
  anadidoPorId: string;
  anadidoPorNombre: string;
  compradoPorId?: string | null;
  compradoPorNombre?: string | null;
};

/** Miembro tal y como se muestra en la casa (sacado de hogar.perfiles). */
export type MiembroCasa = Perfil & { id: string; unidoEn: number };
