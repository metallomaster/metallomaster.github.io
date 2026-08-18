/*
 * Нейтральное имя для метаданных картинки. Единственное место (кроме адаптеров),
 * где допустим тип фреймворка — остальной код зависит только от PictureSrc.
 */
import type { ImageMetadata } from 'astro';

export type PictureSrc = ImageMetadata;
