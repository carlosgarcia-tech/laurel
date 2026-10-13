import { i18n } from './i18n/es';

/**
 * Placeholder de fase 1: el núcleo (parser + motor) está listo y probado.
 * La interfaz del editor (fase 2) reemplazará este contenido completo.
 */
function App() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--font-body)',
        padding: 24,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 32,
          maxWidth: 640,
        }}
      >
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, margin: 0 }}>
          {i18n.brand}
        </h1>
        <p style={{ color: 'var(--text-2)', marginTop: 8, marginBottom: 0 }}>
          {i18n.tagline} — {i18n.phase1Placeholder}
        </p>
      </div>
    </main>
  );
}

export default App;
