# Shared Portuguese editorial correction

This supersedes any earlier claim that the shared Portuguese edition had been
certified as equally native in Brazil and Portugal. It had Brazilian-leaning
vocabulary and literal translations, including errors of meaning.

## Scope and changes

- Updated 1,990 text fields across all 33 quiz `pt.json` files.
- Retained one `pt` locale within the eight supported locales. Every quiz still
  has ten stages of seven questions. English content, answer IDs, scoring rules,
  Personality weights and quiz manifests are unchanged.
- Rewrote the 70 Treatments questions and 70 Anatomy questions, including all
  four answer choices, in their original answer-ID order. Examples include
  `pupila` for the eye's pupil, `articulação` for an anatomical joint, and the
  correct Portuguese expansion of TCC.
- Used shared wording such as `colegas`, `profissionais`, `formação` and
  `preparação` where it fits the context. Supplied both technical names where
  useful: `cancro (câncer)`, `oxigénio (oxigênio)`, `fémur (fêmur)`,
  `travão (freio)` and `células estaminais (células-tronco)`.
- Corrected clinical false friends and distinctions such as discharge/alta,
  chart/ficha, and a cardiac chamber/câmara. Corrected Saul the king separately
  from Saulo the apostle.
- Rewrote awkward result and instruction copy, including Memory, Personality
  and Vision. Memory instructions now name the actual `Já memorizei` button.
  Vision code prompts refer to characters and models rather than people and
  destinations. Memory study items and their answer relationships are preserved.
- Added the reviewed wording as the final Portuguese authoring pass. Running
  either that pass or the complete authoring pipeline again leaves the checked-in
  Portuguese copies unchanged.

The files implement an edited **shared Portuguese edition**. They are not
separate regional editions and have not received independent native-speaker
editorial sign-off in both countries. Structural and browser tests cannot certify
“10/10 native” prose.

Terminology references consulted include [SNS24 on cancro](https://www.sns24.gov.pt/pt/tema/doencas-oncologicas/cancro/),
[INCA on cellular and gene therapies](https://www.gov.br/inca/pt-br/assuntos/pesquisa/pesquisa-clinica-e-desenvolvimento-tecnologico/terapia-celular-e-genica-1)
and [Michaelis on pupila](https://michaelis.uol.com.br/moderno-portugues/busca/portugues-brasileiro/pupila).

## Rewarded-ad behavior

At the user's request, the original shared rewarded-ad behavior has been
restored: closing an ad before earning the reward automatically requests another
ad. The three-attempt fallback still applies only to genuine ad unavailability.
All ten chapter reward opportunities remain, alongside the existing Start and
optional answer-review opportunities. The Portuguese corrections are retained.

## Verification

- `npm run lint`: passed, including TypeScript, all **258 tests**, locale checks,
  ten-stage audits and production validation.
- `npm run build`: passed, including static-export validation.
- All **33 Portuguese full journeys** passed at 320px: **2,310 questions**, ten
  checkpoints each, scoring, study clues, visible labels, result and optional
  review. The persistent heading, question transitions and no-sharing behavior
  remain covered by these tests.
- All **330 Portuguese checkpoints** passed at 320 × 568px, including visible
  Continue/result buttons and ad notes.

Browser checks use mocked ad events and block external requests. They verify local
flow behavior, not live ad fill, ad-network performance or production analytics.
No deployment was performed.

Local logs: `/private/tmp/pt-memory-final-lint.log`,
`/private/tmp/pt-memory-final-build.log`,
`/private/tmp/pt-editorial-flows.log`,
`/private/tmp/pt-editorial-checkpoints.log`.
