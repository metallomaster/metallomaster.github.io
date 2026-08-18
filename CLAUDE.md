# metallomaster.by — правила проекта

Реворк сайта производителя металлоизделий (Минск). Документация: `.documentation/`
(аудит старого сайта, план, решения, архитектура). Старый сайт целиком —
`.documentation/deprecated/site/`, скриншоты «как было» — `.documentation/deprecated/screenshots/`.

## Стек и команды

- Astro 7, TypeScript strict, npm, Node 22.12+ (`nvm use 22`).
- `npm run dev` / `build` / `check` (типы) / `lint` (ESLint) / `format`.
- Перед завершением любой задачи: `npm run build && npm run check && npm run lint` — всё должно быть зелёным.
  Git-хуков нет (lefthook удалён по решению владельца) — прогон проверок перед коммитом обязателен вручную.
- Фоновый dev-демон может «протухнуть»: content layer в памяти пустеет (в `.astro/dev.log` —
  «The collection "catalog" does not exist or is empty»), симптомы — пустой каталог и 404 на
  страницах из коллекции. Лечится перезапуском: `npx astro dev stop && npm run dev`.
  Смотреть сайт «как в проде» надёжнее через `npm run build && npm run preview`.

## Архитектура — Atomic Design

Карта папок (`src/`):

- `components/atoms/` — неделимые элементы UI (button, container, logo, picture);
- `components/molecules/` — простые связки атомов (breadcrumbs, catalog-card, theme-toggle, contact-info);
- `components/organisms/` — самостоятельные блоки страницы (header, footer, hero, order-form, lightbox…);
- `components/templates/` — atomic templates (base-layout.astro);
- `pages/` — файловый роутинг Astro;
- `lib/` — вся логика и типы чистым TS (types, content, seo, theme, menu, lightbox, order-form);
- `config/` — site.ts (адаптер astro:env), tokens.css, fonts.css, global.css.

Компоненты — плоские файлы без папок-обёрток и index.ts; импорты напрямую через единый
алиас: `import Button from '@/components/atoms/button.astro'`.

Направление импортов — только вниз по иерархии: atoms ← molecules ← organisms ← templates ← pages
(ESLint boundaries валит сборку при нарушении). Атомы не знают о молекулах, молекулы — об
организмах; любой уровень может брать `lib/` и `config/`.

**Переносимость (критично):**

- Логика, типы, данные — в `lib/*.ts` без единого импорта из `astro:*`/`astro` (ESLint запрещает).
- `.astro`-файлы — тонкие шаблоны: классы, data-атрибуты, вызовы функций из `lib/`.
- Интерактив — функции `init*(root: HTMLElement)` в `lib/`, подключаются через `<script>`.
- Исключения-адаптеры (только там разрешён astro:*): `pages/`, `components/templates/`,
  `lib/content.ts`, `config/site.ts`, `components/atoms/picture.astro`, `lib/types.ts`
  (type-only ImageMetadata).

## Стиль кода

- Все цвета/размеры/отступы — только через токены `src/config/tokens.css`. Сырые
  значения (`#fff`, `16px` отступа) в компонентах запрещены.
- Темы: светлая — основная, тёмная — через `light-dark()`. Никаких отдельных
  `[data-theme]`-блоков в компонентах: если нужен разный цвет — новый токен.
- Классы: BEM внутри компонента (`.header__nav-link`).
- Брейкпоинты: 360 / 768 / 1024 / 1440, mobile-first, тач-таргеты ≥ 44px.
- Комментарии по-русски, только там, где код не может сказать сам.

## SEO (не нарушать)

- URL — английские вложенные, с завершающим слешем: `/catalog/<category>/<product>/`
  (`build.format: 'directory'`, `trailingSlash: 'always'`). Старые транслит-адреса живут
  только в карте 301-редиректов `.documentation/redirects.md`; при добавлении/переименовании
  страниц каждый старый адрес обязан попадать в эту карту.
- H1 ≠ title; title без хвоста (бренд добавляет `buildTitle` из `@/lib/seo`).
- Каждая страница: уникальные title/description, canonical, OG — всё через пропсы
  `BaseLayout` (`@/components/templates/base-layout.astro`).
- JSON-LD — только через генераторы `@/lib/seo` (organizationJsonLd подключён в layout).
- У каждой картинки осмысленный `alt` по-русски.

## Контент

- Тексты переписываем: живой язык, без канцелярита и SEO-воды, ключевые запросы
  сохраняем (см. `.documentation/seo-audit-raw.json` — старые title/description).
- Цены НЕ указывать (решение владельца). CTA — «Рассчитать стоимость».
- Контакты/реквизиты — только из `siteConfig` (`@/config/site`), никаких хардкодов
  телефона или email в разметке: они различаются между dev и prod.

## Запреты

- Раздел ENVIRONMENT в `TODO.md` не трогать — его ведёт владелец.
- `.documentation/deprecated/` — только чтение (референс старого сайта).
- Не добавлять зависимости без необходимости; jQuery и UI-библиотеки запрещены.
