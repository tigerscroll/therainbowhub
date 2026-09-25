// Established book titles, not literal translations of words such as “Acts” or “Numbers”.
const keys=['Acts','Revelation','Numbers','Ecclesiastes','Romans','Hebrews','Jude'];
const rows={
 ar:['أعمال الرسل','رؤيا يوحنا','سفر العدد','سفر الجامعة','الرسالة إلى أهل رومية','الرسالة إلى العبرانيين','رسالة يهوذا'],
 de:['Apostelgeschichte','Offenbarung','4. Mose','Prediger','Römerbrief','Hebräerbrief','Judasbrief'],
 es:['Hechos de los Apóstoles','Apocalipsis','Números','Eclesiastés','Romanos','Hebreos','Judas'],
 fr:['Actes des Apôtres','Apocalypse','Nombres','Ecclésiaste','Romains','Hébreux','Jude'],
 it:['Atti degli Apostoli','Apocalisse','Numeri','Qoelet','Romani','Ebrei','Giuda'],
 nl:['Handelingen','Openbaring','Numeri','Prediker','Romeinen','Hebreeën','Judas'],
 pt:['Atos dos Apóstolos','Apocalipse','Números','Eclesiastes','Romanos','Hebreus','Judas'],
};
export const bibleBooks=Object.fromEntries(Object.entries(rows).map(([locale,values])=>[locale,Object.fromEntries(keys.map((key,i)=>[key,values[i]]))]));
