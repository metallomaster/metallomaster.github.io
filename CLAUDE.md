# metallomaster.by

Static marketing site for a sheet-metal manufacturer in Minsk: chimneys, caps, air ducts,
roof accessories. All user-facing copy is Russian; code and this file are English.

## Stack

Astro 7, TypeScript strict, npm, Node 22.12+. No UI framework, no runtime dependencies
besides `sharp` for image processing. Fully prerendered — no adapter, no SSR.

| Command           | What it does                                      |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | dev server on :4321                               |
| `npm run stop`    | stop the background dev daemon                    |
| `npm run build`   | static build into `dist/`                         |
| `npm run preview` | serve `dist/` — closest thing to production       |
| `npm run check`   | `astro check` (types and `.astro` templates)      |
| `npm run lint`    | ESLint with `--fix`; architecture rules live here |
| `npm run format`  | Prettier                                          |

Before finishing any task run `npm run build && npm run check && npm run lint` — all three
must be green. There are no git hooks; running them is manual.

The background dev daemon goes stale: the content layer empties, catalog pages start
returning 404, and `.astro/dev.log` says «The collection "catalog" does not exist or is
empty». Fix with `npm run stop && npm run dev`.

## Structure

```
src/
├── pages/            file-based routes + sitemap.xml.ts
├── components/
│   ├── atoms/        button, container, logo, picture
│   ├── molecules/    catalog-card
│   ├── organisms/    header, tab-bar, footer, hero, category-grid, works-gallery,
│   │                 how-we-work, advantages, cta-band, order-form, lightbox
│   └── templates/    base-layout.astro — <head>, header, footer, tab bar, JSON-LD
├── lib/              all logic as plain TypeScript
├── config/           site.ts (company data + env), tokens.css, fonts.css, global.css
├── content/          the site's database: catalog markdown + photos
└── content.config.ts zod schemas for the collections

public/               favicons, Manrope fonts, robots.txt, manifest, search-engine
                      verification files, and .htaccess
.deprecated/          mirror of the old site — read only
```

`lib/` modules: `types.ts` (domain types and URL building), `content.ts` (the only Content
Collections adapter), `seo.ts` (meta and JSON-LD generators), `images.ts` (image presets),
`lastmod.ts` (page dates from git history), `schedule.ts` (opening hours), `menu.ts`
(navigation items), `lightbox.ts`, `order-form.ts`, `works-gallery.ts`, `speculation.ts`.

Components are flat files — no wrapper folders, no index files. Import through the single
alias: `import Button from '@/components/atoms/button.astro'`.

## Architecture rules

**Imports only go down the hierarchy:** `atoms ← molecules ← organisms ← templates ← pages`.
Any level may use `lib/` and `config/`. ESLint enforces this.

**Logic stays framework-free.** Files in `lib/*.ts` must not import anything from
`astro`/`astro:*` — ESLint enforces this too. `.astro` files are thin templates: markup,
classes, data attributes, calls into `lib/`. Interactivity is `init*(root: HTMLElement)`
functions in `lib/`, wired up through a `<script>` in the component.

Adapter exceptions where framework imports are allowed: `pages/`, `components/templates/`,
`lib/content.ts`, `lib/types.ts` (type-only `ImageMetadata`), `config/site.ts`,
`components/atoms/picture.astro`.

## Styling

Every colour, size and spacing value comes from `src/config/tokens.css`. Raw `#fff` or
`16px` in a component is forbidden.

A new colour token must be declared in **both** places in `tokens.css`: in `:root` via
`light-dark()`, and as a flat light value inside the `@supports not (color: light-dark(…))`
block. Without the second one a browser lacking the function falls back to `initial`.

Light theme is primary, dark comes from `light-dark()`. There is no theme switcher by
owner's decision — the theme follows `prefers-color-scheme`, nothing is written to
localStorage. Never add `[data-theme]` blocks in components; add a token instead.

BEM inside a component (`.header__nav-link`). Breakpoints 360 / 768 / 1024 / 1440,
mobile-first, touch targets at least 44px. Navigation: bottom tab bar below 1024px,
header menu from 1024px; items are shared from `lib/menu.ts`.

The site is a standalone PWA (`display: standalone` + `viewport-fit=cover`). Anything
touching a screen edge must account for notches through the `--safe-top/right/bottom/left`
tokens; never write `env()` directly in a component.

Comments in Russian, and only where the code cannot speak for itself.

## SEO

URLs are nested English paths with a trailing slash: `/catalog/<category>/<product>/`
(`build.format: 'directory'`, `trailingSlash: 'always'`).

**`public/.htaccess` is the only 301 map** — there is no other copy. Renaming or removing a
page means adding its old address there, or it drops out of the search index. The old site
had 90 live addresses; the mirror and the old `sitemap.xml` (65 addresses) are both
incomplete, so never verify coverage against them.

H1 ≠ title: `title` is the human H1, `seoTitle` is the `<title>` (max 60 chars; the brand
suffix is appended by `buildTitle` only when it fits). Description is capped at 160
characters in both the content schema and `clampDescription` — prose inside `.astro` pages
is not schema-checked, so keep the length by hand.

Every page gets unique title/description, canonical and Open Graph through `BaseLayout`
props — never hand-write them into `<head>`. JSON-LD only through the `lib/seo.ts`
generators. Breadcrumbs exist only in `breadcrumbsJsonLd` markup, never rendered on the
page (owner's decision).

Every image needs a meaningful Russian `alt`: the same text becomes the `ImageObject`
caption and the `<image:title>` entry in the image sitemap.

## Images

Sizes and quality come from the presets in `lib/images.ts` (`PHOTO_FULL`, `OG_IMAGE`,
`PHOTO_THUMB_WIDTHS`). Identical parameters produce one file in the build; custom numbers
in `getImage` calls multiply copies. Thumbnails go through `atoms/picture.astro`
(AVIF + WebP, srcset without upscaling). The full-size variant for the lightbox is the
`full` field on `CatalogImage`, computed in `lib/content.ts`.

Astro copies the original of every imported photo into `dist`, including ones nothing links
to — pages render after assets are processed, and it cannot be disabled. So keep sources in
`src/content` light: their weight lands in the build one-to-one.

## Content

Catalog pages are markdown in `src/content/catalog/`; the filename is the last URL segment.
The `type` field decides the route: `category` → `/catalog/<slug>/`, `product` →
`/catalog/<category>/<slug>/` (parent from the `category` field), `service` →
`/services/<slug>/`. No routing files needed. The schema in `content.config.ts` fails the
build when a required field is missing.

Rewrite copy in a living voice — no bureaucratese, no SEO filler — while keeping the search
terms. **Never publish prices** (owner's decision); the CTA is «Рассчитать стоимость».

Contacts and legal details come from `siteConfig` (`@/config/site`) only — no hard-coded
phone or email anywhere in markup.

## Prohibitions

- `.deprecated/` is read-only — it is the old site's reference mirror.
- No new dependencies without a real need; jQuery and UI libraries are banned.
- Do not touch the two search-engine verification files in `public/`
  (`google*.html`, `yandex_*.html`) — deleting them breaks Search Console access.
