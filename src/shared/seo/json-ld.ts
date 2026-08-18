/*
 * Генераторы JSON-LD — чистые функции, возвращают объекты.
 * Вставка в <head> — задача app/layouts.
 */

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
