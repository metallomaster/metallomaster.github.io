/*
 * Карта сайта: адреса страниц плюс фотографии на каждой из них.
 * Одним файлом — 33 страницы далеко до лимита в 50 000 адресов, индекс карт не нужен.
 *
 * Список страниц собирается сам: статические берутся из файлов src/pages,
 * динамические (каталог, услуги) — из контента. Забыть новую страницу нельзя.
 */
import type { APIRoute } from 'astro';
import { getCatalogItems, getWorks } from '@/lib/content';
import { siteConfig } from '@/config/site';
import { lastModified } from '@/lib/lastmod';
import { catalogItemUrl } from '@/lib/types';
import type { CatalogImage } from '@/lib/types';

const escapeXml = (text: string): string =>
  text.replace(
    /[<>&'"]/g,
    (char) =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] ?? char,
  );

const absolute = (path: string): string => new URL(path, siteConfig.siteUrl).toString();

/** Пути статических страниц прямо из файловой структуры src/pages, вместе с их исходниками */
function staticPages(): { path: string; file: string }[] {
  const modules = import.meta.glob('/src/pages/**/*.astro');
  return (
    Object.keys(modules)
      .map((file) => ({
        file: file.slice(1),
        path: file.replace('/src/pages', '').replace(/\.astro$/, ''),
      }))
      // [param] — динамические маршруты, их адреса даёт контент
      .filter(({ path }) => !path.includes('['))
      .map((page) => ({ ...page, path: page.path.replace(/\/index$/, '/') }))
      // 404 в карте не нужен, и служебные подчёркнутые файлы тоже
      .filter(({ path }) => path !== '/404' && !path.includes('/_'))
      .map((page) => ({ ...page, path: page.path.endsWith('/') ? page.path : `${page.path}/` }))
  );
}

function urlEntry(path: string, images: CatalogImage[], lastmod: string): string {
  const tags = images.map(
    (image) =>
      `    <image:image>\n` +
      `      <image:loc>${escapeXml(absolute(image.full))}</image:loc>\n` +
      `      <image:title>${escapeXml(image.alt)}</image:title>\n` +
      `    </image:image>`,
  );
  return [
    `  <url>`,
    `    <loc>${escapeXml(absolute(path))}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    ...tags,
    `  </url>`,
  ].join('\n');
}

export const GET: APIRoute = async () => {
  const [items, works] = await Promise.all([getCatalogItems(), getWorks()]);

  const photosOf = (path: string): CatalogImage[] => {
    if (path === '/') return works;
    const item = items.find((entry) => catalogItemUrl(entry) === path);
    if (!item) return [];
    return item.images.length > 0 ? item.images : item.cover ? [item.cover] : [];
  };

  /* Считаем только по исходнику самой страницы: правка шапки — не повод
     объявлять весь сайт обновившимся, такому lastmod поисковики перестают верить */
  const pages = [
    ...staticPages(),
    ...items.map((item) => ({
      path: catalogItemUrl(item),
      file: `src/content/catalog/${item.slug}.md`,
    })),
  ].sort((a, b) => a.path.localeCompare(b.path));

  const entries = pages.map(({ path, file }) =>
    urlEntry(path, photosOf(path), lastModified([file])),
  );

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    `${entries.join('\n')}\n` +
    `</urlset>\n`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
