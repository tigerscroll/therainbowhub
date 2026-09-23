# English five-round rollout — 22 September 2026 UTC

**Subsequent localization:** the original English-only milestone below is historical. All 30 quizzes now have expanded editions in the 29 non-English locales; see [the localization report](thirty-quiz-localization-2026-09-22.md) for current scope and verification. Neither milestone deploys production.

Requested: airforce, anatomy, barrister, bible, cambridge, catholic, chef, dentist, flightattendant, doctor, firefighter, grammar, harvard, iq, italian, medical, midwifery, nursing, motorcycle (existing route: motorbike), nun, paramedic, oxford, personality, pilot, police, raf, socialworker, teacher, surgeon, word.

Scope: local English implementation; shared five-stage-six-question template, rewarded start/round/result gates, SPA progression, five coherent rounds, 30 distinct questions, preserved result semantics. Existing translations and assets retained, inactive until compatible with the new structure. No deployment or live ad requests.

Plan:

1. Recover and review longer historical banks where available; preserve corrected current questions by stable ID.
2. Add original questions where only ten currently exist. No duplication to pad rounds. Worldwide English, explicit jurisdiction/tradition where required, no diagnosis/dosing/operational instructions.
3. Update checkpoint, subtitle, About and result copy; preserve Personality weighted profiles and entertainment-only IQ scoring.
4. Update obsolete ten-question regression expectations, adding structure, answer-key, uniqueness, category and profile coverage checks.
5. Build and run complete mocked-ad browser journeys across all 30 quizzes, plus scoring boundaries and representative narrow/mobile/desktop visual checks.
6. Record actual results and limitations before handoff.

## Implementation

- All 30 requested quizzes use the existing five-stage-six-question template: 900 questions total.
- Retained all 300 existing questions by stable ID, including their prompts, answer labels, correct-answer IDs or Personality weights, category and visual logic. A read-only comparison against the baseline commit passed.
- Recovered 200 additional questions from longer historical banks and authored 400 additions. Existing useful images and visual puzzles remain.
- Balanced correct-answer display positions to 8 / 8 / 7 / 7 in each knowledge quiz without changing stable answer meanings.
- Preserved four Personality profiles and the entertainment-only IQ score. Knowledge quizzes target 24/30.
- Updated two-line subtitles, five checkpoints, result-ready copy, About and result descriptions. Restored all original main quiz titles exactly at the user's request; title changes are not part of this rollout.
- Corrected the restored Harvard proposal comparison: A = 14, B = 16, so B wins. Clarified two Cambridge questions.
- Converted legacy Grammar trapdoor annotations to stable answer IDs and included restored categories in its result dimensions.
- Fixed hidden horizontal scrolling caused by decorative theme artwork: the shared continuous-flow root now uses overflow clipping without creating a scroll container. Added rendered-shell bounds checks to the browser tests.
- Kept rewarded-only behaviour: start, four round transitions, final reveal, and an additional optional breakdown unlock. No display or interstitial ads were added.

The migration helper is pinned to baseline commit `a2e69481c319299abf433fbf6cde0067e3c475ba`. It emits patches rather than writing files and is an authoring/replay tool, not runtime code. Do not replay it over subsequent editorial changes without reviewing its output.

## Verification completed

- Production build and static-export validation passed (1,168 generated pages).
- All 118 automated tests passed. The new batch tests exercise every score from 0–30 for all 29 knowledge quizzes, all four Personality profile outcomes, question/category coverage and answer-position balance.
- All 30 original end-to-end mobile journeys passed through thirty answers, five checkpoints, final results and applicable missed-answer reviews. Visual inspection then found the hidden Nursing scroll-container issue described above.
- Strengthened full mobile rerun: all 30 passed at 320px, including rendered question-shell bounds after animations. Nursing remains centred after focus changes.
- Desktop Nursing and IQ journeys at 23/30, and Personality's Japan outcome, passed at 1,440px.
- Additional 390px edge cases passed: Bible 0/30 with all thirty missed answers, Harvard 30/30 with an empty missed-answer review.
- Visual checks covered landings, questions, checkpoints and results, including image/visual and long-answer layouts. The final Personality presentation separates its vibe label from its value and frames the existing country artwork; complete 320px and 1,440px rechecks passed, including image decoding and the seventh rewarded breakdown gate.
- All 30 original main quiz titles are restored exactly. Per-quiz regression assertions now guard against changing them during future format edits.

Browser tests block all non-local requests and mock rewarded-ad ready/granted/closed events. They check the configured rewarded unit, gate counts, one document navigation, JavaScript errors, visible answer labels and missed-answer keys. They do not establish real ad fill, production analytics delivery or professional assessment validity.

## Subject-matter references

The quizzes are entertainment/general-knowledge challenges, not professional examinations, medical advice or operational training. New health and public-safety questions avoid doses and procedural intervention instructions. Common-law and Roman-Rite questions explicitly identify those contexts where relevant.

Primary references checked for the relevant subject areas:

- [WHO surgical safety resources](https://www.who.int/teams/integrated-health-services/patient-safety/research/safe-surgery/tool-and-resources), [WHO hand hygiene](https://www.who.int/publications/m/item/five-moments-for-hand-hygiene).
- [NIDCR tooth decay](https://www.nidcr.nih.gov/health-info/tooth-decay/more-info/tooth-decay-process), [fluoride](https://www.nidcr.nih.gov/health-info/fluoride).
- [FAA pilot handbooks](https://www.faa.gov/regulations_policies/handbooks_manuals), [turbulence](https://www.faa.gov/travelers/fly_safe/turbulence), [evacuations](https://www.faa.gov/evacuations).
- [Motorcycle Safety Foundation riding guidance](https://msf-usa.org/quick-tips/), [RAF aircraft information](https://www.raf.mod.uk/aircraft/hawk-t1/).
- [IFSW ethical principles](https://www.ifsw.org/global-social-work-statement-of-ethical-principles/), [Bar Standards Board core duties](https://www.barstandardsboard.org.uk/for-barristers/compliance-with-your-obligations/the-core-duties.html) (England and Wales, not a worldwide legal rulebook).
- [Catholic Catechism](https://www.vatican.va/content/catechism/en.html), [canon-law religious institutes](https://press.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib2-cann607-709_en.html), [USCCB Bible](https://bible.usccb.org/bible).
- [Italia.it pasta guide](https://www.italia.it/it/italia/cosa-fare/tipi-di-pasta-italiana-formati-e-ricette).

## Release boundary

Local English implementation only. Existing translated files are retained but these 30 manifests activate English only until their expanded content is translated and audited. No production deployment, external translation request, real ad call or analytics upload was performed.
