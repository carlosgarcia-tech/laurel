import type { RoomSource } from '../../core/types';
import { i18n } from '../../i18n/es';

interface FileListProps {
  rooms: RoomSource[];
  onRemove: (id: string) => void;
}

/** Filas en mono: `sala_1.log · 10 equipos · 86 kills` + quitar (§5.2). */
export function FileList({ rooms, onRemove }: FileListProps) {
  if (rooms.length === 0) return null;

  return (
    <ul className="mt-3 space-y-1.5" aria-label={i18n.sections.files}>
      {rooms.map((source) => {
        const warningCount = source.room.warnings.length;
        const kills = source.room.teams.reduce(
          (sum, team) => sum + team.players.reduce((s, p) => s + p.kills, 0),
          0,
        );
        return (
          <li key={source.id} className="min-w-0">
            <div className="flex items-baseline justify-between gap-2">
              <p
                className="mono min-w-0 truncate text-[13px] text-[var(--text)]"
                title={source.fileName}
              >
                {`${source.fileName} · ${source.room.teams.length} ${i18n.upload.equipos} · ${kills} ${i18n.upload.kills}`}
              </p>
              <button
                type="button"
                aria-label={`${i18n.upload.remove}: ${source.fileName}`}
                className="btn-text shrink-0 text-[12px]"
                onClick={() => onRemove(source.id)}
              >
                {i18n.upload.remove}
              </button>
            </div>
            {warningCount > 0 && (
              <ul className="mt-0.5">
                {source.room.warnings.slice(0, 3).map((warning, warnIndex) => (
                  <li key={warnIndex} className="text-[12px] text-[var(--danger)]">
                    {`L${warning.line}: ${warning.message}`}
                  </li>
                ))}
                {warningCount > 3 && (
                  <li className="text-[12px] text-[var(--text-3)]">
                    {`… y ${warningCount - 3} más`}
                  </li>
                )}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
