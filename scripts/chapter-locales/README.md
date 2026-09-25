# Chapter editions

`data/chapter-locales.json` lists the 17 quizzes and eight languages that use the ten-stage, seven-question edition. The English source and seven localized copies live in each quiz’s `english-extended` directory. `lib/quizzes.ts` selects that edition for those routes; other locales continue to use the root edition.

Every edition has 70 questions and ten user-triggered chapter reward gates. The existing Start reward and optional result-breakdown reward remain. Headlines and landing subtitles are preserved. Checkpoints show a profile based only on the completed topic, then a teaser for the next topic. They do not display the total number of stages or offer result sharing.

## Editing

- `scripts/english-chapters/` contains the authored English content for the text quizzes, including Personality, Harvard, Oxford and Cambridge. `node scripts/build-english-chapters.mjs personality harvard oxford cambridge` rebuilds just those English editions and their answer/preference keys.
- `titles.mjs`, `checkpoints.mjs`, `teasers.mjs` and `additional-topics.mjs` contain native topic and checkpoint copy. `years-left-*.mjs` contains the authored lifestyle questions.
- The polishing modules preserve answer IDs and scoring positions while correcting domain vocabulary, word puzzles, recall cues and regional language. Portuguese uses shared wording or explains both regional names when the distinction matters.
- `native-additional.mjs` maps fully authored Arabic questions for the four additional quizzes and shared Portuguese Personality wording onto the original shuffled answer IDs. `additional-semantics.mjs` handles context-sensitive reasoning vocabulary in the other languages; `university-currency.mjs` keeps money units distinct from academic credit.
- Arabic prose follows the page direction. `QuizText` isolates Latin codes and arithmetic; ordered study boards keep their left-to-right order so visual recall agrees with the answer key.
- Vision’s localized SVG files change text labels only. Latin row/tile labels and all puzzle geometry stay unchanged.

The committed locale JSON files are the runtime content. A normal build does not call a translation service. To regenerate from a locally retained draft cache, run:

```sh
CHAPTER_TRANSLATION_CACHE=/absolute/path/to/reviewed-cache node scripts/chapter-locales/build.mjs
```

`draft.mjs` is an optional, resumable authoring tool. It sends quiz text to Google Translate and requires authorization for that external transfer. `EXPORT_ONLY=1` writes the exact pending payload without sending it. Its output is a draft: review ambiguous terms, mathematical symbols, answer uniqueness and any language-dependent questions before rebuilding. Do not activate raw drafts.

## Verification

```sh
npm run lint
npm run build
npm run preview -- 3198
npm run test:chapter-flows
```

Run lint and build sequentially because both prepare the public asset directory. The chapter audit checks counts, answer IDs, placeholders, headline/subtitle preservation, untranslated fragments and localized image paths. Unit tests cover scoring boundaries, memory cue consistency, symbol isolation and authored calculations.

The browser runner uses locally mocked rewarded ads and blocks outside requests. It tests complete flows, saved-state restoration, ad unavailability, checkpoint profiles, stable headings, answer visibility and results. `QUIZZES`, `LOCALES`, `WORKERS` and `QUIZ_TEST_WIDTHS` select a smaller matrix. Chrome must be installed at the executable path configured in the runner. Advertising-network delivery itself is not tested by these mocks.

`node scripts/test-chapter-checkpoint-layouts.mjs` checks every checkpoint at 320px. `node scripts/test-arabic-puzzle-layouts.mjs` verifies coordinates, equations, alphabet references and ordered Memory cues on phones and desktop.
