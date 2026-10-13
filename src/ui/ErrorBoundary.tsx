import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Boundary de errores raíz: un fallo no debe tumbar la app sin mensaje amable. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override componentDidCatch(_error: unknown, _info: ErrorInfo): void {
    // Sin crash silencioso: la UI se reemplaza por una pantalla amable (sin consola ruidosa por defecto).
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-dvh flex-col items-center justify-center gap-2 bg-[var(--bg)] px-6 text-center text-[var(--text)]"
        >
          <h1 className="text-[17px] leading-[22px] font-semibold">Algo salió mal</h1>
          <p className="text-sm text-[var(--text-2)]">
            Ocurrió un error inesperado. Recarga la página para volver a empezar.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
