/*
 * SEO: мета-теги и генераторы JSON-LD — чистые функции.
 * Вставка в <head> — задача src/components/templates/base-layout.astro.
 */

import { weekDays } from '@/lib/schedule';
import type { OpeningHours } from '@/lib/schedule';
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

/**
 * JSON для вставки внутрь <script>: угловая скобка уходит в \u003c.
 * Разметку мы отдаём как есть (set:html), а браузер ищет в теле тега сырую
 * строку «</script>» — без экранирования скобка в описании товара или в alt
 * закрыла бы тег, и остаток JSON оказался бы разметкой страницы.
 */
export function jsonLdText(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface OrganizationParams {
  name: string;
  legalName: string;
  url: string;
  logoUrl: string;
  phone: string;
  email: string;
  /** Адрес по частям — форма совпадает с SiteAddress из config/site */
  address: {
    country: string;
    region: string;
    locality: string;
    street: string;
    postalCode?: string;
  };
  /** Координаты производства — по ним поисковики ставят точку на карте */
  geo: { latitude: number; longitude: number };
  /** УНП: у schema.org для него есть законное место — taxID */
  taxID: string;
  openingHours: OpeningHours;
}

/**
 * Паспорт организации: по нему поисковики связывают сайт с карточкой на картах.
 * Тип RoofingContractor, а не общий LocalBusiness: Google требует самый конкретный
 * подтип, и этот подтип из числа поддерживаемых Яндекс.Бизнесом.
 * (ProfessionalService не годится — deprecated самим schema.org.)
 */
export function organizationJsonLd(p: OrganizationParams): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'RoofingContractor',
    '@id': `${p.url}/#organization`,
    name: p.name,
    legalName: p.legalName,
    taxID: p.taxID,
    url: p.url,
    logo: p.logoUrl,
    image: p.logoUrl,
    telephone: p.phone,
    email: p.email,
    address: {
      '@type': 'PostalAddress',
      addressCountry: p.address.country,
      addressRegion: p.address.region,
      addressLocality: p.address.locality,
      streetAddress: p.address.street,
      ...(p.address.postalCode ? { postalCode: p.address.postalCode } : {}),
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: p.geo.latitude,
      longitude: p.geo.longitude,
    },
    /* Машиночитаемый график — тот же источник, что и строка в футере */
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: weekDays(p.openingHours),
        opens: p.openingHours.opens,
        closes: p.openingHours.closes,
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Минск' },
      { '@type': 'AdministrativeArea', name: 'Минский район' },
    ],
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
function imageObjectJsonLd(image: ImageParams, siteUrl: string, author: string): object {
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
