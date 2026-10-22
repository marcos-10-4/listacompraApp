import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';
import type { Hogar, MiembroCasa, Producto } from '@/lib/tipos';

/** La lista de la casa en tiempo real, separada en pendientes y comprados. */
export function useLista(hogar: Hogar | null) {
  const hogarId = hogar?.id;
  const [lectura, setLectura] = useState<{
    hogarId: string;
    productos: Producto[];
    // true cuando todo está guardado en el servidor; false sin conexión o con cambios pendientes
    sincronizado: boolean;
  } | null>(null);

  useEffect(() => {
    if (!hogarId) return;
    return onSnapshot(
      collection(db, 'hogares', hogarId, 'productos'),
      { includeMetadataChanges: true },
      (snap) =>
        setLectura({
          hogarId,
          productos: snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Producto),
          sincronizado: !snap.metadata.fromCache && !snap.metadata.hasPendingWrites,
        }),
      () => setLectura({ hogarId, productos: [], sincronizado: false })
    );
  }, [hogarId]);

  const actual = lectura && lectura.hogarId === hogarId ? lectura : null;
  const cargando = !actual;
  const productos = actual?.productos ?? [];
  const sincronizado = actual?.sincronizado ?? false;

  const miembros: MiembroCasa[] = useMemo(
    () =>
      Object.entries(hogar?.perfiles ?? {})
        .filter(([id]) => hogar?.miembros.includes(id))
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => a.unidoEn - b.unidoEn),
    [hogar]
  );

  // Lo último que se ha añadido, arriba. Lo último que se ha comprado, arriba.
  const pendientes = productos
    .filter((p) => !p.comprado)
    .sort((a, b) => b.creadoEn - a.creadoEn);
  const comprados = productos
    .filter((p) => p.comprado)
    .sort((a, b) => (b.compradoEn ?? 0) - (a.compradoEn ?? 0));

  return { cargando, sincronizado, pendientes, comprados, miembros };
}
