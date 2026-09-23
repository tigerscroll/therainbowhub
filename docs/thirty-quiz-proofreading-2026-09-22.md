# Follow-up proofreading — 22 September 2026

## Scope and standard

The 30 quizzes in `scripts/round-expansion/config.mjs`: English and all 29 translated editions (900 editions, including 870 translated files). Original main titles, routes, question IDs, answer keys, scoring, five-round structure and ad behaviour are preserved. No production deployment is included.

This pass combines English-source review, targeted cross-language semantic proofreading and whole-pack automated checks. It is **not** a claim that 29 independent native-speaking subject editors have reviewed every sentence. Passing schema checks alone cannot establish translation accuracy; several substantive errors below had passed those checks.

## Corrections

- Harvard: the funded-project deduction now states that **all funded projects** were reviewed. The former “funded pilots” premise did not establish that Project K belonged to that category.
- Harvard: the experimental programme is no longer confused with an aircraft pilot. Percentages and the cautious-conclusion answer remain unchanged.
- Harvard/Oxford: translated impartiality, concise-text and analogy questions use explicit local-language meanings. This repairs untranslated English, wrong parts of speech, answer-revealing synonyms and the Norwegian answer that previously meant “biased”.
- Cambridge: `AAAA → AAAB → AABB → ABBB` and its answer choices remain literal puzzle data. Transliteration had changed the pattern in some languages.
- IQ: the Mara/Leo/Nia ordering puzzle preserves the same names in all four choices. “Order” means a sequence, not a purchase or command; Leo is not translated as a lion.
- RAF: the above/below/higher rank questions consistently use official British rank names in both prompts and choices, instead of approximate local military equivalents.
- Clinical examples: “alert” means awake and responsive, not an alarm, notification or guarded attitude. Evidence-card and accessible text, a trend sequence and an earlier-observation distractor are corrected. Japanese and Slovak deterioration narratives are clarified.
- Evidence cards: headings use contextual native wording. A “clear” exit is unobstructed, not bright weather or a delete command. “Unaccounted for” people are missing, not merely unidentified. Numerical evidence and layout separators are preserved.
- Aviation: elevator is a flight-control surface, not a building lift. Additional Finnish, Japanese and Vietnamese instrument, pitch, cloud and angle-of-attack terms are corrected.
- Dentistry: crown means the anatomical tooth crown; targeted wisdom-tooth, plaque and enamel/pulp wording is corrected.
- Religious quizzes: a calling is a religious vocation, guidance is spiritual rather than career advice, and ordained ministry is not a government ministry. Additional Japanese/Finnish/Vietnamese prayer and formation terminology is corrected.
- Anatomy and Harvard round headings are contextualized: body foundations are not cosmetics/building foundations, systems are bodily systems, and case analysis is not a literal room. Checkpoint headings remain consistent.
- The shared reasoning subtitle used by ten quizzes has natural two-line wording in every translated locale, without literal electrical/network “connections” or mixed forms of address. The Japanese Nursing “Body & Observations” heading refers to the human body rather than an abstract entity.

## Repeatability and regression protection

Corrections are stored in the `scripts/round-expansion/proofreading-*.mjs` modules and applied at the end of `localization-polish.mjs`, after reused vocabulary and earlier polish. These scripts are editorial tooling, not new browser/runtime logic.

`components/quiz/proofreadingExpansion.test.ts` adds nine regression checks, covering all 29 locales. Existing full-edition structure/scoring and original-title checks remain in place. No validator was weakened to accommodate these changes.

## Verification

- Final test suite: **161/161 passed**. Existing checks cover the structure, scoring and original titles of all 900 editions.
- Final production build, TypeScript, quiz/localization/production validators and static-export validation passed: **2,038 pages**.
- Full-pack draft audit passed for **870/870 translated files**, with no reported errors.
- First rendered-build verification: 30/30 complete mobile journeys passed at 320px, covering all 30 quizzes and rotating through all 29 translated locales.
- After the clinical and terminology refinements: another **12/12 complete mobile journeys passed**, covering Nursing, Paramedic, Nun, Catholic, IQ, Midwifery, Cambridge, Oxford, Harvard, Airforce, Dentist and Pilot in Japanese, Finnish, Arabic or Slovak.
- After the shared-subtitle and Japanese heading polish: Japanese Nursing and Slovak Oxford complete mobile journeys passed (2/2).
- A separate final mobile landing-page check covered all 29 translated Oxford editions: no overflow and exact copy readback. One Bulgarian subtitle wrapped onto a third line at 320px and was shortened; its rebuilt page was rechecked successfully. All 29 now render the shared subtitle as two lines at 320px.
- All 870 translated files were checked against the repeatable proofreading overrides; none differed.

Browser tests block non-local requests and mock rewarded ads. They check all 30 answers, five checkpoints, scoring/results, answer review, native labels, one-document SPA navigation, clipping/overflow and JavaScript errors. They do not send production analytics or test live ad fill.

Remaining limitation: native editorial and specialist review is still the appropriate independent standard for an absolute language-quality sign-off. The automated checks verify invariants and the corrected fixtures, not every possible stylistic or technical nuance.
