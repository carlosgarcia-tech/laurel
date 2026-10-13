import { i18n } from '../../../i18n/es';
import { truncateName } from '../../../core/viewmodel/format';
import type { Scene } from '../types';

/** Pie (§1.1): MODERADOR · NOMBRE a la izquierda; producto, booyahs y paginación a la derecha. */
export function Footer({ scene }: { scene: Scene }) {
  const { vm, t } = scene;
  const moderator = vm.meta.moderator.trim();
  const part = scene.part ? `${i18n.image.part(scene.part.index, scene.part.total)}  ·  ` : '';
  return (
    <footer
      style={{
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        fontSize: scene.format === '9:16' ? 15 : 13,
        color: t.muted,
        letterSpacing: 2,
        textTransform: 'uppercase',
        borderTop: `1px solid ${t.border}`,
        paddingTop: 10,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
      }}
    >
      {moderator.length > 0 && (
        <span>{`${i18n.image.moderator} · ${truncateName(moderator, 28)}`}</span>
      )}
      <span>{`${part}${i18n.brand} · ${i18n.image.booyah} × ${vm.stats.booyahs}`}</span>
    </footer>
  );
}
