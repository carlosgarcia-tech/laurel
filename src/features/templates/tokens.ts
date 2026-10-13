import { contrastRatio } from '../../utils/color';
import type { DerivedTokens, Radius, TemplateConfig, TemplateStyle } from './types';

/** Mezcla lineal sRGB: mix(a, b, 0.5) → 50 % de b sobre a. */
export function mix(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  if (!pa || !pb) return a;
  const w = Math.min(1, Math.max(0, t));
  const channel = (from: number, to: number): string =>
    Math.round(from + (to - from) * w)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(pa.r, pb.r)}${channel(pa.g, pb.g)}${channel(pa.b, pb.b)}`;
}

function parseHex(hex: string): { r: number; g: number; b: number } | undefined {
  const raw = hex.replace('#', '');
  if (raw.length === 6) {
    return {
      r: parseInt(raw.slice(0, 2), 16),
      g: parseInt(raw.slice(2, 4), 16),
      b: parseInt(raw.slice(4, 6), 16),
    };
  }
  return undefined;
}

/** Color legible sobre un fondo con WCAG ≥ 4.5:1: devuelve negro o blanco. */
export function readableOn(background: string): string {
  const black = contrastRatio('#0a0a0a', background) ?? 0;
  return black >= 4.5 ? '#0a0a0a' : '#ffffff';
}

/** String de color con transparencia (color-mix, sin filtros) para decoración. */
export function transparentize(color: string, alpha: number): string {
  const pct = Math.round(Math.min(1, Math.max(0, alpha)) * 100);
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export const SILVER_DARK = '#b8c4c0';
export const BRONZE_DARK = '#c98b5a';
export const SILVER_LIGHT = '#8a949a';
export const BRONZE_LIGHT = '#a8643a';

/**
 * Paleta completa derivada de la configuración + overrides del usuario.
 * rowAlt = mix(bg, surface, 50 %) · track = border · text2 = mix(text, muted, 50 %)
 * onAccent = readableOn(accent) (negro o blanco según WCAG).
 */
export function deriveTokens(config: TemplateConfig, style: TemplateStyle): DerivedTokens {
  const base = config.tokens;
  const isLight = config.theme === 'light';
  const accent = style.accent ?? base.accent;
  const text = style.text ?? base.text;
  return {
    bg: base.bg,
    surface: base.surface,
    surface2: mix(base.bg, base.surface, 0.4),
    border: base.border,
    borderStrong: mix(base.border, text, 0.22),
    track: base.border,
    text,
    text2: mix(text, base.muted, 0.5),
    muted: base.muted,
    accent,
    accent2: base.accent2,
    rowAlt: mix(base.bg, base.surface, 0.5),
    gold: base.accent2,
    silver: isLight ? SILVER_LIGHT : SILVER_DARK,
    bronze: isLight ? BRONZE_LIGHT : BRONZE_DARK,
    onAccent: readableOn(accent),
  };
}

/** Radio aplicado a tarjetas/chips/píldoras/barras. El logo usa la regla de §4.6. */
export function cardRadius(radius: Radius): number {
  return radius;
}

/** Logo: radius ≥ 14 → círculo; < 14 → cuadrado con ese radius. */
export function logoRadius(radius: Radius): CSSLogoShape {
  return radius >= 14 ? { borderRadius: 999 } : { borderRadius: radius };
}

export interface CSSLogoShape {
  borderRadius: number;
}

/** Etiqueta de posición según `numerals` (§4.6). Podio: pad usa "01". */
export function positionLabel(numerals: NumeralsAlias, position: number, podium = false): string {
  switch (numerals) {
    case 'pad':
      return podium ? pad2(position) : String(position).padStart(2, '0');
    case 'plain':
      return String(position);
    case 'hash':
      return `#${position}`;
    case 'ordinal':
      return `${position}.º`;
  }
}

type NumeralsAlias = 'pad' | 'plain' | 'hash' | 'ordinal';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
