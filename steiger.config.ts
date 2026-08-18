import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // content.config.ts и content/ — служебные для Astro Content Collections, вне FSD-слоёв
    ignores: ['**/content.config.ts', '**/content/**'],
  },
  {
    rules: {
      // Steiger не разбирает импорты внутри .astro-файлов, поэтому счётчик
      // ссылок на слайсы всегда нулевой — правило даёт ложные срабатывания
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    // pages в Astro — файловый роутинг: index.astro — роут главной, а не public API слоя,
    // вложенные папки (catalog/, services/) — сегменты URL, а не FSD-слайсы
    files: ['./src/pages/**'],
    rules: {
      'fsd/no-layer-public-api': 'off',
      'fsd/no-segmentless-slices': 'off',
    },
  },
]);
