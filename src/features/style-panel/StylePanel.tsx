import { useRef, useState } from 'react';
import type { Settings, ThemePreset } from '../../core/types';
import { THEMES } from '../../core/style/themes';
import { i18n } from '../../i18n/es';
import { contrastRatio } from '../../utils/color';
import { isAcceptedImage, MAX_INPUT_IMAGE_BYTES, resizeImage } from '../../utils/imageResize';
import type { StoredImageController } from './useStoredImage';

interface StylePanelProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  /** Únila fuente de estado en App: el preview y la descarga se alimentan de aquí. */
  logo: StoredImageController;
  background: StoredImageController;
}

const FONTS: Array<{ value: Settings['fontFamily']; label: string }> = [
  { value: 'Syne', label: 'Syne' },
  { value: 'Oxanium', label: 'Oxanium' },
  { value: 'Space Grotesk', label: 'Space Grotesk' },
  { value: 'Rubik', label: 'Rubik' },
  { value: 'Archivo', label: 'Archivo' },
  { value: 'Sora', label: 'Sora' },
];

const THEME_LABEL_KEYS: Record<ThemePreset, keyof typeof i18n.style> = {
  laurel: 'themeDefault',
  corona: 'themeCorona',
  neon: 'themeNeon',
  acero: 'themeAcero',
};

/** Paso 4: tema, logo, fondo, tipo de fuente y colores. */
export function StylePanel({ settings, onChange, logo, background }: StylePanelProps) {
  const [notice, setNotice] = useState<string | undefined>(undefined);
  const noticeTimer = useRef<number | undefined>(undefined);

  const contrast = contrastRatio(settings.textColor, '#07100e');
  const lowContrast = contrast !== undefined && contrast < 4.5;

  async function pickImage(key: 'logo' | 'background', file: File): Promise<void> {
    if (!isAcceptedImage(file)) {
      setNotice(i18n.style.invalidImage);
      window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => setNotice(undefined), 4000);
      return;
    }
    if (file.size > MAX_INPUT_IMAGE_BYTES) {
      setNotice(`${i18n.style.invalidImage} (máx. 8 MB)`);
      return;
    }
    const controller = key === 'logo' ? logo : background;
    try {
      // Preview instantáneo con el archivo original mientras se optimiza en caliente.
      const dataUrl = await fileToDataUrl(file);
      controller.show(dataUrl);
      const maxSide = key === 'logo' ? 512 : 2160;
      const optimized = await resizeImage(file, maxSide);
      controller.commit(optimized);
    } catch {
      controller.commit(undefined);
      setNotice(i18n.style.invalidImage);
    }
  }

  function ImageField({
    id,
    label,
    hint,
    dataUrl,
    defaultOn,
    onToggleDefault,
    onRemove,
    onPick,
    defaultKey,
  }: {
    id: string;
    label: string;
    hint: string;
    dataUrl: string | undefined;
    defaultOn: boolean;
    onToggleDefault: (enabled: boolean) => void;
    onRemove: () => void;
    onPick: (file: File) => void;
    defaultKey: 'logo' | 'background';
  }) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
        <p className="text-xs font-medium text-[var(--text-2)]">{label}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)]">
            {dataUrl ? (
              <img src={dataUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span aria-hidden="true" className="text-lg text-[var(--muted)]">
                ◻
              </span>
            )}
          </div>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPick(file);
              e.target.value = '';
            }}
          />
          <label
            htmlFor={id}
            className="cursor-pointer rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs hover:border-[var(--accent)]"
          >
            {i18n.upload.chooseButton}
          </label>
          {dataUrl && (
            <button
              type="button"
              aria-label={`${i18n.style.removeImage}: ${label}`}
              onClick={onRemove}
              className="rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs text-[var(--text-2)] hover:text-[var(--text)]"
            >
              {i18n.style.removeImage}
            </button>
          )}
        </div>
        <label
          htmlFor={`use-default-${defaultKey}`}
          className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-[var(--text-2)]"
        >
          <input
            id={`use-default-${defaultKey}`}
            type="checkbox"
            checked={defaultOn}
            onChange={(e) => onToggleDefault(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          {i18n.style.useDefault}
        </label>
        <p className="mt-1 text-[11px] text-[var(--muted)]">{hint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Presets de estilo de diseño */}
      <fieldset>
        <legend className="mb-1 text-xs font-medium text-[var(--text-2)]">
          {i18n.style.theme}
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {THEMES.map((theme) => (
            <label
              key={theme.id}
              htmlFor={`theme-${theme.id}`}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 has-[:checked]:border-[var(--accent)]"
            >
              <input
                id={`theme-${theme.id}`}
                type="radio"
                name="theme-preset"
                className="sr-only"
                checked={settings.theme === theme.id}
                onChange={() =>
                  onChange({
                    theme: theme.id,
                    accentColor: theme.accentColor,
                    textColor: theme.textColor,
                  })
                }
              />
              <span
                aria-hidden="true"
                className="h-4 w-4 shrink-0 rounded-full border border-[var(--border-strong)]"
                style={{ background: theme.accentColor }}
              />
              <span className="text-xs">
                {i18n.style[THEME_LABEL_KEYS[theme.id]] as string}
                <span className="block text-[10px] text-[var(--muted)]">{theme.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ImageField
          id="pick-logo"
          label={i18n.style.logo}
          hint={i18n.style.logoHint}
          dataUrl={logo.image.dataUrl}
          defaultOn={settings.useDefaultLogo}
          onToggleDefault={(enabled) => onChange({ useDefaultLogo: enabled })}
          onRemove={() => logo.commit(undefined)}
          onPick={(file) => void pickImage('logo', file)}
          defaultKey="logo"
        />
        <ImageField
          id="pick-background"
          label={i18n.style.fondo}
          hint={i18n.style.fondoHint}
          dataUrl={background.image.dataUrl}
          defaultOn={settings.useDefaultBackground}
          onToggleDefault={(enabled) => onChange({ useDefaultBackground: enabled })}
          onRemove={() => background.commit(undefined)}
          onPick={(file) => void pickImage('background', file)}
          defaultKey="background"
        />
      </div>

      <label className="flex items-center justify-between gap-2 text-xs text-[var(--text-2)]">
        <span>{i18n.style.scrim}</span>
        <input
          type="range"
          min={0}
          max={0.9}
          step={0.05}
          value={settings.scrimOpacity}
          onChange={(e) => onChange({ scrimOpacity: Number(e.target.value) })}
          className="w-40 accent-[var(--accent)]"
          aria-label={i18n.style.scrim}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-2)]">
        {i18n.style.font}
        <select
          value={settings.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value as Settings['fontFamily'] })}
          className="rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text)]"
        >
          {FONTS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-2)]">
          {i18n.style.textColor}
          <input
            type="color"
            value={settings.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
            aria-label={i18n.style.textColor}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-[var(--text-2)]">
          {i18n.style.accentColor}
          <input
            type="color"
            value={settings.accentColor}
            onChange={(e) => onChange({ accentColor: e.target.value })}
            aria-label={i18n.style.accentColor}
          />
        </label>
      </div>

      {lowContrast && (
        <p
          role="status"
          className="rounded-lg border border-[var(--gold)] p-2 text-xs text-[var(--gold)]"
        >
          {i18n.style.contrastWarn}
        </p>
      )}
      {notice && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--bronze)] p-2 text-xs text-[var(--bronze)]"
        >
          {notice}
        </p>
      )}
    </div>
  );
}

/** Data URL directa del archivo original para el preview sin esperar la optimización. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () => reject(new Error('No se pudo leer la imagen.')));
    reader.readAsDataURL(file);
  });
}
