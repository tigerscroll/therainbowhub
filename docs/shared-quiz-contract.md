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
- Shared selection-only engine with automatic question progression.
- Rewarded entry, checkpoints and result reveal; there are no in-page ad placements.
- One persistent continuous shell for landing, questions, checkpoints and results.
- No intermediate checkpoints or scores.
- One three-row result checklist after question ten.
- Free incorrect-answer review and no question explanations.
- No per-quiz advertising variants; the display placements below apply to every quiz.
- Standard split landing, card questions and immersive results.
- Standard landing content: intro and configurable CTA only. Each quiz stores one stable `listing.socialProofCount`; the locale-specific social-proof sentence comes exclusively from `data/i18n/{locale}.json` via `quiz.socialProofTaken`.
- No landing artwork panel.

## Theme-owned presentation

Quiz themes may change colours, fonts, icons, texture and decorative details.
They must not change the shell width, minimum height, spacing, CTA geometry,
progress layout, checkpoint hierarchy, social-proof geometry or responsive
breakpoints. Those are owned by `styles/quiz-shell-contract.css` and published
as a content-hashed, immutable `/styles/quiz-shell-contract.<hash>.css` asset.

Answer buttons have a 90px minimum height on mobile and desktop, with extra
height only when their content needs it. Start and checkpoint CTAs retain their
72px minimum. Taller viewports do not stretch the buttons.

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

The active site publishes quizzes and standard information pages only. Article
wrappers, article payload routes, and article-specific display/rewarded ads are
retired. Quizzes retain the original themed shell and use the shared display placements.

Every quiz and locale uses rewarded ads only on `/22677279144/rewarded`.
Start, chapter Continue, final result reveal and optional result breakdowns use
the shared rewarded gate. A direct-entry quiz uses its first answer as the entry
gate and shows the ad notice beside that interaction. There are no Fluid, display
or interstitial placements and no timer-based refreshes.

Selecting an answer automatically advances after the selection feedback. Scrolling
starts after the new question renders. Every checkpoint saves the completed
answers and next screen before reloading the document. If storage is unavailable,
it continues in memory. Saved progress restores before ads can be requested.
Answer and primary CTA buttons have an 80px minimum height and grow for long text.
Closing an ad early leaves the current step available for another attempt.
Unavailable inventory uses bounded retries, then permits progress. The final
result sends the Meta custom event `QuizComplete`, never `AdClick`; rewarded
completion itself does not send `QuizComplete`.

`QuizEngine` must remain slug-agnostic. Any subject-specific content belongs in
the quiz data; any subject-specific visual identity belongs in its scoped theme.
The production validator rejects slug-specific engine branches.
