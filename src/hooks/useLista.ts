import type { InstaQLEntity } from '@instantdb/react-native';

import type { AppSchema } from '../../instant.schema';
import { db } from '@/lib/db';

// En InstantDB los enlaces se piden con un objeto vacío: { anadidoPor: {} }
/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Producto = InstaQLEntity<
  AppSchema,
  'productos',
  { anadidoPor: {}; compradoPor: {} }
>;
/* eslint-enable @typescript-eslint/no-empty-object-type */
export type MiembroCasa = InstaQLEntity<AppSchema, 'miembros'>;

/** La lista de la casa en tiempo real, separada en pendientes y comprados. */
export function useLista(hogarId: string | undefined) {
  const { isLoading, error, data } = db.useQuery(
    hogarId
      ? {
          hogares: {
            $: { where: { id: hogarId } },
            miembros: {},
            productos: { anadidoPor: {}, compradoPor: {} },
          },
        }
      : null
  );

  const hogar = data?.hogares?.[0];
  const productos: Producto[] = hogar?.productos ?? [];
  const miembros: MiembroCasa[] = [...(hogar?.miembros ?? [])].sort(
    (a, b) => Number(new Date(a.creadoEn)) - Number(new Date(b.creadoEn))
  );

  // Lo último que se ha añadido, arriba. Lo último que se ha comprado, arriba.
  const pendientes = productos
    .filter((p) => !p.comprado)
    .sort((a, b) => Number(new Date(b.creadoEn)) - Number(new Date(a.creadoEn)));
  const comprados = productos
    .filter((p) => p.comprado)
    .sort(
      (a, b) =>
        Number(new Date(b.compradoEn ?? 0)) - Number(new Date(a.compradoEn ?? 0))
    );

  return { isLoading, error, pendientes, comprados, miembros };
}
