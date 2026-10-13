export const ACCEPTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
] as const;
export const MAX_INPUT_IMAGE_BYTES = 8 * 1024 * 1024;

export function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
}

/** Los SVG escalan sin pérdida: se guardan tal cual, sin pasar por canvas. */
export function isSvg(file: File): boolean {
  return file.type === 'image/svg+xml';
}

/**
 * Redimensiona una imagen en cliente a un lado largo máximo y devuelve un
 * PNG optimizado. Fallback: si el navegador no soporta el pipeline, devuelve
 * el archivo original cuando ya cumple el límite.
 */
export async function resizeImage(file: File, maxSide: number): Promise<Blob> {
  if (isSvg(file)) return file;
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file.size <= MAX_INPUT_IMAGE_BYTES ? file : file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (!blob) return file.size <= MAX_INPUT_IMAGE_BYTES ? file : file;
    return blob;
  } finally {
    bitmap.close();
  }
}
