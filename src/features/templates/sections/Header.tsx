import { i18n } from '../../../i18n/es';
import { formatDateForKicker } from '../shared/dateFormat';
import { logoRadius } from '../tokens';
import type { Scene } from '../types';

function kickerText(scene: Scene): string {
  const { vm } = scene;
  return [
    vm.meta.matchday.trim().length > 0 ? `JORNADA ${vm.meta.matchday.trim()}` : '',
    vm.meta.date.trim().length > 0 ? formatDateForKicker(vm.meta.date) : '',
  ]
    .filter(Boolean)
    .join(' · ');
}

function StatsPills({ scene, displayFont }: { scene: Scene; displayFont: string }) {
  const { t, config, geo, density } = scene;
  if (geo.pillsH === 0) return null;
  return (
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
      {(
        [
          [i18n.pill.equipos, vmStats(scene).teams],
          [i18n.pill.salas, vmStats(scene).rooms],
          [i18n.pill.kills, vmStats(scene).kills],
          [i18n.pill.puntos, vmStats(scene).points],
          [i18n.pill.booyahs, vmStats(scene).booyahs],
        ] as Array<[string, number]>
      ).map(([label, value]) => (
        <li
          key={label}
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 8,
            background: t.surface,
            border: `1px solid ${t.border}`,
            borderRadius: config.radius >= 14 ? 999 : config.radius,
            padding: density === 'compact' ? '4px 12px' : '6px 16px',
          }}
        >
          <span
            style={{
              fontSize: 13,
              color: t.muted,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 20, fontWeight: 700, color: t.accent, fontFamily: displayFont }}>
            {value}
          </span>
        </li>
      ))}
    </ul>
  );
}

function vmStats(scene: Scene): Scene['vm']['stats'] {
  return scene.vm.stats;
}

function Logo({ scene, size }: { scene: Scene; size: number }) {
  const { t, config, assets } = scene;
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        ...logoRadius(config.radius),
        border: `2px solid ${t.borderStrong}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: t.surface,
      }}
    >
      {assets.logo ? (
        <img
          src={assets.logo}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <span
          aria-hidden="true"
          style={{ fontSize: size * 0.38, color: t.accent, fontWeight: 700 }}
        >
          ★
        </span>
      )}
    </div>
  );
}

function Title({ scene, size, align }: { scene: Scene; size: number; align: 'left' | 'center' }) {
  const { t, fonts, vm } = scene;
  return (
    <h1
      style={{
        margin: 0,
        fontSize: size,
        lineHeight: 1.05,
        fontWeight: 800,
        fontFamily: fonts.display,
        color: t.text,
        textAlign: align,
        textTransform: 'uppercase',
        overflowWrap: 'anywhere',
      }}
    >
      {vm.meta.title.trim().length > 0 ? vm.meta.title.trim() : 'RESULTADOS'}
    </h1>
  );
}

function Kicker({ scene, align }: { scene: Scene; align: 'left' | 'center' }) {
  const { t } = scene;
  return (
    <p
      style={{
        margin: 0,
        fontSize: 18,
        letterSpacing: 3,
        color: t.accent,
        fontWeight: 700,
        textAlign: align,
      }}
    >
      {kickerText(scene)}
    </p>
  );
}

/** Cabecera (§4.1): left | center | split | banner. Los píldoras se omiten en 1:1. */
export function Header({ scene }: { scene: Scene }) {
  const { config, fonts, geo } = scene;
  const showPills = geo.pillsH > 0;

  switch (config.header) {
    case 'left':
      return (
        <header style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Logo scene={scene} size={92} />
            <div style={{ minWidth: 0 }}>
              <Kicker scene={scene} align="left" />
              <Title scene={scene} size={scoreTitle(scene.format)} align="left" />
            </div>
          </div>
          {showPills && <StatsPills scene={scene} displayFont={fonts.display} />}
        </header>
      );

    case 'center':
      return (
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Logo scene={scene} size={88} />
          <Kicker scene={scene} align="center" />
          <Title scene={scene} size={scoreTitle(scene.format)} align="center" />
          {showPills && <StatsPills scene={scene} displayFont={fonts.display} />}
        </header>
      );

    case 'split': {
      const stats: Array<[string, number]> = [
        [i18n.pill.equipos, scene.vm.stats.teams],
        [i18n.pill.salas, scene.vm.stats.rooms],
        [i18n.pill.kills, scene.vm.stats.kills],
        [i18n.pill.puntos, scene.vm.stats.points],
      ];
      return (
        <header style={{ display: 'flex', alignItems: 'stretch', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flex: 1.1, minWidth: 0 }}>
            <Logo scene={scene} size={92} />
            <div style={{ minWidth: 0 }}>
              <Kicker scene={scene} align="left" />
              <Title scene={scene} size={48} align="left" />
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              flexShrink: 0,
              borderLeft: `1px solid ${scene.t.border}`,
              paddingLeft: 24,
            }}
          >
            {stats.map(([label, value]) => (
              <div key={label} style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontSize: 68,
                    fontWeight: 800,
                    fontFamily: fonts.display,
                    color: scene.t.accent,
                    lineHeight: 0.95,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 2.5,
                    textTransform: 'uppercase',
                    color: scene.t.muted,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </header>
      );
    }

    case 'banner': {
      const { onAccent } = scene.t;
      return (
        <header style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Kicker scene={scene} align="left" />
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 16 }}>
            <div style={{ alignSelf: 'center', zIndex: 1 }}>
              <Logo scene={scene} size={88} />
            </div>
            <div
              style={{
                flex: 1,
                background: scene.t.accent,
                borderRadius: config.radius,
                display: 'flex',
                alignItems: 'center',
                padding: '0 28px',
              }}
            >
              <span
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 800,
                  fontSize: 46,
                  lineHeight: 1.05,
                  color: onAccent,
                  textTransform: 'uppercase',
                  overflowWrap: 'anywhere',
                }}
              >
                {scene.vm.meta.title.trim().length > 0 ? scene.vm.meta.title.trim() : 'RESULTADOS'}
              </span>
            </div>
          </div>
          {showPills && <StatsPills scene={scene} displayFont={fonts.display} />}
        </header>
      );
    }
  }
}

/** Tamaño de título con la caída correspondiente por formato. */
function scoreTitle(format: Scene['format']): number {
  if (format === '9:16') return 58;
  if (format === '1:1') return 40;
  return 52;
}
