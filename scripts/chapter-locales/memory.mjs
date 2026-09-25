import {vocabulary, phrases, names} from './memory-vocabulary.mjs';

const extraKeys = ['COAT','DEPARTURE','PLATFORM','BAG TAG','BUS','SEAT','WINDOW','LUNCH','THREE APPLES','FIRST','THEN','NEXT','LAST','WATER THE PLANT','PACK A BOOK','CALL NORA','LOCK THE DOOR','TEA','COFFEE','JUICE','WATER','TABLE','MILK','2 CARTONS','LIMES','RICE','1 BAG','SOAP','3 BARS','HOST','PLACE','START','GIFT','LOCKER','CODE','TOKEN','MARK','Two pears','Three oranges','Three apples','Four apples','Window','Aisle','Front','Back'];
const extras = {
  fr: 'MANTEAU|DÉPART|QUAI|ÉTIQUETTE DU SAC|BUS|PLACE|CÔTÉ FENÊTRE|DÉJEUNER|TROIS POMMES|D’ABORD|PUIS|ENSUITE|ENFIN|ARROSER LA PLANTE|EMPORTER UN LIVRE|APPELER NORA|FERMER LA PORTE À CLÉ|THÉ|CAFÉ|JUS|EAU|TABLE|LAIT|2 BRIQUES|CITRONS VERTS|RIZ|1 SAC|SAVON|3 PAINS|HÔTE|LIEU|DÉBUT|CADEAU|CASIER|CODE|JETON|SYMBOLE|Deux poires|Trois oranges|Trois pommes|Quatre pommes|Côté fenêtre|Côté couloir|À l’avant|À l’arrière',
  de: 'MANTEL|ABFAHRT|BAHNSTEIG|TASCHENANHÄNGER|BUS|SITZPLATZ|AM FENSTER|MITTAGESSEN|DREI ÄPFEL|ZUERST|DANN|DANACH|ZUM SCHLUSS|DIE PFLANZE GIESSEN|EIN BUCH EINPACKEN|NORA ANRUFEN|DIE TÜR ABSCHLIESSEN|TEE|KAFFEE|SAFT|WASSER|TISCH|MILCH|2 KARTONS|LIMETTEN|REIS|1 BEUTEL|SEIFE|3 STÜCK|GASTGEBERIN|ORT|BEGINN|GESCHENK|SCHLIESSFACH|CODE|MARKE|SYMBOL|Zwei Birnen|Drei Orangen|Drei Äpfel|Vier Äpfel|Am Fenster|Am Gang|Vorne|Hinten',
  it: 'CAPPOTTO|PARTENZA|BINARIO|ETICHETTA DELLA BORSA|AUTOBUS|POSTO|FINESTRINO|PRANZO|TRE MELE|PRIMA|POI|DOPO|ALLA FINE|ANNAFFIARE LA PIANTA|METTERE UN LIBRO IN BORSA|CHIAMARE NORA|CHIUDERE LA PORTA A CHIAVE|TÈ|CAFFÈ|SUCCO|ACQUA|TAVOLO|LATTE|2 CARTONI|LIME|RISO|1 SACCHETTO|SAPONE|3 SAPONETTE|PADRONA DI CASA|LUOGO|INIZIO|REGALO|ARMADIETTO|CODICE|GETTONE|SIMBOLO|Due pere|Tre arance|Tre mele|Quattro mele|Vicino al finestrino|Lato corridoio|Davanti|Dietro',
  nl: 'JAS|VERTREK|PERRON|BAGAGELABEL|BUS|ZITPLAATS|BIJ HET RAAM|LUNCH|DRIE APPELS|EERST|DAN|DAARNA|TOT SLOT|DE PLANT WATER GEVEN|EEN BOEK INPAKKEN|NORA BELLEN|DE DEUR OP SLOT DOEN|THEE|KOFFIE|SAP|WATER|TAFEL|MELK|2 PAKKEN|LIMOENEN|RIJST|1 ZAK|ZEEP|3 STUKKEN|GASTVROUW|PLAATS|BEGIN|CADEAU|KLUISJE|CODE|MUNTJE|SYMBOOL|Twee peren|Drie sinaasappels|Drie appels|Vier appels|Bij het raam|Aan het gangpad|Vooraan|Achteraan',
  es: 'ABRIGO|SALIDA|ANDÉN|ETIQUETA DE LA BOLSA|AUTOBÚS|ASIENTO|JUNTO A LA VENTANA|ALMUERZO|TRES MANZANAS|PRIMERO|DESPUÉS|LUEGO|AL FINAL|REGAR LA PLANTA|GUARDAR UN LIBRO|LLAMAR A NORA|CERRAR LA PUERTA CON LLAVE|TÉ|CAFÉ|JUGO|AGUA|MESA|LECHE|2 ENVASES|LIMAS|ARROZ|1 BOLSA|JABÓN|3 PASTILLAS|ANFITRIONA|LUGAR|INICIO|REGALO|CASILLERO|CÓDIGO|FICHA|SÍMBOLO|Dos peras|Tres naranjas|Tres manzanas|Cuatro manzanas|Junto a la ventana|Junto al pasillo|Delante|Detrás',
  pt: 'CASACO|PARTIDA|PLATAFORMA|ETIQUETA DA BOLSA|LINHA|ASSENTO|JANELA|ALMOÇO|TRÊS MAÇÃS|PRIMEIRO|DEPOIS|A SEGUIR|POR FIM|REGAR A PLANTA|GUARDAR UM LIVRO|LIGAR PARA NORA|TRANCAR A PORTA|CHÁ|CAFÉ|BEBIDA DE FRUTA|ÁGUA|MESA|LEITE|2 EMBALAGENS|LIMÕES|ARROZ|1 SACO|SABONETE|3 BARRAS|ANFITRIÃ|LOCAL|INÍCIO|PRESENTE|ARMÁRIO|CÓDIGO|FICHA|SÍMBOLO|Duas peras|Três laranjas|Três maçãs|Quatro maçãs|Junto à janela|Junto ao corredor|Na frente|Atrás',
  ar: 'المعطف|المغادرة|الرصيف|بطاقة الحقيبة|الحافلة|المقعد|بجانب النافذة|الغداء|ثلاث تفاحات|أولًا|ثم|بعد ذلك|أخيرًا|سقي النبتة|وضع كتاب في الحقيبة|الاتصال بنورا|إقفال الباب|شاي|قهوة|عصير|ماء|طاولة|حليب|عبوتان|ليمون أخضر|أرز|كيس واحد|صابون|ثلاث قطع|المضيفة|المكان|البداية|الهدية|الخزانة|الرمز|القطعة|العلامة|حبتا كمثرى|ثلاث برتقالات|ثلاث تفاحات|أربع تفاحات|بجانب النافذة|بجانب الممر|في الأمام|في الخلف',
};

const questionKeys = ['memory-s1q4','memory-s1q6','memory-s2q2','memory-s2q5','memory-s2q6','memory-s2q7','memory-s6q1','memory-s6q5','memory-s7q2','memory-s7q7','memory-s10q1','memory-s10q6'];
const questionRows = {
  fr: ['Quel mot venait juste après « {River} » ?', 'Quel mot commençait la liste contenant « {River} » et « {Shell} » ?', 'Quel mot ne figurait pas dans la liste qui se terminait par « {Fox} » ?', 'Quel animal terminait la première liste contenant « {Lemon} » ?', 'Quel mot venait juste avant « {Coin} » ?', 'Quel mot figurait dans la liste avec « {Pear} », mais pas dans celle avec « {Lemon} » ?', 'Quel nombre était associé à « {Gold} » ?', 'Revenons aux couleurs : quel nombre allait avec « {Green} » ?', 'Quel objet se trouvait entre « {Cup} » et « {Ring} » ?', 'Inversez la liste qui commençait par « {Bell} », « {Leaf} ». Quel objet est maintenant l’avant-dernier ?', 'Quel nombre était associé à « {Velvet} » ?', 'Quel nombre allait avec « {Orbit} » dans le dernier tableau ?'],
  de: ['Welches Wort stand direkt nach „{River}“?', 'Welches Wort stand am Anfang der Liste mit „{River}“ und „{Shell}“?', 'Welches Wort fehlte in der Liste, die mit „{Fox}“ endete?', 'Welches Tier stand am Ende der früheren Liste mit „{Lemon}“?', 'Welches Wort stand direkt vor „{Coin}“?', 'Welches Wort stand auf der Liste mit „{Pear}“, aber nicht auf der mit „{Lemon}“?', 'Welche Zahl war „{Gold}“ zugeordnet?', 'Zurück zu den Farben: Welche Zahl gehörte zu „{Green}“?', 'Welcher Gegenstand stand zwischen „{Cup}“ und „{Ring}“?', 'Kehren Sie die Liste um, die mit „{Bell}“, „{Leaf}“ begann. Welcher Gegenstand steht nun an vorletzter Stelle?', 'Welche Zahl war „{Velvet}“ zugeordnet?', 'Welche Zahl gehörte auf der letzten Tafel zu „{Orbit}“?'],
  it: ['Quale parola veniva subito dopo «{River}»?', 'Quale parola apriva l’elenco con «{River}» e «{Shell}»?', 'Quale parola mancava dall’elenco che terminava con «{Fox}»?', 'Quale animale chiudeva il primo elenco con «{Lemon}»?', 'Quale parola veniva subito prima di «{Coin}»?', 'Quale parola compariva nell’elenco con «{Pear}», ma non in quello con «{Lemon}»?', 'Quale numero era abbinato a «{Gold}»?', 'Torniamo ai colori: quale numero era abbinato a «{Green}»?', 'Quale oggetto si trovava tra «{Cup}» e «{Ring}»?', 'Inverti l’elenco che iniziava con «{Bell}», «{Leaf}». Quale oggetto è ora il penultimo?', 'Quale numero era abbinato a «{Velvet}»?', 'Quale numero era abbinato a «{Orbit}» nell’ultima scheda?'],
  nl: ['Welk woord kwam direct na ‘{River}’?', 'Welk woord stond aan het begin van de lijst met ‘{River}’ en ‘{Shell}’?', 'Welk woord ontbrak op de lijst die eindigde met ‘{Fox}’?', 'Welk dier stond aan het einde van de eerdere lijst met ‘{Lemon}’?', 'Welk woord kwam direct voor ‘{Coin}’?', 'Welk woord stond wel op de lijst met ‘{Pear}’, maar niet op die met ‘{Lemon}’?', 'Welk getal hoorde bij ‘{Gold}’?', 'Terug naar de kleuren: welk getal hoorde bij ‘{Green}’?', 'Welk voorwerp stond tussen ‘{Cup}’ en ‘{Ring}’?', 'Keer de lijst om die begon met ‘{Bell}’, ‘{Leaf}’. Welk voorwerp staat nu op de voorlaatste plaats?', 'Welk getal hoorde bij ‘{Velvet}’?', 'Welk getal hoorde op het laatste bord bij ‘{Orbit}’?'],
  es: ['¿Qué palabra aparecía justo después de «{River}»?', '¿Qué palabra iniciaba la lista con «{River}» y «{Shell}»?', '¿Qué palabra no estaba en la lista que terminaba con «{Fox}»?', '¿Qué animal cerraba la primera lista con «{Lemon}»?', '¿Qué palabra aparecía justo antes de «{Coin}»?', '¿Qué palabra estaba en la lista con «{Pear}», pero no en la lista con «{Lemon}»?', '¿Qué número estaba asociado con «{Gold}»?', 'Volvamos a los colores: ¿qué número estaba asociado con «{Green}»?', '¿Qué objeto estaba entre «{Cup}» y «{Ring}»?', 'Invierte la lista que empezaba por «{Bell}», «{Leaf}». ¿Qué objeto queda ahora en penúltimo lugar?', '¿Qué número estaba asociado con «{Velvet}»?', '¿Qué número estaba asociado con «{Orbit}» en la última tarjeta?'],
  pt: ['Que palavra vinha logo depois de «{River}»?', 'Que palavra iniciava a lista com «{River}» e «{Shell}»?', 'Que palavra não aparecia na lista que terminava com «{Fox}»?', 'Que animal terminava a primeira lista com «{Lemon}»?', 'Que palavra vinha logo antes de «{Coin}»?', 'Que palavra aparecia na lista com «{Pear}», mas não na lista com «{Lemon}»?', 'Que número estava associado a «{Gold}»?', 'Voltando às cores: que número estava associado a «{Green}»?', 'Que objeto estava entre «{Cup}» e «{Ring}»?', 'Inverta a lista que começava com «{Bell}», «{Leaf}». Que objeto fica agora na penúltima posição?', 'Que número estava associado a «{Velvet}»?', 'Que número estava associado a «{Orbit}» no último quadro?'],
  ar: ['ما الكلمة التي جاءت مباشرة بعد «{River}»؟', 'ما الكلمة التي بدأت بها القائمة التي تضمنت «{River}» و«{Shell}»؟', 'ما الكلمة التي لم تظهر في القائمة المنتهية بكلمة «{Fox}»؟', 'ما الحيوان الذي جاء في نهاية القائمة السابقة التي تضمنت «{Lemon}»؟', 'ما الكلمة التي جاءت مباشرة قبل «{Coin}»؟', 'ما الكلمة التي ظهرت في قائمة «{Pear}» ولم تظهر في قائمة «{Lemon}»؟', 'ما الرقم المرتبط بكلمة «{Gold}»؟', 'بالعودة إلى الألوان، ما الرقم المرتبط بكلمة «{Green}»؟', 'ما الشيء الذي كان بين «{Cup}» و«{Ring}»؟', 'اعكس ترتيب القائمة التي بدأت بكلمتي «{Bell}» و«{Leaf}». ما الشيء الذي أصبح في المرتبة قبل الأخيرة؟', 'ما الرقم المرتبط بكلمة «{Velvet}»؟', 'ما الرقم المرتبط بكلمة «{Orbit}» في اللوحة الأخيرة؟'],
};

export function polishMemory(copy, source, locale) {
  const bank = {...vocabulary[locale], ...phrases[locale]};
  const extra = extras[locale].split('|');
  if (extra.length !== extraKeys.length) throw Error(`${locale}: memory labels ${extra.length}/${extraKeys.length}`);
  extraKeys.forEach((key, i) => bank[key] = extra[i]);
  // Profession labels agree with the people on the cards.
  if (locale === 'fr') bank.Baker = 'Boulangère';
  if (locale === 'de') {bank.Baker = 'Bäckerin'; bank.Artist = 'Künstlerin';}
  if (locale === 'it') bank.Baker = 'Panettiera';
  if (locale === 'es') bank.Baker = 'Panadera';
  if (locale === 'pt') bank.Baker = 'Padeira';
  if (locale === 'ar') {bank.Baker = 'خبازة'; bank.Artist = 'فنانة';}
  for (const name of Object.keys(names)) bank[name] = locale === 'ar' ? names[name] : name;
  const upper = value => locale === 'ar' ? value : value.toLocaleUpperCase(locale);
  for (const [key, value] of Object.entries({...bank})) if (!(key.toUpperCase() in bank)) bank[key.toUpperCase()] = upper(value);
  const original = Object.assign({}, ...Object.values(source.stages).map(stage => stage.questions));
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  const translateBoardPart = part => {
    if (bank[part]) return bank[part];
    if (/^[\d: ]+$/.test(part)) return part;
    const symbol = part.match(/^([★●▲■]) (.+)$/);
    if (symbol) return `${symbol[1]} ${bank[symbol[2]]}`;
    const numbered = part.match(/^(TABLE|BUS) (\d+)$/);
    if (numbered) return `${bank[numbered[1]]} ${numbered[2]}`;
    throw Error(`${locale}: missing memory board word ${part}`);
  };
  for (const [id, question] of Object.entries(questions)) {
    const english = original[id];
    for (const [key, value] of Object.entries(english.answers)) {
      if (bank[value]) question.answers[key] = bank[value];
    }
    if (english.study?.items) question.study.items = english.study.items.map(item => bank[item] ?? item.split(' · ').map(translateBoardPart).join(' · '));
    if (locale === 'ar' && question.study) {
      question.study.instruction = 'احفظ التفاصيل من اليسار إلى اليمين، صفًا بعد صف. ستعود بعض التفاصيل في أسئلة لاحقة.';
    }
  }
  questionKeys.forEach((key, index) => questions[key].question = questionRows[locale][index].replace(/\{(\w+)\}/g, (_, word) => bank[word]));
  // Reuse the board's exact action wording in every action choice.
  for (const id of ['memory-s7q4','memory-s7q6']) for (const [key, value] of Object.entries(original[id].answers)) {
    questions[id].answers[key] = bank[value.toUpperCase()];
  }
  if (locale === 'pt') {
    questions['memory-s1q5'].question = 'Que número estava associado ao veículo?';
    questions['memory-s1q7'].question = 'Qual era a cor do avião no primeiro quadro?';
    questions['memory-s5q1'].study.title = 'Memorize os detalhes da viagem de Maya';
    questions['memory-s5q2'].question = 'Qual era a plataforma indicada para a viagem de Maya?';
    questions['memory-s5q4'].question = 'Qual era o número da linha usada por Kai?';
    questions['memory-s5q5'].question = 'Qual era o horário de partida da viagem de Maya?';
    questions['memory-s8q1'].question = 'Quem pediu a bebida de fruta?';
    questions['memory-s8q4'].question = 'Quantos limões estavam na lista de compras?';
    questions['memory-s10q4'].question = 'Na viagem de Maya, qual era a cor da etiqueta da bolsa?';
  }
  // Quoting the symbol avoids treating a Latin-letter scan as an English test.
  if (locale === 'ar') questions['memory-s5q3'].question = 'كم مرة يظهر الرمز «E» في التسلسل «T E N E T E N»؟';
}
