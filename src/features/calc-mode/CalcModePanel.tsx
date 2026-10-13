import type { CalcMode, EngineResult, Settings } from '../../core/types';
import { DEFAULT_KILL_POINTS, DEFAULT_POSITION_POINTS } from '../../core/engine/presets';
import { i18n } from '../../i18n/es';

interface CalcModePanelProps {
  settings: Settings;
  engineResult: EngineResult | undefined;
  onChange: (patch: Partial<Settings>) => void;
}

const MODES: CalcMode[] = ['standard', 'position-kills', 'kills-only', 'custom'];

/**
 * Cálculo (§5.4): lista de radios sin cajas — barra vertical de 2 px de acento
 * en la seleccionada. `Personalizado` abre su tabla debajo, sangrada.
 * El desempate (§5.5) vive en su propio paso, manejado por TiebreakList.
 */
export function CalcModePanel({ settings, engineResult, onChange }: CalcModePanelProps) {
  const showTable = settings.mode === 'custom' || settings.mode === 'position-kills';

  return (
    <div>
      <fieldset>
        <legend className="sr-only">{i18n.sections.mode}</legend>
        <div role="radiogroup" aria-label={i18n.sections.mode}>
          {MODES.map((value) => {
            const selected = settings.mode === value;
            return (
              <label
                key={value}
                className={`flex min-h-[52px] cursor-pointer items-start gap-3 border-l-2 py-2.5 pl-3 transition-colors ${
                  selected
                    ? 'border-[var(--accent)]'
                    : 'border-transparent hover:border-[var(--line-strong)]'
                }`}
              >
                <input
                  type="radio"
                  name="calc-mode"
                  value={value}
                  checked={selected}
                  onChange={() => onChange({ mode: value })}
                  className="mt-0.5"
                />
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-medium ${selected ? 'text-[var(--text)]' : 'text-[var(--text-2)]'}`}
                  >
                    {i18n.mode[value]}
                  </span>
                  <span className="block text-[13px] text-[var(--text-3)]">
                    {i18n.mode[`${value}Desc` as keyof typeof i18n.mode] as string}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {showTable && (
        <div className="fade-content mt-3 ml-5 flex flex-col gap-3">
          <p className="text-xs font-medium text-[var(--text-2)]">{i18n.mode.positionTable}</p>
          <div className="grid grid-cols-5 gap-2">
            {settings.positionPoints.map((points, index) => (
              <label key={index} className="flex flex-col items-center gap-1">
                <span className="mono text-[11px] text-[var(--text-3)]">{index + 1}</span>
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
                  className="field px-1 text-center"
                  aria-label={`${i18n.mode.positionTable} — posición ${index + 1}`}
                />
              </label>
            ))}
          </div>
          <label className="flex items-center justify-between gap-2">
            <span className="text-[13px] text-[var(--text-2)]">{i18n.mode.killPoints}</span>
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
              className="field w-16 px-2 text-center"
              aria-label={i18n.mode.killPoints}
            />
          </label>
        </div>
      )}

      {engineResult && engineResult.similarTeams.length > 0 && (
        <div role="status" className="mt-3 border-l-2 border-[var(--danger)] pl-3">
          <p className="text-[13px] font-medium text-[var(--danger)]">
            {i18n.mode.similarTeamsTitle}
          </p>
          {engineResult.similarTeams.map(([a, b], index) => (
            <p key={index} className="mono mt-0.5 text-[12px] text-[var(--text-2)]">
              {`${a} ↔ ${b}`}
            </p>
          ))}
          <p className="mt-1 text-[12px] text-[var(--text-3)]">{i18n.mode.similarTeamsNote}</p>
        </div>
      )}

      <button
        type="button"
        className="sr-only"
        onClick={() => onChange({ positionPoints: [...DEFAULT_POSITION_POINTS] })}
      >
        {i18n.mode.resetTable}
      </button>
    </div>
  );
}
