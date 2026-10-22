# Lista de la compra 🛒

App móvil (Android e iOS) para la lista de la compra de casa. Todos los de casa ven la misma
lista en tiempo real y funciona también sin cobertura: los cambios se guardan en el móvil y se
sincronizan solos al volver la conexión.

**Stack:** Expo (React Native) + TypeScript + Expo Router + [InstantDB](https://www.instantdb.com).

## Puesta en marcha

1. **Crea la app en InstantDB** (gratis): entra en <https://www.instantdb.com/dash>, crea una app
   y copia su **App ID**.

2. **Configura el App ID**:

   ```bash
   cp .env.example .env
   # edita .env y pon tu App ID
   ```

3. **Instala dependencias**:

   ```bash
   npm install
   ```

4. **Sube el esquema y los permisos** a InstantDB:

   ```bash
   npx instant-cli@latest login
   npx instant-cli@latest push schema --app TU_APP_ID
   npx instant-cli@latest push perms --app TU_APP_ID
   ```

5. **Arranca la app**:

   ```bash
   npx expo start
   ```

   Escanea el QR con **Expo Go** (Android o iPhone) y listo. Todas las librerías que usa la app
   funcionan en Expo Go, así que de momento no hace falta compilar nada.

## Cómo funciona

1. **Bienvenida**: cada persona pone su nombre. Entra como *usuario invitado* de InstantDB, sin
   email ni contraseña.
2. **Crear o unirse**: el primero crea la lista de casa y recibe un código (p. ej. `K7P-4QX`). El
   resto lo introduce para unirse.
3. **Lista**: añadir con la caja de abajo, tocar para tachar (lo comprado baja a «Comprados»),
   tocar de nuevo para devolverlo, mantener pulsado para borrar y «Vaciar comprados» para limpiar.
4. **Ajustes**: código para invitar (con botón de compartir), miembros, cambiar nombre y salir de
   la casa.

## Estructura

```
instant.schema.ts       Esquema de datos (hogares, miembros, productos y sus enlaces)
instant.perms.ts        Permisos: cada casa solo ve y toca lo suyo
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
    db.ts               Conexión con InstantDB
    acciones.ts         Todas las escrituras (añadir, tachar, unirse…)
    codigo.ts           Generar y formatear códigos de invitación
    miembros.ts         Iniciales, colores de avatar
  theme.ts              Colores y fuentes del diseño
```

### Modelo de datos

```
hogares    nombre, codigo (único), creadoEn
miembros   nombre, color, creadoEn          → $user (1:1), → hogar
productos  nombre, cantidad?, comprado, creadoEn, compradoEn?
           → hogar, → anadidoPor (miembro), → compradoPor (miembro)
```

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
