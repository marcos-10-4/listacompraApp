import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SesionProvider, useSesion } from '@/hooks/useSesion';
import { colores, fuentes } from '@/theme';

export default function RootLayout() {
  const [fuentesListas] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fuentesListas) return <Cargando />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SesionProvider>
        <Navegacion />
      </SesionProvider>
    </SafeAreaProvider>
  );
}

/**
 * Cada pantalla solo existe en su momento del flujo. Si cambia el estado
 * (por ejemplo, al unirse a una casa), Expo Router lleva sola a la pantalla correcta.
 */
function Navegacion() {
  const { estado, error } = useSesion();

  if (estado === 'cargando') return <Cargando />;
  if (estado === 'error') {
    return (
      <View style={styles.centro}>
        <Text style={styles.errorTitulo}>No se ha podido cargar la lista</Text>
        <Text style={styles.errorTexto}>{error}</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colores.fondo } }}>
      <Stack.Protected guard={estado === 'sinNombre'}>
        <Stack.Screen name="bienvenida" />
      </Stack.Protected>
      <Stack.Protected guard={estado === 'sinHogar'}>
        <Stack.Screen name="unirse" />
      </Stack.Protected>
      <Stack.Protected guard={estado === 'listo'}>
        <Stack.Screen name="index" />
        <Stack.Screen name="ajustes" />
      </Stack.Protected>
    </Stack>
  );
}

function Cargando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={colores.primario} />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.fondo,
    padding: 24,
    gap: 8,
  },
  errorTitulo: { fontFamily: fuentes.bold, fontSize: 18, color: colores.texto, textAlign: 'center' },
  errorTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario, textAlign: 'center' },
});
