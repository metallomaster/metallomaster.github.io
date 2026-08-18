# metallomaster.by — правила проекта

Реворк сайта производителя металлоизделий (Минск). Документация: `.documentation/`
(аудит старого сайта, план, решения, архитектура). Старый сайт целиком —
`.documentation/deprecated/site/`, скриншоты «как было» — `.documentation/deprecated/screenshots/`.

## Стек и команды

- Astro 7, TypeScript strict, npm, Node 22.12+ (`nvm use 22`).
- `npm run dev` / `build` / `check` (типы) / `lint` (ESLint + Steiger FSD) / `format`.
- Перед завершением любой задачи: `npm run build && npm run check && npm run lint` — всё должно быть зелёным.

## Архитектура — FSD (см. .documentation/04-architecture.md)

Слои: `app → pages → widgets → features → entities → shared`. Импорты только сверху вниз
(ESLint boundaries валит сборку при нарушении). Доступ к слайсу — только через его `index.ts`.
Внутри слайса — сегменты: `ui/` (astro-компоненты), `model/` (чистый TS).

**Переносимость (критично):**

- Логика, типы, данные — в `.ts` без единого импорта из `astro:*`/`astro` (ESLint запрещает).
- `.astro`-файлы — только разметка: классы, data-атрибуты, вызовы функций из model.
- Интерактив — функции `init*(root: HTMLElement)` в `model/`, подключаются через `<script>`.
- Исключения-адаптеры (только там разрешён astro:*): `app/`, `pages/`, `shared/config`, `shared/ui/picture`.

## Стиль кода

- Все цвета/размеры/отступы — только через токены `src/shared/config/tokens.css`. Сырые
  значения (`#fff`, `16px` отступа) в компонентах запрещены.
- Темы: светлая — основная, тёмная — через `light-dark()`. Никаких отдельных
  `[data-theme]`-блоков в компонентах: если нужен разный цвет — новый токен.
- Классы: BEM внутри компонента (`.header__nav-link`).
- Брейкпоинты: 360 / 768 / 1024 / 1440, mobile-first, тач-таргеты ≥ 44px.
- Комментарии по-русски, только там, где код не может сказать сам.

## SEO (не нарушать)

- URL старого сайта сохраняются один в один: `build.format: 'file'` → `/stranica.html`.
- H1 ≠ title; title без хвоста (бренд добавляет `buildTitle` из `@shared/seo`).
- Каждая страница: уникальные title/description, canonical, OG — всё через пропсы
  `BaseLayout` (`@app/layouts/base-layout.astro`).
- JSON-LD — только через генераторы `@shared/seo` (organizationJsonLd подключён в layout).
- У каждой картинки осмысленный `alt` по-русски.

## Контент

- Тексты переписываем: живой язык, без канцелярита и SEO-воды, ключевые запросы
  сохраняем (см. `.documentation/seo-audit-raw.json` — старые title/description).
- Цены НЕ указывать (решение владельца). CTA — «Рассчитать стоимость».
- Контакты/реквизиты — только из `siteConfig` (`@shared/config`), никаких хардкодов
  телефона или email в разметке: они различаются между dev и prod.

## Запреты

- Раздел ENVIRONMENT в `TODO.md` не трогать — его ведёт владелец.
- `.documentation/deprecated/` — только чтение (референс старого сайта).
- Не добавлять зависимости без необходимости; jQuery и UI-библиотеки запрещены.
