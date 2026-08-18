import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Конфигуратор окружений: значения задаются в .env.development / .env.production,
// типизированный доступ — через src/shared/config (единственный адаптер к astro:env).
export default defineConfig({
  site: 'https://metallomaster.by',
  // Английские вложенные URL вида /catalog/chimney-caps/post-cap/;
  // карта 301-редиректов со старых адресов — .documentation/redirects.md
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  env: {
    schema: {
      CONTACT_PHONE: envField.string({ context: 'client', access: 'public' }),
      CONTACT_PHONE_DISPLAY: envField.string({ context: 'client', access: 'public' }),
      CONTACT_EMAIL: envField.string({ context: 'client', access: 'public' }),
      WEB3FORMS_KEY: envField.string({ context: 'client', access: 'public', default: '' }),
    },
  },
});
