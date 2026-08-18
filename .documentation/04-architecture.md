# Архитектура: прагматичный Atomic Design + переносимость

> v2 (18.08.2026). Первая версия проекта строилась на FSD; владелец решил упростить:
> FSD избыточен для витрины из 30 страниц и плохо ложится на Astro (потребовалось
> четыре задокументированных исключения — отключённые правила Steiger, pages→app и т.д.).
> Заменён на Atomic Design; принципы переносимости сохранены полностью.

## Структура

```
src/
├── pages/                  # роуты Astro (= atomic pages)
├── components/
│   ├── atoms/              # button, container, logo, picture — примитивы без зависимостей
│   ├── molecules/          # breadcrumbs, catalog-card, theme-toggle, contact-info
│   ├── organisms/          # header, footer, hero, category-grid, works-gallery,
│   │                       # how-we-work, advantages, cta-band, order-form, lightbox
│   └── templates/          # base-layout.astro (= atomic templates)
├── lib/                    # ВСЯ логика чистым TS: types, seo, theme, menu, lightbox,
│                           # order-form + адаптер content.ts
├── config/                 # site.ts (env-адаптер), tokens.css, fonts.css, global.css
└── content/                # данные каталога (markdown + фото) — «база данных» сайта
```

Компоненты — плоские файлы (`atoms/button.astro`), без папок-обёрток и index.ts.

## Направление импортов (контролирует eslint-plugin-boundaries)

```
atoms ← molecules ← organisms ← templates ← pages
  ↑         ↑            ↑           ↑         ↑
  └─────────┴────────────┴── lib, config ─────┘
```

Атом не знает о молекулах, молекула — об организмах. `lib` и `config` доступны всем,
сами зависят только друг от друга. Нарушение = ошибка ESLint = красный коммит.

## Принцип переносимости: «тонкий шаблон» (не изменился)

| Файл       | Содержимое                                                      | При миграции на другой фреймворк |
| ---------- | --------------------------------------------------------------- | -------------------------------- |
| `lib/*.ts` | Логика, типы, данные — чистый TS                                | Переезжает без изменений         |
| `*.css`    | Токены + обычные классы, `light-dark()` для тем                 | Переезжает без изменений         |
| `*.astro`  | Только разметка: классы, data-атрибуты, вызовы `init*()` из lib | Переписывается механически       |

**Адаптеры — единственные файлы со знанием Astro** (закреплено ESLint-правилом
`no-restricted-imports` на `astro:*`):

- `lib/content.ts` — astro:content → доменные типы из `lib/types.ts`;
- `config/site.ts` — astro:env → SiteConfig (dev/prod контакты);
- `components/atoms/picture.astro` — astro:assets (оптимизация картинок);
- `lib/types.ts` — только type-import `ImageMetadata` (нейтральный алиас `PictureSrc`);
- `pages/` и `components/templates/` — фреймворк-специфика разрешена по определению.

Миграция Astro → Next.js: переписываются шаблоны и четыре адаптера; логика, стили,
токены, контент, SEO-генераторы не трогаются.

## Инструменты качества

- **eslint-plugin-boundaries** — направление импортов атомарной иерархии + запрет astro:* вне адаптеров;
- **prettier, astro check (типы)** — как раньше;
- Steiger и FSD-плагины удалены вместе с FSD; **knip и lefthook удалены** по решению
  владельца (18.08) как избыточные — git-хуков нет, проверки (`build`, `check`, `lint`)
  прогоняются вручную перед коммитом.
