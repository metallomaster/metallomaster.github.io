/*
 * SEO: мета-теги и генераторы JSON-LD — чистые функции.
 * Вставка в <head> — задача src/components/templates/base-layout.astro.
 */

/** Хвост убран из H1 навсегда: бренд добавляется только в <title> */
const TITLE_SUFFIX = ' — METALLOMASTER';
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export interface PageSeo {
  /** Заголовок страницы без брендового хвоста */
  title: string;
  description: string;
  /** Путь страницы от корня, например "/catalog/chimney-caps/post-cap/" */
  path: string;
  /** Абсолютный или корневой URL картинки для Open Graph */
  ogImage?: string;
  /** Тип OG-объекта; по умолчанию website */
  ogType?: 'website' | 'article';
}

export function buildTitle(title: string): string {
  const full = `${title}${TITLE_SUFFIX}`;
  return full.length <= TITLE_MAX + TITLE_SUFFIX.length ? full : title;
}

export function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= DESCRIPTION_MAX) return clean;
  return `${clean.slice(0, DESCRIPTION_MAX - 1).replace(/\s+\S*$/, '')}…`;
}

export function canonicalUrl(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}

export interface OrganizationParams {
  name: string;
  legalName: string;
  url: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
}

export function organizationJsonLd(p: OrganizationParams): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${p.url}/#organization`,
    name: p.name,
    legalName: p.legalName,
    url: p.url,
    logo: p.logoUrl,
    image: p.logoUrl,
    telephone: p.phone,
    email: p.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BY',
      addressRegion: 'Минская область',
      addressLocality: 'аг. Колодищи',
      streetAddress: p.address,
    },
    sameAs: [p.instagram],
  };
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbsJsonLd(siteUrl: string, items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: new URL(item.path, siteUrl).toString(),
    })),
  };
}

export interface ProductParams {
  name: string;
  description: string;
  url: string;
  images: string[];
  brand: string;
}

/** Product без цены — изделия индивидуальные (решение владельца) */
export function productJsonLd(p: ProductParams): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    url: p.url,
    image: p.images,
    brand: { '@type': 'Brand', name: p.brand },
  };
}
