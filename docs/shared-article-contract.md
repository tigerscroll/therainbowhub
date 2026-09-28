# Archived article contract

The active site is quiz-only. Article page routes, chapter payloads, embedding,
plain reading layouts and article-specific ad unlocks have been removed.
`/cloudstorage` (including `?q=` and nested quiz URLs), `/monetize` and
`/makemoney` return 404. Quizzes remain at their original direct/localized URLs
and use `/22677279144/rewarded`.

Older unrelated article manifests and image assets remain saved in the project,
but are not loaded by the application, exported as article pages, or added to the
sitemap. Adding an article JSON file no longer publishes it. Restoring article
publishing would require an explicit feature change, not just a data edit.

The following is historical format documentation, not current publishing guidance.

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

Use `referenceTheme: "editorial"` for the independent shared article theme, or `referenceQuizSlug` to borrow an existing quiz's theme. Set exactly one. An independent theme keeps an article available when an unrelated quiz is removed; article-specific colours and header settings still override the base theme.

Use the shared renderer unless an existing reusable schema field genuinely cannot express the content. Do not add a per-article route wrapper or a hardcoded slug list.
