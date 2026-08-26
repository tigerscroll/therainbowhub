# Shared quiz contract

Every quiz folder is automatically validated by both `npm run lint` and
`npm run build`. A new quiz is rejected unless it follows the shared product
structure below.

Start new quiz work with `npm run create:quiz -- <slug>`. The scaffolder emits
schema-v2 data, the ten-question single-stage skeleton, a scoped token-based theme and
a placeholder thumbnail. Placeholder copy and artwork must be replaced before
production; the validators enforce the contract independently.

## Fixed structure

- One manifest, one scoped theme and one worldwide-English content file per quiz: `quiz.json`, `theme.css` and `en.json`.
- The manifest must declare `"template": "single-stage-rewarded-v1"`; shared flow, timing, checkpoint and rewarded settings may not be overridden per quiz.
- Exactly one stage containing exactly ten strong, unique questions.
- Shared linear, automatic, selection-only engine with a 450ms transition.
- Rewarded Start and one rewarded final-result reveal with three unavailable-ad attempts.
- One persistent continuous shell for landing, questions, checkpoints and results.
- No intermediate checkpoints or scores.
- One three-row result checklist after question ten.
- Free incorrect-answer review and no question explanations.
- No display-ad flow variants.
- Standard split landing, card questions and immersive results.
- Standard landing content: intro and configurable CTA only. Each quiz stores one stable `listing.socialProofCount`; the locale-specific social-proof sentence comes exclusively from `data/i18n/{locale}.json` via `quiz.socialProofTaken`.
- No landing artwork panel.

## Theme-owned presentation

Quiz themes may change colours, fonts, icons, texture and decorative details.
They must not change the shell width, minimum height, spacing, CTA geometry,
progress layout, checkpoint hierarchy, social-proof geometry or responsive
breakpoints. Those are owned by `styles/quiz-shell-contract.css` and published
as a content-hashed, immutable `/styles/quiz-shell-contract.<hash>.css` asset.

The manifest is the only owner of scoring, presentation, categories, stage
membership and other mechanics. Locale JSON is keyed text only. Quiz themes
receive their palette through manifest-backed `--quiz-*` variables and may not
repeat palette literals or shared geometry.

## Visual regression

`npm run visual:update` records the approved shared-shell baseline. `npm run
visual:test` replays all 10 interactions for every quiz at 320px, 390px, tablet
and desktop widths, including rewarded fallbacks, checkpoints and results. It
also rejects true horizontal overflow. Update the baseline only after an
intentional, reviewed visual change.

## Runtime rule

`QuizEngine` must remain slug-agnostic. Any subject-specific content belongs in
the quiz data; any subject-specific visual identity belongs in its scoped theme.
The production validator rejects slug-specific engine branches.
