import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {requested} from './config.mjs';
for(const slug of requested){
 const file=`data/quizzes/${slug}/en.json`,old=fs.readFileSync(file,'utf8'),content=JSON.parse(old);
 for(const stage of Object.values(content.stages))for(const q of Object.values(stage.questions))if(/\b(?:OF 10|QUESTION \d|WORD \d)\b/i.test(q.headerLabel??''))q.headerLabel=stage.title.toUpperCase();
 const next=JSON.stringify(content,null,2)+'\n';if(next===old)continue;
 execFileSync('apply_patch',[],{input:`*** Begin Patch\n*** Update File: ${file}\n@@\n${old.trimEnd().split('\n').map(x=>'-'+x).join('\n')}\n${next.trimEnd().split('\n').map(x=>'+'+x).join('\n')}\n*** End Patch\n`,stdio:['pipe','pipe','pipe']});
}
