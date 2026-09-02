/*
 * Адаптер Content Collections → доменные типы (src/lib/types.ts).
 * Единственное место, где данные каталога читаются из astro:content;
 * при смене фреймворка переписывается только этот файл.
 */
import { getCollection, getEntry, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';
import { PHOTO_FULL } from '@/lib/images';
import type { CatalogImage, CatalogItem, PictureSrc } from '@/lib/types';

/* Один и тот же файл встречается в разных разделах — считаем полноразмер по разу */
const fullUrlCache = new Map<string, Promise<string>>();

function fullUrl(src: PictureSrc): Promise<string> {
  const cached = fullUrlCache.get(src.src);
  if (cached) return cached;
  const pending = getImage({
    src,
    ...PHOTO_FULL,
    // Апскейл не даёт качества, только вес
    width: Math.min(PHOTO_FULL.width, src.width),
  }).then((image) => image.src);
  fullUrlCache.set(src.src, pending);
  return pending;
}

async function toImage(image: { src: PictureSrc; alt: string }): Promise<CatalogImage> {
  return { ...image, full: await fullUrl(image.src) };
}

async function toItem(entry: CollectionEntry<'catalog'>): Promise<CatalogItem> {
  const { cover, coverAlt, images, ...data } = entry.data;
  return {
    slug: entry.id,
    ...data,
    cover: cover ? await toImage({ src: cover, alt: coverAlt ?? data.navTitle }) : undefined,
    images: await Promise.all(images.map(toImage)),
  };
}

const byOrder = (a: CatalogItem, b: CatalogItem) => a.order - b.order;

/* Порядок витрины владелец задаёт вручную: разделы, изделия и услуги идут вперемешку,
   поэтому сортируем одним ключом, а не по типу элемента */
const showcaseOrder = (item: CatalogItem) => item.featuredOrder ?? item.order;

const byShowcaseOrder = (a: CatalogItem, b: CatalogItem) => showcaseOrder(a) - showcaseOrder(b);

export async function getCatalogItems(): Promise<CatalogItem[]> {
  const entries = await getCollection('catalog');
  return (await Promise.all(entries.map(toItem))).sort(byOrder);
}

export async function getCategories(): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.type === 'category');
}

export async function getProductsOf(categorySlug: string): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.category === categorySlug);
}

/**
 * Витрина каталога: категории плюс изделия, вынесенные на верхний уровень
 * флагом featured (парапет спрашивают отдельно от доборных элементов).
 */
export async function getCatalogSections(): Promise<CatalogItem[]> {
  return (await getCatalogItems())
    .filter((item) => item.type === 'category' || (item.type === 'product' && item.featured))
    .sort(byShowcaseOrder);
}

/** Карточки для главной: разделы каталога и услуги */
export async function getFeatured(): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.featured).sort(byShowcaseOrder);
}

/** Элемент каталога вместе с отрендеренным markdown-телом */
export async function getCatalogEntryWithContent(slug: string) {
  const entry = await getEntry('catalog', slug);
  if (!entry) return undefined;
  const { Content } = await render(entry);
  return { item: await toItem(entry), Content };
}

export async function getWorks(): Promise<CatalogImage[]> {
  const entry = await getEntry('works', 'index');
  return Promise.all((entry?.data.images ?? []).map(toImage));
}

/** Превью для соцсетей у страниц без своего фото — первый кадр галереи работ */
export async function getDefaultShareImage(): Promise<PictureSrc | undefined> {
  const entry = await getEntry('works', 'index');
  return entry?.data.images[0]?.src;
}
