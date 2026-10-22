// Códigos de invitación de 6 caracteres, sin letras que se confunden (0/O, 1/I/L).
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generarCodigo(): string {
  let codigo = '';
  for (let n = 0; n < 6; n++) {
    codigo += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
  }
  return codigo;
}

/** "k7p 4qx" o "K7P-4QX" → "K7P4QX" */
export function normalizarCodigo(texto: string): string {
  return texto.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** "K7P4QX" → "K7P-4QX" (como se enseña en pantalla) */
export function formatearCodigo(codigo: string): string {
  return codigo.length === 6 ? `${codigo.slice(0, 3)}-${codigo.slice(3)}` : codigo;
}
