import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import type { Quiz } from '../../lib/quizzes.ts';
import { expandQuizLocale } from '../../scripts/quiz-schema-v2.mjs';
import { getChapterAnswers } from './engagement.ts';
import { scoreQuiz } from './scoring.ts';

const read = (file: string) => JSON.parse(fs.readFileSync(`data/quizzes/memory/${file}.json`, 'utf8'));
const manifest = read('quiz');
const copy = read('en');
const id = (short: string) => `memory-${short}`;
const content = (short: string) => copy.stages[`stage-${short.match(/^s(\d+)q/)![1]}`].questions[id(short)];
const answer = (short: string) => content(short).answers[manifest.structure.questions[id(short)].correctAnswerId] as string;
const normalize = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, '');

test('English memory has ten seven-question chapters, self-paced cues and no advertised length', () => {
  const expanded = expandQuizLocale(manifest, copy, 'en');
  assert.equal(manifest.template, 'ten-stage-seven-question-v1');
  assert.deepEqual(manifest.activeLocales, fs.readdirSync('data/i18n').filter(file => /^[a-z]{2,3}\.json$/.test(file)).map(file => file.slice(0, -5)).sort());
  assert.equal(manifest.engine.hardRefreshCheckpoints, false);
  assert.deepEqual(expanded.stages.map((stage: {questions: unknown[]}) => stage.questions.length), Array(10).fill(7));
  assert.deepEqual(copy.landing, { intro: 'Think your memory is sharp? Put it to the test.', cta: 'Start' });
  const all = expanded.stages.flatMap((stage: { questions: {id: string; question: string; answers: string[]}[] }) => stage.questions);
  assert.equal(new Set(all.map((question: {id: string}) => question.id)).size, 70);
  assert.equal(new Set(all.map((question: {question: string}) => question.question)).size, 70);
  const positions = [0, 0, 0, 0];
  for (const [index, stage] of manifest.structure.stages.entries()) {
    assert.equal(copy.career.stages[stage.id].preAdButton, index === 9 ? 'See My Result' : 'Continue');
    if (index < 9) assert.match(copy.career.stages[stage.id].preAdCopy, /\{profile\}/);
    for (const questionId of stage.questionIds) {
      const logic = manifest.structure.questions[questionId];
      const question = copy.stages[stage.id].questions[questionId];
      assert.equal(new Set(Object.values(question.answers)).size, 4, questionId);
      positions[logic.answerIds.indexOf(logic.correctAnswerId)]++;
      if (logic.study) assert.deepEqual(logic.study, { mode: 'manual', rewarded: false });
    }
  }
  assert.deepEqual(positions.sort(), [17, 17, 18, 18]);
  assert.equal(Object.values(manifest.structure.questions).filter((question: any) => question.study).length, 19);
  for (const text of [copy.landing.intro, copy.summary, copy.about.body, ...copy.about.howToPlay.steps, ...Object.values(copy.career.stages).flatMap((stage: any) => [stage.preAdTitle, stage.preAdCopy])]) {
    assert.doesNotMatch(text, /\b(?:70|seventy|10|ten|7|seven)\b|halfway|\b(?:one|two|\d+) chapters? (?:left|to go)\b/i);
  }
  assert.equal(copy.results.share, undefined);
});

test('recall answers are uniquely supported by the relevant study detail, including distant callbacks', () => {
  const sources: [string, string, number][] = [
    ['s1q1','s1q1',0], ['s1q3','s1q1',1], ['s1q4','s1q4',2], ['s1q5','s1q1',2], ['s1q6','s1q4',0], ['s1q7','s1q1',3],
    ['s2q1','s2q1',2], ['s2q4','s2q4',0], ['s2q5','s2q1',3], ['s2q6','s2q4',2],
    ['s3q1','s3q1',1], ['s3q4','s3q4',2], ['s3q6','s3q4',3],
    ['s4q1','s4q1',1], ['s4q2','s4q1',2], ['s4q4','s4q4',2], ['s4q5','s4q1',3], ['s4q6','s4q4',1], ['s4q7','s4q1',0],
    ['s5q1','s5q1',0], ['s5q2','s5q1',2], ['s5q4','s5q4',0], ['s5q5','s5q1',1], ['s5q6','s5q4',2], ['s5q7','s5q4',3],
    ['s6q1','s6q1',1], ['s6q2','s6q1',0], ['s6q4','s6q4',2], ['s6q5','s6q1',3], ['s6q6','s6q4',3],
    ['s7q1','s7q1',2], ['s7q2','s7q1',4], ['s7q4','s7q4',2], ['s7q6','s7q4',0],
    ['s8q1','s8q1',2], ['s8q2','s8q1',1], ['s8q4','s8q4',1], ['s8q5','s8q1',0], ['s8q6','s8q4',3], ['s8q7','s8q1',3],
    ['s9q1','s9q1',1], ['s9q2','s9q1',3], ['s9q4','s9q4',0], ['s9q5','s9q1',0], ['s9q6','s9q4',1], ['s9q7','s9q4',2],
    ['s10q1','s10q1',1], ['s10q2','s9q4',3], ['s10q3','s10q1',2], ['s10q4','s5q1',3], ['s10q6','s10q1',0], ['s10q7','s1q1',1],
  ];
  const orderedIds = manifest.structure.stages.flatMap((stage: {questionIds: string[]}) => stage.questionIds);
  for (const [question, source, item] of sources) {
    assert.ok(orderedIds.indexOf(id(source)) <= orderedIds.indexOf(id(question)), `${question}: cue appears before the recall`);
    const clue = normalize(content(source).study.items[item]);
    const matches = (Object.values(content(question).answers) as string[]).filter(value => clue.includes(normalize(value)));
    assert.deepEqual(matches, [answer(question)], `${question}: exactly one option matches the studied detail`);
  }
});

test('transformations, ordering and distractor puzzles have the correct solution', () => {
  assert.equal(answer('s1q2'), 'H2K1');
  assert.ok(!content('s2q1').study.items.includes(answer('s2q2')));
  assert.equal(answer('s2q3'), [9, 2, 6].slice(1).concat(9).join(' – '));
  assert.ok(content('s2q4').study.items.includes(answer('s2q7')));
  assert.ok(!content('s2q1').study.items.includes(answer('s2q7')));
  assert.equal(answer('s3q2'), [...content('s3q1').study.items].reverse().join(' – '));
  assert.equal(answer('s3q3'), '1221');
  const digits = content('s3q1').study.items.map(Number);
  assert.equal(Number(answer('s3q5')), digits[0] + digits.at(-1));
  const code = 'K6P2';
  assert.equal(answer('s3q7'), code.at(-1) + code.slice(1, -1) + code[0]);
  assert.equal(answer('s4q3'), 'B7RK'.slice(0, 2) + [...'B7RK'.slice(2)].reverse().join(''));
  assert.equal(Number(answer('s5q3')), [...'TENETEN'].filter(letter => letter === 'E').length);
  assert.equal(answer('s6q3'), 'S5RT');
  assert.match(content('s6q4').study.items[0], /STRIPED/);
  assert.equal(answer('s6q7'), 'Stripes');
  const objects = content('s7q1').study.items;
  assert.equal(normalize(answer('s7q3')), normalize(`${objects[0]} and ${objects.at(-1)}`));
  assert.equal(normalize(answer('s7q5')), normalize(objects.slice(-2).join(', ')));
  assert.equal(normalize(answer('s7q7')), normalize([...objects].reverse().at(-2)));
  assert.equal(answer('s8q3'), 'R8K3');
  const [hour, minute] = content('s9q1').study.items[2].split(' · ')[1].split(':').map(Number);
  const changed = hour * 60 + minute + 15;
  assert.equal(answer('s9q3'), `${Math.floor(changed / 60)}:${String(changed % 60).padStart(2, '0')}`);
  const pairs = content('s10q1').study.items.map((item: string) => item.split(' · '));
  assert.equal(answer('s10q5'), pairs.sort((a: string[], b: string[]) => Number(a[1]) - Number(b[1]))[0][0]);
});

function scoringQuiz(): Quiz {
  return {
    engine: { scoring: { type: 'correct-answer' }, targetRatio: 0.8 },
    stages: manifest.structure.stages.map((stage: {id: string}) => copy.stages[stage.id].title),
    questions: manifest.structure.stages.flatMap((stage: {questionIds: string[]}, stageIndex: number) => stage.questionIds.map(questionId => {
      const logic = manifest.structure.questions[questionId];
      return { id: questionId, stage: stageIndex, answerIndex: logic.answerIds.indexOf(logic.correctAnswerId), category: logic.category };
    })),
    result: {
      profiles: manifest.structure.results.profiles.map((profile: {key: string; min: number}) => ({minRatio: profile.min, ...copy.results.profiles[profile.key]})),
      scoreDimensions: manifest.structure.results.dimensions.map((dimension: {key: string; categories: string[]}) => ({ label: copy.results.dimensions[dimension.key].label, categories: dimension.categories })),
    },
  } as Quiz;
}

test('memory scoring uses all 70 answers with an exact 56-answer target and accurate chapter previews', () => {
  const quiz = scoringQuiz();
  for (const correct of [0, 35, 42, 49, 55, 56, 63, 70]) {
    const answers = Object.fromEntries(quiz.questions.map((question, index) => [question.id, index < correct ? question.answerIndex! : (question.answerIndex! + 1) % 4]));
    const result = scoreQuiz(quiz, answers);
    assert.equal(result.score, correct);
    assert.equal(result.total, 70);
    assert.equal(result.targetStatus === 'achieved', correct >= 56);
  }
  const perfect = Object.fromEntries(quiz.questions.map(question => [question.id, question.answerIndex!]));
  for (let stage = 0; stage < 10; stage++) {
    const questions = quiz.questions.filter(question => question.stage === stage);
    const result = scoreQuiz({ ...quiz, questions }, getChapterAnswers(quiz.questions, perfect, stage));
    assert.equal(result.total, 7);
    assert.equal(result.profile.title, 'Memory Mastermind', 'perfect early chapters are not diluted by unanswered future questions');
  }
});
