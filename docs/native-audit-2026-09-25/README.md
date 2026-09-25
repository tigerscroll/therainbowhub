# Full native-language audit — complete

Completed 25 September 2026. All 33 quizzes retain ten rounds of seven in all
eight locales. The current editorial hashes cover all 18,480 question instances,
264 quiz interfaces and eight shared language files. Portuguese was reviewed as
one edition for readers in Portugal and Brazil.

Final lint/validation passed all 278 tests, and the production static export
passed. Across this audit, all 264 editions completed their browser journeys and
all 2,640 checkpoints passed at 320px. The final shared French/German wording also
passed renewed Years-left and Memory journeys and checkpoint checks. Browser
tests simulate rewarded-ad responses; they do not measure live ad availability.
See [verification.json](verification.json) for the coverage and evidence paths.

Scope: all 33 quizzes in English, French, German, Italian, Dutch, Spanish,
Portuguese and Arabic. Read prompts, every answer choice, study instructions and
clues, visual labels, topic/checkpoint text, results, About copy and shared UI.
Check natural wording, intended meaning, answer validity, regional assumptions,
units, cultural context, consistent address and agreement with displayed controls.

Preserve ten rounds of seven, answer identities and weights, English headlines
and subtitles, the eight-locale catalogue, no sharing, and the restored automatic
ad-reopening behavior. Portuguese remains a shared edition for Portugal and
Brazil, using shared phrases or both technical names where necessary.

`progress.json` records only text actually reviewed. Its hashes refer to current
content, so an edit invalidates the corresponding coverage until it is reviewed
again. Reused English questions are grouped, but every distinct translated
variant is displayed and reviewed. Structural tests do not mark editorial work
complete. This record represents an AI editorial audit, not independent human
native-speaker certification.

Use `node scripts/editorial-audit.mjs status` for current coverage. The
`questions`, `interface` and `shared` commands print review packs. The explicit
`mark-*` commands record completed reading after any corrections.

Completion checks confirmed current content coverage, intended answer meanings,
unchanged scoring positions, successful validation/build and rendered flows.
The final comparison of 254 modified data files found only text changes: no
structure, identifiers, numeric values or scoring changes. Runtime and ad code
are unchanged. English headlines, landing copy and answer choices are preserved.

## Findings addressed

- Years-left: complete question sentences instead of mismatched second-person
  prompts and first-person answers; natural everyday idioms; consistent informal
  French/German quiz instructions; and Portuguese phrases shared by Portugal
  and Brazil. Result estimates no longer become price quotations, and the
  answer breakdown explains the fictional age score in natural language.
  Shared French/German in-flow controls avoid switching forms of address.

- Treatments: insulin subject/object order, anatomical joints versus mechanical
  joints or municipalities, waste products, peritoneal membrane terminology,
  procedure names, psychotherapy terms, agreement and missing question clauses.
  The Portuguese wording uses common phrases or paired clinical names; the
  reviewed source table and generated files stay consistent.
- Vision: geometric shapes, brightness versus weight, code characters versus
  people, object nouns versus commands, mirror/rotation instructions, matching
  printed model labels, counting versus degree of fullness, and study buttons.
  Arabic ordered images explicitly retain left-to-right reading where needed.
  Image alternatives now track the reviewed prompt. All 70 visual boards were
  rendered and checked alongside the deterministic source and answer keys.
  The English rectangular-grid prompt now explicitly includes squares of all
  sizes; its answer and scoring are unchanged.

- Personality: consistent address, preferences instead of commands, personal
  touches versus personal data, memories versus computer storage, emotional
  balance versus bank balances, and country matches versus sporting matches.
  Profiles and their optional breakdown describe lifestyle preferences rather
  than nationality; regional Portuguese wording uses common alternatives.
- Memory: local study buttons, consistent study-card and delayed-recall clues,
  unchanged literal codes, object associations and arithmetic. Translations of
  recall no longer describe telephone callbacks. Arabic ordered sequences use
  the same left-to-right order as the displayed cards. Portuguese adaptations
  remain consistent across the cards and later questions.
- Oxford: quantifiers and tense, PAV identifiers, green cards versus immigration
  permits, overlap versus time, counters versus counting devices, tied finishes
  versus neckties, talks versus negotiations, grid directions, measured values
  versus policy measures, and test passers versus participants. Every answer
  was checked against its premises; result areas now describe skills.
- Italian cuisine: dish and ingredient names, pasta shapes, cured foods,
  dough resting versus remainder, quantities versus prices, and culinary terms
  such as al dente. Italian word-meaning questions were adapted where literal
  translation would give away the answer. Portuguese uses shared dish names
  and regional alternatives for ingredients. All calculations were checked.
- Mechanic: warning lights, brake pads, stopping distance, electrical circuits,
  coolant, transmission, torque tools and diagnostic reasoning. Result labels
  describe knowledge rather than the power of a vehicle system. Portuguese
  tool names and technical alternatives cover Portugal and Brazil.
- Harvard: rates versus prices, claims versus complaints, samples versus
  unrelated homonyms, experimental trials versus court trials, causal evidence,
  quantities, option identifiers and decision constraints. Checkpoint and result
  labels now describe quiz topics rather than physical entrances. Portuguese
  questionnaires remain questionnaires during neutral-language cleanup.
- IQ: rotations versus reflections, left versus remaining, logical deductions,
  code comparisons, names, numeric rules and word relationships. Existing local
  replacements for English compound-word puzzles keep their own answer choices.
  The instructions and result profiles were reviewed in all eight languages.
- Train: wheel/rail geometry, platforms, gradients, coupling and traction,
  movement versus moving house, brake checks, acknowledgements and train
  services versus religious services. Native result labels refer to knowledge
  rather than geographical railway areas.
- Motorbike: throttle versus pedal, clutch and drive terminology, tyre grip
  versus handles, stopping distance versus braking distance, hidden hazards,
  shrinking traffic gaps, passengers, luggage and medicine warnings. Rider
  translations no longer describe cyclists or horse riders. Portuguese uses
  common wording or paired technical names across Portugal and Brazil.
- Surgeon: anatomical attachment, grafts, retractors, surgical counts, wound
  separation, recovery and discharge terminology. Italian no longer reverses
  the meaning of the pain-assessment distractor. Result categories describe
  skills rather than physical areas.
- Firefighter: combustion, convection in gases and liquids, withdrawal from
  danger, equipment capacity, mechanical forces, personnel accountability and
  incident communication. Shared Train/Motorbike calculations retain metres
  rather than the Italian translation's minutes. Translations of sequence,
  location and direction no longer imply commands, military tanks or time.
- Aviation: flight-control terminology, aircraft attitude, leading edges, unit
  notation, cabin instructions, communication and passenger-safety wording.
- Anatomy: pupil versus student, eye lens versus camera lens, whole brain versus
  cerebrum, named bones and joints, and anatomical directions. Distractors retain
  their original scoring positions.
- Barrister and shared professional questions: leading questions, court records,
  referral, evidence, consent, prohibition versus uncertainty, dates versus fruit,
  and reassessment versus a customer review.
- Police: chain of custody, clock offsets, timelines, clothing descriptions,
  fact versus assumption, result labels and checkpoint topics.
- Social Worker and Teacher: safeguarding as protection of people, disclosure as
  a person's account, professional boundaries, support-plan reviews and referral
  continuity. The Arabic instruction to provide clear information no longer says
  to erase information. Teaching corrections include spaced practice, retrieval,
  worked examples, assessment rubrics and the purpose of lesson review.
- Default English checkpoint sentences no longer produce combinations such as
  “Explore follow the evidence next.” English landing titles and subtitles are
  preserved. Four question prompts were clarified without changing answer
  choices or scoring (`catholic-s9q1`, `catholic-s10q3`, `cambridge-s9q4`,
  `vision-s10q5`). Vision's corresponding English image alternative follows
  its clarified prompt.
- Bible, Catholic and Nun: contextual biblical names, liturgical objects and
  prayers, religious profession versus employment, voluntary versus free of
  charge, ministry versus government departments, and habit versus a repeated
  behaviour. Catholic and Nun interfaces use the relevant religious terminology.
- Shared interface: all eight language files reviewed. French/German shared
  in-flow controls accommodate the quizzes' different voices. French compatibility
  labels, Italian contact wording and Dutch result/detail labels were corrected.
- Cambridge: number sequences versus clock times, fixed group identifiers,
  statistical range, mass density, reflections and rotations, and accuracy
  versus precision. The biased but repeatable sensor readings no longer have a
  second correct answer introduced by translating accuracy as precision.
- Chef: garlic bulbs/cloves, salad dressing, simmering versus vaporising food,
  acidic versus alkaline vinaigrette, emulsions, dough preparation and rest,
  kitchen timing, food hygiene and allergen transfer. Result categories refer
  to skills rather than physical kitchen corners. Portuguese uses common
  vocabulary or explicit alternatives for both Portugal and Brazil.
- Dentist: tooth layers, canines versus the animal family, dental sockets,
  vestibular/mesial surfaces, root tips and instruments. Shared clinical copy
  now distinguishes respiratory frequency from prices, sterility from
  infertility, and speaking towards a person from facing away.
- Doctor and reused clinical questions: atria versus ventricles, nutrient
  absorption, cell division, tablets versus electronic devices, administration
  of medicines versus office administration, and clinical records versus graphs.
  False positives and the need to assess uncertain findings retain their
  intended clinical meaning. Portuguese technical terms include both regional
  names where a single form would be region-specific.
- Medical: cell and tissue terminology, microbial culture versus cultural
  knowledge, anatomical ordering, observed versus reported symptoms, and
  record completeness. Nursing: pain ratings versus musical scores, patient
  movement versus moving house, handovers, checking understanding, clinical
  escalation, records versus recordings and checks versus bank cheques.
  Nursing's result areas no longer refer to physical entrances.
- Paramedic: live electrical hazards, sterile dressings, ABCDE terms, new
  confusion versus repeated confusion, arrival time versus call time, and
  clinical deterioration versus decay. Equipment instructions and handovers
  retain their intended meaning. German About text now correctly says the
  quiz avoids country-specific emergency numbers and clinical protocols.
- Midwifery: amniotic fluid cushions rather than kisses the baby; placental
  exchange is not replacement of the placenta. Corrections also cover
  inability to keep fluids down, feeling faint versus actual fainting,
  neonatal temperature care versus spa treatment, safe sleep wording,
  newborn observation, consent, clinical documentation and result categories.
  Portuguese uses common vocabulary or both regional technical terms.

## Verification log

- Years-left passed 278 tests, the full validation suite and a static export,
  all eight complete browser flows, and all 80 checkpoints at 320px.
- Vision passed 278 tests, the full validation suite and a static export,
  all eight complete browser flows, and all 80 checkpoints at 320px.

- Treatments passed 278 tests, the full validation suite and a static export,
  all eight complete browser flows, and all 80 checkpoints at 320px.

- Personality passed 278 tests, the full validation suite and a static export,
  all eight complete browser flows, and all 80 checkpoints at 320px.

- Oxford passed 278 tests, the full validation suite and a static export,
  then all eight complete browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-oxford-browser.log` and
  `/private/tmp/native-audit-oxford-checkpoints.log`.
- Memory passed 278 tests, the full validation suite and a static export,
  then all eight complete browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-memory-browser.log` and
  `/private/tmp/native-audit-memory-checkpoints.log`.
- Mechanic passed 278 tests, the full validation suite and a static export,
  then all eight complete browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-mechanic-browser.log` and
  `/private/tmp/native-audit-mechanic-checkpoints.log`.
- Italian passed 278 tests, the full validation suite and a static export,
  then all eight complete browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-italian-browser.log` and
  `/private/tmp/native-audit-italian-checkpoints.log`.
- IQ passed 278 tests, the full validation suite and a static export,
  then all eight complete browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-iq-browser.log` and
  `/private/tmp/native-audit-iq-checkpoints.log`. Numeric comparison recognises
  natural Arabic singular/dual grid directions without treating a numbered
  grid cell as an extra quantity.
- Harvard passed 278 tests, the full validation suite and a static export,
  then all eight 70-answer browser flows and all 80 checkpoints at 320 px. Logs:
  `/private/tmp/native-audit-harvard-browser.log` and
  `/private/tmp/native-audit-harvard-checkpoints.log`.
- Motorbike passed 278 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-motorbike-browser.log` and
  `/private/tmp/native-audit-motorbike-checkpoints.log`.
- Train passed 278 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-train-browser.log` and
  `/private/tmp/native-audit-train-checkpoints.log`.
- Firefighter passed 278 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-firefighter-browser.log` and
  `/private/tmp/native-audit-firefighter-checkpoints.log`.
- Surgeon passed 278 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-surgeon-browser.log` and
  `/private/tmp/native-audit-surgeon-checkpoints.log`.
The ledger is the authority for current editorial coverage; an entry in this
section is not a claim that every quiz is ready.

- Paramedic passed the 278-test lint/validation suite, full static export,
  all eight complete locale flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-paramedic-browser.log` and
  `/private/tmp/native-audit-paramedic-checkpoints.log`.
- Midwifery passed the 278-test lint/validation suite, full static export,
  all eight complete locale flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-midwifery-browser.log` and
  `/private/tmp/native-audit-midwifery-checkpoints.log`.
- After Paramedic and Midwifery edits, all 213 modified data JSON files retain
  their keys, array shapes and numeric/scoring values. English headlines,
  landing copy and answer choices match HEAD. Only the three English prompt
  clarifications listed above differ. Every new editorial key matches its
  English source; the Portuguese repeatability checks pass.

- The lint/validation suite passed with 272 tests after Bible, Catholic, Nun and
  shared-interface corrections. The subsequent full static export also passed.
- Bible, Catholic and Nun then passed all 24 complete locale flows and all 240
  mobile checkpoints. Logs: `/private/tmp/native-audit-religion-browser.log`
  and `/private/tmp/native-audit-religion-checkpoints.log`.
- Cambridge passed 273 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-cambridge-browser.log` and
  `/private/tmp/native-audit-cambridge-checkpoints.log`.
- Chef passed 274 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-chef-browser.log` and
  `/private/tmp/native-audit-chef-checkpoints.log`.
- Dentist passed 276 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-dentist-browser.log` and
  `/private/tmp/native-audit-dentist-checkpoints.log`.
- Doctor and Medical passed 277 tests, the full validation suite and a static
  export, followed by all 16 complete flows and all 160 mobile checkpoints.
  Logs: `/private/tmp/native-audit-doctor-medical-browser.log` and
  `/private/tmp/native-audit-doctor-medical-checkpoints.log`.
- Nursing passed 278 tests, the full validation suite and a static export,
  followed by all eight complete flows and all 80 mobile checkpoints. Logs:
  `/private/tmp/native-audit-nursing-browser.log` and
  `/private/tmp/native-audit-nursing-checkpoints.log`.
- The preceding Social Worker/Teacher batch passed 270 tests and a full export,
  followed by all 16 locale flows and 160 mobile checkpoints. Logs:
  `/private/tmp/native-audit-social-teacher-browser.log` and
  `/private/tmp/native-audit-social-teacher-checkpoints.log`.
- The aviation browser batch passed all 24 editions and 240 checkpoints at its
  tested revision. Logs: `/private/tmp/native-audit-aviation-browser.log` and
  `/private/tmp/native-audit-aviation-checkpoints.log`.
- The anatomy/legal browser batch passed 36 of 40 editions; four Police editions
  compared newly edited JSON against an older export. All 640 checkpoint layout
  checks in that batch passed. This run is not recorded as a 40-edition success.
- After rebuilding, all eight Police editions completed the full ten-round flow,
  and all 80 Police checkpoints passed at 320 px. Logs:
  `/private/tmp/native-audit-police-browser.log` and
  `/private/tmp/native-audit-police-checkpoints.log`.
- Portuguese editorial repeatability checks passed after the religious-quiz
  corrections. Further edits must pass them again before completion.
- A comparison of all 206 modified data files after Chef found no structure,
  numeric or boolean changes. English headlines, landing copy and answer choices
  were unchanged. All reused English questions agree on the correct answer.

Preserved marketing headlines and their pass-rate claims have not been
independently substantiated by this language audit.

## Reference checks

These primary references support technical terminology and factual checks;
they do not certify translation fluency. The quiz copy is independently worded.

- [NCCIH: acupuncture](https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety)
- [NHS: cognitive behavioural therapy](https://www.nhs.uk/tests-and-treatments/cognitive-behavioural-therapy-cbt/)
- [MedlinePlus: statins](https://medlineplus.gov/statins.html)
- [Longfonds: respiratory medicines](https://www.longfonds.nl/longmedicijnen)
- [NIDDK: hemodialysis](https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/hemodialysis)
- [NHS: talking therapies](https://www.nhs.uk/tests-and-treatments/talking-therapies/)
- [NHLBI: CPAP](https://www.nhlbi.nih.gov/health/cpap)
- [NCI: targeted therapies](https://www.cancer.gov/about-cancer/treatment/types/targeted-therapies)
- [NCI: immunotherapy](https://www.cancer.gov/about-cancer/treatment/types/immunotherapy)
- [NCI: stem-cell transplants](https://www.cancer.gov/about-cancer/treatment/types/stem-cell-transplant)
- [NCI: brachytherapy](https://www.cancer.gov/about-cancer/treatment/types/radiation-therapy/brachytherapy)
- [NHS: physiotherapy](https://www.nhs.uk/tests-and-treatments/physiotherapy/)
- [NHS: coronary angioplasty](https://www.nhs.uk/tests-and-treatments/coronary-angioplasty/)
- [NCCIH: natural does not mean better](https://www.nccih.nih.gov/health/know-science/natural-doesnt-mean-better)
- [NCCIH: cupping](https://www.nccih.nih.gov/health/cupping)
- [NIDDK: kidney failure treatment choices](https://www.niddk.nih.gov/health-information/kidney-disease/kidney-failure/choosing-treatment)
- [NCI: checkpoint inhibitors](https://www.cancer.gov/about-cancer/treatment/types/immunotherapy/checkpoint-inhibitors)
- [NCI: chemotherapy](https://www.cancer.gov/about-cancer/treatment/types/chemotherapy)
- [NCI: palliative care](https://www.cancer.gov/about-cancer/advanced-cancer/care-choices/palliative-care-fact-sheet)

- [FAA Pilot's Handbook of Aeronautical Knowledge](https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak)
- [New Zealand CAA: straight and level flight](https://www.aviation.govt.nz/licensing-and-certification/pilots/flight-training/flight-instructor-guide/straight-and-level/)
- [FAA passenger safety](https://www.faa.gov/travelers/fly_safe/safety_tips)
- [FAA turbulence](https://www.faa.gov/travelers/fly_safe/turbulence)
- [FDA food allergies](https://www.fda.gov/food/nutrition-food-labeling-and-critical-foods/food-allergies)
- [ICAO cabin crew requirements](https://www.icao.int/minimum-cabin-crew-requirements)
- [NIDDK digestive system](https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works)
- [IQWiG skeleton terminology](https://www.gesundheitsinformation.de/wie-ist-das-skelett-aufgebaut.html)
- [NIMH: Get to Know Your Brain](https://www.nimh.nih.gov/news/media/2023/get-to-know-your-brain)
- [NIDDK kidney function](https://www.niddk.nih.gov/health-information/kidney-disease/kidneys-how-they-work)
- [Cornell LII: leading question](https://www.law.cornell.edu/wex/leading_question)
- [Cornell LII: cross-examination](https://www.law.cornell.edu/wex/cross_examination)
- [Canadian federal tribunal hearing guide in French](https://pslreb-crtefp.gc.ca/fr/audiences/documents/guide-audiences.pdf)
- [NIST: chain of custody](https://csrc.nist.gov/glossary/term/chain_of_custody)
- [NIST: evidence management](https://www.nist.gov/forensic-science/interdisciplinary-topics/evidence-management)
- [OHCHR: human rights standards for law enforcement](https://www.ohchr.org/Documents/Publications/training5Add3en.pdf)
- [IFSW global ethical principles](https://www.ifsw.org/global-social-work-statement-of-ethical-principles/)
- [IES: organizing instruction and study](https://ies.ed.gov/ncee/wwc/practiceguide/1)
- [USCCB: Matthew 13](https://bible.usccb.org/bible/matthew/13)
- [USCCB: Acts 9](https://bible.usccb.org/bible/acts/9)
- [USCCB: Genesis 25](https://bible.usccb.org/bible/genesis/25)
- [AELF: 1 Samuel 1](https://www.aelf.org/bible/1S/1)
- [Dutch Bible Society: Acts 18](https://www.debijbel.nl/bijbel/HSV/ACT.18)
- [Vatican: Compendium of the Catechism](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html)
- [Vatican: Portuguese Compendium](https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_po.html)
- [Vatican: General Instruction of the Roman Missal](https://press.vatican.va/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20030317_ordinamento-messale_en.html)
- [Vatican: Rosarium Virginis Mariae](https://www.vatican.va/content/john-paul-ii/en/apost_letters/2002/documents/hf_jp-ii_apl_20021016_rosarium-virginis-mariae.html)
- [Vatican: religious institutes, formation and profession](https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib2-cann607-709_en.html)
- [BIPM: SI derived units and mass density](https://www.bipm.org/fr/-/resolution-cgpm-11-12)
- [NIST: range](https://www.itl.nist.gov/div898/software/dataplot/refman2/auxillar/diffrang.htm)
- [NIST: measurement terminology, accuracy and precision](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-d1-terminology)
- [FDA: safe food handling](https://www.fda.gov/food/buy-store-serve-safe-food/safe-food-handling)
- [FDA: preventing allergen cross-contact](https://www.fda.gov/regulatory-information/search-fda-guidance-documents/cpg-sec-555250-statement-policy-labeling-and-preventing-cross-contact-common-food-allergens)
- [Exploratorium: gluten and pastry texture](https://annex.exploratorium.edu/cooking/icooks/article-12-03-02.html)
- [NIDCR: tooth decay](https://www.nidcr.nih.gov/health-info/tooth-decay/more-info/tooth-decay-process)
- [NIDCR: fluoride](https://www.nidcr.nih.gov/health-info/fluoride)
- [Ameli: teeth and tooth decay](https://www.ameli.fr/assure/sante/themes/carie-dentaire/comprendre-caries-dentaires)
- [KZBV: tooth anatomy](https://www.kzbv.de/patienten/medizinische-infos/das-menschliche-gebiss/aufbau-der-zaehne/)
- [CDC: dental protective equipment](https://www.cdc.gov/dental-infection-control/hcp/dental-ipc-faqs/personal-protective-equipment.html)
- [CDC: dental sterilization](https://www.cdc.gov/dental-infection-control/hcp/dental-ipc-faqs/dental-sterilization.html)
- [AHRQ: teach-back](https://www.ahrq.gov/teamstepps-program/curriculum/communication/tools/teachback.html)
- [NHLBI: blood flow through the heart](https://www.nhlbi.nih.gov/health/heart/blood-flow)
- [NIDDK: glucose and insulin](https://www.niddk.nih.gov/health-information/diabetes/overview/symptoms-causes)
- [NHGRI: mitosis](https://www.genome.gov/genetics-glossary/Mitosis)
- [FDA: drug interactions](https://www.fda.gov/drugs/resources-drugs/drug-interactions-what-you-should-know)
- [FDA: generic drugs](https://www.fda.gov/drugs/generic-drugs/generic-drugs-questions-answers)
- [FDA: pulse oximeters](https://www.fda.gov/medical-devices/products-and-medical-procedures/pulse-oximeters)
- [MedlinePlus: ultrasound](https://medlineplus.gov/lab-tests/sonogram/)
- [MedlinePlus: bacterial culture](https://medlineplus.gov/lab-tests/bacteria-culture-test/)
- [CDC: antimicrobial resistance](https://www.cdc.gov/antimicrobial-resistance/about/index.html)
- [NICE: involving people in their care](https://www.nice.org.uk/guidance/cg138/ifp/chapter/involving-you-in-your-care)
- [HSE: moving and handling equipment](https://www.hse.gov.uk/healthservices/moving-handling/moving-handling-equipment.htm)
- [WHO: Basic Emergency Care](https://www.who.int/publications/i/item/basic-emergency-care-approach-to-the-acutely-ill-and-injured)
- [WHO: ABCDE emergency care workbook](https://hlh.who.int/docs/librariesprovider4/clinical-care/who-icrc-basic-emergency-care.pdf)
- [American Red Cross: first-aid scene assessment](https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps)
- [CDC: urgent maternal warning signs](https://www.cdc.gov/hearher/maternal-warning-signs/index.html)
- [NHS: stages of labour and birth](https://www.nhs.uk/pregnancy/labour-and-birth/the-stages-of-labour-and-birth/)
- [WHO: essential newborn care](https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/newborn-health/essential-newborn-care)
- [NICHD: safe infant sleep](https://safetosleep.nichd.nih.gov/reduce-risk/FAQ)
- [NHS: colostrum and early feeding cues](https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding/the-first-few-days/)
- [MedlinePlus: laparoscopy](https://medlineplus.gov/lab-tests/laparoscopy/)
- [WHO: surgical safety checklist](https://www.who.int/publications/i/item/9789241598590)
- [WHO: surgical counts and specimen safety](https://www.ncbi.nlm.nih.gov/sites/books/NBK143248/)
- [Cleveland Clinic: mesentery](https://my.clevelandclinic.org/health/body/mesentery)
- [CDC: carbon monoxide](https://www.cdc.gov/carbon-monoxide/about/index.html)
- [NWCG: fire triangle](https://www.nwcg.gov/publications/pms205/nwcg-glossary-of-wildland-fire-pms-205/fire-triangle-57)
- [NWCG: heat transfer](https://www.nwcg.gov/publications/pms425-1/1-basic-principles)
- [OSHA: ladder capacity and defective equipment](https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1053)
- [FEMA: incident accountability and communications](https://training.fema.gov/EMIWeb/IS/IS700b/Handouts/National_Incident_Management%20System_Third%20Edition_October_2017.pdf)
- [Network Rail: adhesion and stopping on contaminated rails](https://www.networkrail.co.uk/rail-travel/delays-explained/leaves/)
- [RSSB: wheel–rail adhesion and braking](https://www.rssb.co.uk/track-record-library/a-new-understanding-of-leaf-induced-low-adhesion-to-reduce-delays)
- [Motorcycle Safety Foundation: operator manual](https://msf-usa.org/wp-content/uploads/2023/02/motorcycle-operator-manual.pdf)
- [FDA: medicines and driving](https://www.fda.gov/consumers/consumer-updates/some-medicines-and-driving-dont-mix)
- [Barilla: farfalle](https://www.barilla.com/en-us/products/pasta/classic-blue-box/farfalle)
- [Barilla: aglio, olio e peperoncino](https://www.barilla.com/en-us/recipe/all/barilla-thick-spaghetti-aglio-olio-e-peperoncino)
- [La Cucina Italiana: classic carbonara](https://www.lacucinaitaliana.it/ricetta/primi/carbonara-classica/)
- [Exploratorium: gluten and kneading](https://annex.exploratorium.edu/cooking/bread/activity-gluten.html)
- [Chiostro di Saronno: amaretti ingredients](https://chiostrodisaronno.it/en/products/amaretti-cioccolato-chiostro-di-saronno-bag)
- [Bosch: fuel injectors](https://www.bosch-mobility.com/en/solutions/valves/fuel-injector-manifold/)
- [Ford: warning lights](https://www.ford.com.ph/support/how-tos/more-vehicle-topics/lights-and-bulbs/what-do-the-lights-on-my-dashboard-mean)
- [Ford: coolant and hot reservoir caps](https://www.ford.co.uk/support/how-tos/owner-resources/vehicle-maintenance/how-to-check-and-add-engine-coolant)
- [HSE: supporting vehicles safely](https://www.hse.gov.uk/mvr/introduction.htm)
- [HSE: electric and hybrid vehicle repair](https://www.hse.gov.uk/mvr/topics/electric-hybrid.htm)
- [NHTSA: ABS and stopping distance](https://www.nhtsa.gov/sites/nhtsa.gov/files/nhtsaabst4finalrpt.pdf)
