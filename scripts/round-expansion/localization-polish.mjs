import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {requested,baseline} from './config.mjs';
import {bibleBooks} from './bible-book-names.mjs';
import {polishText} from './native-polish.mjs';
import {portablePuzzles} from './localization-adaptations.mjs';
import {rafRankQuestions} from './raf-rank-questions.mjs';
import {semanticPolish} from './semantic-copy.mjs';
import {proofreadCopy} from './proofreading-copy.mjs';
import {checkpointLabels,personalityReveal} from './checkpoint-labels.mjs';

// Short, reusable checkpoint copy. Avoid translating “complete” as physical construction
// or “breakdown” as mechanical failure, and keep the same wording across all thirty quizzes.
export const checkpointCopy={
 ar:['اكتملت الجولة','تابع إلى الأسئلة الستة التالية.','اكتملت خمس جولات'],
 bg:['Кръгът е завършен','Продължи със следващите шест въпроса.','Пет завършени кръга'],
 cs:['Kolo dokončeno','Pokračujte dalšími šesti otázkami.','Pět dokončených kol'],
 da:['Runden er gennemført','Fortsæt med de næste seks spørgsmål.','Fem runder gennemført'],
 de:['Runde abgeschlossen','Weiter geht es mit den nächsten sechs Fragen.','Fünf Runden abgeschlossen'],
 el:['Ο γύρος ολοκληρώθηκε','Συνέχισε με τις επόμενες έξι ερωτήσεις.','Ολοκληρώθηκαν πέντε γύροι'],
 es:['Ronda completada','Continúa con las siguientes seis preguntas.','Cinco rondas completadas'],
 fi:['Kierros suoritettu','Jatka seuraaviin kuuteen kysymykseen.','Viisi kierrosta suoritettu'],
 fil:['Tapos na ang round','Magpatuloy sa susunod na anim na tanong.','Tapos na ang limang round'],
 fr:['Manche terminée','Passez aux six questions suivantes.','Cinq manches terminées'],
 he:['הסבב הושלם','ממשיכים לשש השאלות הבאות.','חמישה סבבים הושלמו'],
 hr:['Krug je završen','Nastavi sa sljedećih šest pitanja.','Završeno je pet krugova'],
 hu:['A forduló véget ért','Folytasd a következő hat kérdéssel.','Öt teljesített forduló'],
 id:['Babak selesai','Lanjutkan ke enam pertanyaan berikutnya.','Lima babak selesai'],
 it:['Round completato','Prosegui con le prossime sei domande.','Cinque round completati'],
 ja:['ラウンドクリア','次の6問に進みましょう。','全5ラウンドをクリア'],
 ms:['Pusingan selesai','Teruskan dengan enam soalan seterusnya.','Lima pusingan selesai'],
 nb:['Runden er fullført','Fortsett med de neste seks spørsmålene.','Fem runder fullført'],
 nl:['Ronde voltooid','Ga verder met de volgende zes vragen.','Vijf rondes voltooid'],
 pl:['Runda ukończona','Przejdź do kolejnych sześciu pytań.','Pięć rund ukończonych'],
 pt:['Ronda concluída','Continue com as próximas seis perguntas.','Cinco rondas concluídas'],
 ro:['Rundă încheiată','Continuă cu următoarele șase întrebări.','Cinci runde încheiate'],
 sk:['Kolo dokončené','Pokračujte ďalšími šiestimi otázkami.','Päť dokončených kôl'],
 sr:['Круг је завршен','Настави са следећих шест питања.','Завршено је пет кругова'],
 sv:['Omgången är klar','Fortsätt med nästa sex frågor.','Fem omgångar genomförda'],
 th:['จบรอบแล้ว','ไปต่อกับคำถามอีก 6 ข้อ','ทำครบทั้ง 5 รอบแล้ว'],
 tr:['Tur tamamlandı','Sonraki altı soruyla devam et.','Beş tur tamamlandı'],
 uk:['Раунд завершено','Переходь до наступних шести запитань.','Завершено п’ять раундів'],
 vi:['Đã hoàn thành vòng này','Tiếp tục với sáu câu hỏi tiếp theo.','Đã hoàn thành năm vòng'],
};
const alphabetIntro={ar:'استخدم الأبجدية الإنجليزية من A إلى Z.',bg:'Използвайте английската азбука A–Z.',cs:'Použijte anglickou abecedu A–Z.',da:'Brug det engelske alfabet A–Z.',de:'Verwenden Sie das englische Alphabet A–Z.',el:'Χρησιμοποιήστε το αγγλικό αλφάβητο A–Z.',es:'Usa el alfabeto inglés de la A a la Z.',fi:'Käytä englannin aakkosia A–Z.',fil:'Gamitin ang alpabetong Ingles mula A hanggang Z.',fr:'Utilisez l’alphabet anglais de A à Z.',he:'השתמשו באלפבית האנגלי A–Z.',hr:'Koristi englesku abecedu A–Z.',hu:'Használd az angol ábécét A-tól Z-ig.',id:'Gunakan alfabet Inggris A–Z.',it:'Usa l’alfabeto inglese dalla A alla Z.',ja:'英語のアルファベット26文字（A〜Z）を使います。',ms:'Gunakan abjad bahasa Inggeris A–Z.',nb:'Bruk det engelske alfabetet A–Z.',nl:'Gebruik het Engelse alfabet van A tot Z.',pl:'Użyj alfabetu angielskiego od A do Z.',pt:'Use o alfabeto inglês de A a Z.',ro:'Folosește alfabetul englez de la A la Z.',sk:'Použite anglickú abecedu A–Z.',sr:'Користи енглески алфабет A–Z.',sv:'Använd det engelska alfabetet A–Z.',th:'ใช้ตัวอักษรภาษาอังกฤษ A–Z',tr:'A’dan Z’ye İngiliz alfabesini kullanın.',uk:'Використовуйте англійський алфавіт A–Z.',vi:'Sử dụng bảng chữ cái tiếng Anh từ A đến Z.'};

function patch(file,value){const old=fs.readFileSync(file,'utf8'),next=JSON.stringify(value,null,2)+'\n';if(old===next)return;execFileSync('apply_patch',[],{input:`*** Begin Patch\n*** Update File: ${file}\n@@\n${old.trimEnd().split('\n').map(x=>'-'+x).join('\n')}\n${next.trimEnd().split('\n').map(x=>'+'+x).join('\n')}\n*** End Patch\n`,stdio:['pipe','pipe','pipe']});}
function tidy(x){if(typeof x==='string')return x.replace(/\u200b/g,'').split('\n').map(s=>s.trim()).join('\n').trim();if(Array.isArray(x))return x.map(tidy);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,tidy(v)]));return x;}
function nativePolish(x,locale){if(typeof x==='string')return polishText(locale,x);if(Array.isArray(x))return x.map(v=>nativePolish(v,locale));if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,nativePolish(v,locale)]));return x;}
const chosen=process.env.LOCALES?.split(',')??Object.keys(checkpointCopy);
for(const locale of chosen){
 const memory=JSON.parse(fs.readFileSync(`data/quizzes/memory/${locale}.json`)),[complete,next,five]=checkpointCopy[locale];
 const shared=JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`)).quiz;
 for(const slug of requested){
  const file=`data/quizzes/${slug}/${locale}.json`,c=tidy(JSON.parse(fs.readFileSync(file)));
  if(Object.keys(c.stages).length!==5)throw Error(`Refusing to polish incomplete draft ${slug}/${locale}`);
  // Reuse the reviewed subject vocabulary from the old ten-question edition.
  // Keep this scoped to the same quiz; do not reuse “pitch”, “charge”, etc. across subjects.
  if(!['grammar','iq','word','personality','bible'].includes(slug)){
   const before=JSON.parse(execFileSync('git',['show',`${baseline}:data/quizzes/${slug}/en.json`]));
   const native=JSON.parse(execFileSync('git',['show',`${baseline}:data/quizzes/${slug}/${locale}.json`]));
   const nativeQuestions=Object.assign({},...Object.values(native.stages).map(s=>s.questions));
   const vocabulary={},conflicts=new Set();
   for(const stage of Object.values(before.stages))for(const[id,q]of Object.entries(stage.questions))for(const[a,text]of Object.entries(q.answers)){
    const value=nativeQuestions[id]?.answers[a];if(!value)continue;
    if(vocabulary[text]&&vocabulary[text]!==value)conflicts.add(text);else vocabulary[text]=value;
   }
   const english=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`));
   for(const[stageId,stage]of Object.entries(english.stages))for(const[id,q]of Object.entries(stage.questions))if(!portablePuzzles[slug]?.[id])for(const[a,text]of Object.entries(q.answers))if(vocabulary[text]&&!conflicts.has(text))c.stages[stageId].questions[id].answers[a]=vocabulary[text];
  }
  c.career.resultProgressLabel=checkpointLabels[locale][0];
  for(let i=1;i<=5;i++){
   const s=c.career.stages[`stage-${i}`];s.difficulty=c.stages[`stage-${i}`].title;
   if(i<5){s.preAdTitle=complete;s.preAdCopy=next;s.next.eyebrow=memory.career.stages['stage-1'].next.eyebrow;s.next.tagline=next;}
   else{s.preAdChecks[0]=memory.career.stages['stage-5'].preAdChecks[0];s.preAdChecks[1]=five;s.preAdButton=checkpointLabels[locale][1];s.preAdTitle=checkpointLabels[locale][2];s.preAdCopy=checkpointLabels[locale][3];s.preAdChecks[2]=checkpointLabels[locale][2];}
  }
  const paragraphs=c.about.body.split(/\n\s*\n/);paragraphs[paragraphs.length-1]=c.about.disclaimer;c.about.body=paragraphs.join('\n\n');
  if(c.results.score?.disclaimer!==undefined)c.results.score.disclaimer=c.about.disclaimer;
  if(locale==='ja'&&slug==='raf'){
   const q=c.stages['stage-1'].questions['raf-round1-new1'];q.question='イギリス空軍が創設されたのは、1918年の何月何日？';q.answers={a1:'4月1日',a2:'1月1日',a3:'11月11日',a4:'12月25日'};
  }
  if(locale==='vi'&&slug==='raf')c.stages['stage-1'].questions['raf-round1-new1'].answers={a1:'Ngày 1 tháng 4',a2:'Ngày 1 tháng 1',a3:'Ngày 11 tháng 11',a4:'Ngày 25 tháng 12'};
  if(slug==='raf'){
   const q=c.stages['stage-3'].questions['raf-round3-new1'];q.question=rafRankQuestions[locale];
   q.answers={a1:'Flying Officer',a2:'Group Captain',a3:'Air Marshal',a4:'Squadron Leader'};
  }
  if(slug==='bible'){
   const originalEn=JSON.parse(execFileSync('git',['show',`${baseline}:data/quizzes/bible/en.json`]));
   const originalNative=JSON.parse(execFileSync('git',['show',`${baseline}:data/quizzes/bible/${locale}.json`]));
   const originalQs=Object.assign({},...Object.values(originalNative.stages).map(s=>s.questions));
   const vocabulary={};
   for(const stage of Object.values(originalEn.stages))for(const[id,q]of Object.entries(stage.questions))for(const[a,text]of Object.entries(q.answers))vocabulary[text]=originalQs[id].answers[a];
   Object.assign(vocabulary,bibleBooks[locale]);
   const english=JSON.parse(fs.readFileSync(`data/quizzes/bible/en.json`));
   for(const[stageId,stage]of Object.entries(english.stages))for(const[id,q]of Object.entries(stage.questions))for(const[a,text]of Object.entries(q.answers))if(vocabulary[text])c.stages[stageId].questions[id].answers[a]=vocabulary[text];
  }
  if(slug==='iq'&&['cs','hu','hr','da','nb','sv'].includes(locale)){
   const q=c.stages['stage-5'].questions['iq-s5q5'];q.visual.items[0]=`${['cs','hu'].includes(locale)?'KÓD':['sv','hr'].includes(locale)?'KOD':'KODE'} · B7Q-4M2-K9`;
  }
  if(slug==='iq'&&locale==='uk')c.stages['stage-1'].questions['iq-s1q3'].answers={a1:'Ніч',a2:'Ранок',a3:'Полудень',a4:'Післяобідній час'};
  if(slug==='iq')for(const [stage,id]of [['stage-2','iq-s2q2'],['stage-4','iq-s4q2']]){
   const q=c.stages[stage].questions[id];if(!q.question.startsWith(alphabetIntro[locale]))q.question=`${alphabetIntro[locale]} ${q.question}`;
  }
  if(slug==='police'){
   const source=JSON.parse(fs.readFileSync('data/quizzes/police/en.json'));
   for(const [stageId,stage]of Object.entries(source.stages))for(const[id,q]of Object.entries(stage.questions))if(['police-q6','police-round3-new3','police-round3-new4'].includes(id))c.stages[stageId].questions[id].answers=q.answers;
  }
  if(slug==='airforce'&&locale==='nl')c.stages['stage-4'].questions['airforce-round4-new2'].question='Wat is de koorde van een vleugelprofiel?';
  if(slug==='anatomy'&&locale==='de')c.stages['stage-1'].questions['anatomy-round1-new3'].answers.a4='Zwerchfell';
  if(slug==='anatomy'&&locale==='fr')c.stages['stage-5'].questions['anatomy-round5-new3'].answers.a1='Radius';
  if(slug==='dentist'&&locale==='th')c.stages['stage-1'].questions['dentist-round1-new3'].answers={a1:'ฟันกราม',a2:'ฟันตัด',a3:'ฟันเขี้ยว',a4:'ฟันน้ำนมเท่านั้น'};
  if(slug==='dentist'&&locale==='fi')c.stages['stage-1'].questions['dentist-round1-new3'].answers={a1:'Poskihampaat',a2:'Etuhampaat',a3:'Kulmahampaat',a4:'Vain maitohampaat'};
  if(slug==='chef'&&locale==='ms')c.stages['stage-1'].questions['chef-r1q3'].answers={a1:'Mengukus di atas air panas',a2:'Memanggang dengan udara panas di dalam ketuhar',a3:'Membakar di atas haba langsung',a4:'Menumis dengan sedikit minyak panas'};
  if(slug==='chef'&&locale==='uk')c.stages['stage-4'].questions['chef-r8q5'].question='Кожна з трьох порцій важить 175 г. Яка їхня загальна маса?';
  const polished=tidy(proofreadCopy(slug,locale,semanticPolish(slug,locale,nativePolish(c,locale)),JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`))));polished.title=c.title;
  if(slug==='personality'&&personalityReveal[locale])polished.career.stages['stage-5'].preAdButton=personalityReveal[locale];
  if(polished.career.stages['stage-5'].preAdButton===shared.revealMyResults)delete polished.career.stages['stage-5'].preAdButton;
  patch(file,polished);
 }
 console.log(`${locale}: shared checkpoint copy, reviewed disclaimers and whitespace polished`);
}
