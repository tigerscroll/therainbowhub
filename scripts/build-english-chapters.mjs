// Authored English-only content. Rebuild without changing root manifests or translations.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { activeLocales, slugs as localizedSlugs } from './chapter-locales/config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugs = ['anatomy', 'bible', 'chef', 'catholic', 'mechanic', 'midwifery', 'nursing', 'paramedic', 'iq', 'harvard', 'oxford', 'cambridge', 'personality'];
const levels = ['foundation', 'foundation', 'developing', 'developing', 'skilled', 'skilled', 'advanced', 'advanced', 'advanced', 'final'];
const args = process.argv.slice(2);
for (const slug of args) assert.ok(slugs.includes(slug), `Unsupported English chapter quiz: ${slug}`);

for (const slug of args.length ? args : slugs) {
  const { default: content } = await import(`./english-chapters/${slug}.mjs`);
  const dir = path.join(root, 'data/quizzes', slug);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'quiz.json'), 'utf8'));
  const copy = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
  const originalTitle = copy.title;
  const originalIntro = copy.landing.intro;
  assert.equal(content.rounds.length, 10, slug);
  assert.ok(content.rounds.every(round => round.questions.length === 7), `${slug}: seven questions per round`);
  const weighted = manifest.engine.scoring === 'weighted-profile';
  const categories = manifest.structure.results.dimensions.flatMap(dimension => dimension.categories ?? []);
  manifest.template = 'ten-stage-seven-question-v1';
  manifest.activeLocales = localizedSlugs.includes(slug) ? activeLocales : ['en'];
  manifest.engine.localeParity = 'independent';
  manifest.engine.hardRefreshCheckpoints = false;
  manifest.listing.compactLanding = true;
  manifest.listing.showSocialProof = false;
  manifest.structure.stages = [];
  manifest.structure.questions = {};
  manifest.structure.results.score.showBestRound = false;
  copy.landing.cta = 'Start';
  copy.summary = content.summary;
  copy.about.body = content.about;
  copy.about.howToPlay.steps = weighted ? [
    'Choose the answer that feels most like you. There are no right or wrong answers.',
    'See the country-inspired style leading each topic, then explore another side of yourself.',
    'Reveal your overall country match and optionally explore the preference breakdown.',
  ] : [
    'Read the clues and choose one answer.',
    'See your topic profile at each checkpoint and continue to a new challenge.',
    'Reveal your overall result, then optionally review the answers you missed.',
  ];
  copy.career = { resultProgressLabel: 'Your challenge', stages: {} };
  copy.stages = {};
  delete copy.results.share;
  // Profiles also appear at chapter checkpoints, where only seven answers count.
  // Descriptions must describe the score ratio without assuming a question count.
  const descriptions = [
    'You answered almost every question correctly. Your breakdown shows how that accuracy carried across the topics in this challenge.',
    'You made many accurate connections across this challenge. Explore your breakdown to see which topics were strongest.',
    'You connected many of the clues and facts. Your breakdown highlights the topics you handled best and the ones worth another look.',
    'You found useful clues across several topics. The answer review can help you work through the questions that caught you out.',
    'Some topics were more familiar than others. Your review shows the correct answers and gives you a starting point for another attempt.',
    'This challenge brought a mix of familiar and unfamiliar ideas. Use the answer review to explore the clues you missed.',
  ];
  if (!weighted) Object.values(copy.results.profiles).forEach((profile, i) => { profile.copy = descriptions[i]; });
  if (slug === 'chef') {
    copy.results.dimensions['dimension-2'].label = 'Ingredients and taste';
    copy.results.dimensions['dimension-5'].label = 'Recipe calculations';
  }
  let seed = 93217 + slugs.indexOf(slug) * 47;
  const shuffle = values => {
    const result = [...values];
    for (let i = result.length - 1; i > 0; i--) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const j = Math.floor(seed / 4294967296 * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const positions = shuffle(Array.from({ length: 70 }, (_, i) => i % 4));
  const key = [];
  const prompts = new Set();
  for (const [roundIndex, round] of content.rounds.entries()) {
    const stageId = `stage-${roundIndex + 1}`;
    const final = roundIndex === 9;
    const stage = { id: stageId, difficultyLevel: levels[roundIndex], questionIds: [] };
    manifest.structure.stages.push(stage);
    copy.stages[stageId] = { title: round.title, questions: {} };
    copy.career.stages[stageId] = {
      difficulty: round.title.toUpperCase(), preAdTitle: round.checkpoint,
      preAdCopy: final ? weighted ? 'Your choices have come together. Discover your country-inspired match and the preferences behind it.' : 'Did you reach 80%? Your score and strengths are ready.' : round.feedback,
      preAdButton: final ? 'See My Result' : 'Continue',
      ...(final ? { preAdChecks: weighted ? ['Preferences connected', 'Country-inspired styles compared', 'Your closest match ready'] : ['Answers checked', 'Topic strengths compared', 'Score calculated'] }
        : { next: { eyebrow: 'UP NEXT', tagline: round.teaser } }),
    };
    if (!final) assert.match(round.feedback, /\{profile\}/, `${slug}: chapter feedback must be based on answers`);
    for (const [questionIndex, row] of round.questions.entries()) {
      const [question, correct, ...rest] = row;
      const [wrong1, wrong2, wrong3, source, overrideCategory, rationale] = rest;
      const wrong = [wrong1, wrong2, wrong3];
      const id = `${slug}-s${roundIndex + 1}q${questionIndex + 1}`;
      assert.equal(new Set([correct, ...wrong]).size, 4, `${id}: distinct choices`);
      assert.ok([question, correct, ...wrong].every(value => typeof value === 'string' && value.trim()), id);
      assert.ok(!prompts.has(question), `${id}: repeated prompt`);
      prompts.add(question);
      const category = overrideCategory ?? round.category;
      if (!weighted) assert.ok(categories.includes(category), `${id}: unknown category ${category}`);
      const correctIndex = positions[key.length];
      const answers = shuffle(wrong);
      answers.splice(correctIndex, 0, correct);
      stage.questionIds.push(id);
      const profiles = manifest.structure.results.profiles.map(profile => profile.id);
      manifest.structure.questions[id] = {
        presentation: 'text', answerIds: ['a1', 'a2', 'a3', 'a4'],
        ...(weighted ? {choiceMeanings: Object.fromEntries(answers.map((answer, index) => [`a${index + 1}`, {[profiles[[correct, ...wrong].indexOf(answer)]]: 1}]))}
          : {correctAnswerId: `a${correctIndex + 1}`, category}),
      };
      copy.stages[stageId].questions[id] = {
        question, headerLabel: round.title.toUpperCase(),
        answers: Object.fromEntries(answers.map((answer, index) => [`a${index + 1}`, answer])),
      };
      const sourceUrl = source ? content.sources?.[source] ?? content.sourceUrl?.(source) : undefined;
      assert.ok(!source || sourceUrl, `${id}: unresolved source ${source}`);
      key.push({ id, correct, question, rationale, sourceUrl, choices: manifest.structure.questions[id].choiceMeanings });
    }
  }
  assert.equal(key.length, 70);
  assert.equal(copy.title, originalTitle);
  assert.equal(copy.landing.intro, originalIntro);
  const out = path.join(dir, 'english-extended');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, data] of [['quiz', manifest], ['en', copy]]) fs.writeFileSync(path.join(out, `${name}.json`), JSON.stringify(data, null, 2) + '\n');
  if (weighted) {
    fs.writeFileSync(path.join(out, 'PROFILE_KEY.md'), `# English ${slug} preference map\n\nRebuild with \`node scripts/build-english-chapters.mjs ${slug}\`. Each answer contributes one point to one playful country-inspired style. All four styles have equal opportunities in every question. Display positions are shuffled. A tied score uses the existing stable profile order. These are entertainment archetypes, not claims about people or national identity.\n\n| Question | Answer ID → style |\n| --- | --- |\n` + key.map(item => `| \`${item.id}\` | ${Object.entries(item.choices).map(([id, weights]) => `${id} → ${Object.keys(weights)[0]}`).join('; ')} |`).join('\n') + '\n');
  } else fs.writeFileSync(path.join(out, 'ANSWER_KEY.md'), `# English ${slug} answer key\n\nRebuild with \`node scripts/build-english-chapters.mjs ${slug}\`. Headlines and landing subtitles are copied verbatim from the original English version. Each topic contains seven questions; answer positions are deterministically shuffled and balanced across the quiz.\n\nQuestions use plain English for UK, AU, CA and US readers. Quantities and times state their units; supplied examples are not universal clinical, workshop or food-service requirements. ${content.note ?? ''}\n\nThe links below are topic references for the factual principles; unlinked entries are authored general knowledge or reasoning from the facts in the question. ${content.references ?? ''}\n\n| Question | Correct answer | Reference or reasoning |\n| --- | --- | --- |\n` + key.map(item => `| \`${item.id}\` | ${item.correct.replaceAll('|', '/')} | ${item.rationale ?? (item.sourceUrl ? `[Reference](${item.sourceUrl})` : 'Authored question; use the facts and quantities stated.')} |`).join('\n') + '\n');
  console.log(`${slug}: 10 × 7, original title and subtitle preserved`);
}
