import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from './Avatar';
import type { Producto } from '@/hooks/useLista';
import { borrarProducto } from '@/lib/acciones';
import { colores, fuentes } from '@/theme';

type Props = {
  producto: Producto;
  onAlternar: () => void;
};

function preguntarBorrar(producto: Producto) {
  Alert.alert(`¿Borrar «${producto.nombre}»?`, 'Desaparecerá de la lista de todos.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: () => borrarProducto(producto.id) },
  ]);
}

/** Un producto pendiente: círculo para tachar, nombre, quién lo añadió. */
export function FilaPendiente({ producto, onAlternar }: Props) {
  const autor = producto.anadidoPor;
  const meta = [producto.cantidad, autor ? `añadido por ${autor.nombre}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <Pressable
      onPress={onAlternar}
      onLongPress={() => preguntarBorrar(producto)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: false }}
      accessibilityLabel={`${producto.nombre}${meta ? `, ${meta}` : ''}`}
      accessibilityHint="Toca para marcarlo como comprado. Mantén pulsado para borrarlo."
      style={({ pressed }) => [styles.fila, pressed && styles.pulsada]}
    >
      <View style={styles.check}>
        <View style={styles.circuloVacio} />
      </View>
      <View style={styles.textos}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      </View>
      {autor && <Avatar nombre={autor.nombre} color={autor.color} tamano={26} />}
    </Pressable>
  );
}

/** Un producto ya comprado: tachado, con quién lo compró. Tocar lo devuelve a la lista. */
export function FilaComprado({ producto, onAlternar }: Props) {
  const comprador = producto.compradoPor;

  return (
    <Pressable
      onPress={onAlternar}
      onLongPress={() => preguntarBorrar(producto)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: true }}
      accessibilityLabel={`${producto.nombre}, comprado${comprador ? ` por ${comprador.nombre}` : ''}`}
      accessibilityHint="Toca para volver a añadirlo a la lista."
      style={({ pressed }) => [styles.fila, styles.filaComprada, pressed && styles.pulsada]}
    >
      <View style={styles.check}>
        <View style={styles.circuloLleno}>
          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
        </View>
      </View>
      <Text style={[styles.nombre, styles.nombreComprado]} numberOfLines={1}>
        {producto.nombre}
      </Text>
      {comprador && <Text style={styles.compradoPor}>por {comprador.nombre}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    backgroundColor: colores.superficie,
    borderRadius: 16,
    minHeight: 60,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filaComprada: {
    backgroundColor: colores.superficieApagada,
    borderWidth: 1,
    borderColor: colores.borde,
    minHeight: 56,
  },
  pulsada: { opacity: 0.7 },
  check: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  circuloVacio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colores.check,
  },
  circuloLleno: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colores.primario,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: { flex: 1, gap: 2 },
  nombre: { fontFamily: fuentes.semibold, fontSize: 16, color: colores.texto },
  nombreComprado: {
    flex: 1,
    fontFamily: fuentes.medium,
    fontSize: 15,
    color: colores.textoApagado,
    textDecorationLine: 'line-through',
  },
  meta: { fontFamily: fuentes.regular, fontSize: 13, color: colores.textoSecundario },
  compradoPor: { fontFamily: fuentes.regular, fontSize: 12, color: colores.textoApagado },
});
