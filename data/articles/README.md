# Article manifest format

Each article has one stable folder and one complete JSON manifest per locale:

```text
data/articles/<stable-article-id>/en.json
data/articles/<stable-article-id>/fr.json
```

The folder name and `slug` are the stable content ID used for payloads and chapter routes. A locale may set `routeSlug` and `path` to publish a translated public URL without changing that identity:

```json
{
  "slug": "prostate",
  "locale": "fr",
  "routeSlug": "signes-prostate",
  "path": "/signes-prostate"
}
```

This produces `/fr/signes-prostate`; its chapters are published at `/fr/signes-prostate/1`, `/fr/signes-prostate/2`, and so on. The shared engine automatically builds locale alternates and selects the correct lazy chapter payload. Article state is URL-based and is not saved in localStorage.

## CTA flexibility

The landing CTA supports exact `label`, `adNote`, `showIcon`, optional `icon`, and optional `busyLabel` values.

Every chapter `next` gate supports exact `eyebrow`, `title`, `copy`, `cta`, and `adNote` copy plus optional:

- `ctaIcon` — any short text symbol used beside the CTA.
- `showCtaIcon` — removes both CTA arrows when false.
- `busyNote` — locale- or gate-specific loading copy.
- `ariaLabel` — a fully custom accessible name.

No CTA text is inferred from the article topic. Every proposition can therefore be written and translated independently.

## Shared UI copy

The optional `ui` object localizes engine-level text without changing components:

```json
{
  "ui": {
    "defaultGateAdNote": "Une courte publicité, puis la suite.",
    "gateBusyNote": "Chargement de la publicité…",
    "loadingAdLabel": "Chargement…",
    "preparingArticleLabel": "Préparation de l’article…",
    "restoringTitle": "Retour à votre article…",
    "restoringCopy": "Chargement du chapitre débloqué.",
    "sourcesLabel": "Sources"
  }
}
```

Themes, landing copy, social proof, disclaimers, sources, chapters, images, rankings, callouts, conclusions and every rewarded continuation are also manifest-controlled. Add a locale to the shared i18n catalogue before publishing its manifest.
