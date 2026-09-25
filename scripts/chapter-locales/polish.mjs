import {bibleBooks} from '../round-expansion/bible-book-names.mjs';
import {correctTerm, applyQuestionCorrections} from './corrections.mjs';
import {polishPortuguese} from './portuguese.mjs';
import {polishWordPuzzles} from './word-puzzles.mjs';
import {correctClinicalTerm} from './clinical-language.mjs';
import {polishTreatments} from './treatments.mjs';
import {adaptNativeQuestions} from './adapted-questions.mjs';
import {correctArabicTerm} from './arabic-terms.mjs';
import {correctVisualAnswer} from './visual-answers.mjs';
import {polishYearsLeft} from './years-left.mjs';
import {polishYearsLeftResults} from './years-left-results.mjs';
import {polishAdditional} from './additional-corrections.mjs';
import {polishNativeAdditional} from './native-additional.mjs';
import {correctUniversityCurrency} from './university-currency.mjs';

export function walk(value, callback, parts = []) {
  if (typeof value === 'string') return callback(value, parts);
  if (Array.isArray(value)) return value.map((item, index) => walk(item, callback, [...parts, String(index)]));
  if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) value[key] = walk(item, callback, [...parts, key]);
  return value;
}

export function polishCopy(slug, locale, copy, source, manifest) {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'en-US' : locale, {maximumFractionDigits: 3, useGrouping: false});
  walk(copy, (value, parts) => {
    const original = parts.reduce((object, key) => object?.[key], source);
    value = correctVisualAnswer(slug, locale, original) ?? (locale === 'ar' ? correctArabicTerm(slug, original) : undefined) ?? correctClinicalTerm(slug, locale, original) ?? correctTerm(slug, locale, original) ?? value;
    value = correctUniversityCurrency(slug, locale, value, original);
    // Convert the protected English notation only; digits in puzzle codes and
    // clock times never pass through number formatting.
    for (const number of original?.match(/\b(?:\d{1,3}(?:,\d{3})+|\d+\.\d+)\b/g) ?? []) {
      const native = formatter.format(Number(number.replaceAll(',', '')));
      value = value.replaceAll(number, native);
    }
    value = value.replace(/(\d)(m[Ll]|g|kg)\b/g, '$1 $2').replace(/\bml\b/g, 'mL');
    if (['bible', 'catholic'].includes(slug) && parts.includes('answers') && bibleBooks[locale]?.[original]) value = bibleBooks[locale][original];
    return value.replaceAll('\u200b', '');
  });
  applyQuestionCorrections(copy, locale);
  adaptNativeQuestions(copy, locale);
  if (slug === 'treatments') polishTreatments(copy, source, locale);
  if (slug === 'iq') polishWordPuzzles(copy, manifest, locale);
  if (locale === 'pt') polishPortuguese(slug, copy, manifest);
  polishAdditional(slug, locale, copy, source);
  polishNativeAdditional(slug, locale, copy, source);
  if (slug === 'years-left') {
    polishYearsLeft(copy, manifest, locale);
    polishYearsLeftResults(copy, locale);
  }
  if (locale === 'ar') walk(copy, (value, parts) => {
    // Keep Latin puzzle sequences contiguous for <bdi dir="ltr">. Arabic prose
    // and Arabic punctuation elsewhere continue to follow the page direction.
    value = value.replace(/([A-Za-z0-9])،(?=\s*[A-Za-z0-9])/g, '$1,');
    const original = parts.reduce((object, key) => object?.[key], source);
    if (parts.includes('answers') && /^\d[\d,.]* g$/.test(original ?? '')) value = `${original.replace(/,/g, '').slice(0, -2)} غ`;
    return value;
  });
}
