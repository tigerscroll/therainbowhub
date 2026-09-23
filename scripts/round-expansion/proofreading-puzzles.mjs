export const queueQuestions={
 ar:'يقف Mara قبل Leo، ويقف Leo قبل Nia. أي ترتيب يوافق ذلك؟',
 bg:'Mara е преди Leo, а Leo е преди Nia. Коя последователност е правилна?',
 cs:'Mara stojí před Leem a Leo před Niou. Které pořadí tomu odpovídá?',
 da:'Mara står foran Leo, og Leo står foran Nia. Hvilken rækkefølge passer?',
 de:'Mara steht vor Leo, und Leo steht vor Nia. Welche Reihenfolge ist möglich?',
 el:'Η Mara είναι πριν από τον Leo και ο Leo πριν από τη Nia. Ποια σειρά είναι σωστή;',
 es:'Mara está delante de Leo y Leo está delante de Nia. ¿Qué orden es posible?',
 fi:'Mara on ennen Leoa ja Leo ennen Niaa. Mikä järjestys on oikea?',
 fil:'Nasa unahan ni Leo si Mara, at nasa unahan ni Nia si Leo. Aling pagkakasunod-sunod ang tama?',
 fr:'Mara est devant Leo, et Leo est devant Nia. Quel ordre est possible ?',
 he:'Mara עומדת לפני Leo, ו־Leo עומד לפני Nia. איזה סדר מתאים?',
 hr:'Mara stoji ispred Lea, a Leo ispred Nie. Koji je redoslijed točan?',
 hu:'Mara Leo előtt áll, Leo pedig Nia előtt. Melyik sorrend helyes?',
 id:'Mara berada di depan Leo, dan Leo di depan Nia. Urutan mana yang benar?',
 it:'Mara è davanti a Leo e Leo è davanti a Nia. Quale ordine è possibile?',
 ja:'MaraはLeoの前、LeoはNiaの前に並んでいます。正しい順番はどれ？',
 ms:'Mara berada di hadapan Leo, dan Leo di hadapan Nia. Susunan manakah yang betul?',
 nb:'Mara står foran Leo, og Leo står foran Nia. Hvilken rekkefølge er riktig?',
 nl:'Mara staat vóór Leo, en Leo staat vóór Nia. Welke volgorde klopt?',
 pl:'W kolejce Mara wyprzedza Leo, a Leo wyprzedza Nię. Która kolejność jest poprawna?',
 pt:'Mara está à frente de Leo e Leo está à frente de Nia. Qual é a ordem possível?',
 ro:'Mara este înaintea lui Leo, iar Leo este înaintea Niei. Care este ordinea corectă?',
 sk:'Mara stojí pred Leom a Leo pred Niou. Ktoré poradie tomu zodpovedá?',
 sr:'Mara стоји испред Lea, а Leo испред Nie. Који је редослед тачан?',
 sv:'Mara står före Leo, och Leo står före Nia. Vilken ordning är rätt?',
 th:'Mara อยู่ก่อน Leo และ Leo อยู่ก่อน Nia ลำดับใดถูกต้อง?',
 tr:'Mara, Leo’nun önünde; Leo ise Nia’nın önündedir. Hangi sıralama doğrudur?',
 uk:'Mara стоїть перед Leo, а Leo — перед Nia. Який порядок правильний?',
 vi:'Mara đứng trước Leo, còn Leo đứng trước Nia. Thứ tự nào đúng?',
};

export function proofreadPuzzles(slug,locale,qs){
 if(slug==='iq'){
  qs['iq-s3q1'].question=queueQuestions[locale];
  qs['iq-s3q1'].answers={a1:'Leo — Mara — Nia',a2:'Mara — Nia — Leo',a3:'Mara — Leo — Nia',a4:'Nia — Leo — Mara'};
 }
 if(slug==='cambridge'){
  const q=qs['cambridge-s2q1'];
  q.visual.items=['AAAA','AAAB','AABB','ABBB','?'];
  q.visual.ariaLabel='AAAA → AAAB → AABB → ABBB → ?';
  q.answers={a1:'BBBB',a2:'AABB',a3:'AAAB',a4:'ABBA'};
 }
}
