import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Italian quiz results describe answer review without machine-literal review copy', () => {
  for (const entry of fs.readdirSync('data/quizzes', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = `data/quizzes/${entry.name}/it.json`;
    if (!fs.existsSync(path)) continue;
    const locale = JSON.parse(fs.readFileSync(path, 'utf8'));
    const copy = JSON.stringify(locale.results?.profiles ?? {});
    assert.doesNotMatch(copy, /recensione|collegamenti rivisitare|Questa sfida ha introdotto alcune idee non familiari|Service Bay|workshop/iu, path);
  }
});
