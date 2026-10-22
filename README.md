# Lista de la compra 🛒

App móvil (Android e iOS) para la lista de la compra de casa. Todos los de casa ven la misma
lista en tiempo real. Si no hay cobertura (por ejemplo, en el súper), se puede seguir tachando y
añadiendo cosas: los cambios se envían solos al volver la señal.

**Stack:** Expo (React Native) + TypeScript + Expo Router + Firebase (Auth anónima + Firestore).

## Puesta en marcha

### 1. Crea el proyecto en Firebase (gratis, sin tarjeta)

1. Entra en <https://console.firebase.google.com> y crea un proyecto (Analytics no hace falta).
2. **Authentication** → *Comenzar* → *Método de acceso* → activa **Anónimo**.
3. **Firestore Database** → *Crear base de datos* → ubicación `eur3 (europe-west)` → modo
   **producción**.
4. **Configuración del proyecto** (⚙️) → *Tus apps* → añade una app **Web** (`</>`). Copia los
   valores de `firebaseConfig`.

### 2. Configura la app

```bash
cp .env.example .env
# rellena .env con los valores de firebaseConfig
npm install
```

### 3. Sube las reglas de seguridad

```bash
npx firebase-tools login
npx firebase-tools use --add          # elige tu proyecto
npx firebase-tools deploy --only firestore:rules
```

(También puedes copiar el contenido de `firestore.rules` en Firestore → *Reglas* → *Publicar*.)

### 4. Arranca

```bash
npx expo start
```

Escanea el QR con **Expo Go** en Android o iPhone. Todo lo que usa la app funciona en Expo Go, así
que de momento no hace falta compilar nada.

## Cómo funciona

1. **Bienvenida**: cada persona pone su nombre. Entra con un usuario anónimo de Firebase (sin
   email ni contraseña). La sesión queda guardada en el móvil.
2. **Crear o unirse**: el primero crea la lista de casa y recibe un código (p. ej. `K7P-4QX`). El
   resto lo introduce para unirse. Este paso necesita conexión.
3. **Lista**: añadir con la caja de abajo, tocar para tachar (lo comprado baja a «Comprados»),
   tocar de nuevo para devolverlo, mantener pulsado para borrar y «Vaciar comprados» para limpiar.
   La cabecera indica si todo está sincronizado o si hay cambios pendientes de enviar.
4. **Ajustes**: código para invitar (con botón de compartir), miembros, cambiar nombre y salir de
   la casa.

## Estructura

```
firestore.rules         Reglas de seguridad: cada casa solo ve y toca lo suyo
firebase.json           Para desplegar las reglas con firebase-tools
src/
  app/                  Pantallas (Expo Router: cada archivo es una ruta)
    _layout.tsx         Fuentes, sesión y qué pantallas están disponibles según el estado
    bienvenida.tsx      Poner el nombre
    unirse.tsx          Crear la casa o unirse con código
    index.tsx           La lista
    ajustes.tsx         Código, miembros, cambiar nombre, salir
  components/           Avatar, Boton, FilaProducto
  hooks/
    useSesion.tsx       Usuario, perfil y casa actual (y en qué paso está)
    useLista.ts         Productos y miembros de la casa en tiempo real
  lib/
    firebase.ts         Conexión con Firebase (Auth con sesión guardada + Firestore)
    acciones.ts         Todas las escrituras (añadir, tachar, unirse…)
    tipos.ts            Forma de los documentos
    codigo.ts           Generar y formatear códigos de invitación
    miembros.ts         Iniciales, colores de avatar
  types/                Tipos que faltan en el SDK de Firebase para React Native
  theme.ts              Colores y fuentes del diseño
```

### Datos en Firestore

```
miembros/{uid}                    nombre, color, hogarId, creadoEn
hogares/{hogarId}                 nombre, codigo, creadorId, creadoEn,
                                  miembros: [uid], perfiles: { uid: {nombre, color, unidoEn} }
hogares/{hogarId}/productos/{id}  nombre, cantidad?, comprado, creadoEn, compradoEn?,
                                  anadidoPorId, anadidoPorNombre, compradoPorId?, compradoPorNombre?
codigos/{codigo}                  hogarId          ← para encontrar la casa con el código
codigos/{codigo}/uniones/{uid}    creadoEn         ← prueba de que quien se une conoce el código
```

Las reglas solo dejan leer y escribir la casa y sus productos a quienes están en
`hogares/{id}.miembros`. Para entrar en esa lista hay que conocer el código.

## Sin conexión

El SDK web de Firebase guarda en caché lo que has visto y encola los cambios **mientras la app
está abierta**. Si se cierra la app del todo sin cobertura, los cambios que no se hubieran
enviado se pierden. Para tener caché persistente en disco habría que pasar a
[React Native Firebase](https://rnfirebase.io), que necesita compilar la app con EAS (también
gratis) en lugar de usar Expo Go.

## Comandos útiles

```bash
npm run lint        # revisar el código
npm run typecheck   # comprobar tipos
```

## Publicar

- **Android**: `npx eas-cli@latest build -p android --profile preview` genera un APK que puedes
  pasar a la familia (gratis).
- **iOS**: para instalarla de forma normal en un iPhone hace falta la cuenta de desarrollador de
  Apple (99 €/año). Mientras tanto se puede usar con Expo Go.
