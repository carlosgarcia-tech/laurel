import type { ThemePreset } from '../types';

export interface ThemeDefinition {
  id: ThemePreset;
  label: string;
  description: string;
  accentColor: string;
  textColor: string;
  /** Fondo por defecto: color base del degradado (para la imagen sin fondo propio). */
  bgHint: string;
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'laurel',
    label: 'Verde torneo',
    description: 'Esmeralda + dorado sobre carbón oscuro (por defecto).',
    accentColor: '#34d399',
    textColor: '#f4efe6',
    bgHint: '#07100e',
  },
  {
    id: 'corona',
    label: 'Dorado real',
    description: 'Dorado brillante con acentos crema y fondo profundo.',
    accentColor: '#e8c27a',
    textColor: '#fff7ea',
    bgHint: '#120d05',
  },
  {
    id: 'neon',
    label: 'Neón violeta',
    description: 'Violeta y cian eléctrico, glow intenso para torneos nocturnos.',
    accentColor: '#a78bfa',
    textColor: '#f1eafb',
    bgHint: '#0b0716',
  },
  {
    id: 'acero',
    label: 'Acero frío',
    description: 'Azul acero con plata, look serio y corporativo.',
    accentColor: '#7dd3fc',
    textColor: '#e8f4f5',
    bgHint: '#081018',
  },
];

export function getTheme(id: ThemePreset): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0]!;
}
