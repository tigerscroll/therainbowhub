const languages = ['fr', 'de', 'it', 'nl', 'es', 'pt', 'ar'];
// Disambiguate verbs and everyday metaphors before they reach the quiz.
const meanings = {
  'Play': ['Pièce de théâtre', 'Theaterstück', 'Opera teatrale', 'Toneelstuk', 'Obra de teatro', 'Peça de teatro', 'مسرحية'],
  'A demonstration by a skilled maker': ['Une démonstration par un artisan', 'Eine Vorführung von jemandem mit handwerklichem Können', 'Una dimostrazione di un artigiano esperto', 'Een demonstratie door een vakbekwame maker', 'Una demostración de una persona experta en artesanía', 'Uma demonstração de artesanato', 'عرض يقدمه حرفي ماهر'],
  'Someone’s warmth': ['La chaleur humaine de quelqu’un', 'Die Herzlichkeit eines Menschen', 'Il calore umano di una persona', 'Iemands hartelijkheid', 'La calidez de una persona', 'A simpatia de alguém', 'ودّ الشخص'],
  'Someone’s reassuring ease': ['Le calme rassurant de quelqu’un', 'Die beruhigende Gelassenheit eines Menschen', 'La serenità rassicurante di una persona', 'Iemands geruststellende rust', 'La tranquilidad que transmite una persona', 'A tranquilidade que alguém transmite', 'هدوء الشخص الذي يبعث على الاطمئنان'],
  'Check in with someone': ['Prendre des nouvelles de quelqu’un', 'Nachfragen, wie es jemandem geht', 'Chiedere a qualcuno come sta', 'Vragen hoe het met iemand gaat', 'Preguntar a alguien cómo está', 'Saber como alguém está', 'الاطمئنان على شخص أعرفه'],
  'An unexpected hour becomes free. Your first instinct is to…': ['Tu as soudain une heure de libre. Ton premier réflexe est de…', 'Du hast unerwartet eine Stunde Zeit. Dein erster Impuls ist …', 'Si libera un’ora inaspettata. Il tuo primo istinto è…', 'Je hebt onverwacht een uur voor jezelf. Je eerste gedachte is…', 'De pronto tienes una hora libre. Tu primer impulso es…', 'Surge uma hora livre inesperada. O primeiro instinto é…', 'أصبحت لديك فجأة ساعة من وقت الفراغ. ما أول ما يخطر ببالك؟'],
  'Find someone to spend it with': ['Trouver quelqu’un avec qui passer ce moment', 'Jemanden finden, mit dem ich die Zeit verbringen kann', 'Trovare qualcuno con cui passare quel tempo', 'Iemand zoeken om die tijd mee door te brengen', 'Buscar a alguien con quien pasar ese rato', 'Encontrar alguém com quem passar esse tempo', 'أبحث عن شخص أقضي معه هذا الوقت'],
  'A museum gives you a free hour. Where do you begin?': ['Tu as une heure pour visiter un musée. Par quoi commences-tu ?', 'Du hast eine Stunde für einen Museumsbesuch. Wo fängst du an?', 'Hai un’ora per visitare un museo. Da dove inizi?', 'Je hebt een uur in een museum. Waar begin je?', 'Tienes una hora para visitar un museo. ¿Por dónde empiezas?', 'Tem uma hora para visitar um museu. Por onde começar?', 'لديك ساعة لزيارة متحف. من أين تبدأ؟'],
  'A whole afternoon is free. What sounds best?': ['Tout un après-midi de libre. Qu’est-ce qui te tente ?', 'Du hast einen ganzen Nachmittag Zeit. Was klingt am besten?', 'Hai un intero pomeriggio libero. Che cosa preferisci?', 'Je hebt een hele middag vrij. Wat lijkt je het fijnst?', 'Tienes toda una tarde libre. ¿Qué te apetece más?', 'Tem uma tarde inteira livre. O que parece melhor?', 'لديك فترة ما بعد الظهر كاملة لنفسك. ما الذي تفضّله؟'],
  'A quiet stretch for careful focus': ['Un moment tranquille pour me concentrer', 'Eine ruhige Zeit zum konzentrierten Arbeiten', 'Un periodo tranquillo per concentrarmi', 'Een rustige periode om me te concentreren', 'Un rato tranquilo para concentrarme', 'Um período tranquilo para me concentrar', 'وقت هادئ للتركيز بعناية'],
  'Good company and places to talk': ['De la bonne compagnie et des endroits où discuter', 'Gute Gesellschaft und Orte zum Reden', 'Buona compagnia e posti dove parlare', 'Fijn gezelschap en plekken om te praten', 'Buena compañía y lugares para conversar', 'Boa companhia e lugares para conversar', 'صحبة طيبة وأماكن للحديث'],
  'The company I am with': ['Les personnes qui m’accompagnent', 'Die Menschen, mit denen ich unterwegs bin', 'Le persone che sono con me', 'De mensen met wie ik ben', 'Las personas que me acompañan', 'As pessoas que estão comigo', 'الأشخاص الذين أكون معهم'],
  'Which room would you choose for a free afternoon?': ['Dans quelle pièce aimerais-tu passer un après-midi libre ?', 'Welchen Raum würdest du für einen freien Nachmittag wählen?', 'In quale stanza passeresti un pomeriggio libero?', 'In welke ruimte zou je een vrije middag doorbrengen?', '¿En qué espacio pasarías una tarde libre?', 'Em que espaço passaria uma tarde livre?', 'في أي غرفة تفضّل قضاء وقت فراغك بعد الظهر؟'],
  'You notice what others miss': ['Tu remarques ce qui échappe aux autres', 'Du bemerkst, was anderen entgeht', 'Noti ciò che sfugge agli altri', 'Je ziet wat anderen ontgaat', 'Ves lo que a otros se les escapa', 'Nota o que passa despercebido aos outros', 'تلاحظ ما يفوت الآخرين'],
  'Full of character and welcome': ['Plein de caractère et accueillant', 'Charaktervoll und einladend', 'Pieno di carattere e accogliente', 'Karaktervol en gastvrij', 'Con personalidad y acogedor', 'Com personalidade e acolhedor', 'له طابع مميز ويشعرني بالترحيب'],
  'What is your favourite part of hosting?': ['Qu’est-ce que tu préfères quand tu reçois des invités ?', 'Was gefällt dir am meisten daran, Gäste einzuladen?', 'Che cosa ti piace di più quando ricevi ospiti?', 'Wat vind je het fijnst aan gasten ontvangen?', '¿Qué disfrutas más al recibir visitas?', 'De que mais gosta ao receber convidados?', 'ما أكثر ما تستمتع به عند استقبال الضيوف؟'],
  'A simple room with a restful atmosphere': ['Une pièce simple à l’atmosphère reposante', 'Ein schlichter Raum mit ruhiger Atmosphäre', 'Una stanza semplice e riposante', 'Een eenvoudige ruimte met een rustige sfeer', 'Un espacio sencillo y tranquilo', 'Um espaço simples e tranquilo', 'غرفة بسيطة وأجواء مريحة'],
  'Past familiar faces and meeting places': ['Par des lieux où je croise des visages connus', 'Vorbei an vertrauten Menschen und Treffpunkten', 'Tra volti conosciuti e luoghi di ritrovo', 'Langs bekende gezichten en ontmoetingsplekken', 'Por lugares de encuentro y caras conocidas', 'Por lugares de encontro e rostos conhecidos', 'عبر أماكن ألتقي فيها بوجوه مألوفة'],
  'Past something interesting to examine': ['Par un endroit avec quelque chose à observer de près', 'Vorbei an etwas, das sich genauer ansehen lässt', 'Accanto a qualcosa da osservare con attenzione', 'Langs iets interessants om goed te bekijken', 'Por un lugar con algo interesante que observar', 'Por um lugar com algo interessante para observar', 'عبر مكان فيه شيء يستحق التأمل'],
  'Along a path I have not tried': ['Par un chemin que je n’ai jamais pris', 'Auf einem Weg, den ich noch nicht kenne', 'Lungo un sentiero che non conosco', 'Over een pad dat ik nog niet ken', 'Por un camino que aún no conozco', 'Por um caminho que ainda não conheço', 'عبر مسار لم أجرّبه من قبل'],
  'With the finest details of one object': ['Par les détails les plus fins d’un objet', 'Mit den feinsten Details eines Gegenstands', 'Dai dettagli più minuti di un oggetto', 'Bij de kleinste details van één voorwerp', 'Por los detalles más pequeños de un objeto', 'Pelos detalhes mais pequenos de um objeto', 'بأدق تفاصيل قطعة واحدة'],
  'A place with a detailed tradition to learn': ['Un lieu où découvrir une tradition en profondeur', 'Ein Ort, an dem ich eine Tradition näher kennenlerne', 'Un luogo dove conoscere a fondo una tradizione', 'Een plek om een traditie beter te leren kennen', 'Un lugar para conocer a fondo una tradición', 'Um lugar para conhecer uma tradição em profundidade', 'مكان أتعرف فيه على تقليد بتفاصيله'],
  'Something that makes it feel generous': ['Quelque chose qui rend le plat plus généreux', 'Etwas, das das Gericht großzügiger wirken lässt', 'Qualcosa che renda il piatto più ricco', 'Iets dat het gerecht royaler maakt', 'Algo que haga el plato más abundante', 'Algo que torne o prato mais generoso', 'إضافة تجعل الطبق أكثر سخاءً'],
  'Somewhere I feel warmly included': ['Un endroit où je me sens vraiment accueilli', 'Ein Ort, an dem ich mich herzlich aufgenommen fühle', 'Un posto dove mi sento accolto con calore', 'Een plek waar ik me warm ontvangen voel', 'Un lugar donde me siento bien recibido', 'Um lugar onde me sinto bem acolhido', 'مكان أشعر فيه بالترحيب والانتماء'],
  'Its warmth': ['Sa chaleur humaine', 'Ihre Herzlichkeit', 'Il suo calore umano', 'De hartelijkheid', 'Su calidez humana', 'A sua simpatia e proximidade', 'دفؤها الإنساني'],
  'Its ease': ['Sa simplicité tranquille', 'Ihre Gelassenheit', 'La sua serenità', 'De rust', 'Su tranquilidad', 'A sua tranquilidade', 'بساطتها وهدوؤها'],
  'Plan A is faster; Plan B is cheaper. Neither goal is ranked. What is needed to choose between them?': ['Le plan A est plus rapide ; le plan B coûte moins cher. Aucune priorité n’est définie. Que faut-il savoir pour choisir ?', 'Plan A ist schneller, Plan B günstiger. Keine Priorität ist festgelegt. Was braucht man für die Entscheidung?', 'Il piano A è più rapido, il piano B costa meno. Non è stata stabilita una priorità. Che cosa serve per scegliere?', 'Plan A is sneller, plan B is goedkoper. Er is geen prioriteit bepaald. Wat is nodig om te kiezen?', 'El plan A es más rápido y el B más barato. No se ha fijado una prioridad. ¿Qué hace falta para elegir?', 'O plano A é mais rápido e o B custa menos. Não foi definida uma prioridade. O que falta para escolher?', 'الخطة A أسرع والخطة B أقل تكلفة. لم تُحدَّد أولوية للسرعة أو التكلفة. ما الذي نحتاجه للاختيار؟'],
};

// Correct occasional untranslated fragments returned inside otherwise native drafts.
const fragments = {
  fr: {
    'The colour of their notebooks': 'La couleur de leurs cahiers',
    'What extra fact would determine the number of red counters?': 'Quelle information permettrait de connaître le nombre de jetons rouges ?',
    'A timetable gives a start but no finish.': 'Un horaire indique le début, mais pas la fin.',
    'Rae sits at 4. Sol sits two seats to Rae’s left.': 'Rae occupe la place 4. Sol est deux places à sa gauche.',
    'P is excluded.': 'P est exclu.',
  },
  it: {
    'A report names its source, date and sample size.': 'Un rapporto indica fonte, data e dimensione del campione.',
    'Attendance changed somehow': 'Le presenze sono cambiate in qualche modo',
    'No proposal was accepted': 'Nessuna proposta è stata accettata',
    'It trades lower cost for more time': 'Costa meno, ma richiede più tempo',
    'Of them, 60 answered a survey.': 'Di questi, 60 hanno risposto a un sondaggio.',
  },
  nl: {
    'Cambridge-inspired quiz complete': 'De quiz geïnspireerd op Cambridge is afgerond',
    'How many centimetres is that?': 'Hoeveel centimeter is dat?',
    'To test whether light affects plant growth, which factor should you deliberately vary?': 'Welke factor verander je bewust om te onderzoeken of licht de groei van planten beïnvloedt?',
  },
  es: {
    'Thoughtful, precise and quietly curious': 'Reflexivo, preciso y de curiosidad tranquila',
    'You value personal space without losing connection, and you are happiest when comfort, nature and thoughtful design work together.': 'Valoras el espacio personal sin perder los vínculos. Disfrutas cuando la comodidad, la naturaleza y un entorno cuidado se complementan.',
    'A quiet spot beside someone I know': 'Un rincón tranquilo junto a alguien que conozco',
    'Keeping what already works well': 'Mantener lo que ya funciona bien',
    'Keep the plan manageable': 'Mantener un plan fácil de llevar a cabo',
    'The care visible in the result': 'El cuidado que se aprecia en el resultado',
    'Try another route': 'Probar otro camino',
    'This independent entertainment challenge is inspired by academic reasoning.': 'Este reto de entretenimiento independiente se inspira en el razonamiento académico.',
    'Lee has a permit.': 'Lee tiene un permiso.',
    'You passed this Cambridge-inspired quiz!': '¡Has superado este reto inspirado en Cambridge!',
    'The group repeats: circle, square, square.': 'Se repite el grupo: círculo, cuadrado, cuadrado.',
    'Growth over the same period': 'El crecimiento durante el mismo periodo',
    'A researcher assigns subjects to groups by chance.': 'Una persona investigadora asigna participantes a los grupos al azar.',
    'To ensure everyone gets the same answer': 'Para garantizar que todos obtengan la misma respuesta',
    'It moved 2 units left': 'Se desplazó 2 unidades a la izquierda',
    'What distance does 3,5 cm represent?': '¿Qué distancia representan 3,5 cm?',
    'It displays 14. What is the corrected value?': 'Indica 14. ¿Cuál es el valor corregido?',
    'Model A predicts 5 and 9;': 'El modelo A predice 5 y 9;',
  },
  pt: {
    'People who include me in the conversation': 'Pessoas que me incluem na conversa',
    'Which answer feels closest?': 'Qual resposta se aproxima mais do que sente?',
    'One with meaningful little rituals': 'Uma rotina com pequenos rituais importantes',
    'Which appeals most?': 'Qual caminho parece mais interessante?',
    'Packaging caused the whole rise': 'A embalagem causou todo o aumento',
    'Every alternative is impossible': 'Todas as alternativas são impossíveis',
    'The group repeats: circle, square, square.': 'Repete-se o grupo: círculo, quadrado, quadrado.',
    'How many seconds is that?': 'A quantos segundos corresponde?',
    'A scale always reads 2 g too high.': 'Uma balança indica sempre 2 g acima do valor real.',
    'The plant labels only': 'Apenas as etiquetas das plantas',
  },
  ar: {
    'You have to choose at the last minute.': 'عليك الاختيار في اللحظة الأخيرة.',
    'Treating it as a new experience': 'أتعامل معه كتجربة جديدة',
    'Which invitation feels most like your next chapter?': 'أي دعوة تشبه ما تتمناه للمرحلة المقبلة من حياتك؟',
    'Somewhere that rewards a closer look': 'مكان أكتشف تفاصيله كلما تأملته',
    'I discovered something new': 'اكتشفت شيئًا جديدًا',
    'It is not an official Harvard admissions test, an assessment of academic potential or a prediction of admission.': 'ليس اختبار قبول رسميًا في هارفارد، ولا تقييمًا للقدرات الأكاديمية أو توقعًا للقبول الجامعي.',
    'The meeting has already happened': 'عُقد الاجتماع بالفعل',
    'To make every reading identical': 'لجعل جميع القراءات متطابقة',
    'To prevent any criticism': 'لمنع أي نقد',
    'Later readings are higher': 'القراءات اللاحقة أعلى',
    'It moved 3 units right': 'تحرك 3 وحدات إلى اليمين',
    'One where both predict exactly the same outcome': 'اختبار يتنبأ فيه التفسيران بالنتيجة نفسها تمامًا',
    'Replace it with the predicted value': 'استبدالها بالقيمة المتوقعة',
    'A mixture is 1 part dye to 4 parts water.': 'يتكون الخليط من جزء واحد من الصبغة لكل 4 أجزاء من الماء.',
    'observations are 13, 17 and 24. What is the total absolute error?': 'والقيم المرصودة هي 13 و17 و24. ما مجموع الأخطاء المطلقة؟',
    'What is the strongest next check?': 'ما أفضل طريقة تالية لاختباره؟',
  },
};

const arabicQuestions = {
  'harvard-s1q5': 'يجب تقديم ثلاثة تقارير بالترتيب: A قبل B، وB قبل C. أيها يجب أن يأتي أولًا؟',
  'harvard-s5q2': 'أنجز الفريق A عدد 18 من أصل 20 مهمة، وأنجز الفريق B عدد 24 من أصل 30. أيهما له نسبة إنجاز أعلى؟',
  'harvard-s6q1': 'اختر الخطة الأقل تكلفة التي تنتهي خلال 3 أيام: تكلفة A هي 40 ومدتها 4 أيام؛ تكلفة B هي 60 ومدتها 3 أيام؛ تكلفة C هي 80 ومدتها يومان. أي خطة تختار؟',
  'harvard-s6q6': 'تعطي خطتان الفائدة نفسها. تكلفة A هي 30 وحدة نقدية، وتكلفة B هي 45. إذا كانت التكلفة هي المعيار الآخر الوحيد، فأيهما أفضل؟',
  'harvard-s7q2': 'اختر مشروعين مختلفين لا تتجاوز تكلفتهما معًا 10 وحدات: تكلفة A هي 7، وB هي 4، وC هي 3. أي أزواج تحقق الشرط؟',
  'harvard-s7q4': 'يجب تنفيذ X بعد Y وقبل Z. أي ترتيب يحقق الشرطين؟',
  'harvard-s8q1': 'تقضي ساعة في تنفيذ الخطة A بدلًا من الخطة B. ما تكلفة الفرصة البديلة؟',
  'harvard-s10q1': 'يجب ألا تزيد التكلفة على 50 وألا تقل الدرجة عن 8. التكلفة/الدرجة للخيارات هي A: 45/7 وB: 55/9 وC: 50/8. أي خيار يحقق الشرطين؟',
  'harvard-s10q6': 'تكلف الخطة A مبلغًا أوليًا قدره 20، ثم 5 لكل استخدام. وتكلف B مبلغ 8 لكل استخدام دون مبلغ أولي. بعد 10 استخدامات، أيهما أقل تكلفة؟',
  'oxford-s3q6': 'تتطلب قاعدة تحقق A وB معًا. تحقق A ولم يتحقق B. هل استُوفيت القاعدة؟',
  'oxford-s4q2': 'اختار ثلثا مجموعة من 27 شخصًا الخيار A. كم شخصًا اختاره؟',
  'oxford-s7q2': 'أربعة كتب مرتبة: A قبل B مباشرة، وB قبل C مباشرة، وC قبل D مباشرة. أي كتاب يأتي ثالثًا؟',
  'oxford-s7q7': 'توجد المهام X وY وZ فقط. يجب أن تسبق كل من X وY المهمة Z، ولم يُحدَّد ترتيبهما. ما الذي نعرفه يقينًا؟',
  'oxford-s9q2': 'يتطلب الاستنتاج تحقق P وQ. ثبت P فقط. ما الحكم المتأني؟',
  'oxford-s10q1': 'عبارة واحدة فقط صحيحة. تقول A: «B صحيحة». وتقول B: «A وC خاطئتان». وتقول C: «B خاطئة». أي عبارة صحيحة؟',
  'oxford-s10q3': 'من بين 60 شخصًا، يستخدم 40 الخدمة A و35 الخدمة B. يستخدم الجميع خدمة واحدة على الأقل. كم شخصًا يستخدم الخدمتين؟',
  'cambridge-s4q4': 'حققت المجموعة A عدد 16 نجاحًا في 20 محاولة، والمجموعة B عدد 18 نجاحًا في 30 محاولة. أي نسبة أعلى؟',
  'cambridge-s5q7': 'الأوجه المتقابلة في مكعب هي A–D وB–E وC–F. إذا كان الوجه A في الأعلى، فأي وجه في الأسفل؟',
  'cambridge-s10q6': 'يتنبأ النموذج A بالقيمتين 5 و9، والنموذج B بالقيمتين 6 و8. القيمتان المرصودتان هما 6 و9. أي نموذج له مجموع أخطاء مطلقة أقل؟',
};
const arabicAnswers = {
  'B and C together': 'B وC معًا', 'Team A': 'الفريق A', 'Team B': 'الفريق B',
  'Only A and B': 'A وB فقط', 'A and C, or B and C': 'A وC، أو B وC',
  'The benefit you give up from Plan B': 'الفائدة التي تتنازل عنها من الخطة B',
  'C only': 'C فقط', 'B only': 'B فقط', 'A only': 'A فقط', 'A and C': 'A وC',
  'Plan B, by 10 credits': 'الخطة B بفارق 10 وحدات نقدية',
  'Plan A, by 10 credits': 'الخطة A بفارق 10 وحدات نقدية',
  'Plan A, by 20 credits': 'الخطة A بفارق 20 وحدة نقدية',
  'Only if A came first': 'فقط إذا جاء A أولًا', 'Only if A is repeated': 'فقط إذا تكرر A',
  'P and Q': 'P وQ', 'Y is first': 'Y أولًا', 'X is first': 'X أولًا', 'Z is last': 'Z أخيرًا',
  'X and Y are simultaneous': 'X وY في الوقت نفسه', 'Q must be true': 'لا بد أن Q صحيحة',
  'P proves both conditions': 'P يثبت الشرطين', 'A: 80%': 'A: 80%', 'B: 60%': 'B: 60%',
  'Only A': 'A فقط', 'Only B': 'B فقط',
  'Breakfast with someone I enjoy': 'الإفطار مع شخص أستمتع بصحبته',
  'Spend it with people I enjoy': 'أقضيه مع أشخاص أستمتع بصحبتهم',
  'Something I have never tried': 'شيء لم أجرّبه من قبل',
  'With a quiet area I can enjoy slowly': 'بمكان هادئ أتأمله على مهل',
};

export function polishAdditional(slug, locale, copy, source) {
  if (!['personality','harvard','oxford','cambridge'].includes(slug)) return;
  const index = languages.indexOf(locale);
  function walk(value, original, parts = []) {
    if (typeof value === 'string') {
      if (meanings[original]) value = meanings[original][index];
      for (const [from, to] of Object.entries(fragments[locale] ?? {})) value = value.replaceAll(from, to);
      if (locale === 'ar' && parts.includes('answers')) {
        if (arabicAnswers[original]) value = arabicAnswers[original];
        if (/^[A-Z](?:, [A-Z])+$/.test(original)) value = original;
        if (/^\d+ credits$/.test(original)) value = `${original.split(' ')[0]} وحدة نقدية`;
      }
      if (locale === 'ar' && /\bcredits\b/.test(original ?? '')) value = value.replace(/(?:ساعات|ساعة) معتمدة/g, 'وحدة نقدية');
      return value;
    }
    if (Array.isArray(value)) return value.map((item, i) => walk(item, original?.[i], [...parts, String(i)]));
    if (value && typeof value === 'object') for (const key of Object.keys(value)) value[key] = walk(value[key], original?.[key], [...parts, key]);
    return value;
  }
  walk(copy, source);
  const questions = Object.assign({}, ...Object.values(copy.stages).map(stage => stage.questions));
  const playPrompts = ['Un chapitre appartient à un livre. À quel ensemble appartient une scène ?', 'Ein Kapitel gehört zu einem Buch. Zu welchem Ganzen gehört eine Szene?', 'Un capitolo appartiene a un libro. A quale insieme appartiene una scena?', 'Een hoofdstuk hoort bij een boek. Waar hoort een scène bij?', 'Un capítulo pertenece a un libro. ¿A qué pertenece una escena?', 'Um capítulo pertence a um livro. A que pertence uma cena?', 'الفصل جزء من كتاب. والمشهد جزء من أي عمل؟'];
  if (slug === 'oxford') questions['oxford-s1q2'].question = playPrompts[index];
  if (locale === 'ar') for (const [id, question] of Object.entries(arabicQuestions)) if (questions[id]) questions[id].question = question;
  if (slug === 'personality') {
    const finals = [
      ['Ton profil est prêt. Découvre le pays qui correspond le mieux à tes préférences.', ['Préférences reliées', 'Styles comparés', 'Correspondance trouvée']],
      ['Dein Profil steht fest. Entdecke, welches Land zu deinen Vorlieben passt.', ['Vorlieben verbunden', 'Stile verglichen', 'Passendes Profil gefunden']],
      ['Il tuo profilo è pronto. Scopri il paese che si avvicina di più alle tue preferenze.', ['Preferenze collegate', 'Stili confrontati', 'Abbinamento trovato']],
      ['Je profiel is klaar. Ontdek welk land het beste aansluit bij jouw voorkeuren.', ['Voorkeuren verbonden', 'Stijlen vergeleken', 'Jouw match gevonden']],
      ['Tu perfil está listo. Descubre qué país se acerca más a tus preferencias.', ['Preferencias relacionadas', 'Estilos comparados', 'Afinidad encontrada']],
      ['O seu perfil está pronto. Descubra o país que mais se aproxima das suas preferências.', ['Preferências relacionadas', 'Estilos comparados', 'Afinidade encontrada']],
      ['ملامح اختياراتك جاهزة. اكتشف البلد الذي يمثّل الأسلوب الأقرب إلى تفضيلاتك في هذه اللعبة.', ['تم ربط التفضيلات', 'تمت مقارنة الأساليب', 'تم تحديد الأسلوب الأقرب']],
    ];
    const final = Object.values(copy.career.stages).at(-1);
    [final.preAdCopy, final.preAdChecks] = finals[index];
  }
}
