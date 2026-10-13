import { i18n } from '../../../i18n/es';
import { truncateName } from '../../../core/viewmodel/format';
import type { Scene } from '../types';

/** Bloque MVP top 3 por kills (§4.4): cards | strip. */
export function MvpBlock({ scene }: { scene: Scene }) {
  const { vm, t, fonts, density, format } = scene;
  const mvp = vm.mvp.slice(0, 3);
  if (mvp.length === 0) return null;
  const colors = [t.accent2, t.silver, t.bronze];
  const compactLine = format === '1:1' || density !== 'comfortable';
  const nameSize = compactLine ? 16 : 19;

  if (scene.config.mvp === 'strip') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          minHeight: scene.geo.mvp,
          background: t.surface,
          border: `1px solid ${t.border}`,
          borderRadius: scene.config.radius,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 2,
            paddingLeft: 16,
            paddingRight: 18,
          }}
        >
          <span style={{ fontSize: 13, letterSpacing: 2.5, fontWeight: 700, color: t.accent }}>
            {i18n.image.mvp}
          </span>
          <span
            style={{
              fontSize: 10.5,
              letterSpacing: 2,
              color: t.muted,
              textTransform: 'uppercase',
            }}
          >
            {i18n.image.killsLabel}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex' }}>
          {mvp.map((player, index) => (
            <div
              key={player.id}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minWidth: 0,
                paddingLeft: 14,
                borderLeft: index === 0 ? 'none' : `1px solid ${t.border}`,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  flexShrink: 0,
                  borderRadius: scene.config.radius >= 14 ? '50%' : scene.config.radius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: colors[index] ?? t.text2,
                  color: t.bg,
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {index + 1}
              </span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <span
                  title={player.name}
                  style={{
                    display: 'block',
                    fontSize: nameSize,
                    fontWeight: 700,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateName(player.name, 14)}
                </span>
                <span
                  title={player.teamName}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: t.muted,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateName(player.teamName, 14)}
                </span>
              </div>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: fonts.display,
                  flexShrink: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {player.kills}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // `cards`: 3 tarjetas en fila (Corona).
  return (
    <div>
      {!compactLine && (
        <p
          style={{
            margin: '0 0 6px',
            fontSize: 14,
            color: t.accent,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          {i18n.image.mvp}
        </p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {mvp.map((player, index) => {
          const color = colors[index] ?? t.text2;
          return (
            <div
              key={player.id}
              style={{
                background: t.surface,
                border: `1px solid ${t.border}`,
                borderLeft: `4px solid ${color}`,
                borderRadius: scene.config.radius,
                padding: compactLine ? '6px 10px' : '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                minHeight: compactLine ? 60 : scene.geo.mvp - 22,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  borderRadius: scene.config.radius >= 14 ? '50%' : scene.config.radius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: color,
                  color: t.bg,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {index + 1}
              </span>
              <div style={{ minWidth: 0 }}>
                <span
                  title={player.name}
                  style={{
                    display: 'block',
                    fontSize: nameSize,
                    fontWeight: 700,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateName(player.name, 16)}
                </span>
                <span
                  title={player.teamName}
                  style={{
                    display: 'block',
                    fontSize: 12,
                    color: t.muted,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {truncateName(player.teamName, 15)}
                </span>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: compactLine ? 22 : 26,
                    fontWeight: 800,
                    fontFamily: fonts.display,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {player.kills}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: 10,
                    letterSpacing: 2,
                    color: t.muted,
                  }}
                >
                  {i18n.image.killsLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
