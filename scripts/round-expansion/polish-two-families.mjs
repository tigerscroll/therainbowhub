import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {headings,terms,intros} from './two-family-copy.mjs';
import {checkpointLabels} from './checkpoint-labels.mjs';
import {applyCorrections} from './two-family-corrections.mjs';
import {talkingTherapy,brakingDistance} from './two-family-safety-copy.mjs';
import {resultTitles} from './two-family-result-titles.mjs';

function patch(file,value){
 const old=fs.readFileSync(file,'utf8'),next=JSON.stringify(value,null,2)+'\n';if(old===next)return;
 execFileSync('apply_patch',[],{input:`*** Begin Patch\n*** Update File: ${file}\n@@\n${old.trimEnd().split('\n').map(s=>'-'+s).join('\n')}\n${next.trimEnd().split('\n').map(s=>'+'+s).join('\n')}\n*** End Patch\n`,stdio:['pipe','pipe','pipe']});
}
function tidy(x){if(typeof x==='string')return x.replace(/\u200b/g,'').split('\n').map(s=>s.trim()).join('\n').trim();if(Array.isArray(x))return x.map(tidy);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,tidy(v)]));return x;}
for(const locale of process.env.LOCALES?.split(',')??Object.keys(headings))for(const slug of ['mechanic','treatments']){
 const file=`data/quizzes/${slug}/${locale}.json`,c=tidy(JSON.parse(fs.readFileSync(file))),en=JSON.parse(fs.readFileSync(`data/quizzes/${slug}/en.json`));
 if(Object.keys(c.stages).length!==5)throw Error(`${slug}/${locale}: incomplete draft`);
 const offset=slug==='mechanic'?0:5;
 c.landing.intro=`${intros[locale][slug==='mechanic'?0:1]}\n${intros[locale][2]}`;
 c.career.resultProgressLabel=checkpointLabels[locale][0];
 c.career.stages['stage-5'].preAdButton=checkpointLabels[locale][1];
 for(let n=1;n<=5;n++){
  const stage=c.stages[`stage-${n}`];stage.title=headings[locale][offset+n-1];c.career.stages[`stage-${n}`].difficulty=stage.title;
  for(const q of Object.values(stage.questions))q.headerLabel=stage.title;
 }
 if(slug==='mechanic'){
  c.eyebrow=headings[locale][2];
  c.stages['stage-2'].questions['mechanic-r2q6'].answers.a4=terms[locale][0];
  c.stages['stage-2'].questions['mechanic-r2q2'].answers.a2=terms[locale][1];
  c.stages['stage-2'].questions['mechanic-r2q2'].answers.a4=terms[locale][2];
 }else{
  const glossary={'Occupational therapy':terms[locale][3],'Speech and language therapy':terms[locale][4],'Cupping':terms[locale][5]};
  for(const [sid,stage]of Object.entries(en.stages))for(const[id,q]of Object.entries(stage.questions))for(const[a,text]of Object.entries(q.answers))if(glossary[text])c.stages[sid].questions[id].answers[a]=glossary[text];
 }
 const final=applyCorrections(slug,locale,c);
 for(const [i,profile]of Object.values(final.results.profiles).entries())profile.title=resultTitles[locale][slug==='treatments'?[0,1,2,4,5][i]:i];
 if(slug==='mechanic')final.stages['stage-4'].questions['mechanic-r4q2'].answers.a2=brakingDistance[locale];
 else final.stages['stage-1'].questions['treatments-r1q3'].answers.a1=talkingTherapy[locale];
 const shared=JSON.parse(fs.readFileSync(`data/i18n/${locale}.json`)).quiz;
 if(final.career.stages['stage-5'].preAdButton===shared.revealMyResults)delete final.career.stages['stage-5'].preAdButton;
 patch(file,final);
 console.log(`${slug}/${locale}: native headings, terminology, subtitle and final CTA applied`);
}
