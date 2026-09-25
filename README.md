# Rainbow Hub quiz engine

The standard quiz is **10 themed rounds × 7 questions**. All quizzes use the same chapter layout, automatic answer advancement, topic-profile checkpoints and final result screen. The supported languages are English, French, German, Italian, Dutch, Spanish, Portuguese and Arabic.

## Add a quiz

Add one folder under `data/quizzes/`:

```text
my-quiz/
  quiz.json       # Shared structure, scoring, listing and theme
  en.json         # Visible English content
  fr.json
  de.json
  it.json
  nl.json
  es.json
  pt.json
  ar.json
  theme.css       # Optional custom styling
  assets/         # Optional artwork
```

Folders containing `quiz.json` are discovered automatically. The home page, routes, recommendations, sitemap, assets and validation use this catalogue. There is no quiz registration list and no runner code to edit. Rebuild the static site after adding or changing content.

For an authoring scaffold:

```sh
npm run create:quiz -- my-quiz --title "My Quiz"
```

This creates the 70-question English structure. Replace its placeholder questions, answers, result profiles and artwork, then add the seven translated JSON files. The scaffold is a starting point, not finished quiz content.

## JSON structure

Use `schemaVersion: 2` and `template: "ten-stage-seven-question-v1"` in `quiz.json`. The manifest defines ten stages with seven stable question IDs each. Each question has four stable answer IDs; the locale files provide the corresponding visible question and answer text.

- Knowledge quizzes use `engine.scoring: "correct-answer"`, `correctAnswerId` and a result category.
- Personality quizzes use `engine.scoring: "weighted-profile"` and `choiceMeanings` keyed by answer ID.
- Each locale has matching `stages`, `career.stages`, result profiles and dimensions. Translation must preserve IDs and scoring meanings, adapting wordplay and terminology where necessary.

See an existing normal quiz folder for a complete example. English headlines and landing subtitles stay in `en.json`; translations stay alongside it. There are no alternate edition directories.

The shared template supplies the flow, checkpoint layout, finite animations, reduced-motion support and question transitions. Only the question transitions between answers; the topic heading stays mounted. Checkpoints preview the completed topic and tease the next one, without showing the overall journey length. Result sharing is disabled.

English buttons are `Start`, `Continue` and `See My Result`; the UI adds the arrows. Shared labels such as loading and restart live in `data/i18n/<locale>.json`. Topic titles, questions, result text and checkpoint copy belong in the quiz locale JSON.

The existing Start rewarded ad, ten chapter reward opportunities and optional result-review reward use the shared runner. Ad inventory is requested from the configured rewarded unit. Browser tests mock delivery; they do not verify live advertising inventory.

## Presentation and language

Questions can use text, icons, sequences, grids, codes, spatial artwork or study cues. A study cue is part of a question, not an extra scored interaction. Numeric examples must state units, and answer keys must agree with localized diagrams and recall cues.

Use English that readers in the UK, Australia, Canada and US can understand. Portuguese should use vocabulary shared by Brazil and Portugal or explain both names when needed. Arabic uses native prose with isolated Latin puzzle codes and arithmetic; ordered memory boards retain the visual order used by the answer key.

Normal colors, typography, layout and artwork are configured in `quiz.json`. Optional `theme.css` is discovered automatically. Scope its selectors under `[data-quiz-theme="my-quiz"]`.

Quiz progress is saved locally for 30 minutes per quiz and language. A structural signature rejects incompatible saved progress after content changes. Restart clears the current quiz's saved session.

## Check the site

```sh
npm run lint
npm run build
npm run preview -- 3198
npm run test:chapter-flows
```

Run lint and build sequentially because both prepare public assets. Build validates all quiz content and exports the static site to `out/`. The [localization workflow](scripts/chapter-locales/README.md) describes optional authoring tools and the browser test matrix. JSON files are the runtime source; building the site never calls a translation service.
