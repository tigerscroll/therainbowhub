import {locales} from './config.mjs';

// Each row is French, German, Italian, Dutch, Spanish, Portuguese, Arabic.
// Match the English meaning, never the translated wording or answer position.
const terms = {
  chef: {
    'Whisk': 'Fouet|Schneebesen|Frusta|Garde|Batidor de varillas|Batedor de arame|مضرب يدوي',
    'Tongs': 'Pince de cuisine|Küchenzange|Pinze da cucina|Keukentang|Pinzas de cocina|Pinça de cozinha|ملقط مطبخ',
    'Ladle': 'Louche|Schöpfkelle|Mestolo|Soeplepel|Cucharón|Concha|مغرفة',
    'Colander': 'Passoire|Nudelsieb|Scolapasta|Vergiet|Colador|Escorredor|مصفاة',
    'Rolling pin': 'Rouleau à pâtisserie|Nudelholz|Matterello|Deegroller|Rodillo|Rolo de massa|نشابة',
    'Peeler': 'Économe|Sparschäler|Pelapatate|Dunschiller|Pelador|Descascador|مقشرة',
    'Zester': 'Zesteur|Zestenreißer|Rigalimoni|Zesteur|Rallador de cítricos|Ralador de citrinos|مبشرة قشر الحمضيات',
    'Slotted turner': 'Spatule ajourée|Geschlitzter Pfannenwender|Paletta forata|Spatel met sleuven|Espátula ranurada|Espátula com ranhuras|ملعقة تقليب مثقبة',
    'Pastry scraper': 'Coupe-pâte|Teigkarte|Tarocco|Deegschraper|Rasqueta de repostería|Raspador de massa|كاشطة عجين',
    'Pastry brush': 'Pinceau de cuisine|Backpinsel|Pennello da cucina|Bakkwast|Pincel de cocina|Pincel de cozinha|فرشاة معجنات',
    'Grilling': 'Cuisson au gril|Grillen|Cottura alla griglia|Grillen|Cocinar a la parrilla|Grelhar|الشوي على الشواية',
    'Steaming': 'Cuisson à la vapeur|Dämpfen|Cottura al vapore|Stomen|Cocinar al vapor|Cozinhar a vapor|الطهي بالبخار',
    'Roasting': 'Cuisson au four|Braten im Ofen|Cottura al forno|Roosteren in de oven|Asar al horno|Assar no forno|الطهي في الفرن بحرارة جافة',
    'Shallow-frying': 'Cuisson dans peu d’huile|Braten in wenig Fett|Frittura in poco olio|Bakken in een laagje olie|Freír con poco aceite|Fritar em pouca gordura|القلي بكمية قليلة من الزيت',
    'Deep-frying': 'Friture dans un bain d’huile|Frittieren|Frittura a immersione|Frituren|Freír por inmersión|Fritar por imersão|القلي بالغمر في الزيت',
    'Poaching': 'Pochage|Pochieren|Cottura in liquido sotto il bollore|Pocheren|Escalfar|Escalfar em líquido sem fervura forte|الطهي برفق في سائل دون غليان قوي',
    'Searing': 'Saisie à feu vif|Scharfes Anbraten|Rosolatura a fuoco vivo|Dichtschroeien|Dorar a fuego fuerte|Dourar em lume ou fogo forte|تحمير السطح بحرارة عالية',
    'Boiling': 'Cuisson à l’eau bouillante|Kochen in sprudelndem Wasser|Cottura in acqua bollente|Koken in kokend water|Cocer en agua hirviendo|Cozinhar em água a ferver|الطهي في ماء يغلي',
    'Honey': 'Miel|Honig|Miele|Honing|Miel|Mel|عسل',
    'Unsalted stock': 'Bouillon sans sel|Ungesalzene Brühe|Brodo senza sale|Ongezouten bouillon|Caldo sin sal|Caldo sem sal|مرق بلا ملح',
    'Stock and water': 'Bouillon et eau|Brühe und Wasser|Brodo e acqua|Bouillon en water|Caldo y agua|Caldo e água|مرق وماء',
    'Mincing it': 'Le hacher finement|Fein hacken|Tritarlo finemente|Fijnhakken|Picarlo finamente|Picar finamente|فرمه ناعمًا',
    'Oil': 'Huile|Öl|Olio|Olie|Aceite|Óleo|زيت',
    'Lemon juice': 'Jus de citron|Zitronensaft|Succo di limone|Citroensap|Jugo de limón|Sumo ou suco de limão|عصير الليمون',
    'Oil and vinegar': 'Huile et vinaigre|Öl und Essig|Olio e aceto|Olie en azijn|Aceite y vinagre|Óleo e vinagre|زيت وخل',
    'The browned bits stuck to the pan': 'Les sucs de cuisson attachés au fond de la poêle|Der am Pfannenboden haftende Bratensatz|I residui rosolati attaccati al fondo della padella|De aangebakken restjes op de bodem van de pan|Los restos dorados adheridos al fondo de la sartén|Os resíduos dourados presos ao fundo da frigideira|الرواسب المحمّرة الملتصقة بقاع المقلاة',
    'Baking a pastry case before adding its filling': 'Précuire un fond de tarte avant d’ajouter la garniture|Einen Teigboden vor dem Füllen backen|Cuocere una base di pasta prima di aggiungere il ripieno|Een deegbodem bakken voordat de vulling erop gaat|Hornear una base de masa antes de añadir el relleno|Assar a base de massa antes de acrescentar o recheio|خَبز قاعدة العجين قبل إضافة الحشو',
  },
  catholic: {
    'Mass': 'Messe|Messe|Messa|Mis|Misa|Missa|القداس',
    'Vespers': 'Vêpres|Vesper|Vespri|Vespers|Vísperas|Vésperas|صلاة الغروب',
    'A novena': 'Une neuvaine|Eine Novene|Una novena|Een noveen|Una novena|Uma novena|تساعية صلاة',
    'Confirmation': 'Confirmation|Firmung|Confermazione|Vormsel|Confirmación|Confirmação ou Crisma|سر التثبيت',
    'Holy Orders': 'Ordre|Weihe|Ordine sacro|Wijding|Orden sacerdotal|Ordem|سر الكهنوت',
    'The Sanctus': 'Le Sanctus|Das Sanctus|Il Santo (Sanctus)|Het Sanctus|El Santo (Sanctus)|O Santo (Sanctus)|صلاة «قدوس، قدوس، قدوس»',
    'Dismissal': 'L’envoi|Die Entlassung|Il congedo|De wegzending|La despedida|A despedida e o envio|صرف الشعب في ختام القداس',
    'The dismissal': 'L’envoi|Die Entlassung|Il congedo|De wegzending|La despedida|A despedida e o envio|صرف الشعب في ختام القداس',
    'Joyful': 'Mystères joyeux|Freudenreiche Geheimnisse|Misteri gaudiosi|Blijde geheimen|Misterios gozosos|Mistérios gozosos|أسرار الفرح',
    'Sorrowful': 'Mystères douloureux|Schmerzhafte Geheimnisse|Misteri dolorosi|Droevige geheimen|Misterios dolorosos|Mistérios dolorosos|أسرار الحزن',
    'Glorious': 'Mystères glorieux|Glorreiche Geheimnisse|Misteri gloriosi|Glorievolle geheimen|Misterios gloriosos|Mistérios gloriosos|أسرار المجد',
    'Luminous': 'Mystères lumineux|Lichtreiche Geheimnisse|Misteri luminosi|Geheimen van het licht|Misterios luminosos|Mistérios luminosos|أسرار النور',
  },
  anatomy: {
    'Veins': 'Veines|Venen|Vene|Aders|Venas|Veias|أوردة',
    'Venules': 'Veinules|Venolen|Venule|Venulen|Vénulas|Vénulas|وريدات',
    'Capillaries': 'Capillaires|Kapillaren|Capillari|Haarvaten|Capilares|Capilares|شعيرات دموية',
  },
  mechanic: {
    'The specified grade matters; thicker is not always better': 'Il faut respecter la qualité d’huile préconisée ; une huile plus épaisse n’est pas toujours préférable|Die vorgeschriebene Ölspezifikation ist entscheidend; dickeres Öl ist nicht immer besser|Conta la specifica prescritta; un olio più denso non è sempre migliore|De voorgeschreven oliespecificatie is belangrijk; dikkere olie is niet altijd beter|Importa la especificación indicada; un aceite más espeso no siempre es mejor|A especificação indicada pelo fabricante importa; um óleo mais espesso nem sempre é melhor|يجب الالتزام بمواصفات الزيت المحددة؛ فالزيت الأكثر لزوجة ليس أفضل دائمًا',
    'A constant-velocity joint': 'Un joint homocinétique|Ein Gleichlaufgelenk|Un giunto omocinetico|Een homokinetische koppeling|Una junta homocinética|Uma junta homocinética|مفصل ثابت السرعة',
    'A torque wrench': 'Une clé dynamométrique|Ein Drehmomentschlüssel|Una chiave dinamometrica|Een momentsleutel|Una llave dinamométrica|Uma chave de aperto com controlo de torque|مفتاح عزم',
  },
  iq: {
    'Mass': 'Masse|Masse|Massa|Massa|Masa|Massa|كتلة',
  },
};

const bibleNames = {
  'Noah': 'Noé|Noah|Noè|Noach|Noé|Noé|نوح',
  'Abraham': 'Abraham|Abraham|Abramo|Abraham|Abraham|Abraão|إبراهيم',
  'Moses': 'Moïse|Mose|Mosè|Mozes|Moisés|Moisés|موسى',
  'David': 'David|David|Davide|David|David|Davi|داود',
  'Job': 'Job|Hiob|Giobbe|Job|Job|Jó|أيوب',
  'Mark': 'Marc|Markus|Marco|Marcus|Marcos|Marcos|مرقس',
  'Matthew': 'Matthieu|Matthäus|Matteo|Matteüs|Mateo|Mateus|متى',
  'Luke': 'Luc|Lukas|Luca|Lucas|Lucas|Lucas|لوقا',
  'John': 'Jean|Johannes|Giovanni|Johannes|Juan|João|يوحنا',
  'James': 'Jacques|Jakobus|Giacomo|Jakobus|Santiago|Tiago|يعقوب',
  'Peter': 'Pierre|Petrus|Pietro|Petrus|Pedro|Pedro|بطرس',
  'Paul': 'Paul|Paulus|Paolo|Paulus|Pablo|Paulo|بولس',
  'Genesis': 'Genèse|Genesis|Genesi|Genesis|Génesis|Génesis ou Gênesis|سفر التكوين',
  'Exodus': 'Exode|Exodus|Esodo|Exodus|Éxodo|Êxodo|سفر الخروج',
  'Psalms': 'Psaumes|Psalmen|Salmi|Psalmen|Salmos|Salmos|المزامير',
};

const clinical = {
  'Acknowledge the worry and invite questions': 'Reconnaître l’inquiétude et inviter la personne à poser ses questions|Die Sorge ernst nehmen und Fragen ermöglichen|Riconoscere la preoccupazione e invitare a fare domande|De bezorgdheid erkennen en uitnodigen om vragen te stellen|Reconocer la preocupación e invitar a hacer preguntas|Reconhecer a preocupação e dar espaço para perguntas|تفهم القلق وإتاحة المجال لطرح الأسئلة',
  'Face them and check their preferred way to communicate': 'Se placer face à la personne et lui demander comment elle préfère communiquer|Der Person zugewandt sprechen und nach ihrer bevorzugten Kommunikationsweise fragen|Mettersi di fronte alla persona e chiedere come preferisce comunicare|De persoon aankijken en vragen hoe die het liefst communiceert|Ponerse frente a la persona y preguntar cómo prefiere comunicarse|Ficar de frente para a pessoa e perguntar como prefere comunicar|مواجهة الشخص بالوجه وسؤاله عن طريقة التواصل التي يفضلها',
  'Listen and arrange appropriate feeding support': 'Écouter et proposer un accompagnement adapté pour nourrir le bébé|Zuhören und geeignete Unterstützung beim Füttern oder Stillen vermitteln|Ascoltare e organizzare un aiuto adeguato per alimentare il neonato|Luisteren en passende hulp regelen bij het voeden van de baby|Escuchar y facilitar apoyo adecuado para alimentar al bebé|Ouvir e procurar apoio adequado para alimentar a criança|الاستماع وتوفير الدعم المناسب لتغذية الرضيع',
  'On their back': 'Sur le dos|Auf dem Rücken|Sulla schiena|Op de rug|Boca arriba|De barriga para cima|على الظهر',
  'A parent is struggling with feeding. What is the most helpful response?': 'Un parent a du mal à nourrir son bébé. Quelle réponse est la plus utile ?|Ein Elternteil hat Schwierigkeiten, das Baby zu füttern oder zu stillen. Welche Reaktion hilft am meisten?|Un genitore ha difficoltà ad alimentare il neonato. Qual è la risposta più utile?|Een ouder heeft moeite met het voeden van de baby. Welke reactie helpt het meest?|Una persona tiene dificultades para alimentar a su bebé. ¿Cuál es la respuesta más útil?|Uma pessoa tem dificuldade para alimentar a sua criança recém-nascida. Qual é a resposta mais útil?|يواجه أحد الوالدين صعوبة في تغذية رضيعه. ما الاستجابة الأكثر فائدة؟',
  'Which sleep position is recommended for most healthy babies?': 'Quelle position de sommeil est recommandée pour la plupart des bébés en bonne santé ?|Welche Schlafposition wird für die meisten gesunden Babys empfohlen?|Quale posizione per dormire è raccomandata per la maggior parte dei neonati sani?|Welke slaaphouding wordt voor de meeste gezonde baby’s aanbevolen?|¿Qué posición para dormir se recomienda para la mayoría de los bebés sanos?|Que posição para dormir é recomendada para a maioria dos bebés ou bebês saudáveis?|ما وضعية النوم الموصى بها لمعظم الرضع الأصحاء؟',
  'What does antenatal or prenatal care mean?': 'Que désigne le suivi prénatal ?|Was bedeutet Schwangerenvorsorge?|Che cosa si intende per assistenza prenatale?|Wat betekent prenatale zorg?|¿Qué significa la atención prenatal?|O que são os cuidados pré-natais?|ما المقصود بالرعاية السابقة للولادة؟',
  'Turn the engine to begin starting it': 'Faire tourner le moteur pour lancer le démarrage|Den Motor zum Starten durchdrehen|Far girare il motore per avviarlo|De motor ronddraaien om hem te starten|Hacer girar el motor para arrancarlo|Fazer o motor girar para iniciar o funcionamento|تدوير المحرك لبدء تشغيله',
  'Seek urgent qualified maternity assessment': 'Demander une évaluation urgente par un professionnel de la maternité|Dringend eine fachkundige geburtshilfliche Untersuchung veranlassen|Richiedere una valutazione ostetrica urgente da parte di personale qualificato|Met spoed een beoordeling door een verloskundige of arts regelen|Solicitar una valoración obstétrica urgente por personal cualificado|Procurar uma avaliação urgente por um profissional de assistência à gravidez|طلب تقييم عاجل من مختص مؤهل في رعاية الحمل',
  'A severe new headache occurs with visual changes during pregnancy. What is safest?': 'Pendant la grossesse, un fort mal de tête apparaît avec des troubles visuels. Quelle est la conduite la plus sûre ?|In der Schwangerschaft treten neu starke Kopfschmerzen mit Sehstörungen auf. Was ist am sichersten?|Durante la gravidanza compare un forte mal di testa con disturbi della vista. Qual è la scelta più sicura?|Tijdens de zwangerschap ontstaan hevige hoofdpijn en problemen met het zien. Wat is het veiligst?|Durante el embarazo aparece un dolor de cabeza intenso con alteraciones de la visión. ¿Qué es lo más seguro?|Durante a gravidez, surge uma dor de cabeça intensa com alterações da visão. Qual é a resposta mais segura?|ظهر صداع شديد حديثًا مع تغيرات في الرؤية أثناء الحمل. ما التصرف الأكثر أمانًا؟',
  'A note says “left arm” but the handover says “right arm”. What needs clarification?': 'Le dossier indique « bras gauche », mais la transmission orale mentionne « bras droit ». Que faut-il clarifier ?|In der Dokumentation steht „linker Arm“, bei der Übergabe heißt es „rechter Arm“. Was muss geklärt werden?|La cartella riporta «braccio sinistro», ma nel passaggio di consegne si parla di «braccio destro». Che cosa va chiarito?|In het dossier staat ‘linkerarm’, maar bij de overdracht wordt ‘rechterarm’ genoemd. Wat moet worden opgehelderd?|La nota clínica dice «brazo izquierdo», pero en el relevo se menciona «brazo derecho». ¿Qué se debe aclarar?|O registo clínico diz «braço esquerdo», mas a passagem de informações refere «braço direito». O que precisa de ser esclarecido?|ورد في السجل «الذراع اليسرى»، لكن تقرير تسليم الحالة ذكر «الذراع اليمنى». ما الذي يحتاج إلى توضيح؟',
  '“Reports dizziness; observed to look pale”': '« La personne signale des vertiges ; une pâleur est observée »|„Berichtet über Schwindel; blasses Aussehen beobachtet“|«Riferisce capogiri; si osserva pallore»|‘Meldt duizeligheid; ziet er bleek uit’|«Refiere mareo; se observa palidez»|«Refere tonturas; observa-se palidez»|«يشكو من الدوار؛ لوحظ شحوب الوجه»',
  'What does cervical effacement describe?': 'Que désigne l’effacement du col de l’utérus ?|Was bedeutet das Verstreichen des Gebärmutterhalses?|Che cosa indica l’appianamento del collo dell’utero?|Wat betekent het verstrijken van de baarmoederhals?|¿Qué describe el borramiento del cuello uterino?|O que significa o apagamento do colo do útero?|ما المقصود بامّحاء عنق الرحم؟',
  'The cervix thinning': 'L’amincissement et le raccourcissement du col de l’utérus|Das Dünner- und Kürzerwerden des Gebärmutterhalses|L’assottigliamento e l’accorciamento del collo dell’utero|Het dunner en korter worden van de baarmoederhals|El adelgazamiento y acortamiento del cuello uterino|O afinamento e encurtamento do colo do útero|ترقّق عنق الرحم وقصره',
  'The baby is born but the placenta has not yet been delivered. Which stage is this?': 'Le bébé est né, mais le placenta n’a pas encore été expulsé. De quelle phase s’agit-il ?|Das Baby ist geboren, die Plazenta aber noch nicht. Welche Geburtsphase ist das?|Il bambino è nato, ma la placenta non è ancora stata espulsa. Di quale fase si tratta?|De baby is geboren, maar de placenta nog niet. Welke fase is dit?|El bebé ha nacido, pero la placenta aún no ha sido expulsada. ¿Qué fase es esta?|A criança já nasceu, mas a placenta ainda não foi expulsa. Em que fase está o parto?|وُلد الطفل، لكن المشيمة لم تخرج بعد. في أي مرحلة تكون الولادة؟',
  'Thorough drying and supported skin-to-skin care': 'Bien sécher le bébé et accompagner le contact peau à peau|Gründliches Abtrocknen und begleiteter Hautkontakt|Asciugare bene e favorire il contatto pelle a pelle con assistenza|Goed afdrogen en begeleid huid-op-huidcontact|Secar bien y facilitar el contacto piel con piel con apoyo|Secar bem e realizar o contacto pele a pele com apoio e vigilância|التجفيف جيدًا وتوفير تلامس الجلد بالجلد مع الدعم والمراقبة',
  'Which behaviour can be an early feeding cue?': 'Quel comportement peut être un premier signe de faim chez le nouveau-né ?|Welches Verhalten kann ein frühes Hungerzeichen bei Neugeborenen sein?|Quale comportamento può essere un primo segnale di fame nel neonato?|Welk gedrag kan een vroeg hongersignaal bij een pasgeborene zijn?|¿Qué comportamiento puede ser una señal temprana de hambre en un recién nacido?|Que comportamento pode ser um dos primeiros sinais de fome no recém-nascido?|أي سلوك قد يكون علامة مبكرة على جوع الرضيع؟',
  'Turning toward touch near the mouth and seeking to suck': 'Tourner la tête vers un contact près de la bouche et chercher à téter|Den Kopf zu einer Berührung nahe am Mund drehen und nach einer Saugmöglichkeit suchen|Girarsi verso un tocco vicino alla bocca e cercare di succhiare|Het hoofd naar een aanraking bij de mond draaien en proberen te zuigen|Girar hacia un roce cerca de la boca y buscar succionar|Virar-se para um toque junto à boca e procurar sugar|إدارة الرأس نحو لمسة قرب الفم ومحاولة المصّ',
};

function lookup(row, locale) {return row?.split('|')[locales.indexOf(locale)];}
const spatialTerms = {
  Right:'À droite|Nach rechts|A destra|Naar rechts|A la derecha|Para a direita|اليمين',
  Left:'À gauche|Nach links|A sinistra|Naar links|A la izquierda|Para a esquerda|اليسار',
  Up:'Vers le haut|Nach oben|Verso l’alto|Omhoog|Hacia arriba|Para cima|الأعلى',
  Down:'Vers le bas|Nach unten|Verso il basso|Omlaag|Hacia abajo|Para baixo|الأسفل',
  Circle:'Cercle|Kreis|Cerchio|Cirkel|Círculo|Círculo|دائرة',
  Square:'Carré|Quadrat|Quadrato|Vierkant|Cuadrado|Quadrado|مربع',
  Triangle:'Triangle|Dreieck|Triangolo|Driehoek|Triángulo|Triângulo|مثلث',
  Diamond:'Losange|Raute|Rombo|Ruit|Rombo|Losango|معين',
};
export function correctTerm(slug, locale, english) {
  const bible = ['bible','catholic'].includes(slug) ? bibleNames[english] : undefined;
  const spatial = ['oxford','cambridge'].includes(slug) ? spatialTerms[english] : undefined;
  return lookup(terms[slug]?.[english] ?? spatial ?? bible ?? clinical[english], locale);
}

// Full question rewrites remove idioms that do not translate literally.
const questions = {
  'chef-s1q2': 'Quel ustensile permet de fouetter de la crème à la main pour y incorporer de l’air ?|Welches Werkzeug eignet sich, um von Hand Luft in Sahne zu schlagen?|Quale utensile serve a incorporare aria nella panna montandola a mano?|Welk hulpmiddel is het meest geschikt om met de hand lucht in room te kloppen?|¿Qué utensilio permite incorporar aire a la crema al batirla a mano?|Que utensílio permite incorporar ar nas natas ou no creme de leite ao bater à mão?|ما الأداة الأنسب لخفق الكريمة يدويًا وإدخال الهواء فيها؟',
  'chef-s1q5': 'Quel ustensile sert à étaler une pâte en une couche plate ?|Mit welchem Werkzeug wird Teig flach ausgerollt?|Quale utensile si usa per stendere l’impasto in una sfoglia?|Welk hulpmiddel gebruik je om deeg tot een platte lap uit te rollen?|¿Qué utensilio se usa para extender una masa en una lámina plana?|Que utensílio serve para estender a massa numa camada plana?|ما الأداة المستخدمة لفرد العجين إلى طبقة مسطحة؟',
  'chef-s2q7': 'Dans une recette, que signifie « incorporer délicatement » ?|Was bedeutet „vorsichtig unterheben“ in einem Rezept?|Che cosa significa «incorporare delicatamente» in una ricetta?|Wat betekent ‘voorzichtig door het mengsel spatelen’ in een recept?|¿Qué significa «incorporar con movimientos envolventes» en una receta?|Numa receita, o que significa «envolver delicadamente» os ingredientes?|ما المقصود بتقليب المكونات برفق لدمجها في وصفة؟',
  'chef-s3q6': 'Après avoir fait dorer un aliment, quelle étape fait généralement partie du braisage ?|Welcher Schritt folgt beim Schmoren normalerweise auf das Anbraten?|Nella brasatura, quale passaggio segue di solito la rosolatura?|Welke stap volgt bij het smoren meestal op het aanbraden?|¿Qué paso suele seguir al dorado en un braseado?|Depois de dourar os alimentos, que etapa costuma fazer parte de uma cozedura lenta em recipiente tapado?|بعد تحمير الطعام، ما الخطوة المعتادة في الطهي البطيء بقدر مغطى؟',
  'chef-s5q5': 'Pourquoi délayer l’amidon dans un peu de liquide froid avant de l’ajouter à une sauce chaude ?|Warum wird Stärke vor der Zugabe zu einer heißen Soße mit etwas kalter Flüssigkeit angerührt?|Perché mescolare l’amido con poco liquido freddo prima di aggiungerlo a una salsa calda?|Waarom meng je zetmeel met een beetje koude vloeistof voordat je het aan een hete saus toevoegt?|¿Por qué se mezcla el almidón con un poco de líquido frío antes de añadirlo a una salsa caliente?|Por que misturar o amido com um pouco de líquido frio antes de juntar a um molho quente?|لماذا يُخلط النشا بقليل من السائل البارد قبل إضافته إلى صلصة ساخنة؟',
  'chef-s5q6': 'Que permet de récupérer le déglaçage d’une poêle ?|Was wird beim Ablöschen einer Pfanne gelöst?|Che cosa si recupera deglassando una padella?|Wat maak je los wanneer je een pan afblust?|¿Qué se recupera al desglasar una sartén?|O que se solta ao juntar líquido ao fundo de uma frigideira para a deglacear?|ما الذي يساعد سكب السائل في المقلاة الساخنة على فكه من قاعها بعد التحمير؟',
  'chef-s6q2': 'Pourquoi trop mélanger une pâte à muffins à base de blé peut-il rendre les muffins durs ?|Warum können Muffins mit Weizenmehl zäh werden, wenn der Teig zu lange gerührt wird?|Perché mescolare troppo un impasto per muffin con farina di frumento può renderli duri?|Waarom kunnen muffins van tarwebloem taai worden als je het beslag te veel mengt?|¿Por qué mezclar demasiado una masa de muffins con harina de trigo puede endurecerlos?|Por que misturar demasiado a massa de muffins com farinha de trigo pode deixá-los duros?|لماذا قد يصبح المافن المصنوع من دقيق القمح قاسيًا عند الإفراط في خلط عجينته؟',
  'chef-s6q6': 'Que signifie « cuire à blanc » une pâte à tarte ?|Was bedeutet „Blindbacken“?|Che cosa significa «cottura in bianco» di una base di pasta?|Wat betekent ‘blind bakken’?|¿Qué significa «hornear en blanco» una base de masa?|O que significa assar uma base de massa «em branco»?|ما المقصود بخَبز قاعدة العجين من دون حشو؟',
  'chef-s7q1': 'Une recette prévoit 300 g de riz pour 4 portions. Quelle quantité faut-il pour 10 portions identiques ?|Ein Rezept benötigt 300 g Reis für 4 Portionen. Wie viel wird für 10 gleich große Portionen benötigt?|Una ricetta usa 300 g di riso per 4 porzioni. Quanto riso serve per 10 porzioni uguali?|Een recept gebruikt 300 g rijst voor 4 porties. Hoeveel is nodig voor 10 even grote porties?|Una receta usa 300 g de arroz para 4 porciones. ¿Cuánto se necesita para 10 porciones iguales?|Uma receita usa 300 g de arroz para 4 porções. Que quantidade é necessária para 10 porções iguais?|تستخدم وصفة 300 غ من الأرز لأربع حصص. ما الكمية اللازمة لعشر حصص بالحجم نفسه؟',
  'chef-s7q5': 'Une recette prévoit 240 g de beurre. Vous préparez une demi-recette. Quelle quantité faut-il ?|Ein Rezept benötigt 240 g Butter. Sie bereiten die halbe Menge zu. Wie viel Butter brauchen Sie?|Una ricetta richiede 240 g di burro. Ne prepari metà. Quanto burro serve?|Een recept vraagt om 240 g boter. Je maakt de helft van het recept. Hoeveel boter heb je nodig?|Una receta necesita 240 g de mantequilla. Vas a preparar la mitad. ¿Cuánta necesitas?|Uma receita usa 240 g de manteiga. Para preparar metade da receita, que quantidade é necessária?|تحتاج وصفة إلى 240 غ من الزبدة. ما الكمية اللازمة لتحضير نصف الوصفة؟',
  'iq-s10q1': 'Une seule personne dit la vérité. A dit que B ment. B dit que C ment. C dit que A et B mentent tous les deux. Qui dit la vérité ?|Genau eine Person sagt die Wahrheit. A sagt, B lügt. B sagt, C lügt. C sagt, A und B lügen beide. Wer sagt die Wahrheit?|Una sola persona dice la verità. A dice che B mente. B dice che C mente. C dice che A e B mentono entrambi. Chi dice la verità?|Precies één persoon spreekt de waarheid. A zegt dat B liegt. B zegt dat C liegt. C zegt dat A en B allebei liegen. Wie spreekt de waarheid?|Exactamente una persona dice la verdad. A dice que B miente. B dice que C miente. C dice que A y B mienten. ¿Quién dice la verdad?|Exatamente uma pessoa diz a verdade. A diz que B mente. B diz que C mente. C diz que A e B mentem. Quem diz a verdade?|شخص واحد فقط يقول الحقيقة. يقول A إن B يكذب. ويقول B إن C يكذب. ويقول C إن A وB يكذبان معًا. من يقول الحقيقة؟',
  'iq-s4q2': 'Tous les NIM sont des TOV. Aucun TOV n’est un RAK. Un NIM peut-il être un RAK ?|Alle NIM sind TOV. Kein TOV ist RAK. Kann ein NIM ein RAK sein?|Tutti i NIM sono TOV. Nessun TOV è RAK. Un NIM può essere RAK?|Alle NIM zijn TOV. Geen enkele TOV is RAK. Kan een NIM een RAK zijn?|Todos los NIM son TOV. Ningún TOV es RAK. ¿Puede algún NIM ser RAK?|Todos os NIM são TOV. Nenhum TOV é RAK. Algum NIM pode ser RAK?|كل NIM هو TOV، ولا يوجد أي TOV من فئة RAK. هل يمكن أن يكون أي NIM من فئة RAK؟',
  'iq-s6q5': 'Quel symbole apparaît deux fois dans AB7C2B9 ?|Welches Zeichen kommt in AB7C2B9 zweimal vor?|Quale simbolo compare due volte in AB7C2B9?|Welk teken komt twee keer voor in AB7C2B9?|¿Qué símbolo aparece dos veces en AB7C2B9?|Que símbolo aparece duas vezes no código AB7C2B9?|أي رمز يتكرر مرتين في AB7C2B9؟',
};

export function applyQuestionCorrections(copy, locale) {
  for (const stage of Object.values(copy.stages)) for (const [id, question] of Object.entries(stage.questions)) {
    if (questions[id]) question.question = lookup(questions[id], locale);
  }
}
