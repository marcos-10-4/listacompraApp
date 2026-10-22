// Esquema de datos de InstantDB.
// Súbelo al proyecto con: npx instant-cli@latest push schema
import { i } from '@instantdb/react-native';

const _schema = i.schema({
  entities: {
    // Usuarios de InstantDB (en esta app son invitados, sin email ni contraseña).
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
    }),

    // La casa: una sola lista compartida por todos sus miembros.
    hogares: i.entity({
      nombre: i.string(),
      codigo: i.string().unique().indexed(), // código de invitación, p. ej. "K7P4QX"
      creadoEn: i.date(),
    }),

    // Perfil de cada persona dentro de la app (nombre y color del avatar).
    miembros: i.entity({
      nombre: i.string(),
      color: i.string(),
      creadoEn: i.date(),
    }),

    // Cada cosa que falta en casa.
    productos: i.entity({
      nombre: i.string(),
      cantidad: i.string().optional(),
      comprado: i.boolean().indexed(),
      creadoEn: i.date().indexed(),
      compradoEn: i.date().optional(),
    }),
  },

  links: {
    // miembro ↔ usuario de InstantDB (1 a 1)
    miembroUsuario: {
      forward: { on: 'miembros', has: 'one', label: '$user' },
      reverse: { on: '$users', has: 'one', label: 'miembro' },
    },
    // miembro → hogar (una casa tiene varios miembros)
    miembroHogar: {
      forward: { on: 'miembros', has: 'one', label: 'hogar' },
      reverse: { on: 'hogares', has: 'many', label: 'miembros' },
    },
    // producto → hogar (si se borra la casa, se borran sus productos)
    productoHogar: {
      forward: { on: 'productos', has: 'one', label: 'hogar', onDelete: 'cascade' },
      reverse: { on: 'hogares', has: 'many', label: 'productos' },
    },
    // quién lo añadió
    productoAnadidoPor: {
      forward: { on: 'productos', has: 'one', label: 'anadidoPor' },
      reverse: { on: 'miembros', has: 'many', label: 'productosAnadidos' },
    },
    // quién lo compró
    productoCompradoPor: {
      forward: { on: 'productos', has: 'one', label: 'compradoPor' },
      reverse: { on: 'miembros', has: 'many', label: 'productosComprados' },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
