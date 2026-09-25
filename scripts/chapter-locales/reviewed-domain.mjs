// Context-dependent meanings that a sentence-at-a-time translation can lose.
// All columns follow the explicit language order below, never discovery order.
const languages = ['fr','de','it','nl','es','pt','ar'];
const rows = {
  'Check each account against other reliable information': 'Comparer chaque témoignage à d’autres informations fiables|Jede Schilderung mit anderen verlässlichen Informationen abgleichen|Confrontare ogni testimonianza con altre informazioni attendibili|Vergelijk elk verslag met andere betrouwbare informatie|Contrastar cada testimonio con otra información fiable|Comparar cada relato com outras informações de confiança|مقارنة كل رواية بمعلومات أخرى موثوقة',
  'Delete both accounts without checking': 'Supprimer les deux témoignages sans vérification|Beide Schilderungen ungeprüft löschen|Eliminare entrambe le testimonianze senza verificarle|Verwijder beide verslagen zonder controle|Eliminar ambos testimonios sin comprobarlos|Apagar ambos os relatos sem os verificar|حذف الروايتين دون التحقق منهما',
  'Their accounts may influence one another': 'Leurs témoignages peuvent s’influencer mutuellement|Ihre Schilderungen können sich gegenseitig beeinflussen|Le loro testimonianze possono influenzarsi a vicenda|Hun verklaringen kunnen elkaar beïnvloeden|Sus testimonios pueden influirse mutuamente|Os seus relatos podem influenciar-se mutuamente|قد تؤثر رواية كل منهما في رواية الآخر',
  'Adding threats to speed up the account': 'Proférer des menaces pour accélérer le récit|Drohungen einsetzen, um die Schilderung zu beschleunigen|Usare minacce per accelerare il racconto|Dreigen om iemand sneller te laten vertellen|Amenazar para acelerar el relato|Fazer ameaças para apressar o relato|استخدام التهديد لتسريع سرد الرواية',
  'Remove it to simplify the account': 'La supprimer pour simplifier le récit|Sie entfernen, um die Darstellung zu vereinfachen|Eliminarla per semplificare il racconto|Verwijder het bewijs om het verhaal eenvoudiger te maken|Eliminarla para simplificar el relato|Eliminar a prova para simplificar o relato|حذف الدليل لتبسيط الرواية',
  'Questions never affect accounts': 'Les questions n’influencent jamais les témoignages|Fragen beeinflussen Schilderungen niemals|Le domande non influenzano mai le testimonianze|Vragen hebben nooit invloed op verklaringen|Las preguntas nunca influyen en los testimonios|As perguntas nunca influenciam os relatos|الأسئلة لا تؤثر أبدًا في الروايات',
  'Record accounts and check reliable independent details': 'Consigner les témoignages et vérifier les détails auprès de sources indépendantes fiables|Die Schilderungen dokumentieren und Details anhand unabhängiger, verlässlicher Quellen prüfen|Registrare le testimonianze e verificare i dettagli con fonti indipendenti attendibili|Leg de verklaringen vast en controleer details met betrouwbare, onafhankelijke informatie|Documentar los testimonios y comprobar los detalles con fuentes independientes fiables|Documentar os relatos e verificar os detalhes com fontes independentes de confiança|توثيق الروايات والتحقق من التفاصيل عبر مصادر مستقلة موثوقة',
  'Assume every account is deliberately false': 'Supposer que chaque témoignage est volontairement faux|Annehmen, dass jede Schilderung absichtlich falsch ist|Presumere che ogni testimonianza sia volutamente falsa|Ga ervan uit dat elke verklaring bewust onwaar is|Suponer que todos los testimonios son falsos a propósito|Presumir que todos os relatos são deliberadamente falsos|افتراض أن كل رواية كاذبة عمدًا',
  'They may influence the account and cause additional distress': 'Elles peuvent influencer le récit et accroître la détresse|Sie können die Schilderung beeinflussen und zusätzlich belasten|Possono influenzare il racconto e causare ulteriore disagio|Ze kunnen het verhaal beïnvloeden en extra spanning veroorzaken|Pueden influir en el relato y causar más angustia|Podem influenciar o relato e causar mais sofrimento|قد تؤثر في الرواية وتسبب مزيدًا من الضيق',
  'A public account of the details': 'Un récit public des détails|Eine öffentliche Schilderung der Einzelheiten|Un resoconto pubblico dei dettagli|Een openbaar verslag van de details|Un relato público de los detalles|Um relato público dos detalhes|سرد التفاصيل علنًا',
  'Every approved application has a signature. This application has no signature. What follows?': 'Toute demande approuvée porte une signature. Cette demande n’en porte aucune. Que peut-on en déduire ?|Jeder genehmigte Antrag ist unterschrieben. Dieser Antrag hat keine Unterschrift. Was folgt daraus?|Ogni domanda approvata ha una firma. Questa domanda non è firmata. Cosa si deduce?|Elke goedgekeurde aanvraag heeft een handtekening. Deze aanvraag heeft geen handtekening. Wat volgt daaruit?|Toda solicitud aprobada tiene una firma. Esta solicitud no tiene firma. ¿Qué se deduce?|Todo o pedido aprovado tem uma assinatura. Este pedido não tem assinatura. O que se pode concluir?|كل طلب تمت الموافقة عليه يحمل توقيعًا. هذا الطلب لا يحمل توقيعًا. ماذا نستنتج؟',
  'All applications lack signatures': 'Aucune demande ne porte de signature|Kein Antrag hat eine Unterschrift|Nessuna domanda è firmata|Geen enkele aanvraag heeft een handtekening|Ninguna solicitud tiene firma|Nenhum pedido tem assinatura|لا يحمل أي طلب توقيعًا',
  'A tool has a guard. What is the guard generally intended to do?': 'Un outil possède un dispositif de protection. À quoi sert-il généralement ?|Ein Werkzeug hat eine Schutzvorrichtung. Wozu dient sie in der Regel?|Un attrezzo ha un riparo di protezione. A cosa serve in genere?|Een stuk gereedschap heeft een beschermkap. Waarvoor dient die meestal?|Una herramienta tiene un resguardo de protección. ¿Para qué sirve normalmente?|Uma ferramenta tem uma proteção. Qual é normalmente a sua função?|تحتوي أداة على واقٍ. ما الغرض المعتاد من هذا الواقي؟',
  'Face them and check their preferred communication method': 'Se placer face à la personne et demander comment elle préfère communiquer|Der Person zugewandt sprechen und nach ihrer bevorzugten Kommunikationsweise fragen|Mettersi di fronte alla persona e chiedere come preferisce comunicare|Kijk de persoon aan en vraag hoe die het liefst communiceert|Colocarse frente a la persona y preguntar cómo prefiere comunicarse|Ficar de frente para a pessoa e perguntar como prefere comunicar|التحدث مع توجيه الوجه نحو الشخص وسؤاله عن طريقة التواصل التي يفضلها',
  'What is scaffolding in teaching?': 'Qu’est-ce que l’étayage pédagogique ?|Was bedeutet Scaffolding als Lernunterstützung im Unterricht?|Che cos’è il sostegno graduale, o scaffolding, nell’insegnamento?|Wat betekent stapsgewijze leerondersteuning, ook wel scaffolding, in het onderwijs?|¿Qué es el andamiaje pedagógico?|O que é o apoio pedagógico gradual, também chamado scaffolding?|ما المقصود بالدعم التعليمي المتدرّج، المعروف بالسقالات التعليمية؟',
  'Ask for the reasoning or a new application': 'Demander le raisonnement ou l’application du concept à un autre exemple|Nach der Begründung oder einer Anwendung auf ein neues Beispiel fragen|Chiedere il ragionamento o l’applicazione a un nuovo esempio|Vraag naar de redenering of laat het concept in een nieuw voorbeeld toepassen|Pedir el razonamiento o aplicar el concepto a otro ejemplo|Pedir que explique o raciocínio ou aplique o conceito a um novo exemplo|طلب شرح التفكير أو تطبيق المفهوم على مثال جديد',
  'What is a railway point or switch used for?': 'À quoi sert un aiguillage ferroviaire ?|Wozu dient eine Weiche bei der Eisenbahn?|A cosa serve uno scambio ferroviario?|Waarvoor dient een spoorwissel?|¿Para qué sirve un cambio de agujas ferroviario?|Para que serve uma agulha ferroviária, também chamada aparelho de mudança de via?|ما الغرض من تحويلة السكك الحديدية؟',
  Momentum: 'Quantité de mouvement|Impuls|Quantità di moto|Impuls|Cantidad de movimiento|Quantidade de movimento|الزخم',
  'What does a lever turn around?': 'Autour de quoi un levier pivote-t-il ?|Um welchen Punkt dreht sich ein Hebel?|Attorno a cosa ruota una leva?|Waar draait een hefboom omheen?|¿Alrededor de qué gira una palanca?|Em torno de que ponto gira uma alavanca?|حول أي نقطة تدور الرافعة؟',
  'What is dental calculus?': 'Qu’est-ce que le tartre dentaire ?|Was ist Zahnstein?|Che cos’è il tartaro dentale?|Wat is tandsteen?|¿Qué es el sarro dental?|O que é o tártaro dentário?|ما المقصود بجير الأسنان؟',
  'Mineralised plaque': 'De la plaque dentaire minéralisée|Mineralisierter Zahnbelag|Placca dentale mineralizzata|Gemineraliseerde tandplak|Placa dental mineralizada|Placa bacteriana mineralizada|لويحة سنية متكلّسة',
  'What distinguishes periodontitis from gingivitis?': 'Qu’est-ce qui distingue la parodontite de la gingivite ?|Was unterscheidet Parodontitis von einer Gingivitis?|Cosa distingue la parodontite dalla gengivite?|Wat onderscheidt parodontitis van gingivitis?|¿Qué distingue la periodontitis de la gingivitis?|O que distingue a periodontite da gengivite?|ما الذي يميّز التهاب دواعم السن عن التهاب اللثة؟',
  'How many Hail Marys form one decade of the Rosary?': 'Combien de Je vous salue Marie composent une dizaine du rosaire ?|Wie viele Ave Maria gehören zu einem Gesätz des Rosenkranzes?|Quante Ave Maria formano una decina del rosario?|Hoeveel weesgegroetjes vormen één tientje van de rozenkrans?|¿Cuántas avemarías forman una decena del rosario?|Quantas Ave-Marias formam uma dezena do Rosário?|كم صلاة «السلام عليك يا مريم» تكوّن عقدًا واحدًا من المسبحة الوردية؟',
};
const arabic = {
  'Wisdom teeth': 'أضراس العقل', 'Wisdom teeth only': 'أضراس العقل فقط',
  'What is mixed dentition?': 'ما المقصود بمرحلة الأسنان المختلطة؟',
  'Primary and permanent teeth are both present': 'وجود أسنان لبنية وأسنان دائمة معًا',
  'Cementum': 'الملاط السني', 'Periodontal ligament': 'الرباط حول السني',
  'What helps attach a tooth to the surrounding socket?': 'ما الذي يربط السن بالتجويف العظمي المحيط به؟',
  'Supporting their sockets': 'دعم التجاويف العظمية التي تثبت فيها الأسنان',
  'What is dental plaque?': 'ما المقصود باللويحة السنية؟',
  'What does gingivitis describe?': 'ما المقصود بالتهاب اللثة؟',
  'What does a mesial tooth surface face?': 'إلى أين يتجه السطح الأنسي للسن؟',
  'What is an impacted tooth?': 'ما المقصود بالسن المنطمرة؟',
  'A tooth prevented from erupting normally': 'سن لم تتمكن من البزوغ بصورة طبيعية',
  'Which bone forms the lower jaw?': 'أي عظم يشكّل الجزء المتحرك من الفكين؟',
  'Which bones form the upper jaw?': 'أي عظمين يثبّتان الأسنان العلوية؟',
  'Maxillae': 'عظما الفك العلوي',
  'What is the gingiva?': 'ما المقصود بنسيج اللثة في الفم؟',
  'The gums around the teeth': 'النسيج اللين المحيط بأعناق الأسنان',
  'Which teeth belong to each dentition': 'أي الأسنان لبنية وأيها دائمة',
};
const sound = {
  fr: ['Quelle est la réponse sonore ?', 'Quelle réaction est appropriée ?'],
  de: ['Wie ist die Klangreaktion?', 'Welche Reaktion ist sinnvoll?'],
  it: ['Qual è la risposta sonora?', 'Qual è la risposta appropriata?'],
  nl: ['Wat is de geluidsreactie?', 'Wat is een verstandige reactie?'],
  es: ['¿Cuál es la respuesta del sonido?', '¿Cuál es la respuesta adecuada?'],
  pt: ['Qual é a resposta sonora?', 'Qual é a resposta adequada?'],
  ar: ['ما هو الرد الصوتي؟', 'ما الاستجابة المناسبة؟'],
};
export function reviewedDomain(slug, locale, value, source, parts) {
  if (!parts.includes('questions')) return value;
  if (rows[source]) value = rows[source].split('|')[languages.indexOf(locale)];
  if (locale === 'ar' && arabic[source] && ['dentist','doctor','medical','surgeon'].includes(slug)) value = arabic[source];
  if (source === 'Cam') value = locale === 'ar' ? 'كام' : 'Cam';
  if (/sound response/.test(source ?? '')) value = value.replace(...sound[locale]);
  if (slug === 'motorbike') {
    if (locale === 'fr') value = value.replace(/\bcavalier\b/g, 'motocycliste');
    if (locale === 'it') value = value.replace(/\bcavaliere\b/g, 'motociclista');
    if (locale === 'es') value = value.replace(/\bciclista\b/g, 'motociclista');
    if (locale === 'pt') value = value.replace(/\bcavaleiro\b/g, 'motociclista').replace(/\bpiloto\b/g, 'motociclista').replace(/\bpedalar\b/g, 'conduzir a moto');
  }
  return value;
}
