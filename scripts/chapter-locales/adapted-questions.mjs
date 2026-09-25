import {translationRowLocales as locales} from './config.mjs';

// Common-name/anatomical-name pairs collapse to the same word in several
// languages. Identify the same structure by its location or function instead.
const rows = {
  'memory-s2q4': 'Quel fruit figurait dans la nouvelle liste de mots ?|Welche Frucht stand auf der neuen Wortliste?|Quale frutto compariva nel nuovo elenco di parole?|Welke vrucht stond op de nieuwe woordenlijst?|¿Qué fruta aparecía en la nueva lista de palabras?|Que fruta aparecia na nova lista de palavras?|ما الفاكهة التي ظهرت في قائمة الكلمات الجديدة؟',
  'memory-s3q6': 'Quelle forme terminait la liste de formes ?|Welche Form stand am Ende der Formenliste?|Quale forma era l’ultima nell’elenco delle forme?|Welke vorm stond als laatste in de lijst met vormen?|¿Qué figura aparecía al final de la lista de formas?|Que forma aparecia no fim da lista de formas?|ما الشكل الذي جاء أخيرًا في قائمة الأشكال؟',
  'memory-s6q6': 'Quel objet avait un motif à carreaux ?|Welcher Gegenstand hatte ein Karomuster?|Quale oggetto aveva un motivo a quadretti?|Welk voorwerp had een ruitjespatroon?|¿Qué objeto tenía un estampado de cuadros?|Que objeto tinha um padrão aos quadrados?|أي شيء كان عليه نقشة مربعات؟',
  'memory-s9q7': 'De quelle matière était fait le jeton du casier ?|Aus welchem Material bestand die Marke für das Schließfach?|Di che materiale era il gettone dell’armadietto?|Van welk materiaal was het muntje voor het kluisje gemaakt?|¿De qué material era la ficha del casillero?|De que material era feita a ficha do armário?|ممَّ صُنعت القطعة المرتبطة بالخزانة؟',
  'anatomy-s2q1': 'Quel os se trouve à l’avant de l’articulation du genou ?|Welcher Knochen liegt an der Vorderseite des Kniegelenks?|Quale osso si trova davanti all’articolazione del ginocchio?|Welk bot ligt aan de voorkant van het kniegewricht?|¿Qué hueso se encuentra en la parte delantera de la rodilla?|Que osso fica na parte da frente da articulação do joelho?|أي عظم يقع في مقدمة مفصل الركبة؟',
  'anatomy-s2q3': 'Quel os relie le sternum à l’omoplate ?|Welcher Knochen verbindet das Brustbein mit dem Schulterblatt?|Quale osso collega lo sterno alla scapola?|Welk bot verbindt het borstbeen met het schouderblad?|¿Qué hueso conecta el esternón con la escápula?|Que osso liga o esterno à omoplata?|أي عظم يصل عظم القص بلوح الكتف؟',
  'anatomy-s2q5': 'Quel est l’os le plus long du corps humain ?|Welcher ist der längste Knochen des menschlichen Körpers?|Qual è l’osso più lungo del corpo umano?|Wat is het langste bot in het menselijk lichaam?|¿Cuál es el hueso más largo del cuerpo humano?|Qual é o osso mais comprido do corpo humano?|ما أطول عظم في جسم الإنسان؟',
  'anatomy-s5q2': 'Quel conduit relie le larynx aux bronches ?|Welche Röhre verbindet den Kehlkopf mit den Bronchien?|Quale condotto collega la laringe ai bronchi?|Welke buis verbindt het strottenhoofd met de bronchiën?|¿Qué conducto conecta la laringe con los bronquios?|Que tubo liga a laringe aos brônquios?|أي أنبوب يصل الحنجرة بالشعبتين الهوائيتين؟',
  'vision-s1q6': 'Dans quel dessin la petite branche pointe-t-elle vers la gauche ?|Bei welcher Zeichnung zeigt der kleine Seitenast nach links?|In quale disegno il piccolo ramo punta a sinistra?|Bij welke tekening wijst het korte zijtakje naar links?|¿En qué dibujo apunta la pequeña rama hacia la izquierda?|Em que desenho o pequeno ramo aponta para a esquerda?|في أي رسم يتجه الفرع الصغير إلى اليسار؟',
  'vision-s2q7': 'Combien de lettres E majuscules sont cachées ici ?|Wie viele Großbuchstaben E sind hier versteckt?|Quante lettere E maiuscole sono nascoste qui?|Hoeveel hoofdletters E zijn hier verborgen?|¿Cuántas letras E mayúsculas hay aquí?|Quantas letras E maiúsculas estão escondidas aqui?|كم حرف E كبيرًا يوجد هنا؟',
  'vision-s9q7': 'Combien de lettres Q se trouvent parmi les lettres O ?|Wie viele Buchstaben Q stehen zwischen den Buchstaben O?|Quante lettere Q ci sono tra le lettere O?|Hoeveel letters Q staan er tussen de letters O?|¿Cuántas letras Q hay entre las letras O?|Quantas letras Q aparecem entre as letras O?|كم حرف Q يوجد بين حروف O؟',
  'iq-s9q2': 'Les nombres aux positions impaires augmentent de 1, ceux aux positions paires de 4 : 2, 8, 3, 12, 4, 16, 5, ?. Quel nombre manque ?|Die Zahlen an ungeraden Stellen steigen um 1, die an geraden Stellen um 4: 2, 8, 3, 12, 4, 16, 5, ?. Welche Zahl fehlt?|I numeri nelle posizioni dispari aumentano di 1, quelli nelle posizioni pari di 4: 2, 8, 3, 12, 4, 16, 5, ?. Quale numero manca?|De getallen op oneven plaatsen nemen toe met 1, die op even plaatsen met 4: 2, 8, 3, 12, 4, 16, 5, ?. Welk getal ontbreekt?|Los números en posiciones impares aumentan de 1 en 1 y los de posiciones pares, de 4 en 4: 2, 8, 3, 12, 4, 16, 5, ?. ¿Qué número falta?|Os números nas posições ímpares aumentam de 1 em 1; nas posições pares, de 4 em 4: 2, 8, 3, 12, 4, 16, 5, ?. Que número falta?|تزداد الأعداد في المواضع الفردية بمقدار 1، وفي المواضع الزوجية بمقدار 4: 2, 8, 3, 12, 4, 16, 5, ?. ما العدد الناقص؟',
  'catholic-s10q5': 'Que désigne l’Assomption dans l’enseignement catholique ?|Was bedeutet Mariä Aufnahme in den Himmel in der katholischen Lehre?|Che cosa indica l’Assunzione nell’insegnamento cattolico?|Waarover gaat Maria-Tenhemelopneming in de katholieke leer?|¿A qué se refiere la Asunción en la enseñanza católica?|A que se refere a Assunção no ensino católico?|ما المقصود بعقيدة انتقال العذراء في التعليم الكاثوليكي؟',
  'catholic-s1q4': 'Quelle prière est aussi appelée « la prière du Seigneur » ?|Welches Gebet wird auch „Gebet des Herrn“ genannt?|Quale preghiera è detta anche «preghiera del Signore»?|Welk gebed wordt ook het ‘gebed des Heren’ genoemd?|¿Qué oración también se conoce como «la oración del Señor»?|Que oração também é conhecida como «a oração do Senhor»?|أي صلاة تُعرف أيضًا باسم «الصلاة الربانية»؟',
  'catholic-s6q1': 'Combien de « Je vous salue Marie » compte une dizaine du rosaire ?|Wie viele Ave Maria gehören zu einem Gesätz des Rosenkranzes?|Quante Ave Maria formano una decina del Rosario?|Hoeveel weesgegroetjes vormen één tientje van de rozenkrans?|¿Cuántas avemarías forman una decena del rosario?|Quantas Ave-Marias formam uma dezena do Rosário?|كم مرة تُتلى صلاة السلام عليكِ يا مريم في بيت واحد من الوردية؟',
  'catholic-s9q1': 'Qu’est-ce qu’un diocèse, généralement confié à un évêque ?|Was ist eine Diözese, die normalerweise einem Bischof anvertraut ist?|Che cos’è una diocesi, affidata normalmente a un vescovo?|Wat is een bisdom, dat doorgaans aan een bisschop is toevertrouwd?|¿Qué es una diócesis, confiada normalmente a un obispo?|O que é uma diocese, normalmente confiada a um bispo?|ما الأبرشية التي تُعهد عادةً إلى أسقف؟',
  'catholic-s10q1': 'Quelle vertu théologale complète la foi et l’espérance ?|Welche theologische Tugend steht neben Glaube und Hoffnung?|Quale virtù teologale si affianca alla fede e alla speranza?|Welke goddelijke deugd hoort naast geloof en hoop?|¿Qué virtud teologal acompaña a la fe y la esperanza?|Que virtude teologal acompanha a fé e a esperança?|أي فضيلة إلهية تُذكر مع الإيمان والرجاء؟',
  'chef-s10q3': 'Une recette utilise 1800 g d’un ingrédient pour 12 portions égales. Quelle quantité faut-il pour 18 portions ?|Ein Rezept braucht 1800 g einer Zutat für 12 gleich große Portionen. Wie viel wird für 18 Portionen benötigt?|Una ricetta usa 1800 g di un ingrediente per 12 porzioni uguali. Quanto ne serve per 18 porzioni?|Een recept gebruikt 1800 g van een ingrediënt voor 12 gelijke porties. Hoeveel is nodig voor 18 porties?|Una receta usa 1800 g de un ingrediente para 12 porciones iguales. ¿Cuánto se necesita para 18 porciones?|Uma receita usa 1800 g de um ingrediente para 12 porções iguais. Que quantidade é necessária para 18 porções?|تستخدم وصفة 1800 غ من أحد المكونات لتحضير 12 حصة متساوية. ما الكمية اللازمة لتحضير 18 حصة؟',
};

const ar = {
  'memory-s3q7': 'بدّل الرمز الأول والأخير فقط في K6P2. ما النتيجة؟',
  'memory-s4q3': 'أبقِ أول رمزين في B7RK كما هما، وبدّل آخر رمزين فقط.',
  'memory-s5q2': 'ما رقم الرصيف الذي ظهر لقطار مايا؟',
  'memory-s8q4': 'كم حبة ليمون أخضر كانت في قائمة المشتريات؟',
  'memory-s10q3': 'أي كلمة في اللوحة الأخيرة ارتبطت بالعدد 5؟',
  'anatomy-s1q6': 'أي عضو يقلب الطعام ويمزجه بالحمض؟',
  'anatomy-s3q6': 'أي مفصل تبسطه العضلة رباعية الرؤوس بشكل أساسي؟',
  'anatomy-s8q1': 'ما البنية الشفافة التي تغطي مقدمة العين؟',
  'chef-s2q3': 'ما المقصود ببشر قشر الليمون؟',
  'chef-s3q4': 'كيف يبدو سطح السائل عند غليانه برفق؟',
  'chef-s5q4': 'ممَّ يتكون خليط «الرو» المستخدم لتكثيف الصلصات عادةً؟',
  'chef-s6q5': 'ما الذي يساعد عجن عجينة خبز القمح على تكوينه أساسًا؟',
  'chef-s9q7': 'يبدو طبق الطعام غير مكتمل. ما الغرض من إضافة زينة مناسبة صالحة للأكل؟',
  'chef-s10q1': 'المطلوب تحمير الخضار، لكنها تطهى بالبخار في مقلاة مزدحمة. أي تغيير يعالج السبب؟',
  'chef-s10q3': 'تستخدم وصفة 1800 غ من أحد المكونات لتحضير 12 حصة متساوية. ما الكمية اللازمة لتحضير 18 حصة؟',
  'chef-s10q7': 'انفصل الزيت عن الخل في صلصة السلطة بعد تركها قليلًا. ما أفضل تفسير؟',
  'mechanic-s4q4': 'ما الغرض من المصهر في الدائرة الكهربائية؟',
  'mechanic-s7q1': 'تستهلك سيارة اختبار 18 لترًا من الوقود لقطع 300 كم. بالمعدل نفسه، كم تستهلك لقطع 100 كم؟',
  'mechanic-s10q3': 'ترتفع حرارة المحرك عند التوقف وتنخفض أثناء السير. خلال اختبار، أُرسلت إشارة تشغيل إلى مروحة التبريد لكنها لم تدر. ما الذي ينبغي فحصه أولًا؟',
  'iq-s1q6': 'يزداد عدد الأضلاع واحدًا في كل مرة: مثلث، مربع، خماسي الأضلاع. ما الشكل التالي؟',
  'iq-s7q3': 'أنهى أربعة متسابقين السباق من دون تعادل. لي قبل كاي، وكاي قبل جو، وسام بعد جو. من وصل ثانيًا؟',
  'iq-s7q5': 'يجب أن تنتهي المهمة A قبل B، والمهمة B قبل C. أي مهمة يجب أن تنتهي أولًا؟',
  'iq-s8q4': 'تضرب آلة العدد المدخل في 3 فتعطي 27. ما العدد المدخل؟',
  'vision-s1q3': 'أي شكل مُعيَّن مرسوم بمحيط فقط؟',
  'vision-s3q7': 'يدور المثلث ويتناوب بين شكل ممتلئ وآخر بمحيط فقط. ما التالي؟',
  'vision-s5q2': 'أي مربع رمادي هو الأفتح لونًا؟',
  'vision-s7q1': 'أي رمز من النموذج الأصلي استُبدل؟',
  'catholic-s1q5': 'ما هو قانون الإيمان؟',
  'catholic-s3q3': 'ما صيغة إعلان الإيمان التي تُتلى عادةً في قداس الأحد؟',
  'catholic-s4q5': 'ما اسم الإناء المستخدم لخمر الإفخارستيا؟',
  'catholic-s6q3': 'أي مجموعة من أسرار الوردية تتضمن ميلاد يسوع؟',
  'catholic-s6q4': 'أي مجموعة من أسرار الوردية تتضمن الصلب؟',
  'catholic-s6q5': 'أي مجموعة من أسرار الوردية تتضمن القيامة؟',
  'catholic-s6q6': 'أي مجموعة من أسرار الوردية تتضمن التجلي؟',
  'catholic-s9q4': 'إلى أي خادم مرسوم تُعهد عادةً الرعاية الراعوية للرعية؟',
  'catholic-s10q1': 'أي فضيلة إلهية تُذكر مع الإيمان والرجاء؟',
  'bible-s6q6': 'من يأخذ مريم ويسوع إلى مصر بعد تحذير في حلم؟',
  'bible-s8q4': 'أي بذرة صغيرة شبّه بها يسوع الملكوت؟',
};

export function adaptNativeQuestions(copy, locale) {
  for (const stage of Object.values(copy.stages)) for (const [id, question] of Object.entries(stage.questions)) {
    question.question = rows[id]?.split('|')[locales.indexOf(locale)] ?? (locale === 'ar' ? ar[id] : undefined) ?? question.question;
  }
}
