import type { FontPairDef } from './types';

/**
 * Biblioteca de pares de tipografías (TEMPLATESv2 §6): autoalojadas con
 * @fontsource, solo subsets latin + latin-ext, solo los pesos usados, woff2.
 * Cada par se importa con `import()` al seleccionarse — nunca en el bundle
 * inicial. P1 (Syne + Space Grotesk) ya está en el bundle por styles/fonts.css.
 */
export const FONT_PAIRS: FontPairDef[] = [
  {
    id: 'p1',
    label: 'Syne + Space Grotesk',
    display: 'Syne',
    body: 'Space Grotesk',
    displayWeights: '700/800',
  },
  { id: 'p2', label: 'Teko + Barlow', display: 'Teko', body: 'Barlow', displayWeights: '600/700' },
  {
    id: 'p3',
    label: 'Unbounded + Hanken Grotesk',
    display: 'Unbounded',
    body: 'Hanken Grotesk',
    displayWeights: '600/800',
  },
  {
    id: 'p4',
    label: 'Fraunces + Work Sans',
    display: 'Fraunces',
    body: 'Work Sans',
    displayWeights: '700/800',
  },
  {
    id: 'p5',
    label: 'Barlow Condensed + Barlow',
    display: 'Barlow Condensed',
    body: 'Barlow',
    displayWeights: '600/700',
  },
  {
    id: 'p6',
    label: 'Cormorant Garamond + Jost',
    display: 'Cormorant Garamond',
    body: 'Jost',
    displayWeights: '700',
  },
  { id: 'p7', label: 'Anton + Archivo', display: 'Anton', body: 'Archivo', displayWeights: '400' },
  {
    id: 'p8',
    label: 'Zilla Slab + Karla',
    display: 'Zilla Slab',
    body: 'Karla',
    displayWeights: '600/700',
  },
  {
    id: 'p9',
    label: 'Archivo + IBM Plex Mono',
    display: 'Archivo',
    body: 'IBM Plex Mono',
    displayWeights: '800',
  },
  {
    id: 'p10',
    label: 'Chakra Petch + Share Tech Mono',
    display: 'Chakra Petch',
    body: 'Share Tech Mono',
    displayWeights: '600/700',
  },
  {
    id: 'p11',
    label: 'Big Shoulders Display + Barlow',
    display: 'Big Shoulders Display',
    body: 'Barlow',
    displayWeights: '800/900',
  },
  {
    id: 'p12',
    label: 'Saira Extra Condensed + Saira',
    display: 'Saira Extra Condensed',
    body: 'Saira',
    displayWeights: '700/800',
  },
  {
    id: 'p13',
    label: 'Alfa Slab One + Barlow Semi Condensed',
    display: 'Alfa Slab One',
    body: 'Barlow Semi Condensed',
    displayWeights: '400',
  },
];

export function getFontPair(id: string): FontPairDef {
  return FONT_PAIRS.find((pair) => pair.id === id) ?? FONT_PAIRS[0]!;
}

/** IDs válidos, para validar/normalizar `fontFamily` al cargar settings. */
export const FONT_PAIR_IDS = new Set(FONT_PAIRS.map((pair) => pair.id));

type FontImport = () => Promise<unknown>;

/** Lista plana de imports Static analizables por Vite por cada par. */
const LOADERS: Record<string, FontImport> = {
  p1: async () => {
    // Syne 700/800 + Space Grotesk 400/500/700 ya están en el bundle inicial.
  },
  p2: async () => {
    await Promise.all([
      import('@fontsource/teko/latin-600.css'),
      import('@fontsource/teko/latin-700.css'),
      import('@fontsource/teko/latin-ext-600.css'),
      import('@fontsource/teko/latin-ext-700.css'),
      import('@fontsource/barlow/latin-400.css'),
      import('@fontsource/barlow/latin-500.css'),
      import('@fontsource/barlow/latin-700.css'),
      import('@fontsource/barlow/latin-ext-400.css'),
    ]);
  },
  p3: async () => {
    await Promise.all([
      import('@fontsource/unbounded/latin-600.css'),
      import('@fontsource/unbounded/latin-800.css'),
      import('@fontsource/unbounded/latin-ext-600.css'),
      import('@fontsource/unbounded/latin-ext-800.css'),
      import('@fontsource/hanken-grotesk/latin-400.css'),
      import('@fontsource/hanken-grotesk/latin-500.css'),
      import('@fontsource/hanken-grotesk/latin-700.css'),
      import('@fontsource/hanken-grotesk/latin-ext-400.css'),
    ]);
  },
  p4: async () => {
    await Promise.all([
      import('@fontsource/fraunces/latin-700.css'),
      import('@fontsource/fraunces/latin-800.css'),
      import('@fontsource/fraunces/latin-ext-700.css'),
      import('@fontsource/work-sans/latin-400.css'),
      import('@fontsource/work-sans/latin-500.css'),
      import('@fontsource/work-sans/latin-700.css'),
      import('@fontsource/work-sans/latin-ext-400.css'),
    ]);
  },
  p5: async () => {
    await Promise.all([
      import('@fontsource/barlow-condensed/latin-600.css'),
      import('@fontsource/barlow-condensed/latin-700.css'),
      import('@fontsource/barlow-condensed/latin-ext-600.css'),
      import('@fontsource/barlow/latin-400.css'),
      import('@fontsource/barlow/latin-500.css'),
      import('@fontsource/barlow/latin-700.css'),
      import('@fontsource/barlow/latin-ext-400.css'),
    ]);
  },
  p6: async () => {
    await Promise.all([
      import('@fontsource/cormorant-garamond/latin-700.css'),
      import('@fontsource/cormorant-garamond/latin-ext-700.css'),
      import('@fontsource/jost/latin-400.css'),
      import('@fontsource/jost/latin-500.css'),
      import('@fontsource/jost/latin-700.css'),
      import('@fontsource/jost/latin-ext-400.css'),
    ]);
  },
  p7: async () => {
    await Promise.all([
      import('@fontsource/anton/latin-400.css'),
      import('@fontsource/anton/latin-ext-400.css'),
      import('@fontsource/archivo/latin-400.css'),
      import('@fontsource/archivo/latin-600.css'),
      import('@fontsource/archivo/latin-700.css'),
      import('@fontsource/archivo/latin-ext-400.css'),
    ]);
  },
  p8: async () => {
    await Promise.all([
      import('@fontsource/zilla-slab/latin-600.css'),
      import('@fontsource/zilla-slab/latin-700.css'),
      import('@fontsource/zilla-slab/latin-ext-600.css'),
      import('@fontsource/karla/latin-400.css'),
      import('@fontsource/karla/latin-500.css'),
      import('@fontsource/karla/latin-700.css'),
      import('@fontsource/karla/latin-ext-400.css'),
    ]);
  },
  p9: async () => {
    await Promise.all([
      import('@fontsource/archivo/latin-800.css'),
      import('@fontsource/archivo/latin-ext-800.css'),
      import('@fontsource/ibm-plex-mono/latin-400.css'),
      import('@fontsource/ibm-plex-mono/latin-500.css'),
      import('@fontsource/ibm-plex-mono/latin-ext-400.css'),
    ]);
  },
  p10: async () => {
    await Promise.all([
      import('@fontsource/chakra-petch/latin-600.css'),
      import('@fontsource/chakra-petch/latin-700.css'),
      import('@fontsource/chakra-petch/latin-ext-600.css'),
      import('@fontsource/chakra-petch/latin-ext-700.css'),
      // Share Tech Mono solo publica subset latin (cobertura limitada del paquete).
      import('@fontsource/share-tech-mono/latin-400.css'),
    ]);
  },
  p11: async () => {
    await Promise.all([
      // big-shoulders-display no publica la clave "./*.css" en exports:
      // el subpath va sin extensión ("./*" → "./*.css").
      import('@fontsource/big-shoulders-display/latin-800'),
      import('@fontsource/big-shoulders-display/latin-900'),
      import('@fontsource/big-shoulders-display/latin-ext-800'),
      import('@fontsource/big-shoulders-display/latin-ext-900'),
      import('@fontsource/barlow/latin-400.css'),
      import('@fontsource/barlow/latin-500.css'),
      import('@fontsource/barlow/latin-700.css'),
      import('@fontsource/barlow/latin-ext-400.css'),
    ]);
  },
  p12: async () => {
    await Promise.all([
      import('@fontsource/saira-extra-condensed/latin-700.css'),
      import('@fontsource/saira-extra-condensed/latin-800.css'),
      import('@fontsource/saira-extra-condensed/latin-ext-700.css'),
      import('@fontsource/saira-extra-condensed/latin-ext-800.css'),
      import('@fontsource/saira/latin-400.css'),
      import('@fontsource/saira/latin-500.css'),
      import('@fontsource/saira/latin-700.css'),
      import('@fontsource/saira/latin-ext-400.css'),
    ]);
  },
  p13: async () => {
    await Promise.all([
      import('@fontsource/alfa-slab-one/latin-400.css'),
      import('@fontsource/alfa-slab-one/latin-ext-400.css'),
      import('@fontsource/barlow-semi-condensed/latin-400.css'),
      import('@fontsource/barlow-semi-condensed/latin-500.css'),
      import('@fontsource/barlow-semi-condensed/latin-700.css'),
      import('@fontsource/barlow-semi-condensed/latin-ext-400.css'),
    ]);
  },
};

const loaded = new Set<string>();

/** Carga perezosa (idempotente) de las fuentes de un par. */
export function loadFontPair(id: string): void {
  if (loaded.has(id)) return;
  loaded.add(id);
  void LOADERS[id]?.();
}

/** Pila de fallback con cobertura Unicode para nombres de jugadores. */
export function bodyFontStack(body: string): string {
  return `'${body}', 'Noto Sans', 'Segoe UI Symbol', system-ui, sans-serif`;
}

export function displayFontStack(display: string): string {
  return `'${display}', ${bodyFontStack(display)}`;
}
