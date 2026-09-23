// Avoid physical/cosmetic "foundations", workplace systems and literal "case rooms".
export const contextualHeadings={
 ar:['أساسيات جسم الإنسان','كيف تعمل أجهزة الجسم','الترابط بين أجزاء الجسم','تحليل الحالات'],
 bg:['Основи на човешкото тяло','Как работят системите в тялото','Връзки в анатомията','Анализ на казуси'],
 cs:['Základy lidského těla','Jak fungují tělesné soustavy','Anatomické souvislosti','Rozbor případů'],
 da:['Kroppens grundlæggende opbygning','Sådan arbejder kroppens systemer','Anatomiske sammenhænge','Analyse af cases'],
 de:['Grundlagen des menschlichen Körpers','Körpersysteme in Aktion','Anatomische Zusammenhänge','Fallanalyse'],
 el:['Βασικές γνώσεις για το σώμα','Πώς λειτουργούν τα συστήματα του σώματος','Συνδέσεις στην ανατομία','Ανάλυση περιπτώσεων'],
 es:['Fundamentos del cuerpo humano','Cómo funcionan los sistemas del cuerpo','Relaciones anatómicas','Análisis de casos'],
 fi:['Ihmiskehon perusteet','Elimistön järjestelmät toiminnassa','Anatomiset yhteydet','Tapausanalyysi'],
 fil:['Mga Batayan ng Katawan','Paano Gumagana ang mga Sistema ng Katawan','Mga Ugnayan sa Anatomya','Pagsusuri ng mga Kaso'],
 fr:['Les bases du corps humain','Les systèmes du corps en action','Les liens en anatomie','Analyse de cas'],
 he:['יסודות גוף האדם','מערכות הגוף בפעולה','קשרים באנטומיה','ניתוח מקרים'],
 hr:['Osnove ljudskog tijela','Kako rade sustavi u tijelu','Anatomske povezanosti','Analiza slučajeva'],
 hu:['Az emberi test alapjai','A szervrendszerek működése','Anatómiai összefüggések','Esetelemzés'],
 id:['Dasar-Dasar Tubuh Manusia','Cara Kerja Sistem Tubuh','Keterkaitan Anatomi','Analisis Kasus'],
 it:['Le basi del corpo umano','I sistemi del corpo in azione','Collegamenti anatomici','Analisi di casi'],
 ja:['人体の基礎','体のシステムの働き','体の各部のつながり','事例分析'],
 ms:['Asas Tubuh Manusia','Cara Sistem Badan Berfungsi','Hubungan dalam Anatomi','Analisis Kes'],
 nb:['Grunnleggende om kroppen','Slik virker kroppens systemer','Anatomiske sammenhenger','Analyse av eksempler'],
 nl:['De basis van het menselijk lichaam','Lichaamssystemen in actie','Anatomische verbanden','Casusanalyse'],
 pl:['Podstawy budowy ciała','Jak działają układy organizmu','Zależności w anatomii','Analiza przypadków'],
 pt:['Fundamentos do corpo humano','Os sistemas do corpo em ação','Relações anatómicas','Análise de casos'],
 ro:['Noțiuni de bază despre corp','Cum funcționează sistemele corpului','Legături anatomice','Analiza cazurilor'],
 sk:['Základy ľudského tela','Ako fungujú telesné sústavy','Anatomické súvislosti','Rozbor prípadov'],
 sr:['Основе људског тела','Како раде системи у телу','Анатомске повезаности','Анализа случајева'],
 sv:['Grunderna i människokroppen','Så fungerar kroppens system','Anatomiska samband','Fallanalys'],
 th:['พื้นฐานร่างกายมนุษย์','ระบบต่าง ๆ ของร่างกายทำงานอย่างไร','ความสัมพันธ์ทางกายวิภาค','วิเคราะห์กรณีศึกษา'],
 tr:['İnsan Vücudunun Temelleri','Vücut Sistemleri Nasıl Çalışır?','Anatomik İlişkiler','Vaka Analizi'],
 uk:['Основи будови тіла','Як працюють системи організму','Анатомічні зв’язки','Аналіз випадків'],
 vi:['Kiến thức cơ bản về cơ thể','Các hệ cơ quan hoạt động ra sao','Mối liên hệ trong giải phẫu','Phân tích tình huống'],
};
export function proofreadHeadings(slug,locale,c){
 const titles=contextualHeadings[locale];
 const changes=slug==='anatomy'?[[1,titles[0]],[4,titles[1]],[5,titles[2]]]:slug==='harvard'?[[4,titles[3]]]:[];
 for(const[n,title]of changes){
  const stage=c.stages[`stage-${n}`],old=stage.title;
  stage.title=title;c.career.stages[`stage-${n}`].difficulty=title;
  for(const[id,q]of Object.entries(stage.questions))if(id.includes('-new')||q.headerLabel?.toLocaleLowerCase(locale)===old.toLocaleLowerCase(locale))q.headerLabel=title;
 }
 if(slug==='dentist'&&locale==='fi'){
  c.stages['stage-2'].title='Kasvu ja tukikudokset';c.career.stages['stage-2'].difficulty='Kasvu ja tukikudokset';
  for(const[id,q]of Object.entries(c.stages['stage-2'].questions))if(id.includes('-new'))q.headerLabel='Kasvu ja tukikudokset';
 }
 if(slug==='nursing'&&locale==='ja'){
  c.stages['stage-2'].title='身体と観察';c.career.stages['stage-2'].difficulty='身体と観察';
  for(const q of Object.values(c.stages['stage-2'].questions))if(q.headerLabel==='実体と観察')q.headerLabel='身体と観察';
 }
}
