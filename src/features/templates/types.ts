import type { ImageFormat } from '../../core/types';
import type { ResultViewModel, StandingRow } from '../../core/viewmodel/buildViewModel';
export type { StandingRow } from '../../core/viewmodel/buildViewModel';

// ── Variantes de sección (TEMPLATESv2 §1.2) ──────────────────────────────────

export type Density = 'comfortable' | 'compact' | 'multi';
export type HeaderV = 'left' | 'center' | 'split' | 'banner';
export type PodiumV = 'stepped' | 'row' | 'hero';
export type ListV = 'bars' | 'dots' | 'chips';
export type MvpV = 'cards' | 'strip';
export type MvpPlacement = 'after-list' | 'before-list';
export type DecorV =
  | 'rings'
  | 'slashes'
  | 'arcs'
  | 'brackets'
  | 'dots'
  | 'stripes'
  | 'grid'
  | 'scan'
  | 'chevrons'
  | 'zone';
export type Numerals = 'pad' | 'plain' | 'hash' | 'ordinal';
export type Radius = 0 | 4 | 8 | 14 | 20;

// ── Tokens de color (§5.2) y derivados ───────────────────────────────────────

/** Tokens base declarados por cada plantilla. */
export interface TemplateTokens {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
}

/** Paleta completa derivada — calculada una vez por render, leída por las secciones. */
export interface DerivedTokens {
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  track: string;
  text: string;
  text2: string;
  muted: string;
  accent: string;
  accent2: string;
  rowAlt: string;
  gold: string;
  silver: string;
  bronze: string;
  onAccent: string;
}

/** Overrides del usuario (acento/texto/par de fuentes), por plantilla. */
export interface TemplateStyle {
  accent?: string;
  text?: string;
  fontPairId?: string;
}

/** Par de fuentes (§6): títulos/números display + datos. */
export interface FontPairDef {
  id: string;
  label: string;
  /** Familia display (títulos, números grandes). */
  display: string;
  /** Familia de cuerpo/datos. */
  body: string;
  /** Pesos disponibles del display en @fontsource. */
  displayWeights: string;
}

// ── Configuración de plantilla (§2) ──────────────────────────────────────────

/** Una plantilla = SOLO este objeto de datos. Agregar una = agregar uno aquí. */
export interface TemplateConfig {
  id: string;
  name: string;
  blurb: string;
  /** Categoría de la galería (TEMPLATES-FREEFIRE §2.1): pestañas General / Free Fire. */
  category: 'general' | 'free-fire';
  theme: 'dark' | 'light';
  tokens: TemplateTokens;
  fontPairId: string;
  header: HeaderV;
  podium: PodiumV;
  list: ListV;
  mvp: MvpV;
  mvpPlacement: MvpPlacement;
  decor: DecorV;
  radius: Radius;
  numerals: Numerals;
}

// ── Props del componente único ───────────────────────────────────────────────

export interface TemplateProps {
  vm: ResultViewModel;
  config: TemplateConfig;
  style: TemplateStyle;
  /** Imágenes del usuario ya procesadas (data URLs locales). */
  assets: { logo?: string; background?: string };
  format: ImageFormat;
  width: number;
  height: number;
  /**
   * Editor-only (TEMPLATES-FREEFIRE §6.2): revela el podio la primera vez que
   * se renderiza una jornada. La galería y la exportación no lo pasan; además
   * `data-capture` anula la animación al capturar (§6.3).
   */
  reveal?: boolean;
}

// ── Geometría y escena (§3) ──────────────────────────────────────────────────

/** Geometría del lienzo por formato (TEMPLATESv2 §3). */
export interface Geometry {
  padY: number;
  padX: number;
  gap: number;
  /** Alto máximo del podio. */
  podium: number;
  /** Alto de fila (comfortable) y (compact). */
  rowH: number;
  rowHCompact: number;
  /** Filas máximas de la lista. */
  rows: number;
  rowsCompact: number;
  /** Alto del bloque MVP. */
  mvp: number;
  headerH: number;
  pillsH: number;
  footerH: number;
}

/** Contexto inmutable que las secciones reciben (sin lógica de negocio). */
export interface Scene {
  vm: ResultViewModel;
  config: TemplateConfig;
  /** Imágenes ya procesadas (data URLs locales). */
  assets: { logo?: string; background?: string };
  t: DerivedTokens;
  fonts: { display: string; body: string };
  format: ImageFormat;
  geo: Geometry;
  density: Density;
  /** Filas de la lista para ESTA imagen (con cap si density=multi). */
  listRows: StandingRow[];
  /** Paginación de la imagen (density multi): undefined si es única. */
  part?: { index: number; total: number };
  /** Revelar el podio con stagger (solo preview del editor; ver TemplateProps). */
  reveal: boolean;
}
