/**
 * Normalización de nombres de equipos y jugadores.
 *
 * Los nombres traen caracteres Unicode especiales:
 * - `ㅤ` (U+3164, Hangul filler) usado como espaciador invisible.
 * - Superíndices, kanjis, emojis, etc.
 *
 * Reglas (AGENTS.md §4):
 * - Nombres para MOSTRAR: reemplazar invisibles por un espacio normal + trim.
 *   NO aplicar NFKC al texto mostrado (convertiría `⁷` en `7`).
 * - Claves para AGRUPAR: NFKC + quitar invisibles + colapsar espacios + mayúsculas.
 */

/** Caracteres invisibles o "espaciadores" que deben tratarse como espacio. */
const INVISIBLE_CHARS =
  /[\u00AD\u115F\u1160\u180E\u200B-\u200F\u2060-\u2064\u206A-\u206F\u3164\uFEFF]/gu;

/** Espacios internos (espacio normal y tabulaciones). */
const SPACES_RE = /[ \t]+/g;

/** Nombre apto para mostrar: invisibles → espacio, espacios colapsados, sin borde. */
export function cleanDisplayName(name: string): string {
  return name.replace(INVISIBLE_CHARS, ' ').replace(SPACES_RE, ' ').trim();
}

/**
 * Clave de agrupación: solo para comparar equipos entre salas, nunca para mostrar.
 * NFKC + limpiar invisibles + colapsar espacios + mayúsculas.
 */
export function normalizeTeamKey(name: string): string {
  const cleaned = cleanDisplayName(name).normalize('NFKC');
  return cleaned.replace(SPACES_RE, ' ').trim().toUpperCase();
}

/**
 * Distancia de edición (Levenshtein) acotada: devuelve true si la distancia
 * entre `a` y `b` es ≤ `maxDistance`. Termina temprano para no escalar con
 * nombres largos irrelevantes.
 */
export function isSimilar(a: string, b: string, maxDistance = 2): boolean {
  if (a === b) return false; // claves idénticas no son "similares": son el mismo equipo
  if (Math.abs(a.length - b.length) > maxDistance) return false;

  let prev: number[] = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr: number[] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(
        (prev[j - 1] ?? 0) + cost, // sustitución
        (prev[j] ?? 0) + 1, // eliminación
        (curr[j - 1] ?? 0) + 1, // inserción
      );
      curr.push(value);
      if (value < rowMin) rowMin = value;
    }
    // Si la fila entera supera el umbral, la distancia final también lo hará.
    if (rowMin > maxDistance) return false;
    prev = curr;
  }
  return (prev[b.length] ?? Number.POSITIVE_INFINITY) <= maxDistance;
}
