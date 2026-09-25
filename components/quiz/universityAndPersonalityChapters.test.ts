import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type {Quiz} from '../../lib/quizzes.ts';
import {scoreQuiz} from './scoring.ts';
import {getChapterAnswers} from './engagement.ts';

const read = (slug: string, file: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${file}.json`, 'utf8'));
const manifest = read('personality', 'quiz');
const copy = read('personality', 'en');
const quiz = {
  engine: {scoring: {type: 'weighted-profile'}},
  questions: manifest.structure.stages.flatMap((stage: any, stageIndex: number) => stage.questionIds.map((id: string) => ({
    id, stage: stageIndex, choiceWeights: manifest.structure.questions[id].answerIds.map((key: string) => manifest.structure.questions[id].choiceMeanings[key]),
  }))),
  result: {
    profiles: manifest.structure.results.profiles.map((profile: any) => ({id: profile.id, ...copy.results.profiles[profile.key]})),
    scoreDimensions: manifest.structure.results.dimensions.map((dimension: any) => ({label: copy.results.dimensions[dimension.key].label, categories: dimension.profiles})),
  },
} as Quiz;

test('Personality preserves its landing and offers equal opportunities for every country style', () => {
  const original = read('personality', 'en');
  assert.equal(copy.title, original.title);
  assert.equal(copy.landing.intro, original.landing.intro);
  assert.equal(copy.landing.cta, 'Start');
  assert.deepEqual(manifest.structure.stages.map((stage: any) => stage.questionIds.length), Array(10).fill(7));
  const prompts = Object.values(copy.stages).flatMap((stage: any) => Object.values(stage.questions).map((question: any) => question.question));
  assert.equal(new Set(prompts).size, 70);
  assert.equal(copy.results.share, undefined);
  for (const question of quiz.questions) {
    assert.equal(question.answerIndex, undefined);
    assert.deepEqual(question.choiceWeights!.map(weights => Object.keys(weights)[0]).sort(), ['australia', 'italy', 'japan', 'sweden']);
    assert.ok(question.choiceWeights!.every(weights => Object.values(weights).length === 1 && Object.values(weights)[0] === 1));
  }
  for (const [index, stage] of manifest.structure.stages.entries()) {
    const gate = copy.career.stages[stage.id];
    assert.equal(gate.preAdButton, index === 9 ? 'See My Result' : 'Continue');
    if (index < 9) assert.match(gate.preAdCopy, /\{profile\}/);
  }
  const gateText = Object.values(copy.career.stages).flatMap((gate: any) => [gate.preAdTitle, gate.preAdCopy, gate.next?.tagline ?? '']);
  assert.doesNotMatch([copy.summary, copy.about.body, ...gateText].join(' '), /\b(?:10|ten|70|seventy)\b|halfway/i);
});

test('Personality can reach every match and each checkpoint uses only its current topic', () => {
  for (const target of quiz.result.profiles) {
    const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.choiceWeights!.findIndex(weights => weights[target.id!] === 1)]));
    assert.equal(scoreQuiz(quiz, answers).profile.id, target.id);
  }
  const answers = Object.fromEntries(quiz.questions.map(question => [question.id, question.choiceWeights!.findIndex(weights => weights[question.stage === 1 ? 'japan' : 'italy'] === 1)]));
  for (let stage = 0; stage < 10; stage++) {
    const chapter = {...quiz, questions: quiz.questions.filter(question => question.stage === stage)};
    assert.equal(scoreQuiz(chapter, getChapterAnswers(quiz.questions, answers, stage)).profile.id, stage === 1 ? 'japan' : 'italy');
  }
});

function answer(slug: string, id: string) {
  const logic = read(slug, 'quiz'), content = read(slug, 'en');
  const stage = logic.structure.stages.find((stage: any) => stage.questionIds.includes(id));
  return content.stages[stage.id].questions[id].answers[logic.structure.questions[id].correctAnswerId];
}

test('university calculations match independent arithmetic, including reversals and offsets', () => {
  const expected: Record<string, Record<string, number | string>> = {
    harvard: {'s2q1':24/6,'s2q2':200*.65,'s2q4':'20%','s5q1':(20+30+40)/3,'s5q2':'Team A','s5q5':3,'s5q7':15-10,'s9q1':'The first trial','s9q2':'20 credits','s9q4':70,'s10q2':48/6,'s10q6':'Plan A, by 10 credits'},
    oxford: {'s4q1':'30 credits','s4q2':27*2/3,'s4q3':4*12-6-10-14,'s4q4':'16:20','s4q5':240-30*5,'s4q6':25*2/5,'s4q7':(30-6)/2,'s10q3':40+35-60,'s10q4':100*1.2*.8},
    cambridge: {'s1q1':17+8,'s1q5':(10+2)*2,'s1q6':4,'s2q1':'15 mL','s2q2':2*60+30,'s2q3':1.5*100,'s2q6':'16 g','s6q2':(17+5)/2,'s6q6':42+1,'s6q7':15,'s8q1':'30 litres','s8q2':'10 mL','s8q3':'25%','s8q7':'96 m²','s9q1':Math.abs(13-12)+Math.abs(17-18),'s10q1':26-5,'s10q2':((2+3)*2+3)*2,'s10q6':'They are equal'},
  };
  for (const [slug, rows] of Object.entries(expected)) for (const [id, value] of Object.entries(rows)) assert.equal(answer(slug, `${slug}-${id}`), String(value), `${slug}-${id}`);
});

test('Oxford truth puzzle has exactly one consistent solution', () => {
  const valid = [];
  for (let mask = 0; mask < 8; mask++) {
    const [a,b,c] = [0,1,2].map(bit => Boolean(mask & (1 << bit)));
    if (Number(a)+Number(b)+Number(c) === 1 && a === b && b === (!a && !c) && c === !b) valid.push(['A','B','C'][[a,b,c].indexOf(true)]);
  }
  assert.deepEqual(valid, [answer('oxford', 'oxford-s10q1')]);
});

test('localized university puzzles preserve theatrical meaning and Arabic symbol labels', () => {
  const scope = {quizzes: fs.readdirSync('data/quizzes').filter(slug => fs.existsSync(`data/quizzes/${slug}/quiz.json`)), locales: fs.readdirSync('data/i18n').filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5))};
  const plays: Record<string, string> = {fr:'Pièce de théâtre',de:'Theaterstück',it:'Opera teatrale',nl:'Toneelstuk',es:'Obra de teatro',pt:'Peça de teatro',ar:'مسرحية'};
  const logic = read('oxford', 'quiz');
  for (const locale of scope.locales.filter((l: string) => l !== 'en')) {
    const content = read('oxford', `${locale}`);
    assert.equal(content.stages['stage-1'].questions['oxford-s1q2'].answers[logic.structure.questions['oxford-s1q2'].correctAnswerId], plays[locale]);
  }
  const content = read('oxford', 'ar');
  assert.match(content.stages['stage-10'].questions['oxford-s10q1'].question, /A.*B.*B.*A.*C.*C.*B/);
});

test('native reasoning keeps physical quantities, correlations and named candidates meaningful', () => {
  const masses: Record<string,string> = {fr:'La masse',de:'Masse',it:'La massa',nl:'Massa',es:'La masa',pt:'Massa',ar:'الكتلة'};
  const associations: Record<string,RegExp> = {fr:/association/,de:/Zusammenhang/,it:/associazione/,nl:/samenhang/,es:/asociación/,pt:/associação/,ar:/ارتباط/};
  const oxford = read('oxford','quiz'), cambridge = read('cambridge','quiz');
  const english = read('oxford','en');
  const massId = Object.entries(english.stages['stage-1'].questions['oxford-s1q3'].answers).find(([,value]) => value === 'Mass')![0];
  for (const locale of Object.keys(masses)) {
    const copy = read('oxford',`${locale}`);
    assert.equal(copy.stages['stage-1'].questions['oxford-s1q3'].answers[massId],masses[locale]);
    const candidate = copy.stages['stage-10'].questions['oxford-s10q2'];
    const correct = candidate.answers[oxford.structure.questions['oxford-s10q2'].correctAnswerId];
    assert.ok(candidate.question.includes(correct),`${locale}: the correct candidate is named in the question`);
    const correlation = read('cambridge',`${locale}`).stages['stage-7'].questions['cambridge-s7q2'];
    assert.match(correlation.answers[cambridge.structure.questions['cambridge-s7q2'].correctAnswerId],associations[locale]);
  }
});
