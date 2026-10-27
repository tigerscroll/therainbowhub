import {getQuizSlugs, getQuizContentLocales} from '../quiz-catalogue.mjs';
export const slugs = getQuizSlugs();
export const activeLocales = getQuizContentLocales();
export const locales = activeLocales.filter(locale => locale !== 'en');
// Authored pipe-delimited rows have a fixed column order, independent of
// filesystem discovery order. Never index these rows with `locales`.
export const translationRowLocales = ['fr', 'de', 'it', 'nl', 'es', 'pt', 'ar'];

// Copy is deliberately compact enough for narrow checkpoint cards. Portuguese
// uses shared vocabulary and infinitives, rather than a regional form of address.
const rows = {
  id: ['Mulai', 'Lanjut', 'Lihat Hasil Saya', 'SELANJUTNYA', 'Jawaban diperiksa', 'Kekuatan tiap topik dibandingkan', 'Skor dihitung', 'Sudahkah Anda mencapai 80%? Lihat skor dan kekuatan Anda.', 'Tantangan Anda', 'Sudah saya ingat'],
  th: ['เริ่ม', 'ไปต่อ', 'ดูผลลัพธ์', 'ถัดไป', 'ตรวจคำตอบแล้ว', 'เปรียบเทียบจุดแข็งแต่ละหัวข้อแล้ว', 'คำนวณคะแนนแล้ว', 'คุณทำได้ถึง 80% หรือยัง? ดูคะแนนและจุดแข็งของคุณ', 'ความท้าทายของคุณ', 'จำได้แล้ว'],
  hi: ['शुरू करें', 'आगे बढ़ें', 'मेरा नतीजा देखें', 'आगे क्या है', 'जवाब जाँच लिए गए', 'विषयों की मज़बूती की तुलना हुई', 'स्कोर की गणना हो गई', 'क्या आपने 80% का लक्ष्य पूरा किया? अपना स्कोर और खूबियाँ देखें।', 'आपकी चुनौती', 'याद कर लिया'],
  fr: ['Commencer', 'Continuer', 'Voir mon résultat', 'À SUIVRE', 'Réponses vérifiées', 'Points forts comparés', 'Score calculé', 'Ai-je atteint 80 % ? Mon score et mes points forts sont prêts.', 'Mon défi', 'J’ai mémorisé'],
  de: ['Starten', 'Weiter', 'Mein Ergebnis', 'ALS NÄCHSTES', 'Antworten geprüft', 'Stärken verglichen', 'Punktzahl berechnet', '80 % erreicht? Die Punktzahl und die Stärken stehen fest.', 'Die Herausforderung', 'Ich bin bereit'],
  it: ['Inizia', 'Continua', 'Vedi il risultato', 'PROSSIMA SFIDA', 'Risposte verificate', 'Punti di forza confrontati', 'Punteggio calcolato', 'Hai raggiunto l’80%? Il punteggio e i tuoi punti di forza sono pronti.', 'La tua sfida', 'Ho memorizzato'],
  nl: ['Begin', 'Verder', 'Bekijk mijn resultaat', 'HIERNA', 'Antwoorden gecontroleerd', 'Sterke punten vergeleken', 'Score berekend', '80% gehaald? Je score en sterke punten zijn bekend.', 'Jouw uitdaging', 'Ik heb het onthouden'],
  es: ['Empezar', 'Continuar', 'Ver mi resultado', 'A CONTINUACIÓN', 'Respuestas revisadas', 'Puntos fuertes comparados', 'Puntuación calculada', '¿Has llegado al 80 %? Tu puntuación y tus puntos fuertes están listos.', 'Tu reto', 'Ya lo memoricé'],
  pt: ['Começar', 'Continuar', 'Ver meu resultado', 'A SEGUIR', 'Respostas verificadas', 'Pontos fortes comparados', 'Pontuação calculada', 'Atingiu 80%? A pontuação e os pontos fortes estão prontos.', 'O seu desafio', 'Já memorizei'],
  ar: ['ابدأ', 'متابعة', 'عرض نتيجتي', 'التحدي التالي', 'تمت مراجعة الإجابات', 'تمت مقارنة نقاط القوة', 'تم حساب النتيجة', 'هل بلغت 80٪؟ نتيجتك ونقاط قوتك جاهزة.', 'تحديك', 'حفظت التفاصيل'],
};
export const ui = Object.fromEntries(Object.entries(rows).map(([locale, [start, next, result, upNext, checked, strengths, calculated, ready, challenge, memorized]]) => [locale, {start, next, result, upNext, checks: [checked, strengths, calculated], ready, challenge, memorized}]));

export const visionLabels = {
  fr: {ORIGINAL: 'ORIGINAL', COPY: 'COPIE', TARGET: 'MODÈLE'},
  de: {ORIGINAL: 'ORIGINAL', COPY: 'KOPIE', TARGET: 'VORLAGE'},
  it: {ORIGINAL: 'ORIGINALE', COPY: 'COPIA', TARGET: 'MODELLO'},
  nl: {ORIGINAL: 'ORIGINEEL', COPY: 'KOPIE', TARGET: 'VOORBEELD'},
  es: {ORIGINAL: 'ORIGINAL', COPY: 'COPIA', TARGET: 'MODELO'},
  pt: {ORIGINAL: 'ORIGINAL', COPY: 'CÓPIA', TARGET: 'MODELO'},
  ar: {ORIGINAL: 'الأصل', COPY: 'النسخة', TARGET: 'النموذج'},
};
