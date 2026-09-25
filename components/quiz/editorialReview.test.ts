import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {applyEditorialReview} from '../../scripts/chapter-locales/editorial-review.mjs';

const read = (slug: string, locale: string) => JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));
const question = (slug: string, locale: string, id: string) => {
  const copy = read(slug, locale);
  const stage = Object.values(copy.stages).find((stage: any) => stage.questions[id]) as any;
  return stage.questions[id];
};
const correct = (slug: string, locale: string, id: string) => question(slug, locale, id).answers[read(slug, 'quiz').structure.questions[id].correctAnswerId];

test('Cambridge retains the group identifier and distinguishes accuracy from repeatable readings', () => {
  for (const locale of ['en', 'fr', 'de', 'it', 'nl', 'es', 'pt', 'ar']) {
    assert.match(correct('cambridge', locale, 'cambridge-s4q4'), /^A\s*:\s*80/);
  }
  const id = 'cambridge-s7q6';
  const accuracyKey = Object.entries(question('cambridge', 'en', id).answers).find(([, text]) => text === 'Perfect accuracy')![0];
  assert.notEqual(accuracyKey, read('cambridge', 'quiz').structure.questions[id].correctAnswerId);
  for (const [locale, accuracy, precision] of [
    ['fr', /Exactitude/, /Précision/], ['it', /Accuratezza/, /Precisione/],
    ['es', /Exactitud/, /Precisión/], ['pt', /Exatidão/, /Precisão/],
  ] as const) {
    const distractor = question('cambridge', locale, id).answers[accuracyKey];
    assert.match(distractor, accuracy);
    assert.doesNotMatch(distractor, precision);
  }
});

test('Chef keeps garlic parts and salad dressing in their culinary senses', () => {
  const garlic = question('chef', 'en', 'chef-s2q4');
  const bulb = Object.entries(garlic.answers).find(([, text]) => text === 'Separating the bulb only')![0];
  const cloves = Object.entries(garlic.answers).find(([, text]) => text === 'Leaving the cloves whole')![0];
  for (const [locale, bulbWord, cloveWord, sauceWord] of [
    ['fr', /tête d’ail/, /gousses/, /sauce/],
    ['de', /Knolle/, /Knoblauchzehen/, /Dressing/],
    ['it', /bulbo/, /spicchi/, /condimento/],
    ['nl', /bol/, /knoflooktenen/, /dressing/],
    ['es', /cabeza/, /dientes/, /aliño/],
    ['pt', /cabeça de alho/, /dentes de alho/, /molho/],
    ['ar', /رأس الثوم/, /فصوص الثوم/, /صلصة السلطة/],
  ] as const) {
    assert.match(question('chef', locale, 'chef-s2q4').answers[bulb], bulbWord);
    assert.match(question('chef', locale, 'chef-s2q4').answers[cloves], cloveWord);
    assert.match(correct('chef', locale, 'chef-s2q5'), sauceWord);
  }
});

test('Dentist names tooth enamel, root tips and dental sockets rather than unrelated homonyms', () => {
  assert.equal(correct('dentist', 'fr', 'dentist-s1q2'), 'Canines');
  assert.equal(correct('dentist', 'de', 'dentist-s2q1'), 'Zahnschmelz');
  assert.equal(correct('dentist', 'nl', 'dentist-s2q1'), 'Tandglazuur');
  for (const [locale, root, socket] of [
    ['fr', /racine/, /alvéoles/], ['de', /Wurzel/, /Zahnfächer/],
    ['it', /radice/, /alveoli/], ['nl', /wortel/, /tandkassen/],
    ['es', /raíz/, /alvéolos/],
  ] as const) {
    assert.match(correct('dentist', locale, 'dentist-s5q7'), root);
    assert.match(correct('dentist', locale, 'dentist-s2q7'), socket);
  }
});

test('shared clinical questions retain respiratory frequency and the direction of communication', () => {
  for (const [slug, stage] of [['dentist', 9], ['doctor', 9], ['medical', 8], ['midwifery', 9], ['nursing', 5], ['paramedic', 4], ['surgeon', 8]] as const) {
    const id = `${slug}-s${stage}q4`;
    for (const locale of ['fr', 'de', 'it', 'nl', 'es']) {
      assert.doesNotMatch(question(slug, locale, id).question, /tarif|tariffa/i);
      assert.match(correct(slug, locale, id), /^18 /);
    }
  }
  for (const [slug, stage] of [['dentist', 8], ['doctor', 8], ['midwifery', 8], ['nursing', 4], ['paramedic', 5], ['surgeon', 7]] as const) {
    const id = `${slug}-s${stage}q7`;
    const away = Object.entries(question(slug, 'en', id).answers).find(([, text]) => text === 'Speak while facing away')![0];
    assert.match(question(slug, 'fr', id).answers[away], /à l’opposé/);
    assert.match(correct(slug, 'fr', id), /face à la personne/);
  }
});

test('clinical anatomy allows atria and clinical uncertainty still requires assessment', () => {
  for (const slug of ['doctor', 'medical', 'nursing', 'paramedic', 'surgeon']) {
    const id = `${slug}-s1q7`;
    assert.doesNotMatch(question(slug, 'de', id).question, /Herzkammer/);
    assert.doesNotMatch(question(slug, 'nl', id).question, /hartkamer/);
    assert.match(correct(slug, 'de', id), /Vorhof/);
    assert.match(correct(slug, 'nl', id), /boezem/);
  }
  for (const slug of ['doctor', 'medical']) {
    const id = `${slug}-s10q7`;
    assert.match(correct(slug, 'de', id), /muss abgeklärt werden/);
    assert.match(correct(slug, 'nl', id), /moet worden beoordeeld/);
    assert.doesNotMatch(correct(slug, 'de', id), /Bedarfsermittlung/);
    assert.doesNotMatch(correct(slug, 'nl', id), /behoeftenanalyse/);
    assert.match(question(slug, 'ar', `${slug}-s10q5`).question, /سجله الطبي/);
    assert.doesNotMatch(question(slug, 'ar', `${slug}-s10q5`).question, /الرسم البياني/);
  }
});

test('nursing separates moving a patient and rating pain from moving house and music scores', () => {
  const pain = question('nursing', 'en', 'nursing-s7q1');
  const scoreKey = Object.entries(pain.answers).find(([, text]) => text === 'Choose a score without asking')![0];
  for (const [locale, painWord, movingHouse] of [
    ['fr', /score de douleur/, /déménager/],
    ['de', /Schmerzwert/, /Umzug/],
    ['nl', /pijnscore/, /verhuizen/],
  ] as const) {
    assert.match(question('nursing', locale, 'nursing-s7q1').answers[scoreKey], painWord);
    assert.doesNotMatch(correct('nursing', locale, 'nursing-s7q2'), movingHouse);
  }
  assert.doesNotMatch(JSON.stringify(question('nursing', 'es', 'nursing-s10q7')), /cheque/);
  assert.doesNotMatch(JSON.stringify(question('nursing', 'it', 'nursing-s10q7')), /assegno/);
});

test('aviation answer keys name the attitude instrument rather than settings, posture or behaviour', () => {
  for (const slug of ['airforce', 'pilot']) {
    assert.equal(correct(slug, 'de', `${slug}-s3q1`), 'Künstlicher Horizont');
    assert.equal(correct(slug, 'it', `${slug}-s3q1`), 'Orizzonte artificiale');
    assert.equal(correct(slug, 'nl', `${slug}-s3q1`), 'Kunstmatige horizon');
    assert.match(question(slug, 'nl', `${slug}-s1q3`).question, /liftkracht en het gewicht/);
  }
});

test('the same short source answer retains the quantity asked about in each question', () => {
  const source = read('airforce', 'en');
  const cases = [
    ['nl', 'Verhoogt de grondsnelheid', 'Verhoogt de dynamische druk'],
    ['pt', 'Aumenta essa velocidade', 'Aumenta essa pressão'],
    ['ar', 'تزيدها', 'تزيد الضغط الديناميكي'],
  ];
  for (const [locale, speedAnswer, pressureAnswer] of cases) {
    const copy = read('airforce', locale);
    // Simulate an authoring pass with the ambiguous English short answer.
    for (const [stage, id] of [['stage-5', 'airforce-s5q3'], ['stage-6', 'airforce-s6q6']]) {
      const key = read('airforce', 'quiz').structure.questions[id].correctAnswerId;
      copy.stages[stage].questions[id].answers[key] = 'Increases it';
    }
    applyEditorialReview('airforce', locale, copy, source);
    for (const [stage, id, expected] of [['stage-5', 'airforce-s5q3', speedAnswer], ['stage-6', 'airforce-s6q6', pressureAnswer]]) {
      const key = read('airforce', 'quiz').structure.questions[id].correctAnswerId;
      assert.equal(copy.stages[stage].questions[id].answers[key], expected);
      assert.equal(correct('airforce', locale, id), expected);
    }
  }
});

test('flight legs remain route segments and shared readback questions describe repeating instructions aloud', () => {
  for (const slug of ['airforce', 'pilot']) {
    const id = `${slug}-s${slug === 'airforce' ? 8 : 7}q4`;
    for (const [locale, bodyPart, route] of [
      ['fr', /jambe/, /étape du vol/],
      ['de', /Bein/, /Flugabschnitt/],
      ['it', /gamba/, /tratta di volo/],
      ['es', /pierna/, /tramo del vuelo/],
      ['nl', /been/, /deel van de vlucht/],
      ['ar', /الساق/, /مرحلة من الرحلة/],
    ] as const) {
      assert.doesNotMatch(question(slug, locale, id).question, bodyPart);
      assert.match(question(slug, locale, id).question, route);
    }
  }
  for (const [slug, stage] of [['airforce', 9], ['pilot', 8], ['flightattendant', 4], ['firefighter', 8], ['train', 6]]) {
    const id = `${slug}-s${stage}q2`;
    assert.match(question(String(slug), 'ar', id).question, /بصوت مسموع/);
    assert.doesNotMatch(question(String(slug), 'ar', id).question, /النقدية/);
    assert.match(question(String(slug), 'pt', id).question, /em voz alta/);
  }
});

test('Italian destination distractors retain the source absolute, avoiding a second valid answer', () => {
  for (const slug of ['airforce', 'pilot', 'flightattendant']) {
    const id = `${slug}-s10q7`, source = question(slug, 'en', id);
    const key = Object.keys(source.answers).find(key => source.answers[key] === 'A planned destination is always unavailable')!;
    assert.equal(question(slug, 'it', id).answers[key], 'Una destinazione pianificata non è mai disponibile');
    assert.notEqual(key, read(slug, 'quiz').structure.questions[id].correctAnswerId);
  }
});

test('scale calculations keep metres as units rather than interpreting m as millions', () => {
  for (const [slug, stage] of [['barrister', 8], ['firefighter', 7], ['flightattendant', 8], ['motorbike', 9], ['police', 8], ['socialworker', 8], ['teacher', 8], ['train', 9]]) {
    const id = `${slug}-s${stage}q5`;
    assert.equal(correct(String(slug), 'it', id), '12 m');
    assert.doesNotMatch(JSON.stringify(question(String(slug), 'it', id)), /milioni/);
  }
});

test('cabin translations retain illness and distinguish facing towards and away from a passenger', () => {
  assert.match(question('flightattendant', 'ar', 'flightattendant-s5q4').question, /بتوعك مفاجئ/);
  assert.doesNotMatch(question('flightattendant', 'ar', 'flightattendant-s5q4').question, /على ما يرام/);
  const id = 'flightattendant-s6q2', source = question('flightattendant', 'en', id);
  const away = Object.keys(source.answers).find(key => source.answers[key] === 'Speak while facing away')!;
  assert.match(question('flightattendant', 'fr', id).answers[away], /à l’opposé/);
  assert.match(correct('flightattendant', 'fr', id), /face à la personne/);
  const belt = question('flightattendant', 'pt', 'flightattendant-s1q4');
  assert.ok(Object.values(belt.answers).includes('Garante que não há atrasos'));
  assert.doesNotMatch(JSON.stringify(belt.answers), /Não garante atrasos/);
});

test('anatomy eye answers name body structures rather than students or camera equipment', () => {
  for (const [locale, pupil, lens] of [
    ['fr', 'Pupille', 'Cristallin'], ['de', 'Pupille', 'Linse'],
    ['it', 'Pupilla', 'Cristallino'], ['nl', 'Pupil', 'Lens'],
    ['es', 'Pupila', 'Cristalino'],
  ]) {
    assert.equal(correct('anatomy', locale, 'anatomy-s8q3'), pupil);
    assert.equal(correct('anatomy', locale, 'anatomy-s8q5'), lens);
  }
});

test('anatomy distinguishes the whole brain from its largest region', () => {
  for (const [locale, whole, part] of [
    ['fr', 'Encéphale', 'Cerveau'], ['it', 'Encefalo', 'Cervello'],
    ['es', 'Encéfalo', 'Cerebro'], ['nl', 'Hersenen', 'Grote hersenen'],
  ]) {
    assert.equal(correct('anatomy', locale, 'anatomy-s1q4'), whole);
    assert.equal(correct('anatomy', locale, 'anatomy-s7q7'), part);
  }
});

test('shared professional reasoning keeps prohibitions and reassessment distinct from probability and reviews', () => {
  for (const [slug, stage] of [['barrister', 7], ['police', 7], ['socialworker', 9], ['teacher', 9]]) {
    assert.equal(correct(String(slug), 'ar', `${slug}-s${stage}q1`), 'لا يُسمح لسام بالدخول');
    const review = correct(String(slug), 'de', `${slug}-s10q2`);
    assert.match(review, /erneute Prüfung/);
    assert.doesNotMatch(review, /Rezension/);
  }
});

test('social care referral continuity requires clear information rather than its deletion', () => {
  const answer = correct('socialworker', 'ar', 'socialworker-s2q6');
  assert.match(answer, /معلومات واضحة/);
  assert.doesNotMatch(answer, /مسح المعلومات/);
});

test('safeguarding disclosures keep the speaker account separate from professional interpretation', () => {
  for (const [slug, stage] of [['socialworker', 4], ['teacher', 6]]) {
    const id = `${slug}-s${stage}q4`;
    assert.match(correct(String(slug), 'ar', id), /كلام الشخص، والملاحظات المسجّلة، والتفسير المهني/);
    assert.match(correct(String(slug), 'pt', id), /As palavras da pessoa, as observações e a interpretação profissional/);
    const leading = question(String(slug), 'de', `${slug}-s${stage}q6`);
    assert.match(leading.question, /Suggestivfragen/);
    assert.doesNotMatch(leading.question, /Leitfragen/);
  }
});

test('teaching questions use educational rubric and distributed practice terminology', () => {
  assert.match(question('teacher', 'de', 'teacher-s1q6').question, /verteiltes Üben/);
  assert.doesNotMatch(question('teacher', 'de', 'teacher-s1q6').question, /räumlich/);
  for (const [locale, term] of [
    ['fr', /grille d’évaluation/], ['de', /Bewertungsraster/],
    ['nl', /rubric bij het beoordelen/], ['ar', /سلّم التقدير/],
  ] as const) assert.match(question('teacher', locale, 'teacher-s2q2').question, term);
});

test('religious profession remains a voluntary lifelong commitment rather than a job or a free service', () => {
  for (const [locale, voluntary] of [
    ['de', /freiwillige Verpflichtung/], ['es', /asumido libremente/],
    ['it', /assunto liberamente/], ['nl', /vrijwillig aangegane verbintenis/],
    ['pt', /assumido livremente/], ['ar', /التزام طوعي/],
  ] as const) {
    assert.match(correct('nun', locale, 'nun-s2q7'), voluntary);
  }
  assert.match(question('nun', 'de', 'nun-s1q6').question, /zeitliche Profess/);
  assert.match(correct('nun', 'de', 'nun-s1q7'), /Ordensprofess auf Lebenszeit/);
  assert.match(question('nun', 'ar', 'nun-s1q6').question, /النذور المؤقتة/);
  assert.doesNotMatch(question('nun', 'ar', 'nun-s1q6').question, /المهنة/);
});

test('liturgical words keep their religious sense in Catholic and shared convent questions', () => {
  const sources = read('catholic', 'en');
  for (const stage of Object.values(sources.stages) as any[]) for (const [id, q] of Object.entries(stage.questions) as [string, any][]) {
    for (const [answerId, answer] of Object.entries(q.answers)) {
      if (answer === 'The font') {
        assert.equal(question('catholic', 'de', id).answers[answerId], 'Das Taufbecken');
        assert.equal(question('catholic', 'ar', id).answers[answerId], 'جرن المعمودية');
      }
      if (answer === 'Cope') assert.equal(question('catholic', 'it', id).answers[answerId], 'Piviale');
    }
  }
  for (const [slug, stage] of [['catholic', 6], ['nun', 7]]) {
    assert.match(question(String(slug), 'ar', `${slug}-s${stage}q4`).question, /أسرار الوردية/);
    assert.doesNotMatch(question(String(slug), 'ar', `${slug}-s${stage}q4`).question, /الألغاز/);
  }
});
