import { useCallback, useState } from 'react';
import type { RoomSource } from '../../core/types';
import { parseLog } from '../../core/parser/parseLog';
import { checkResultFile } from '../../core/validation';
import { readLogText } from './readLog';

export interface UploadNotice {
  id: string;
  fileName: string;
  message: string;
}

let counter = 0;
function nextId(): string {
  counter += 1;
  return `room-${counter}-${Date.now()}`;
}

/** Procesa archivos nuevos en batch; cada archivo fallido produce una notificación, no un crash. */
export function useUploadedRooms(): {
  rooms: RoomSource[];
  notices: UploadNotice[];
  addFiles: (files: File[]) => Promise<void>;
  removeRoom: (id: string) => void;
  clearNotices: () => void;
  dismissNotice: (id: string) => void;
  setRooms: React.Dispatch<React.SetStateAction<RoomSource[]>>;
} {
  const [rooms, setRooms] = useState<RoomSource[]>([]);
  const [notices, setNotices] = useState<UploadNotice[]>([]);

  const addFiles = useCallback(async (files: File[]) => {
    const nextNotices: UploadNotice[] = [];
    const accepted: RoomSource[] = [];
    for (const file of files) {
      const check = checkResultFile(file.name, file.size);
      if (!check.ok) {
        nextNotices.push({
          id: nextId(),
          fileName: file.name,
          message: check.error ?? 'Archivo no válido.',
        });
        continue;
      }
      try {
        const text = await readLogText(file);
        accepted.push({
          id: nextId(),
          fileName: file.name,
          sizeBytes: file.size,
          room: parseLog(text, file.name),
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Error desconocido.';
        nextNotices.push({
          id: nextId(),
          fileName: file.name,
          message: `No se pudo leer: ${message}`,
        });
      }
    }
    if (accepted.length > 0) setRooms((current) => [...current, ...accepted]);
    if (nextNotices.length > 0) setNotices((current) => [...current, ...nextNotices]);
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms((current) => current.filter((source) => source.id !== id));
  }, []);

  const clearNotices = useCallback(() => setNotices([]), []);
  const dismissNotice = useCallback((id: string) => {
    setNotices((current) => current.filter((notice) => notice.id !== id));
  }, []);

  return { rooms, notices, addFiles, removeRoom, clearNotices, dismissNotice, setRooms };
}
