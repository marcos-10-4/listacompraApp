// En móvil, `firebase/auth` carga la versión de React Native, que incluye
// getReactNativePersistence, pero sus tipos solo describen la versión web.
// Esta declaración añade el tipo que falta.
import type { Persistence } from 'firebase/auth';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    removeItem(key: string): Promise<void>;
  }): Persistence;
}
