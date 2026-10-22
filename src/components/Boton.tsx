import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { colores, fuentes } from '@/theme';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  cargando?: boolean;
  desactivado?: boolean;
  style?: ViewStyle;
};

/** Botón tipo píldora del diseño: relleno verde (primario) o con borde (secundario). */
export function Boton({ titulo, onPress, variante = 'primario', cargando, desactivado, style }: Props) {
  const primario = variante === 'primario';
  const inactivo = desactivado || cargando;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactivo, busy: !!cargando }}
      onPress={onPress}
      disabled={inactivo}
      style={({ pressed }) => [
        styles.base,
        primario ? styles.primario : styles.secundario,
        inactivo && styles.inactivo,
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={primario ? '#FFFFFF' : colores.primario} />
      ) : (
        <Text style={[styles.texto, { color: primario ? '#FFFFFF' : colores.primario }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primario: { backgroundColor: colores.primario },
  secundario: {
    backgroundColor: colores.superficie,
    borderWidth: 1.5,
    borderColor: colores.primario,
  },
  inactivo: { opacity: 0.5 },
  texto: { fontFamily: fuentes.bold, fontSize: 16 },
});
