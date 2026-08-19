import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  site: 'https://metallomaster.by',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  env: {
    schema: {
      WEB3FORMS_KEY: envField.string({
        context: 'client',
        access: 'public',
        default: '',
      }),
    },
  },
});
