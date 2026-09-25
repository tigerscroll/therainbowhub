// Native checkpoint frames work for new JSON-only quizzes as well as the
// current catalogue. Topic names come from each locale's question content.
const frames = {
 fr: ['À suivre : {topic}. Saurez-vous relier les indices ?', 'Nouveau défi : {topic}. Les détails feront la différence.', 'À découvrir : {topic}. Que saurez-vous reconnaître ?'],
 de: ['Als Nächstes: {topic}. Wie passen die Hinweise zusammen?', 'Neues Thema: {topic}. Jetzt kommt es auf die Details an.', 'Weiter geht es mit: {topic}. Welche Details sind vertraut?'],
 it: ['Prossimo tema: {topic}. Saprai collegare gli indizi?', 'Nuova sfida: {topic}. I dettagli faranno la differenza.', 'Ora tocca a: {topic}. Cosa saprai riconoscere?'],
 nl: ['Hierna: {topic}. Kun jij de aanwijzingen verbinden?', 'Nieuwe uitdaging: {topic}. Let goed op de details.', 'Verder met: {topic}. Wat herken jij?'],
 es: ['A continuación: {topic}. ¿Podrás conectar las pistas?', 'Nuevo reto: {topic}. Los detalles marcarán la diferencia.', 'Ahora toca: {topic}. ¿Qué sabrás reconocer?'],
 pt: ['A seguir: {topic}. Consegue ligar as pistas?', 'Novo desafio: {topic}. Os detalhes fazem a diferença.', 'Vamos explorar: {topic}. O que vai reconhecer?'],
 ar: ['الموضوع التالي: {topic}. هل تستطيع الربط بين الأدلة؟', 'تحدٍّ جديد: {topic}. التفاصيل تصنع الفرق.', 'لنستكشف: {topic}. ما الذي ستتعرّف عليه؟'],
};
export const nativeNextTopic = (locale, title, index) => frames[locale][index % 3].replace('{topic}', title);
