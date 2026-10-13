import type { RoomSource } from '../../core/types';
import { i18n } from '../../i18n/es';

interface FileListProps {
  rooms: RoomSource[];
  onRemove: (id: string) => void;
}

/** Lista de archivos cargados con estado por sala ("Sala 1 · 10 equipos · ✓ kills validados"). */
export function FileList({ rooms, onRemove }: FileListProps) {
  if (rooms.length === 0) {
    return <p className="mt-3 text-xs text-[var(--muted)]">{i18n.upload.empty}</p>;
  }

  return (
    <ul className="mt-3 space-y-2" aria-label={i18n.steps.files}>
      {rooms.map((source, index) => {
        const warningCount = source.room.warnings.length;
        return (
          <li
            key={source.id}
            className="flex items-start justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium" title={source.fileName}>
                {source.fileName}
              </p>
              <p className="text-xs text-[var(--text-2)]">
                {`${i18n.upload.sala} ${index + 1} · ${source.room.teams.length} ${i18n.upload.equipos} · `}
                {warningCount === 0 ? (
                  <span className="text-[var(--accent)]">{i18n.upload.killsValidados}</span>
                ) : (
                  <span className="text-[var(--gold)]">
                    {i18n.upload.advertencias(warningCount)}
                  </span>
                )}
              </p>
              {warningCount > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {source.room.warnings.slice(0, 3).map((warning, warnIndex) => (
                    <li key={warnIndex} className="text-[11px] text-[var(--muted)]">
                      {`L${warning.line}: ${warning.message}`}
                    </li>
                  ))}
                  {warningCount > 3 && (
                    <li className="text-[11px] text-[var(--muted)]">
                      {`… y ${warningCount - 3} más`}
                    </li>
                  )}
                </ul>
              )}
            </div>
            <button
              type="button"
              aria-label={`${i18n.upload.remove}: ${source.fileName}`}
              className="shrink-0 rounded-md border border-[var(--border-strong)] px-2 py-1 text-xs text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--text)]"
              onClick={() => onRemove(source.id)}
            >
              ✕
            </button>
          </li>
        );
      })}
    </ul>
  );
}
