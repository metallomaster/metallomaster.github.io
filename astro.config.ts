import { defineConfig, envField } from 'astro/config';

export default defineConfig({
  site: 'https://metallomaster.by',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Карта сайта — src/pages/sitemap.xml.ts (страницы и фотографии одним файлом)
  env: {
    schema: {
      CONTACT_PHONE: envField.string({ context: 'client', access: 'public' }),
      CONTACT_PHONE_DISPLAY: envField.string({ context: 'client', access: 'public' }),
      CONTACT_EMAIL: envField.string({ context: 'client', access: 'public' }),
      WEB3FORMS_KEY: envField.string({ context: 'client', access: 'public', default: '' }),
    },
  },
});
