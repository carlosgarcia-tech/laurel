import type { ReactNode } from 'react';
import { i18n } from '../i18n/es';

interface SectionProps {
  number: string;
  title: string;
  /** Resumen en una línea cuando la sección está cerrada (§5.1). */
  summary?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/**
 * Sección colapsable del paso (UI-REDESIGN §5.1): número mono + título,
 * filete de 1 px en vez de tarjeta. Cerrada resume en una línea con «Editar»;
 * abierta se colapsa pulsando el título. Solo opacidad al cambiar (120 ms).
 */
export function Section({ number, title, summary, open, onToggle, children }: SectionProps) {
  return (
    <section className="border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0">
      {open ? (
        <div className="flex items-baseline gap-3">
          <span aria-hidden="true" className="mono w-8 shrink-0 text-[13px] text-[var(--accent)]">
            {number}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="min-w-0 flex-1 text-left text-[17px] leading-[22px] font-semibold"
          >
            {title}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-baseline gap-3 text-left"
        >
          <span aria-hidden="true" className="mono w-8 shrink-0 text-[13px] text-[var(--text-3)]">
            {number}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm text-[var(--text-2)]">
            {summary ?? title}
          </span>
          <span className="btn-text shrink-0 text-[13px]">{i18n.sections.edit}</span>
        </button>
      )}
      {open && <div className="fade-content mt-3 pl-11">{children}</div>}
    </section>
  );
}
