import { memo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { EngineResult, Settings, TeamStanding } from '../../core/types';
import { formatDateForKicker } from './dateFormat';
import { i18n } from '../../i18n/es';

export const CANVAS_WIDTH = 1080;
export const CANVAS_SIZES = {
  '4:5': 1350,
  '9:16': 1920,
  '1:1': 1080,
} as const;

interface ResultImageProps {
  result: EngineResult;
  settings: Settings;
  logoUrl?: string;
  backgroundUrl?: string;
}

interface Density {
  pad: number;
  gap: number;
  title: number;
  kicker: number;
  pillValue: number;
  pillLabel: number;
  podiumName: number;
  podiumTotal1: number;
  podiumTotalRest: number;
  podiumHeight: number;
  rowName: number;
  rowHeight: number;
  rowCols: number;
  mvpName: number;
  mvpLine: boolean;
  footer: number;
}

const DENSITIES: Record<Settings['format'], Density> = {
  '4:5': {
    pad: 52,
    gap: 18,
    title: 54,
    kicker: 19,
    pillValue: 22,
    pillLabel: 15,
    podiumName: 24,
    podiumTotal1: 52,
    podiumTotalRest: 38,
    podiumHeight: 196,
    rowName: 19,
    rowHeight: 47,
    rowCols: 16,
    mvpName: 20,
    mvpLine: false,
    footer: 14,
  },
  '9:16': {
    pad: 64,
    gap: 24,
    title: 64,
    kicker: 21,
    pillValue: 25,
    pillLabel: 16,
    podiumName: 27,
    podiumTotal1: 60,
    podiumTotalRest: 42,
    podiumHeight: 220,
    rowName: 20,
    rowHeight: 56,
    rowCols: 17,
    mvpName: 22,
    mvpLine: false,
    footer: 15,
  },
  '1:1': {
    pad: 44,
    gap: 12,
    title: 40,
    kicker: 15,
    pillValue: 17,
    pillLabel: 12,
    podiumName: 18,
    podiumTotal1: 38,
    podiumTotalRest: 28,
    podiumHeight: 140,
    rowName: 15,
    rowHeight: 34,
    rowCols: 13,
    mvpName: 14,
    mvpLine: true,
    footer: 11,
  },
};

const PODIUM_COLORS = ['#e8c27a', '#b8c4c0', '#c98b5a'];

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatKicker(matchday: string, date: string): string {
  const parts: string[] = [];
  if (matchday.trim().length > 0) parts.push(`JORNADA ${matchday.trim().toUpperCase()}`);
  if (date.trim().length > 0) parts.push(formatDateForKicker(date));
  return parts.join(' · ');
}

/** La imagen final: componente puro, renderiza al tamaño lógico fijo (la exportación lo escala 2x). */
function ResultImageComponent({ result, settings, logoUrl, backgroundUrl }: ResultImageProps) {
  const d = DENSITIES[settings.format];
  const canvasHeight = CANVAS_SIZES[settings.format];
  const { standings, mvp, totals } = result;
  const maxTotal = Math.max(1, standings[0]?.total ?? 1);
  const displayFont = `${settings.fontFamily}, 'Syne', system-ui, sans-serif`;

  const rootStyle: CSSProperties = {
    width: CANVAS_WIDTH,
    height: canvasHeight,
    backgroundColor: 'var(--bg)',
    background: backgroundUrl
      ? 'var(--bg)'
      : `radial-gradient(1100px 520px at 88% -12%, color-mix(in srgb, ${settings.accentColor} 16%, transparent), transparent 70%),\n         radial-gradient(900px 520px at -10% 110%, color-mix(in srgb, ${settings.accentColor} 10%, transparent), transparent 70%),\n         linear-gradient(180deg, #0a1512 0%, #07100e 55%, #050b0a 100%)`,
    color: settings.textColor,
    fontFamily: "'Space Grotesk', system-ui, 'Noto Sans', 'Segoe UI Symbol', sans-serif",
    padding: d.pad,
    display: 'flex',
    flexDirection: 'column',
    gap: d.gap,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return (
    <div style={rootStyle}>
      {/* Capas decorativas */}
      {backgroundUrl && (
        <>
          <img
            src={backgroundUrl}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: `rgba(7, 16, 14, ${settings.scrimOpacity})`,
            }}
          />
        </>
      )}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Ring style={{ width: 560, height: 560, top: -220, right: -180 }} />
        <Ring style={{ width: 760, height: 760, bottom: -320, left: -260 }} />
        <Ring style={{ width: 320, height: 320, bottom: 80, right: -120 }} />
      </div>

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: d.gap,
          height: '100%',
        }}
      >
        {/* Cabecera */}{' '}
        <header style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              border: `2px solid color-mix(in srgb, ${settings.accentColor} 45%, var(--border-strong))`,
              boxShadow: `0 0 26px color-mix(in srgb, ${settings.accentColor} 22%, transparent)`,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--surface)',
              flexShrink: 0,
            }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span aria-hidden="true" style={{ fontSize: 34, color: settings.accentColor }}>
                ★
              </span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            {settings.matchday.trim().length > 0 || settings.date.trim().length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 26,
                    height: 3,
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${settings.accentColor}, color-mix(in srgb, ${settings.accentColor} 20%, transparent))`,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: d.kicker,
                    letterSpacing: 3,
                    color: settings.accentColor,
                    fontWeight: 700,
                  }}
                >
                  {formatKicker(settings.matchday, settings.date)}
                </p>
              </div>
            ) : null}
            <h1
              style={{
                margin: '2px 0 0',
                fontSize: d.title,
                lineHeight: 1.05,
                fontWeight: 800,
                fontFamily: displayFont,
                color: settings.textColor,
                textTransform: 'uppercase',
              }}
            >
              {truncate(settings.title.trim() || 'RESULTADOS', 34)}
            </h1>
          </div>
        </header>
        {/* Píldoras con totales */}
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <Pill
            label={i18n.pill.equipos}
            value={totals.teams}
            d={d}
            accent={settings.accentColor}
          />
          <Pill label={i18n.pill.salas} value={totals.rooms} d={d} accent={settings.accentColor} />
          <Pill label={i18n.pill.kills} value={totals.kills} d={d} accent={settings.accentColor} />
          <Pill
            label={i18n.pill.puntos}
            value={totals.points}
            d={d}
            accent={settings.accentColor}
          />
          <Pill
            label={i18n.pill.booyahs}
            value={totals.booyahs}
            d={d}
            accent={settings.accentColor}
          />
        </ul>
        {/* Podio: orden visual 2 – 1 – 3 */}
        <Podium standings={standings} settings={settings} d={d} displayFont={displayFont} />
        {/* Posiciones 4+ */}
        {standings.length > 3 && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <RowHeader d={d} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
              {standings.slice(3).map((standing, index) => (
                <StandingRow
                  key={standing.key}
                  standing={standing}
                  position={index + 4}
                  maxTotal={maxTotal}
                  d={d}
                  accent={settings.accentColor}
                />
              ))}
            </div>
          </div>
        )}
        {/* MVP */}
        {mvp.length > 0 && <MvpCards mvp={result.mvp} d={d} accent={settings.accentColor} />}
        {/* Pie */}
        <footer
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            fontSize: d.footer,
            color: 'var(--muted)',
            letterSpacing: 2,
            textTransform: 'uppercase',
            borderTop: '1px solid var(--border)',
            paddingTop: 10,
          }}
        >
          {' '}
          {settings.moderator.trim().length > 0 && (
            <span>{`${i18n.image.moderator} · ${truncate(settings.moderator.trim(), 30)}`}</span>
          )}
          <span>{`${i18n.brand} · ${i18n.image.booyah} × ${totals.booyahs}`}</span>
        </footer>
      </div>
    </div>
  );
}

function Ring({ style }: { style: CSSProperties }): ReactNode {
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: '50%',
        border: '2px solid color-mix(in srgb, var(--accent) 14%, transparent)',
        ...style,
      }}
    />
  );
}

function Pill({
  label,
  value,
  d,
  accent,
}: {
  label: string;
  value: number;
  d: Density;
  accent: string;
}): ReactNode {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 8,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '6px 16px',
        position: 'relative',
      }}
    >
      <span
        style={{
          fontSize: d.pillLabel,
          color: 'var(--muted)',
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{ fontSize: d.pillValue, fontWeight: 700, fontFamily: 'inherit', color: accent }}
      >
        {value}
      </span>
    </li>
  );
}

/** Podio adaptativo: 3 tarjetas en orden 2-1-3; 2 tarjetas si hay 2; 1 si hay 1. */
function Podium({
  standings,
  settings,
  d,
  displayFont,
}: {
  standings: TeamStanding[];
  settings: Settings;
  d: Density;
  displayFont: string;
}): ReactNode {
  const top = standings.slice(0, 3);
  if (top.length === 0) return null;

  const visualOrder = top.length === 3 ? [1, 0, 2] : top.length === 2 ? [1, 0] : [0];

  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        position: 'relative',
        alignItems: 'end',
        justifyContent: 'center',
      }}
    >
      {visualOrder.map((visualIndex) => {
        const standing = top[visualIndex];
        if (!standing) return null;
        const position = visualIndex === 0 ? 1 : visualIndex === 1 ? 2 : 3;
        const isFirst = position === 1;
        const accentColor = PODIUM_COLORS[position - 1] ?? 'var(--text-2)';

        return (
          <div
            key={standing.key}
            style={{
              flex: 1,
              maxWidth: top.length === 1 ? 360 : undefined,
              background: isFirst
                ? `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 16%, transparent), var(--surface-2) 62%)`
                : 'var(--surface)',
              border: `2px solid ${isFirst ? accentColor : 'var(--border)'}`,
              borderRadius: 14,
              padding: isFirst ? '16px 18px' : '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minHeight: isFirst ? d.podiumHeight : Math.round(d.podiumHeight * 0.82),
              boxShadow: isFirst
                ? `0 0 34px color-mix(in srgb, ${accentColor} 18%, transparent)`
                : undefined,
            }}
          >
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: accentColor,
                color: '#07100e',
                fontWeight: 800,
                fontSize: 22,
                fontFamily: displayFont,
              }}
            >
              {position}
            </span>
            <span
              title={standing.name}
              style={{
                fontSize: isFirst ? d.podiumName + 2 : d.podiumName,
                fontWeight: 700,
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {truncate(standing.name, isFirst ? 22 : 20)}
            </span>
            <span style={{ fontSize: d.rowName - 3, color: 'var(--text-2)' }}>
              {`${i18n.pill.kills} ${standing.kills} · ${i18n.image.booyah} ${standing.booyahs}`}
            </span>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span
                style={{
                  fontSize: isFirst ? d.podiumTotal1 : d.podiumTotalRest,
                  fontWeight: 800,
                  fontFamily: displayFont,
                  color: isFirst ? accentColor : settings.textColor,
                  lineHeight: 1,
                }}
              >
                {standing.total}
              </span>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: 4,
                  color: isFirst ? accentColor : 'var(--muted)',
                  textTransform: 'uppercase',
                }}
              >
                pts
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RowHeader({ d }: { d: Density }): ReactNode {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 76px 60px 70px 84px',
        gap: 10,
        fontSize: d.rowCols,
        color: 'var(--muted)',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
        padding: '0 12px',
      }}
    >
      <span>#</span>
      <span>Equipo</span>
      <span style={{ textAlign: 'right' }}>{i18n.image.killsLabel}</span>
      <span style={{ textAlign: 'right' }}>{i18n.image.bossLabel}</span>
      <span style={{ textAlign: 'right' }}>{i18n.image.rankLabel}</span>
      <span style={{ textAlign: 'right' }}>{i18n.image.totalLabel}</span>
    </div>
  );
}

const StandingRow = memo(function StandingRow({
  standing,
  position,
  maxTotal,
  d,
  accent,
}: {
  standing: TeamStanding;
  position: number;
  maxTotal: number;
  d: Density;
  accent: string;
}): ReactNode {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 76px 60px 70px 84px',
        gap: 10,
        alignItems: 'center',
        background: position % 2 === 0 ? 'var(--row-alt)' : 'var(--surface)',
        borderRadius: 10,
        padding: `${Math.round(d.rowHeight / 4)}px 12px`,
        minHeight: d.rowHeight,
      }}
    >
      <span style={{ fontSize: d.rowName, fontWeight: 700, color: 'var(--text-2)' }}>
        {position}
      </span>
      <div style={{ minWidth: 0 }}>
        <span
          title={standing.name}
          style={{
            display: 'block',
            fontSize: d.rowName,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {standing.name}
        </span>
        <div style={{ background: 'var(--track)', height: 5, borderRadius: 999, marginTop: 3 }}>
          <div
            style={{
              background: accent,
              height: '100%',
              borderRadius: 999,
              width: `${Math.max(4, Math.round((standing.total / maxTotal) * 100))}%`,
            }}
          />
        </div>
      </div>
      <span style={{ textAlign: 'right', fontSize: d.rowName, fontWeight: 700 }}>
        {standing.kills}
      </span>
      <span style={{ textAlign: 'right', fontSize: d.rowName, color: 'var(--text-2)' }}>
        {standing.booyahs}
      </span>
      <span style={{ textAlign: 'right', fontSize: d.rowName, color: 'var(--text-2)' }}>
        {standing.rankPoints}
      </span>
      <span style={{ textAlign: 'right', fontSize: d.rowName, fontWeight: 800 }}>
        {standing.total}
      </span>
    </div>
  );
});

function MvpCards({
  mvp,
  d,
  accent,
}: {
  mvp: EngineResult['mvp'];
  d: Density;
  accent: string;
}): ReactNode {
  if (d.mvpLine) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: d.mvpName,
          color: 'var(--text-2)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span
          style={{ color: PODIUM_COLORS[0], fontWeight: 800, letterSpacing: 1 }}
        >{`${i18n.image.mvp} `}</span>
        {mvp.map((player, index) => (
          <span key={player.id}>
            {index > 0 && ' · '}
            {`${truncate(player.name, 16)} ${player.kills}`}
          </span>
        ))}
      </p>
    );
  }

  return (
    <div>
      <p
        style={{
          margin: '0 0 6px',
          fontSize: 14,
          color: accent,
          letterSpacing: 2,
          fontWeight: 700,
        }}
      >
        {i18n.image.mvp}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {mvp.map((player, index) => {
          const color = PODIUM_COLORS[index] ?? 'var(--text-2)';
          return (
            <div
              key={player.id}
              style={{
                background: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderLeft: `4px solid ${color}`,
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: 54,
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: color,
                  color: '#07100e',
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {index + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <span
                  title={player.name}
                  style={{
                    display: 'block',
                    fontSize: d.mvpName,
                    fontWeight: 700,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncate(player.name, 18)}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 13,
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncate(player.teamName, 16)}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span style={{ display: 'block', fontSize: 26, fontWeight: 800 }}>
                  {player.kills}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 10,
                    letterSpacing: 2,
                    color: 'var(--muted)',
                  }}
                >
                  KILLS
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ResultImage = ResultImageComponent;
