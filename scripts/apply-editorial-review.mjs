import fs from 'node:fs';
import {getQuizSlugs, getSiteLocales} from './quiz-catalogue.mjs';
import {applyEditorialReview} from './chapter-locales/editorial-review.mjs';

for (const slug of getQuizSlugs()) {
  const source = JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`, 'utf8'));
  for (const locale of getSiteLocales().filter(locale => locale !== 'en')) {
    const file = `data/quizzes/${slug}/${locale}.json`, before = fs.readFileSync(file, 'utf8'), copy = JSON.parse(before);
    applyEditorialReview(slug, locale, copy, source);
    const after = JSON.stringify(copy, null, 2) + '\n';
    if (after !== before) {fs.writeFileSync(file, after); console.log(`${slug}/${locale}: applied reviewed copy`);}
  }
}
