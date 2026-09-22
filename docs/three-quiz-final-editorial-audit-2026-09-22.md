# Final editorial pass: Vision, Memory and Years Left

Date: 22 September 2026. Scope: local source and static export; no deployment.

## Coverage

All three quizzes and all 30 supported locales were included in the corpus checks and browser subtitle checks. The language review compared questions, answer meanings, repeated clues, selected instructions, checkpoint headers and result labels with the English source. High-risk passages received focused manual correction. This is an AI editorial review with automated semantic checks, not independent native-speaker certification of every sentence.

## Corrections

- **Vision:** corrected contrast distractors that described a person instead of a square; replaced hyperlink-style “reference” wording with a visual example; clarified green tint rather than movement; repaired ordinal labels, mixed English result names and swatch labels; preserved the literal Latin F in the changed-code question and corrected Indonesian lemon terminology.
- **Memory:** corrected ordinal choices and animal vocabulary, Japanese time-of-day versus duration wording, consistent compass terminology, and inflected names in journey/ticket questions. The existing reviewed study-board fixtures still enforce recall relationships and delayed answers.
- **Years Left:** corrected free-time questions mistranslated as occupation questions; made future older-self wording explicit; distinguished unexpected extra money from unexpected expenses; repaired mixed English/Ukrainian and Slovak text; extensively rewrote Japanese questions and choices for clear quiz-style wording.
- **English source clarity:** rephrased three Years Left prompts about a free hour, choosing a hobby, and extra money. The hobby prompt now allows a new hobby as well as returning to an old one, matching its existing choices. Answer IDs and scoring are unchanged.
- **Checkpoints:** reused reviewed, locale-specific round-completion headers rather than literal translations such as “round pattern” or computer memory/storage.
- **Subtitles:** shortened 11 Vision subtitles and one Malay Memory subtitle after actual 320px rendering checks. They retain two deliberate lines and do not advertise the question count.
- **Wrapping:** long translated footer links could protrude horizontally on narrow screens. Added `max-width: 100%` and `overflow-wrap: anywhere` to footer links. This shared CSS fix does not change navigation or quiz behavior.

## Invariants

Five rounds of six questions remain unchanged. No question or answer IDs, correct-answer keys, weights, thresholds, calibration, study modes, rewarded placement IDs or SPA behavior changed. Existing unrelated work was preserved. Technical codes, symbol order and literal English puzzle sentences are intentional puzzle data, not missing translations.

## Verification

- Production build, TypeScript and quiz/localization/production/export validators: passed; 2,096 static pages.
- Automated tests: 78 passed, including four new editorial regression tests.
- Subtitle/rendering checks: 270 passed (90 locale routes at 320px, 390px and 1440px), exactly two subtitle lines and no horizontal overflow.
- Full browser journeys: all 90 passed (30 per quiz), covering 2,700 questions, 450 checkpoints and 540 mocked rewarded gates. Both test processes exited successfully. Vision's browser shutdown took longer after its completed assertions but exited with code 0 without intervention.
- All-locale score/answer checks, one-document SPA navigation and horizontal-overflow checks passed. Representative Arabic, Hebrew and Japanese screens were inspected.
- `git diff --check`: passed.

Browser tests block external network requests and mock rewarded-ad events. They verify the quiz flow, not real ad fill or production delivery. Independent native-speaker review remains necessary for a stronger language-quality certification.

## Reproduction

```sh
npm run build
npm test
node scripts/serve-export.mjs 3198
# Separate terminal, with local Chrome available:
node scripts/test-three-quiz-subtitles.mjs
node scripts/test-vision-locales.mjs
node scripts/test-memory-years-locales.mjs
```

This follow-up supersedes the earlier reports' unchanged-English and test-count statements: English Years Left now has the three wording clarifications described above, and the suite has 78 tests.
