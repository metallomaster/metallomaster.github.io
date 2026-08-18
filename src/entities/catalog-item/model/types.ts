import type { PictureSrc } from '@shared/ui/picture';

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
