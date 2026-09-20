# Translation audit — 20 September 2026

## Coverage and outcome

- Automated checks covered all **53 quizzes × 30 locales = 1,590 quiz locale files**, including English, plus the shared interface and information-page localization checks.
- **3,794 visible string values corrected in 1,170 files**, spanning 50 quizzes and all 30 locales. Counts compare the earliest per-file backup made during this pass with the final content, excluding intermediate edits that were subsequently replaced.
- No quiz manifest, scoring weight, correct-answer ID, question ID, answer order, ad behavior or runtime layout was changed by this pass.
- Existing unrelated workspace changes were preserved.

## Corrections

1. **Contextual terminology:** dental calculus, pulp and cementum; the radius bone; hamstring muscles; appendix and gallbladder; aviation lift; kitchen tools; a torn sterile wrapper; documented body sides; biblical books and names.
2. **Landing copy:** repaired literal translations of “make the smartest call,” “sharp memory,” and word matching; clarified age-result phrasing; repaired Romanian diacritics. Two explicit subtitle lines remain enforced.
3. **Results UI:** “questions missed” now means incorrect answers rather than omitted questions; threshold labels distinguish reaching an 80% score from completing 80% of the quiz.
4. **Grammar:** corrected explanations that no longer matched localized questions; removed ambiguous alternatives in English, Japanese and Hebrew; repaired selected punctuation and agreement issues in other locales. Deliberately incorrect quiz choices remain incorrect.
5. **Scoring-sensitive wordplay:** Japanese and Hebrew now use actual native palindromes. Indonesian and Malay no longer offer a second valid palindrome as a distractor.
6. **Visual puzzles and scales:** restored Latin letters that must match their diagrams and differentiated collapsed Filipino and Slovak answer-scale labels.

Specialist dental terminology was cross-checked against [the ADA’s description of tooth tissues](https://www.mouthhealthy.org/all-topics-a-z/tooth) and [Japanese dental-anatomy terminology from the Lion Foundation for Dental Health](https://www.lion-dent-health.or.jp/labo/article/knowledge/01-1/).

## Permanent safeguards

- Expanded the existing visual-letter validation from A–D to A–Z, retaining the native Grammar exception.
- Extended visible-distinctness validation to profile/self-assessment answer maps, not only scored answer arrays.
- Added three regression tests covering all-locale answer uniqueness, exactly one valid palindrome per locale, and visual answer-token integrity.

## Verification

- TypeScript: passed.
- Test suite: **55/55 passed**.
- Quiz validation: passed.
- All-required-locale validation: passed.
- Production validation: passed.
- Complete static build: **2,096 pages generated**.
- Export validation: passed for every quiz, locale and lazy article-section route.

## Limits of the sign-off

This is a complete automated corpus audit plus focused semantic proofreading across the locales, not an independent native-speaker review of every sentence. Automated structure, token and scoring checks cannot prove idiomatic perfection or rule out every factual ambiguity. The highest-risk linguistic areas received direct corrections; this report does **not** certify that every remaining line has been manually reviewed or that no further translation issue is possible.

Before claiming native-level editorial certification, a native reviewer for each language should review the full rendered question-and-result journey, especially the language-dependent Grammar content and specialist terminology. No live advertising or production deployment was performed.
