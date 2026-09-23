# Thirty-quiz localization — 22 September 2026

Follow-up: the subsequent proofreading pass found and corrected further semantic issues. See [the proofreading record](thirty-quiz-proofreading-2026-09-22.md) for the later corrections and verification; the figures below describe the original localization pass.

## Scope

The 30 quizzes in the approved English master pack, each with five rounds of six questions, translated into the 29 non-English site locales. This does not change the previously localized Memory, Years Left or Vision editions, or migrate the English-only Treatments/Mechanic editions. The existing `/motorbike` route is retained.

Original main quiz titles are preserved, including the existing reviewed localized titles. No deployment is part of this work.

## English edits

- Firefighter map-scale question explicitly asks for the distance represented by 4.8 cm.
- Nursing priority question: “Which person should be prioritised now?”
- Paramedic distractor replaces the shorter-name joke with stable observations.
- Paramedic final priority question: “Which person should receive priority attention?”
- Removed retained question-header references to the former ten-question structure.

## Translation method and meaningful adaptations

- Reuse unchanged reviewed quiz copy by stable question and answer IDs.
- Reuse the older complete native banks where available, rather than retranslating deliberately incorrect grammar choices.
- Obtain machine-translation drafts for public quiz text only. No credentials, visitor information or production events are sent.
- Review technical terminology, distinct answer choices, dates, codes, register and repeated interface language before activating routes.
- Grammar retains the ten existing native questions. French, German, Italian, Dutch, Spanish and Portuguese also reuse their complete native grammar banks. For the other 23 locales, the twenty added questions test sentence meaning, restrictions, reference, chronology and editing clarity rather than importing English-only apostrophe or agreement rules. Their answer IDs remain unchanged.
- English-only homophone/anagram and compound-word puzzles receive portable language-pattern equivalents. The existing native palindrome and literal letter-code questions are preserved.
- Aviation terms are clarified where words such as pitch, elevator or heading could otherwise be mistranslated.
- Biblical book titles use established local names; existing reviewed names and subject vocabulary are reused within the same quiz.
- Japanese calendar dates use the native month/day order, with narrowly specified validator exceptions for the exact equivalent dates.
- Vietnamese calendar dates also retain native day/month wording with exact-value validation.
- A second semantic pass replaces ambiguous short-word drafts: tree trunk/branches versus luggage/business senses, theatre play versus a game, bird/flock and fish/school relationships, and the all/none quantifiers in the NIM/TOV/RAK logic puzzle. Word-association prompts use reviewed native noun glossaries, rather than untranslated uppercase English terms.
- Regression fixtures cover these meaning repairs, official RAF ranks, biblical book titles, literal codes and NATO spelling words. They guard the reviewed copy but are not a substitute for linguistic judgment.
- Shared checkpoints use concise subject-neutral native copy. Memory-specific progress and reveal labels are not reused on other quizzes. Identical standard result buttons use the existing shared-i18n fallback; weighted-profile Personality retains an explicit localized profile button where needed. Portuguese copy maintains the site's shared-locale convention; German maintains its established formal register.
- Four anatomical naming questions are recast as location/function questions in every translated edition, so a local language using the same common and technical word does not reveal the answer in the prompt.

## Safety and repeatability

`scripts/round-expansion/localize.mjs` writes inactive drafts and saves a resumable cache after each request batch. Parsing failures do not silently drop strings or puzzle tokens. Review warnings are not release approval.

Run the localization polish after drafting. Activation is a separate script which first runs the draft audit and the full selected-locale validator. Scoring, answer-order rules, rewarded-only behavior and the SPA flow are unchanged.

This is a machine-assisted localization and engineering review, not independent certification by 29 native-speaking subject specialists. Automated checks cannot prove every stylistic nuance or specialized term is perfect.

## Verification status

- All 870 translated files present and locally active; all 30 manifests have strict locale parity and 30 supported locales including English.
- Original English and localized main titles match the pinned pre-migration baseline.
- 152 automated tests pass. Structure/scoring checks cover all 900 quiz editions; semantic regression fixtures cover the reviewed terminology and localized puzzle repairs.
- Production build, TypeScript, quiz/localization/production validators and static-export validation pass: 2,038 generated pages.
- Complete browser journeys passed for every quiz theme at 320px, rotating through all 29 translated locales.
- Grammar, IQ and Word each passed complete 30-question journeys in all 29 translated locales. IQ and Word were then rerun after the final analogy repairs: all 58 passed.
- Anatomy and Dentist passed in Arabic, Japanese and Spanish at 320px after their question adaptations. Desktop Hebrew Grammar, German IQ and Japanese Personality passed at 1,280px.
- Visual review inspected Arabic checkpoints, Japanese questions and Spanish landing layouts. This caught the Memory-specific shared-copy mistake, which has been corrected and regression-tested.
- Post-correction visual review confirmed neutral progress labels in Arabic and Finnish mobile checkpoints and Japanese desktop checkpoints. All five Personality shared-button edge cases (`fi`, `id`, `ja`, `ms`, `vi`) passed complete desktop journeys with explicit profile-result labels.
- Final checkpoint-label browser rerun: **30 of 30 complete mobile journeys passed**, one per quiz, covering all 29 translated locales. Assertions wait for transient ad-loading text to settle and check DOM text rather than CSS-capitalized text. The corrected progress and final-result labels are verified in the rendered build.

**Local implementation and engineering checks complete. No known failing tests remain. Not deployed.** Independent native-speaking subject review is still the stronger standard for an absolute linguistic-quality sign-off; this work does not claim that certification.

Browser tests block every non-local request and mock rewarded-ad events. They verify the 30-answer/five-checkpoint journey, result and answer-review keys, Personality profile, six main rewarded gates plus the optional review gate, native button labels, image decoding, no horizontal overflow, no answer clipping, no JavaScript errors and only one document navigation. They do not test live ad fill or production analytics.

No production deployment was performed. This report is an engineering/localization QA record, not a claim of independent native-speaker certification or professional examination validity.
