/*
 * SEO: мета-теги и генераторы JSON-LD — чистые функции.
 * Вставка в <head> — задача src/components/templates/base-layout.astro.
 */

import type { PictureSrc } from '@/lib/types';

/** Хвост убран из H1 навсегда: бренд добавляется только в <title> */
const TITLE_SUFFIX = ' — METALLOMASTER';
/** Дальше поисковики обрезают заголовок многоточием */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export interface PageSeo {
  /** Заголовок страницы без брендового хвоста */
  title: string;
  description: string;
  /** Путь страницы от корня, например "/catalog/chimney-caps/post-cap/" */
  path: string;
  /** Исходник картинки для Open Graph; шаблон сам пережмёт его под 1200×630 */
  ogImage?: PictureSrc;
  /** Тип OG-объекта; по умолчанию website */
  ogType?: 'website' | 'article';
}

/** Бренд добавляем, только если он поместится целиком: обрезанный хвост в выдаче бесполезен */
export function buildTitle(title: string): string {
  const full = `${title}${TITLE_SUFFIX}`;
  return full.length <= TITLE_MAX ? full : title;
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

export interface ImageParams {
  url: string;
  /** Подпись = осмысленный alt: по нему фото ранжируется в поиске по картинкам */
  caption: string;
  width?: number;
  height?: number;
}

/**
 * ImageObject — паспорт фотографии для поиска по картинкам.
 * Автор и лицензия свои: фото собственного производства.
 */
export function imageObjectJsonLd(image: ImageParams, siteUrl: string, author: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: image.url,
    url: image.url,
    caption: image.caption,
    ...(image.width ? { width: image.width } : {}),
    ...(image.height ? { height: image.height } : {}),
    creditText: author,
    creator: { '@type': 'Organization', name: author, '@id': `${siteUrl}/#organization` },
    copyrightNotice: author,
    license: siteUrl,
    acquireLicensePage: siteUrl,
  };
}

export interface ProductParams {
  name: string;
  description: string;
  url: string;
  images: ImageParams[];
  brand: string;
  siteUrl: string;
}

/** Product без цены — изделия индивидуальные (решение владельца) */
export function productJsonLd(p: ProductParams): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    url: p.url,
    image: p.images.map((image) => imageObjectJsonLd(image, p.siteUrl, p.brand)),
    brand: { '@type': 'Brand', name: p.brand },
  };
}
