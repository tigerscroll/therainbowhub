import {remainingSlugs} from '../english-chapters/remaining-shared.mjs';
const languages = ['fr','de','it','nl','es','pt','ar'];
const rows = {
 'Elevator': 'Gouverne de profondeur|Höhenruder|Equilibratore|Hoogteroer|Timón de profundidad|Profundor (leme de profundidade)|دفة الارتفاع',
 'Rudder': 'Gouverne de direction|Seitenruder|Timone di direzione|Richtingsroer|Timón de dirección|Leme de direção|دفة الاتجاه',
 'Ailerons': 'Ailerons|Querruder|Alettoni|Rolroeren|Alerones|Ailerons|الجنيحات المتحكمة في التدحرج',
 'Winglets': 'Ailettes en bout d’aile|Winglets|Alette di estremità|Winglets|Aletas de punta de ala|Winglets|الجنيحات الطرفية العمودية',
 'Flaps alone': 'Les volets seuls|Nur die Landeklappen|Solo gli ipersostentatori|Alleen de vleugelkleppen|Solo los flaps|Apenas os flaps|قلابات الأجنحة وحدها',
 'On a conventional airplane, which control surface primarily controls pitch?': 'Sur un avion classique, quelle gouverne commande principalement le tangage ?|Welche Steuerfläche steuert bei einem konventionellen Flugzeug vor allem die Nickbewegung?|In un aereo convenzionale, quale superficie di controllo governa principalmente il beccheggio?|Welk stuurvlak regelt bij een conventioneel vliegtuig vooral het stampen?|En un avión convencional, ¿qué superficie de control regula principalmente el cabeceo?|Num avião convencional, que superfície de comando controla principalmente o movimento de arfagem?|في الطائرة التقليدية، أي سطح تحكم يضبط أساسًا حركة الميل الطولي؟',
 'Which control surfaces primarily control roll on a conventional airplane?': 'Quelles surfaces commandent principalement le roulis sur un avion classique ?|Welche Steuerflächen steuern bei einem konventionellen Flugzeug vor allem das Rollen?|Quali superfici controllano principalmente il rollio in un aereo convenzionale?|Welke stuurvlakken regelen bij een conventioneel vliegtuig vooral het rollen?|¿Qué superficies controlan principalmente el alabeo de un avión convencional?|Que superfícies controlam principalmente o rolamento lateral num avião convencional?|أي أسطح تحكم تضبط أساسًا تدحرج الطائرة التقليدية حول محورها الطولي؟',
 'What is pitch motion?': 'Qu’est-ce que le tangage d’un avion ?|Was ist die Nickbewegung eines Flugzeugs?|Che cos’è il beccheggio di un aereo?|Wat is de stampbeweging van een vliegtuig?|¿Qué es el cabeceo de un avión?|O que é o movimento de arfagem de uma aeronave?|ما المقصود بحركة الميل الطولي للطائرة؟',
 'What is roll motion?': 'Qu’est-ce que le roulis d’un avion ?|Was ist die Rollbewegung eines Flugzeugs?|Che cos’è il rollio di un aereo?|Wat is de rolbeweging van een vliegtuig?|¿Qué es el alabeo de un avión?|O que é o rolamento lateral de uma aeronave?|ما المقصود بتدحرج الطائرة حول محورها الطولي؟',
 'What is yaw motion?': 'Qu’est-ce que le lacet d’un avion ?|Was ist die Gierbewegung eines Flugzeugs?|Che cos’è l’imbardata di un aereo?|Wat is de gierbeweging van een vliegtuig?|¿Qué es la guiñada de un avión?|O que é o movimento de guinada de uma aeronave?|ما المقصود بحركة الانعراج للطائرة؟',
 'Which instrument shows pitch and bank relative to the horizon?': 'Quel instrument indique le tangage et l’inclinaison latérale par rapport à l’horizon ?|Welches Instrument zeigt Längs- und Querneigung gegenüber dem Horizont?|Quale strumento mostra l’assetto longitudinale e l’inclinazione laterale rispetto all’orizzonte?|Welk instrument toont de neusstand en helling ten opzichte van de horizon?|¿Qué instrumento muestra el cabeceo y la inclinación lateral respecto al horizonte?|Que instrumento mostra a atitude longitudinal e a inclinação lateral em relação ao horizonte?|أي جهاز يبيّن الميل الطولي والميل الجانبي للطائرة بالنسبة إلى الأفق؟',
 'What do wing flaps change when extended?': 'Que modifient les volets d’aile lorsqu’ils sont sortis ?|Was verändern ausgefahrene Landeklappen?|Che cosa modificano gli ipersostentatori quando vengono estesi?|Wat veranderen uitgeklapte vleugelkleppen?|¿Qué modifican los flaps del ala al extenderse?|O que muda quando os flaps das asas são estendidos?|ما الذي يتغيّر عند إنزال قلابات الأجنحة؟',
 'What is the leading edge of a wing?': 'Qu’est-ce que le bord d’attaque d’une aile ?|Was ist die Vorderkante eines Flügels?|Che cos’è il bordo d’attacco di un’ala?|Wat is de voorrand van een vleugel?|¿Qué es el borde de ataque de un ala?|O que é o bordo de ataque de uma asa?|ما المقصود بالحافة الأمامية للجناح؟',
 'Net movement of particles from higher to lower concentration': 'Le déplacement global des particules d’une concentration élevée vers une concentration plus faible|Die Nettobewegung von Teilchen von höherer zu niedrigerer Konzentration|Il movimento netto di particelle da una concentrazione maggiore a una minore|De nettoverplaatsing van deeltjes van een hogere naar een lagere concentratie|El movimiento neto de partículas de mayor a menor concentración|O movimento global de partículas de uma concentração maior para uma menor|الحركة الصافية للجسيمات من تركيز أعلى إلى تركيز أقل',
 'A response that opposes a change from the regulated range': 'Une réponse qui s’oppose à un écart par rapport à la plage régulée|Eine Reaktion, die einer Abweichung vom regulierten Bereich entgegenwirkt|Una risposta che contrasta uno scostamento dall’intervallo regolato|Een reactie die een afwijking van het gereguleerde bereik tegengaat|Una respuesta que contrarresta una desviación del intervalo regulado|Uma resposta que se opõe a um desvio do intervalo regulado|استجابة تعاكس الابتعاد عن النطاق المنظَّم',
 'A warning conflicts with an apparently normal indication. What is the sound approach?': 'Une alerte contredit une indication apparemment normale. Quelle démarche convient ?|Eine Warnung widerspricht einer scheinbar normalen Anzeige. Wie geht man sinnvoll vor?|Un avviso contrasta con un’indicazione apparentemente normale. Qual è l’approccio appropriato?|Een waarschuwing botst met een schijnbaar normale aanwijzing. Wat is een verstandige aanpak?|Una advertencia contradice una indicación aparentemente normal. ¿Cuál es el enfoque adecuado?|Um aviso contradiz uma indicação aparentemente normal. Qual é a abordagem adequada?|يتعارض تحذير مع قراءة تبدو طبيعية. ما النهج المناسب؟',
 'What is a useful purpose of supervision or professional consultation?': 'À quoi sert notamment la supervision ou la consultation professionnelle ?|Wozu dienen Supervision oder fachliche Beratung?|Qual è uno scopo utile della supervisione o della consulenza professionale?|Wat is een nuttig doel van supervisie of professioneel overleg?|¿Para qué sirve la supervisión o la consulta profesional?|Qual é uma finalidade útil da supervisão ou consulta profissional?|ما أحد الأهداف المفيدة للإشراف أو الاستشارة المهنية؟',
};
const pt = {
 'Transporting oxygen':'Transportar oxigénio (oxigênio)',
 'Producing usable cellular energy':'Produzir energia utilizável pelas células',
 'They do not replace hand hygiene':'Não substituem a higiene das mãos',
 'Its sterility cannot be assumed':'Não é possível garantir a sua esterilidade',
 'Earlier, a person spoke comfortably. Now they pause between short phrases to breathe. What changed?':'Antes, uma pessoa falava sem dificuldade. Agora, precisa de fazer pausas entre frases curtas para respirar. O que mudou?',
 'Feeling nauseated':'Sentir náuseas',
 'That one variable causes the other':'Que uma variável causa a outra',
 'A person reports an allergy that is absent from the chart. What is the appropriate response?':'Uma pessoa relata uma alergia que não consta da documentação clínica. Qual é a resposta adequada?',
 '“This finding has several possible causes and needs assessment”':'«Este achado tem várias causas possíveis e precisa de avaliação»',
 'Ultrasound':'Ecografia (ultrassom)',
 'DNA':'DNA (ADN)',
 'A schedule uses UTC throughout. Departure is 10:45 and flight time is 2 hours 20 minutes. What is arrival time?':'Todo o horário está em UTC. A partida é às 10:45 e o voo dura 2 horas e 20 minutos. Qual é a hora de chegada?',
 '13:05 UTC':'13:05 UTC','12:55 UTC':'12:55 UTC','13:15 UTC':'13:15 UTC','12:05 UTC':'12:05 UTC',
 'A tank contains 90 L. A calculation predicts 35 L used on a leg. How much remains?':'Um depósito contém 90 L. O consumo previsto num trecho da rota é de 35 L. Quanto resta?',
 'Its path over the ground':'O seu percurso em relação ao solo',
 'They can contain several serious aviation hazards':'Podem apresentar vários perigos graves para a aviação',
 'Why assign a clear owner to a follow-up action?':'Por que definir uma pessoa responsável por uma ação de acompanhamento?',
 'What makes a handover useful?':'Que informações tornam útil uma passagem de informações entre colegas?',
 'To let the sender check that it was understood correctly':'Permitir que a pessoa que deu a instrução confirme se foi bem compreendida',
 'What is bruschetta commonly built on?':'Que base é normalmente usada para preparar bruschetta?',
 'What is frittata?':'O que é uma frittata?',
 'Which pasta shape resembles small bows or butterflies?':'Que formato de massa lembra pequenos laços ou borboletas?',
 'What gives an arrabbiata sauce its characteristic heat?':'O que dá ao molho arrabbiata o seu sabor picante característico?',
 'Chilli':'Pimenta picante',
 'Why can a little starchy pasta water help a sauce?':'Por que pode ajudar adicionar ao molho um pouco da água de cozedura da massa, rica em amido?',
 'It can help the sauce combine and cling to the pasta':'Pode ajudar a ligar o molho e a fazê-lo aderir à massa',
 'Gas produced during yeast fermentation':'Gás produzido pela fermentação das leveduras',
 'Why might pasta dough be rested before rolling?':'Por que se deixa a massa de uma receita de pasta repousar antes de a estender?',
 'Which dessert commonly contains coffee-soaked sponge biscuits and mascarpone?':'Que sobremesa costuma levar biscoitos leves embebidos em café e mascarpone?',
 'What is affogato commonly made by pouring over ice cream or gelato?':'Na preparação de um affogato, o que se costuma verter sobre o gelato?',
 'Almonds or related almond-flavoured kernels':'Amêndoas ou sementes semelhantes com sabor a amêndoa',
 'Filled or stuffed':'Recheado',
 'A dough rests for 40 minutes from 11:25. When does the rest end?':'Uma massa repousa durante 40 minutos a partir das 11:25. A que horas termina o repouso?',
 'A recipe serves six. What scale factor makes nine equal portions?':'Uma receita rende seis porções. Por que fator se devem multiplicar as quantidades para obter nove porções iguais?',
 'A menu describes a dessert of cooked cream set into a soft form. Which is the best match?':'Um menu descreve uma sobremesa de creme cozido que solidifica com uma textura macia. Qual é a melhor correspondência?',
 'Panna cotta':'Panna cotta', 'Frittata':'Frittata', 'Cannoli':'Cannoli',
 'A pasta sauce calls for basil, olive oil, garlic, nuts and hard cheese. Which is the closest classic family?':'Um molho para massa leva manjericão, azeite, alho, frutos secos e queijo duro. A que família clássica de molhos corresponde?',
 'What is a graft?':'O que é um enxerto?',
 'A graft':'Um enxerto',
 'A surgical cut':'Um corte cirúrgico',
};
const ar = {
 'The nose rotating up or down':'دوران مقدمة الطائرة إلى أعلى أو إلى أسفل',
 'Attitude indicator':'مؤشر وضعية الطائرة',
 'An airspeed indicator':'مؤشر السرعة الجوية',
 'The wings banking around the nose-to-tail axis':'ميل الجناحين حول المحور الممتد من مقدمة الطائرة إلى ذيلها',
 'Pitch angle':'زاوية الميل الطولي',
 'A graft':'طُعم نسيجي',
 'What is a graft?':'ما المقصود بالطُعم النسيجي في الجراحة؟',
 'What is haemostasis?':'ما المقصود بالإرقاء في الجراحة؟',
 'Control of bleeding':'إيقاف النزيف والسيطرة عليه',
 'A surgical retractor':'مُبعِد جراحي',
};
export function remainingTerm(slug, locale, original) {
 if (!remainingSlugs.includes(slug)) return undefined;
 return rows[original]?.split('|')[languages.indexOf(locale)] ?? (locale==='pt'?pt[original]:locale==='ar'?ar[original]:undefined);
}
export function polishRemaining(slug, locale, copy, source) {
 if(!remainingSlugs.includes(slug))return;
 function walk(value, original, path=[]){
  if(typeof value==='string'){
   // Editorial headings and subtitles retain the supplied native copy.
   if(path.length===1||path.join('.')==='landing.intro')return value;
   value=remainingTerm(slug,locale,original)??value;
   if(locale==='pt') value=value.replace(/\bvôos\b/g,'voos').replace(/\bvôo\b/g,'voo').replace(/\bmacarrão\b/g,'massa').replace(/\bmussarela\b/g,'mozzarella').replace(/\bmotocicleta\b/g,'moto').replace(/\bmotocicletas\b/g,'motos');
   return value;
  }
  if(Array.isArray(value))return value.map((v,i)=>walk(v,original?.[i],[...path,String(i)]));
  if(value&&typeof value==='object')for(const k of Object.keys(value))value[k]=walk(value[k],original?.[k],[...path,k]);
  return value;
 }
 walk(copy,source);
}
