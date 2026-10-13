/**
 * Pseudoaleatoriedad con semilla (TEMPLATES.md §4.4).
 * PROHIBIDO Math.random() en render: la imagen debe exportarse idéntica cada vez.
 */

/** Hash FNV-1a de 32 bits sobre los puntos de código del texto. */
export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (const char of input) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** PRNG mulberry32: rápido, determinista y con buen período corto para render. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** PRNG con semilla derivada de un texto arbitrario (título + fecha + jornada). */
export function prngFor(input: string): () => number {
  return mulberry32(hashSeed(input));
}
