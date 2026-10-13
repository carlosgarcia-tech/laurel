import type { Settings } from '../../core/types';
import { TEMPLATES } from './templates';
import { FONT_PAIR_IDS } from './fonts';

export interface TemplateBundle {
  version: 1;
  app: 'laurel-template';
  settings: Settings;
  images: { logo?: string; background?: string };
}

export function serializeTemplate(
  settings: Settings,
  images: { logo?: string; background?: string },
): string {
  const bundle: TemplateBundle = { version: 1, app: 'laurel-template', settings, images };
  return JSON.stringify(bundle, null, 2);
}

export function downloadJson(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Settings con valores de catálogo garantizados: plantilla y par de fuentes
 * existentes (si no, defaults), para no tumbar la app con un JSON ajeno.
 */
function sanitizeSettings(settings: Settings): Settings {
  const templateId = TEMPLATES.some((t) => t.id === settings.templateId)
    ? settings.templateId
    : TEMPLATES[0]!.id;
  const fontFamily = FONT_PAIR_IDS.has(settings.fontFamily) ? settings.fontFamily : 'p1';
  return { ...settings, templateId, fontFamily };
}

/** Valida e interpreta un JSON de plantilla; null si es inválido. */
export function parseTemplate(raw: string): TemplateBundle | undefined {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.app !== 'laurel-template' || !isRecord(parsed.settings)) {
      return undefined;
    }
    const images: TemplateBundle['images'] = {};
    if (isRecord(parsed.images)) {
      if (typeof parsed.images.logo === 'string') images.logo = parsed.images.logo;
      if (typeof parsed.images.background === 'string')
        images.background = parsed.images.background;
    }
    return {
      version: 1,
      app: 'laurel-template',
      settings: sanitizeSettings(parsed.settings as unknown as Settings),
      images,
    };
  } catch {
    return undefined;
  }
}
