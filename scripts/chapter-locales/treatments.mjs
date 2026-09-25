import {translationRowLocales as locales} from './config.mjs';

const rows = {
  'treatments-s1q4': 'En psychothérapie, que signifie le sigle TCC ?|Wofür steht die Abkürzung KVT in der Psychotherapie?|In psicoterapia, che cosa significa la sigla TCC?|Waar staat de afkorting CGT voor in de psychotherapie?|En psicoterapia, ¿qué significa la sigla TCC?|Na psicoterapia, o que significa a sigla TCC?|إلى أي أسلوب في العلاج النفسي يشير الاختصار الإنجليزي CBT؟',
  'treatments-s3q4': 'Une perfusion portant la mention « IV » administre le traitement directement dans quelle structure ?|Eine Infusion mit der Bezeichnung „i.v.“ führt die Behandlung direkt wohin?|Un’infusione indicata con la sigla «EV» somministra il trattamento direttamente dove?|Waar wordt een behandeling rechtstreeks toegediend bij een infuus met de aanduiding ‘i.v.’?|Una infusión marcada como «IV» administra el tratamiento directamente en qué estructura?|Uma infusão identificada como «IV» administra o tratamento diretamente em que estrutura?|عند إعطاء محلول بالتسريب الذي يُرمز إليه بـ IV، إلى أين يدخل العلاج مباشرةً؟',
  'treatments-s5q5': 'L’hormonothérapie vise des cancers dont la croissance dépend de quelles substances ?|Eine Hormontherapie kann bei Krebs eingesetzt werden, dessen Wachstum von welchen Stoffen abhängt?|La terapia ormonale può trattare tumori la cui crescita dipende da quali sostanze?|Hormoontherapie kan worden gebruikt bij kanker waarvan de groei afhangt van welke stoffen?|La terapia hormonal puede tratar tumores cuyo crecimiento depende de qué sustancias?|A terapia hormonal pode tratar tumores cujo crescimento depende de que substâncias?|يمكن للعلاج الهرموني أن يعالج سرطانات يعتمد نموها على أي مواد؟',
};
const answers = {
  'Physical therapy (physiotherapy)': 'Kinésithérapie (physiothérapie)|Physiotherapie|Fisioterapia|Fysiotherapie|Fisioterapia|Fisioterapia|العلاج الطبيعي',
  'Radiation therapy (radiotherapy)': 'Radiothérapie|Strahlentherapie|Radioterapia|Radiotherapie|Radioterapia|Radioterapia|العلاج الإشعاعي',
  'Cognitive behavioral therapy': 'Thérapie cognitivo-comportementale|Kognitive Verhaltenstherapie|Terapia cognitivo-comportamentale|Cognitieve gedragstherapie|Terapia cognitivo-conductual|Terapia cognitivo-comportamental|العلاج المعرفي السلوكي',
  'Occupational therapy': 'Ergothérapie|Ergotherapie|Terapia occupazionale|Ergotherapie|Terapia ocupacional|Terapia ocupacional|العلاج الوظيفي',
};
export function polishTreatments(copy, source, locale) {
  const index = locales.indexOf(locale), acronym = {fr: 'TCC', de: 'KVT', it: 'TCC', nl: 'CGT', es: 'TCC', pt: 'TCC', ar: 'CBT'}[locale];
  for (const [stageId, stage] of Object.entries(copy.stages)) for (const [id, question] of Object.entries(stage.questions)) {
    question.question = rows[id]?.split('|')[index] ?? question.question.replace(/\bCBT\b/g, acronym);
    for (const key of Object.keys(question.answers)) {
      const original = source.stages[stageId].questions[id].answers[key];
      if (answers[original]) question.answers[key] = answers[original].split('|')[index];
    }
  }
}
