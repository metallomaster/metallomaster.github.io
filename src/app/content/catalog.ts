/*
 * Адаптер Content Collections → сущности FSD.
 * Единственное место, где данные каталога читаются из astro:content;
 * при смене фреймворка переписывается только этот файл.
 */
import { getCollection, getEntry, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { CatalogImage, CatalogItem } from '@entities/catalog-item';

function toItem(entry: CollectionEntry<'catalog'>): CatalogItem {
  const { cover, coverAlt, ...data } = entry.data;
  return {
    slug: entry.id,
    ...data,
    cover: cover ? { src: cover, alt: coverAlt ?? data.navTitle } : undefined,
  };
}

const byOrder = (a: CatalogItem, b: CatalogItem) => a.order - b.order;

export async function getCatalogItems(): Promise<CatalogItem[]> {
  const entries = await getCollection('catalog');
  return entries.map(toItem).sort(byOrder);
}

export async function getCategories(): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.type === 'category');
}

export async function getProductsOf(categorySlug: string): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.category === categorySlug);
}

export async function getFeatured(): Promise<CatalogItem[]> {
  return (await getCatalogItems()).filter((item) => item.featured);
}

/** Элемент каталога вместе с отрендеренным markdown-телом */
export async function getCatalogEntryWithContent(slug: string) {
  const entry = await getEntry('catalog', slug);
  if (!entry) return undefined;
  const { Content } = await render(entry);
  return { item: toItem(entry), Content };
}

export async function getWorks(): Promise<CatalogImage[]> {
  const entry = await getEntry('works', 'index');
  return entry?.data.images ?? [];
}
