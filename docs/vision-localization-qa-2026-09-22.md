# Vision locale rollout — 22 September 2026

Follow-up: see [the three-quiz final editorial audit](three-quiz-final-editorial-audit-2026-09-22.md) for the subsequent translation corrections and latest verification. The figures below describe the initial rollout.

## Scope

The local Vision implementation now enables all 30 supported locales with the
same five-round, six-question structure. This is a local source/build change;
this report does not assert a production deployment.

Locales: en, ar, bg, cs, da, de, el, es, fi, fil, fr, he, hr, hu, id, it,
ja, ms, nb, nl, pl, pt, ro, sk, sr, sv, th, tr, uk and vi.

The 30 stable question IDs and answer keys are shared across locales. Legacy
`rXqY` IDs are not treated as displayed round numbers. Publication uses strict
locale parity rather than falling back to English questions.

## Translation work

- Reused existing locale content where available, including the older full
  question banks for six languages.
- Used Google Translate for draft public quiz text with the user's explicit
  permission. No credentials, analytics or visitor data were submitted.
- Reviewed and rewrote round titles, transitions, subtitles, instructions,
  final checklists, category labels and ambiguous puzzle wording.
- Corrected literal mistranslations of square/plaza, navy/naval force,
  character/person, letter/correspondence, and sun/Sunday.
- Corrected translated or missing symbols, literal Latin code characters and
  memory-board emojis. Technical puzzle content must not be translated.
- Localized the paper-fold diagram labels for every non-English locale.
- Kept physical puzzle order left-to-right within Arabic and Hebrew layouts.
  The page's normal right-to-left text direction is retained.
- Changed Vision's decorative outer container from `overflow: hidden` to
  `overflow: clip`: the oversized background shapes must be clipped, not create
  an internally scrollable surface that can shift the question off-screen.

The `F` and `THE` counting sentences deliberately remain literal English puzzle
data. Their instructions are translated; replacing those sentences would change
the answers.

## Verification

Final local results: **72/72 unit tests passed**, production build and export
validation passed, and **30/30 complete browser journeys passed** after the
internal-scroll fix. `git diff --check` also passed.

`npm test` covers all 30 locale structures, scoring thresholds, answer mappings,
recall-board parity, colour-mismatch swatches, code characters, literal visual
sequences and localized diagram paths. The full suite has 72 tests.

`npm run build` validates locale content, production configuration, TypeScript
and all exported routes.

`node scripts/test-vision-locales.mjs` runs complete 390px-wide browser journeys
for all 30 locales, including 900 questions, 150 round checkpoints, final scoring,
one-document SPA navigation, page overflow and internal horizontal-scroll checks.
Selected screenshots additionally assert that the question bounds are inside
the viewport after transitions settle. It checks six **mocked**
rewarded requests per journey; it does not test real ad availability. All
external network requests are blocked during this test. Representative Arabic,
Hebrew, Japanese and German screens are also captured for visual inspection.

## Limits

Automated checks establish structure, rendering and puzzle integrity; they do
not certify native linguistic perfection. This work includes translation-tool
drafting and an AI wording review, not independent human native-speaker sign-off
for all 29 translated languages. A native editorial review remains the way to
obtain that stronger assurance, especially for stylistic tone and result prose.
