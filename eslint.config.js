import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import boundaries from 'eslint-plugin-boundaries';

export default defineConfig([
  {
    ignores: ['dist/**', '.astro/**', '.documentation/**', 'node_modules/**', 'public/**'],
  },
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  // FSD: импорты только сверху вниз (app → pages → widgets → features → entities → shared)
  {
    files: ['src/**/*.{ts,astro}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { alwaysTryTypes: true },
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/*' },
        { type: 'pages', pattern: 'src/pages/*' },
        { type: 'widgets', pattern: 'src/widgets/*' },
        { type: 'features', pattern: 'src/features/*' },
        { type: 'entities', pattern: 'src/entities/*' },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          message:
            'FSD: слой «{{ from.type }}» не может импортировать из слоя «{{ to.type }}» — только сверху вниз',
          policies: [
            {
              from: [{ element: { type: 'app' } }],
              allow: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'].map((type) => ({
                to: { element: { type } },
              })),
            },
            // pages → app: адаптация под Astro (страницы подключают app/layouts),
            // см. .documentation/04-architecture.md
            {
              from: [{ element: { type: 'pages' } }],
              allow: ['app', 'widgets', 'features', 'entities', 'shared'].map((type) => ({
                to: { element: { type } },
              })),
            },
            {
              from: [{ element: { type: 'widgets' } }],
              allow: ['features', 'entities', 'shared'].map((type) => ({
                to: { element: { type } },
              })),
            },
            {
              from: [{ element: { type: 'features' } }],
              allow: ['entities', 'shared'].map((type) => ({ to: { element: { type } } })),
            },
            {
              from: [{ element: { type: 'entities' } }],
              allow: ['entities', 'shared'].map((type) => ({ to: { element: { type } } })),
            },
            {
              from: [{ element: { type: 'shared' } }],
              allow: [{ to: { element: { type: 'shared' } } }],
            },
          ],
        },
      ],
    },
  },
  // Переносимость: фреймворк-импорты (astro:*) разрешены только в app/, pages/
  // и двух адаптерах: shared/config (env) и shared/ui/picture (оптимизация картинок)
  {
    files: ['src/{widgets,features,entities,shared}/**/*.{ts,astro}'],
    ignores: ['src/shared/config/**', 'src/shared/ui/picture/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['astro:*', 'astro/*', 'astro'],
              message:
                'Переносимость: фреймворк-импорты разрешены только в app/, pages/ и адаптерах shared/config, shared/ui/picture (см. .documentation/04-architecture.md)',
            },
          ],
        },
      ],
    },
  },
]);
