/** Caché en memoria de las data URLs de los assets por defecto. */
const cache = new Map<string, string>();

import logoBuiltinUrl from '../assets/default-logo.png';
import backgroundBuiltinPngUrl from '../assets/default-background.png';
import backgroundBuiltinSvgUrl from '../assets/default-background.svg';

const BUILTIN_URLS: Record<'logo' | 'background', string[]> = {
  logo: [logoBuiltinUrl],
  background: [backgroundBuiltinPngUrl, backgroundBuiltinSvgUrl],
};

async function fetchAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.addEventListener('error', () => reject(new Error('No se pudo leer el archivo.')));
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

/**
 * Resuelve el asset por defecto pedido:
 * 1. Archivos del dueño en `public/brand/` (logo.png → logo.svg / background.png → background.svg).
 * 2. Fallback integrado (build).
 * Devuelve una data URL lista para preview Y exportación PNG.
 */
export async function resolveDefaultAsset(
  kind: 'logo' | 'background',
): Promise<string | undefined> {
  const cached = cache.get(kind);
  if (cached) return cached;

  const base = import.meta.env.BASE_URL;
  const userNameCandidates =
    kind === 'logo'
      ? [`${base}brand/logo.png`, `${base}brand/logo.svg`]
      : [`${base}brand/background.png`, `${base}brand/background.svg`];

  for (const url of [...userNameCandidates, ...BUILTIN_URLS[kind]]) {
    const dataUrl = await fetchAsDataUrl(url);
    if (dataUrl) {
      cache.set(kind, dataUrl);
      return dataUrl;
    }
  }
  return undefined;
}
