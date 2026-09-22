# Memory and Years Left locale audit — 22 September 2026

Follow-up: see [the three-quiz final editorial audit](three-quiz-final-editorial-audit-2026-09-22.md) for subsequent wording corrections, English prompt clarifications and the latest verification results. The figures below describe the initial locale rollout.

## Scope

Both quizzes now enable all 30 supported locales: en, ar, bg, cs, da, de, el, es, fi, fil, fr, he, hr, hu, id, it, ja, ms, nb, nl, pl, pt, ro, sk, sr, sv, th, tr, uk and vi.

The English JSON files are unchanged. Every locale uses the same five rounds of six questions, question and answer IDs, scoring, calibration, study modes and rewarded-only SPA flow. Each intro remains two short lines without advertising the question count. Locale parity is strict.

## Translation review

Machine-assisted drafts received an editorial and semantic review, including round names, instructions, choices, checkpoints, result profiles and entertainment disclaimers. This is not independent native-speaker certification.

Memory received a reviewed vocabulary fixture to keep study-board objects, colors, person/object associations and delayed-recall answers consistent. Literal codes and numeric sequences remain unchanged. Arabic/Hebrew technical sequences use directional isolates. Portuguese explicitly pairs “comboio / trem” where the remembered train must be recognizable across variants. Other corrections include idiomatic Years Left answers, alarm-clock wording, grammatical agreement, and result titles where machine translation confused memory recall with a telephone callback.

The only layout change replaces root `overflow: hidden` with `overflow: clip`, preventing focus from horizontally scrolling the decorated quiz root.

## Verification

- Production build, TypeScript, quiz/localization/production/export validators passed; 2,096 static pages generated.
- Automated suite: 74 tests passed, including new locale-parity and memory-semantic regressions.
- 60 complete browser journeys passed: both quizzes in every locale, 30 answers each, five checkpoints, six mocked rewarded gates, translated result text, no page errors or horizontal overflow.
- Identical Years Left answers produced identical estimated ages across all locales; Memory scores matched the canonical answer IDs.
- English flow assertions passed at 320px mobile and 1440px desktop widths for both quizzes.
- After the final Hebrew wording correction, the production rebuild and 74 tests passed again; both complete Hebrew quiz journeys also passed.
- `git diff --check` passed; both English content files have no diff.

Browser tests block external requests and simulate rewarded events. They validate application transitions, not live advertising availability or delivery. No production deployment was performed in this task.

## Reproduction

```sh
npm run build
npm test
node scripts/serve-export.mjs 3198
# In another terminal (requires the configured local Chrome executable):
node scripts/test-memory-years-locales.mjs
```

Use `QUIZ_TEST_LOCALES=he` for the targeted Hebrew recheck. `QUIZ_TEST_URL` overrides the local export URL.
