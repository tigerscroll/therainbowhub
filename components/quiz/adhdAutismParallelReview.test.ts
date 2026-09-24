import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const locales = 'ar bg cs da de el en es fi fil fr he hr hu id it ja ms nb nl pl pt ro sk sr sv th tr uk vi'.split(' ');
const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('ADHD and Autism each retain ten weighted questions and complete copy in all 30 locales', () => {
  for (const slug of ['adhd', 'autism']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages[0].questionIds as string[];
    assert.equal(manifest.engine.scoring, 'weighted-profile', slug);
    assert.equal(manifest.structure.stages.length, 1, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    assert.equal(manifest.structure.results.profiles.length, 4, slug);
    const files = fs.readdirSync(`data/quizzes/${slug}`).filter((name) => /^[a-z]{2,3}\.json$/.test(name)).map((name) => name.slice(0, -5));
    assert.deepEqual(files.sort(), [...locales].sort(), slug);
    for (const locale of locales) {
      const copy = read(slug, locale);
      const questions = copy.stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      assert.ok(copy.about.body.includes('\n\n'), `${slug}/${locale}: missing explanatory context`);
      assert.ok(copy.about.disclaimer.length > 100, `${slug}/${locale}: missing diagnostic caveat`);
      for (const profile of ['profile-1', 'profile-2', 'profile-3', 'profile-4']) {
        assert.ok(copy.results.profiles[profile].copy.trim(), `${slug}/${locale}/${profile}`);
      }
      for (const id of ids) {
        const question = questions[id];
        assert.ok(question.question.trim(), `${slug}/${locale}/${id}: empty prompt`);
        assert.deepEqual(Object.keys(question.answers).sort(), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(question.answers).map((answer: any) => answer.trim().toLocaleLowerCase())).size, 4, `${slug}/${locale}/${id}: duplicate answer`);
        assert.deepEqual(manifest.structure.questions[id].answerIds, ['a1', 'a2', 'a3', 'a4'], `${slug}/${id}: score mapping changed`);
        assert.deepEqual(Object.keys(manifest.structure.questions[id].choiceMeanings), ['a1', 'a2', 'a3', 'a4'], `${slug}/${id}: missing weighted choice`);
      }
    }
  }
});

test('ADHD retains age-of-onset and across-settings context rather than a diagnostic result', () => {
  for (const locale of locales) {
    const copy = read('adhd', locale);
    const questions = copy.stages['stage-1'].questions;
    assert.match(questions['adhd-q9'].answers.a4, /12/, locale);
    assert.notEqual(questions['adhd-q10'].answers.a2, questions['adhd-q10'].answers.a4, locale);
    assert.notEqual(questions['adhd-q10'].answers.a3, questions['adhd-q10'].answers.a4, locale);
  }
  assert.match(read('adhd', 'en').about.disclaimer, /not a diagnostic test, validated ADHD screener/);
  assert.match(read('adhd', 'en').results.profiles['profile-1'].copy, /cannot rule out ADHD/);
  assert.match(read('adhd', 'en').results.profiles['profile-4'].copy, /not a diagnosis/);
  assert.match(read('adhd', 'fr').stages['stage-1'].questions['adhd-q9'].answers.a3, /se manifestait déjà dans l'enfance/);
});

test('Autism retains the early-life, multi-domain and non-diagnostic distinctions', () => {
  const en = read('autism', 'en');
  assert.match(en.about.disclaimer, /not a diagnostic test, validated autism screener/);
  assert.match(en.results.profiles['profile-1'].copy, /cannot rule out autism/);
  assert.match(en.results.profiles['profile-4'].copy, /does not measure severity or support needs and is not a diagnosis/);
  const reviewed: Record<string, RegExp> = {
    bg: /проявили.*ранна възраст.*повече от една област/,
    da: /viste sig tidligt.*mere end ét område/,
    el: /εμφανίστηκαν.*μικρή ηλικία.*περισσότερους από έναν τομείς/,
    nb: /viste seg tidlig.*mer enn ett område/,
    nl: /waren al vroeg aanwezig.*meer dan één levensgebied/,
    pt: /manifestaram-se desde cedo.*mais de um domínio/,
    sv: /visade sig tidigt.*mer än ett område/,
  };
  for (const [locale, pattern] of Object.entries(reviewed)) {
    assert.match(read('autism', locale).stages['stage-1'].questions['autism-q10'].answers.a4, pattern, locale);
  }
});
