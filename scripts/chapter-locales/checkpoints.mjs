// Short, idiomatic checkpoint headings. None claims that the player answered
// correctly; the profile beneath it is calculated from the current seven answers.
const titles = {
  fr: ['Les premiers indices', 'Un nouveau regard', 'Les détails comptent', 'Changeons de perspective', 'Une nouvelle piste', 'À chaque détail son rôle', 'Les indices se rejoignent', 'Un autre angle', 'Place au dernier défi', 'Le résultat est prêt'],
  de: ['Die ersten Hinweise', 'Ein neuer Blickwinkel', 'Auf die Details kommt es an', 'Zeit für einen Perspektivwechsel', 'Eine neue Spur', 'Jedes Detail zählt', 'Hinweise verbinden', 'Ein anderer Blickwinkel', 'Die letzte Herausforderung', 'Das Ergebnis steht fest'],
  it: ['I primi indizi', 'Un nuovo punto di vista', 'I dettagli contano', 'Cambiamo prospettiva', 'Una nuova pista', 'Ogni dettaglio conta', 'Collega gli indizi', 'Guarda da un’altra angolazione', 'L’ultima sfida ti aspetta', 'Il tuo risultato è pronto'],
  nl: ['Je eerste aanwijzingen', 'Een nieuwe kijk', 'Het zit in de details', 'Tijd voor een ander perspectief', 'Een nieuw spoor', 'Elk detail telt', 'Verbind de aanwijzingen', 'Een andere invalshoek', 'Klaar voor de laatste uitdaging?', 'Je resultaat is bekend'],
  es: ['Tus primeras pistas', 'Una nueva mirada', 'Los detalles cuentan', 'Cambiemos de perspectiva', 'Una nueva pista', 'Cada detalle importa', 'Conecta las pistas', 'Mira desde otro ángulo', 'Llega el último reto', 'Tu resultado está listo'],
  pt: ['As primeiras pistas', 'Um novo olhar', 'Os detalhes importam', 'Uma nova perspetiva', 'Uma nova pista', 'Cada detalhe conta', 'Hora de ligar as pistas', 'Um ângulo diferente', 'O último desafio', 'O resultado está pronto'],
  ar: ['أولى ملامح إجاباتك', 'نظرة جديدة', 'التفاصيل تصنع الفرق', 'لنغيّر زاوية النظر', 'دليل جديد', 'لكل تفصيل دوره', 'اربط بين الأدلة', 'زاوية أخرى', 'حان التحدي الأخير', 'نتيجتك جاهزة'],
};
// "Perspetiva/perspectiva" differs between PT and BR. A shared expression avoids
// forcing either regional spelling into the shared Portuguese interface.
titles.pt[3] = 'Outro ponto de vista';
export const checkpointTitles = titles;
export const checkpointProfile = {
  fr: () => 'Sur ce thème : {profile}.', de: () => 'In diesem Bereich: {profile}.',
  it: () => 'Su questo tema: {profile}.', nl: () => 'Bij dit onderwerp: {profile}.',
  es: () => 'En este tema: {profile}.', pt: () => 'Neste tema: {profile}.',
  ar: () => 'في هذا الموضوع: {profile}.',
};
