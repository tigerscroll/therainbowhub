import assert from 'node:assert/strict';
import test from 'node:test';
import type { QuizQuestion } from '../../lib/quizzes.ts';
import { getChapterAnswers } from './engagement.ts';

test('chapter previews exclude earlier, later and unanswered choices but retain answer zero', () => {
  const questions = [
    { id: 'earlier', stage: 0 }, { id: 'first', stage: 1 },
    { id: 'second', stage: 1 }, { id: 'unanswered', stage: 1 }, { id: 'later', stage: 2 },
  ] as QuizQuestion[];
  assert.deepEqual(getChapterAnswers(questions, { earlier: 3, first: 0, second: 2, later: 1 }, 1), { first: 0, second: 2 });
});
