import assert from 'node:assert/strict';
import harvard from '../english-chapters/harvard.mjs';
import oxford from '../english-chapters/oxford.mjs';
import cambridge from '../english-chapters/cambridge.mjs';
import personality from '../english-chapters/personality.mjs';
import harvardAr from './harvard-ar.mjs';
import oxfordAr from './oxford-ar.mjs';
import cambridgeAr from './cambridge-ar.mjs';
import personalityAr from './personality-ar.mjs';
import personalityPt from './personality-pt.mjs';
import {semanticRows} from './additional-semantics.mjs';

const authored = {harvard, oxford, cambridge, personality};
const editions = {ar:{harvard:harvardAr, oxford:oxfordAr, cambridge:cambridgeAr, personality:personalityAr}, pt:{personality:personalityPt}};

export function polishNativeAdditional(slug, locale, copy, source) {
  const rows = editions[locale]?.[slug];
  if (!authored[slug]) return;
  if (rows) assert.equal(rows.length, 70, `${slug}/${locale}: complete native question set`);
  for (const [roundIndex, round] of authored[slug].rounds.entries()) {
    const stage = `stage-${roundIndex + 1}`;
    for (const [questionIndex, original] of round.questions.entries()) {
      const id = `${slug}-s${roundIndex + 1}q${questionIndex + 1}`;
      const row = rows?.[roundIndex * 7 + questionIndex] ?? semanticRows[locale]?.[id];
      if (!row) continue;
      assert.equal(row.length, 5, `${id}/${locale}: prompt and four choices`);
      assert.equal(new Set(row.slice(1)).size, 4, `${id}/${locale}: distinct choices`);
      const target = copy.stages[stage].questions[id];
      target.question = row[0];
      for (const [key, answer] of Object.entries(source.stages[stage].questions[id].answers)) {
        const index = original.slice(1,5).indexOf(answer);
        assert.ok(index >= 0, `${id}/${locale}: retain the source answer mapping for ${answer}`);
        target.answers[key] = row[index + 1];
      }
    }
  }
}
