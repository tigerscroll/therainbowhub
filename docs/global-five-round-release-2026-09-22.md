# Five-round locale completion — 22 September 2026

## Scope

Mechanic and Treatments have been migrated from the final English five-round masters into all 29 non-English site locales. Their local manifests now use strict locale parity and enable 30 locales. This is a local implementation, not a production deployment.

The other 33 five-round families were not regenerated. A SHA-256 snapshot of **all quiz JSON outside Mechanic and Treatments**, including the shorter quiz families, was identical before and after migration:

`26da76129d4c4505f26013983e6e7a0972bb0713c1d3a97f014c0381de62a873`

English questions, correct answer IDs/positions, score thresholds, routes and rewarded-ad behaviour remain unchanged. The two migrated families' stale localized titles/subtitles (old pass-rate claims and ten-question references) now follow the current English masters. Other quiz titles are untouched.

## Editorial method

- Public quiz copy only was sent to the previously authorized translation service. No credentials, visitor data or analytics were sent.
- Translations are drafts followed by editorial corrections, not independent native-speaker certification.
- Reused tooling accepts an explicit `QUIZZES=mechanic,treatments` selection; it does not rewrite the established 30-quiz batch during this migration.
- Translation-only source expansions clarify ambiguous shorthand without changing the English masters or intended correct answers: occupational therapy is not assumed to share a word with employment; anaesthesia choices name the full treatment; misfire diagnosis refers to a faulty component rather than a criminal suspect.
- Reviewed heading, terminology, subtitle and safety-copy tables cover every translated locale. Specific corrections cover technical nouns, safety negations, clinical terminology, register and unchanged English fragments.
- Visual result inspection exposed literal translations of “Workshop Natural” and similar result-name idioms. The two translated families now use reviewed native quiz-performance labels, without implying a professional qualification. English labels and all score boundaries are unchanged.
- CBT is described as psychotherapy through conversation, not speech/language rehabilitation. Braking-distance wording is explicit. The Thai pressure answer preserves **kPa**, not Pa. Japanese ordinals no longer introduce a spurious numeric answer value.
- Correct answers remain evidence-sensitive: probable faults are not confirmed diagnoses, a jack alone is not adequate support for working underneath, and weak evidence for cupping is not recast as proof of efficacy.
- The existing Portuguese dialect checker has one narrowly scoped automotive exception for `freio`, `freios` and `frenagem` in Mechanic only. Both regional names for brakes were previously prohibited; retaining ordinary consistent automotive terminology is preferable to inaccurate circumlocutions. Visible slash alternatives remain prohibited.
- Final-button text uses the established shared translated fallback when identical. Missing optional raw `preAdButton` keys therefore remain intentional.

## Runtime release gate

`components/quiz/globalFiveRoundRelease.test.ts` checks all **35 × 30 = 1,050 resolved editions**:

- enabled locale set and strict parity;
- resolved structure and scoring match the corresponding English master;
- five rounds, six questions each, thirty distinct IDs;
- non-empty questions and final CTA;
- four distinct choices in the configured order;
- objective answer-key positions, or unchanged weighted-profile scoring;
- no leftover translation markers.

Additional fixtures protect the two migrated packs' current titles/counts, native headings, reviewed terminology and targeted corrections. Existing full validators check unresolved references and accidental English residue.

These tests do **not** prove that every localized distractor is semantically false or that every sentence sounds native. Linguistic judgment remains separate from schema/key validation.

## Verification

- Full unit/regression suite: **163/163 passed**, including all 1,050 resolved editions.
- Full production build, TypeScript, content/production gates and static-export validation: **passed, 2,096 pages**.
- Mobile landing readback: **58/58 passed** at 320px, with exact copy, correct locale, no horizontal overflow and no JavaScript errors.
- Complete mobile quiz journeys: **14/14 passed** (both families in EN, Arabic, Japanese, German, Thai, Portuguese and Finnish). Each covered 30 questions, five checkpoints, 24/30 scoring, missed-answer review, six main reward gates, one-document navigation and no overflow or JavaScript errors. Rewarded ads were mocked and external requests blocked.
- Final result-label polish: **2/2 additional complete mobile journeys passed**, Thai Mechanic and Japanese Treatments. Their rebuilt result screenshots were visually inspected. Total full journeys this migration: **16/16**.
- A subsequent Japanese result-paragraph-only correction removed literal metaphors. The 163-test suite and full production build passed again, and all **11 Japanese result paragraphs** were verified in the exported HTML. The 16 full journeys preceded this final paragraph-only correction.
- Editorial tooling is idempotent: rerunning the final polish changes no files.
- `git diff --check`: clean. Non-target quiz JSON hash remains identical to the pre-migration snapshot.
- No production deployment performed.

## Reference spot-checks

The treatments master’s cautious distinction between treatment names and efficacy is retained. The semantic review consulted [NCCIH on cupping](https://www.nccih.nih.gov/health/cupping), [NCI on radiation therapy](https://www.cancer.gov/about-cancer/treatment/types/radiation-therapy) and [NHS speech and language therapy information](https://www.whittington.nhs.uk/document.ashx?id=15684). These support specific subject checks, not a claim that the full localized corpus has external clinical certification.

## Operational note

A stray `data/.DS_Store` Finder metadata file blocked the production gate. It was moved, not deleted, to `/tmp/mechanic-treatments-translations.L7GOZ9/data.DS_Store`. Translation request caches are also in that temporary directory; the resulting locale files and repeatable editorial corrections are in the repository.
