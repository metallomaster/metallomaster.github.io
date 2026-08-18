/*
 * Общие типы предметной области. Чистый TS: единственный фреймворк-импорт —
 * type-only ImageMetadata (исключение, см. eslint.config.js), остальной код
 * зависит только от нейтрального имени PictureSrc.
 */
// Исключение: type-only импорт из astro разрешён только здесь (см. eslint.config.js)
import type { ImageMetadata } from 'astro';

/** Нейтральное имя для метаданных картинки */
export type PictureSrc = ImageMetadata;

/** Хлебная крошка */
export interface Crumb {
  label: string;
  /** Последняя крошка — без ссылки */
  href?: string;
}

export type CatalogItemType = 'category' | 'product' | 'service';

export interface CatalogImage {
  src: PictureSrc;
  alt: string;
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
