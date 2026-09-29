import assert from 'node:assert/strict';
import { applyEntryLabel } from './three-choice-entry.mjs';

const openingPrompts = {
  en: 'Which square is a different color?',
  ar: 'أي مربع يختلف لونه؟',
  de: 'Welches Quadrat hat eine andere Farbe?',
  es: '¿Qué cuadrado tiene un color diferente?',
  fr: 'Quel carré a une couleur différente ?',
  it: 'Quale quadrato ha un colore diverso?',
  nl: 'Welk vierkant heeft een andere kleur?',
  pt: 'Qual é o quadrado com uma cor diferente?',
};

// Original ten-question opener's close blue shades, adapted to three choices.
const openingBoard = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 184" width="480" height="184"><rect width="480" height="184" rx="18" fill="#f1f7fa"/>${['#356ead', '#3d69ad', '#356ead'].map((color, i) => `<g data-row="${'ABC'[i]}"><rect x="${26 + i * 156}" y="20" width="116" height="116" rx="14" fill="${color}"/><text x="${84 + i * 156}" y="160" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#163654">${'ABC'[i]}</text></g>`).join('')}</svg>\n`;

export function applyVisionEntry(manifest, copies, assets) {
  applyEntryLabel(manifest, copies);
  const firstId = manifest.structure.stages[0].questionIds[0];
  assert.equal(firstId, 'vision-s1q1');
  const first = manifest.structure.questions[firstId];
  first.correctAnswerId = 'a2';
  first.category = 'colour_contrast';
  first.answerIds = ['a1', 'a2', 'a3'];
  for (const [locale, copy] of Object.entries(copies)) {
    assert.ok(openingPrompts[locale], `Missing Vision opening translation: ${locale}`);
    const words = copy.stages['stage-1'].questions[firstId];
    const labels = words.question === openingPrompts[locale] ? words.answers : copy.stages['stage-5'].questions['vision-s5q5'].answers;
    words.answers = Object.fromEntries(first.answerIds.map(id => {
      assert.ok(labels[id]);
      return [id, labels[id]];
    }));
    words.question = openingPrompts[locale];
    const altTemplate = copy.stages['stage-1'].questions['vision-s1q2'];
    assert.ok(altTemplate.image.alt.includes(altTemplate.question));
    words.image.alt = altTemplate.image.alt.replace(altTemplate.question, openingPrompts[locale]);
  }
  assets.write(first.image.src, openingBoard);
}
