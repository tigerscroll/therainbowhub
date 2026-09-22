# Treatments English five-round QA — 22 September 2026 UTC

## Scope

English `/treatments` now has 30 text-only questions in five rounds: Name That Treatment, How It Works, Spot the Difference, Fact or Mix-Up?, and Put It Together. The existing shared rewarded-only SPA engine supplies the landing, automatic answer progression, animated checkpoints, final result and optional rewarded answer review. No shared engine or advertising configuration was changed.

The pass target is 24/30. Questions have four distinct choices with correct positions distributed 8/8/7/7. General treatment definitions were checked against NHS, NCI and NCCIH references recorded in `data/quizzes/treatments/SOURCES.md`. The quiz is general learning, not personal treatment advice. The unsupported 16% pass-rate headline was removed.

Only English is active. All 29 legacy translation files and existing image assets are retained unchanged; those translations are inactive because they do not match the new shared 30-question structure. There are no question or landing photographs; the hub thumbnail and shared related-quiz artwork remain.

## Verification

- `npm test`: 84 passed, zero failures.
- `npm run build`: quiz, localization, production, TypeScript and static-export checks passed; 2,067 pages generated.
- `node scripts/test-treatments-en.mjs`: four complete Chrome journeys passed: 0/30 at 390px, 23/30 at 1440px, 24/30 at 320px, and 30/30 at 390px.
- Browser tests verify all 30 displayed answer sets, text-only questions, no page/answer overflow, single-column answer layout, all five checkpoints, pass/fail boundary, exact missed-answer review and no JavaScript errors.
- Each journey used one document navigation, six main rewarded placements and one optional review placement, all using `/22677279144/rewarded`. External requests were blocked and GPT was mocked; this is not proof of live ad fill.
- Visual inspection covered landing, checkpoint, narrow-screen scenario and final result. The first visual pass found clipped two-column answers at 320px; a Treatments-only single-column override fixed this, and every question passed internal-overflow checks in the final run.
- The preview uses the canonical English `/treatments` path, not `/en/treatments`.
- `git diff --check` passed. Non-English Treatments JSON files were compared against HEAD and remain unchanged.

## Handoff

Local preview: `http://localhost:3198/treatments`. No deployment performed. No live AY, Meta, Google, Supabase or Cloudflare changes were made for this task.
