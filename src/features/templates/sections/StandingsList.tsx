import { i18n } from '../../../i18n/es';
import { truncateName } from '../../../core/viewmodel/format';
import { positionLabel } from '../tokens';
import type { Scene, StandingRow } from '../types';
import { transparentize } from '../tokens';

const nameLimit = (density: Pick<Scene, 'density'>['density']): number =>
  density === 'comfortable' ? 24 : 20;

/** Fila `bars` (Corona): columnas completas + barra proporcional al líder. */
function BarsRow({ scene, row }: { scene: Scene; row: StandingRow }) {
  const { t, geo, density } = scene;
  const rowH = density === 'comfortable' ? geo.rowH : geo.rowHCompact;
  const fontSize = density === 'comfortable' ? 19 : 16;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 74px 58px 68px 84px',
        gap: 10,
        alignItems: 'center',
        background: row.position % 2 === 0 ? t.rowAlt : t.surface,
        borderRadius: scene.config.radius,
        padding: '0 12px',
        minHeight: rowH,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color: t.text2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {positionLabel(scene.config.numerals, row.position)}
      </span>
      <div style={{ minWidth: 0 }}>
        <span
          title={row.name}
          style={{
            display: 'block',
            fontSize,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {truncateName(row.name, nameLimit(scene.density))}
        </span>
        <div
          style={{
            background: transparentize(t.track, 0.9) === t.track ? t.track : t.track,
            height: 5,
            borderRadius: scene.config.radius >= 14 ? 999 : Math.min(3, scene.config.radius),
            marginTop: 3,
          }}
        >
          <div
            style={{
              background: t.accent,
              height: '100%',
              borderRadius: 999,
              width: `${Math.max(4, Math.round(row.shareOfLeader * 100))}%`,
            }}
          />
        </div>
      </div>
      <span
        style={{
          textAlign: 'right',
          fontSize,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.kills}
      </span>
      <span
        style={{ textAlign: 'right', fontSize, color: t.text2, fontVariantNumeric: 'tabular-nums' }}
      >
        {row.booyahs}
      </span>
      <span
        style={{ textAlign: 'right', fontSize, color: t.text2, fontVariantNumeric: 'tabular-nums' }}
      >
        {row.rankPoints}
      </span>
      <span
        style={{
          textAlign: 'right',
          fontSize,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.total}
      </span>
    </div>
  );
}

/** Fila `dots`: # EQUIPO ··········· TOTAL, con K/B/R pequeñas a la derecha del nombre. */
function DotsRow({ scene, row }: { scene: Scene; row: StandingRow }) {
  const { t, geo, density, fonts } = scene;
  const rowH = Math.round((density === 'comfortable' ? geo.rowH : geo.rowHCompact) * 0.92);
  const fontSize = density === 'comfortable' ? 19 : 16;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: rowH,
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <span
        style={{
          width: 44,
          flexShrink: 0,
          fontSize,
          fontWeight: 700,
          color: t.text2,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {positionLabel(scene.config.numerals, row.position)}
      </span>
      <span
        title={row.name}
        style={{
          fontSize,
          fontWeight: 700,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {truncateName(row.name, nameLimit(scene.density))}
      </span>
      <span
        style={{ fontSize: 13, color: t.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {`K ${row.kills} · B ${row.booyahs} · R ${row.rankPoints}`}
      </span>
      <span
        aria-hidden="true"
        style={{
          flex: 1,
          minWidth: 24,
          borderBottom: `2px dotted ${t.muted}`,
          opacity: 0.55,
        }}
      />
      <span
        style={{
          fontSize,
          fontWeight: 800,
          fontFamily: fonts.display,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.total}
      </span>
    </div>
  );
}

/** Fila `chips`: posición en chip, nombre con barra fina debajo, totales a la derecha. */
function ChipsRow({ scene, row }: { scene: Scene; row: StandingRow }) {
  const { t, geo, density } = scene;
  const rowH = density === 'comfortable' ? geo.rowH : geo.rowHCompact;
  const fontSize = density === 'comfortable' ? 19 : 16;
  const chipFill = row.position <= 5;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr 74px 58px 68px 84px',
        gap: 10,
        alignItems: 'center',
        background: row.position % 2 === 0 ? t.rowAlt : t.surface,
        borderRadius: scene.config.radius,
        padding: '0 12px',
        minHeight: rowH,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 34,
          background: chipFill ? t.accent : 'transparent',
          border: chipFill ? 'none' : `1.5px solid ${t.borderStrong}`,
          borderRadius: scene.config.radius,
          color: chipFill ? t.onAccent : t.text2,
          fontWeight: 800,
          fontSize,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {positionLabel(scene.config.numerals, row.position)}
      </span>
      <div style={{ minWidth: 0 }}>
        <span
          title={row.name}
          style={{
            display: 'block',
            fontSize,
            fontWeight: 600,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {truncateName(row.name, nameLimit(scene.density))}
        </span>
        <div style={{ height: 4, borderRadius: 999, background: t.track, marginTop: 4 }}>
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              background: row.position <= 5 ? t.accent : t.muted,
              width: `${Math.max(4, Math.round(row.shareOfLeader * 100))}%`,
            }}
          />
        </div>
      </div>
      <span
        style={{
          textAlign: 'right',
          fontSize,
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.kills}
      </span>
      <span
        style={{ textAlign: 'right', fontSize, color: t.text2, fontVariantNumeric: 'tabular-nums' }}
      >
        {row.booyahs}
      </span>
      <span
        style={{ textAlign: 'right', fontSize, color: t.text2, fontVariantNumeric: 'tabular-nums' }}
      >
        {row.rankPoints}
      </span>
      <span
        style={{
          textAlign: 'right',
          fontSize,
          fontWeight: 800,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {row.total}
      </span>
    </div>
  );
}

/** Lista 4+ (§4.3): bars | dots | chips, con encabezado y fila por variante. */
export function StandingsList({ scene }: { scene: Scene }) {
  const { listRows, t, density, format } = scene;
  if (listRows.length === 0) return null;
  const fontSize = density === 'comfortable' ? 16 : 13;
  const gap = density === 'comfortable' ? 6 : 4;

  const head =
    scene.config.list === 'dots' ? null : (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            scene.config.list === 'chips'
              ? '56px 1fr 74px 58px 68px 84px'
              : '44px 1fr 74px 58px 68px 84px',
          gap: 10,
          fontSize,
          color: t.muted,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, flex: 1, minHeight: 0 }}>
      {head}
      {listRows.map((row) =>
        scene.config.list === 'bars' ? (
          <BarsRow key={row.key} scene={scene} row={row} />
        ) : scene.config.list === 'dots' ? (
          <DotsRow key={row.key} scene={scene} row={row} />
        ) : (
          <ChipsRow key={row.key} scene={scene} row={row} />
        ),
      )}
      {format === '9:16' && <span aria-hidden="true" style={{ flex: 1 }} />}
    </div>
  );
}
