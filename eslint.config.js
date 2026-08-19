import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import boundaries from 'eslint-plugin-boundaries';

export default defineConfig([
  {
    ignores: ['dist/**', '.astro/**', '.deprecated/**', 'node_modules/**', 'public/**'],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  // Atomic Design: импорты только вниз по иерархии (pages → templates → organisms → molecules → atoms),
  // логика — в lib/, конфигурация — в config/
  {
    files: ['src/**/*.{ts,astro}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/elements': [
        { type: 'atoms', pattern: 'src/components/atoms' },
        { type: 'molecules', pattern: 'src/components/molecules' },
        { type: 'organisms', pattern: 'src/components/organisms' },
        { type: 'templates', pattern: 'src/components/templates' },
        { type: 'pages', pattern: 'src/pages' },
        { type: 'lib', pattern: 'src/lib' },
        { type: 'config', pattern: 'src/config' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            'Атомарная иерархия: «{{ from.type }}» не может импортировать из «{{ to.type }}» — только вниз (atoms ← molecules ← organisms ← templates ← pages), логика — в lib',
          policies: [
            {
              from: [{ element: { type: 'atoms' } }],
              allow: ['lib', 'config'].map((type) => ({ to: { element: { type } } })),
            },
            {
              from: [{ element: { type: 'molecules' } }],
              allow: ['atoms', 'lib', 'config'].map((type) => ({ to: { element: { type } } })),
            },
            {
              from: [{ element: { type: 'organisms' } }],
              allow: ['molecules', 'atoms', 'lib', 'config'].map((type) => ({
                to: { element: { type } },
              })),
            },
            {
              from: [{ element: { type: 'templates' } }],
              allow: ['organisms', 'molecules', 'atoms', 'lib', 'config'].map((type) => ({
                to: { element: { type } },
              })),
            },
            {
              from: [{ element: { type: 'pages' } }],
              allow: ['templates', 'organisms', 'molecules', 'atoms', 'lib', 'config', 'pages'].map(
                (type) => ({ to: { element: { type } } }),
              ),
            },
            {
              from: [{ element: { type: 'lib' } }],
              allow: ['lib', 'config'].map((type) => ({ to: { element: { type } } })),
            },
            {
              from: [{ element: { type: 'config' } }],
              allow: [{ to: { element: { type: 'config' } } }],
            },
          ],
        },
      ],
    },
  },
  // Переносимость: фреймворк-импорты (astro:*) разрешены только в pages/, components/templates/
  // и адаптерах: lib/content.ts (контент), config/site.ts (env),
  // components/atoms/picture.astro (картинки), lib/types.ts (type-only ImageMetadata)
  {
    files: ['src/**/*.{ts,astro}'],
    ignores: [
      'src/pages/**',
      'src/components/templates/**',
      'src/lib/content.ts',
      'src/lib/types.ts',
      'src/config/site.ts',
      'src/components/atoms/picture.astro',
      // Служебный файл Astro Content Collections, вне атомарной иерархии
      'src/content.config.ts',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['astro:*', 'astro/*', 'astro'],
              message:
                'Переносимость: фреймворк-импорты разрешены только в pages/, components/templates/ и адаптерах lib/content.ts, config/site.ts, components/atoms/picture.astro, lib/types.ts (type-only)',
            },
          ],
        },
      ],
    },
  },
]);
