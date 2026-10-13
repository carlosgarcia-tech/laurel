/** Tamaño máximo aceptado para un archivo de resultados (5 MB). */
export const MAX_LOG_BYTES = 5 * 1024 * 1024;

/** Extensiones aceptadas para los archivos de resultados. */
export const ACCEPTED_EXTENSIONS = ['.txt', '.log'] as const;

export interface FileCheck {
  ok: boolean;
  /** Mensaje en español para la UI cuando ok === false. */
  error?: string;
}

function hasAcceptedExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  // Tolera "log.txt" además de ".txt" / ".log".
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext)) || lower.endsWith('.log.txt');
}

/** Valida tipo de archivo y tamaño (< 5 MB) antes de leerlo. Nunca lanza. */
export function checkResultFile(fileName: string, sizeBytes: number): FileCheck {
  if (!hasAcceptedExtension(fileName)) {
    return {
      ok: false,
      error: `Formato no soportado. Usa archivos .txt o .log (se recibió "${fileName}").`,
    };
  }
  if (sizeBytes > MAX_LOG_BYTES) {
    return { ok: false, error: `El archivo supera el límite de 5 MB (${formatBytes(sizeBytes)}).` };
  }
  return { ok: true };
}

/** Formatea bytes de forma legible para mensajes de la UI. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
