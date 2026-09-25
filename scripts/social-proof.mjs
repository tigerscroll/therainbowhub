import fs from 'node:fs';
import path from 'node:path';
import {getQuizSlugs} from './quiz-catalogue.mjs';

// Counts belong to their quiz manifest. Adding a quiz never edits this module.
const root = path.join(process.cwd(), 'data/quizzes');
export const SOCIAL_PROOF_COUNTS = Object.freeze(Object.fromEntries(getQuizSlugs(root).map(slug => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, slug, 'quiz.json'), 'utf8'));
  return [slug, manifest.listing?.socialProofCount];
})));
