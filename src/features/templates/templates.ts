import type { ImageFormat } from '../../core/types';
import type { Density, Geometry, TemplateConfig } from './types';

/**
 * Catálogo de plantillas (TEMPLATESv2 §5): UNA estructura (Corona), 10 variantes.
 * Agregar una plantilla = agregar un objeto aquí (§2). La tabla 5.1 va copiada
 * tal cual; los tokens de la 5.2 idem — ver checklist §10.
 */
export const TEMPLATES: TemplateConfig[] = [
  {
    // 1 · Referencia: esmeralda y dorado, esquinas muy redondeadas, anillos.
    id: 'corona',
    name: 'Corona',
    blurb: 'La original: esmeralda y dorado, podio escalonado y barras hasta el líder.',
    theme: 'dark',
    tokens: {
      bg: '#07100e',
      surface: '#0e1a17',
      border: '#1f3a33',
      text: '#f4efe6',
      muted: '#8fa8a0',
      accent: '#34d399',
      accent2: '#e8c27a',
    },
    fontPairId: 'p1',
    header: 'left',
    podium: 'stepped',
    list: 'bars',
    mvp: 'cards',
    mvpPlacement: 'after-list',
    decor: 'rings',
    radius: 20,
    numerals: 'pad',
  },
  {
    // 2 · Rojo-naranja sobre casi negro, banner y MVP antes de la lista.
    id: 'brasa',
    name: 'Brasa',
    blurb: 'Enérgica: naranja sobre negro, banner de título y MVP arriba de la lista.',
    theme: 'dark',
    tokens: {
      bg: '#0c0908',
      surface: '#171110',
      border: '#3a2420',
      text: '#f3e9df',
      muted: '#a8928a',
      accent: '#ff5a36',
      accent2: '#ffb347',
    },
    fontPairId: 'p2',
    header: 'banner',
    podium: 'stepped',
    list: 'bars',
    mvp: 'cards',
    mvpPlacement: 'before-list',
    decor: 'slashes',
    radius: 4,
    numerals: 'pad',
  },
  {
    // 3 · Azul profundo, todo centrado, sobrio y limpio.
    id: 'medianoche',
    name: 'Medianoche',
    blurb: 'Sobria: azul profundo, todo centrado y MVP en una franja.',
    theme: 'dark',
    tokens: {
      bg: '#060a14',
      surface: '#0d1424',
      border: '#1c2a48',
      text: '#e9eef8',
      muted: '#8d9bb8',
      accent: '#4aa8ff',
      accent2: '#e6d3a3',
    },
    fontPairId: 'p3',
    header: 'center',
    podium: 'row',
    list: 'bars',
    mvp: 'strip',
    mvpPlacement: 'after-list',
    decor: 'arcs',
    radius: 14,
    numerals: 'plain',
  },
  {
    // 4 · Clara y editorial: marfil, verde bosque, dorado viejo, ordinales.
    id: 'marfil',
    name: 'Marfil',
    blurb: 'Editorial y de premiación: marfil claro, puntos guía y ordinales (1.º).',
    theme: 'light',
    tokens: {
      bg: '#f3eee2',
      surface: '#fbf8f0',
      border: '#d6cdb8',
      text: '#16231d',
      muted: '#5c6b63',
      accent: '#0f7a55',
      accent2: '#b07d1e',
    },
    fontPairId: 'p4',
    header: 'left',
    podium: 'hero',
    list: 'dots',
    mvp: 'strip',
    mvpPlacement: 'after-list',
    decor: 'brackets',
    radius: 4,
    numerals: 'ordinal',
  },
  {
    // 5 · Grafito y naranja, cifras grandes a la derecha, fichas, ángulos rectos.
    id: 'pista',
    name: 'Pista',
    blurb: 'Deportiva: grafito y naranja, cifras grandes y fichas de posición.',
    theme: 'dark',
    tokens: {
      bg: '#121212',
      surface: '#1b1b1b',
      border: '#333333',
      text: '#f5f5f2',
      muted: '#a0a09a',
      accent: '#ff7a1a',
      accent2: '#ffd166',
    },
    fontPairId: 'p5',
    header: 'split',
    podium: 'row',
    list: 'chips',
    mvp: 'cards',
    mvpPlacement: 'before-list',
    decor: 'stripes',
    radius: 0,
    numerals: 'pad',
  },
  {
    // 6 · Vino y champán centrado, podio escalonado, anillos finos.
    id: 'granate',
    name: 'Granate',
    blurb: 'Elegante: vino y champán, centrada, con números grandes serif.',
    theme: 'dark',
    tokens: {
      bg: '#12060b',
      surface: '#1d0c13',
      border: '#46202c',
      text: '#f6ece4',
      muted: '#b79aa0',
      accent: '#e0405a',
      accent2: '#e8c9a0',
    },
    fontPairId: 'p6',
    header: 'center',
    podium: 'stepped',
    list: 'dots',
    mvp: 'cards',
    mvpPlacement: 'after-list',
    decor: 'rings',
    radius: 14,
    numerals: 'plain',
  },
  {
    // 7 · Azul cobalto con banner amarillo y MVP arriba; ángulos rectos.
    id: 'cobalto',
    name: 'Cobalto',
    blurb: 'Cobalto y amarillo: banner luminoso, podio en fila y MVP arriba.',
    theme: 'dark',
    tokens: {
      bg: '#0a1650',
      surface: '#12236b',
      border: '#2b3f94',
      text: '#f4efe0',
      muted: '#a9b6e6',
      accent: '#ffd23f',
      accent2: '#ff8a5c',
    },
    fontPairId: 'p7',
    header: 'banner',
    podium: 'row',
    list: 'bars',
    mvp: 'strip',
    mvpPlacement: 'before-list',
    decor: 'slashes',
    radius: 0,
    numerals: 'pad',
  },
  {
    // 8 · Verdes y cobre, podio héroe, fichas, serifa gruesa.
    id: 'selva',
    name: 'Selva',
    blurb: 'Exuberante: verdes y cobre con podio héroe y fichas de posición.',
    theme: 'dark',
    tokens: {
      bg: '#0b160f',
      surface: '#122219',
      border: '#25402f',
      text: '#efe8d4',
      muted: '#98ad9c',
      accent: '#9bd16b',
      accent2: '#d9a066',
    },
    fontPairId: 'p8',
    header: 'left',
    podium: 'hero',
    list: 'chips',
    mvp: 'cards',
    mvpPlacement: 'after-list',
    decor: 'dots',
    radius: 8,
    numerals: 'plain',
  },
  {
    // 9 · Clara fría: azul acero/ámbar, cuadrícula tipo papel milimetrado, #4.
    id: 'hielo',
    name: 'Hielo',
    blurb: 'Fría y clara: azul acero y ámbar, cuadrícula de papel y numeración #4.',
    theme: 'light',
    tokens: {
      bg: '#eaf0f4',
      surface: '#f7fafc',
      border: '#c5d3dd',
      text: '#0d1b2a',
      muted: '#4a5d70',
      accent: '#1b6ca8',
      accent2: '#c8921c',
    },
    fontPairId: 'p9',
    header: 'split',
    podium: 'stepped',
    list: 'bars',
    mvp: 'strip',
    mvpPlacement: 'before-list',
    decor: 'grid',
    radius: 8,
    numerals: 'hash',
  },
  {
    // 10 · Negro y ámbar con textura de pantalla y fuente mono para cifras.
    id: 'ambar',
    name: 'Ámbar',
    blurb: 'Retro: negro y ámbar con líneas de pantalla y cifras en mono.',
    theme: 'dark',
    tokens: {
      bg: '#0a0a09',
      surface: '#14130f',
      border: '#302b1f',
      text: '#f2ead8',
      muted: '#a39a82',
      accent: '#ffb000',
      accent2: '#ff6a3d',
    },
    fontPairId: 'p10',
    header: 'banner',
    podium: 'row',
    list: 'dots',
    mvp: 'strip',
    mvpPlacement: 'after-list',
    decor: 'scan',
    radius: 0,
    numerals: 'pad',
  },
];

export function getTemplate(id: string): TemplateConfig {
  return TEMPLATES.find((template) => template.id === id) ?? TEMPLATES[0]!;
}

// ── Geometría base (§3): lienzo lógico 1080, recomposición por formato ───────

export const CANVAS_WIDTH = 1080;

export const HEIGHT_BY_FORMAT: Record<ImageFormat, number> = {
  '4:5': 1350,
  '9:16': 1920,
  '1:1': 1080,
};

export function heightForFormat(format: ImageFormat): number {
  return HEIGHT_BY_FORMAT[format];
}

/** Geometría por formato: 4:5 es la base; 9:16 y 1:1 recomponen (no escalan). */
export const GEOMETRY: Record<ImageFormat, Geometry> = {
  '4:5': {
    padY: 52,
    padX: 56,
    gap: 22,
    podium: 300,
    rowH: 52,
    rowHCompact: 40,
    rows: 7,
    rowsCompact: 11,
    mvp: 84,
    headerH: 150,
    pillsH: 44,
    footerH: 30,
  },
  '9:16': {
    padY: 64,
    padX: 56,
    gap: 24,
    podium: 380,
    rowH: 64,
    rowHCompact: 48,
    rows: 10,
    rowsCompact: 14,
    mvp: 100,
    headerH: 170,
    pillsH: 48,
    footerH: 32,
  },
  '1:1': {
    padY: 44,
    padX: 56,
    gap: 14,
    podium: 220,
    rowH: 46,
    rowHCompact: 38,
    rows: 5,
    rowsCompact: 7,
    mvp: 84,
    headerH: 120,
    pillsH: 0, // 1:1: cabecera sin píldoras (solo 3 datos en split/footer).
    footerH: 28,
  },
};

/** Densidad por número de equipos (§3): multi > 16 → varias imagens ("Parte"). */
export function densityFor(teamCount: number): Density {
  if (teamCount <= 10) return 'comfortable';
  if (teamCount <= 16) return 'compact';
  return 'multi';
}
