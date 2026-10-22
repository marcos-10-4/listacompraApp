import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/Boton';
import { useSesion } from '@/hooks/useSesion';
import { crearPerfil } from '@/lib/acciones';
import { colores, fuentes } from '@/theme';

export default function Bienvenida() {
  const { usuario } = useSesion();
  const [nombre, setNombre] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const continuar = async () => {
    if (!nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      await crearPerfil(nombre, usuario?.id);
      // La navegación a "unirse" ocurre sola al cambiar el estado de la sesión.
    } catch {
      setError('No se ha podido guardar. ¿Tienes conexión? Inténtalo de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={styles.arriba}>
            <View style={styles.logo}>
              <Ionicons name="basket-outline" size={38} color="#FFFFFF" accessibilityLabel="Cesta de la compra" />
            </View>
            <View style={{ gap: 12 }}>
              <Text style={styles.titulo} accessibilityRole="header">
                La lista de la compra de casa
              </Text>
              <Text style={styles.subtitulo}>
                Apunta lo que falta en cuanto te acuerdes. Todos los de casa veis la misma lista al
                momento, también sin cobertura en el súper.
              </Text>
            </View>
          </View>

          <View style={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <Text style={styles.label} nativeID="label-nombre">
                ¿Cómo te llamas?
              </Text>
              <TextInput
                accessibilityLabelledBy="label-nombre"
                value={nombre}
                onChangeText={setNombre}
                placeholder="Tu nombre"
                placeholderTextColor={colores.placeholder}
                autoCapitalize="words"
                autoComplete="given-name"
                returnKeyType="done"
                onSubmitEditing={continuar}
                maxLength={30}
                style={styles.input}
              />
              <Text style={styles.ayuda}>Así los demás sabrán quién ha añadido cada cosa.</Text>
              {error && <Text style={styles.error}>{error}</Text>}
            </View>
            <Boton
              titulo="Continuar"
              onPress={continuar}
              cargando={guardando}
              desactivado={!nombre.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  contenido: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
    gap: 32,
  },
  arriba: { gap: 28 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontFamily: fuentes.extrabold,
    fontSize: 34,
    lineHeight: 38,
    letterSpacing: -0.6,
    color: colores.texto,
  },
  subtitulo: {
    fontFamily: fuentes.regular,
    fontSize: 17,
    lineHeight: 25,
    color: colores.textoSecundario,
  },
  label: { fontFamily: fuentes.bold, fontSize: 14, color: colores.texto },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colores.bordeInput,
    paddingHorizontal: 16,
    fontFamily: fuentes.medium,
    fontSize: 17,
    color: colores.texto,
  },
  ayuda: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  error: { fontFamily: fuentes.semibold, fontSize: 14, color: colores.peligro },
});
