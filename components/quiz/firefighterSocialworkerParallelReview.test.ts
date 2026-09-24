import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(
  fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'),
);

test('Firefighter and Social Worker each have ten complete questions in all active locales', () => {
  for (const slug of ['firefighter', 'socialworker']) {
    const config = read(slug, 'quiz');
    const ids = config.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(config.activeLocales.length, 30, slug);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    for (const locale of config.activeLocales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions), ids, `${slug}/${locale}`);
      for (const id of ids) {
        const item = questions[id];
        assert.ok(item.question.trim(), `${slug}/${locale}/${id}`);
        assert.deepEqual(Object.keys(item.answers), ['a1', 'a2', 'a3', 'a4'], `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(item.answers)).size, 4, `${slug}/${locale}/${id}`);
        assert.ok(item.answers[config.structure.questions[id].correctAnswerId].trim(), `${slug}/${locale}/${id}`);
        if (item.visual) {
          assert.ok(item.visual.items.length, `${slug}/${locale}/${id} visual items`);
          assert.ok(item.visual.ariaLabel.trim(), `${slug}/${locale}/${id} visual aria`);
        }
      }
    }
  }
});

test('Firefighter gear direction and lamp arithmetic remain visible in every locale', () => {
  const config = read('firefighter', 'quiz');
  assert.equal(config.structure.questions['firefighter-s5q5'].correctAnswerId, 'a1');
  assert.equal(config.structure.questions['firefighter-s5q6'].correctAnswerId, 'a4');
  for (const locale of config.activeLocales) {
    const questions = read('firefighter', locale).stages['stage-1'].questions;
    const gears = questions['firefighter-s5q5'].visual;
    assert.equal(gears.items.length, 3, locale);
    assert.match(gears.items[0], /↻/, locale);
    assert.match(gears.items[1], /\?|？|؟/, locale);
    assert.match(gears.items[2], /\?|？|؟/, locale);
    assert.ok(gears.ariaLabel.trim(), locale);
    const lamps = questions['firefighter-s5q6'];
    assert.deepEqual(lamps.visual.items.map((item: string) => Number(item.split('::')[1].match(/\d+/)?.[0])), [4, 3, 2, 2], locale);
    assert.equal(lamps.answers.a4, '12', locale);
    assert.ok(lamps.visual.ariaLabel.trim(), locale);
  }
});

test('Firefighter corrected collapse and evacuation answers preserve the safe actions', () => {
  const config = read('firefighter', 'quiz');
  assert.equal(config.structure.questions['firefighter-s4q7'].correctAnswerId, 'a3');
  assert.equal(config.structure.questions['firefighter-s5q8'].correctAnswerId, 'a2');
  const collapse: Record<string, RegExp> = {
    ar: /ينهار السقف/, cs: /zřítit/, da: /styrte sammen/, el: /καταρρεύσει/,
    fi: /romahtaa/, fil: /gumuho/, hr: /urušiti/, hu: /beomolhat/,
    id: /runtuh/, ms: /runtuh/, nb: /rase sammen/, pl: /zawalić/,
    ro: /prăbuși/, sk: /zrútiť/, sv: /rasa/, th: /ถล่ม/,
    uk: /обвалитися/, vi: /sập/,
  };
  for (const [locale, pattern] of Object.entries(collapse)) {
    const answer = read('firefighter', locale).stages['stage-1'].questions['firefighter-s4q7'].answers.a3;
    assert.match(answer, pattern, locale);
  }
  for (const locale of config.activeLocales) {
    const answer = read('firefighter', locale).stages['stage-1'].questions['firefighter-s5q8'].answers.a2;
    assert.ok(answer.trim(), locale);
    if (locale !== 'en') assert.doesNotMatch(answer, /Direct people|west smoke|West Smoke/, locale);
  }
});

test('Firefighter electrical-hazard answer keeps people away and summons qualified help', () => {
  const config = read('firefighter', 'quiz');
  assert.equal(config.structure.questions['firefighter-s1q2'].correctAnswerId, 'a4');
  const reviewed: Record<string, RegExp> = {
    ar: /أبعد الناس.*فرق الاستجابة/, cs: /mimo nebezpečnou oblast.*odborníky/,
    da: /væk fra faren.*fagfolk/, el: /μακριά από τον κίνδυνο.*ειδοποιήστε/,
    fi: /poissa vaara-alueelta.*ammattilaiset/, fil: /Ilayo.*panganib.*kwalipikadong/,
    hu: /távol.*veszélytől.*szakembereket/, id: /Jauhkan.*bahaya.*petugas/,
    ms: /Jauhkan.*bahaya.*pasukan/, nb: /unna faren.*personell/,
    ro: /departe de pericol.*personalul/, sk: /mimo nebezpečnej oblasti.*odborníkov/,
    sr: /подаље од опасности.*службе/, sv: /borta från faran.*personal/,
    th: /ออกห่างจากอันตราย.*ผู้เชี่ยวชาญ/, vi: /tránh xa nguy hiểm.*chuyên môn/,
  };
  for (const [locale, pattern] of Object.entries(reviewed)) {
    const answer = read('firefighter', locale).stages['stage-1'].questions['firefighter-s1q2'].answers.a4;
    assert.match(answer, pattern, locale);
  }
});

test('Social Worker safeguarding risk is to the person, not from the person', () => {
  const config = read('socialworker', 'quiz');
  assert.equal(config.structure.questions['socialworker-q7'].correctAnswerId, 'a3');
  assert.equal(config.structure.questions['socialworker-q10'].correctAnswerId, 'a2');
  const reviewed: Record<string, RegExp> = {
    cs: /může hrozit nebezpečí/, de: /gefährdet sein könnte/,
    el: /βρίσκεται σε κίνδυνο/, pl: /może grozić niebezpieczeństwo/,
    pt: /possa estar em perigo/, ro: /ar putea fi în pericol/,
    sk: /môže hroziť nebezpečenstvo/, sv: /kan vara i fara/,
  };
  for (const [locale, pattern] of Object.entries(reviewed)) {
    const item = read('socialworker', locale).stages['stage-1'].questions['socialworker-q7'];
    assert.match(item.question, pattern, locale);
    assert.ok(item.answers.a3.trim(), locale);
  }
});

test('Firefighter changing-smoke report does not turn smoke into light or tobacco', () => {
  const reviewed: Record<string, [RegExp, RegExp]> = {
    ar: [/دخان خفيف وثابت/, /كان خفيفًا وثابتًا.*يزداد/],
    fi: [/vähäistä|Kevyt/, /aiemmin vähäistä.*lisääntyy/],
    fil: [/hilagang pintuan/i, /hilagang pintuan.*mabilis/],
    hu: [/Kevés, egyenletes füst/, /korábban kevés.*sűrűsödik/],
    ms: [/Asap nipis/, /awalnya nipis.*semakin tebal/],
    sk: [/Slabý, stály dym/, /slabý.*hustne/],
    th: [/ควันเบาและคงที่/, /เดิมมีเพียงเล็กน้อย.*เพิ่มขึ้น/],
  };
  for (const [locale, [visualPattern, answerPattern]] of Object.entries(reviewed)) {
    const item = read('firefighter', locale).stages['stage-1'].questions['firefighter-s2q2'];
    assert.match(item.visual.items.join(' '), visualPattern, locale);
    assert.match(item.answers.a1, answerPattern, locale);
    assert.doesNotMatch(item.answers.a2 + item.answers.a3, /Tupusta|tupakka|north doorway/, locale);
  }
});

test('Firefighter routine count is a due task, not a debt, in visual and aria text', () => {
  const config = read('firefighter', 'quiz');
  const wrong = /Край сега|Perlu dibayar|Splatné práve teraz|Datorită acum|今すぐ期限|Şimdilik|Forfalder nu|Forfaller nå|Förfallo nu|Jatuh tempo sekarang|Офειλόμενο τώρα/;
  for (const locale of config.activeLocales) {
    const visual = read('firefighter', locale).stages['stage-1'].questions['firefighter-s5q8'].visual;
    assert.equal(visual.items.length, 4, locale);
    assert.doesNotMatch(visual.items[3] + visual.ariaLabel, wrong, locale);
  }
  assert.match(read('firefighter', 'ms').stages['stage-1'].questions['firefighter-s5q8'].visual.items[3], /Perlu dibuat sekarang/);
  assert.match(read('firefighter', 'sk').stages['stage-1'].questions['firefighter-s5q8'].visual.items[3], /Treba ju vykonať teraz/);
  assert.match(read('firefighter', 'bg').stages['stage-1'].questions['firefighter-s5q8'].visual.items[3], /Трябва да се направи сега/);
});

test('Social Worker autonomy scenario is optional support, not volunteer work', () => {
  const config = read('socialworker', 'quiz');
  const obsolete = /Freiwilligendienst|vapaaehtoistyöstä|volontiranje|önkéntes szolgálat|vrijwilligerswerk|wolontariatu|dobrovoľnícku službu|volontärtjänst|gönüllü hizmeti|自発的な奉仕/;
  const reviewed: Record<string, RegExp> = {
    de: /entscheidungsfähiger Erwachsener.*Unterstützungsangebot/,
    fi: /Päätöskykyinen aikuinen.*tukipalvelusta/,
    hr: /sposobna samostalno odlučivati.*uslugu podrške/,
    hu: /döntésképes felnőtt.*támogató szolgáltatást/,
    ja: /意思決定能力.*任意の支援サービス/,
    nl: /zelfstandig kan beslissen.*ondersteuningsaanbod/,
    pl: /samodzielnego podejmowania decyzji.*usługi wsparcia/,
    sk: /schopný samostatne rozhodovať.*podporu/,
    sv: /fatta egna beslut.*stödinsats/,
    tr: /Karar verme yetisi.*destek hizmetini/,
  };
  for (const locale of config.activeLocales) {
    const item = read('socialworker', locale).stages['stage-1'].questions['socialworker-q10'];
    assert.doesNotMatch(item.question, obsolete, locale);
    if (reviewed[locale]) assert.match(item.question, reviewed[locale], locale);
    assert.ok(item.answers.a2.trim(), locale);
  }
  assert.match(read('socialworker', 'th').stages['stage-1'].questions['socialworker-q9'].answers.a1, /ให้เจ้าตัวมีส่วนร่วม/);
  assert.match(read('socialworker', 'uk').stages['stage-1'].questions['socialworker-q3'].answers.a3, / передання інформації/);
});
