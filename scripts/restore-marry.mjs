import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chapters, profileSets, marryChapterLabel} from './marry-content.mjs';
import {localizeMarry} from './localize-marry.mjs';

// Last complete long edition, before the catalogue was cut to ten questions.
const recoveryRef = 'eb1a3f5e';
const root = 'data/quizzes/marry';
const archived = file => execFileSync('git', ['show', `${recoveryRef}:${root}/${file}`]);
const manifest = JSON.parse(archived('quiz.json'));
const copy = JSON.parse(archived('en.json'));
const levels = ['foundation', 'foundation', 'developing', 'developing', 'skilled', 'skilled', 'advanced', 'advanced', 'advanced', 'final'];
manifest.template = 'ten-stage-eight-question-v1';
manifest.activeLocales = ['en'];
manifest.engine.hardRefreshCheckpoints = true;
manifest.engine.profileArtworkSelector.fixedVariants = {a1: 'masculine', a2: 'feminine', a3: 'androgynous'};
manifest.listing.compactLanding = true;
manifest.listing.showSocialProof = false;
delete manifest.theme.artwork.checkpoints;
delete manifest.theme.artwork.checkpointVariants;
manifest.structure.checkpoint = {finalIcon: '✏️'};

for (const logic of Object.values(manifest.structure.questions)) {
  logic.answerIds = Array.from({length: logic.choiceCount}, (_, index) => `a${index + 1}`);
  for (const field of ['icons', 'calibration', 'choiceMeanings']) {
    if (logic[field]) logic[field] = Object.fromEntries(logic.answerIds.map((id, index) => [id, logic[field][index]]));
  }
  logic.presentation ??= 'text';
  delete logic.choiceCount;
}

delete copy.schemaVersion;
copy.eyebrow = 'YOUR FICTIONAL PARTNER PORTRAIT';
copy.landing = {intro: 'Follow the clues. Reveal the portrait matched to your heart.', cta: 'Start'};
copy.summary = 'Explore attraction, personality and everyday-life preferences, then reveal a fictional partner portrait matched to your answers.';
copy.about.body = 'Explore attraction, personality, everyday life and the little things that make a connection feel right. This edition has ten themed stages of eight questions. There are no right or wrong answers. The opening choice sets the portrait presentation; the other choices contribute to your relationship-style match.\n\nThe original forty-question experience is joined by forty new questions about small gestures, independence, unexpected changes, shared traditions and final impressions. Each checkpoint introduces a fresh topic, while the finished portrait stays hidden until the final reveal.\n\nYour answers select a result from an original library of fictional portraits. The image is not drawn live, based on a real person or a prediction of whom you will marry. This is an entertainment experience, not a psychological or relationship assessment.';
delete copy.about.howToPlay.title;
copy.about.howToPlay.steps = [
  'Choose the portrait presentation, then follow the answers that feel most like you.',
  'Complete each set of eight questions and continue at the checkpoint. Your progress is saved on this device.',
  'Reveal your fictional partner portrait and relationship style, with an optional breakdown of your preferences.',
];
delete copy.checkpoint;
delete copy.results.share;
copy.results.profileReveal.eyebrow = 'YOUR FICTIONAL PARTNER PORTRAIT';
copy.results.profileReveal.consistency = 'YOUR ANSWER PATTERN';
copy.results.profileReveal.consistencyLabels = {
  high: 'A clear leading preference',
  medium: 'A blend with a leading preference',
  mixed: 'A varied mix of preferences',
};
copy.results.profileReveal.breakdown = {
  eyebrow: 'BEHIND YOUR PORTRAIT',
  title: 'What shaped your match?',
  copy: 'Explore their three traits, the detail you might notice first and the preferences behind your fictional match.',
  button: 'Explore My Match',
  adNote: 'Short ad first, then see the breakdown.',
  heading: 'Your relationship-style signals',
};
copy.career = {resultProgressLabel: 'Your portrait', stages: {}};

for (const [index, chapter] of chapters.entries()) {
  const stageId = `stage-${index + 1}`;
  const header = marryChapterLabel(chapter.title);
  if (index < 5) {
    manifest.structure.stages[index].difficultyLevel = levels[index];
    delete manifest.structure.stages[index].uppercaseNextForLocales;
    copy.stages[stageId].title = chapter.title;
    for (const [id, question] of Object.entries(copy.stages[stageId].questions)) {
      question.headerLabel = header;
      question.answers = Object.fromEntries(manifest.structure.questions[id].answerIds.map((answerId, i) => [answerId, question.answers[i]]));
    }
  } else {
    assert.equal(chapter.questions.length, 8);
    const stage = {id: stageId, difficultyLevel: levels[index], questionIds: []};
    manifest.structure.stages.push(stage);
    copy.stages[stageId] = {title: chapter.title, questions: {}};
    for (const [qIndex, [question, ...answers]] of chapter.questions.entries()) {
      assert.equal(answers.length, 4);
      const id = `marry-s${index + 1}q${qIndex + 1}`;
      const profiles = profileSets[qIndex % 2];
      const offset = ((index - 5) * 8 + qIndex) % 4;
      const order = Array.from({length: 4}, (_, i) => (i + offset) % 4);
      const answerIds = order.map(i => `a${i + 1}`);
      stage.questionIds.push(id);
      manifest.structure.questions[id] = {
        presentation: 'text', answerIds,
        choiceMeanings: Object.fromEntries(order.map(i => [`a${i + 1}`, {[profiles[i]]: 1}])),
      };
      copy.stages[stageId].questions[id] = {
        question, headerLabel: header,
        answers: Object.fromEntries(order.map(i => [`a${i + 1}`, answers[i]])),
      };
    }
  }
  const final = index === chapters.length - 1;
  copy.career.stages[stageId] = {
    difficulty: header, preAdTitle: chapter.checkpoint, preAdCopy: chapter.feedback,
    preAdButton: final ? 'Reveal My Portrait' : 'Continue',
    ...(final ? {preAdChecks: ['Attraction and personality considered', 'Everyday preferences combined', 'Fictional portrait selected']} : {
      next: {eyebrow: 'UP NEXT', tagline: chapter.teaser},
    }),
  };
}
// This was the old finale; it is now a mid-journey instinct question.
copy.stages['stage-5'].questions['marry-r5q8'].question = 'Trust your instinct: which feeling do you choose?';
assert.equal(Object.keys(manifest.structure.questions).length, 80);

fs.mkdirSync(root, {recursive: true});
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', recoveryRef, root], {encoding: 'utf8'}).trim().split('\n');
for (const file of files) {
  const relative = file.slice(root.length + 1);
  if (!/^assets\/(items\/|results\/|thumbnail\.webp$)/.test(relative) && relative !== 'theme.css') continue;
  // Original images are restored verbatim; never replace an existing edit.
  if (fs.existsSync(file)) continue;
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, archived(relative));
}
for (const [name, value] of [['quiz', manifest], ['en', copy]]) {
  fs.writeFileSync(`${root}/${name}.json`, JSON.stringify(value, null, 2) + '\n');
}
localizeMarry();
