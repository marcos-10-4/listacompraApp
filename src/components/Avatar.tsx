import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { iniciales } from '@/lib/miembros';
import { colores, fuentes } from '@/theme';

type Props = {
  nombre: string;
  color: string;
  tamano?: number;
  conBorde?: boolean;
  style?: ViewStyle;
};

export function Avatar({ nombre, color, tamano = 28, conBorde = false, style }: Props) {
  return (
    <View
      accessibilityLabel={nombre}
      style={[
        styles.circulo,
        {
          width: tamano,
          height: tamano,
          borderRadius: tamano / 2,
          backgroundColor: color,
          borderWidth: conBorde ? 2 : 0,
        },
        style,
      ]}
    >
      <Text style={[styles.texto, { fontSize: Math.round(tamano * 0.42) }]}>{iniciales(nombre)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colores.superficie,
  },
  texto: {
    color: '#FFFFFF',
    fontFamily: fuentes.bold,
  },
});
