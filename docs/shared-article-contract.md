# Shared article contract

Articles are discovered from `data/articles/<slug>/<locale>.json`. A new article does not need a page component, route registration, catalogue entry, test list, or article-engine change.

## Add an English article

1. Create `data/articles/<slug>/en.json` using article schema version `1`.
2. Add any referenced images under `public/article-icons` or `public/article-images`.
3. Run `npm run lint` and `npm run build`.

The shared router automatically generates:

- `/<routeSlug>` for the landing page;
- `/<routeSlug>/<chapter>` for every chapter;
- `/article-data/<slug>/<chapter>` for lazy section payloads;
- metadata, canonical URLs, language alternates, and the sitemap entry.

`routeSlug` is optional and defaults to `slug`. English article routes may not collide with a quiz slug or a supported locale.

## Add a supported locale

Add `data/articles/<slug>/<locale>.json`. Keep `slug` as the stable content identity and set a localized `routeSlug` and matching `path` when required. The router automatically creates `/<locale>/<routeSlug>` and its chapter URLs.

## JSON-controlled presentation

The manifest owns metadata, the reference shell, theme colours, header colours, landing title and intro, icon, social proof, landing CTA, rewarded-ad notes, chapter content, chapter CTAs, sources, safety copy, and localized UI labels. Icons may be an emoji, an existing preset, or an image asset.

Use the shared renderer unless an existing reusable schema field genuinely cannot express the content. Do not add a per-article route wrapper or a hardcoded slug list.
