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
- No per-quiz display-ad flow variants; the shared native placement below applies to every question screen.
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
retired. Quizzes retain the original themed shell and rewarded placement.

Every quiz and locale shares one in-page native card beneath the question/answer
content, inside the quiz shell. It uses `/22677279144/quiz_native_card` with
Fluid sizing: full available content width, creative-controlled height. It is
separated from answer controls and labelled in the current language. The card
persists across question changes (including memory study cues) without timed or
per-answer refreshes. Leaving questions destroys only that native slot. Returning
from a checkpoint mounts a new card; landing, checkpoint, result, home and info
screens have none. The slot mounts only after saved progress has been restored,
so a restored checkpoint cannot briefly request an ad. No-fill or blocked GPT
leaves no empty ad frame and never gates answers. Rewarded ads continue to use
`/22677279144/rewarded` independently.

An optional manifest setting, `engine.entry: "first-answer"`, opens directly
on the first question and moves the existing Start reward to the first answer.
Only Years Left currently enables it, in all its supported locales. Each question
has three choices. The first question's translated header label identifies the
test in a compact themed hourglass badge; later questions keep their chapter
labels. The small, muted notice below the choices explains the ad
before the user chooses. The tapped answer is highlighted while the gate is busy,
but that temporary selection is not scored or saved. No rewarded ad is
requested on arrival; early closure leaves the question unanswered and allows
another attempt. Completion/no-fill accepts the choice, and subsequent answers
are unchanged. In the automatic flow, accepting that gated first answer and
showing question two happen in the same update, without the normal answer delay
after the ad closes. Saved in-progress attempts survive entry-mode changes.

Years Left enables `engine.hardRefreshCheckpoints`: after the last answer of
each chapter, progress is saved and the document reloads into that checkpoint
(including the final result gate). Questions within a chapter and the rewarded
Continue action remain client-side. Checkpoint arrival does not request an ad.
If browser storage cannot save progress, the engine continues without reloading
so answers are not lost. Other quizzes retain their existing no-reload flow.

`QuizEngine` must remain slug-agnostic. Any subject-specific content belongs in
the quiz data; any subject-specific visual identity belongs in its scoped theme.
The production validator rejects slug-specific engine branches.
