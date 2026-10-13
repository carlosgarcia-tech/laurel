import type { TeamStanding } from '../types';
import { pad } from './format';

const PREFIXES = new Set(['TEAM', 'ESP', 'CLUB', 'TMD', 'LOS']);
const CONSONANTS = 'BCDFGHJKLMNPRSTVYZ';

function normalizeLetters(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Palabras limpias del nombre, ignorando prefijos de clan y símbolos. */
function words(name: string): string[] {
  return name
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .map((word) => normalizeLetters(word))
    .filter((word) => word.length > 0 && !PREFIXES.has(word));
}

/** Código base (sin resolver colisiones) para un nombre. */
export function baseCode(name: string): string {
  const parts = words(name);
  if (parts.length === 0) return 'AAA';
  // Iniciales de las primeras palabras (hasta 3)…
  const letters: string[] = parts.slice(0, 3).map((part) => part[0] ?? 'X');
  // …y si faltan, se completa con letras de la primera palabra.
  const firstWord = parts[0] ?? '';
  let cursor = 1;
  while (letters.length < 3) {
    const next = firstWord[cursor];
    if (next === undefined) break;
    letters.push(next);
    cursor += 1;
  }
  while (letters.length < 3) letters.push('X');
  return letters.join('').slice(0, 3);
}

/**
 * Asigna códigos únicos y deterministas en el orden dado de la clasificación.
 * Colisión → sustituye la 3.ª letra por la siguiente consonante disponible y,
 * si se agota, por un dígito (001…).
 */
export function assignCodes(
  standings: readonly TeamStanding[],
  namesByIndex?: readonly string[],
): string[] {
  const used: string[] = [];
  return standings.map((team, index) => {
    const name = namesByIndex?.[index] ?? team.name;
    const candidate = baseCode(name);
    if (!used.includes(candidate)) {
      used.push(candidate);
      return candidate;
    }
    // Resolver colisión: probar consonantes en la 3.ª posición.
    const firstTwo = candidate.slice(0, 2);
    for (const letter of CONSONANTS) {
      const candidateLetter = (firstTwo + letter).toUpperCase();
      if (!used.includes(candidateLetter)) {
        used.push(candidateLetter);
        return candidateLetter;
      }
    }
    // Último recurso: sufijo numérico determinista.
    const prefix = firstTwo.padEnd(2, 'X');
    let n = 0;
    while (true) {
      const numbered = `${prefix}${pad(n, 1)}`;
      if (!used.includes(numbered)) {
        used.push(numbered);
        return numbered;
      }
      n += 1;
    }
  });
}
