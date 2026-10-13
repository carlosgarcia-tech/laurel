# Plans — improve-animations (Laurel)

Auditoría hecha con la skill `improve-animations` (Emil Kowalski) sobre el commit `8a07b83`.
El editor casi no tenía motion (2 `transition-colors`); los planes lo añaden con restricción.

| #   | Plan                                                                                        | Severidad | Status |
| --- | ------------------------------------------------------------------------------------------- | --------- | ------ |
| 001 | [Motion tokens + press feedback + reduced-motion base](001-motion-tokens-press-feedback.md) | HIGH      | DONE   |
| 002 | [Status notices: auto-dismiss + fade in/out](002-notice-auto-dismiss-fade.md)               | MEDIUM    | DONE   |
| 003 | [Preview crossfade on template/format change](003-preview-crossfade.md)                     | MEDIUM    | DONE   |
| 004 | [File list row entrance](004-file-list-entrance.md)                                         | LOW       | DONE   |

## Orden de ejecución

1. **001** (define `--ease-out` / `--ease-in-out` y `.pressable`; todo lo demás depende del token).
2. **002** (notices; requiere `--ease-out`).
3. **003** (fade de preview; requiere `--ease-out`).
4. **004** (filas de archivos; requiere `--ease-out`).

No hay dependencias entre 002/003/004 más allá de 001; pueden ir en cualquier orden tras 001.

## Candidatos rechazados (restricción, no deuda)

- Hover con `scale` en tarjetas de la galería (falso hover táctil, elemento de alta frecuencia).
- Stagger de entrada de los pasos al cargar (decorativo, ruido de arranque).
- Animar la selección del formato 4:5/9:16/1:1 (acción frecuente → debe ser instantánea).
- Cualquier motion dentro de la imagen exportada (es un PNG estático por diseño).
