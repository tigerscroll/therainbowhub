import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const locales = read('paramedic', 'quiz').activeLocales as string[];
const item = (slug: string, locale: string, id: string) => read(slug, locale).stages['stage-1'].questions[id];

test('Paramedic and Surgeon each retain ten complete questions in every required locale', () => {
  for (const slug of ['paramedic', 'surgeon']) {
    const manifest = read(slug, 'quiz');
    const ids = manifest.structure.stages.flatMap((stage: { questionIds: string[] }) => stage.questionIds);
    assert.equal(ids.length, 10, slug);
    assert.equal(new Set(ids).size, 10, slug);
    assert.deepEqual([...manifest.activeLocales].sort(), [...locales].sort(), slug);
    for (const locale of locales) {
      const questions = read(slug, locale).stages['stage-1'].questions;
      assert.deepEqual(Object.keys(questions).sort(), [...ids].sort(), `${slug}/${locale}`);
      for (const id of ids) {
        const key = manifest.structure.questions[id].correctAnswerId;
        assert.ok(questions[id].question.trim(), `${slug}/${locale}/${id}: empty question`);
        assert.equal(Object.keys(questions[id].answers).length, 4, `${slug}/${locale}/${id}`);
        assert.equal(new Set(Object.values(questions[id].answers)).size, 4, `${slug}/${locale}/${id}`);
        assert.ok(questions[id].answers[key]?.trim(), `${slug}/${locale}/${id}: missing keyed answer`);
      }
    }
  }
});

test('Paramedic heart and lung pictograms agree with the keyed English answers', () => {
  const question = read('paramedic', 'quiz').structure.questions['paramedic-r1q1'];
  assert.equal(question.correctAnswerId, 'a1');
  assert.equal(item('paramedic', 'en', 'paramedic-r1q1').answers.a1, 'Heart');
  assert.equal(item('paramedic', 'en', 'paramedic-r1q1').answers.a2, 'Lungs');
  assert.equal(question.icons.a1, '🫀');
  assert.equal(question.icons.a2, '🫁');
});

test('Safety-critical Paramedic and Surgeon answer positions remain fixed', () => {
  const expected = {
    paramedic: { 'paramedic-r1q4': 'a2', 'paramedic-r5q6': 'a1', 'paramedic-r10q4': 'a1', 'paramedic-r10q2': 'a4' },
    surgeon: { 'surgeon-q3': 'a3', 'surgeon-q7': 'a3', 'surgeon-q9': 'a1', 'surgeon-q10': 'a2' },
  } as const;
  for (const [slug, questions] of Object.entries(expected)) {
    const manifest = read(slug, 'quiz');
    for (const [id, key] of Object.entries(questions)) {
      assert.equal(manifest.structure.questions[id].correctAnswerId, key, `${slug}/${id}`);
      for (const locale of locales) assert.ok(item(slug, locale, id).answers[key].trim(), `${slug}/${locale}/${id}`);
    }
  }
});

test('reviewed translations do not turn Paramedic handover into a doorway or clamminess into noise or weakness', () => {
  const reviewed: Record<string, [RegExp, RegExp]> = {
    ar: [/عبارة افتتاحية/, /عرق بارد/],
    cs: [/úvodní věta/, /studeně potí/],
    de: [/Einstieg/, /kaltschweißig/],
    el: [/εισαγωγική φράση/, /κρύο ιδρώτα/],
    fi: [/aloitus/, /hikoilla kylmästi/],
    he: [/משפט פתיחה/, /זיעה קרה/],
    ja: [/最初の一言/, /冷や汗/],
    ms: [/Ayat pembuka/, /berpeluh sejuk/],
    ro: [/formulare de început/, /transpirații reci/],
    th: [/ประโยคเริ่มต้น/, /เหงื่อออกเย็น/],
    vi: [/Câu mở đầu/, /mồ hôi lạnh/],
  };
  for (const [locale, [handover, coldSweat]] of Object.entries(reviewed)) {
    assert.match(item('paramedic', locale, 'paramedic-r1q5').question, handover, locale);
    assert.match(item('paramedic', locale, 'paramedic-r5q6').context, coldSweat, locale);
  }
});

test('reviewed translations preserve surgical time-out and wound-discharge meanings', () => {
  const reviewed: Record<string, [RegExp, RegExp]> = {
    fi: [/turvapysähdyksen/, /haavaerite/],
    fil: [/safety check/, /likido sa sugat/],
    he: [/בדיקת הבטיחות/, /הפרשה מהפצע/],
    ja: [/手術安全確認/, /傷口からの排液/],
    ms: [/semakan keselamatan/, /lelehan dari luka/],
    th: [/หยุดตรวจความปลอดภัย/, /ของเหลวไหลจากแผล/],
    vi: [/kiểm tra an toàn/, /dịch chảy từ vết mổ/],
  };
  for (const [locale, [timeOut, woundDischarge]] of Object.entries(reviewed)) {
    assert.match(item('surgeon', locale, 'surgeon-q3').question, timeOut, locale);
    assert.match(item('surgeon', locale, 'surgeon-q7').answers.a3, woundDischarge, locale);
  }
});

test('Paramedic final trend identifies the numbers as breathing rates in every locale', () => {
  for (const locale of locales) {
    const final = item('paramedic', locale, 'paramedic-r10q2');
    assert.notEqual(final.question, 'What is the best interpretation of the complete trend?', locale);
    assert.deepEqual(final.visual.items.slice(0, 3).map((value: string) => value.match(/^\d+/)?.[0]), ['16', '22', '28'], locale);
    assert.match(final.visual.ariaLabel, /16.*22.*28/, locale);
  }
  assert.match(item('paramedic', 'en', 'paramedic-r10q2').question, /breaths per minute/);
  assert.match(item('paramedic', 'fi', 'paramedic-r10q2').visual.items[1], /Ahdistunut/);
  assert.match(item('paramedic', 'fil', 'paramedic-r10q2').visual.items[1], /Balisa/);
  assert.match(item('paramedic', 'sr', 'paramedic-r10q2').visual.items[2], /Поспан/);
  assert.match(item('paramedic', 'sv', 'paramedic-r10q2').visual.items[2], /Dåsig/);
  const portuguese = item('paramedic', 'pt', 'paramedic-r10q2');
  assert.match(portuguese.visual.items[0], /ALERTA E RESPONSIVA/);
  assert.match(portuguese.visual.items[1], /ANSIOSA/);
  assert.match(portuguese.visual.items[2], /SONOLENTA/);
  assert.match(portuguese.answers.a4, /está a piorar.*está a diminuir/);
});

test('Portugal paramedic safety and handover prompts keep their intended meaning', () => {
  const handover = item('paramedic', 'pt', 'paramedic-r1q5');
  assert.match(handover.question, /passagem de informação/);
  assert.equal(handover.answers.a3, 'Às 14h20, a respiração acelerou e o estado de alerta diminuiu');
  const cable = item('paramedic', 'pt', 'paramedic-r1q4');
  assert.match(cable.question, /cabo elétrico sob tensão/);
  assert.match(cable.answers.a2, /Mantenha todos afastados/);
  const incident = item('paramedic', 'pt', 'paramedic-r10q4');
  assert.match(incident.context, /REGISTO DO INCIDENTE.*atira objetos/);
  assert.match(incident.answers.a1, /saída mais segura/);
  assert.equal(item('paramedic', 'pt', 'paramedic-r3q3').answers.a3, '1 000 mL');
});
