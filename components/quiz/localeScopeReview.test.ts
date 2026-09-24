import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const families = ['teacher', 'doctor', 'surgeon', 'socialworker', 'medical'];
const staleScope = /Tier\s*1|niveau\s*1|nivå\s*1|nivel\s*1|nível\s*1|Tingkat\s*1|Cấp\s*1|ниво\s*1|рівня\s*1|Βαθμίδας\s*1|ระดับ\s*1|英語圏|engelsktalende|englischsprachigen|anglophones|anglojęzycznych|англоговорящ|países de habla inglesa|países de língua inglesa/iu;

test('professional quiz descriptions do not revive the old English-speaking-country scope', () => {
  for (const family of families) {
    const directory = `data/quizzes/${family}`;
    const localeFiles = fs.readdirSync(directory).filter((file) => file.endsWith('.json') && file !== 'quiz.json');
    assert.equal(localeFiles.length, 30, family);
    for (const file of localeFiles) {
      const body: string = JSON.parse(fs.readFileSync(`${directory}/${file}`, 'utf8')).about.body;
      assert.equal(body.split('\n\n').length, 2, `${family}/${file}: two-paragraph description`);
      assert.doesNotMatch(body, staleScope, `${family}/${file}: stale country-scope claim`);
    }
  }
});
