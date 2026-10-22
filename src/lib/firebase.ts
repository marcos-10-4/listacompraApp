import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configuración de la app web de Firebase (consola de Firebase → Configuración del proyecto).
// Estos valores no son secretos: la seguridad la ponen las reglas de firestore.rules.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Falta la configuración de Firebase. Copia .env.example a .env y rellena los valores de tu proyecto.'
  );
}

const yaIniciada = getApps().length > 0;
const app = yaIniciada ? getApp() : initializeApp(firebaseConfig);

// La sesión se guarda en el móvil: al reabrir la app sigues dentro, sin volver a poner tu nombre.
export const auth: Auth = yaIniciada
  ? getAuth(app)
  : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

// Firestore guarda en caché lo que has visto y encola los cambios sin conexión
// mientras la app está abierta; se envían solos al recuperar la señal.
export const db = getFirestore(app);
