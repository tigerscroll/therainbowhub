import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const locales = read('grammar', 'quiz').activeLocales as string[];
const question = (slug: string, locale: string, id: string) => read(slug, locale).stages['stage-1'].questions[id];

test('Grammar and Word retain ten questions and the same answer keys in every locale', () => {
  for (const slug of ['grammar', 'word']) {
    const manifest = read(slug, 'quiz');
    assert.equal(manifest.structure.stages[0].questionIds.length, 10, slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), manifest.structure.stages[0].questionIds.slice().sort(), `${slug}/${locale}`);
      for (const [id, item] of Object.entries(questions) as Array<[string, { answers: Record<string, string> }]>) {
        assert.ok(item.answers[manifest.structure.questions[id].correctAnswerId], `${slug}/${locale}/${id}`);
      }
    }
  }
});

test('Grammar headlines avoid literal broken-sentence translations and dangling ownership', () => {
  const oldLiterals: Record<string, RegExp> = {
    bg: /Разбити изречения/u,
    cs: /Rozbité věty/u,
    el: /Σπασμένες προτάσεις/u,
    fi: /Rikkinäiset lauseet/u,
    hr: /Izlomljene rečenice/u,
    nb: /Ødelagte setninger/u,
    sv: /Trasiga meningar/u,
    tr: /Kırık cümleler/u,
  };
  for (const [locale, literal] of Object.entries(oldLiterals)) {
    assert.doesNotMatch(read('grammar', locale).summary, literal, locale);
  }
  assert.doesNotMatch(read('grammar', 'hu').title, /10%-uk/u);
  assert.doesNotMatch(read('grammar', 'fil').title, /Grammar Quiz/u);
});

test('Spanish and Italian Grammar introduce sentence editing and describe answer review naturally', () => {
  const es = read('grammar', 'es');
  const it = read('grammar', 'it');
  assert.match(es.landing.intro, /cada frase/u);
  assert.match(it.landing.intro, /ogni frase/u);
  assert.doesNotMatch(JSON.stringify(es.results.profiles), /Su revisión muestra qué conexiones|Utilice la revisión/u);
  assert.doesNotMatch(JSON.stringify(it.results.profiles), /La tua recensione mostra|collegamenti rivisitare/u);
});

test('Grammar meeting-time answers refer to the same chart in the reviewed locales', () => {
  const chartWords: Record<string, RegExp> = {
    da: /diagrammet/u,
    el: /διάγραμμα/u,
    fi: /kaavion/u,
    hu: /diagramot/u,
    tr: /grafiği/u,
  };
  for (const [locale, noun] of Object.entries(chartWords)) {
    const item = question('grammar', locale, 'grammar-r3q1');
    for (const [id, answer] of Object.entries(item.answers) as Array<[string, string]>) {
      assert.match(answer, noun, `${locale}/${id}`);
    }
  }
  assert.doesNotMatch(JSON.stringify(question('grammar', 'fi', 'grammar-r3q1').answers), /täytt/u);
  assert.doesNotMatch(JSON.stringify(question('grammar', 'hu', 'grammar-r3q1').answers), /táblázat/u);
  assert.equal(read('grammar', 'quiz').structure.questions['grammar-r3q1'].correctAnswerId, 'a4');
});

test('Indonesian and Malay passive-voice questions specify standard written grammar', () => {
  const id = question('grammar', 'id', 'grammar-r5q4');
  const ms = question('grammar', 'ms', 'grammar-r5q4');
  assert.match(id.question, /pasif baku/u);
  assert.match(ms.question, /bahasa Melayu baku/u);
  assert.equal(id.answers.a1, 'Laporan itu sudah saya baca.');
  assert.equal(ms.answers.a1, 'Laporan itu telah saya baca.');
  assert.equal(read('grammar', 'quiz').structure.questions['grammar-r5q4'].correctAnswerId, 'a1');
});

test('Southeast Asian Grammar results do not show machine-literal skill breakage or English proofreading labels', () => {
  for (const locale of ['fil', 'id', 'ms']) {
    const copy = read('grammar', locale);
    assert.doesNotMatch(copy.eyebrow, /PROOFREADING|MEMPROOF/u, locale);
    assert.doesNotMatch(JSON.stringify(copy.results), /pagkasira ng iyong kasanayan|perintah Anda pada halaman|arahan halaman anda/iu, locale);
    assert.ok(copy.about.howToPlay.steps.every((step: string) => step.trim().length > 20), locale);
  }
});

test('Serbian Word introduction agrees in number with its ten questions', () => {
  const body = read('word', 'sr').about.body;
  assert.match(body, /Десет питања почињу/u);
  assert.match(body, /затим прелазе/u);
  assert.doesNotMatch(body, /Десет питања почиње/u);
});

test('Word battery prompts keep a single defensible link where battery can also mean drums', () => {
  const ambiguousMusicWords: Record<string, RegExp> = {
    es: /melodía|música|ritmo/iu,
    fr: /mélodie|musique|rythme/iu,
    it: /melodia|musica|ritmo/iu,
    pt: /melodia|música|ritmo/iu,
    ro: /melodie|muzică|ritm/iu,
  };
  for (const [locale, musicWord] of Object.entries(ambiguousMusicWords)) {
    const item = question('word', locale, 'word-q4');
    assert.equal(read('word', 'quiz').structure.questions['word-q4'].correctAnswerId, 'a3');
    assert.doesNotMatch(item.answers.a4, musicWord, `${locale}: second plausible music link`);
  }
});
