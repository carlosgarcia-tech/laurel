import type { Settings } from '../../core/types';
import { i18n } from '../../i18n/es';
import { formatDateForKicker } from '../../features/preview/dateFormat';

interface TournamentFormProps {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[var(--text-2)]">
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 text-[16px] text-[var(--text)] placeholder:text-[var(--muted)] sm:text-sm';

/** Paso 2: título, jornada, fecha y moderador. */
export function TournamentForm({ settings, onChange }: TournamentFormProps) {
  const datePreview = settings.date.trim().length > 0 ? formatDateForKicker(settings.date) : '';
  return (
    <div className="grid grid-cols-1 min-w-0 gap-3 sm:grid-cols-2">
      <Field id="f-title" label={i18n.form.title}>
        <input
          id="f-title"
          className={inputClass}
          value={settings.title}
          placeholder={i18n.form.titlePlaceholder}
          maxLength={80}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>
      <Field id="f-matchday" label={i18n.form.matchday}>
        <input
          id="f-matchday"
          className={inputClass}
          value={settings.matchday}
          inputMode="numeric"
          maxLength={20}
          onChange={(e) => onChange({ matchday: e.target.value })}
        />
      </Field>
      <Field
        id="f-date"
        label={i18n.form.date}
        hint={
          datePreview.length > 0
            ? `${i18n.form.dateHint.replace('«12 OCT 2026»', `«${datePreview}»`)}`
            : i18n.form.dateHint
        }
      >
        <input
          id="f-date"
          type="date"
          className={inputClass}
          value={settings.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
      </Field>
      <Field id="f-moderator" label={i18n.form.moderator}>
        <input
          id="f-moderator"
          className={inputClass}
          value={settings.moderator}
          placeholder={i18n.form.moderatorPlaceholder}
          maxLength={60}
          onChange={(e) => onChange({ moderator: e.target.value })}
        />
      </Field>
    </div>
  );
}
