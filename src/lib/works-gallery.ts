/*
 * Плитка работ: раскладка кадров разными размерами и автопрокрутка поверх
 * обычного scroll-контейнера. Лента едет в одну сторону до конца, затем
 * обратно — маятником. Ручная прокрутка (палец, трекпад, стрелки) остаётся
 * нативной и всегда важнее автоматической: стоит взяться за ленту, и движение
 * уступает человеку. Сами клетки грида — CSS в organisms/works-gallery.astro.
 */
import type { CatalogImage } from '@/lib/types';

/** Ниже этого числа кадров плитка не набирается — показываем обычную сетку */
export const TILE_MIN_IMAGES = 12;

/** Место плитки в гриде: 1×1, 2×1, 1×2 и 2×2 клетки */
export type TileSize = 'unit' | 'wide' | 'tall' | 'big';

export interface TileLayout {
  image: CatalogImage;
  /** Размер на узком экране, где у плитки две строки */
  sm: TileSize;
  /** Размер от 768px, где строк три */
  lg: TileSize;
}

/*
 * Блоки, из которых собирается плитка. Каждый заполняет свои столбцы целиком,
 * поэтому пустых клеток не остаётся, а порядок блоков случайный — рисунок
 * не читается как повтор.
 */
const TWO_ROW_BLOCKS: readonly TileSize[][] = [
  ['big'],
  ['tall'],
  ['unit', 'unit'],
  ['wide', 'wide'],
  ['wide', 'unit', 'unit'],
];

const THREE_ROW_BLOCKS: readonly TileSize[][] = [
  ['big', 'unit', 'unit'],
  ['big', 'wide'],
  ['tall', 'unit'],
  ['unit', 'tall'],
  ['unit', 'unit', 'unit'],
  ['wide', 'unit', 'unit', 'tall'],
  ['wide', 'unit', 'unit', 'unit', 'unit'],
];

export function buildTiles(images: CatalogImage[]): TileLayout[] {
  const seed = seedOf(images);
  const sm = pickBlocks(images.length, TWO_ROW_BLOCKS, seed);
  // Второй поток сеем иначе, чтобы раскладки на два и три ряда не совпадали
  const lg = pickBlocks(images.length, THREE_ROW_BLOCKS, seed ^ 0x9e3779b9);

  return images.map((image, index) => ({
    image,
    sm: sm[index] ?? 'unit',
    lg: lg[index] ?? 'unit',
  }));
}

function pickBlocks(count: number, blocks: readonly TileSize[][], seed: number): TileSize[] {
  const random = randomFrom(seed);
  const sizes: TileSize[] = [];
  let last = -1;

  while (sizes.length < count) {
    const room = count - sizes.length;
    // В остатке не должно оставаться одного кадра — он даст неполный столбец
    const fitting = blocks.filter((block) => block.length <= room && room - block.length !== 1);
    // Блок подряд не повторяем: два одинаковых рядом сразу выдают закономерность.
    // Но если выбора нет, повтор лучше дырки в плитке
    const fresh = fitting.filter((block) => blocks.indexOf(block) !== last);
    const pool = fresh.length > 0 ? fresh : fitting;
    const block = pool[Math.floor(random() * pool.length)] ?? ['unit'];
    last = blocks.indexOf(block);
    sizes.push(...block);
  }

  return sizes;
}

/** Раскладка обязана быть одинаковой при каждой сборке — сеем от самих кадров */
function seedOf(images: CatalogImage[]): number {
  let hash = images.length;
  for (const image of images) {
    for (let at = 0; at < image.alt.length; at += 1) {
      hash = (Math.imul(hash, 31) + image.alt.charCodeAt(at)) | 0;
    }
  }
  return hash >>> 0;
}

/** mulberry32: короткий генератор с воспроизводимой последовательностью */
function randomFrom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Скорость проезда, px/с: медленно, чтобы кадры читались, а не мелькали */
const SPEED = 36;

/** Пауза после прокрутки руками, мс */
const RESUME_DELAY = 4000;

/** Кадр длиннее этого — вкладка была в фоне, такой промежуток не отматываем */
const MAX_FRAME = 0.1;

export function initWorksGallery(root: HTMLElement): void {
  // Кому движение мешает — остаётся та же плитка, только прокрутка вручную
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  for (const track of root.querySelectorAll<HTMLElement>('[data-works-track]')) {
    driveTrack(track);
  }
}

function driveTrack(track: HTMLElement): void {
  let position = track.scrollLeft;
  let direction = 1;
  /** Курсор на плитке или фокус внутри — стоим, пока не уйдут */
  let holdByUser = false;
  /** Прокрутили руками — стоим до этого времени */
  let holdUntil = 0;
  let previous = 0;
  let frame = 0;

  const step = (time: number): void => {
    const delta = previous > 0 ? (time - previous) / 1000 : 0;
    previous = time;
    const limit = track.scrollWidth - track.clientWidth;
    const waiting = holdByUser || time < holdUntil;

    if (waiting || limit <= 0 || delta <= 0 || delta > MAX_FRAME) {
      // Пока стоим, следим за позицией: её мог сдвинуть человек
      position = track.scrollLeft;
    } else {
      // Позицию мог сдвинуть кто-то ещё — нативная инерция, фокус, скроллбар
      if (Math.abs(track.scrollLeft - position) > 2) position = track.scrollLeft;

      position += direction * SPEED * delta;
      if (position <= 0) {
        position = 0;
        direction = 1;
      } else if (position >= limit) {
        position = limit;
        direction = -1;
      }
      track.scrollLeft = position;
    }

    frame = requestAnimationFrame(step);
  };

  const start = (): void => {
    if (frame > 0) return;
    previous = 0;
    frame = requestAnimationFrame(step);
  };

  const stop = (): void => {
    if (frame === 0) return;
    cancelAnimationFrame(frame);
    frame = 0;
  };

  track.addEventListener('mouseenter', () => {
    holdByUser = true;
  });
  track.addEventListener('mouseleave', () => {
    holdByUser = false;
  });
  track.addEventListener('focusin', () => {
    holdByUser = true;
  });
  track.addEventListener('focusout', () => {
    holdByUser = false;
  });

  const holdAWhile = (): void => {
    holdUntil = performance.now() + RESUME_DELAY;
  };
  for (const event of ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown'] as const) {
    track.addEventListener(event, holdAWhile, { passive: true });
  }

  // За экраном не крутим кадры впустую
  new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) start();
    else stop();
  }).observe(track);
}
