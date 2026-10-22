// Colores de avatar: todos con contraste suficiente con texto blanco.
export const COLORES_AVATAR = ['#1F6B4A', '#B45309', '#1D4ED8', '#7C3AED', '#BE185D', '#0F766E'];

export function colorAleatorio(): string {
  return COLORES_AVATAR[Math.floor(Math.random() * COLORES_AVATAR.length)];
}

/** "Marcos" → "M", "María José" → "MJ" */
export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
  return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
}

/** "leche entera" → "Leche entera" */
export function capitalizar(texto: string): string {
  const limpio = texto.trim();
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}
