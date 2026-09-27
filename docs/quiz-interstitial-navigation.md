# Quiz interstitial navigation

Quizzes use GPT web interstitials on `/22677279144/display`. The slot format is `INTERSTITIAL`, not a display banner or `REWARDED`. Article rewarded ads retain `/22677279144/rewarded`. Google Ad Manager inventory and line items must support web interstitials on the quiz unit. Real fill is not established by mocked browser tests.

- Quiz Start, answer choices and checkpoint CTA anchors carry `data-quiz-interstitial="true"`.
- Other links are excluded using `data-google-interstitial="false"`. Study controls, restarts and answer reviews are not opportunities.
- All optional GPT triggers are disabled. Google retains its own eligibility, consent, dismissal and frequency-cap behavior. There are no retries, forced impressions or reward requirements.
- The interstitial initializer is mounted by the quiz engine only, not the root layout, homepage, information pages or article engine. Existing article rewarded behavior is unchanged.
- Start, each answer and checkpoint CTAs are full-document links. Answers keep their existing button styling. Chapter boundaries and final preparation remain unchanged; selecting an answer advances directly, without a separate Next button or timed feedback pause.
- The selected answer and its destination are saved together synchronously before navigation. A pending-navigation guard rejects duplicate clicks and prevents stale state from overwriting that save while an interstitial is open. Session storage is preferred, with local storage as a fallback. If neither can save safely, the transition stays client-side rather than losing answers.
- Query parameters, including attribution identifiers, survive transitions. Only `quizStep` changes.
- Existing attempts survive the change of the checkpoint-navigation setting; question/scoring changes still invalidate incompatible attempts.
- Quiz `QuizStart` now means clicking Start, not completing a rewarded ad. `QuizComplete` is emitted when the final checkpoint CTA is followed.

Checks: `npm run lint`, `npm run build`, `scripts/test-quiz-interstitial-scope.mjs`, `scripts/test-answer-link-safety.mjs`, `scripts/test-mobile-answer-fill.mjs`, and `scripts/test-years-left-extended-flow.mjs` (mocked GPT, full question/checkpoint/result flow).
