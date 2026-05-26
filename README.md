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

Quizzes live in one folder per quiz, with one JSON file per language:

```text
data/quizzes/
  oxford/
    en.json
    es.json
  cambridge/
    en.json
    es.json
```

Current production quiz folders:

```text
data/quizzes/oxford/en.json
data/quizzes/cambridge/en.json
```

The template file is:

```text
data/quizzes/example-template/en.json
```

The app reads quiz JSON files at build time through:

```text
lib/quizzes.ts
```

`example-template` is ignored by the loader so it does not appear as a real quiz. To add a quiz:

1. Copy `data/quizzes/example-template/`.
2. Rename the copied folder to the new slug, for example `data/quizzes/memory-test/`.
3. Keep the default quiz file at `data/quizzes/memory-test/en.json`.
4. Set `"slug": "memory-test"` inside every locale JSON file.
5. Update title, page copy, homepage fields, stages, and questions.
6. Commit the quiz folder.
7. Cloudflare Pages rebuilds and the new quiz appears on the homepage and at `/quiz/memory-test/`.

To add a translated quiz, add a full self-contained locale file inside the same quiz folder:

```text
data/quizzes/memory-test/es.json
```

Then `/es/quiz/memory-test/` will use the Spanish quiz file. If a translated file is missing, the page falls back to `en.json` so links do not break.

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
  "seoTitle": "Memory Test Quiz",
  "seoDescription": "A short SEO description for this quiz page.",
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
    "intro": "Quiz-specific background copy shown below the quiz.",
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

- The folder name must match the slug, for example `data/quizzes/memory-test/en.json` must contain `"slug": "memory-test"`.
- Every quiz folder must contain `en.json`.
- Locale files must be named with supported locale codes: `en`, `es`, `fr`, `de`, `pt`, `ar`, or `ja`.
- Translated quiz files must keep the same `slug`, `questionCount`, number of stages, number of questions, answer indexes, choice counts, stages, and categories as `en.json`.
- `questionCount` must match the actual number of questions.
- `difficulty` must be one of `Quick`, `Medium`, `Hard`, or `Expert`.
- `homepage` is optional but recommended. It controls homepage card title, summary, thumbnail image, fallback icon/gradient, and whether the quiz is featured in the hero CTA.
- `infoPanel` is optional. It controls the editable about/how-it-works/context/disclaimer block shown below each quiz near the restart button.
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

Quiz-specific text stays in quiz JSON. To translate a quiz, copy that quiz's `en.json` to a supported locale file such as `es.json`, translate the full quiz content, and keep the same answer structure. The locale routes combine shared UI translations with locale-specific quiz content, so `/es/quiz/cambridge/` uses Spanish buttons/navigation/footer and `data/quizzes/cambridge/es.json` when that file exists.

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
