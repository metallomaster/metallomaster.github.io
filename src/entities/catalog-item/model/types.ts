import type { PictureSrc } from '@shared/ui/picture';

export type CatalogItemType = 'category' | 'product' | 'service';

export interface CatalogImage {
  src: PictureSrc;
  alt: string;
}

export interface CatalogItem {
  /** slug = имя старой страницы без .html; URL — /<slug>.html */
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

export function catalogItemUrl(item: Pick<CatalogItem, 'slug'>): string {
  return `/${item.slug}.html`;
}
