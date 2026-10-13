/** Modos de cálculo disponibles para la clasificación del torneo. */
export type CalcMode = 'standard' | 'position-kills' | 'kills-only' | 'custom';

/** Reglas de desempate aplicables tras ordenar por total descendente. */
export type TiebreakRule = 'kills' | 'best-rank' | 'booyahs';

/** Formatos de exportación de la imagen final. */
export type ImageFormat = '4:5' | '9:16' | '1:1';

/** Un jugador dentro de una sala/partida. */
export interface PlayerEntry {
  /** Nombre limpio para mostrar (invisibles reemplazados por espacio, trim). */
  name: string;
  /** ID del jugador como string (los IDs pueden ser muy largos). */
  id: string;
  kills: number;
}

/** Un equipo tal como aparece en una sala/partida. */
export interface TeamEntry {
  /** Nombre limpio para mostrar. */
  name: string;
  /** Clave normalizada (NFKC + sin invisibles + espacios colapsados + mayúsculas), solo para agrupar. */
  key: string;
  /** Posición del equipo en la partida (NO implica posición en el ranking final). */
  rank: number;
  killScore: number;
  rankScore: number;
  totalScore: number;
  players: PlayerEntry[];
}

/** Advertencia de parseo/validación, nunca un error fatal. */
export interface ParseWarning {
  /** Línea 1-based; 0 si la advertencia es a nivel de sala/equipo. */
  line: number;
  message: string;
}

/** Resultado de parsear un archivo de resultados (una sala/partida). */
export interface ParsedRoom {
  fileName: string;
  teams: TeamEntry[];
  warnings: ParseWarning[];
}

/** Archivo cargado en el editor, con su sala parseada. */
export interface RoomSource {
  id: string;
  fileName: string;
  sizeBytes: number;
  room: ParsedRoom;
}

/** Acumulado de un equipo a lo largo de todas las salas. */
export interface TeamStanding {
  key: string;
  name: string;
  kills: number;
  /** Veces con rank === 1 en alguna sala. */
  booyahs: number;
  rankPoints: number;
  total: number;
  roomsPlayed: number;
  /** Mejor (menor) posición lograda en cualquier sala; usado por el desempate 'best-rank'. */
  bestRank: number;
}

/** Posición de un jugador en el ranking de MVP. */
export interface PlayerStanding {
  id: string;
  name: string;
  teamName: string;
  teamKey: string;
  kills: number;
}

/** Totales globales del torneo para las píldoras de la cabecera. */
export interface TournamentTotals {
  teams: number;
  rooms: number;
  kills: number;
  points: number;
  booyahs: number;
}

/** Resultado completo del motor de cálculo. */
export interface EngineResult {
  standings: TeamStanding[];
  mvp: PlayerStanding[];
  totals: TournamentTotals;
  /** Pares de nombres de equipos distintos con distancia de edición ≤ 2 (probable error tipográfico). */
  similarTeams: string[][];
}

/** Opciones del motor de cálculo. */
export interface EngineOptions {
  mode: CalcMode;
  positionPoints: number[];
  killPoints: number;
  tiebreak: TiebreakRule[];
}

/** Presets de tema visual para la imagen generada. */
export type ThemePreset = 'laurel' | 'neon' | 'corona' | 'acero';

/** Overrides de estilo por plantilla (acento, texto, par de fuentes). */
export interface TemplateStyleOverrides {
  accent?: string;
  text?: string;
  fontPairId?: string;
}

/** Ajustes del editor (persistidos con versión de esquema). */
export interface Settings {
  title: string;
  matchday: string;
  date: string;
  moderator: string;
  mode: CalcMode;
  tiebreak: TiebreakRule[];
  positionPoints: number[];
  killPoints: number;
  format: ImageFormat;
  /** Opacidad del scrim oscuro sobre el fondo propio (0..1). */
  scrimOpacity: number;
  /** Preset de diseño (fija texto/acento y el estilo de fondo sugerido). */
  theme: ThemePreset;
  /** Mostrar el logo por defecto cuando el usuario no sube uno propio. */
  useDefaultLogo: boolean;
  /** Mostrar el fondo por defecto cuando el usuario no sube uno propio. */
  useDefaultBackground: boolean;
  /** Plantilla activa del catálogo (TEMPLATES.md). */
  templateId: string;
  /**
   * Overrides de estilo POR PLANTILLA (acento/texto/fontPairId). Sin override
   * se usan los tokens/par de la propia plantilla (AJUSTES.md P0.1).
   */
  styleByTemplate: Record<string, TemplateStyleOverrides>;
}
