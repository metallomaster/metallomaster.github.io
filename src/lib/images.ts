/*
 * Параметры обработки изображений — чистые данные без единого вызова фреймворка.
 * Сами вызовы getImage живут в адаптерах: atoms/picture.astro, lib/content.ts
 * и templates/base-layout.astro.
 *
 * Важно: параметры одного пресета обязаны совпадать во всех местах вызова — тогда
 * фреймворк отдаёт один и тот же файл, а не плодит копии под каждый вызов.
 */

/** Полноразмер для лайтбокса и разметки: больше исходников всё равно нет (максимум 1920px) */
export const PHOTO_FULL = {
  width: 1600,
  format: 'webp',
  quality: 80,
} as const;

/** Превью в карточках и галереях */
export const PHOTO_THUMB_WIDTHS = [240, 360, 480, 720] as const;

/** Картинка для соцсетей: пропорция 1.91:1, JPEG — его понимают все мессенджеры */
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  format: 'jpeg',
  quality: 78,
  fit: 'cover',
  position: 'center',
} as const;

/** Ширины srcset: не запрашиваем больше, чем есть в исходнике — апскейл только раздувает вес */
export function fitWidths(widths: readonly number[], sourceWidth: number): number[] {
  const usable = widths.filter((w) => w <= sourceWidth);
  return usable.length > 0 ? usable : [sourceWidth];
}
