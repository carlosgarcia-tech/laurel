const formatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

/** Formato de fecha de la imagen: "12 OCT 2026" (mes abreviado sin punto). */
export function formatDateForKicker(value: string): string {
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
    ? new Date(`${value}T12:00:00`)
    : new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.trim().toUpperCase();
  return formatter.format(parsed).replace(/\./g, '').toUpperCase();
}
