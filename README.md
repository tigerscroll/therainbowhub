# The Rainbow Hub Quiz Site

A mobile-first quiz website built with Next.js App Router, TypeScript, Tailwind CSS, and static export for Cloudflare Pages.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the static export:

```bash
npm run build
```

## Cloudflare Pages

Use these Cloudflare Pages settings:

```text
Build command: npm run build
Output directory: out
```

## Quiz Data

Quizzes live as individual JSON files in:

```text
data/quizzes/
```

Current production quiz files:

```text
data/quizzes/oxford.json
data/quizzes/cambridge.json
```

The template file is:

```text
data/quizzes/example-template.json
```

The app reads quiz JSON files at build time through:

```text
lib/quizzes.ts
```

`example-template.json` is ignored by the loader so it does not appear as a real quiz. To add a quiz:

1. Copy `data/quizzes/example-template.json`.
2. Rename the copy to match the new slug, for example `data/quizzes/memory-test.json`.
3. Set `"slug": "memory-test"` inside the JSON.
4. Update title, page copy, homepage fields, stages, and questions.
5. Commit the JSON file.
6. Cloudflare Pages rebuilds and the new quiz appears on the homepage and at `/quiz/memory-test/`.

Quiz JSON files are only for quiz-specific content:

- quiz title and subtitle/page title
- SEO title and SEO description
- quiz questions and answer choices
- explanations and result descriptions
- quiz card/homepage metadata such as thumbnail URL, icon, category, difficulty, duration, and pass rate

Do not put shared header, footer, button, navigation, legal, loading, rewarded-ad, or language-switcher text in quiz JSON files.

## Required Quiz JSON Fields

Each quiz JSON file must include:

```json
{
  "slug": "memory-test",
  "title": "Memory Test",
  "pageTitle": "How Sharp Is Your Memory?",
  "eyebrow": "Cognition",
  "summary": "A short homepage description.",
  "duration": "~3 min",
  "questionCount": 2,
  "difficulty": "Medium",
  "passRate": "25%",
  "cardIcon": "🧠",
  "cardGradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "accent": "#4f46e5",
  "homepage": {
    "title": "Memory Test",
    "summary": "Homepage card copy for this quiz.",
    "thumbnailUrl": "/images/memory-test.jpg",
    "thumbnailAlt": "Memory Test quiz thumbnail",
    "icon": "🧠",
    "gradient": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    "featured": false
  },
  "stages": ["Opening Round"],
  "heroPoints": ["Fast questions", "Instant result", "Mobile friendly"],
  "infoPanel": {
    "title": "About This Quiz",
    "intro": "Quiz-specific background copy shown on the results screen.",
    "columns": [
      {
        "title": "How It Works",
        "body": "Explain the quiz flow and question types."
      },
      {
        "title": "About This Topic",
        "body": "Add topic, institution, or subject background."
      }
    ],
    "footerTitle": "Fair & Transparent",
    "footerBody": "Explain scoring and any important disclaimers."
  },
  "questions": []
}
```

Each question must include:

```json
{
  "prompt": "Question text",
  "choices": ["A", "B", "C", "D"],
  "answerIndex": 0,
  "explanation": "Why the answer is correct.",
  "category": "logic",
  "stage": 0
}
```

Rules enforced by the loader:

- The file name must match the slug, for example `memory-test.json` must contain `"slug": "memory-test"`.
- `questionCount` must match the actual number of questions.
- `difficulty` must be one of `Quick`, `Medium`, `Hard`, or `Expert`.
- `homepage` is optional but recommended. It controls homepage card title, summary, thumbnail image, fallback icon/gradient, and whether the quiz is featured in the hero CTA.
- `infoPanel` is optional. It controls the editable about/how-it-works/context/disclaimer block shown near the restart button on the result screen.
- Put thumbnail files in `public/images/` and reference them as `/images/file-name.jpg`.
- `answerIndex` must point to an existing choice.
- `stage` is zero-based and should map to an entry in `stages`.

## Tracking

## Shared Site Translations

Shared site text lives in:

```text
data/i18n/
```

Current global translation files:

```text
data/i18n/en.json
data/i18n/es.json
data/i18n/fr.json
data/i18n/de.json
data/i18n/pt.json
data/i18n/ar.json
data/i18n/ja.json
```

These files translate shared UI only:

- site name and description
- header navigation
- footer text and footer link labels
- homepage labels
- quiz interface buttons and progress labels
- result screen labels
- loading and rewarded-ad helper copy
- language switcher labels
- not-found/error copy

The helper for loading translations is:

```text
lib/i18n.ts
```

It exposes:

- `getTranslations(locale)`
- `getLocaleDirection(locale)`
- `getSupportedLocales()`
- `getDefaultLocale()`

Default English routes stay unprefixed:

```text
/
/quiz/oxford/
```

Translated shared UI routes use a locale prefix:

```text
/es/
/es/quiz/oxford/
/fr/
/fr/quiz/oxford/
```

Arabic uses RTL direction through `getLocaleDirection("ar")`.

To add a new language:

1. Copy `data/i18n/en.json` to `data/i18n/{locale}.json`.
2. Translate all shared strings.
3. Add the locale code to `supportedLocales` in `lib/i18n.ts`.
4. Add the display name in `components/LanguageSwitcher.tsx`.
5. Run `npm run build`.

To edit footer, header, button, loading, or rewarded-ad helper text, edit the relevant key in `data/i18n/*.json`.

## Translated Quizzes

Quiz-specific text stays in quiz JSON. If you want a fully translated quiz, add translated quiz content by extending the quiz data model or creating locale-aware quiz JSON files in a future content pass. The current locale routes translate shared UI around the existing quiz content, so `/es/quiz/oxford/` uses Spanish buttons/navigation/footer while keeping the current Oxford quiz copy.

## Tracking

Global script IDs and URLs are configured in:

```text
lib/siteConfig.ts
```

Tracking helper functions are in:

```text
lib/tracking.ts
```

Available helpers:

- `trackPageView()`
- `trackQuizStart()`
- `trackQuestionAnswered()`
- `trackStageComplete()`
- `trackRewardGranted()`
- `trackRewardClosed()`
- `trackQuizComplete()`

These helpers safely check whether `fbq` or `gtag` exists before firing, so missing pixels will not break the quiz.

To change Meta Pixel later, update `metaPixelId` in `lib/siteConfig.ts`.

To change Google Tag later, update `googleTagId` in `lib/siteConfig.ts`.

## Rewarded Ads

Rewarded ad placeholders are in:

```text
lib/rewardedAds.ts
```

Available placeholders:

- `showRewardedAdBeforeStart()`
- `showRewardedAdBeforeStageResults()`
- `showRewardedAdBeforeFinalResults()`

They currently resolve successfully without showing an ad. Add Google Ad Manager rewarded ad code inside `lib/rewardedAds.ts` when the real ad unit paths and reward flow are ready.

## Generated Files

Do not commit generated folders or platform files:

```text
node_modules
.next
out
.DS_Store
__MACOSX
```

These are ignored in `.gitignore`.
