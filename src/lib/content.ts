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

export async function getFeatured(): Promise<CatalogItem[]> {
  const featured = (await getCatalogItems()).filter((item) => item.featured);
  // Сначала категории, затем отдельные featured-товары (например, парапет)
  return featured.sort(
    (a, b) => Number(b.type === 'category') - Number(a.type === 'category') || a.order - b.order,
  );
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
