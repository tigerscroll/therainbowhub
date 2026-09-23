// Reviewed content migration. Emits apply_patch input; never writes quiz files.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {baseline,historical,titles,subtitles,requested} from './config.mjs';
const root=process.cwd(),slug=process.argv[2];
if(!requested.includes(slug))throw Error('Unknown requested quiz');
const currentManifest=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/quiz.json`));
if(currentManifest.template==='five-stage-six-question-v1'&&currentManifest.engine.localeParity==='strict'&&currentManifest.activeLocales?.length>1){
 throw Error('This bootstrap migration is complete. Edit reviewed source directly and revalidate; do not reset activated locale packs.');
}
const git=(ref,file)=>JSON.parse(execFileSync('git',['show',`${ref}:data/quizzes/${slug}/${file}`],{maxBuffer:20e6}));
const original=git(baseline,'quiz.json'),originalCopy=git(baseline,'en.json');
const m=structuredClone(original),e=structuredClone(originalCopy);
const oldCopies=Object.fromEntries(Object.values(e.stages).flatMap(s=>Object.entries(s.questions)));
const oldIds=original.structure.stages.flatMap(s=>s.questionIds);
const records=[];let stageTitles=titles[slug];
if(historical[slug]){
 const hm=git(historical[slug],'quiz.json'),he=git(historical[slug],'en.json');
 stageTitles=hm.structure.stages.map(s=>he.stages[s.id].title);
 for(const s of hm.structure.stages){
  const required=s.questionIds.filter(id=>oldIds.includes(id));
  if(required.length>6)throw Error('More than six required in stage '+s.id);
  const chosen=new Set([...required,...s.questionIds.filter(id=>!required.includes(id)).slice(0,6-required.length)]);
  records.push(s.questionIds.filter(id=>chosen.has(id)).map(id=>({id,logic:structuredClone(original.structure.questions[id]??hm.structure.questions[id]),copy:structuredClone(oldCopies[id]??he.stages[s.id].questions[id])})));
 }
 if(!oldIds.every(id=>records.flat().some(q=>q.id===id)))throw Error('Dropped current question');
}else{
 const bankFiles=slug==='personality'?['personality.json']:fs.readdirSync('scripts/round-expansion').filter(f=>/^additions.*\.json$/.test(f));
 const banks=Object.assign({},...bankFiles.map(f=>JSON.parse(fs.readFileSync(`scripts/round-expansion/${f}`))));
 const rows=banks[slug];if(rows?.length!==20)throw Error('Need 20 additions for '+slug);
 const categories=[...new Set(m.structure.results.dimensions.flatMap(d=>d.categories??[]))];
 const profiles=m.structure.results.profiles.map(p=>p.id);
 for(let s=0;s<5;s++){
  const pair=oldIds.slice(s*2,s*2+2).map(id=>({id,logic:structuredClone(original.structure.questions[id]),copy:structuredClone(oldCopies[id])}));
  for(let j=0;j<4;j++){
   const row=rows[s*4+j],id=`${slug}-round${s+1}-new${j+1}`;
   if(slug==='personality'){
    const [prompt,...answers]=row;
    pair.push({id,logic:{presentation:'text',answerIds:['a1','a2','a3','a4'],choiceMeanings:Object.fromEntries(profiles.map((p,k)=>['a'+(k+1),{[p]:1}]))},copy:{question:prompt,answers:Object.fromEntries(answers.map((a,k)=>['a'+(k+1),a]))}});
   }else{
    const [prompt,correct,w1,w2,w3,cat]=row;
    if(!categories.includes(cat))throw Error(`${slug}/${id}: unknown category ${cat}`);
    pair.push({id,logic:{presentation:'text',answerIds:['a1','a2','a3','a4'],correctAnswerId:'a1',category:cat},copy:{question:prompt,answers:{a1:correct,a2:w1,a3:w2,a4:w3}}});
   }
  }
  records.push(pair);
 }
}
const positions=[1,3,0,2,1,0,2,0,3,1,2,3,0,2,1,3,0,1,3,1,2,0,3,2,1,0,2,1,3,0];
m.template='five-stage-six-question-v1';m.activeLocales=['en'];m.engine.localeParity='independent';m.engine.hardRefreshCheckpoints=false;m.listing.showSocialProof=false;
m.structure.stages=[];m.structure.questions={};e.stages={};e.career={resultProgressLabel:'Your progress',stages:{}};
records.forEach((stage,s)=>{
 const sid='stage-'+(s+1);
 m.structure.stages.push({id:sid,difficultyLevel:['foundation','developing','skilled','advanced','final'][s],questionIds:stage.map(q=>q.id)});
 e.stages[sid]={title:stageTitles[s],questions:{}};
 stage.forEach((q,j)=>{
  // Preserve stable answer IDs and any icons/weights; change only display order.
  const logic=q.logic,copy=q.copy;
  if(!logic.answerIds){
   if(!Array.isArray(copy.answers)||!Number.isInteger(logic.correct))throw Error('Unsupported historical question '+q.id);
   logic.answerIds=copy.answers.map((_,k)=>'a'+(k+1));
   logic.correctAnswerId=logic.answerIds[logic.correct];
   copy.answers=Object.fromEntries(copy.answers.map((a,k)=>[logic.answerIds[k],a]));
   if(Array.isArray(logic.icons))logic.icons=Object.fromEntries(logic.icons.map((a,k)=>[logic.answerIds[k],a]));
   delete logic.correct;delete logic.choiceCount;delete logic.delay;
  }
  if(Array.isArray(copy.trapdoorErrors))copy.trapdoorErrors=Object.fromEntries(copy.trapdoorErrors.flatMap((v,k)=>typeof v==='string'?[['a'+(k+1),v]]:[]));
  if(q.id==='harvard-s5q3')logic.correctAnswerId='a2';
  if(q.id==='firefighter-s3q2')copy.question='Using the scale shown, what real distance does the 4.8 cm route represent?';
  if(q.id==='nurse-r7q1')copy.question='Which person should be prioritised now?';
  if(q.id==='paramedic-r5q6')copy.answers.a4='Person A, because their observations are currently stable';
  if(q.id==='paramedic-r10q6')copy.question='Which person should receive priority attention?';
  if(q.id==='cambridge-s1q3')copy.question='Which number is not the cube of a whole number?';
  if(q.id==='cambridge-s3q5')copy.answers.a3='Four squares in a row, with one above and one below the second square';
  if(logic.correctAnswerId){const others=logic.answerIds.filter(a=>a!==logic.correctAnswerId);others.splice(positions[s*6+j],0,logic.correctAnswerId);logic.answerIds=others;}
  else if(logic.choiceMeanings){const shift=(s*6+j)%4;logic.answerIds=[...logic.answerIds.slice(shift),...logic.answerIds.slice(0,shift)];}
  copy.headerLabel??=stageTitles[s].toUpperCase();delete copy.explanation;
  if(/\b(?:OF 10|QUESTION \d|WORD \d)\b/i.test(copy.headerLabel))copy.headerLabel=stageTitles[s].toUpperCase();
  m.structure.questions[q.id]=logic;e.stages[sid].questions[q.id]=copy;
 });
 e.career.stages[sid]={difficulty:stageTitles[s],preAdTitle:s===4?'Your result is ready':`${stageTitles[s]} complete`,preAdCopy:s===4?'All 30 answers are in. Reveal your result and explore your breakdown.':`Round ${s+1} complete. Next, explore ${stageTitles[s+1].toLowerCase()}.`,...(s===4?{preAdChecks:['30 answers checked','Five rounds completed','Your result prepared'],preAdButton:'Reveal My Result'}:{next:{eyebrow:'NEXT ROUND',tagline:'Take on the next six questions.'}})};
});
const personality=slug==='personality';
if(slug==='grammar'){
 m.structure.results.dimensions[0].categories.push('verbs_agreement');
 m.structure.results.dimensions[2].categories.push('modifiers_word_choice','editing_context');
}
if(!personality){m.structure.results.score.showBestRound=true;}
e.landing.intro=subtitles[slug]??'Read the clues. Make the connections.\nPut your thinking to the test.';
// Preserve the original main quiz title exactly; only the round-format copy changes.
e.summary=`Explore ${stageTitles.join(', ')} across five six-question rounds.`;
const disclaimer=e.about.disclaimer;
e.about.body=`Five rounds offer different angles on this challenge: ${stageTitles.join(', ')}. Each round contains six distinct questions.\n\nChoose one of four answers and move on automatically. There is no time limit. A short rewarded ad opens the quiz, each next round and the final result. ${personality?'There are no right or wrong answers. Your choices contribute to the same four playful country-inspired profiles.':'The target is 24 correct answers out of 30. The result describes this quiz attempt only.'}\n\n${disclaimer}`;
e.about.howToPlay.steps=['Press Start, watch a short rewarded ad and begin.','Choose one answer per question and progress through five rounds.','Complete all 30 questions to reveal your result. You can then unlock the full breakdown.'];
if(!personality){
 e.results.score.bestRound='Your best round';
 for(const [key,p]of Object.entries(e.results.profiles)){const min=m.structure.results.profiles.find(x=>x.key===key)?.min??0;p.copy=min>=.8?'You connected the ideas across five rounds with strong accuracy. Review your answers to see where your knowledge was strongest.':min>=.5?'You recognised several important ideas, while some questions needed a closer look. Your review shows which connections to revisit.':'This challenge introduced some unfamiliar ideas. Use the answer review to explore what you knew and what you can learn next.';}
}
function replacement(rel,value){const old=fs.readFileSync(rel,'utf8');return `*** Update File: ${root}/${rel}\n@@\n${old.trimEnd().split('\n').map(l=>'-'+l).join('\n')}\n${value.trimEnd().split('\n').map(l=>'+'+l).join('\n')}\n`;}
let patch=replacement(`data/quizzes/${slug}/quiz.json`,JSON.stringify(m,null,2)+'\n')+replacement(`data/quizzes/${slug}/en.json`,JSON.stringify(e,null,2)+'\n');
const csspath=`data/quizzes/${slug}/theme.css`,oldcss=fs.readFileSync(csspath,'utf8');
const marker='/* Five-round text-answer layout */';
if(!oldcss.includes(marker))patch+=replacement(csspath,oldcss+`\n${marker}\n[data-quiz-theme="${slug}"] .quiz-engine__answers:not(.quiz-engine__answers--icons):not(.quiz-engine__answers--scale) { grid-template-columns: minmax(0, 1fr); }\n[data-quiz-theme="${slug}"] .quiz-engine__answer strong { min-width: 0; overflow-wrap: anywhere; }\n`);
console.log('*** Begin Patch\n'+patch+'*** End Patch');
