# Rainbow Hub quiz engine

Each quiz is one folder:

```text
data/quizzes/my-quiz/
  quiz.json
  en.json
  fr.json
  theme.css        # optional
  assets/          # optional thumbnail, artwork and avatar images
```

`quiz.json` contains engine, listing, estimate and theme settings. Locale files contain only visible translated content. `title` is also the SEO title and `summary` is also the SEO description.

Quiz-specific text belongs in the quiz folder. `landing.cta` controls that quiz's start button in each locale. Shared runner labels such as Continue, Loading ad, Restart and About This Quiz live once in `data/i18n/<locale>.json`; every quiz reuses them and validation rejects missing labels. An `about` block only needs `body` and an optional `disclaimer`—there is no custom About title to maintain.

## Quiz types

Set `engine.scoring` in `quiz.json`:

- `correct-answer` for knowledge tests. Use an answer array and `correct` index.
- `weighted-profile` for personality tests. Use an answer map from visible answer to profile id or weight map.

Every question can choose a folder-configured `presentation`:

- `text` for two to four standard choices.
- `icons` with one localized `icons` entry per choice.
- `scale` for five discrete, keyboard-accessible stops.
- `memory-cue` with three or four `memoryItems` and a localized `continueLabel`.

Questions may also set `delay` (200–400ms), `correct` for hidden objective scoring, and `calibration` values for restrained final adjustment. The engine default is `engine.advanceDelayMs` (200–350ms).

Set `engine.flow` to `linear` or `staged`. Set `advance` to `automatic` or `manual`, and `feedback` to `instant`, `selection-only`, or `after-results`.

For rewarded gates, add `engine.rewarded` with `start`, `stages` and `attempts`. The engine requests Google rewarded inventory itself; AssertiveYield remains responsible for yield/performance tracking. If no rewarded ad can be shown, the engine retries up to `attempts` and then continues automatically. The GAM unit can be changed with `NEXT_PUBLIC_GAM_REWARDED_AD_UNIT`.

Set `engine.checkpoint` to `ai` when the locale files provide the compact `checkpoint` copy block. Each reveal declares `fixed`, `trend`, or `consistency`, so checkpoints can react qualitatively without showing false precision. This creates a localized analysis screen after every stage without editing the runner.

An optional `engine.estimate` keeps entertainment estimates quiz-folder controlled: base and clamp ages, profile adjustments, brain boundaries and final-calibration limit. No estimate logic or content needs to be added to the runner.

## Theme and landing page

All normal customisation is in `quiz.json`: colors, type preset, texture, artwork, header colors and landing/question/result layouts. No engine code changes are needed. The optional `theme.header` block accepts `background`, `text`, `border` and `shadow`; the shared header remains exactly 50px high.

If a quiz needs art direction beyond those settings, add `theme.css` inside that quiz folder. It is discovered automatically—there is no theme registry to edit. Scope every selector under `[data-quiz-theme="<slug>"]` so it cannot affect the shared site header or footer.

To create another quiz, copy one quiz folder, change its slug/config/content, and add or remove locale files. Relative paths such as `assets/thumbnail.jpg` are loaded from that folder automatically. The shared runner does not need to be edited.

## Saved progress

Quiz progress is saved indefinitely in `localStorage`, separately for every quiz and locale. Answers, memory-cue completion, the current question, checkpoint and result screen are restored after refreshes and browser restarts. A synchronous pre-paint restore prevents the server landing from flashing before the saved screen. Ad-loading screens are never persisted: reloading during an ad returns to the safe question/checkpoint that launched it. A structural content signature rejects incompatible progress after a quiz changes, and Restart clears that quiz's saved progress and returns to its landing.

## Add a language

Add one entry to `localeOptions` in `lib/i18n.ts`, add `data/i18n/<locale>.json` and `data/info-pages/<locale>.json`, then add `<locale>.json` to each translated quiz folder. Routes and language menus are generated from that registry.

## Check the site

```bash
npm run lint
npm run build
```
