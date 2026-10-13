/** Ordinal es-MX: ordinalEs(1) → "1.º" */
export function ordinalEs(n: number): string {
  return `${n}.º`;
}

/** Ceros a la izquierda: pad(4, 2) → "04"; pad(32, 6) → "000032" */
export function pad(n: number, width: number): string {
  const value = Math.max(0, Math.trunc(n));
  return String(value).padStart(width, '0');
}

/** Ordinal estilo arcade: ordinalEn(1) → "1ST", ordinalEn(11) → "11TH" */
export function ordinalEn(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  const suffix =
    mod100 >= 11 && mod100 <= 13
      ? 'TH'
      : mod10 === 1
        ? 'ST'
        : mod10 === 2
          ? 'ND'
          : mod10 === 3
            ? 'RD'
            : 'TH';
  return `${n}${suffix}`;
}

/** Diferencia respecto al líder: gap(3) → "+3"; para el líder devuelve "—". */
export function gap(pointsToLeader: number): string {
  return pointsToLeader <= 0 ? '—' : `+${pointsToLeader}`;
}

/** Trunca sin partir caracteres compuestos (Segmenter de grafemas si existe). */
export function truncateName(name: string, maxChars: number): string {
  if (name.length <= maxChars) return name;
  interface GraphemeSegmenter {
    segment(input: string): Iterable<{ segment: string }>;
  }
  const intlRecord = Intl as unknown as Record<string, unknown>;
  const segmenter: GraphemeSegmenter | undefined =
    typeof intlRecord.Segmenter === 'function'
      ? new (
          intlRecord.Segmenter as new (
            locale: string,
            options: { granularity: string },
          ) => GraphemeSegmenter
        )('es', { granularity: 'grapheme' })
      : undefined;
  if (!segmenter) return `${name.slice(0, Math.max(0, maxChars - 1))}…`;
  const segments = [...segmenter.segment(name)].map((s) => s.segment);
  if (segments.length <= maxChars) return name;
  return `${segments.slice(0, maxChars - 1).join('')}…`;
}
