# Mechanic English sign-off — 22 September 2026 UTC

## Approved content

Five rounds × six text-only questions: Dashboard Detective, Inside the Car, Workshop Logic, Fact or Fiction?, Final Diagnosis. Same shared rewarded-only SPA flow, animated checkpoints, automatic answer progression, one final result and optional rewarded answer review. Pass target: 24/30. Six system categories contain five questions each. Correct positions are balanced 8/8/7/7.

The final editorial changes requested by the user are applied:

- Round 3 Q1: “test car”, not “test engine”; correct answer remains 6 L.
- Round 3 Q5: “3:1 reduction ratio” and 1,200 rpm input; choices 400, 300, 1,200 and 3,600 rpm; correct answer remains 400 rpm.

Worldwide English scope: no country-specific driving laws or inspection limits. Hypothetical limits and units are supplied. Conventional-car assumptions are explicit where relevant. Fault scenarios distinguish evidence and sensible checks from a confirmed failed component. Reference checks are recorded in `data/quizzes/mechanic/SOURCES.md`.

English is the only active Mechanic locale. The 29 old translation files remain byte-for-byte unchanged against HEAD, as do the artwork assets. They must be migrated before being reactivated against the new structure. Workshop colours and styling remain; answers use a single column to avoid clipping long text.

## Verification

- `npm test`: 86 passed, zero failures.
- `npm run build`: all quiz, localization, production, TypeScript and static-export checks passed; 2,038 pages generated.
- `node scripts/test-mechanic-en.mjs`: exit 0; complete journeys at 0/30 (390px), 23/30 (1440px), 24/30 (320px), 30/30 (390px).
- Checked all displayed answer sets, five checkpoints, 20/40/60/80/100% completion, exact pass boundary, final score and all missed-answer review entries.
- No JavaScript errors, horizontal document overflow or clipped answer labels in the tested journeys.
- Every journey stayed within one document navigation and requested six main rewards plus one review reward, all on `/22677279144/rewarded`.
- All external requests were blocked and rewarded events were mocked. Tests do not establish live ad fill or revenue.
- Visually inspected the 320px landing, first checkpoint, final-round scenario and result.
- `git diff --check` passed.

Finder metadata that blocked production validation was moved, not deleted, to `/private/tmp/mechanic-finder-metadata.uJWfFc/`. No content files were removed.

## Release state

Local implementation complete and content frozen after the two approved wording changes. Preview: `http://localhost:3198/mechanic`. No production deployment performed. No shared runtime, live ad configuration or CAPI infrastructure changes.
