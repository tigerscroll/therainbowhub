// Short, context-sensitive reasoning terms need explicit native meanings.
// Rows retain source-authoring choice order before the display shuffle.
const blocks = {
it: `
oxford-s1q3 | Un termometro misura la temperatura. Un righello misura… | La lunghezza | Il tempo | La massa | Il suono
oxford-s2q6 | Un resoconto è «ambiguo» quando… | Ammette più interpretazioni | Non contiene parole | È necessariamente falso | Ha un solo significato chiaro
oxford-s3q5 | Ogni busta chiusa ha un francobollo. Questa busta ha un francobollo. Si può stabilire se è chiusa? | Le informazioni non bastano per stabilirlo | Deve essere chiusa | Deve essere aperta | È vuota
oxford-s5q1 | «Prolungare l’orario di apertura della biblioteca permetterà più visite.» Quale ipotesi sostiene questa idea? | Alcune persone userebbero le ore aggiuntive | Tutti i visitatori leggono romanzi | Tutti i libri sono nuovi | La biblioteca ha due piani
oxford-s10q2 | Un corso immaginario richiede almeno 80 in logica e 70 in scrittura. Punteggi logica/scrittura: Ava 84/68, Bo 79/90, Cy 82/74. Chi soddisfa entrambi i requisiti? | Cy | Ava | Bo | Ava e Cy
harvard-s1q2 | Un incontro richiede una sala e una persona che tenga un intervento. La sala è confermata, ma nessuno ha ancora accettato di intervenire. Che cosa sappiamo? | Un requisito resta da confermare | L’incontro si è già svolto | Entrambi i requisiti sono confermati | Non serve nessuno che tenga un intervento
harvard-s9q1 | Una prima prova ottiene 30 successi in 40 tentativi, una seconda 21 in 30. Quale ha la percentuale di successo più alta? | La prima prova | La seconda prova | Entrambe raggiungono il 70% | Entrambe raggiungono il 75%
cambridge-s3q5 | Un ricercatore assegna i partecipanti ai gruppi in modo casuale. Qual è lo scopo principale? | Ridurre le differenze sistematiche dovute all’assegnazione | Rendere identici tutti i risultati | Scegliere soltanto risultati favorevoli | Eliminare la necessità di un confronto
cambridge-s4q1 | Tre misurazioni valgono 8, 10 e 12. Qual è la loro media? | 10 | 8 | 12 | 30
cambridge-s5q6 | Quale trasformazione cambia le dimensioni di una figura mantenendone le proporzioni? | Ingrandire o ridurre tutte le dimensioni nello stesso rapporto | Solo una traslazione | Solo una rotazione | Solo una riflessione
cambridge-s7q2 | In uno studio, due grandezze variano insieme. Che cosa dimostra questo, da solo? | Un’associazione tra le grandezze | Un rapporto certo di causa ed effetto | L’assenza di spiegazioni alternative | Una legge permanente
cambridge-s7q3 | Quale previsione si può verificare? | Il campione trattato crescerà in altezza di almeno 2 cm in 14 giorni | Il campione sarà più impressionante | L’idea sembra giusta | Il risultato sarà interessante
`,
es: `
oxford-s1q3 | Un termómetro mide la temperatura. Una regla mide… | La longitud | El tiempo | La masa | El sonido
oxford-s2q6 | Una descripción es «ambigua» cuando… | Admite más de una interpretación | No contiene palabras | Es necesariamente falsa | Tiene un único significado claro
oxford-s3q5 | Todos los sobres cerrados llevan un sello postal. Este sobre lleva un sello postal. ¿Se puede determinar si está cerrado? | La información no basta para determinarlo | Tiene que estar cerrado | Tiene que estar abierto | Está vacío
oxford-s5q1 | «Ampliar el horario de apertura de la biblioteca permitirá más visitas». ¿Qué supuesto apoya esta idea? | Algunas personas aprovecharían las horas adicionales | Todos los visitantes leen novelas | Todos los libros son nuevos | La biblioteca tiene dos plantas
oxford-s10q2 | Un curso ficticio exige al menos 80 puntos en lógica y 70 en escritura. Puntuaciones lógica/escritura: Ava 84/68, Bo 79/90, Cy 82/74. ¿Quién cumple ambos requisitos? | Cy | Ava | Bo | Ava y Cy
harvard-s1q2 | Una reunión requiere una sala y una persona que dé una charla. La sala está confirmada, pero ninguna persona ha aceptado dar la charla. ¿Qué sabemos? | Falta confirmar un requisito | La reunión ya se celebró | Ambos requisitos están confirmados | No hace falta nadie que dé la charla
harvard-s9q1 | Una primera prueba obtiene 30 éxitos en 40 intentos y una segunda, 21 en 30. ¿Cuál tiene mayor tasa de éxito? | La primera prueba | La segunda prueba | Ambas alcanzan el 70% | Ambas alcanzan el 75%
cambridge-s3q5 | Se asignan participantes a los grupos al azar. ¿Cuál es el objetivo principal? | Reducir las diferencias sistemáticas causadas por la asignación | Hacer que todos los resultados sean idénticos | Elegir solo resultados favorables | Eliminar la necesidad de comparar
cambridge-s4q1 | Tres mediciones dan 8, 10 y 12. ¿Cuál es su media? | 10 | 8 | 12 | 30
cambridge-s5q6 | ¿Qué transformación cambia el tamaño de una figura y conserva sus proporciones? | Ampliar o reducir todas sus dimensiones en la misma proporción | Solo una traslación | Solo una rotación | Solo una reflexión
cambridge-s7q2 | Dos magnitudes varían juntas en un estudio. ¿Qué demuestra eso por sí solo? | Una asociación entre las magnitudes | Una relación causal segura | La ausencia de explicaciones alternativas | Una ley permanente
cambridge-s7q3 | ¿Qué predicción se puede comprobar? | La muestra tratada crecerá al menos 2 cm de altura en 14 días | La muestra será más impresionante | La idea parece acertada | El resultado será interesante
`,
pt: `
oxford-s1q3 | Um aparelho mede a temperatura. Uma régua mede… | Comprimento | Tempo | Massa | Som
oxford-s2q6 | Uma descrição é «ambígua» quando… | Permite mais de uma interpretação | Não contém palavras | É necessariamente falsa | Tem um único significado claro
oxford-s3q5 | Todos os envelopes fechados têm um selo postal. Este envelope tem um selo postal. É possível saber se está fechado? | A informação não permite determinar isso | Tem de estar fechado | Tem de estar aberto | Está vazio
oxford-s5q1 | «Manter a biblioteca aberta durante mais horas permitirá mais visitas.» Que suposição apoia esta ideia? | Algumas pessoas aproveitariam as horas adicionais | Todos os visitantes leem ficção | Todos os livros são novos | A biblioteca tem dois andares
oxford-s10q2 | Um curso fictício exige pelo menos 80 pontos em lógica e 70 em escrita. Pontuações lógica/escrita: Ava 84/68, Bo 79/90, Cy 82/74. Quem cumpre os dois requisitos? | Cy | Ava | Bo | Ava e Cy
harvard-s1q2 | Uma reunião exige uma sala e uma pessoa para apresentar um tema. A sala está confirmada, mas ninguém confirmou a apresentação. O que sabemos? | Falta confirmar um requisito | A reunião já aconteceu | Os dois requisitos estão confirmados | Não é necessária uma pessoa para apresentar
harvard-s9q1 | Um primeiro teste obtém 30 sucessos em 40 tentativas. Um segundo obtém 21 em 30. Qual tem a maior taxa de sucesso? | O primeiro teste | O segundo teste | Ambos atingem 70% | Ambos atingem 75%
cambridge-s3q5 | Numa investigação, os participantes são distribuídos pelos grupos de forma aleatória. Qual é o objetivo principal? | Reduzir diferenças sistemáticas causadas pela distribuição | Tornar todos os resultados idênticos | Escolher apenas resultados favoráveis | Eliminar a necessidade de comparação
cambridge-s4q1 | Três medições dão os valores 8, 10 e 12. Qual é a média? | 10 | 8 | 12 | 30
cambridge-s5q6 | Que transformação muda o tamanho de uma figura e mantém as suas proporções? | Ampliar ou reduzir todas as dimensões na mesma proporção | Apenas uma translação | Apenas uma rotação | Apenas uma reflexão
cambridge-s7q2 | Duas grandezas variam em conjunto num estudo. O que isso demonstra, por si só? | Uma associação entre as grandezas | Uma relação de causa e efeito garantida | A ausência de outras explicações | Uma lei permanente
cambridge-s7q3 | Que previsão pode ser testada? | A amostra tratada crescerá pelo menos 2 cm em altura durante 14 dias | A amostra será mais impressionante | A ideia parece certa | O resultado será interessante
`,
fr: `
oxford-s1q3 | Un thermomètre mesure la température. Une règle mesure… | La longueur | Le temps | La masse | Le son
oxford-s2q6 | Un récit est « ambigu » lorsqu’il… | Permet plusieurs interprétations | Ne contient aucun mot | Est forcément faux | N’a qu’un seul sens clair
oxford-s3q5 | Toute enveloppe fermée porte un timbre. Cette enveloppe porte un timbre. Peut-on savoir si elle est fermée ? | Les informations ne permettent pas de le savoir | Elle est forcément fermée | Elle est forcément ouverte | Elle ne contient rien
oxford-s5q1 | « Prolonger les horaires d’ouverture de la bibliothèque permettra plus de visites. » Quelle hypothèse soutient cette idée ? | Certaines personnes viendraient pendant les heures supplémentaires | Tous les visiteurs lisent des romans | Tous les livres sont neufs | La bibliothèque a deux étages
oxford-s10q2 | Un cours fictif exige au moins 80 en logique et 70 en rédaction. Notes logique/rédaction : Ava 84/68, Bo 79/90, Cy 82/74. Qui remplit les conditions ? | Cy | Ava | Bo | Ava et Cy
harvard-s1q2 | Une réunion exige une salle et une personne pour intervenir. La salle est confirmée, mais personne n’a confirmé sa participation comme intervenant. Que sait-on ? | Une condition reste à confirmer | La réunion a déjà eu lieu | Les deux conditions sont confirmées | Aucun intervenant n’est nécessaire
harvard-s9q1 | Un premier essai obtient 30 réussites sur 40 tentatives. Un second en obtient 21 sur 30. Lequel a le meilleur taux de réussite ? | Le premier essai | Le second essai | Les deux atteignent 70 % | Les deux atteignent 75 %
cambridge-s3q5 | Un chercheur répartit les participants au hasard entre les groupes. Quel est le but principal ? | Réduire les différences systématiques dues à la répartition | Rendre tous les résultats identiques | Ne choisir que les résultats favorables | Supprimer le besoin de comparaison
cambridge-s4q1 | Trois mesures valent 8, 10 et 12. Quelle est leur moyenne ? | 10 | 8 | 12 | 30
cambridge-s5q6 | Quelle transformation change la taille d’une figure en conservant ses proportions ? | Un agrandissement ou une réduction à la même échelle | Une translation seule | Une rotation seule | Une symétrie seule
cambridge-s7q2 | Dans une étude, deux grandeurs varient ensemble. Qu’est-ce que cela établit à lui seul ? | Une association entre ces grandeurs | Un lien de cause à effet certain | L’absence de toute autre explication | Une loi permanente
cambridge-s7q3 | Quelle prédiction peut être testée ? | L’échantillon traité gagnera au moins 2 cm en hauteur en 14 jours | L’échantillon sera plus impressionnant | L’idée semble juste | Le résultat sera intéressant
`,
de: `
oxford-s1q3 | Ein Thermometer misst die Temperatur. Ein Lineal misst… | Länge | Zeit | Masse | Schall
oxford-s2q6 | Eine Aussage ist „mehrdeutig“, wenn sie… | Mehrere Deutungen zulässt | Keine Wörter enthält | Zwangsläufig falsch ist | Genau eine eindeutige Bedeutung hat
oxford-s3q5 | Jeder verschlossene Umschlag trägt eine Briefmarke. Dieser Umschlag trägt eine Briefmarke. Was lässt sich darüber sagen, ob er verschlossen ist? | Das lässt sich daraus nicht bestimmen | Er muss verschlossen sein | Er muss offen sein | Er ist leer
oxford-s5q1 | „Längere Öffnungszeiten der Bibliothek ermöglichen mehr Besuche.“ Welche Annahme stützt das? | Manche Menschen würden die zusätzlichen Stunden nutzen | Alle Besucher lesen Romane | Alle Bücher sind neu | Die Bibliothek hat zwei Stockwerke
oxford-s10q2 | Ein fiktiver Kurs verlangt mindestens 80 Punkte in Logik und 70 im Schreiben. Punkte in Logik/Schreiben: Ava 84/68, Bo 79/90, Cy 82/74. Wer erfüllt beide Bedingungen? | Cy | Ava | Bo | Ava und Cy
harvard-s1q2 | Für eine Veranstaltung werden ein Raum und eine vortragende Person benötigt. Der Raum ist bestätigt, eine Person hat noch nicht zugesagt. Was steht fest? | Eine Voraussetzung ist noch nicht bestätigt | Die Veranstaltung hat bereits stattgefunden | Beide Voraussetzungen sind bestätigt | Eine vortragende Person ist unnötig
harvard-s9q1 | Eine erste Versuchsreihe erzielt 30 Erfolge bei 40 Versuchen, eine zweite 21 bei 30. Welche hat die höhere Erfolgsquote? | Die erste Versuchsreihe | Die zweite Versuchsreihe | Beide erreichen 70 % | Beide erreichen 75 %
cambridge-s3q5 | Ein Forscher teilt Teilnehmende zufällig auf Gruppen auf. Was ist der Hauptzweck? | Systematische Unterschiede durch die Zuteilung zu verringern | Alle Ergebnisse identisch zu machen | Nur günstige Ergebnisse auszuwählen | Einen Vergleich überflüssig zu machen
cambridge-s4q1 | Drei Messwerte lauten 8, 10 und 12. Wie hoch ist ihr arithmetischer Mittelwert? | 10 | 8 | 12 | 30
cambridge-s5q6 | Welche Veränderung ändert die Größe einer Figur und erhält ihre Proportionen? | Gleichmäßiges Vergrößern oder Verkleinern | Nur Verschieben | Nur Drehen | Nur Spiegeln
cambridge-s7q2 | In einer Studie verändern sich zwei Größen gemeinsam. Was zeigt das allein? | Einen Zusammenhang zwischen den Größen | Eine eindeutige Ursache | Dass es keine andere Erklärung gibt | Ein dauerhaft gültiges Gesetz
cambridge-s7q3 | Welche Vorhersage lässt sich überprüfen? | Die behandelte Probe wächst innerhalb von 14 Tagen mindestens 2 cm in die Höhe | Die Probe wird beeindruckender sein | Die Idee fühlt sich richtig an | Das Ergebnis wird interessant sein
`,
nl: `
oxford-s1q3 | Een thermometer meet temperatuur. Een liniaal meet… | Lengte | Tijd | Massa | Geluid
oxford-s2q6 | Een beschrijving is ‘dubbelzinnig’ wanneer die… | Meer dan één uitleg toelaat | Geen woorden bevat | Per definitie onwaar is | Precies één duidelijke betekenis heeft
oxford-s3q5 | Elke gesloten envelop heeft een postzegel. Deze envelop heeft een postzegel. Kun je bepalen of de envelop gesloten is? | Dat is met deze informatie niet te bepalen | De envelop moet gesloten zijn | De envelop moet open zijn | De envelop is leeg
oxford-s5q1 | ‘De bibliotheek langer openhouden maakt meer bezoeken mogelijk.’ Welke aanname ondersteunt dit? | Sommige mensen zouden de extra uren gebruiken | Elke bezoeker leest fictie | Alle boeken zijn nieuw | De bibliotheek heeft twee verdiepingen
oxford-s10q2 | Een fictieve cursus vereist minstens 80 punten voor logica en 70 voor schrijven. Scores logica/schrijven: Ava 84/68, Bo 79/90, Cy 82/74. Wie voldoet aan beide eisen? | Cy | Ava | Bo | Ava en Cy
harvard-s1q2 | Een bijeenkomst vereist een zaal en een spreker. De zaal is bevestigd, maar er heeft nog geen spreker toegezegd. Wat staat vast? | Eén voorwaarde is nog niet bevestigd | De bijeenkomst is al geweest | Beide voorwaarden zijn bevestigd | Een spreker is niet nodig
harvard-s9q1 | Een eerste proef heeft 30 successen in 40 pogingen. Een tweede heeft er 21 in 30. Welke heeft het hoogste succespercentage? | De eerste proef | De tweede proef | Beide halen 70% | Beide halen 75%
cambridge-s3q5 | Een onderzoeker verdeelt deelnemers willekeurig over groepen. Wat is het belangrijkste doel? | Systematische verschillen door de indeling beperken | Alle uitkomsten gelijk maken | Alleen gunstige resultaten kiezen | Een vergelijking overbodig maken
cambridge-s4q1 | Drie meetwaarden zijn 8, 10 en 12. Wat is hun gemiddelde? | 10 | 8 | 12 | 30
cambridge-s5q6 | Welke bewerking verandert de grootte van een figuur, maar behoudt de verhoudingen? | Alle afmetingen met dezelfde factor vergroten of verkleinen | Alleen verschuiven | Alleen draaien | Alleen spiegelen
cambridge-s7q2 | Twee grootheden veranderen samen in een onderzoek. Wat toont dat op zichzelf aan? | Een samenhang tussen de grootheden | Een zekere oorzaak | Dat er geen andere verklaring is | Een blijvende wet
cambridge-s7q3 | Welke voorspelling is toetsbaar? | Het behandelde monster groeit in 14 dagen minstens 2 cm in de hoogte | Het monster wordt indrukwekkender | Het idee voelt goed | Het resultaat wordt interessant
`,
};

export const semanticRows = Object.fromEntries(Object.entries(blocks).map(([locale, block]) => [locale,
  Object.fromEntries(block.trim().split('\n').map(line => {const [id,...row]=line.split(' | ');return [id,row];})),
]));
