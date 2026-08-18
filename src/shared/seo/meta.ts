/** Хвост убран из H1 навсегда: бренд добавляется только в <title> */
const TITLE_SUFFIX = ' — METALLOMASTER';
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

export interface PageSeo {
  /** Заголовок страницы без брендового хвоста */
  title: string;
  description: string;
  /** Путь страницы от корня, например "/kolpak-na-stolb.html" */
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
