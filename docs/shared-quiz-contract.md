# Shared quiz contract

Every quiz folder is automatically validated by both `npm run lint` and
`npm run build`. A new quiz is rejected unless it follows the shared product
structure below.

## Fixed structure

- English content only: `quiz.json`, `en.json`, `theme.css`.
- Exactly five stages with exactly eight questions in each stage.
- Shared staged, automatic, selection-only engine with a 450ms transition.
- Rewarded Start and rewarded stage checkpoints with three unavailable-ad attempts.
- One persistent continuous shell for landing, questions, checkpoints and results.
- Progress-only checkpoints after stages one to four; no intermediate stage score.
- `Continue` plus the shared arrow for stages one to four.
- A three-row result checklist only at the final checkpoint.
- Free incorrect-answer review and no question explanations.
- No display-ad flow variants.
- Standard split landing, card questions and immersive results.
- Standard landing content: intro, social proof and configurable CTA only.
- No landing artwork panel.

## Theme-owned presentation

Quiz themes may change colours, fonts, icons, texture and decorative details.
They must not change the shell width, minimum height, spacing, CTA geometry,
progress layout, checkpoint hierarchy, social-proof geometry or responsive
breakpoints. Those are owned by `components/quiz/quizShellContract.ts`.

## Runtime rule

`QuizEngine` must remain slug-agnostic. Any subject-specific content belongs in
the quiz data; any subject-specific visual identity belongs in its scoped theme.
The production validator rejects slug-specific engine branches.
