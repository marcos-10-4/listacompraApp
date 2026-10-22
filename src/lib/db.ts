import { init } from '@instantdb/react-native';

import schema from '../../instant.schema';

// El App ID está en el panel de InstantDB (instantdb.com/dash).
// Ponlo en el archivo .env como EXPO_PUBLIC_INSTANT_APP_ID=...
const APP_ID = process.env.EXPO_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  throw new Error(
    'Falta EXPO_PUBLIC_INSTANT_APP_ID. Copia .env.example a .env y pon el App ID de InstantDB.'
  );
}

// InstantDB guarda los datos en el móvil (AsyncStorage): la lista se ve y se puede
// editar sin cobertura, y los cambios se sincronizan solos al recuperar la conexión.
export const db = init({ appId: APP_ID, schema });
