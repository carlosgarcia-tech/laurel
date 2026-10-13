import { useCallback, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { i18n } from '../../i18n/es';

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}

/**
 * Zona de logs (UI-REDESIGN §5.2): filete punteado de 1 px, 96 px de alto,
 * sin icono grande. Con archivos cargados se reduce a «Añadir más».
 */
export function FileDropzone({ onFiles, compact = false }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      onFiles([...event.dataTransfer.files]);
    },
    [onFiles],
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept=".txt,.log,.log1,.log.txt"
      multiple
      className="sr-only"
      id="dropzone-input"
      onChange={(e) => {
        onFiles([...(e.target.files ?? [])]);
        e.target.value = '';
      }}
    />
  );

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {input}
        <button type="button" onClick={openPicker} className="btn-text text-[13px]">
          {i18n.upload.addMore}
        </button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={i18n.upload.dropHint}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openPicker();
        }
      }}
      className={[
        'flex h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-[2px] border border-dashed px-4 text-center transition-colors',
        dragging
          ? 'border-[var(--accent)]'
          : 'border-[var(--line-strong)] hover:border-[var(--text-3)]',
      ].join(' ')}
      onClick={openPicker}
    >
      {input}
      <p className="text-sm text-[var(--text-2)]">{i18n.upload.dropHint}</p>
      <button type="button" onClick={openPicker} className="btn-text text-[13px]">
        {i18n.upload.choose}
      </button>
    </div>
  );
}
