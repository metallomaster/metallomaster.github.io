/*
 * Общие типы предметной области. Чистый TS: единственный фреймворк-импорт —
 * type-only ImageMetadata (исключение, см. eslint.config.js), остальной код
 * зависит только от нейтрального имени PictureSrc.
 */
// Исключение: type-only импорт из astro разрешён только здесь (см. eslint.config.js)
import type { ImageMetadata } from 'astro';

/** Нейтральное имя для метаданных картинки */
export type PictureSrc = ImageMetadata;

export type CatalogItemType = 'category' | 'product' | 'service';

export interface CatalogImage {
  src: PictureSrc;
  alt: string;
  /** URL полноразмерной версии: её открывает лайтбокс и на неё ссылается разметка */
  full: string;
}

export interface CatalogItem {
  /** slug = последний сегмент URL страницы (id записи в content/catalog) */
  slug: string;
  type: CatalogItemType;
  title: string;
  navTitle: string;
  seoTitle: string;
  description: string;
  lead: string;
  category?: string;
  order: number;
  /** Порядок в витрине каталога и на главной; не задан — берём order */
  featuredOrder?: number;
  featured: boolean;
  cover?: CatalogImage;
  images: CatalogImage[];
}

/** Вложенный URL элемента каталога, всегда с завершающим слешем */
export function catalogItemUrl(item: Pick<CatalogItem, 'slug' | 'type' | 'category'>): string {
  switch (item.type) {
    case 'service':
      return `/services/${item.slug}/`;
    case 'product':
      return `/catalog/${item.category}/${item.slug}/`;
    default:
      return `/catalog/${item.slug}/`;
  }
}
