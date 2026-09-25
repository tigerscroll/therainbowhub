// Compare numerical meaning, allowing native grammar, decimal notation and
// reordered clauses. Stable question/answer IDs remain the scoring contract.
export function answerNumbers(text, locale = 'en') {
  let value = text.replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char))).replaceAll('−', '-');
  if (locale === 'ar') {
    // Arabic grid moves may express one cell implicitly or two with a dual noun.
    // Only count the singular noun when followed by a direction, not a cell ID.
    value = value.replace(/(?<!\p{L})(و?)خانة(?=\s+إلى\s+(?:اليمين|اليسار|الأعلى|الأسفل)(?!\p{L}))/gu, '$1 1');
    value = value.replace(/(?<!\p{L})نقطة واحدة(?!\p{L})/gu, '1').replace(/(?<!\p{L})نقطت(?:ان|ين)(?!\p{L})/gu, '2');
    const words = {الأول: 1, الثاني: 2, الثالث: 3, الرابع: 4, الخامس: 5, السادس: 6, السابع: 7, الثامن: 8, التاسع: 9, العاشر: 10, بعشرة: 10, ساعتان: 2, ساعتين: 2, وحدتان: 2, وحدتين: 2, مربعين: 2, بمربعين: 2, خانتان: 2, خانتين: 2};
    value = value.replace(/[\p{Script=Arabic}]+/gu, word => String(words[word] ?? words[word.replace(/^و/, '')] ?? word));
  }
  value = value.replace(/\b(\d{1,2})h\b/g, '$1:00');
  value = value.replace(/(?<=\d)[\u00a0\u202f](?=\d{3}\b)/g, '');
  if (locale === 'nl') value = value.replace(/\b(\d{1,2})\.(\d{2})(?=\s*uur\b)/g, '$1:$2');
  const parts = new Intl.NumberFormat(locale === 'ar' ? 'en' : locale).formatToParts(1234.5);
  const decimal = parts.find(part => part.type === 'decimal').value;
  const group = parts.find(part => part.type === 'group')?.value;
  return (value.match(/-?\d+(?:[.,]\d+)*/g) ?? []).map(number => {
    if (group === '.' || group === ',') number = number.replaceAll(group, '');
    return Number(number.replace(decimal, '.'));
  }).sort((a, b) => a - b);
}

export function normalizedAnswer(value) {
  return String(value).normalize('NFKD').replace(/\p{M}/gu, '')
    // Minus signs, decimal separators and operators change a puzzle's answer.
    .replaceAll('−', '-').replace(/[^\p{L}\p{N}:+\-.,/×÷=]+/gu, ' ')
    .trim().toLocaleUpperCase('und');
}
