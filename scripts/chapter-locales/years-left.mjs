import assert from 'node:assert/strict';
import {portugueseYears} from './years-left-pt.mjs';
import {arabicYears} from './years-left-ar.mjs';
import {frenchYears} from './years-left-fr.mjs';
import {germanYears} from './years-left-de.mjs';
import {italianYears} from './years-left-it.mjs';
import {dutchYears} from './years-left-nl.mjs';
import {spanishYears} from './years-left-es.mjs';

export function polishYearsLeft(copy, manifest, locale) {
  const rows = {pt: portugueseYears, ar: arabicYears, fr: frenchYears, de: germanYears, it: italianYears, nl: dutchYears, es: spanishYears}[locale];
  if (!rows) return;
  const ids = manifest.structure.stages.flatMap(stage => stage.questionIds);
  assert.equal(rows.length, ids.length);
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  ids.forEach((id, index) => {
    const [prompt, ...answers] = rows[index];
    assert.equal(answers.length, 4, id);
    questions[id].question = prompt;
    questions[id].answers = Object.fromEntries(manifest.structure.questions[id].answerIds.map((key, i) => {
      let text = answers[i];
      if (locale === 'fr' && prompt.endsWith('Tu…')) {
        text = text[0].toLocaleLowerCase('fr') + text.slice(1);
        text = /^[aeéiou]/i.test(text) ? `J’${text}` : `Je ${text}`;
      }
      if (locale === 'de' && prompt.endsWith('Du…')) text = `Ich ${text[0].toLocaleLowerCase('de')}${text.slice(1)}`;
      return [key, text];
    }));
  });
}
