import type { CSSProperties } from 'react';
import { i18n } from '../../../i18n/es';
import { positionLabel, transparentize } from '../tokens';
import { truncateName } from '../../../core/viewmodel/format';
import type { Scene, StandingRow } from '../types';

/** Colores de posiciones: 1.º accent2, 2.º plata, 3.º bronce (§4.2). */
function podiumColors(scene: Scene): [string, string, string] {
  return [scene.t.accent2, scene.t.silver, scene.t.bronze];
}

interface CardArgs {
  scene: Scene;
  row: StandingRow;
  position: number;
  nameSize: number;
  totalSize: number;
  minHeight: number;
  highlight: boolean;
  /** Delay del revelado (solo preview del editor; TEMPLATES-FREEFIRE §6.2). */
  revealDelay?: number;
  style?: CSSProperties;
}

/** Tarjeta base del podio: posición + nombre + kills · booyahs + puntos. */
function PodiumCard({
  scene,
  row,
  position,
  nameSize,
  totalSize,
  minHeight,
  highlight,
  revealDelay,
  style,
}: CardArgs) {
  const { t, config, fonts } = scene;
  const colors = podiumColors(scene);
  const color = colors[position - 1] ?? t.text2;
  // Sello BOOYAH ×N (FF §3.3): solo en Booyah, solo el 1.º, solo con booyahs reales.
  const seal = config.id === 'booyah' && position === 1 && row.booyahs > 0;
  return (
    <div
      className={revealDelay !== undefined ? 'podium-reveal' : undefined}
      style={{
        flex: 1,
        background: highlight
          ? `linear-gradient(180deg, ${transparentize(color, 0.16)}, transparent 62%), ${t.surface}`
          : t.surface,
        border: `2px solid ${highlight ? color : t.border}`,
        borderRadius: config.radius,
        padding: highlight ? '16px 18px' : '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        minHeight,
        minWidth: 0,
        ...(revealDelay !== undefined ? { animationDelay: `${revealDelay}ms` } : null),
        ...style,
      }}
    >
      <span
        style={{
          width: highlight ? 46 : 38,
          height: highlight ? 46 : 38,
          borderRadius: config.radius >= 14 ? '50%' : config.radius,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: color,
          color: t.bg,
          fontWeight: 800,
          fontSize: highlight ? 22 : 18,
          fontFamily: fonts.display,
        }}
      >
        {positionLabel(config.numerals, position, true)}
      </span>
      <span
        title={row.name}
        style={{
          fontSize: nameSize,
          fontWeight: 700,
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {truncateName(row.name, highlight ? 20 : 18)}
      </span>
      <span style={{ fontSize: 13, color: t.text2 }}>
        {`${i18n.pill.kills} ${row.kills} · ${i18n.image.booyah} ${row.booyahs}`}
      </span>
      {seal && (
        <span
          style={{
            border: `2px solid ${t.accent2}`,
            borderRadius: config.radius,
            color: t.accent2,
            fontFamily: fonts.display,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 2,
            lineHeight: 1,
            padding: '5px 10px',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {`${i18n.image.booyah} ×${row.booyahs}`}
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <span
          style={{
            fontSize: totalSize,
            fontWeight: 800,
            fontFamily: fonts.display,
            color: highlight ? color : t.text,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {row.total}
        </span>
        <span
          style={{
            fontSize: 11,
            letterSpacing: 4,
            color: highlight ? color : t.muted,
            textTransform: 'uppercase',
          }}
        >
          pts
        </span>
      </div>
    </div>
  );
}

/** Podio (§4.2): stepped (2·1·3) | row (1·2·3) | hero (1 grande + 2 apilados). */
export function Podium({ scene }: { scene: Scene }) {
  const { vm, geo, format } = scene;
  const podium = vm.podium;
  if (podium.length === 0) return null;
  const flexShrink = (format === '1:1' ? 0.72 : 0.94) as number;
  const total = geo.podium;
  const hero = total;
  const rowH = Math.round(total * 0.74);

  const visualOrder = podium.length === 3 ? [1, 0, 2] : podium.length === 2 ? [1, 0] : [0];

  switch (scene.config.podium) {
    case 'stepped': {
      const heights =
        podium.length === 3
          ? [Math.round(total * 0.79), total, Math.round(total * 0.67)]
          : [total, Math.round(total * 0.8)];
      return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'end', justifyContent: 'center' }}>
          {visualOrder.map((visualIndex, i) => {
            const row = podium[visualIndex];
            if (!row) return null;
            const position = visualIndex === 0 ? 1 : visualIndex === 1 ? 2 : 3;
            return (
              <PodiumCard
                key={row.key}
                scene={scene}
                row={row}
                position={position}
                nameSize={position === 1 ? 26 : 22}
                totalSize={position === 1 ? 54 : 38}
                minHeight={(heights[i] ?? total) * flexShrink}
                highlight={position === 1}
                revealDelay={scene.reveal ? (position - 1) * 40 : undefined}
              />
            );
          })}
        </div>
      );
    }
    case 'row':
      // Orden 1·2·3, misma altura; el 1.º más ancho y con borde accent2.
      return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          {[0, 1, 2].map((index) => {
            const row = podium[index];
            if (!row) return null;
            return (
              <PodiumCard
                key={row.key}
                scene={scene}
                row={row}
                position={index + 1}
                nameSize={index === 0 ? 24 : 20}
                totalSize={index === 0 ? 46 : 34}
                minHeight={rowH * flexShrink}
                highlight={index === 0}
                revealDelay={scene.reveal ? index * 40 : undefined}
                style={index === 0 ? { flex: 1.4 } : undefined}
              />
            );
          })}
        </div>
      );
    case 'hero': {
      // 1.º: tarjeta grande a la izquierda (52 %, alto completo).
      const first = podium[0];
      if (!first) return null;
      const rest = podium.slice(1, 3);
      return (
        <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
          <PodiumCard
            scene={scene}
            row={first}
            position={1}
            nameSize={30}
            totalSize={88}
            minHeight={hero}
            highlight={true}
            revealDelay={scene.reveal ? 0 : undefined}
            style={{ flex: 1.08 }}
          />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              minWidth: 0,
            }}
          >
            {rest.map((row, i) => (
              <PodiumCard
                key={row.key}
                scene={scene}
                row={row}
                position={i + 2}
                nameSize={19}
                totalSize={30}
                minHeight={Math.round((hero - 12 * (rest.length - 1)) / Math.max(1, rest.length))}
                highlight={false}
                revealDelay={scene.reveal ? (i + 1) * 40 : undefined}
                style={{ flex: 1 }}
              />
            ))}
          </div>
        </div>
      );
    }
  }
}
