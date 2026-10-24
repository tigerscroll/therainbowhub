import fs from 'node:fs';
import assert from 'node:assert/strict';
import {germanYears} from './chapter-locales/years-left-de.mjs';
import {frenchYears} from './chapter-locales/years-left-fr.mjs';
import {additionalYearsQuestions, reviewedYearsQuestionOverrides} from './chapter-locales/years-left-de-fr-100.mjs';
import {yearsInterface, yearsStageTitles} from './chapter-locales/years-left-de-fr-copy.mjs';
import {portugueseYearsQuestions} from './chapter-locales/years-left-pt-100.mjs';
import {portugueseYearsCopy, portugueseYearsStageTitles} from './chapter-locales/years-left-pt-copy.mjs';

// Author by stable stage/question/answer IDs, never by the shuffled display
// order. In particular, yl-s10q7 remains the final calibration question.
export function translateYearsLeft(locale, english, manifest) {
  assert.ok(['de', 'fr', 'pt'].includes(locale));
  const reviewed = locale === 'de' ? germanYears : locale === 'fr' ? frenchYears : undefined;
  if (reviewed) assert.equal(reviewed.length, 70);
  const interfaceCopy = locale === 'pt' ? portugueseYearsCopy : yearsInterface[locale];
  const stageTitles = locale === 'pt' ? portugueseYearsStageTitles : yearsStageTitles[locale];
  const copy = {...structuredClone(english), ...structuredClone(interfaceCopy), stages: {}};
  for (const [stageIndex, stage] of manifest.structure.stages.entries()) {
    const heading = copy.career.stages[stage.id].difficulty;
    const sourceStage = english.stages[stage.id];
    const questions = {};
    // Preserve JSON key parity as well as the manifest's actual display order.
    for (const id of Object.keys(sourceStage.questions)) {
      const match = id.match(/^yl-s(\d+)q(\d+)$/);
      assert.ok(match, id);
      const number = Number(match[2]);
      const row = locale === 'pt' ? portugueseYearsQuestions[id]?.split('|')
        : number <= 7 ? reviewed[stageIndex * 7 + number - 1] : additionalYearsQuestions[locale][id]?.split('|');
      assert.equal(row?.length, 5, `${locale}/${id}: prompt plus four answers required`);
      const [question, ...answers] = row;
      const overrides = reviewedYearsQuestionOverrides[locale]?.[id] ?? {};
      const logic = manifest.structure.questions[id];
      questions[id] = {
        question: overrides.question ?? question,
        headerLabel: `${locale === 'pt' ? 'EM FOCO: ' : locale === 'de' ? 'IM FOKUS: ' : 'ON EXPLORE : '}${heading}`,
        answers: Object.fromEntries(logic.answerIds.map((answerId, i) => {
          let answer = overrides[answerId] ?? answers[i];
          if (!overrides[answerId] && question.endsWith('Du…')) answer = `Ich ${answer[0].toLocaleLowerCase('de')}${answer.slice(1)}`;
          if (!overrides[answerId] && question.endsWith('Tu…')) {
            const lower = answer[0].toLocaleLowerCase('fr') + answer.slice(1);
            answer = /^[aeéiou]/i.test(lower) ? `J’${lower}` : `Je ${lower}`;
          }
          assert.ok(answer.trim());
          return [answerId, answer];
        })),
      };
      assert.equal(new Set(Object.values(questions[id].answers)).size, 4, `${locale}/${id}: distinct answers`);
    }
    copy.stages[stage.id] = {title: stageTitles[stageIndex], questions};
  }
  if (locale === 'fr') {
    // French question/exclamation punctuation stays attached to the preceding
    // word on small screens instead of wrapping onto a line of its own.
    const typography = value => typeof value === 'string' ? value.replace(/ (?=[?!])/g, '\u202f')
      : Array.isArray(value) ? value.map(typography)
      : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typography(item)])) : value;
    return typography(copy);
  }
  return copy;
}

if (process.argv[1]?.endsWith('/localize-years-left-de-fr.mjs')) {
  const root = 'data/quizzes/years-left';
  const manifest = JSON.parse(fs.readFileSync(`${root}/quiz.json`, 'utf8'));
  const english = JSON.parse(fs.readFileSync(`${root}/en.json`, 'utf8'));
  for (const locale of ['de', 'fr']) {
    const copy = translateYearsLeft(locale, english, manifest);
    fs.writeFileSync(`${root}/${locale}.json`, JSON.stringify(copy, null, 2) + '\n');
  }
  manifest.activeLocales = [...new Set([...(manifest.activeLocales ?? ['en']), 'de', 'fr'])].sort();
  fs.writeFileSync(`${root}/quiz.json`, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Years Left: German and French enabled with the same 10 × 10 questions, IDs and scoring as English.');
}
