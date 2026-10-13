const formatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Fecha de la imagen: "12 OCT 2026" (mes abreviado es-MX sin punto). */
export function formatDateForKicker(value: string): string {
  const trimmed = value.trim();
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T12:00:00`)
    : new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed.toUpperCase();
  return formatter.format(parsed).replace(/\./g, '').toUpperCase();
}
