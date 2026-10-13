import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { computeStandings } from '../core/engine/calculate';
import { parseLog } from '../core/parser/parseLog';
import { buildViewModel } from '../core/viewmodel/buildViewModel';
import { ResultImage } from '../features/templates/ResultImage';
import { TEMPLATES, heightForFormat } from '../features/templates/templates';
import { FONT_PAIRS, loadFontPair } from '../features/templates/fonts';
import sampleLogText from '../assets/sample_log.txt?raw';
import '../styles/tokens.css';
import '../styles/fonts.css';

/**
 * Hoja de contactos (TEMPLATESv2 §10 + FF §8): las 13 plantillas con el log de
 * muestra en 4:5 en una cuadrícula — para verificar de un golpe que son «la
 * misma familia» y que ninguna es solo un cambio de color de otra.
 */

const room = parseLog(sampleLogText, 'MatchResult_example_log.txt');
const rooms = [room];
const engineResult = computeStandings(rooms, {
  mode: 'standard',
  positionPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  killPoints: 1,
  tiebreak: ['kills', 'best-rank', 'booyahs'],
});
const vm = buildViewModel(engineResult, rooms, {
  title: 'COPA ESTELAR',
  matchday: '1',
  date: '2026-10-12',
  moderator: 'Moderador Final',
});

// Cargar los 13 pares para la hoja completa.
for (const pair of FONT_PAIRS) loadFontPair(pair.id);

const CARD_WIDTH = 360;

function App() {
  return (
    <div
      style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100dvh', padding: 24 }}
    >
      <h1 style={{ fontFamily: 'var(--font-ui)', marginTop: 0 }}>
        Hoja de contactos · {TEMPLATES.length} plantillas
      </h1>
      <p style={{ color: 'var(--text-2)', maxWidth: 720 }}>
        Log de muestra («COPA ESTELAR», jornada 1). Verifica: (a) todas se ven como la misma
        familia; (b) ninguna es solo un cambio de color de otra.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`,
          gap: 24,
        }}
      >
        {TEMPLATES.map((template) => {
          const height = heightForFormat('4:5');
          const scale = CARD_WIDTH / 1080;
          return (
            <figure key={template.id} style={{ margin: 0 }}>
              <div
                style={{
                  width: CARD_WIDTH,
                  height: height * scale,
                  overflow: 'hidden',
                  border: '1px solid var(--line-strong)',
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    width: 1080,
                    height,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  <ResultImage
                    vm={vm}
                    config={template}
                    style={{}}
                    assets={{}}
                    format="4:5"
                    width={1080}
                    height={height}
                  />
                </div>
              </div>
              <figcaption style={{ marginTop: 8, fontSize: 13 }}>
                <strong>{template.name}</strong>
                {' — '}
                <span style={{ color: 'var(--text-2)' }}>{template.blurb}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
