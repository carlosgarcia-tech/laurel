import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { TiebreakRule } from '../../core/types';
import { i18n } from '../../i18n/es';

interface TiebreakListProps {
  value: TiebreakRule[];
  onChange: (next: TiebreakRule[]) => void;
}

const RULES: Array<{ value: TiebreakRule; label: string }> = [
  { value: 'kills', label: i18n.mode.kills },
  { value: 'best-rank', label: i18n.mode['best-rank'] },
  { value: 'booyahs', label: i18n.mode.booyahs },
];

const LABELS: Record<TiebreakRule, string> = {
  kills: i18n.mode.kills,
  'best-rank': i18n.mode['best-rank'],
  booyahs: i18n.mode.booyahs,
};

/**
 * Desempate ordenable (§5.5): el número mono es la prioridad real.
 * Arrastre desde el tirador ⋮⋮, subir/bajar al enfocar la fila, Alt+↑/↓ y
 * aria-live. Los handlers viven en el tirador (elemento con rol), no en el li.
 */
export function TiebreakList({ value, onChange }: TiebreakListProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number): void {
    if (to < 0 || to >= value.length || from === to) return;
    const next = [...value];
    const [rule] = next.splice(from, 1);
    if (rule === undefined) return;
    next.splice(to, 0, rule);
    onChange(next);
  }

  function toggle(rule: TiebreakRule): void {
    if (value.includes(rule)) {
      onChange(value.filter((r) => r !== rule));
    } else {
      onChange([...value, rule]);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    if (!event.altKey) return;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      move(index, index - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      move(index, index + 1);
    }
  }

  return (
    <div>
      <p className="text-[13px] text-[var(--text-2)]">{i18n.mode.tiebreakNote}</p>
      <ol className="mt-2" aria-label={i18n.mode.tiebreakOrder(value.map((r) => LABELS[r]))}>
        {RULES.map(({ value: rule, label }) => {
          const activeIndex = value.indexOf(rule);
          const active = activeIndex >= 0;
          return (
            <li
              key={rule}
              className={`flex h-11 items-center gap-3 border-b border-[var(--line)] last:border-b-0 ${
                active ? 'cursor-grab' : ''
              } ${dragIndex !== null && dragIndex === activeIndex ? 'opacity-50' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`mono w-5 text-[13px] ${active ? 'text-[var(--text)]' : 'text-[var(--text-3)]'}`}
              >
                {active ? activeIndex + 1 : '·'}
              </span>
              {active ? (
                <button
                  type="button"
                  draggable
                  aria-label={`${i18n.mode.tiebreakOrder([label])} — arrastrar`}
                  onDragStart={() => setDragIndex(activeIndex)}
                  onDragEnd={() => setDragIndex(null)}
                  onKeyDown={(e) => handleKeyDown(e, activeIndex)}
                  className="cursor-grab text-[var(--text-3)] select-none"
                >
                  ⋮⋮
                </button>
              ) : (
                <span aria-hidden="true" className="text-[var(--text-3)] select-none">
                  ⋮⋮
                </span>
              )}
              <label
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2"
                onDragOver={(e) => {
                  if (active) e.preventDefault();
                }}
                onDrop={() => {
                  if (dragIndex !== null && active) move(dragIndex, activeIndex);
                  setDragIndex(null);
                }}
              >
                <input type="checkbox" checked={active} onChange={() => toggle(rule)} />
                <span
                  className={`text-sm ${active ? 'text-[var(--text)]' : 'text-[var(--text-3)]'}`}
                >
                  {label}
                </span>
              </label>
              {active && (
                <span className="flex shrink-0 gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
                  <button
                    type="button"
                    aria-label={`${i18n.mode.moveUp}: ${label}`}
                    disabled={activeIndex === 0}
                    onClick={() => move(activeIndex, activeIndex - 1)}
                    className="btn-text text-[12px] disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`${i18n.mode.moveDown}: ${label}`}
                    disabled={activeIndex === value.length - 1}
                    onClick={() => move(activeIndex, activeIndex + 1)}
                    className="btn-text text-[12px] disabled:opacity-30"
                  >
                    ↓
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p aria-live="polite" className="sr-only">
        {i18n.mode.tiebreakOrder(value.map((r) => LABELS[r]))}
      </p>
    </div>
  );
}
