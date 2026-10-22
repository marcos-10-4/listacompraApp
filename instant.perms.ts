// Permisos de InstantDB: cada casa solo ve y toca sus propios datos.
// Súbelos con: npx instant-cli@latest push perms
import type { InstantRules } from '@instantdb/react-native';

const rules = {
  // Nadie puede crear atributos nuevos desde el móvil: el esquema manda.
  attrs: {
    allow: { $default: 'false' },
  },

  hogares: {
    allow: {
      // Lo ven sus miembros, o quien escribe el código correcto para unirse.
      view: 'esMiembro || tieneCodigo',
      create: 'auth.id != null',
      // Unirse añade un enlace miembro → hogar, así que también se permite con el código.
      update: 'esMiembro || tieneCodigo',
      delete: 'false',
    },
    bind: {
      esMiembro: "auth.id in data.ref('miembros.$user.id')",
      tieneCodigo: 'auth.id != null && ruleParams.codigo == data.codigo',
    },
  },

  miembros: {
    allow: {
      // Te ves a ti mismo y a la gente de tu casa.
      view: 'esYo || mismaCasa',
      // Cada uno solo crea, cambia o borra su propio perfil.
      create: 'esYo',
      update: 'esYo',
      delete: 'esYo',
    },
    bind: {
      esYo: "auth.id in data.ref('$user.id')",
      mismaCasa: "auth.id in data.ref('hogar.miembros.$user.id')",
    },
  },

  productos: {
    allow: {
      // Cualquier miembro de la casa puede ver, añadir, tachar y borrar productos.
      view: 'esDeMiCasa',
      create: 'esDeMiCasa',
      update: 'esDeMiCasa',
      delete: 'esDeMiCasa',
    },
    bind: {
      esDeMiCasa: "auth.id in data.ref('hogar.miembros.$user.id')",
    },
  },
} satisfies InstantRules;

export default rules;
