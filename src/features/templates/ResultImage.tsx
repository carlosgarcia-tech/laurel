import type { CSSProperties, ReactElement } from 'react';
import { densityFor, GEOMETRY } from './templates';
import { deriveTokens } from './tokens';
import { getFontPair, bodyFontStack, displayFontStack } from './fonts';
import { Decor } from './sections/Decor';
import { Header } from './sections/Header';
import { Podium } from './sections/Podium';
import { StandingsList } from './sections/StandingsList';
import { MvpBlock } from './sections/MvpBlock';
import { Footer } from './sections/Footer';
import type { Scene, TemplateProps } from './types';

/**
 * El ÚNICO componente que dibuja la imagen (TEMPLATESv2 §2):
 * Decor → Header → (MVP si before-list) → Podium → StandingsList →
 * (MVP si after-list) → Footer. Agregar plantilla = agregar config, no código.
 */
export function ResultImage({
  vm,
  config,
  style,
  assets,
  format,
  width,
  height,
}: TemplateProps): ReactElement {
  const geo = GEOMETRY[format];
  const t = deriveTokens(config, style);
  const fontPair = getFontPair(style.fontPairId ?? config.fontPairId);
  const fonts = {
    display: displayFontStack(fontPair.display),
    body: bodyFontStack(fontPair.body),
  };

  // Densidad + paginación (density multi → «Parte 1/2»): se recorta la lista.
  const rawDensity = densityFor(vm.standings.length);
  const capacity = Math.max(1, rawDensity === 'comfortable' ? geo.rows : geo.rowsCompact);
  const totalRest = vm.standings.length - Math.min(3, vm.standings.length);

  let listRows = vm.rest;
  let part: Scene['part'];
  if (rawDensity === 'multi' && totalRest > capacity) {
    listRows = vm.rest.slice(0, capacity);
    part = { index: 1, total: Math.ceil(totalRest / capacity) };
  }

  const scene: Scene = {
    vm,
    config,
    t,
    fonts,
    assets,
    format,
    geo,
    density: rawDensity,
    listRows,
    part,
  };

  const rootStyle: CSSProperties = {
    width,
    height,
    backgroundColor: t.bg,
    color: t.text,
    fontFamily: fonts.body,
    padding: `${geo.padY}px ${geo.padX}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: geo.gap,
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  return (
    <div style={rootStyle}>
      {/* Fondo propio (con scrim horneado por el procesador) por detrás de todo. */}
      {assets.background && (
        <img
          src={assets.background}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}
      <Decor scene={scene} />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: geo.gap,
          height: '100%',
        }}
      >
        <Header scene={scene} />
        {config.mvpPlacement === 'before-list' && <MvpBlock scene={scene} />}
        <Podium scene={scene} />
        <StandingsList scene={scene} />
        {config.mvpPlacement === 'after-list' && <MvpBlock scene={scene} />}
        <Footer scene={scene} />
      </div>
    </div>
  );
}
