import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read=(slug:string,locale:string)=>JSON.parse(fs.readFileSync(`data/quizzes/${slug}/${locale}.json`,'utf8'));
const locales=read('vision','quiz').activeLocales as string[];
const question=(slug:string,locale:string,id:string):any=>Object.values(read(slug,locale).stages).map((s:any)=>s.questions[id]).find(Boolean);

test('all three audited quiz subtitles retain two explicit lines without question counts',()=>{
 for(const slug of ['vision','memory','years-left'])for(const locale of locales){
  const intro=read(slug,locale).landing.intro;
  assert.equal(intro.split('\n').length,2,`${slug}/${locale}`);
  assert.doesNotMatch(intro,/\b(?:10|30)\b/,`${slug}/${locale}`);
 }
});

test('Teacher safeguarding disclosure stays child-centred with a distinct safe answer in every locale',()=>{
 for(const locale of locales){
  const item=question('teacher',locale,'teacher-q4');
  assert.ok(item.question.trim(),locale);
  assert.equal(new Set(Object.values(item.answers)).size,4,locale);
  assert.equal(read('teacher','quiz').structure.questions['teacher-q4'].correctAnswerId,'a4');
  assert.ok(item.answers.a4.trim(),locale);
 }
 const reviewed:Record<string,[RegExp,RegExp]>= {
  de:[/Schüler/,/keine Geheimhaltung.*Kinderschutzverfahren/],
  fi:[/oppilas/i,/älä lupaa.*suojaamista/],
  hu:[/tanuló/i,/nem ígérni titoktartást.*gyermekvédelmi/],
  ja:[/児童|生徒/,/秘密を守るとは約束せず.*保護手順/],
  ms:[/murid/i,/jangan berjanji.*perlindungan murid/],
  sk:[/Žiak/,/nesľubovať utajenie.*ochrany žiakov/],
  tr:[/öğrenci/i,/gizlilik sözü vermemek.*çocuk koruma/],
  uk:[/Учень/,/не обіцяти.*захисту учнів/]
 };
 for(const[locale,[questionPattern,answerPattern]]of Object.entries(reviewed)){
  const item=question('teacher',locale,'teacher-q4');
  assert.match(item.question,questionPattern,locale);
  assert.match(item.answers.a4,answerPattern,locale);
 }
});

test('German Teacher results describe a quiz, not a professional qualification',()=>{
 const content=read('teacher','de');
 assert.equal(content.results.name,'IHR ERGEBNIS IM UNTERRICHTSQUIZ');
 assert.equal(content.results.dimensions['dimension-4'].label,'Schutz von Schülerinnen und Schülern');
 assert.doesNotMatch(content.results.score.passed,/Aufnahmeprüfung|bestanden/);
 assert.match(content.about.disclaimer,/keine anerkannte Prüfung/);
});

test('Portuguese Teacher results follow the shared locale and do not award admission',()=>{
 const content=read('teacher','pt');
 assert.equal(content.results.name,'O SEU RESULTADO NO QUIZ DE ENSINO');
 assert.equal(content.results.dimensions['dimension-4'].label,'Proteção dos alunos');
 assert.doesNotMatch(content.results.score.passed,/admissão|Professor/);
 assert.match(content.career.stages['stage-1'].preAdCopy,/As suas dez respostas/);
 assert.match(content.results.score.bestRound,/etapa/);
});

test('Danish Teacher UI describes teaching and pupil protection without awarding admission',()=>{
 const content=read('teacher','da');
 assert.equal(content.results.dimensions['dimension-4'].label,'Beskyttelse af elever');
 assert.equal(content.results.name,'DIT RESULTAT I UNDERVISNINGSQUIZZEN');
 assert.doesNotMatch(content.results.score.passed,/bestod|optagelse/);
 assert.doesNotMatch(content.results.profiles['profile-1'].title,/standout/);
});

test('Social Work quiz results do not claim a professional entrance qualification',()=>{
 for(const locale of ['en','de']){
  const content=read('socialworker',locale);
  assert.doesNotMatch(content.results.score.passed,/entrance|Aufnahmeprüfung/i,locale);
  assert.doesNotMatch(content.career.stages['stage-1'].preAdCopy,/professional judgment score|professionelles Urteilsvermögen/i,locale);
  assert.match(content.about.disclaimer,/not an accredited|keine.*Prüfung|weder eine anerkannte/i,locale);
 }
});

test('Paramedic scene-safety answer keeps distance, redirects others and calls for help',()=>{
 const reviewed:Record<string,RegExp>={
  ar:/ابتعد.*ووجّه.*واطلب/,
  el:/Κρατήστε απόσταση.*οδηγήστε.*καλέστε/,
  fil:/Lumayo.*ilipat.*tumawag/,
  id:/Jaga jarak.*arahkan.*panggil/,
  ms:/Jauhi.*bimbing.*hubungi/,
  th:/อยู่ห่าง.*พา.*แจ้งขอ/,
  vi:/Tránh xa.*hướng.*gọi/
 };
 for(const[locale,pattern]of Object.entries(reviewed)){
  const answer=question('paramedic',locale,'paramedic-r10q4').answers.a1;
  assert.match(answer,pattern,locale);
  assert.equal(read('paramedic','quiz').structure.questions['paramedic-r10q4'].correctAnswerId,'a1');
 }
});

test('Arabic Surgeon emergency distractor means waiting without action',()=>{
 const answer=question('surgeon','ar','surgeon-q9').answers.a3;
 assert.match(answer,/دون اتخاذ أي إجراء/);
 assert.doesNotMatch(answer,/تمثيل/);
});

test('Midwifery labour questions and headings mean childbirth in every locale',()=>{
 const childbirth:Record<string,RegExp>={
  ar:/المخاض|الولادة/,bg:/родил|раждан/i,cs:/porod/i,da:/føds/i,
  de:/geburt/i,el:/τοκετ/i,en:/childbirth/i,es:/parto/i,
  fi:/synnyty/i,fil:/panganganak/i,fr:/accouchement/i,he:/לידה/,
  hr:/porod|porođaj/i,hu:/vajúd|szül/i,id:/persalinan/i,it:/travaglio|parto/i,
  ja:/分娩|陣痛/,ms:/bersalin/i,nb:/fødsel/i,nl:/bevalling/i,
  pl:/por[oó]d/i,pt:/parto/i,ro:/travali/i,sk:/p[oô]rod/i,
  sr:/порођај/i,sv:/förlossning/i,th:/คลอด/,tr:/doğum/i,
  uk:/полог/i,vi:/chuyển dạ/i
 };
 for(const[locale,pattern]of Object.entries(childbirth))for(const id of ['mid-r5q3','mid-r5q4']){
  const item=question('midwifery',locale,id);
  assert.match(item.question,pattern,`${locale}/${id} question`);
  assert.match(item.headerLabel,pattern,`${locale}/${id} heading`);
  assert.equal(read('midwifery','quiz').structure.questions[id].correctAnswerId,'a1');
 }
});

test('reviewed Midwifery newborn warning describes poor feeding, not feeding others',()=>{
 const reviewed:Record<string,RegExp>={
  fi:/ei syö.*hengittää/,
  fil:/Hindi umiinom ng gatas.*paghinga/,
  he:/אינו ניזון.*ונושם/,
  th:/กินนมได้น้อย.*หายใจ/
 };
 for(const[locale,pattern]of Object.entries(reviewed)){
  assert.match(question('midwifery',locale,'mid-r7q3').question,pattern,locale);
  assert.equal(read('midwifery','quiz').structure.questions['mid-r7q3'].correctAnswerId,'a4');
 }
});

test('Midwifery organ distractor names the anatomical appendix in previously broken locales',()=>{
 const expected:Record<string,string>={
  ar:'الزائدة الدودية',bg:'Апендикс',cs:'Červovitý přívěsek',da:'Blindtarmens vedhæng',
  el:'Σκωληκοειδής απόφυση',fi:'Umpilisäke',hr:'Crvuljak',hu:'Féregnyúlvány',
  id:'Apendiks',ms:'Apendiks',nb:'Blindtarmsvedhenget',pl:'Wyrostek robaczkowy',
  ro:'Apendicele',sk:'Červovitý prívesok slepého čreva',sr:'Црвуљак',
  sv:'Blindtarmsbihanget',th:'ไส้ติ่ง',tr:'Apandis',uk:'Апендикс',vi:'Ruột thừa'
 };
 for(const[locale,term]of Object.entries(expected)){
  assert.equal(question('midwifery',locale,'mid-r1q1').answers.a4,term,locale);
  assert.equal(read('midwifery','quiz').structure.questions['mid-r1q1'].correctAnswerId,'a2');
 }
});

test('Paramedic arithmetic visual retains every operator and pulse labels name pulse',()=>{
 const arithmetic=question('paramedic','ar','paramedic-r3q3').visual.items[0];
 assert.match(arithmetic,/\+/);
 assert.equal((arithmetic.match(/\+/g)||[]).length,2);
 assert.match(arithmetic,/=/);
 const pulse:Record<string,RegExp>={id:/NADI/,pl:/TĘTNO/,th:/ชีพจร/,vi:/MẠCH/};
 for(const[locale,pattern]of Object.entries(pulse)){
  assert.match(question('paramedic',locale,'paramedic-r5q4').visual.items[0],pattern,locale);
 }
});

test('Social Worker safeguarding distractor posts case details, not a user account, in every locale',()=>{
 const caseTerms:Record<string,RegExp>={
  ar:/حالة/,bg:/случая/,cs:/případu/,da:/sagen/,de:/Falls/,el:/υπόθεσης/,
  en:/case/,es:/caso/,fi:/tapauksesta/,fil:/kaso/,fr:/dossier/,he:/המקרה/,
  hr:/slučaja/,hu:/esetről/,id:/kasus/,it:/caso/,ja:/事例/,ms:/kes/,
  nb:/saken/,nl:/zaak/,pl:/sprawy/,pt:/caso/,ro:/caz/,sk:/prípade/,
  sr:/случаја/,sv:/ärendet/,th:/กรณี/,tr:/vaka/,uk:/справи/,vi:/vụ việc/
 };
 for(const[locale,pattern]of Object.entries(caseTerms)){
  assert.match(question('socialworker',locale,'socialworker-q7').answers.a4,pattern,locale);
  assert.equal(read('socialworker','quiz').structure.questions['socialworker-q7'].correctAnswerId,'a3');
 }
});

test('Social Worker opening question offers help to the client and case note remains a note',()=>{
 const offerHelp:Record<string,RegExp>={
  cs:/potřebovali pomoci/,el:/σας βοηθήσουμε/,pl:/potrzebujesz.*pomocy/,
  ro:/aveți.*nevoie/,sk:/potrebovali pomôcť/,uk:/потрібна допомога/
 };
 for(const[locale,pattern]of Object.entries(offerHelp)){
  assert.match(question('socialworker',locale,'socialworker-q1').answers.a1,pattern,locale);
 }
 const caseNote:Record<string,RegExp>={
  el:/σημείωση.*υπόθεσης/,vi:/Ghi chép hồ sơ/,sr:/белешка о случају/
 };
 for(const[locale,pattern]of Object.entries(caseNote)){
  assert.match(question('socialworker',locale,'socialworker-q8').question,pattern,locale);
 }
});

test('Teacher differentiated instruction is not mistranslated as permissions or discrimination',()=>{
 const reviewed:Record<string,[RegExp,RegExp]>= {
  ar:[/التعليم المتمايز/,/طرق التعلم.*الدعم.*التحدي/],
  de:[/differenzierter Unterricht/,/Lernzugänge.*Unterstützung.*Anforderungen/],
  fi:[/eriytetty opetus/,/Oppimistapojen.*tuen.*vaativuuden/],
  id:[/pembelajaran berdiferensiasi/,/cara belajar.*dukungan.*tantangan/],
  ja:[/一人ひとりに応じた指導/,/学び方.*支援.*難易度/],
  ms:[/pengajaran terbeza/,/cara belajar.*sokongan.*cabaran/],
  th:[/การสอนแบบปรับให้เหมาะกับผู้เรียน/,/วิธีเรียน.*ช่วยเหลือ.*ความท้าทาย/],
  vi:[/Dạy học phân hóa/,/cách học.*hỗ trợ.*độ khó/]
 };
 for(const[locale,[questionPattern,answerPattern]]of Object.entries(reviewed)){
  const item=question('teacher',locale,'teacher-q7');
  assert.match(item.question,questionPattern,locale);
  assert.match(item.answers.a3,answerPattern,locale);
  assert.equal(read('teacher','quiz').structure.questions['teacher-q7'].correctAnswerId,'a3');
 }
});

test('Teacher reliability answer agrees with the assessment noun in reviewed locales',()=>{
 const expected:Record<string,RegExp>={
  da:/Når den giver/,de:/Wenn sie.*Ergebnisse liefert/,he:/כאשר היא מניבה/,
  ja:/おおむね一貫した結果/,sv:/När den ger/,uk:/Коли вона дає/
 };
 for(const[locale,pattern]of Object.entries(expected)){
  const item=question('teacher',locale,'teacher-q8');
  assert.match(item.answers.a4,pattern,locale);
  assert.equal(read('teacher','quiz').structure.questions['teacher-q8'].correctAnswerId,'a4');
 }
 assert.match(question('teacher','th','teacher-q8').question,/การประเมินจะถือว่าเชื่อถือได้เมื่อใด/);
});

test('Teacher plagiarism answer requires attribution rather than permission or approval',()=>{
 const sourceWords:Record<string,RegExp>={
  ar:/المصدر/,bg:/източника/,cs:/zdroje/,da:/kilden/,de:/Quelle/,
  fi:/lähdettä/,fil:/pinagmulan/,fr:/source/,he:/המקור/,id:/sumber/,
  ja:/出典/,ms:/sumbernya/,pl:/źródła/,pt:/fonte/,ro:/sursei/,
  th:/แหล่งที่มา/,tr:/kaynak/,uk:/джерела/,vi:/nguồn/
 };
 for(const[locale,pattern]of Object.entries(sourceWords)){
  const item=question('teacher',locale,'teacher-q10');
  assert.match(item.answers.a2,pattern,locale);
  assert.equal(read('teacher','quiz').structure.questions['teacher-q10'].correctAnswerId,'a2');
 }
});

test('Teacher task-start instruction gives steps, example and a learner comprehension check',()=>{
 const reviewed:Record<string,RegExp>={
  fi:/vaiheittaiset ohjeet.*esimerkki.*ymmärrys/,
  fil:/hakbang.*halimbawa.*naunawaan/,
  hu:/lépések.*példa.*megértés/,
  id:/langkah-langkah.*contoh.*pemahaman siswa/,
  ja:/手順.*例.*理解/,
  ms:/langkah.*contoh.*kefahaman pelajar/,
  th:/ขั้นตอน.*ตัวอย่าง.*ความเข้าใจ/,
  tr:/adımlar.*örnek.*öğrencilerin anlayıp anlamadığını/,
  vi:/bước.*ví dụ.*học sinh đã hiểu/
 };
 for(const[locale,pattern]of Object.entries(reviewed)){
  const item=question('teacher',locale,'teacher-q9');
  assert.match(item.answers.a1,pattern,locale);
  assert.equal(read('teacher','quiz').structure.questions['teacher-q9'].correctAnswerId,'a1');
 }
});

test('Doctor emergency response uses actual resuscitation terminology in reviewed locales',()=>{
 const expected:Record<string,RegExp>={
  cs:/záchrannou službu.*resuscitaci/,
  da:/alarmcentralen.*genoplivning/,
  fi:/hätänumeroon.*peruselvytys/,
  nb:/nødnummeret.*hjerte-lunge-redning/,
  sk:/záchrannú službu.*resuscitáciu/,
  sv:/nödnumret.*hjärt-lungräddning/,
  uk:/екстрену медичну допомогу.*реанімацію/,
  vi:/cấp cứu.*hồi sức tim phổi/
 };
 for(const[locale,pattern]of Object.entries(expected)){
  assert.match(question('doctor',locale,'doctor-q9').answers.a1,pattern,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q9'].correctAnswerId,'a1');
 }
});

test('Doctor antibiotic answer names medicine rather than people and keeps common-cold meaning',()=>{
 const expected:Record<string,RegExp>={
  ar:/لا تعالج.*العدوى الفيروسية.*نزلات البرد/,
  id:/Antibiotik.*infeksi virus.*pilek/,
  th:/ยาปฏิชีวนะ.*ติดเชื้อไวรัส.*ไข้หวัดธรรมดา/,
  vi:/Kháng sinh.*nhiễm vi-rút.*cảm lạnh/
 };
 for(const[locale,pattern]of Object.entries(expected)){
  assert.match(question('doctor',locale,'doctor-q10').answers.a2,pattern,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q10'].correctAnswerId,'a2');
 }
});

test('Portuguese Doctor prompts retain singular agreement and indicative emergency wording',()=>{
 assert.match(question('doctor','pt','doctor-q1').question,/Qual câmara do coração bombeia/);
 assert.match(question('doctor','pt','doctor-q9').question,/Uma pessoa não responde e não respira/);
});

test('reviewed Doctor stroke prompts retain the face-arm-speech pattern without naming the answer',()=>{
 const patterns:Record<string,RegExp>={
  ar:/الوجه.*ذراع.*الكلام/,
  de:/Mundwinkel.*Arm.*Sprachstörungen/,
  fi:/suupielen.*käsivarren.*puhevaikeudet/,
  hu:/arcgyengeség.*kar.*beszédzavar/,
  id:/Mulut.*lengan.*bicara/,
  ja:/顔.*片腕.*話しにくい/,
  nl:/mond.*arm.*spraakproblemen/,
  pt:/rosto.*braço.*falar/,
  ro:/feței.*braț.*vorbire/,
  vi:/mặt.*tay.*nói khó/
 };
 for(const[locale,pattern]of Object.entries(patterns)){
  const item=question('doctor',locale,'doctor-q2');
  assert.match(item.question,pattern,locale);
  assert.notEqual(item.question,item.answers.a2,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q2'].correctAnswerId,'a2');
 }
});

test('Doctor appendicitis question describes a clinical pattern rather than a presentation performance',()=>{
 const accidental:Record<string,RegExp>={
  ar:/عرض كلاسيكي/,
  fil:/klasikong pagtatanghal/,
  he:/מצגת/,
  hu:/bemutatásában/,
  ms:/persembahan klasik/,
  th:/การนำเสนอ/
 };
 for(const[locale,wrong]of Object.entries(accidental)){
  const item=question('doctor',locale,'doctor-q4');
  assert.doesNotMatch(item.question,wrong,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q4'].correctAnswerId,'a4');
 }
});

test('Doctor auscultation question retains the clinical listening concept',()=>{
 const reviewed:Record<string,[RegExp,RegExp]>={
  fi:[/auskultaatio.*kliinisessä tutkimuksessa/,/äänten kuuntelemista/],
  he:[/אוסקולטציה.*בבדיקה גופנית/,/האזנה/],
  th:[/การฟังตรวจ.*การตรวจร่างกาย/,/การฟังเสียงภายในร่างกาย/]
 };
 for(const[locale,[questionPattern,answerPattern]]of Object.entries(reviewed)){
  const item=question('doctor',locale,'doctor-q6');
  assert.match(item.question,questionPattern,locale);
  assert.match(item.answers.a2,answerPattern,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q6'].correctAnswerId,'a2');
 }
});

test('reviewed Doctor nephron prompts describe kidney filtering without English filler',()=>{
 const reviewed:Record<string,[RegExp,RegExp]>= {
  ar:[/وحدة الترشيح.*الكلية/,/نيفرون/],
  fi:[/munuaisen.*suodatusyksikkö/,/Nefroni/],
  fil:[/yunit ng bato.*nagsasala ng dugo/,/Nephron/],
  ja:[/腎臓.*血液をろ過する基本単位/,/ネフロン/],
  ms:[/unit asas buah pinggang.*menapis darah/,/Nefron/]
 };
 for(const[locale,[questionPattern,answerPattern]]of Object.entries(reviewed)){
  const item=question('doctor',locale,'doctor-q8');
  assert.match(item.question,questionPattern,locale);
  assert.match(item.answers.a4,answerPattern,locale);
  assert.equal(read('doctor','quiz').structure.questions['doctor-q8'].correctAnswerId,'a4');
 }
});

test('Vision labels preserve the literal F and swatch identities in every locale',()=>{
 for(const locale of locales){
  assert.match(question('vision',locale,'vision-r9q2').answers.a1,/F/,locale);
  assert.deepEqual(Object.values(question('vision',locale,'vision-r4q5').answers).map((v:any)=>v.match(/\b[A-D]\b/g)),[['A'],['B'],['D'],['C']],locale);
 }
});

test('retained Years Left questions cannot regress to occupation or untranslated prompts',()=>{
 const freeTime:{[locale:string]:RegExp}={ja:/職業/,es:/dedicas/,id:/pekerjaanmu/,th:/คุณทำงานอะไร/,vi:/làm nghề/};
 for(const[locale,wrong]of Object.entries(freeTime))assert.doesNotMatch(question('years-left',locale,'yl-s1q2').question,wrong,locale);
 assert.doesNotMatch(read('years-left','sk').career.stages['stage-1'].preAdCopy,/Now|keeps you going/);
 assert.doesNotMatch(question('years-left','uk','yl-s1q1').question,/Your alarm rings/);
 assert.doesNotMatch(question('years-left','uk','yl-s2q1').question,/Breakfast is available/);
});

test('Memory Japanese recall distinguishes time of day from duration and uses the board noun',()=>{
 assert.match(question('memory','ja','memory-r3q7').question,/時刻/);
 assert.doesNotMatch(question('memory','ja','memory-r3q7').question,/何時間/);
 assert.equal(question('memory','ja','memory-r2q3').answers.a1,'1番目');
});

test('Memory landing CTAs retain the reviewed short Start wording',()=>{
 for(const[locale,cta]of Object.entries({da:'Start',hr:'Započni',nb:'Start'})){
  const copy=read('memory',locale);
  assert.equal(copy.landing.cta,cta);
  assert.ok(copy.about.howToPlay.steps[0].trim(),locale);
 }
});

test('Vision audited headings and calls to action retain the corrected translations',()=>{
 const headings={bg:'ЛАБОРАТОРИЯ ЗА ОПТИЧЕН ФОКУС',fi:'OPTISEN TARKKUUDEN LABORATORIO',fil:'PAGSUBOK SA TALAS NG PANINGIN',hu:'OPTIKAI FÓKUSZLABOR',ro:'LABORATOR DE ATENȚIE VIZUALĂ'};
 for(const[locale,expected]of Object.entries(headings))assert.equal(read('vision',locale).eyebrow,expected,locale);
 for(const[locale,expected]of Object.entries({fi:'Aloita testi',hu:'Teszt indítása',ro:'Începe testul'}))assert.equal(read('vision',locale).landing.cta,expected,locale);
 for(const[locale,wrong]of Object.entries({fi:/kaipaavat/,ms:/rindukan/,ro:/ochii tăi prinde|le dor/,ja:/光のトラップ/,th:/กับดักแสง/,vi:/kiểu dịch chuyển/}))assert.doesNotMatch(read('vision',locale).summary,wrong,locale);
});

test('Years Left age units and start instructions cannot regress to mistranslations',()=>{
 for(const locale of locales){
  const copy=read('years-left',locale);
  assert.ok(copy.landing.cta.trim(),locale);
  assert.ok(copy.about.howToPlay.steps[0].trim(),locale);
 }
 const units={he:'שנים',bg:'ГОДИНИ',fi:'VUOTTA',id:'TAHUN',sv:'ÅR',da:'ÅR',nb:'ÅR',ms:'TAHUN',th:'ปี',vi:'TUỔI',fil:'TAONG GULANG'};
 for(const[locale,expected]of Object.entries(units))assert.equal(read('years-left',locale).results.estimate.ageSuffix,expected,locale);
});

test('Years Left targeted answers retain food, stairs and cancelled-plan meanings',()=>{
 assert.equal(question('years-left','fil','yl-s2q2').answers.a4,'Hagdan — baka maunahan ko pa ang elevator');
 assert.equal(question('years-left','th','yl-s2q2').answers.a4,'เลือกบันได แถมลองไปให้ถึงก่อนลิฟต์');
});

test('Grammar possessive or plural-notes item shows its multiple-students context in every locale',()=>{
 const pluralContext:Record<string,RegExp>={
  ar:/عدة طلاب/,bg:/няколко ученици/,cs:/několika studentům/,da:/flere elever/,de:/mehreren Studierenden/,
  el:/αρκετούς μαθητές/,en:/several students/,es:/varios estudiantes/,fi:/useille opiskelijoille/,
  fil:/ilang mag-aaral/,fr:/plusieurs étudiants/,he:/כמה תלמידים/,hr:/nekolicini učenika/,
  hu:/több diáké/,id:/beberapa siswa/,it:/più studenti/,ja:/複数の学生/,ms:/beberapa orang pelajar/,
  nb:/flere elever/,nl:/meerdere studenten/,pl:/kilku uczniów/,pt:/vários estudantes/,
  ro:/mai multor elevi/,sk:/niekoľkým študentom/,sr:/неколицини ученика/,sv:/flera elever/,
  th:/นักเรียนหลายคน/,tr:/birkaç öğrenciye/,uk:/кільком учням/,vi:/một số học sinh/
 };
 for(const locale of locales){
  const item=question('grammar',locale,'grammar-r1q3');
  assert.match(item.context,pluralContext[locale],locale);
  assert.notEqual(item.answers.a1,item.answers.a2,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r1q3'].correctAnswerId,'a1');
 }
 const english=question('grammar','en','grammar-r1q3');
 assert.match(english.question,/that meaning.*correct apostrophe/);
 assert.doesNotMatch(english.question,/Notes belonging to several students/);
});

test('Greek Grammar sentence-fragment choice cannot also read as a complete question',()=>{
 const item=question('grammar','el','grammar-r1q1');
 assert.match(item.answers.a3,/^Επειδή/);
 assert.doesNotMatch(item.answers.a3,/^Γιατί/);
 assert.equal(read('grammar','quiz').structure.questions['grammar-r1q1'].correctAnswerId,'a2');
});

test('Grammar meeting-time distractors do not also describe the correct 08:30 finish',()=>{
 for(const locale of ['ar','cs','de','es','fil','hr','it','ms','nl','pl','pt','ro','sk','sr','sv','th','uk','vi']){
  const item=question('grammar',locale,'grammar-r3q1');
  assert.match(item.answers.a3,/0?9[:.]00/,locale);
  assert.ok(item.answers.a3!==item.answers.a4,locale);
 }
 for(const[locale,noun]of Object.entries({cs:'graf',pl:'wykres',uk:'графік'})){
  const item=question('grammar',locale,'grammar-r3q1');
  assert.ok(Object.values(item.answers).every((answer:any)=>answer.includes(noun)),locale);
 }
});

test('Grammar semicolon distractors describe the same file-loading event without translation drift',()=>{
 for(const locale of ['cs','da','fr','hr','hu','nb','ro','sv']){
  const item=question('grammar',locale,'grammar-r4q3');
  assert.equal(read('grammar','quiz').structure.questions['grammar-r4q3'].correctAnswerId,'a2');
  assert.ok(item.answers.a2.includes(';')||item.answers.a2.includes('·'),locale);
 }
 assert.doesNotMatch(question('grammar','cs','grammar-r4q3').answers.a1,/nabíjel/);
 assert.doesNotMatch(question('grammar','da','grammar-r4q3').answers.a1,/loadede/);
 assert.doesNotMatch(question('grammar','ro','grammar-r4q3').answers.a1,/Dosarul/);
 assert.match(question('grammar','hr','grammar-r4q3').answers.a4,/učitavala/);
});

test('Thai Grammar adapts the punctuation slot to a native two-particle usage question',()=>{
 const item=question('grammar','th','grammar-r4q3');
 assert.match(item.question,/คะ.*ค่ะ/);
 assert.equal(item.headerLabel,'คำลงท้ายสุภาพ');
 assert.equal(item.answers.a2,'ไปไหนคะ? ขอบคุณค่ะ');
 assert.equal(read('grammar','quiz').structure.questions['grammar-r4q3'].correctAnswerId,'a2');
 for(const id of ['a1','a3','a4'])assert.notEqual(item.answers[id],item.answers.a2,id);
});

test('Grammar finale avoids duplicated-word filler in every locale',()=>{
 const accidentalRepeat=/(?<![\p{L}])([\p{L}]{3,})\s+\1(?![\p{L}])/iu;
 for(const locale of locales){
  const item=question('grammar',locale,'grammar-r10q6');
  for(const[answerId,answer]of Object.entries(item.answers)){
   assert.doesNotMatch(answer as string,accidentalRepeat,`${locale}/${answerId}`);
  }
 }
});

test('Serbian and Turkish Grammar finale keep the intended agreement contrast',()=>{
 const serbian=question('grammar','sr','grammar-r10q6');
 assert.match(serbian.answers.a4,/Маја.*сваки од збирова били тачни/);
 assert.doesNotMatch(serbian.answers.a4,/Маиа|зброја/);
 const turkish=question('grammar','tr','grammar-r10q6');
 assert.match(turkish.question,/dil bilgisi/);
 assert.match(turkish.answers.a1,/teyit etti/);
 assert.equal(read('grammar','quiz').structure.questions['grammar-r10q6'].correctAnswerId,'a1');
});

test('Grammar marked-error prompt keeps part C and its accessible text in sync',()=>{
 const accidentalRepeat=/(?<![\p{L}])([\p{L}]{3,})\s+\1(?![\p{L}])/iu;
 for(const locale of locales){
  const visual=question('grammar',locale,'grammar-r7q2').visual;
  const partC=visual.items[2].replace(/^[^·・]+[·・]\s*/,"");
  assert.ok(visual.ariaLabel.includes(partC),`${locale}: accessible text must include the displayed error`);
  assert.doesNotMatch(partC,accidentalRepeat,`${locale}: no duplicated-word filler`);
 }
});

test('Arabic Grammar marked-error puzzle has only the intended C verb error',()=>{
 const item=question('grammar','ar','grammar-r7q2');
 assert.equal(item.visual.items[2],'C · قبل أن وافق المحرر');
 assert.equal(item.visual.items[3],'D · على نشرها');
 assert.equal(item.visual.ariaLabel.replace('قبل أن وافق المحرر','قبل أن يوافق المحرر'),'التقارير النهائية دُقِّقت قبل أن يوافق المحرر على نشرها');
 assert.equal(read('grammar','quiz').structure.questions['grammar-r7q2'].correctAnswerId,'a3');
});

test('localized Grammar descriptions do not claim to test English',()=>{
 const englishNames=/english|englisch|anglais|angl|англ|inggr|ingger|ingiliz|ภาษาอังกฤษ|tiếng anh|ingles|inglese|Αγγλ/i;
 for(const locale of locales.filter((code)=>code!=='en')){
  const about=read('grammar',locale).about;
  assert.doesNotMatch(about.body,englishNames,`${locale}: description`);
  assert.doesNotMatch(about.disclaimer,englishNames,`${locale}: disclaimer`);
 }
});

test('Grammar pronoun blanks form the intended sentences in Arabic, Spanish and Portuguese',()=>{
 const arabic=question('grammar','ar','grammar-r5q4');
 assert.equal(arabic.context.replace('___',arabic.answers.a1),'يجب أن يبقى هذا السر بيني وبين لينا.');
 const spanish=question('grammar','es','grammar-r5q4');
 assert.equal(spanish.context.replace('___',spanish.answers.a1),'Esta decisión debe quedar entre Lina y mí.');
 const portuguese=question('grammar','pt','grammar-r5q4');
 assert.equal(portuguese.context.replace('___',portuguese.answers.a1),'Entre Lina e mim, esta decisão deve permanecer confidencial.');
});

test('Nordic Grammar pronoun questions test the sentence form, not simple person recognition',()=>{
 const expected={da:'Det her skal blive mellem Lina og mig.',nb:'Dette må bli mellom Lina og meg.',sv:'Det här ska stanna mellan Lina och mig.'};
 for(const[locale,sentence]of Object.entries(expected)){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.equal(item.context.replace('___',item.answers.a1),sentence,locale);
  assert.ok(item.answers.a2!==item.answers.a1,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
});

test('Czech, Polish and Slovak Grammar pronoun questions require the instrumental case',()=>{
 const expected={cs:'Tohle musí zůstat mezi Linou a mnou.',pl:'To musi zostać między Liną a mną.',sk:'Toto musí zostať medzi Linou a mnou.'};
 for(const[locale,sentence]of Object.entries(expected)){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.equal(item.context.replace('___',item.answers.a1),sentence,locale);
  assert.ok(item.answers.a2!==item.answers.a1,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
});

test('reviewed southeast European Grammar pronoun questions preserve a contextual case choice',()=>{
 const expected={hr:'Ovo mora ostati između Line i mene.',sr:'Ово мора остати између Лине и мене.',ro:'Asta trebuie să rămână între Lina și mine.',bg:'Това трябва да остане между Лина и мен.',uk:'Це має залишитися між Ліною та мною.'};
 for(const[locale,sentence]of Object.entries(expected)){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.equal(item.context.replace('___',item.answers.a1),sentence,locale);
  assert.ok(item.answers.a2!==item.answers.a1,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
});

test('Finnish, Greek, Hungarian and Turkish Grammar pronouns remain contextual choices',()=>{
 const expected={fi:'Tämä jää Liinan ja minun välille.',el:'Αυτό πρέπει να μείνει ανάμεσα στη Λίνα και σε εμένα.',hu:'Bízd rám ezt a döntést.',tr:'Bu sır Lina ile benim aramda kalmalı.'};
 for(const[locale,sentence]of Object.entries(expected)){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.equal(item.context.replace('___',item.answers.a1),sentence,locale);
  assert.ok(item.answers.a2!==item.answers.a1,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
});

test('Filipino Grammar uses the correct sa-pronoun form in a sentence',()=>{
 const item=question('grammar','fil','grammar-r5q4');
 assert.equal(item.context.replace('___',item.answers.a1),'Sabihin mo sa akin ang desisyon.');
 assert.deepEqual([item.answers.a2,item.answers.a3,item.answers.a4],['ako','ko','kami']);
 assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
});

test('Indonesian and Malay Grammar test first-person passive word order',()=>{
 const expected={id:'Laporan itu sudah saya baca.',ms:'Laporan itu telah saya baca.'};
 for(const[locale,sentence]of Object.entries(expected)){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.equal(item.answers.a1,sentence,locale);
  assert.match(item.context,/^Saya /,locale);
  assert.ok(item.answers.a2!==sentence,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
});

test('Thai and Vietnamese Grammar require unambiguous reference to the intended person',()=>{
 for(const locale of ['th','vi']){
  const item=question('grammar',locale,'grammar-r5q4');
  assert.ok(item.context.length>30,locale);
  assert.ok(item.answers.a1!==item.answers.a2,locale);
  assert.ok(item.answers.a1!==item.answers.a3,locale);
  assert.ok(item.answers.a1!==item.answers.a4,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
 }
 const thai=question('grammar','th','grammar-r5q6');
 assert.equal(new Set(Object.values(thai.answers)).size,4);
 assert.equal(thai.answers.a2,'ราวี โปรดตรวจสอบบรรทัดสุดท้าย');
});

test('Police introductions describe policing rather than healthcare or literal country tiers',()=>{
 for(const locale of locales){
  const body=read('police',locale).about.body;
  assert.doesNotMatch(body,/Tier 1|niveau 1|nivå 1|nivel 1|nivelul 1|1\. szintű|ระดับ 1|Cấp 1|úrovně 1|tason 1|poziomu 1|di livello 1|英語圏諸国|Tingkat 1|Tahap 1|Тиер 1|Βαθμίδας 1/i,locale);
  assert.ok(body.includes('\n\n'),`${locale}: introduction and instructions remain separate`);
 }
 const thai=read('police','th').about.body;
 assert.match(thai,/งานตำรวจ/);
 assert.doesNotMatch(thai,/การรักษาพยาบาล/);
});

test('Train introductions describe general railway safety without literal country tiers',()=>{
 for(const locale of locales){
  const body=read('train',locale).about.body;
  assert.ok(body.includes('\n\n'),`${locale}: introduction and instructions remain separate`);
  assert.doesNotMatch(body,/Tier 1|nivel 1|niveau 1|di livello 1|ระดับ Tier 1|Cấp 1|führenden englischsprachigen|grands pays anglophones|Tingkat 1|Tahap 1|tason 1|poziomu 1|úrovne 1|úrovně 1|ниво 1|рівня 1/i,locale);
 }
 assert.match(read('train','th').about.body,/ความปลอดภัยของรถไฟ/);
});

test('Train route-conflict scenario names disagreeing displays, not disagreeing routes',()=>{
 const displayTerms:Record<string,RegExp>={
  en:/displays/,ar:/شاشتان/,bg:/екрана/,cs:/zobrazení/,da:/skærme/,de:/Routenanzeigen/,
  el:/οθόνες/,es:/pantallas/,fi:/reittinäyttöä/,fil:/screen/,fr:/écrans/,he:/תצוגות/,
  hr:/zaslona/,hu:/útvonalkijelző/,id:/layar/,it:/schermi/,ja:/経路表示/,ms:/paparan/,
  nb:/ruteskjermer/,nl:/routeweergaven/,pl:/wyświetlacze/,pt:/painéis/,ro:/afișaje/,
  sk:/obrazovky/,sr:/екрана/,sv:/skärmar/,th:/จอ/,tr:/ekranı/,uk:/екрани/,vi:/màn hình/
 };
 for(const locale of locales){
  const item=question('train',locale,'train-q10');
  assert.match(item.question,displayTerms[locale],locale);
  assert.equal(read('train','quiz').structure.questions['train-q10'].correctAnswerId,'a2');
  assert.ok(item.answers.a2.trim(),locale);
 }
 assert.doesNotMatch(question('train','pl','train-q10').question,/odlotem/);
});

test('Train stopping-distance question retains the distance concept in reviewed locales',()=>{
 const terms:Record<string,RegExp>={ar:/مسافة التوقف/,fil:/distansya ng paghinto/,pt:/distância necessária para parar/};
 for(const[locale,term]of Object.entries(terms)){
  const item=question('train',locale,'train-q3');
  assert.match(item.question,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q3'].correctAnswerId,'a3');
  assert.ok(item.answers.a3.trim(),locale);
 }
 assert.match(question('train','pl','train-q10').answers.a2,/właściwą procedurą/);
 assert.match(question('train','th','train-q10').answers.a2,/อย่าออกรถ/);
});

test('Train hazard report stays on the railway, not a road or racetrack',()=>{
 const railwayTerms:Record<string,RegExp>={ar:/السكة/,bg:/железопътната линия/,fil:/riles/,hr:/pruzi/,it:/binari/,pt:/via férrea/,sr:/прузи/,th:/รางรถไฟ/,tr:/Ray hattındaki/,vi:/đường ray/};
 for(const[locale,term]of Object.entries(railwayTerms)){
  const item=question('train',locale,'train-q4');
  assert.match(item.question,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q4'].correctAnswerId,'a4');
 }
});

test('Train obstruction distractor names passenger doors rather than car passenger-side doors',()=>{
 const passengerTerms:Record<string,RegExp>={cs:/cestující/,de:/Fahrgast/,el:/επιβατών/,hr:/putnike/,sk:/cestujúcich/,sr:/путнике/};
 for(const[locale,term]of Object.entries(passengerTerms)){
  const item=question('train',locale,'train-q1');
  assert.match(item.answers.a3,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q1'].correctAnswerId,'a1');
 }
 assert.match(question('train','pl','train-q1').question,/maszynista/);
 assert.match(question('train','uk','train-q1').question,/машиніст/);
});

test('Train safety-critical instruction keeps repeat-back and confirmation as the correct action',()=>{
 const confirmationTerms:Record<string,RegExp>={ar:/تأكيد/,cs:/potvrzení/,es:/confirmación/,fi:/vahvistus/,fr:/confirmation/,hr:/potvrdu/,hu:/megerősítést/,id:/konfirmasi/,it:/conferma/,nl:/bevestiging/,pt:/confirmação/,ro:/confirmare/,th:/ยืนยัน/,tr:/doğrulama/,uk:/підтвердження/,vi:/xác nhận/};
 for(const[locale,term]of Object.entries(confirmationTerms)){
  const item=question('train',locale,'train-q8');
  assert.match(item.answers.a4,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q8'].correctAnswerId,'a4');
 }
 assert.doesNotMatch(question('train','tr','train-q8').answers.a3,/tercümeyi/);
 assert.match(question('train','th','train-q6').answers.a2,/รายงานตามขั้นตอน/);
});

test('Train attention and fatigue questions retain rail context and human memory',()=>{
 const trackTerms:Record<string,RegExp>={fr:/voie ferrée/,it:/tratto di binario/,pt:/troço de via/,tr:/Demiryolu/,hr:/pruge/,sr:/пруге/,bg:/железопътната линия/,uk:/ділянці колії/,fi:/rataosuudella/,id:/bagian rel/,ms:/laluan kereta api/,vi:/đường ray/,th:/พนักงานขับรถไฟ/};
 for(const[locale,term]of Object.entries(trackTerms)){
  assert.match(question('train',locale,'train-q2').question,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q2'].correctAnswerId,'a2');
 }
 assert.match(question('train','uk','train-q2').answers.a1,/Потяг/);
 assert.match(question('train','fil','train-q2').answers.a4,/hindi gaanong ligtas/);
 assert.match(question('train','th','train-q5').question,/ความจำ/);
 assert.match(question('train','th','train-q5').answers.a1,/ยืนยันคำสั่ง/);
 const driverTerms:Record<string,RegExp>={
  ar:/سائق القطار/,bg:/машинистът/,cs:/strojvedoucí/,da:/lokomotivfører/,de:/Lokführer/,
  el:/μηχανοδηγός/,es:/maquinista/,fi:/veturinkuljettaja/,fil:/drayber ng tren/,fr:/conducteur de train/,
  he:/נהג רכבת/,hr:/strojovođa/,hu:/mozdonyvezető/,id:/masinis/,it:/macchinista/,
  ms:/pemandu kereta api/,nb:/lokfører/,nl:/treinbestuurder/,pl:/maszynista/,pt:/maquinista/,
  ro:/mecanic de locomotivă/,sk:/rušňovodič/,sr:/машиновођа/,sv:/lokförare/,
  tr:/Tren makinisti/,uk:/машиніст/,vi:/người lái tàu/
 };
 for(const[locale,term]of Object.entries(driverTerms)){
  assert.match(question('train',locale,'train-q5').question,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q5'].correctAnswerId,'a1');
 }
 for(const[locale,term]of Object.entries({pt:/bitola da via férrea/,th:/ระยะห่างระหว่างราง/,vi:/khổ đường ray/})){
  assert.match(question('train',locale,'train-q9').answers.a4,term,locale);
  assert.equal(read('train','quiz').structure.questions['train-q9'].correctAnswerId,'a1');
 }
});

test('Train fatigue question explains vigilance and reaction without literal track or opening-hours errors',()=>{
 assert.equal(read('train','quiz').structure.questions['train-q9'].correctAnswerId,'a1');
 for(const locale of locales){
  const item=question('train',locale,'train-q9');
  assert.ok(item.question.trim(),locale);
  assert.ok(item.answers.a1.trim(),locale);
 }
 assert.match(question('train','en','train-q9').question,/managing fatigue/);
 assert.match(question('train','fr','train-q9').answers.a3,/heures de travail/);
 assert.doesNotMatch(question('train','fr','train-q9').answers.a3,/heures d'ouverture/);
 for(const [locale,term] of Object.entries({ar:/السكة الحديدية/,el:/ράγες/,fil:/riles/,he:/המסילה/,id:/rel/,ms:/rel/,tr:/raylar/})){
  assert.match(question('train',locale,'train-q9').answers.a4,term,locale);
 }
});

test('Grammar answer choices avoid duplicated-word filler across all retained questions',()=>{
 const accidentalRepeat=/(?<![\p{L}])([\p{L}]{3,})\s+\1(?![\p{L}])/iu;
 for(const locale of locales){
  const copy=read('grammar',locale);
  for(const stage of Object.values(copy.stages) as any[]){
   for(const [id,item] of Object.entries(stage.questions) as [string,any][]){
    for(const [answerId,answer] of Object.entries(item.answers) as [string,string][]){
     assert.doesNotMatch(answer,accidentalRepeat,`${locale}/${id}/${answerId}`);
    }
   }
  }
 }
});

test('Grammar appendix-reference alternatives identify the same appendix without second valid readings',()=>{
 const japanese=question('grammar','ja','grammar-r7q6');
 assert.match(japanese.answers.a2,/更新される要約のほかに付録がある/);
 assert.match(japanese.answers.a3,/付録は毎月更新される/);
 const hungarian=question('grammar','hu','grammar-r7q6');
 assert.match(hungarian.context,/mellékletet.*melléklet/);
 assert.match(hungarian.answers.a3,/mellékletet.*melléklet/);
 const croatian=question('grammar','hr','grammar-r7q6');
 assert.match(croatian.answers.a3,/dodatak; dodatak/);
 const slovak=question('grammar','sk','grammar-r7q6');
 assert.match(slovak.answers.a1,/^Správa obsahuje zhrnutie/);
});

test('Grammar appendix-reference prompts ask about the updated appendix rather than a hyperlink',()=>{
 const appendixTerms:Record<string,RegExp>={
  bg:/приложението се актуализира/,cs:/aktualizuje příloha/,da:/bilaget opdateres/,
  el:/παράρτημα ενημερώνεται/,fi:/liite päivitetään/,fil:/apendiks ang ina-update/,
  hr:/dodatak ažurira/,id:/lampiran diperbarui/,ms:/lampiran dikemas kini/,
  nb:/vedlegget oppdateres/,pl:/aktualizowany jest załącznik/,ro:/anexa este actualizată/,
  sk:/príloha aktualizuje/,sr:/додатак ажурира/,sv:/bilagan uppdateras/,
  th:/ภาคผนวกเป็นส่วนที่ปรับปรุง/,tr:/ekin her ay güncellendiğini/,
  uk:/оновлюється саме додаток/,vi:/phụ lục được cập nhật/
 };
 for(const [locale,term] of Object.entries(appendixTerms)){
  const item=question('grammar',locale,'grammar-r7q6');
  assert.match(item.question,term,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r7q6'].correctAnswerId,'a3');
 }
 const thai=question('grammar','th','grammar-r7q6');
 assert.match(thai.answers.a1,/รายงานได้รับการปรับปรุง/);
 assert.match(thai.answers.a3,/ภาคผนวกได้รับการปรับปรุง/);
 const serbian=question('grammar','sr','grammar-r7q6');
 assert.ok(['a1','a2','a3','a4'].every((id)=>serbian.answers[id].includes('додатак')), 'sr: use one appendix term');
 assert.doesNotMatch(question('grammar','uk','grammar-r7q6').answers.a4,/Звіт, щомісячно оновлюється/);
});

test('Japanese Grammar result bands describe the exact ten-question score',()=>{
 const profiles=read('grammar','ja').results.profiles;
 for(const [profile,score] of [['profile-3',7],['profile-4',6],['profile-5',5]] as const){
  assert.match(profiles[profile].copy,new RegExp(`10問中${score}問`),profile);
 }
 assert.equal(new Set(['profile-3','profile-4','profile-5'].map((profile)=>profiles[profile].copy)).size,3);
});

test('Word landing copy describes choosing a related word, not following links or playing a match',()=>{
 const literalFalseFriends:Record<string,RegExp>={
  cs:/odkazy|zápas/i,da:/linkene|kamp/i,el:/συνδέσμους|αγώνα/i,
  fi:/linkkejä|ottelun/i,hu:/hivatkozás|meccs/i,ja:/リンク|接続/i,
  ms:/pautan|perlawanan/i,nb:/tilkoblinger|kamp/i,th:/ลิงก์|การแข่งขัน/i,
  vi:/liên kết giữa các từ|trận đấu/i,
 };
 for(const locale of locales){
  const copy=read('word',locale);
  assert.equal(copy.landing.intro.split('\n').length,2,locale);
  const bad=literalFalseFriends[locale];
  if(bad){
   assert.doesNotMatch(copy.summary,bad,`${locale}: summary`);
   assert.doesNotMatch(copy.landing.intro,bad,`${locale}: intro`);
  }
 }
});

test('Japanese Word result copy distinguishes the lower score bands',()=>{
 const profiles=read('word','ja').results.profiles;
 assert.notEqual(profiles['profile-4'].copy,profiles['profile-5'].copy);
 assert.equal(read('word','ja').results.score.passed,'単語連想テストに合格しました！');
});

test('Word battery distractors do not also describe musical drum kits',()=>{
 const unrelated={fr:'Oreiller',es:'Almohada',it:'Cuscino',pt:'Almofada',ro:'Pernă'};
 for(const[locale,answer]of Object.entries(unrelated)){
  const item=question('word',locale,'word-q4');
  assert.equal(item.answers.a4,answer,locale);
  assert.equal(read('word','quiz').structure.questions['word-q4'].correctAnswerId,'a3');
 }
});

test('Word instructions and results avoid reviewed literal-translation errors',()=>{
 const falseFriends:Record<string,RegExp>={
  ar:/جمعية|مباراة|اتصالات كلمة|رابطة الكلمة/u,
  bg:/най-силното съвпадение|изживяване с резултати|Вашите резултати/iu,
  el:/πιο δυνατό ταίριασμα|Η κριτική σας|βαθμολογία της ένωσης/iu,
  fil:/pinakamalakas na laban|mga direktang link|Samahan ng Salita/iu,
  he:/מקישורים ישירים|חיבור המילה|מבחן שיוך מילים/iu,
  hr:/najjači meč|Vaša recenzija|iskustvom rezultata/iu,
  hu:/legerősebb mérkőzést|közvetlen linkekről|csatlakozás|Az Ön/iu,
  sr:/најјачи спој|Ворд Цоннецтионс|Ваша рецензија/iu,
  th:/เลือกการแข่งขัน|ลิงก์โดยตรง|ไม่เสียเธรด|กลับมาเยี่ยมชม/iu,
  uk:/найсильніший матч|прямих посилань|Оцінка вашої асоціації/iu,
 };
 for(const [locale,bad] of Object.entries(falseFriends)){
  const copy=read('word',locale);
  const resultCopy=Object.values(copy.results.profiles).map((profile:any)=>profile.copy).join(' ');
  const journey=[copy.about.body,...copy.about.howToPlay.steps,copy.career.stages['stage-1'].difficulty,copy.career.stages['stage-1'].preAdCopy,resultCopy,copy.results.score.insights.overview].join(' ');
  assert.doesNotMatch(journey,bad,locale);
 }
});

test('Czech Word results use association terms rather than literal connection or disorder translations',()=>{
 const copy=read('word','cs');
 assert.equal(copy.eyebrow,'TEST SLOVNÍCH ASOCIACÍ');
 assert.equal(copy.results.profiles['profile-3'].title,'Bystrý hledač souvislostí');
 assert.equal(copy.results.score.insights.breakdown,'Výsledky podle typu asociace');
 assert.equal(copy.results.score.insights.correct,'Správné odpovědi');
 assert.doesNotMatch(copy.about.body,/nejsilnější zápas|propojené výzvy/);
});

test('Finnish Word copy uses association vocabulary throughout the result journey',()=>{
 const copy=read('word','fi');
 assert.equal(copy.eyebrow,'SANA-ASSOSIAATIOTESTI');
 assert.equal(copy.results.name,'SANA-ASSOSIAATIOTULOKSESI');
 assert.equal(copy.results.score.insights.breakdown,'Tulokset assosiaatiotyypeittäin');
 assert.equal(copy.results.score.insights.correct,'Oikeat vastaukset');
 assert.equal(question('word','fi','word-q1').headerLabel,'LUONTOSANAT');
 assert.doesNotMatch(copy.about.body,/ottelu|linkitetyn|Oikeus pysyy/);
});

test('Vietnamese Word archipelago answer names islands rather than repeating the prompt',()=>{
 const copy=read('word','vi');
 const item=question('word','vi','word-q5');
 assert.match(item.question,/QUẦN ĐẢO/);
 assert.equal(item.answers.a2,'Các đảo');
 assert.equal(copy.results.name,'ĐIỂM LIÊN TƯỞNG TỪ CỦA BẠN');
 assert.doesNotMatch(copy.about.body,/trận đấu|Sự đúng đắn/);
 for(const stage of Object.values(copy.stages) as any[]){
  for(const q of Object.values(stage.questions) as any[]){
   assert.match(q.question,/liên quan mật thiết nhất/);
   for(const answer of Object.values(q.answers) as string[]) assert.match(answer,/^\p{Lu}/u);
  }
 }
});

test('Norwegian Word results and headings describe word associations rather than connections or fights',()=>{
 const copy=read('word','nb');
 assert.equal(copy.results.name,'DIN POENGSUM I ORDASSOSIASJONER');
 assert.equal(copy.results.score.insights.breakdown,'Resultat etter type assosiasjon');
 assert.equal(copy.results.score.insights.correct,'Riktige svar');
 assert.equal(question('word','nb','word-q10').headerLabel,'SISTE SPØRSMÅL');
 assert.doesNotMatch(copy.about.body,/sterkeste kampen|en nett|enkelt-søkeordtilknytningsformat/);
});

test('Slovak Word results use native association vocabulary and one address style',()=>{
 const copy=read('word','sk');
 assert.equal(copy.results.name,'TVOJE SKÓRE V SLOVNÝCH ASOCIÁCIÁCH');
 assert.equal(copy.results.score.insights.breakdown,'Výsledky podľa typu asociácie');
 assert.equal(copy.results.score.insights.correct,'Správne odpovede');
 assert.equal(question('word','sk','word-q10').headerLabel,'POSLEDNÁ OTÁZKA');
 assert.doesNotMatch(copy.about.body,/najsilnejší zápas|prepojenej výzvy/);
 assert.doesNotMatch(copy.results.profiles['profile-3'].title,/Quick-Link/);
});

test('Word result headings do not leave the English template in translated locales',()=>{
 for(const locale of locales.filter((code)=>code!=='en')){
  const results=read('word',locale).results;
  assert.doesNotMatch(results.name,/WORD ASSOCIATION/i,locale);
  assert.doesNotMatch(results.profiles['profile-3'].title,/Quick-Link/i,locale);
  assert.doesNotMatch(results.score.insights.breakdown,/عطل|Βλάβη|Pagkasira|התמוטטות|Kvar|meghibásodása|Kerusakan|interruzione|接続|Kerosakan|Întreruperea|Распад|anslutningstyp|Поломка/iu,locale);
 }
});

test('Word result counts label answers rather than literal connections in every locale',()=>{
 const answerWords:Record<string,RegExp>={
  ar:/الإجابات/u,bg:/отговори/iu,cs:/odpovědi/iu,da:/svar/iu,de:/Antworten/iu,
  el:/απαντήσεις/iu,en:/answers/iu,es:/respuestas/iu,fi:/vastaukset/iu,
  fil:/sagot/iu,fr:/réponses/iu,he:/תשובות/u,hr:/odgovori/iu,hu:/válaszok/iu,
  id:/jawaban/iu,it:/risposte/iu,ja:/解数/u,ms:/jawapan/iu,nb:/svar/iu,
  nl:/antwoorden/iu,pl:/odpowiedzi/iu,pt:/respostas/iu,ro:/răspunsuri/iu,
  sk:/odpovede/iu,sr:/одговори/iu,sv:/svar/iu,th:/คำตอบ/u,tr:/cevaplar/iu,
  uk:/відповіді/iu,vi:/trả lời/iu,
 };
 assert.deepEqual(Object.keys(answerWords).sort(),[...locales].sort());
 for(const locale of locales){
  const insights=read('word',locale).results.score.insights;
  assert.match(insights.correct,answerWords[locale],`${locale}: correct answers`);
  assert.match(insights.missed,answerWords[locale],`${locale}: incorrect answers`);
 }
});

test('Word pre-result checks describe checked answers, not network connections',()=>{
 const connectionFalseFriends=/الاتصالات|връзки|forbindelser|Verbindungen|συνδέσεις|conexiones|koneksyon|connexions|חיבורים|veza|csatlakozás|koneksi|connessioni|接続|sambungan|aansluitingen|połączeń|conexões|conexiuni|веза|anslutningar|การเชื่อมต่อ|bağlantı|зв'язків/iu;
 for(const locale of locales){
  const checks=read('word',locale).career.stages['stage-1'].preAdChecks;
  assert.match(checks[0],/10/,locale);
  assert.doesNotMatch(checks[0],connectionFalseFriends,locale);
  assert.doesNotMatch(checks[1],/الجمعيات|foreningstyper|persatuan|föreningstyper/iu,locale);
 }
});

test('Word keystone questions do not reveal the arch answer in the prompt',()=>{
 const reviewed:Record<string,{prompt:RegExp;answer:string;leak:RegExp}>={
  fr:{prompt:/CLÉ DE VOÛTE/,answer:'Arc',leak:/\bARC\b/iu},
  es:{prompt:/DOVELA CENTRAL/,answer:'Arco',leak:/\bARCO\b/iu},
  he:{prompt:/אבן הראשה/u,answer:'קֶשֶׁת',leak:/קשת/u},
  fil:{prompt:/BATONG PANGSARA/,answer:'Arko',leak:/ARKO/iu},
  ja:{prompt:/要石/u,answer:'アーチ',leak:/アーチ/u},
  vi:{prompt:/ĐÁ KHÓA/u,answer:'Vòm',leak:/VÒM/iu},
 };
 for(const [locale,expected] of Object.entries(reviewed)){
  const item=question('word',locale,'word-q8');
  assert.match(item.question,expected.prompt,locale);
  assert.equal(item.answers.a3,expected.answer,locale);
  assert.doesNotMatch(item.question,expected.leak,locale);
 }
});

test('Word concept headings match the algorithm and keystone questions',()=>{
 const headings:Record<string,string>={
  ar:'المفاهيم والعلاقات',cs:'POJMY A SOUVISLOSTI',da:'BEGREBER OG SAMMENHÆNGE',
  el:'ΕΝΝΟΙΕΣ ΚΑΙ ΣΥΝΔΕΣΕΙΣ',en:'CONCEPTS AND CONNECTIONS',
  fi:'KÄSITTEET JA YHTEYDET',sv:'BEGREPP OCH SAMBAND',th:'แนวคิดและความเชื่อมโยง',
 };
 for(const [locale,expected] of Object.entries(headings)){
  assert.equal(question('word',locale,'word-q7').headerLabel,expected,locale);
  assert.equal(question('word',locale,'word-q8').headerLabel,expected,locale);
 }
});

test('Czech homophone clue uses the attested Czech term and Word choices use consistent case',()=>{
 const item=question('word','cs','word-q9');
 assert.match(item.question,/HOMOFON/);
 assert.doesNotMatch(item.question,/HOMOFONUM/);
 assert.equal(item.answers.a1,'Zvuk');
 assert.equal(read('word','quiz').structure.questions['word-q9'].correctAnswerId,'a1');
 assert.equal(question('word','cs','word-q7').answers.a3,'Hrom');
 assert.equal(question('word','ro','word-q7').answers.a4,'Catifea');
});

test('reviewed Word geography clues do not contain their islands answers',()=>{
 const reviewed:Record<string,{prompt:RegExp;answer:string;leak:RegExp}>={
  cs:{prompt:/ARCHIPEL/,answer:'Ostrovy',leak:/OSTROV/iu},
  id:{prompt:/ARSIPELAGO/,answer:'Pulau-pulau',leak:/PULAU/iu},
 };
 for(const [locale,expected] of Object.entries(reviewed)){
  const item=question('word',locale,'word-q5');
  assert.match(item.question,expected.prompt,locale);
  assert.equal(item.answers.a2,expected.answer,locale);
  assert.doesNotMatch(item.question,expected.leak,locale);
 }
});

test('IQ letter-shift code word and answers remain aligned in every locale',()=>{
 const expected=Array.from('DOG').map((letter,index)=>String.fromCharCode(letter.charCodeAt(0)+[1,2,1][index])).join('');
 assert.equal(expected,'EQH');
 const source=question('iq','en','iq-s2q2');
 for(const locale of locales){
  const item=question('iq',locale,'iq-s2q2');
  assert.match(item.question,/DOG/,`${locale}: literal code word`);
  assert.match(item.question,/\bA\b/,`${locale}: alphabet start`);
  assert.match(item.question,/\bZ\b/,`${locale}: alphabet end`);
  assert.deepEqual(item.answers,source.answers,`${locale}: answer tokens`);
  assert.equal(item.answers.a1,expected,`${locale}: keyed answer`);
  assert.doesNotMatch(item.question,/βάρδιες|המשמרות|Smjene|Các ca/u,`${locale}: work-shift mistranslation`);
  if(locale!=='en')assert.doesNotMatch(item.question,/How is DOG coded\?/u,`${locale}: English-language leakage`);
 }
});

test('IQ truth puzzle keeps A, B and C aligned with the keyed answer',()=>{
 const keyed='B';
 const statements={A:(truth:{A:boolean;B:boolean;C:boolean})=>!truth.B,B:(truth:{A:boolean;B:boolean;C:boolean})=>!truth.C,C:(truth:{A:boolean;B:boolean;C:boolean})=>!truth.A&&!truth.B};
 const consistent=[];
 for(const A of [false,true])for(const B of [false,true])for(const C of [false,true]){
  const truth={A,B,C};
  if(Number(A)+Number(B)+Number(C)!==1)continue;
  if(Object.entries(statements).every(([speaker,claim])=>truth[speaker as keyof typeof truth]===claim(truth)))consistent.push(truth);
 }
 assert.deepEqual(consistent,[{A:false,B:true,C:false}]);
 for(const locale of locales){
  const item=question('iq',locale,'iq-s4q1');
  assert.equal(item.answers.a1,'A',`${locale}: first answer`);
  assert.equal(item.answers.a2,keyed,`${locale}: keyed answer`);
  assert.equal(item.answers.a3,'C',`${locale}: third answer`);
  assert.match(item.question,/\bA\b/u,`${locale}: speaker A`);
  assert.match(item.question,/\bB\b/u,`${locale}: speaker B`);
  assert.match(item.question,/\bC\b/u,`${locale}: speaker C`);
 }
});

test('IQ spatial movement ends two squares right and localized directions stay distinct',()=>{
 const position={x:0,y:0};
 position.y+=1;
 position.x+=2;
 position.y-=1;
 assert.deepEqual(position,{x:2,y:0});
 const correctedLeft:Record<string,string>={
  ar:'مربعان إلى اليسار',bg:'Два квадрата вляво',cs:'Dvě políčka vlevo',da:'To felter til venstre',
  el:'Δύο τετράγωνα αριστερά',fi:'Kaksi ruutua vasemmalle',fil:'Dalawang parisukat sa kaliwa',
  he:'שני ריבועים שמאלה',hr:'Dva polja ulijevo',hu:'Két mezővel balra',id:'Dua kotak ke kiri',
  ja:'左に2マス',ms:'Dua petak ke kiri',nb:'To ruter til venstre',pl:'Dwa pola w lewo',
  ro:'Două pătrate la stânga',sk:'Dve políčka vľavo',sr:'Два поља лево',sv:'Två rutor till vänster',
  th:'สองช่องทางซ้าย',tr:'Sola iki kare',uk:'Два квадрати ліворуч',vi:'Hai ô vuông bên trái'
 };
 for(const locale of locales){
  const item=question('iq',locale,'iq-s4q4');
  assert.notEqual(item.answers.a1,item.answers.a3,`${locale}: right and left must differ`);
  if(correctedLeft[locale])assert.equal(item.answers.a3,correctedLeft[locale],`${locale}: left distractor`);
 }
});

test('IQ mirrored-arrow choices name directions rather than correctness',()=>{
 const correctedRight:Record<string,string>={
  bg:'Надясно',cs:'Vpravo',el:'Δεξιά',fi:'Oikealle',fil:'Pakanan',hr:'Desno',
  hu:'Jobbra',id:'Kanan',ms:'Kanan',pl:'W prawo',ro:'Dreapta',sk:'Vpravo',
  sr:'Десно',sv:'Höger',th:'ขวา',uk:'Праворуч',vi:'Phải'
 };
 const directionAfterClockwiseTurn='right';
 const directionAfterVerticalReflection=directionAfterClockwiseTurn==='right'?'left':'right';
 assert.equal(directionAfterVerticalReflection,'left');
 for(const locale of locales){
  const item=question('iq',locale,'iq-s5q8');
  assert.notEqual(item.answers.a2,item.answers.a4,`${locale}: right and left must differ`);
  if(correctedRight[locale])assert.equal(item.answers.a2,correctedRight[locale],`${locale}: right distractor`);
 }
});

test('IQ first mirror puzzle preserves its literal arrows and descriptive mirror label',()=>{
 const expectedAnswers={a1:'↘',a2:'↗',a3:'↖',a4:'↙'};
 for(const locale of locales){
  const item=question('iq',locale,'iq-s1q4');
  assert.equal(item.visual.items[0],'↗',`${locale}: source arrow`);
  assert.deepEqual(item.answers,expectedAnswers,`${locale}: reflected arrow remains a3`);
  assert.ok(item.visual.items[1].startsWith('│ '),`${locale}: mirror separator`);
 }
 assert.equal(question('iq','sr','iq-s1q4').visual.items[1],'│ ОГЛЕДАЛО');
 assert.equal(question('iq','ro','iq-s1q4').visual.items[1],'│ OGLINDĂ');
 for(const locale of ['ar','hu','nl','ro'])assert.doesNotMatch(question('iq',locale,'iq-s1q4').visual.ariaLabel,/^(?:السهم إلى اليمين|felfelé mutató nyíl|pijl-omhoog|săgeată în sus,)/u,locale);
 assert.match(question('iq','he','iq-s3q4').question,/תו אחד/);
});

test('IQ numeric puzzles preserve their calculations and positional row labels',()=>{
 assert.equal(3+5,8);
 assert.equal(5+4,9);
 assert.equal(8+9,17);
 assert.equal(2*7+3,17);
 const pyramidAnswers=question('iq','en','iq-s2q6').answers;
 const rowsAnswers=question('iq','en','iq-s5q2').answers;
 for(const locale of locales){
  const pyramid=question('iq',locale,'iq-s2q6');
  const rows=question('iq',locale,'iq-s5q2');
  assert.deepEqual(pyramid.answers,pyramidAnswers,`${locale}: pyramid answers`);
  assert.deepEqual(rows.answers,rowsAnswers,`${locale}: row-rule answers`);
  assert.match(pyramid.visual.items[0],/\?/u,`${locale}: top unknown`);
  assert.match(pyramid.visual.items[1],/8.*9/u,`${locale}: middle values`);
  assert.match(pyramid.visual.items[2],/3.*5.*4/u,`${locale}: bottom values`);
  assert.deepEqual(rows.visual.items,['3 · 4 · 10','5 · 2 · 12','7 · 3 · ?'],`${locale}: row rule`);
  if(locale!=='en')assert.doesNotMatch(pyramid.visual.items.join(' '),/EN İYİ|PRINCIPAL|TRUNG BÌNH|قبو|\bBONN\b|\bTOP\b|\bMIDDLE\b/u,`${locale}: false-friend row labels`);
 }
 assert.equal(pyramidAnswers.a3,'17');
 assert.equal(rowsAnswers.a1,'17');
});

test('ADHD self-check keeps onset, setting and non-diagnostic safeguards in every locale',()=>{
 for(const locale of locales){
  const copy=read('adhd',locale);
  const onset=question('adhd',locale,'adhd-q9');
  const impact=question('adhd',locale,'adhd-q10');
  assert.match(onset.answers.a4,/12/u,`${locale}: childhood onset age`);
  assert.ok(onset.answers.a2.trim().length>15,`${locale}: childhood attention option`);
  assert.ok(onset.answers.a3.trim().length>15,`${locale}: childhood restlessness option`);
  assert.notEqual(impact.answers.a2,impact.answers.a4,`${locale}: one versus multiple settings`);
  assert.notEqual(impact.answers.a3,impact.answers.a4,`${locale}: one versus multiple settings`);
  assert.ok(copy.about.disclaimer.trim().length>100,`${locale}: safety disclaimer`);
  assert.ok(copy.results.profiles['profile-4'].copy.trim().length>100,`${locale}: non-diagnostic result context`);
 }
 assert.equal(read('adhd','es').landing.intro,'10 preguntas rápidas. Situaciones cotidianas.\n¿Con cuántas te identificas?');
 assert.equal(read('adhd','it').landing.intro,'10 domande rapide. Situazioni quotidiane.\nIn quante ti riconosci?');
});

test('Portugal neurodevelopmental self-checks use PHDA consistently without a Brazil/Portugal acronym slash',()=>{
 for(const quiz of ['adhd','autism']){
  const copy=read(quiz,'pt');
  const journey=[copy.about.body,copy.about.disclaimer,...Object.values(copy.results.profiles).map((profile:any)=>profile.copy)].join(' ');
  assert.match(journey,/PHDA/u,quiz);
  assert.doesNotMatch(journey,/TDAH/iu,quiz);
  assert.match(copy.about.disclaimer,/não é um teste de diagnóstico/iu,quiz);
  assert.match(copy.about.disclaimer,/não substitui uma avaliação profissional/iu,quiz);
 }
});

test('Word palindrome question has exactly one valid answer in every locale',()=>{
 const segmenter=new Intl.Segmenter(undefined,{granularity:'grapheme'});
 for(const locale of locales){
  const item=question('word',locale,'word-q10');
  const palindromeIds=Object.entries(item.answers)
   .filter(([,answer])=>{
    const letters=Array.from(segmenter.segment(String(answer).normalize('NFC').toLocaleLowerCase()),part=>part.segment);
    return letters.join('')===letters.slice().reverse().join('');
   })
   .map(([id])=>id);
  assert.deepEqual(palindromeIds,['a2'],`${locale}: exactly one palindrome, matching the answer key`);
 }
});

test('Filipino Word associations use native answer words and a phrase-compatible tide prompt',()=>{
 const ocean=question('word','fil','word-q1');
 const algorithm=question('word','fil','word-q7');
 assert.match(ocean.question,/Aling sagot/u);
 assert.equal(ocean.answers.a2,'Pagtaas at pagbaba ng tubig-dagat');
 assert.equal(algorithm.answers.a2,'Kanvas');
 assert.equal(algorithm.answers.a4,'Pelus');
 assert.equal(algorithm.headerLabel,'LOHIKA AT TEKNOLOHIYA');
});

test('Spanish Grammar keeps the native pronoun rule after entre',()=>{
 const item=question('grammar','es','grammar-r5q4');
 assert.equal(item.context,'Esta decisión debe quedar entre Lina y ___.');
 assert.equal(item.answers.a1,'mí');
 assert.equal(item.answers.a2,'yo');
 assert.equal(read('grammar','quiz').structure.questions['grammar-r5q4'].correctAnswerId,'a1');
});

test('Malay Teacher overview and result labels follow the current non-country-specific quiz',()=>{
 const quiz=read('teacher','ms');
 assert.match(quiz.about.body,/tidak bergantung pada kurikulum/);
 assert.doesNotMatch(quiz.about.body,/Tahap 1/);
 assert.equal(quiz.results.profiles['profile-4'].title,'Calon Berpotensi');
 assert.equal(quiz.results.score.trickiest,'Bidang pengajaran yang paling mencabar');
 for(const locale of ['da','ro','hr','fil','ja','hu']){
  const body=read('teacher',locale).about.body;
  assert.doesNotMatch(body,/Tier 1|niveau 1|nivel 1|英語圏/,`${locale}: stale country-scope claim`);
  assert.ok(body.includes('\n\n'),`${locale}: overview paragraphs`);
 }
});

test('French Teacher results do not turn safeguarding into data backup or a quiz into an official exam',()=>{
 const quiz=read('teacher','fr');
 assert.equal(quiz.results.dimensions['dimension-4'].label,'Protection des élèves');
 assert.doesNotMatch(quiz.about.disclaimer,/sauvegarde|examen accrédité/i);
 assert.match(quiz.results.score.passed,/défi pédagogique/);
 assert.equal(quiz.results.profiles['profile-4'].tier,'40–59%');
});

test('Spanish Teacher results use consistent address and clear pupil-protection terminology',()=>{
 const quiz=read('teacher','es');
 assert.equal(quiz.results.dimensions['dimension-4'].label,'Protección del alumnado');
 assert.doesNotMatch(quiz.results.profiles['profile-3'].copy,/\bReconoció\b|\bSu revisión\b/);
 assert.match(quiz.about.disclaimer,/sigue las normas aplicables/);
 assert.equal(quiz.results.profiles['profile-3'].tier,'60–79%');
});

test('Police witness-separation distractor refers to witness accounts in every locale',()=>{
 const witness:Record<string,RegExp>={
  ar:/إفادات الشهود/,bg:/свидетелски показания/,cs:/svědecké výpovědi/,da:/vidneforklaringer/,
  de:/Zeugenaussagen/,el:/καταθέσεις των μαρτύρων/,en:/witness account/,es:/declaraciones de los testigos/,
  fi:/todistajien kertomukset/,fil:/salaysay ng mga saksi/,fr:/témoignages/,he:/עדויות העדים/,
  hr:/iskazi svjedoka/,hu:/tanúvallomás/,id:/keterangan saksi/,it:/testimonianze/,ja:/証言/,
  ms:/kenyataan saksi/,nb:/vitneforklaringene/,nl:/getuigenverklaringen/,pl:/zeznania świadków/,
  pt:/depoimentos das testemunhas/,ro:/declarațiile martorilor/,sk:/svedecké výpovede/,
  sr:/искази сведока/,sv:/vittnesmål/,th:/คำให้การของพยาน/,tr:/tanık ifadeleri/,
  uk:/свідчення очевидців/,vi:/lời khai của mọi nhân chứng/
 };
 for(const locale of locales){
  const item=question('police',locale,'police-q3');
  assert.match(item.answers.a4,witness[locale],locale);
  assert.equal(read('police','quiz').structure.questions['police-q3'].correctAnswerId,'a3');
 }
});

test('Firefighter fire triangle distractors remain ash and smoke rather than trees or smoking',()=>{
 const ash:Record<string,string>={cs:'Popel',fi:'Tuhka',fil:'Abo',hu:'Hamu',ro:'Cenușă',sk:'Popol',sr:'Пепео',th:'เถ้าถ่าน',uk:'Попіл'};
 for(const[locale,value]of Object.entries(ash)){
  const item=question('firefighter',locale,'firefighter-s1q1');
  assert.equal(item.answers.a4,value,locale);
  assert.equal(read('firefighter','quiz').structure.questions['firefighter-s1q1'].correctAnswerId,'a2');
 }
 for(const[locale,value]of Object.entries({hu:'Füst',sr:'Дим',th:'ควัน'})){
  assert.equal(question('firefighter',locale,'firefighter-s1q1').answers.a3,value,locale);
 }
});

test('Nursing oxygen question asks what blood takes up in the lungs',()=>{
 const lung:Record<string,RegExp>={ar:/يلتقطه الدم.*بالرئتين/,cs:/krev.*plíc/i,fi:/veri.*keuhko/i,
  he:/הדם קולט.*בריאות/,ms:/darah.*paru-paru/i,sk:/krv.*pľúc/i,th:/เลือด.*ปอด/,vi:/phổi.*máu/i};
 for(const[locale,pattern]of Object.entries(lung)){
  const item=question('nursing',locale,'nurse-r1q1');
  assert.match(item.question,pattern,locale);
  assert.equal(read('nursing','quiz').structure.questions['nurse-r1q1'].correctAnswerId,'a2');
 }
 assert.equal(question('nursing','fi','nurse-r1q1').question,'Mitä kaasua veri ottaa mukaansa kulkiessaan keuhkojen läpi?');
 assert.equal(question('nursing','vi','nurse-r1q1').question,'Khi đi qua phổi, máu hấp thụ khí nào?');
});

test('translated Grammar punctuation distractor does not rely on English comma-splice rules',()=>{
 for(const locale of locales.filter((code)=>!['en','ar','ja','th'].includes(code))){
  const item=question('grammar',locale,'grammar-r4q3');
  assert.match(item.answers.a3,/[;·]/u,locale);
  assert.notEqual(item.answers.a3,item.answers.a2,locale);
  assert.equal(read('grammar','quiz').structure.questions['grammar-r4q3'].correctAnswerId,'a2');
 }
});

test('Anatomy reviewed organ distractors and Portugal spelling keep their intended meanings',()=>{
 assert.equal(question('anatomy','fil','anatomy-q8').answers.a1,'Kordon ng gulugod');
 assert.equal(question('anatomy','fil','anatomy-q10').answers.a3,'Sikmura');
 assert.equal(question('anatomy','pt','anatomy-q3').answers.a3,'Fémur');
 assert.equal(question('anatomy','pt','anatomy-q9').answers.a4,'Vénulas');
 assert.equal(read('anatomy','quiz').structure.questions['anatomy-q10'].correctAnswerId,'a2');
});

test('Mechanic reviewed translations preserve an unlit bulb, coolant concentrate and jack safety',()=>{
 const bulb:Record<string,RegExp>={fil:/bombilyang hindi umiilaw/,ms:/Mentol yang tidak menyala/,
  nb:/Pæren som ikke lyser/,ro:/Becul care nu se aprinde/,th:/หลอดไฟที่ไม่ติด/,
  tr:/Yanmayan ampul/,uk:/Лампочка, що не світиться/,vi:/Bóng đèn không sáng/};
 for(const[locale,pattern]of Object.entries(bulb)){
  assert.match(question('mechanic',locale,'mechanic-r3q3').answers.a1,pattern,locale);
  assert.equal(read('mechanic','quiz').structure.questions['mechanic-r3q3'].correctAnswerId,'a2');
 }
 for(const[locale,pattern]of Object.entries({nb:/konsentrat/,sv:/koncentrat/,th:/หัวเชื้อ/})){
  assert.match(question('mechanic',locale,'mechanic-r3q4').question,pattern,locale);
 }
 for(const[locale,pattern]of Object.entries({ro:/cric portabil/,sr:/преносивом дизалицом/,th:/แม่แรงแบบพกพา/,tr:/taşınabilir bir krikoyla/,vi:/kích nâng di động/})){
  const item=question('mechanic',locale,'mechanic-r5q6');
  assert.match(item.question,pattern,locale);
  assert.equal(read('mechanic','quiz').structure.questions['mechanic-r5q6'].correctAnswerId,'a1');
 }
});

test('Treatments finale asks for a therapy when the correct answer names a therapy',()=>{
 const therapy:Record<string,RegExp>={
  ar:/العلاج/,bg:/терапия/,cs:/terapii/,el:/θεραπεία/,en:/Which therapy/,
  fi:/terapiasta/,fil:/uri ng therapy/,he:/טיפול/,hr:/terapiji/,
  hu:/terápiáról/,id:/Terapi/,ja:/療法/,ms:/Terapi/,pl:/terapię/,
  ro:/terapie/,sk:/terapiu/,sr:/терапији/,th:/การบำบัด/,tr:/terapi/,uk:/терапію/,vi:/liệu pháp/
 };
 for(const[locale,pattern]of Object.entries(therapy)){
  const item=question('treatments',locale,'treatments-r5q2');
  assert.match(item.question,pattern,locale);
  assert.equal(read('treatments','quiz').structure.questions['treatments-r5q2'].correctAnswerId,'a1');
 }
});

test('Pilot reviewed aviation terms retain cockpit, wind shear and fuel-quantity meaning',()=>{
 assert.match(question('pilot','fil','pilot-q2').question,/kokpit/);
 assert.match(question('pilot','hu','pilot-q8').question,/szélnyírás/);
 assert.match(question('pilot','nl','pilot-q10').question,/brandstofhoeveelheid tussen de tanks/);
 assert.equal(question('pilot','fi','pilot-q5').headerLabel,'LENTOPÄÄTÖS');
 assert.equal(question('pilot','fi','pilot-q10').headerLabel,'VIIMEINEN OHJAAMOKYSYMYS');
 for(const locale of locales){
  assert.equal(read('pilot','quiz').structure.questions['pilot-q4'].correctAnswerId,'a4');
  assert.equal(read('pilot','quiz').structure.questions['pilot-q9'].correctAnswerId,'a1');
  const heading=question('pilot',locale,'pilot-q4');
  const runway=question('pilot',locale,'pilot-q9');
  assert.notEqual(heading.answers.a4,heading.answers.a1,locale);
  assert.notEqual(runway.answers.a1,runway.answers.a2,locale);
 }
});

test('Surgeon reviewed safety answers retain distinct contamination, infection and resuscitation',()=>{
 assert.equal(question('surgeon','fr','surgeon-q1').answers.a1,"Elle transporte le sang en l'éloignant du cœur");
 assert.match(question('surgeon','el','surgeon-q2').answers.a2,/επιμόλυνσης.*λοίμωξης/);
 assert.match(question('surgeon','vi','surgeon-q9').answers.a1,/Gọi cấp cứu.*hồi sức cơ bản/);
 assert.match(question('surgeon','fi','surgeon-q9').answers.a1,/hätänumeroon.*peruselvytystoimet/);
 assert.equal(read('surgeon','quiz').structure.questions['surgeon-q9'].correctAnswerId,'a1');
});

test('Flight Attendant safety questions retain turbulence, decompression and crew coordination',()=>{
 assert.match(question('flightattendant','th','flightattendant-q2').question,/เครื่องบิน.*(?:ตกหลุมอากาศ|ความปั่นป่วน)รุนแรง/);
 assert.match(question('flightattendant','th','flightattendant-q3').question,/ความดันในห้องโดยสารลดลง/);
 assert.match(question('flightattendant','vi','flightattendant-q2').question,/khoang hành khách/);
 for(const locale of ['cs','hu','id','it','pl']){
  const item=question('flightattendant',locale,'flightattendant-q6');
  assert.ok(item.question.length>30,locale);
  assert.equal(read('flightattendant','quiz').structure.questions['flightattendant-q6'].correctAnswerId,'a2');
 }
});

test('RAF historical distractors keep manufacturer and motto identities',()=>{
 for(const locale of ['cs','da','de','en','es','fi','fil','fr','hr','hu','id','it','ms','nb','nl','pl','pt','ro','sk','sr','sv','tr','vi']){
  assert.equal(question('raf',locale,'raf-q9').answers.a4,'Handley Page',locale);
 }
 for(const locale of ['cs','pl','pt','sk']){
  assert.equal(question('raf',locale,'raf-q4').answers.a1,'Semper Fidelis',locale);
  assert.equal(read('raf','quiz').structure.questions['raf-q4'].correctAnswerId,'a4');
 }
 assert.match(question('raf','th','raf-q1').question,/กองทัพอากาศสหราชอาณาจักร/);
 assert.match(question('raf','fil','raf-q5').answers.a2,/Royal Navy/);
});

test('Medical reviewed options distinguish viral replication and sympathetic nerves',()=>{
 assert.match(question('medical','fil','medical-q4').answers.a4,/selula ng host.*dumami/);
 assert.match(question('medical','th','medical-q4').answers.a4,/เซลล์เจ้าบ้าน.*เพิ่มจำนวน/);
 assert.equal(question('medical','ar','medical-q6').answers.a1,'الجهاز العصبي الودي');
 assert.equal(question('medical','ar','medical-q6').answers.a2,'الجهاز العصبي نظير الودي');
 assert.equal(read('medical','quiz').structure.questions['medical-q6'].correctAnswerId,'a2');
 assert.match(question('medical','da','medical-q8').answers.a1,/Vagusnerven/);
 assert.match(question('medical','nb','medical-q8').answers.a1,/Vagusnerven/);
});

test('Dentist reviewed tooth and anatomical distractors do not create second correct answers',()=>{
 const finnish=question('dentist','fi','dentist-q3');
 assert.equal(finnish.answers.a1,'Poskihampaat');
 assert.equal(finnish.answers.a3,'Etuhampaat');
 assert.equal(read('dentist','quiz').structure.questions['dentist-q3'].correctAnswerId,'a3');
 assert.equal(question('dentist','fil','dentist-q8').answers.a2,'Siwang sa pagitan ng gilagid at ngipin');
 for(const[locale,pattern]of Object.entries({he:/עצם הרקה/,id:/Tulang pelipis/,tr:/Şakak kemiği/})){
  assert.match(question('dentist',locale,'dentist-q9').answers.a4,pattern,locale);
 }
});

test('Motorbike visibility and passenger questions retain their road-safety meaning',()=>{
 const visibility:Record<string,RegExp>={el:/να μην προσέξει τη μοτοσικλέτα/,fi:/ei huomaa moottoripyörää/,fil:/hindi mapansin.*motorsiklo/};
 for(const[locale,pattern]of Object.entries(visibility)){
  assert.match(question('motorbike',locale,'motorbike-q5').question,pattern,locale);
  assert.equal(read('motorbike','quiz').structure.questions['motorbike-q5'].correctAnswerId,'a1');
 }
 assert.match(question('motorbike','tr','motorbike-q6').question,/sürücüsü yolcu taşırken/);
 assert.match(question('motorbike','fi','motorbike-q9').question,/voimansiirtoketjun/);
 assert.match(question('motorbike','he','motorbike-q5').answers.a1,/שטחים מתים/);
 const portuguese=question('motorbike','pt','motorbike-q4');
 assert.match(portuguese.question,/travar de emergência/);
 assert.equal(portuguese.answers.a4,'Aplicar progressivamente ambos os travões, mantendo a moto estável');
 assert.doesNotMatch(Object.values(portuguese.answers).join(' '),/comandos de desaceleração/);
});
