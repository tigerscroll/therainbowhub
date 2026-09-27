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

Use `referenceTheme: "editorial"` for the independent shared article theme, or `referenceQuizSlug` to borrow an existing quiz's theme. Set exactly one. An independent theme keeps an article available when an unrelated quiz is removed; article-specific colours and header settings still override the base theme.

Use the shared renderer unless an existing reusable schema field genuinely cannot express the content. Do not add a per-article route wrapper or a hardcoded slug list.

## Plain articles and optional quizzes

Set `layout: "plain"` for a readable, single-column article without a landing screen or article ad gates. All section content is exported as HTML. Points may include `sources: [{ label, url }]` for references alongside the text.

### Optional article unlock

A plain article may opt in to `monetization: { previewPoints, title, copy, cta, adNote }`; `/monetize` is the first English example. All other plain articles remain ungated and display-ad free. The preview stays readable, followed by a faded excerpt of the first locked section and an explicitly disclosed rewarded button. One reward unlocks the entire remainder, persisted locally per article/locale. Early closure never retries automatically. No fill or an unavailable SDK unlocks reading; a visible ad timing out is not counted as a reward. The article flow does not emit `QuizStart` or Purchase events and does not change the quiz helper's behaviour.

The single article display placement uses `/22677279144/display` and requests only fitting 300×250 / 336×280 sizes. It sits directly below the article title, before the introduction; unlocking does not add another display ad. The placement spans the full article container width (edge-to-edge on mobile), without fixed-height clipping or scaling the creative. Google controls eligible expansion through Ad Manager format settings. There is no extra visible ad heading; the accessible label and Google's own creative disclosures remain intact. Empty slots collapse and ads are not auto-refreshed. Rewarded requests use `/22677279144/rewarded`. The article does not show a custom Cancel button during loading; Google's own ad dismissal controls remain unchanged, and loading still times out safely. Real fill depends on the existing Ad Manager inventory, demand and consent setup. Tests mock GPT and block third-party traffic.

The full text remains in the static HTML, with `isAccessibleForFree: false` and a `hasPart` selector identifying the gated section. This is a client-side reading gate, not a secure paid-content paywall. Sources and the independent-publisher disclaimer remain accessible before unlock.

Any article can display an existing quiz above its content at a prebuilt static path, for example `/cloudstorage/years-left`, `/cloudstorage/memory` or `/cloudstorage/vision`. The build generates a separate HTML page for each article/quiz pair. Only that quiz is rendered and serialized; there is no hidden preview catalogue or browser-time quiz fetch. Its landing and the complete article are present even before JavaScript runs. The selected quiz uses the existing QuizEngine, progress storage and rewarded placement. No iframe, duplicated site header, interstitial or new ad unit is created. Article metadata and canonical URL remain those of the base article. Plain articles use the compact, neutral footer. Article text is server-rendered, with headline and articleBody structured data, index/follow metadata, Open Graph article tags and a generated sitemap entry. Legacy `?q=` parameters are ignored, with no redirect; `/cloudstorage?q=years-left` is article-only. Unknown quiz path segments return 404. The `fbclid` header-hiding behaviour is unchanged.
