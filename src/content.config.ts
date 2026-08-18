/*
 * Astro Content Collections. Контент лежит в src/content:
 *   catalog/<slug>.md — категории, товары и услуги; slug = последний сегмент URL страницы
 *   catalog/<slug>/*.{png,jpg,webp} — фото рядом с контентом
 *   works/index.md + works/*.{png,jpg} — галерея «Наши работы» для главной
 */
import { defineCollection } from 'astro:content';
import type { SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const imageEntry = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    alt: z.string().min(4),
  });

const catalog = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/_*'], base: './src/content/catalog' }),
  schema: ({ image }) =>
    z.object({
      type: z.enum(['category', 'product', 'service']),
      /** Человеческий H1 (не дублирует title из SEO) */
      title: z.string(),
      /** Короткое имя для меню, карточек и хлебных крошек */
      navTitle: z.string(),
      /** <title> без брендового хвоста — хвост добавит buildTitle */
      seoTitle: z.string().max(60),
      /** meta description, 120–160 символов */
      description: z.string().min(80).max(165),
      /** Лид-абзац под H1 */
      lead: z.string(),
      /** slug родительской категории (для товаров) */
      category: z.string().optional(),
      /** Порядок сортировки в списках */
      order: z.number().default(100),
      /** Показывать на главной */
      featured: z.boolean().default(false),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      images: z.array(imageEntry(image)).default([]),
    }),
});

const works = defineCollection({
  loader: glob({ pattern: 'index.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      images: z.array(imageEntry(image)),
    }),
});

export const collections = { catalog, works };
