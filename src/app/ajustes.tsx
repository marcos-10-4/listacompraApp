import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { Boton } from '@/components/Boton';
import { useLista } from '@/hooks/useLista';
import { useSesion } from '@/hooks/useSesion';
import { cambiarNombre, salirDeCasa } from '@/lib/acciones';
import { formatearCodigo } from '@/lib/codigo';
import { colores, fuentes } from '@/theme';

export default function Ajustes() {
  const { miembro, hogar } = useSesion();
  const { miembros } = useLista(hogar?.id);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombre, setNombre] = useState(miembro?.nombre ?? '');

  if (!miembro || !hogar) return null;

  const codigo = formatearCodigo(hogar.codigo);
  const creadorId = miembros[0]?.id; // el primero en entrar es quien creó la casa

  const compartir = () =>
    Share.share({
      message: `Únete a nuestra lista de la compra con el código ${codigo}`,
    });

  const guardarNombre = async () => {
    if (nombre.trim()) await cambiarNombre(miembro.id, nombre);
    setEditandoNombre(false);
  };

  const salir = () =>
    Alert.alert('¿Salir de esta casa?', 'Dejarás de ver la lista. Podrás volver con el código.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: () => salirDeCasa(miembro.id, hogar.id) },
    ]);

  return (
    <SafeAreaView style={styles.pantalla}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.cabecera}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver a la lista"
            style={styles.botonRedondo}
          >
            <Ionicons name="chevron-back" size={22} color={colores.texto} />
          </Pressable>
          <Text style={styles.titulo} accessibilityRole="header">
            Ajustes de casa
          </Text>
        </View>

        <View style={styles.tarjetaCodigo}>
          <Text style={styles.codigoLabel}>Código para invitar</Text>
          <Text style={styles.codigo} selectable>
            {codigo}
          </Text>
          <Text style={styles.codigoAyuda}>
            Quien lo introduzca al abrir la app entrará en vuestra lista.
          </Text>
          <Pressable onPress={compartir} accessibilityRole="button" style={styles.botonCompartir}>
            <Text style={styles.botonCompartirTexto}>Compartir código</Text>
          </Pressable>
        </View>

        <View style={styles.tarjeta}>
          <Text style={styles.seccion}>Miembros · {miembros.length}</Text>
          {miembros.map((m, i) => (
            <View key={m.id} style={[styles.filaMiembro, i < miembros.length - 1 && styles.conSeparador]}>
              <Avatar nombre={m.nombre} color={m.color} tamano={36} />
              <Text style={styles.nombreMiembro}>
                {m.nombre}
                {m.id === miembro.id ? ' (tú)' : ''}
              </Text>
              {m.id === creadorId && <Text style={styles.rol}>Creó la lista</Text>}
            </View>
          ))}
        </View>

        <View style={styles.tarjeta}>
          {editandoNombre ? (
            <View style={styles.editarNombre}>
              <TextInput
                accessibilityLabel="Tu nombre"
                value={nombre}
                onChangeText={setNombre}
                autoFocus
                autoCapitalize="words"
                maxLength={30}
                onSubmitEditing={guardarNombre}
                style={styles.input}
              />
              <Boton titulo="Guardar" onPress={guardarNombre} />
            </View>
          ) : (
            <Pressable
              onPress={() => setEditandoNombre(true)}
              accessibilityRole="button"
              style={[styles.opcion, styles.conSeparador]}
            >
              <Text style={styles.opcionTexto}>Cambiar mi nombre</Text>
            </Pressable>
          )}
          <Pressable onPress={salir} accessibilityRole="button" style={styles.opcion}>
            <Text style={[styles.opcionTexto, { color: colores.peligro }]}>Salir de esta casa</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, paddingTop: 12, gap: 22 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botonRedondo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: { fontFamily: fuentes.extrabold, fontSize: 24, color: colores.texto },
  tarjetaCodigo: { backgroundColor: colores.primario, borderRadius: 20, padding: 20, gap: 12 },
  codigoLabel: { fontFamily: fuentes.semibold, fontSize: 14, color: colores.primarioTextoSuave },
  codigo: { fontFamily: fuentes.extrabold, fontSize: 36, letterSpacing: 6, color: '#FFFFFF' },
  codigoAyuda: {
    fontFamily: fuentes.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colores.primarioTextoSuave,
  },
  botonCompartir: {
    height: 48,
    borderRadius: 24,
    backgroundColor: colores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonCompartirTexto: { fontFamily: fuentes.bold, fontSize: 15, color: colores.primario },
  tarjeta: { backgroundColor: colores.superficie, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  seccion: {
    fontFamily: fuentes.bold,
    fontSize: 13,
    color: colores.textoSecundario,
    paddingTop: 12,
    paddingBottom: 6,
  },
  filaMiembro: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  conSeparador: { borderBottomWidth: 1, borderBottomColor: colores.separador },
  nombreMiembro: { flex: 1, fontFamily: fuentes.semibold, fontSize: 16, color: colores.texto },
  rol: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  opcion: { minHeight: 56, justifyContent: 'center' },
  opcionTexto: { fontFamily: fuentes.semibold, fontSize: 16, color: colores.texto },
  editarNombre: { gap: 10, paddingVertical: 10 },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colores.bordeInput,
    paddingHorizontal: 14,
    fontFamily: fuentes.medium,
    fontSize: 16,
    color: colores.texto,
  },
});
