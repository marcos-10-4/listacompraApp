import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { FilaComprado, FilaPendiente } from '@/components/FilaProducto';
import { useLista } from '@/hooks/useLista';
import { useSesion } from '@/hooks/useSesion';
import {
  anadirProducto,
  desmarcarComprado,
  marcarComprado,
  vaciarComprados,
} from '@/lib/acciones';
import { colores, fuentes } from '@/theme';

export default function Lista() {
  const { miembro, hogar } = useSesion();
  const { cargando, sincronizado, pendientes, comprados, miembros } = useLista(hogar);
  const [texto, setTexto] = useState('');
  const miembrosPorId = useMemo(
    () => Object.fromEntries(miembros.map((m) => [m.id, m])),
    [miembros]
  );

  if (!miembro || !hogar) return null;

  const anadir = () => {
    if (!texto.trim()) return;
    anadirProducto(hogar.id, miembro, texto);
    setTexto('');
  };

  return (
    <SafeAreaView style={styles.pantalla} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Cabecera */}
        <View style={styles.cabecera}>
          <View style={styles.filaTitulo}>
            <View style={{ gap: 2, flex: 1 }}>
              <Text style={styles.casa}>{hogar.nombre}</Text>
              <Text style={styles.titulo} accessibilityRole="header">
                Lista de la compra
              </Text>
            </View>
            <Link href="/ajustes" asChild>
              <Pressable style={styles.botonRedondo} accessibilityLabel="Ajustes de casa" accessibilityRole="button">
                <Ionicons name="settings-outline" size={22} color={colores.texto} />
              </Pressable>
            </Link>
          </View>
          <View style={styles.filaMiembros}>
            <View style={{ flexDirection: 'row' }}>
              {miembros.slice(0, 5).map((m, i) => (
                <Avatar
                  key={m.id}
                  nombre={m.nombre}
                  color={m.color}
                  conBorde
                  style={i > 0 ? { marginLeft: -8 } : undefined}
                />
              ))}
            </View>
            <View style={styles.estado}>
              <View
                style={[
                  styles.punto,
                  { backgroundColor: sincronizado ? colores.online : colores.offline },
                ]}
              />
              <Text style={styles.estadoTexto}>
                {miembros.length} en casa · {sincronizado ? 'sincronizado' : 'sin conexión, se guardará'}
              </Text>
            </View>
          </View>
        </View>

        {/* Lista */}
        <ScrollView contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
          <Text style={styles.seccion}>Por comprar · {pendientes.length}</Text>

          {cargando ? (
            <ActivityIndicator color={colores.primario} style={{ marginTop: 24 }} />
          ) : pendientes.length === 0 ? (
            <View style={styles.vacio}>
              <Text style={styles.vacioTitulo}>No falta nada</Text>
              <Text style={styles.vacioTexto}>Cuando alguien se acuerde de algo, aparecerá aquí.</Text>
            </View>
          ) : (
            pendientes.map((p) => (
              <FilaPendiente
                key={p.id}
                producto={p}
                hogarId={hogar.id}
                miembros={miembrosPorId}
                onAlternar={() => marcarComprado(hogar.id, p.id, miembro)}
              />
            ))
          )}

          {comprados.length > 0 && (
            <>
              <View style={styles.filaComprados}>
                <Text style={styles.seccion}>Comprados · {comprados.length}</Text>
                <Pressable
                  onPress={() => vaciarComprados(hogar.id, comprados.map((p) => p.id))}
                  accessibilityRole="button"
                  style={styles.botonTexto}
                >
                  <Text style={styles.botonTextoLabel}>Vaciar comprados</Text>
                </Pressable>
              </View>
              {comprados.map((p) => (
                <FilaComprado
                  key={p.id}
                  producto={p}
                  hogarId={hogar.id}
                  miembros={miembrosPorId}
                  onAlternar={() => desmarcarComprado(hogar.id, p.id)}
                />
              ))}
            </>
          )}
        </ScrollView>

        {/* Añadir */}
        <SafeAreaView edges={['bottom']} style={styles.barraAnadir}>
          <TextInput
            accessibilityLabel="Añadir producto"
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={anadir}
            placeholder="¿Qué falta? Ej: leche"
            placeholderTextColor={colores.placeholder}
            returnKeyType="done"
            submitBehavior="submit"
            maxLength={60}
            style={styles.input}
          />
          <Pressable
            onPress={anadir}
            accessibilityRole="button"
            accessibilityLabel="Añadir a la lista"
            style={({ pressed }) => [styles.botonAnadir, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.superficie },
  cabecera: {
    backgroundColor: colores.superficie,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colores.borde,
  },
  filaTitulo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  casa: {
    fontFamily: fuentes.bold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colores.primario,
  },
  titulo: { fontFamily: fuentes.extrabold, fontSize: 28, letterSpacing: -0.5, color: colores.texto },
  botonRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.fondo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filaMiembros: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  estado: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  punto: { width: 8, height: 8, borderRadius: 4 },
  estadoTexto: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  lista: {
    flexGrow: 1,
    backgroundColor: colores.fondo,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 10,
  },
  seccion: {
    fontFamily: fuentes.bold,
    fontSize: 13,
    color: colores.textoSecundario,
    paddingHorizontal: 4,
  },
  vacio: {
    backgroundColor: colores.superficie,
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  vacioTitulo: { fontFamily: fuentes.bold, fontSize: 17, color: colores.texto },
  vacioTexto: {
    fontFamily: fuentes.regular,
    fontSize: 14,
    color: colores.textoSecundario,
    textAlign: 'center',
  },
  filaComprados: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  botonTexto: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 },
  botonTextoLabel: { fontFamily: fuentes.bold, fontSize: 14, color: colores.primario },
  barraAnadir: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: colores.superficie,
    borderTopWidth: 1,
    borderTopColor: colores.borde,
  },
  input: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colores.bordeInput,
    backgroundColor: colores.fondo,
    paddingHorizontal: 18,
    fontFamily: fuentes.medium,
    fontSize: 16,
    color: colores.texto,
  },
  botonAnadir: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
