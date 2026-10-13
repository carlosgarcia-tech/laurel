import type { CalcMode, EngineResult, Settings, TiebreakRule } from '../../core/types';
import { DEFAULT_KILL_POINTS, DEFAULT_POSITION_POINTS } from '../../core/engine/presets';
import { i18n } from '../../i18n/es';

interface CalcModePanelProps {
  settings: Settings;
  engineResult: EngineResult | undefined;
  onChange: (patch: Partial<Settings>) => void;
}

const MODES: Array<{ value: CalcMode; needsTable: boolean }> = [
  { value: 'standard', needsTable: false },
  { value: 'position-kills', needsTable: true },
  { value: 'kills-only', needsTable: false },
  { value: 'custom', needsTable: true },
];

const TIEBREAK_OPTIONS: Array<{ value: TiebreakRule; label: string }> = [
  { value: 'kills', label: i18n.mode.kills },
  { value: 'best-rank', label: i18n.mode['best-rank'] },
  { value: 'booyahs', label: i18n.mode.booyahs },
];

/** Paso 3: modo de cálculo + desempate + tabla editable (standard por defecto). */
export function CalcModePanel({ settings, engineResult, onChange }: CalcModePanelProps) {
  const current = MODES.find((m) => m.value === settings.mode) ?? MODES[0];
  const showTable =
    settings.mode === 'custom' || (settings.mode === 'position-kills' && current?.needsTable);

  return (
    <div className="space-y-4">
      <fieldset className="space-y-2">
        <legend className="sr-only">{i18n.steps.mode}</legend>
        {MODES.map(({ value }) => (
          <label
            key={value}
            htmlFor={`calc-mode-${value}`}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 has-[:checked]:border-[var(--accent)]"
          >
            <input
              id={`calc-mode-${value}`}
              type="radio"
              name="calc-mode"
              value={value}
              checked={settings.mode === value}
              onChange={() => onChange({ mode: value })}
              className="mt-1 accent-[var(--accent)]"
            />
            <span>
              <span className="block text-sm font-medium">{i18n.mode[value]}</span>
              <span className="block text-xs text-[var(--text-2)]">
                {i18n.mode[`${value}Desc` as keyof typeof i18n.mode] as string}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-xs font-medium text-[var(--text-2)]">
          {i18n.mode.tiebreakTitle}
        </legend>
        <p className="mb-2 text-[11px] text-[var(--muted)]">{i18n.mode.tiebreakNote}</p>
        <div className="flex flex-wrap gap-3">
          {TIEBREAK_OPTIONS.map(({ value, label }) => {
            const checked = settings.tiebreak.includes(value);
            return (
              <label key={value} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...settings.tiebreak, value]
                      : settings.tiebreak.filter((rule) => rule !== value);
                    onChange({ tiebreak: next });
                  }}
                  className="accent-[var(--accent)]"
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {showTable && (
        <div className="space-y-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <p className="text-xs font-medium text-[var(--text-2)]">{i18n.mode.positionTable}</p>
          <div className="grid grid-cols-5 gap-2">
            {settings.positionPoints.map((points, index) => (
              <label key={index} className="flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-[var(--muted)]">{index + 1}</span>
                <input
                  type="number"
                  min={0}
                  max={999}
                  value={points}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10);
                    if (Number.isNaN(value) || value < 0) return;
                    const next = [...settings.positionPoints];
                    next[index] = value;
                    onChange({ positionPoints: next });
                  }}
                  className="w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-1 py-1 text-center text-sm"
                  aria-label={`${i18n.mode.positionTable} — posición ${index + 1}`}
                />
              </label>
            ))}
          </div>
          <label className="flex items-center justify-between gap-2 text-xs">
            <span className="text-[var(--text-2)]">{i18n.mode.killPoints}</span>
            <input
              type="number"
              min={0}
              max={99}
              step={1}
              value={settings.killPoints}
              onChange={(e) => {
                const value = Number.parseInt(e.target.value, 10);
                onChange({
                  killPoints: Number.isNaN(value) || value < 0 ? DEFAULT_KILL_POINTS : value,
                });
              }}
              className="w-16 rounded-md border border-[var(--border-strong)] bg-[var(--surface-2)] px-2 py-1 text-center"
              aria-label={i18n.mode.killPoints}
            />
          </label>
        </div>
      )}

      {engineResult && engineResult.similarTeams.length > 0 && (
        <div
          role="status"
          className="rounded-lg border border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_12%,transparent)] p-3 text-xs text-[var(--text-2)]"
        >
          <p className="font-medium text-[var(--gold)]">{i18n.mode.similarTeamsTitle}</p>
          {engineResult.similarTeams.map(([a, b], index) => (
            <p key={index} className="mt-0.5">
              {`· ${a} ↔ ${b}`}
            </p>
          ))}
          <p className="mt-1 text-[11px] text-[var(--muted)]">{i18n.mode.similarTeamsNote}</p>
        </div>
      )}
      <button
        type="button"
        className="sr-only"
        onClick={() => onChange({ positionPoints: [...DEFAULT_POSITION_POINTS] })}
      >
        Restablecer tabla por defecto
      </button>
    </div>
  );
}
