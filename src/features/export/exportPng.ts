/**
 * Exportación PNG (AGENTS.md §9): html-to-image se importa dinámicamente solo
 * al exportar; se espera a document.fonts.ready y a que las imágenes decodifiquen.
 */

export async function exportPng(node: HTMLElement): Promise<string> {
  const { toPng } = await import('html-to-image');

  await document.fonts.ready;
  const images = node.querySelectorAll('img');
  await Promise.all(
    [...images].map(async (img) => {
      if (img.decode) {
        try {
          await img.decode();
        } catch {
          // decode() puede fallar en imágenes evanescentes; se continúa.
        }
      }
    }),
  );

  // Calentamiento: en Safari la primera exportación puede salir sin fuentes/imágenes.
  await toPng(node, { pixelRatio: 1, cacheBust: false });
  return toPng(node, {
    pixelRatio: 2,
    cacheBust: false,
  });
}

export function slugifyFileName(title: string, matchday: string): string {
  const slug = (value: string): string =>
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const parts = [slug(title), slug(matchday)].filter(Boolean);
  return parts.length > 0 ? parts.join('-') : 'torneo';
}

/** Descarga un data URL como PNG con nombre resultados-<titulo>-<jornada>.png. */
export function downloadPng(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
