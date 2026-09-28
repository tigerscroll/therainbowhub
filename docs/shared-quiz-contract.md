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
- Shared selection-only engine with manual Next Question navigation.
- Free Start, checkpoints and result reveal; display ads appear only on question screens.
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

Every quiz and locale uses `/22677279144/display`, requesting only 336×280.
The first question shows a full-width ad row below the question content. From
question two onward a second row appears below the answers, above Next Question.
Selecting an answer does not advance or trigger an interstitial. Next Question is a real link styled as a button; it updates the URL and quiz content without reloading. GPT manages the web interstitial on `/22677279144/display`. Every optional trigger is disabled, and answer controls, header, footer, about and recommendation links opt out. One interstitial slot persists for the quiz session; GPT controls fill and frequency.
Slots persist across questions without timed or per-answer refreshes. Leaving
the question screen destroys only these slots. Landing, checkpoint, results and
information pages have no display slots. Saved progress restores before ads mount.
No-fill and blocked GPT collapse the rows; widths below 336px skip requests.

Start, study cues, checkpoints and all result breakdowns are free of rewarded
ads. There is no native card in the live quiz flow. Checkpoints and Continue
stay client-side without document reloads. The optional first-answer entry
setting still opens directly on question one, without requesting a reward.

`QuizEngine` must remain slug-agnostic. Any subject-specific content belongs in
the quiz data; any subject-specific visual identity belongs in its scoped theme.
The production validator rejects slug-specific engine branches.
