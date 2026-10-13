import type { Settings } from '../../core/types';
import { i18n } from '../../i18n/es';

interface TournamentFormProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-[var(--text-2)]">
        {label}
      </label>
      {children}
    </div>
  );
}

/** Campos del torneo (§5.3): Título+Jornada (70/30), Fecha+Moderador (50/50). */
export function TournamentForm({ settings, onChange }: TournamentFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid min-w-0 grid-cols-[7fr_3fr] gap-3">
        <Field id="f-title" label={i18n.form.title}>
          <input
            id="f-title"
            className="field"
            value={settings.title}
            placeholder={i18n.form.titlePlaceholder}
            maxLength={80}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </Field>
        <Field id="f-matchday" label={i18n.form.matchday}>
          <input
            id="f-matchday"
            className="field"
            value={settings.matchday}
            inputMode="numeric"
            maxLength={20}
            onChange={(e) => onChange({ matchday: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <Field id="f-date" label={i18n.form.date}>
          <input
            id="f-date"
            type="date"
            className="field"
            value={settings.date}
            onChange={(e) => onChange({ date: e.target.value })}
          />
        </Field>
        <Field id="f-moderator" label={i18n.form.moderator}>
          <input
            id="f-moderator"
            className="field"
            value={settings.moderator}
            placeholder={i18n.form.moderatorPlaceholder}
            maxLength={60}
            onChange={(e) => onChange({ moderator: e.target.value })}
          />
        </Field>
      </div>
    </div>
  );
}
