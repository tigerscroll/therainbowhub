import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (slug: string, locale: 'en' | 'vi'): any =>
  JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`, 'utf8'));

test('Vietnamese quizzes keep ten English-aligned questions and distinct choices', () => {
  const slugs = fs.readdirSync('data/quizzes').filter((slug) => fs.existsSync(`data/quizzes/${slug}/vi.json`));
  assert.equal(slugs.length, 53);
  for (const slug of slugs) {
    const english = read(slug, 'en').stages['stage-1'].questions;
    const vietnamese = read(slug, 'vi');
    const questions = vietnamese.stages['stage-1'].questions;
    assert.deepEqual(Object.keys(questions), Object.keys(english), slug);
    assert.equal(Object.keys(questions).length, 10, slug);
    assert.notEqual(vietnamese.results?.score?.bestRound, 'Vòng tốt nhất của bạn', slug);
    for (const [id, question] of Object.entries(questions) as [string, any][]) {
      assert.deepEqual(Object.keys(question.answers), Object.keys(english[id].answers), `${slug}/${id}`);
      const choices = Object.values(question.answers) as string[];
      assert.equal(new Set(choices.map((choice) => choice.trim())).size, choices.length, `${slug}/${id}`);
    }
  }
});

test('Vietnamese health copy keeps key time, safety and non-diagnostic distinctions', () => {
  const depression = read('depression', 'vi');
  const ocd = read('ocd', 'vi');
  const prostate = read('prostatetest', 'vi');
  const dementia = read('dementia', 'vi');
  const macular = read('maculardegeneration', 'vi');
  assert.match(depression.stages['stage-1'].questions['depression-q1'].answers.a3, /Hơn một nửa số ngày/);
  assert.match(depression.stages['stage-1'].questions['depression-q4'].answers.a3, /ngủ quá nhiều/);
  assert.match(ocd.stages['stage-1'].questions['ocd-q8'].answers.a3, /chốc lát/);
  assert.match(prostate.stages['stage-1'].questions['prostate-test-q5'].question, /són tiểu/);
  assert.match(prostate.about.disclaimer, /không thể xác nhận hoặc loại trừ/);
  assert.match(dementia.about.body, /không phải công cụ sàng lọc sa sút trí tuệ/);
  assert.match(macular.landing.intro, /câu hỏi về chi tiết hình ảnh/);
  assert.match(macular.about.disclaimer, /không thể xác nhận hoặc loại trừ/);
});

test('Vietnamese practical-safety questions retain their intended actions', () => {
  assert.match(read('motorbike', 'vi').stages['stage-1'].questions['motorbike-q5'].answers.a1, /Tránh điểm mù/);
  assert.match(read('flightattendant', 'vi').stages['stage-1'].questions['flightattendant-q2'].question, /nhiễu động mạnh/);
  assert.match(read('tools', 'vi').stages['stage-1'].questions['tools-q6'].question, /bàn xoa cán dài/);
  assert.match(read('nun', 'vi').stages['stage-1'].questions['nun-q9'].question, /khấn dòng/);
  assert.match(read('midwifery', 'vi').stages['stage-1'].questions['mid-r1q1'].question, /mẹ và thai nhi/);
  assert.match(read('midwifery', 'vi').about.body, /người có chuyên môn/);
  assert.match(read('paramedic', 'vi').stages['stage-1'].questions['paramedic-r5q4'].answers.a2, /tình trạng xấu đi/);
  assert.match(read('nursing', 'vi').about.body, /không dựa vào quy trình nghề nghiệp/);
});

test('Vietnamese result copy avoids repeated literal templates and misleading match language', () => {
  for (const slug of fs.readdirSync('data/quizzes')) {
    if (!fs.existsSync(`data/quizzes/${slug}/vi.json`)) continue;
    const profiles = Object.values(read(slug, 'vi').results?.profiles ?? {}) as {copy?: string}[];
    for (const profile of profiles) {
      assert.doesNotMatch(profile.copy ?? '', /Đánh giá của bạn cho thấy những kết nối cần xem lại|Thử thách này đưa ra một số ý tưởng xa lạ/, slug);
    }
  }
  assert.match(read('personality', 'vi').results.name, /HÌNH MẪU QUỐC GIA/);
  assert.match(read('marry', 'vi').results.name, /NGƯỜI BẠN CÓ THỂ HỢP/);
});
