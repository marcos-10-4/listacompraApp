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
import { crearHogar, unirseConCodigo } from '@/lib/acciones';
import { colores, fuentes } from '@/theme';

export default function Unirse() {
  const { miembro } = useSesion();
  const [codigo, setCodigo] = useState('');
  const [creando, setCreando] = useState(false);
  const [uniendo, setUniendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!miembro) return null;

  const crear = async () => {
    setCreando(true);
    setError(null);
    try {
      await crearHogar(miembro);
    } catch {
      setError('No se ha podido crear la lista. Inténtalo de nuevo.');
      setCreando(false);
    }
  };

  const unirse = async () => {
    setUniendo(true);
    setError(null);
    try {
      await unirseConCodigo(miembro, codigo);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido unir. ¿Tienes conexión?');
      setUniendo(false);
    }
  };

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 8 }}>
            <Text style={styles.titulo} accessibilityRole="header">
              Hola, {miembro.nombre}
            </Text>
            <Text style={styles.subtitulo}>
              Crea la lista de casa o únete a la que ya ha creado alguien de tu familia.
            </Text>
          </View>

          <View style={styles.tarjeta}>
            <View style={styles.filaIcono}>
              <View style={styles.icono}>
                <Ionicons name="home-outline" size={22} color={colores.primario} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.tarjetaTitulo}>Crear la lista de casa</Text>
                <Text style={styles.tarjetaTexto}>Te daremos un código para invitar al resto.</Text>
              </View>
            </View>
            <Boton titulo="Crear lista" onPress={crear} cargando={creando} desactivado={uniendo} />
          </View>

          <View style={styles.separador}>
            <View style={styles.linea} />
            <Text style={styles.separadorTexto}>o</Text>
            <View style={styles.linea} />
          </View>

          <View style={styles.tarjeta}>
            <View style={{ gap: 2 }}>
              <Text style={styles.tarjetaTitulo}>Unirme con un código</Text>
              <Text style={styles.tarjetaTexto}>Pídeselo a quien creó la lista.</Text>
            </View>
            <TextInput
              accessibilityLabel="Código de invitación"
              value={codigo}
              onChangeText={(t) => setCodigo(t.toUpperCase())}
              placeholder="K7P-4QX"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              returnKeyType="go"
              onSubmitEditing={unirse}
              style={styles.inputCodigo}
            />
            <Boton
              titulo="Unirme"
              variante="secundario"
              onPress={unirse}
              cargando={uniendo}
              desactivado={creando || codigo.replace(/[^A-Za-z0-9]/g, '').length < 6}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, paddingTop: 32, gap: 24 },
  titulo: { fontFamily: fuentes.extrabold, fontSize: 28, letterSpacing: -0.5, color: colores.texto },
  subtitulo: { fontFamily: fuentes.regular, fontSize: 16, lineHeight: 24, color: colores.textoSecundario },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: 20, padding: 20, gap: 14 },
  filaIcono: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colores.primarioSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaTitulo: { fontFamily: fuentes.bold, fontSize: 17, color: colores.texto },
  tarjetaTexto: { fontFamily: fuentes.regular, fontSize: 14, color: colores.textoSecundario },
  separador: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  linea: { flex: 1, height: 1, backgroundColor: colores.bordeInput },
  separadorTexto: { fontFamily: fuentes.semibold, fontSize: 14, color: colores.textoSecundario },
  inputCodigo: {
    height: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colores.bordeInput,
    backgroundColor: colores.fondo,
    textAlign: 'center',
    fontFamily: fuentes.extrabold,
    fontSize: 24,
    letterSpacing: 4,
    color: colores.texto,
  },
  error: { fontFamily: fuentes.semibold, fontSize: 14, color: colores.peligro, textAlign: 'center' },
});
