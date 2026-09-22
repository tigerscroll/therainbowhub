# Supplied locale audits: follow-up corrections

Date: 22 September 2026. Scope: local source and static export only; no deployment.

This follows `three-quiz-final-editorial-audit-2026-09-22.md` and applies the subsequent user-supplied Years Left, Memory and Vision reviews. It does not treat the reviews' “green” labels as independent proof of native-language quality.

## Vision

Corrected the reported copy in 11 locales: `bg fi fil hu it ja ms ro he th vi`.

- Replaced broken or overly literal eyebrow headings, especially Finnish, Filipino and Hungarian.
- Corrected “miss” meaning “long for” to “fail to notice” in Finnish, Malay and Romanian.
- Corrected Romanian and Italian grammar and aligned Romanian/Hungarian CTA register.
- Used optical-illusion wording in Japanese and Thai and more natural observation/pattern wording in Vietnamese.
- Aligned Hebrew landing/about address and rewrote adjacent malformed about copy in Finnish, Filipino, Hungarian, Romanian and Japanese.

No Vision questions, answers, study/rendering data, checkpoints or results changed. A direct comparison against the starting Git revision confirmed this for all 11 changed locale files. `OFFICE FOCUS: FIND FIVE FLAGS FAST.`, literal codes and swatch identities remain intact.

## Memory

Applied only the requested CTA polish and the corresponding start-instruction reference:

- Danish: `Start testen`.
- Croatian: `Započni`.
- Norwegian Bokmål: `Start testen`.

A direct comparison against the starting Git revision confirmed that these six strings are the only Memory changes. This narrow change is not a new blanket certification of the remainder of Memory's existing copy.

## Years Left

Reworked the full question/answer wording in `uk pl cs sk ro hu hr sr bg el he ar fr fi id tr`, together with substantial checkpoint, result-profile, review and explanatory copy. This addresses untranslated fragments, mixed address/register, literal jokes and answers mistakenly written as commands to the player. Quoted future-self messages remain quotes where required by the question.

Made targeted semantic/grammar corrections in `de pt nl es it sv da nb ms th vi fil`, and aligned the Japanese start instruction with its actual button. Examples include:

- Choosing the fastest route rather than waiting for stairs to “arrive”.
- Trying to beat the elevator upstairs rather than making the elevator faster.
- Choosing an unusual dish rather than turning the player into an unusual option.
- Abandoning a rain-spoiled plan rather than surrendering to the police.
- Feeling overwhelmed by commitments rather than emotionally moved.
- Correct age-unit suffixes and result headings rather than duplicated or mistranslated “years left”.

All Years Left locale start instructions now reference the displayed CTA exactly. The existing English source was not changed in this follow-up.

## Preserved contracts

All changed locale JSONs retain their original key/array structure and non-string values. Question and answer IDs, answer order, weights, correct-answer keys, calibration and manifests are unchanged. Five rounds of six questions, SPA navigation, reward gates and ad-unit configuration are unchanged. No production configuration or application behavior was changed.

## Verification

- Automated suite: 82 tests passed, including four new follow-up regression tests.
- Quiz, localization, production, TypeScript and static-export validation: passed; 2,096 pages built.
- Direct baseline comparisons: 43 locale files preserve schema; all 11 changed Vision question sets are untouched; Memory changes are CTA-only.
- Responsive subtitle checks: all 270 passed (three quizzes × 30 locales × 320px, 390px and 1440px), with two subtitle lines and no horizontal overflow.
- Full browser journeys: all 90 passed (30 per quiz), covering 2,700 questions, 450 checkpoints and 540 mocked rewarded gates. Both flow-test processes exited with code 0.
- Answer mapping, correct Vision/Memory scores, identical Years Left age for identical choices across locales, one-document SPA navigation and absence of page errors passed.
- Representative Hebrew/Japanese Vision and Arabic/German Years Left screens were visually inspected; text and puzzle layouts remained within the viewport.
- `git diff --check`: passed.

The first build was blocked by Finder metadata at `data/quizzes/.DS_Store`. It was moved, not deleted, to `/private/tmp/quiz-finder-metadata.UP18tF/quiz-data.DS_Store`; the subsequent complete build passed.

## Limits

This is an AI-assisted editorial correction pass with automated regression and browser checks, not independent native-speaker certification of every sentence in 29 languages. Schema parity and passing flows do not prove linguistic perfection. Browser tests use mocked rewarded ads and block external requests; they do not test live ad fill or production delivery.
