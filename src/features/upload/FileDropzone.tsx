import { useCallback, useRef, useState } from 'react';
import type { DragEvent, ReactNode } from 'react';
import { i18n } from '../../i18n/es';

interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  children?: ReactNode;
}

/** Zona de arrastrar/soltar múltiple para logs de resultados (.txt/.log). */
export function FileDropzone({ onFiles, children }: FileDropzoneProps) {
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

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={[
        'rounded-xl border-2 border-dashed p-4 text-center transition-colors',
        dragging ? 'border-[var(--accent)] bg-[var(--surface-2)]' : 'border-[var(--border-strong)]',
      ].join(' ')}
    >
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
      <p className="text-sm font-medium">{i18n.upload.dropTitle}</p>
      <p className="mt-1 text-xs text-[var(--text-2)]">{i18n.upload.dropSubtitle}</p>
      <button
        type="button"
        onClick={openPicker}
        className="mt-3 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#07100e] hover:opacity-90"
      >
        {i18n.upload.chooseButton}
      </button>
      {children}
    </div>
  );
}
