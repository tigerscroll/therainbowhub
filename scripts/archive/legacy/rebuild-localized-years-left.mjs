import fs from "node:fs";
import path from "node:path";

const quizDir = path.join(process.cwd(), "data", "quizzes", "years-left");
const order = [
  "r1q3","r1q1","r1q2","r1q5","r1q6","r4q4","r9q3","r9q2",
  "r2q1","r2q2","r2q3","r2q4","r2q6","r3q2","r3q6","r3q1",
  "r4q1","r4q2","r4q3","r4q5","r4q6","r10q3","r10q4","r9q4",
  "r6q1","r6q2","r6q3","r6q4","r6q5","r6q6","r7q4","r7q6",
  "r7q1","r7q2","r7q3","r8q1","r8q5","r9q5","r10q2","r10q6"
];

const banks = {
  fr: [
    ["Un soir se libère. Quel programme vous ressemble le plus ?",["Improviser et voir où cela mène","Préparer un bon repas, faire une promenade et finir la soirée au calme","Enchaîner travail, amis et tout ce qui se présente"]],
    ["Votre samedi matin idéal commence par…",["Un petit-déjeuner tranquille et un programme vraiment réalisable","Cinq réveils, trois courses et une dose héroïque de café","Aucun programme : je laisse la journée me guider"]],
    ["Quand votre semaine déborde, qu’est-ce qui vous sauve le plus souvent ?",["Accélérer encore jusqu’à ce que la pression retombe enfin","Tout annuler et choisir le canapé en toute sérénité","Faire une liste simple et avancer une chose après l’autre"]],
    ["Quand votre énergie baisse en milieu de journée, qu’est-ce qui vous aide le plus ?",["Changer d’air et faire quelque chose d’imprévu","Retrouver le calme, sans nouvelle demande","Faire une courte pause et choisir une prochaine étape claire"]],
    ["À quelle fréquence vous compliquez-vous la vie sans raison ?",["C’est exactement ce que je suis en train de faire","Seulement quand j’ignore la solution évidente","Régulièrement, mais au moins ce n’est jamais ennuyeux"]],
    ["Votre relation avec le réveil est…",["Plutôt théorique : je me réveille avant lui","Respectueuse, sans être passionnelle","Un procès qui recommence chaque matin"]],
    ["Quand la vie s’accélère, votre logement devient…",["Un cocon douillet avec des en-cas à portée de main","Un peu en désordre, mais rien d’irrécupérable","La preuve qu’une aventure secondaire a eu lieu"]],
    ["Une facture, un formulaire ou un rappel de rendez-vous apparaît. Vous…",["Le rangez dans un endroit sûr, puis oubliez où se trouve cet endroit","Programmez trois rappels et restez malgré tout méfiant","Vous en occupez tant que la tâche est encore petite"]],
    ["Vers quelle table d’en-cas vous dirigez-vous ?",["Tranches de pomme, fruits à coque et un peu de chocolat noir","Une généreuse part de gâteau","Houmous, olives et légumes croquants","Le premier en-cas emballé à portée de main"]],
    ["Au petit-déjeuner, vous êtes plutôt…",["Un café avec beaucoup trop d’assurance","Le petit-déjeuner ? Je préfère faire une entrée remarquée au déjeuner","Quelque chose d’assez fiable pour éviter le coup de mou du matin"]],
    ["Au restaurant, vous choisissez généralement…",["Quelque chose de nouveau, parce que la curiosité l’emporte sur la prudence","Le plat qui vous fera forcément du bien","La spécialité de la maison, après une question raisonnable","Le plat le plus riche de la carte, parce que la vie est courte"]],
    ["Votre gourde se trouve probablement…",["À proximité, et elle sert vraiment","Quelque part dans la maison, en théorie","Remplacée par du café jusqu’à nouvel ordre"]],
    ["Quelle devise alimentaire vous correspond le mieux ?",["Mon futur moi pourra déposer une réclamation","Plutôt raisonnable, avec quelques jours de fête","Si cela apporte de la joie, cela mérite une place à table"]],
    ["Une petite course vous attend tout près. Comment vous y rendez-vous d’habitude ?",["En voiture","En transports en commun","À pied","À vélo"]],
    ["C’est dimanche. Choisissez votre niveau d’activité.",["Mode canapé","Une promenade tranquille","Une sortie à vélo","Une vraie course à pied"]],
    ["Quel programme d’activité pourriez-vous réellement tenir ?",["Une promenade qui ne demande pas de changer de personnalité","Une grande phase sportive de deux semaines","Danser en faisant le ménage et appeler cela du cardio"]],
    ["Votre rituel du coucher ressemble le plus à…",["Un moment de détente correct qui fonctionne presque toujours","Encore une chose, puis une autre… et mince","M’endormir là où la journée me dépose"]],
    ["Quand le stress entre dans la pièce, vous…",["Essayez de résoudre six problèmes à la fois","Évitez son regard en espérant qu’il reparte","Réduisez le problème à la prochaine étape claire"]],
    ["Au réveil, à quel point vous sentez-vous reposé ?",["Pas du tout","Un peu","Moyennement","Plutôt bien","Complètement"]],
    ["Un petit contretemps survient. Vous…",["Le réglez avant qu’il ne devienne une saga","En faites une saga brillamment racontée","Le remettez à plus tard en espérant que tout s’arrange"]],
    ["Qu’est-ce qui vous aide le mieux à dormir ?",["Être totalement épuisé par une aventure","Un bruit de fond et une douce échappée loin du réel","Une pièce calme et un esprit encore plus calme"]],
    ["Après une semaine chaotique, le lundi je suis généralement…",["Revenu à un programme simple","Reparti avec une petite habitude réconfortante","Encore en train de reprendre mon souffle"]],
    ["Pour moi, les habitudes saines sont…",["Automatiques","Assez régulières","Irrégulières","Plus une intention qu’une routine"]],
    ["Quelle règle personnelle vous aiderait le plus ?",["Faire tout de suite la tâche qui prend deux minutes","Garder une place pour l’imprévu","Se reposer avant que tout ne devienne dramatique"]],
    ["Votre sortie de groupe idéale comprend…",["Des gens agréables, un horaire clair et une sortie facile","Un programme souple que chacun peut façonner","Un rebondissement que personne n’avait prévu"]],
    ["Lors d’une fête, vous êtes plutôt du genre à…",["Vous retrouver dans une histoire qui commence par « on ne sait comment »","Passer d’une conversation à l’autre, puis prendre une pause au calme","Aider avec les en-cas, parce que cela vous donne une mission"]],
    ["Quand quelqu’un vous écrit « petite question », vous ressentez…",["De la joie si cela se transforme en potins","Je demande ce qu’il faut avant de décider de l’énergie que j’ai","J’accepte, mais avec prudence"]],
    ["Vos amis diraient probablement que vous êtes…",["Fiable, d’une manière agréablement normale","Stable quand il le faut et spontané quand cela aide","Une adorable source d’aventures secondaires"]],
    ["Après une journée très sociale, il vous faut…",["Un autre programme si l’ambiance est bonne","Quelque chose de tranquille avec une ou deux personnes proches","Une longue pause au calme avant de me sentir à nouveau moi-même"]],
    ["À quelle fréquence prenez-vous du temps pour les personnes que vous appréciez vraiment ?",["Presque jamais","Rarement","Parfois","Souvent","Très souvent"]],
    ["Quand un programme change à la dernière minute, vous…",["Vous adaptez et trouvez la nouvelle solution raisonnable","Faites comme si c’était prévu depuis le début","Avez besoin d’une minute pour redémarrer"]],
    ["Quelle habitude améliorerait le plus votre quotidien ?",["Un bouton pause pour mon cerveau","Une remise à zéro simple chaque semaine","Plus de jeu dans les journées ordinaires"]],
    ["Un vol bon marché pour demain apparaît. Vous…",["Vérifiez les détails avant que votre imagination ne s’emballe","Commencez déjà à faire vos valises mentalement","Fermez l’onglet : demain, c’est beaucoup trop tôt"]],
    ["Quel type de risque vous ressemble le plus ?",["Dire oui avant d’avoir lu tout le programme","Commander quelque chose de nouveau en espérant que ce soit bon","Essayer une nouvelle habitude sans en faire toute une histoire"]],
    ["Votre agenda est généralement…",["Rempli de choses que j’avais accepté de faire, puis complètement oubliées","Assez utile pour éviter les catastrophes","Décoratif, en théorie"]],
    ["Quel petit plaisir fonctionne à tous les coups ?",["Prendre l’air et faire une petite course agréable","Rire jusqu’à ce que le programme change","Un coin tranquille et quelque chose de réconfortant"]],
    ["Votre moment « je me sens vivant » ressemble plutôt à…",["Une histoire absurde qui se déroule en direct","Me rappeler que je peux dire non et rester chez moi","Du soleil, du mouvement et l’esprit clair"]],
    ["Votre futur moi vous remercierait de…",["Créer un souvenir inoubliable","Prendre une vraie pause avant de vous épuiser","Simplifier une chose ennuyeuse"]],
    ["Par rapport à il y a cinq ans, mon énergie est…",["Meilleure","À peu près la même","Plus faible"]],
    ["Jusqu’à quel âge vous imaginez-vous vivre ?",["Entre 70 et 79 ans","Entre 80 et 89 ans","Entre 90 et 99 ans","100 ans ou plus"]]
  ],
  de: [
    ["Plötzlich ist ein Abend frei. Welcher Plan passt am ehesten zu Ihnen?",["Spontan etwas auswählen und sehen, wohin es führt","Etwas Gutes kochen, spazieren gehen und den Abend ruhig ausklingen lassen","Arbeit, Freunde und alles Weitere dicht hintereinanderpacken"]],
    ["Ihr idealer Samstagmorgen beginnt mit …",["Einem langsamen Frühstück und einem Plan, der wirklich machbar wirkt","Fünf Weckern, drei Erledigungen und heldenhaft viel Kaffee","Gar keinem Plan – ich sehe einfach, wohin mich der Tag führt"]],
    ["Wenn Ihre Woche übervoll wird, was rettet Sie meistens?",["Noch stärker drücken, bis der Druck endlich nachlässt","Alles absagen und in aller Ruhe das Sofa wählen","Eine einfache Liste und immer nur eine Sache"]],
    ["Wenn Ihre Energie mitten am Tag absackt, was hilft am meisten?",["Ein Ortswechsel und etwas Spontanes","Ruhe, Gemütlichkeit und keine neuen Anforderungen","Eine kurze Pause und ein klarer nächster Schritt"]],
    ["Wie oft machen Sie sich das Leben unnötig schwer?",["Genau das tue ich gerade","Nur wenn ich die offensichtliche Lösung ignoriere","Regelmäßig – aber wenigstens bleibt es interessant"]],
    ["Ihre Beziehung zum Wecker ist …",["Weitgehend theoretisch, weil ich vorher aufwache","Respektvoll, aber nicht romantisch","Ein täglicher Kleinkrieg"]],
    ["Wenn das Leben hektisch wird, ist Ihr Zuhause …",["Eine gemütliche Höhle mit Snacks in Reichweite","Etwas unordentlich, aber noch zu retten","Der Beweis, dass eine Nebenmission stattgefunden hat"]],
    ["Eine Rechnung, ein Formular oder eine Terminerinnerung taucht auf. Sie …",["Legen sie an einen sicheren Ort und vergessen dann, wo dieser Ort war","Stellen drei Erinnerungen ein und bleiben trotzdem misstrauisch","Erledigen es, solange es noch eine kleine Aufgabe ist"]],
    ["Zu welchem Snacktisch zieht es Sie?",["Apfelspalten, Nüsse und etwas dunkle Schokolade","Ein dickes Stück Kuchen","Hummus, Oliven und knackiges Gemüse","Der nächstgelegene verpackte Snack"]],
    ["Beim Frühstück sind Sie eher …",["Ein Kaffee mit viel zu großem Selbstvertrauen","Frühstück? Ich bevorzuge einen dramatischen Auftritt beim Mittagessen","Zuverlässig genug, um das Morgentief zu verhindern"]],
    ["Im Restaurant wählen Sie meistens …",["Etwas Neues, weil die Neugier lauter ist als die Vorsicht","Etwas, von dem Sie wissen, dass Sie sich danach gut fühlen","Die Spezialität des Hauses – nach einer vernünftigen Frage","Das Üppigste auf der Karte, weil das Leben kurz ist"]],
    ["Ihre Trinkflasche ist wahrscheinlich …",["In der Nähe und wird tatsächlich benutzt","Irgendwo im Haus – rein technisch gesehen","Bis auf Weiteres durch Kaffee ersetzt"]],
    ["Welches Essensmotto passt am besten zu Ihnen?",["Mein zukünftiges Ich kann sich beschweren","Meist vernünftig, manchmal feierlich","Wenn es Freude bringt, bekommt es einen Platz am Tisch"]],
    ["Eine Erledigung ist ganz in der Nähe. Wie kommen Sie normalerweise dorthin?",["Mit dem Auto","Mit öffentlichen Verkehrsmitteln","Zu Fuß","Mit dem Fahrrad"]],
    ["Es ist Sonntag. Wählen Sie Ihr Aktivitätsniveau.",["Sofamodus","Ein gemütlicher Spaziergang","Eine Radtour","Eine richtige Laufrunde"]],
    ["Welchen Bewegungsplan würden Sie wirklich durchhalten?",["Einen Spaziergang, für den ich keine neue Persönlichkeit brauche","Eine dramatische zweiwöchige Fitnessära","Beim Putzen tanzen und es Ausdauertraining nennen"]],
    ["Ihre Abendroutine ähnelt am ehesten …",["Einem vernünftigen Ausklang, der meistens funktioniert","Nur noch eine Sache, dann noch eine – und schon ist es zu spät","Ich schlafe dort ein, wo der Tag mich absetzt"]],
    ["Wenn der Stress den Raum betritt, …",["Versuchen Sie, sechs Dinge gleichzeitig zu lösen","Vermeiden Sie Blickkontakt und hoffen, dass er wieder geht","Verkleinern Sie das Problem auf den nächsten klaren Schritt"]],
    ["Wie erholt fühlen Sie sich normalerweise beim Aufwachen?",["Gar nicht","Ein wenig","Teilweise","Ziemlich","Vollkommen"]],
    ["Eine kleine Unannehmlichkeit taucht auf. Sie …",["Erledigen sie, bevor daraus eine Saga wird","Machen daraus eine Saga mit hervorragender Erzählung","Verschieben sie und hoffen, dass es sich von selbst regelt"]],
    ["Was hilft Ihnen am besten beim Einschlafen?",["Von einem Abenteuer völlig erschöpft zu sein","Hintergrundgeräusche und eine sanfte Flucht aus der Wirklichkeit","Ein ruhiger Raum und ein noch ruhigerer Kopf"]],
    ["Nach einer chaotischen Woche bin ich am Montag meistens …",["Wieder bei einem einfachen Plan","Mit einer beruhigenden Gewohnheit neu gestartet","Noch dabei, Luft zu holen"]],
    ["Gesunde Gewohnheiten sind bei mir …",["Automatisch","Meist beständig","Mal da, mal weg","Mehr Absicht als Routine"]],
    ["Welche persönliche Regel würde Ihnen am meisten helfen?",["Die Zwei-Minuten-Aufgabe sofort erledigen","Platz für Überraschungen lassen","Ausruhen, bevor alles dramatisch wird"]],
    ["Ihr perfekter Gruppenplan hat …",["Gute Leute, klare Zeiten und einen einfachen Ausstieg","Einen lockeren Rahmen, den alle mitgestalten können","Eine Wendung, mit der niemand gerechnet hat"]],
    ["Auf einer Party sind Sie am ehesten …",["Teil einer Geschichte, die mit „irgendwie“ beginnt","Zwischen Gesprächen unterwegs und dann kurz in ruhiger Pause","Bei den Snacks behilflich, weil das eine Aufgabe gibt"]],
    ["Wenn jemand „kurze Frage“ schreibt, denken Sie …",["Gern, falls daraus Klatsch wird","Ich frage erst, worum es geht, bevor ich meine Energie einteile","Bereit, aber vorsichtig"]],
    ["Ihre Freunde würden Sie wahrscheinlich beschreiben als …",["Auf angenehm normale Weise zuverlässig","Beständig, wenn es zählt, spontan, wenn es hilft","Eine liebenswerte Quelle für Nebenmissionen"]],
    ["Nach einem sehr geselligen Tag brauchen Sie …",["Noch einen Plan, wenn die Stimmung gut ist","Etwas Ruhiges mit ein oder zwei Lieblingsmenschen","Eine lange stille Pause, bis ich mich wieder normal fühle"]],
    ["Wie oft nehmen Sie sich Zeit für Menschen, die Sie wirklich gernhaben?",["Fast nie","Selten","Manchmal","Oft","Sehr oft"]],
    ["Wenn sich ein Plan in letzter Minute ändert, …",["Passen Sie sich an und finden den neuen vernünftigen Weg","Tun Sie so, als sei das von Anfang an der Plan gewesen","Brauchen Sie kurz Zeit zum Neustart"]],
    ["Welche Routine würde Ihr Leben am stärksten verbessern?",["Eine Pausentaste für meinen Kopf","Ein einfacher wöchentlicher Neustart","Mehr Spiel in normalen Tagen"]],
    ["Ein günstiger Flug für morgen taucht auf. Sie …",["Prüfen die Details, bevor die Fantasie übernimmt","Beginnen innerlich schon zu packen","Schließen den Tab, weil morgen wirklich zu bald ist"]],
    ["Welches Risiko passt am ehesten zu Ihnen?",["Ja sagen, bevor ich den ganzen Plan gelesen habe","Etwas Neues bestellen und auf das Beste hoffen","Eine neue Gewohnheit ausprobieren, ohne ein Drama daraus zu machen"]],
    ["Ihr Kalender ist meistens …",["Voll mit Dingen, denen ich zugesagt habe und die ich dann vergessen habe","Nützlich genug, um Katastrophen zu verhindern","Rein theoretisch dekorativ"]],
    ["Welche kleine Freude funktioniert immer?",["Frische Luft und eine nette kleine Erledigung","Lachen, bis sich der Plan ändert","Eine ruhige Ecke und etwas Tröstliches"]],
    ["Ihr „Ich lebe“-Moment ist meistens …",["Eine absurde Geschichte, die sich gerade entfaltet","Die Erkenntnis, dass ich Nein sagen und zu Hause bleiben kann","Sonnenlicht, Bewegung und ein klarer Kopf"]],
    ["Ihr zukünftiges Ich würde Ihnen danken für …",["Eine unvergessliche Erinnerung","Eine richtige Pause vor dem Zusammenbruch","Eine langweilige Sache, die Sie einfacher gemacht haben"]],
    ["Verglichen mit vor fünf Jahren ist meine Energie …",["Besser","Ähnlich","Niedriger"]],
    ["Welches Alter stellen Sie sich für sich selbst vor?",["70 bis 79 Jahre","80 bis 89 Jahre","90 bis 99 Jahre","100 Jahre oder mehr"]]
  ],
  it: [
    ["Si libera una serata. Quale programma ti somiglia di più?",["Scegliere qualcosa di spontaneo e vedere dove porta","Cucinare qualcosa di buono, fare una passeggiata e rallentare","Incastrare lavoro, amici e qualsiasi altra cosa capiti"]],
    ["Il tuo sabato mattina ideale comincia con…",["Una colazione lenta e un programma davvero fattibile","Cinque sveglie, tre commissioni e una quantità eroica di caffè","Nessun programma: vedo dove mi porta la giornata"]],
    ["Quando la settimana si riempie troppo, cosa ti salva di solito?",["Spingere ancora più forte finché la pressione non cede","Annullare tutto e scegliere il divano in santa pace","Una lista semplice e una cosa alla volta"]],
    ["Quando l’energia cala a metà giornata, cosa aiuta di più?",["Cambiare aria e fare qualcosa di spontaneo","Un po’ di tranquillità, senza nuove richieste","Una breve pausa e un prossimo passo chiaro"]],
    ["Quanto spesso ti complichi la vita più del necessario?",["Lo sto facendo proprio adesso","Solo quando ignoro la soluzione ovvia","Regolarmente, ma almeno rende tutto interessante"]],
    ["Il tuo rapporto con la sveglia è…",["Quasi immaginario, perché mi sveglio prima","Rispettoso, ma non romantico","Una battaglia quotidiana"]],
    ["Quando la vita si fa intensa, casa tua diventa…",["Un rifugio comodo con qualche spuntino vicino","Un po’ disordinata, ma recuperabile","La prova che è iniziata una missione secondaria"]],
    ["Compare una bolletta, un modulo o un promemoria. Tu…",["Lo metti in un posto sicuro e poi dimentichi dov’è","Imposti tre promemoria e resti comunque diffidente","Te ne occupi finché è ancora una piccola cosa"]],
    ["Verso quale tavolo degli spuntini ti dirigi?",["Fette di mela, frutta secca e un po’ di cioccolato fondente","Una bella fetta di torta","Hummus, olive e verdure croccanti","Qualsiasi snack confezionato sia più vicino"]],
    ["A colazione sei più tipo da…",["Un caffè con decisamente troppa sicurezza","Colazione? Preferisco un ingresso trionfale a pranzo","Qualcosa di abbastanza affidabile da evitare il calo mattutino"]],
    ["Al ristorante di solito scegli…",["Qualcosa di nuovo, perché la curiosità supera la cautela","Ciò che sai ti farà stare bene","La specialità della casa, dopo una domanda sensata","La cosa più ricca del menù, perché la vita è breve"]],
    ["La tua borraccia probabilmente è…",["Vicino e usata davvero","Da qualche parte in casa, tecnicamente","Sostituita dal caffè fino a nuovo avviso"]],
    ["Quale motto sul cibo ti rappresenta di più?",["Il mio io futuro potrà lamentarsi","Perlopiù sensato, a volte celebrativo","Se porta gioia, merita un posto a tavola"]],
    ["C’è una commissione da fare qui vicino. Come ci vai di solito?",["In auto","Con i mezzi pubblici","A piedi","In bicicletta"]],
    ["È domenica. Scegli il tuo livello di movimento.",["Modalità divano","Una passeggiata tranquilla","Un giro in bicicletta","Una vera corsa"]],
    ["Quale programma di movimento riusciresti davvero a mantenere?",["Una passeggiata che non richieda una nuova personalità","Un’epica fase fitness di due settimane","Ballare mentre pulisco e chiamarlo cardio"]],
    ["La tua routine serale assomiglia di più a…",["Un buon rallentamento che funziona quasi sempre","Ancora una cosa, poi un’altra… e ops","Addormentarmi dove mi lascia la giornata"]],
    ["Quando lo stress entra nella stanza, di solito…",["Cominci a risolvere sei cose insieme","Eviti il contatto visivo sperando che se ne vada","Riduci il problema al prossimo passo chiaro"]],
    ["Quanto ti senti riposato al risveglio?",["Per niente","Poco","Abbastanza","Quasi del tutto","Completamente"]],
    ["Compare un piccolo inconveniente. Tu…",["Lo risolvi prima che diventi una saga","Lo trasformi in una saga raccontata benissimo","Lo rimandi sperando che si sistemi da solo"]],
    ["Cosa ti aiuta di più a dormire?",["Essere completamente esausto per un’avventura","Un rumore di fondo e una dolce fuga dalla realtà","Una stanza tranquilla e una mente ancora più tranquilla"]],
    ["Dopo una settimana caotica, il lunedì di solito sono…",["Di nuovo su un programma semplice","Ripartito con una piccola abitudine rassicurante","Ancora in fase di recupero"]],
    ["Per me le abitudini sane sono…",["Automatiche","Quasi sempre costanti","A intermittenza","Più intenzione che routine"]],
    ["Quale regola personale ti aiuterebbe di più?",["Fare subito il compito da due minuti","Lasciare spazio alle sorprese","Riposare prima che tutto diventi drammatico"]],
    ["Il tuo programma di gruppo perfetto comprende…",["Belle persone, orari chiari e un’uscita facile","Un programma flessibile che tutti possono plasmare","Un colpo di scena che nessuno si aspetta"]],
    ["A una festa è più probabile che tu…",["Finisca in una storia che comincia con «non si sa come»","Passi da una conversazione all’altra, poi faccia una pausa tranquilla","Dia una mano con gli spuntini, così hai uno scopo"]],
    ["Quando qualcuno scrive «domanda veloce», tu…",["Se diventa pettegolezzo, ben venga","Chiedo cosa serve prima di decidere quanta energia ho","Rispondo, ma con prudenza"]],
    ["I tuoi amici probabilmente ti definirebbero…",["Affidabile in modo piacevolmente normale","Stabile quando conta, spontaneo quando serve","Un’adorabile fonte di missioni secondarie"]],
    ["Dopo una giornata molto sociale, hai bisogno di…",["Un altro programma, se l’atmosfera è giusta","Qualcosa di tranquillo con una o due persone del cuore","Un lungo riposo in silenzio prima di tornare normale"]],
    ["Quanto spesso trovi tempo per le persone che ti piace davvero frequentare?",["Quasi mai","Raramente","A volte","Spesso","Molto spesso"]],
    ["Quando un programma cambia all’ultimo minuto, tu…",["Ti adatti e trovi il nuovo percorso sensato","Fingi che fosse quello il programma da sempre","Hai bisogno di un minuto per riavviarti"]],
    ["Quale abitudine migliorerebbe di più la tua vita?",["Un tasto pausa per il cervello","Un semplice riassetto settimanale","Più gioco nelle giornate normali"]],
    ["Compare un volo economico per domani. Tu…",["Controlli i dettagli prima che l’immaginazione prenda il sopravvento","Cominci già a fare la valigia con la mente","Chiudi la scheda: domani è decisamente troppo presto"]],
    ["Quale rischio ti rappresenta di più?",["Dire sì prima di leggere tutto il programma","Ordinare qualcosa di nuovo e sperare bene","Provare una nuova abitudine senza renderla drammatica"]],
    ["Il tuo calendario di solito è…",["Pieno di cose che avevo dimenticato di aver accettato","Abbastanza utile da evitare disastri","Decorativo, in teoria"]],
    ["Quale piccola gioia funziona sempre?",["Aria fresca e una commissione piacevole","Ridere finché il programma non cambia","Un angolo tranquillo e qualcosa di confortante"]],
    ["Il tuo momento «mi sento vivo» di solito è…",["Una storia assurda che si svolge in tempo reale","Ricordarmi che posso dire no e restare a casa","Sole, movimento e mente lucida"]],
    ["Il tuo io futuro ti ringrazierebbe per…",["Aver creato un ricordo indimenticabile","Aver fatto una vera pausa prima del crollo","Aver reso più semplice una cosa noiosa"]],
    ["Rispetto a cinque anni fa, la mia energia è…",["Migliore","Simile","Più bassa"]],
    ["Fino a che età ti immagini di vivere?",["Tra 70 e 79 anni","Tra 80 e 89 anni","Tra 90 e 99 anni","100 anni o più"]]
  ],
  nl: [
    ["Er komt onverwacht een avond vrij. Welk plan past het best bij jou?",["Iets spontaan kiezen en zien waar het toe leidt","Iets fatsoenlijks koken, wandelen en rustig afronden","Werk, vrienden en alles wat nog langskomt erin proppen"]],
    ["Jouw ideale zaterdagochtend begint met…",["Een rustig ontbijt en een plan dat echt haalbaar voelt","Vijf wekkers, drie boodschappen en een heldhaftige hoeveelheid koffie","Helemaal geen plan: gewoon zien waar de dag je brengt"]],
    ["Als je week overvol raakt, wat redt je meestal?",["Nog harder doorgaan tot de druk eindelijk afneemt","Alles afzeggen en in alle rust voor de bank kiezen","Een eenvoudig lijstje en één ding tegelijk"]],
    ["Als je energie halverwege de dag inzakt, wat helpt het meest?",["Een andere omgeving en iets spontaans","Rust, comfort en geen nieuwe verwachtingen","Een korte pauze en één duidelijke volgende stap"]],
    ["Hoe vaak maak je het leven moeilijker dan nodig?",["Daar ben ik op dit moment mee bezig","Alleen als ik de voor de hand liggende oplossing negeer","Regelmatig, maar zo blijft het tenminste interessant"]],
    ["Jouw relatie met de wekker is…",["Vooral denkbeeldig, want ik word ervoor wakker","Respectvol, maar niet romantisch","Een dagelijks klein gevecht"]],
    ["Als het leven druk wordt, is jouw huis…",["Een comfortabele grot met snacks binnen handbereik","Een beetje rommelig, maar nog te redden","Bewijs dat er een zijmissie heeft plaatsgevonden"]],
    ["Er verschijnt een rekening, formulier of afspraakherinnering. Jij…",["Legt het veilig weg en vergeet vervolgens waar het ligt","Stelt drie herinneringen in en blijft toch achterdochtig","Regelt het zolang het nog klein is"]],
    ["Naar welke snacktafel loop je toe?",["Appelschijfjes, noten en een beetje pure chocolade","Een flinke punt taart","Hummus, olijven en knapperige groenten","Welke verpakte snack maar het dichtst bij ligt"]],
    ["Jouw ontbijtpersoonlijkheid is…",["Koffie met veel te veel zelfvertrouwen","Ontbijt? Ik maak liever een dramatische entree bij de lunch","Betrouwbaar genoeg om een ochtenddip te voorkomen"]],
    ["In een restaurant kies je meestal…",["Iets nieuws, omdat nieuwsgierigheid harder roept dan voorzichtigheid","Iets waarvan je weet dat je je er goed bij voelt","De specialiteit van het huis, na één verstandige vraag","Het rijkste gerecht op de kaart, want het leven is kort"]],
    ["Jouw drinkfles staat waarschijnlijk…",["Dichtbij en wordt echt gebruikt","Ergens in huis, technisch gezien","Tot nader order vervangen door koffie"]],
    ["Welk eetmotto past het best bij jou?",["Mijn toekomstige ik kan een klacht indienen","Meestal verstandig, soms feestelijk","Als het vreugde brengt, krijgt het een plek aan tafel"]],
    ["Je moet iets vlakbij regelen. Hoe ga je er meestal heen?",["Met de auto","Met het openbaar vervoer","Lopend","Met de fiets"]],
    ["Het is zondag. Kies je bewegingsniveau.",["Bankstand","Een rustige wandeling","Een fietstocht","Een stevige hardloopronde"]],
    ["Welk bewegingsplan zou je echt volhouden?",["Een wandeling waarvoor ik geen nieuwe persoonlijkheid nodig heb","Een dramatische fitnessperiode van twee weken","Dansen tijdens het schoonmaken en dat cardio noemen"]],
    ["Jouw bedtijdroutine lijkt het meest op…",["Een behoorlijke afbouw die meestal werkt","Nog één ding, en nog één, en oeps","In slaap vallen waar de dag me neerzet"]],
    ["Als stress de kamer binnenloopt, dan…",["Probeer je zes dingen tegelijk op te lossen","Vermijd je oogcontact en hoop je dat het vertrekt","Maak je het probleem kleiner tot één duidelijke volgende stap"]],
    ["Hoe uitgerust voel je je meestal als je wakker wordt?",["Helemaal niet","Een beetje","Redelijk","Grotendeels","Volledig"]],
    ["Er verschijnt een klein ongemak. Jij…",["Regelt het voordat het een heel verhaal wordt","Maakt er een geweldig verteld drama van","Laat het liggen en hoopt dat het goedkomt"]],
    ["Wat helpt je het best om te slapen?",["Volledig uitgeput zijn door avontuur","Achtergrondgeluid en een zachte ontsnapping aan de werkelijkheid","Een rustige kamer en een nog rustiger hoofd"]],
    ["Na een chaotische week ben ik op maandag meestal…",["Terug bij een eenvoudig plan","Opnieuw begonnen met één geruststellende routine","Nog bezig om op adem te komen"]],
    ["Gezonde gewoonten zijn voor mij…",["Automatisch","Meestal consequent","Met vlagen","Meer een voornemen dan een routine"]],
    ["Welke persoonlijke regel zou jou het meest helpen?",["De taak van twee minuten nu doen","Ruimte laten voor verrassing","Rust nemen voordat alles dramatisch wordt"]],
    ["Jouw perfecte groepsplan heeft…",["Leuke mensen, duidelijke tijden en een makkelijke uitweg","Een los plan waaraan iedereen kan meebouwen","Een wending die niemand zag aankomen"]],
    ["Op een feestje ben je waarschijnlijk…",["Onderdeel van een verhaal dat begint met ‘op de een of andere manier’","Tussen gesprekken aan het bewegen en daarna even rustig aan het opladen","Aan het helpen met snacks, omdat dat je een doel geeft"]],
    ["Als iemand ‘kort vraagje’ appt, voel je…",["Blij als het roddels worden","Ik vraag wat er nodig is voordat ik bepaal hoeveel energie ik heb","Ik reageer, maar met enige voorzichtigheid"]],
    ["Zo zouden je vrienden je waarschijnlijk omschrijven…",["Betrouwbaar op een verfrissend normale manier","Standvastig als het telt, spontaan als het helpt","Een sympathieke bron van zijmissies"]],
    ["Na een heel sociale dag heb je behoefte aan…",["Nog een plan als de sfeer goed is","Iets rustigs met één of twee favoriete mensen","Een lange stille reset voor ik me weer normaal voel"]],
    ["Hoe vaak maak je tijd voor mensen met wie je echt graag bent?",["Bijna nooit","Zelden","Soms","Vaak","Heel vaak"]],
    ["Als een plan op het laatste moment verandert, dan…",["Pas je je aan en zoek je de nieuwe verstandige route","Doe je alsof dit altijd al het plan was","Heb je een minuut nodig om opnieuw op te starten"]],
    ["Welke routine zou jouw leven het meest verbeteren?",["Een pauzeknop voor mijn hoofd","Een eenvoudige wekelijkse reset","Meer speelsheid in gewone dagen"]],
    ["Er verschijnt een goedkope vlucht voor morgen. Jij…",["Controleert de details voordat je fantasie op hol slaat","Begint in gedachten al in te pakken","Sluit het tabblad, want morgen is echt te snel"]],
    ["Welk risico past het best bij jou?",["Ja zeggen voordat ik het hele plan heb gelezen","Iets nieuws bestellen en op het beste hopen","Een nieuwe gewoonte proberen zonder er een drama van te maken"]],
    ["Jouw agenda staat meestal…",["Vol dingen waarvan ik vergeten was dat ik ermee had ingestemd","Nuttig genoeg om rampen te voorkomen","Vooral voor de sier"]],
    ["Welk klein gelukje werkt altijd?",["Frisse lucht en een prettige kleine boodschap","Lachen tot het plan verandert","Een rustig hoekje en iets troostends"]],
    ["Jouw ‘ik leef’-moment is meestal…",["Een belachelijk verhaal dat zich ter plekke ontvouwt","Beseffen dat ik nee kan zeggen en thuis kan blijven","Zonlicht, beweging en een helder hoofd"]],
    ["Jouw toekomstige ik zou je bedanken voor…",["Eén onvergetelijke herinnering","Een echte pauze voordat je instort","Eén saai ding makkelijker maken"]],
    ["Vergeleken met vijf jaar geleden is mijn energie…",["Beter","Ongeveer hetzelfde","Lager"]],
    ["Hoe oud denk je te worden?",["Tussen 70 en 79 jaar","Tussen 80 en 89 jaar","Tussen 90 en 99 jaar","100 jaar of ouder"]]
  ],
  es: [
    ["Te queda una tarde libre. ¿Qué plan se parece más a ti?",["Elegir algo espontáneo y ver adónde lleva","Cocinar algo decente, dar un paseo y terminar el día con calma","Llenarla de trabajo, amigos y todo lo que surja"]],
    ["Tu sábado ideal empieza con…",["Un desayuno tranquilo y un plan que de verdad parece posible","Cinco alarmas, tres recados y una cantidad heroica de café","Ningún plan: dejar que el día decida"]],
    ["Cuando la semana se llena demasiado, ¿qué suele salvarte?",["Apretar aún más hasta que la presión por fin ceda","Cancelar todo y elegir el sofá en paz","Una lista sencilla y una cosa cada vez"]],
    ["Cuando baja tu energía a mitad del día, ¿qué ayuda más?",["Cambiar de ambiente y hacer algo espontáneo","Tranquilidad, comodidad y ninguna exigencia nueva","Una pausa breve y un siguiente paso claro"]],
    ["¿Con qué frecuencia te complicas la vida más de lo necesario?",["Eso es exactamente lo que hago ahora","Solo cuando ignoro la solución evidente","A menudo, pero al menos hace la vida interesante"]],
    ["Tu relación con el despertador es…",["Casi imaginaria, porque me despierto antes","Respetuosa, pero nada romántica","Un juicio que se repite cada mañana"]],
    ["Cuando la vida se acelera, tu casa se convierte en…",["Un refugio cómodo con algo para picar cerca","Un pequeño desorden que todavía tiene arreglo","La prueba de que hubo una misión secundaria"]],
    ["Aparece una factura, un formulario o un recordatorio de cita. Tú…",["Lo guardas en un lugar seguro y luego olvidas dónde está","Pones tres recordatorios y aun así desconfías","Lo resuelves mientras todavía es una tarea pequeña"]],
    ["¿Hacia qué mesa de aperitivos te diriges?",["Rodajas de manzana, frutos secos y un poco de chocolate negro","Una porción generosa de pastel","Hummus, aceitunas y verduras crujientes","El aperitivo envasado que esté más cerca"]],
    ["En el desayuno eres más de…",["Un café con mucha más confianza de la necesaria","¿Desayuno? Prefiero una entrada triunfal a la hora de comer","Algo lo bastante fiable para evitar el bajón de la mañana"]],
    ["En un restaurante sueles elegir…",["Algo nuevo, porque la curiosidad habla más alto que la cautela","Lo que sabes que te sentará bien","La especialidad de la casa, después de una pregunta sensata","Lo más contundente del menú, porque la vida es corta"]],
    ["Lo más probable es que tu botella de agua esté…",["Cerca y en uso de verdad","En algún lugar de la casa, técnicamente","Sustituida por café hasta nuevo aviso"]],
    ["¿Qué lema sobre la comida se parece más a ti?",["Mi yo del futuro puede presentar una queja","Casi siempre sensato, a veces festivo","Si da alegría, tiene un lugar en la mesa"]],
    ["Tienes que hacer un recado cerca. ¿Cómo sueles ir?",["En automóvil","En transporte público","A pie","En bicicleta"]],
    ["Es domingo. Elige tu nivel de movimiento.",["Modo sofá","Un paseo tranquilo","Un paseo en bicicleta","Salir a correr en serio"]],
    ["¿Qué plan de movimiento mantendrías de verdad?",["Un paseo que no exija una personalidad nueva","Una intensa etapa deportiva de dos semanas","Bailar mientras limpio y llamarlo ejercicio cardiovascular"]],
    ["Tu rutina antes de dormir se parece más a…",["Un buen rato para desconectar que casi siempre funciona","Una cosa más, luego otra… y vaya","Dormirme donde me deje el día"]],
    ["Cuando el estrés entra en la habitación, tú…",["Intentas resolver seis cosas a la vez","Evitas mirarlo y esperas que se vaya","Reduces el problema al siguiente paso claro"]],
    ["¿Cómo de descansado sueles sentirte al despertar?",["Nada","Poco","A medias","Bastante","Por completo"]],
    ["Aparece un pequeño inconveniente. Tú…",["Lo resuelves antes de que se convierta en una saga","Lo conviertes en una saga muy bien narrada","Lo dejas para después y esperas que se arregle"]],
    ["¿Qué te ayuda más a dormir?",["Estar totalmente agotado por una aventura","Ruido de fondo y una suave escapatoria de la realidad","Una habitación tranquila y una mente aún más tranquila"]],
    ["Después de una semana caótica, el lunes normalmente estoy…",["De vuelta a un plan sencillo","Empezando de nuevo con una rutina reconfortante","Todavía recuperando el aliento"]],
    ["Para mí, los hábitos saludables son…",["Automáticos","Bastante constantes","Intermitentes","Más intención que rutina"]],
    ["¿Qué regla personal te ayudaría más?",["Hacer ahora la tarea que lleva dos minutos","Dejar espacio para la sorpresa","Descansar antes de que todo se vuelva dramático"]],
    ["Tu plan de grupo perfecto incluye…",["Buena gente, horarios claros y una salida fácil","Un plan flexible que todos puedan adaptar","Un giro que nadie esperaba"]],
    ["En una fiesta, lo más probable es que estés…",["Dentro de una historia que empieza con «de alguna manera»","Pasando de una conversación a otra y luego descansando un momento","Ayudando con los aperitivos, porque así tienes una misión"]],
    ["Cuando alguien escribe «una pregunta rápida», tú…",["Encantado si termina siendo un chisme","Pregunto qué necesita antes de decidir cuánta energía tengo","Respondo, pero con cautela"]],
    ["Tus amigos probablemente dirían que eres…",["Fiable de una forma agradablemente normal","Estable cuando importa y espontáneo cuando ayuda","Una adorable fuente de misiones secundarias"]],
    ["Después de un día muy social, necesitas…",["Otro plan si hay buen ambiente","Algo tranquilo con una o dos personas favoritas","Un largo descanso en silencio antes de volver a sentirme normal"]],
    ["¿Con qué frecuencia dedicas tiempo a las personas con las que de verdad disfrutas?",["Casi nunca","Rara vez","A veces","A menudo","Muy a menudo"]],
    ["Cuando un plan cambia a última hora, tú…",["Te adaptas y encuentras la nueva opción sensata","Finges que ese era el plan desde el principio","Necesitas un minuto para reiniciar"]],
    ["¿Qué rutina mejoraría más tu vida?",["Un botón de pausa para mi mente","Un sencillo reinicio semanal","Más juego en los días normales"]],
    ["Aparece un vuelo barato para mañana. Tú…",["Revisas los detalles antes de que vuele la imaginación","Empiezas a hacer la maleta mentalmente","Cierras la pestaña, porque mañana ya es demasiado pronto"]],
    ["¿Qué riesgo se parece más a ti?",["Decir que sí antes de leer el plan completo","Pedir algo nuevo y esperar lo mejor","Probar un hábito nuevo sin convertirlo en un drama"]],
    ["Tu calendario suele estar…",["Lleno de cosas que olvidé haber aceptado","Lo bastante ordenado para evitar desastres","De adorno, en teoría"]],
    ["¿Qué pequeño placer funciona siempre?",["Aire fresco y un recado agradable","Reír hasta que cambie el plan","Un rincón tranquilo y algo reconfortante"]],
    ["Tu momento de «estoy vivo» suele ser…",["Una historia absurda que sucede en tiempo real","Recordar que puedo decir que no y quedarme en casa","Sol, movimiento y la mente despejada"]],
    ["Tu yo del futuro te agradecería…",["Crear un recuerdo inolvidable","Tomarte un descanso de verdad antes de agotarte","Hacer más fácil una tarea aburrida"]],
    ["En comparación con hace cinco años, mi energía es…",["Mejor","Parecida","Menor"]],
    ["¿Hasta qué edad te imaginas vivir?",["Entre 70 y 79 años","Entre 80 y 89 años","Entre 90 y 99 años","100 años o más"]]
  ],
  pt: [
    ["Surge uma noite livre. Que plano combina mais consigo?",["Escolher algo espontâneo e ver onde isso leva","Preparar uma boa refeição, dar um passeio e terminar a noite com calma","Juntar trabalho, amigos e tudo o que vier a seguir"]],
    ["A manhã de sábado ideal começa com…",["Uma primeira refeição tranquila e um plano que parece realmente possível","Cinco alarmes, três tarefas e uma quantidade heroica de café","Plano nenhum: deixar o dia decidir"]],
    ["Quando a semana fica cheia demais, o que costuma ajudar?",["Forçar ainda mais até a pressão finalmente passar","Cancelar tudo e escolher o sofá em paz","Uma lista simples e uma coisa de cada vez"]],
    ["Quando a energia baixa a meio do dia, o que ajuda mais?",["Mudar de ambiente e fazer algo espontâneo","Conforto, silêncio e nenhuma nova exigência","Uma pausa breve e um próximo passo claro"]],
    ["Com que frequência complica a vida mais do que seria necessário?",["É exatamente o que faço agora","Só quando ignoro a solução óbvia","Regularmente, mas pelo menos fica interessante"]],
    ["A sua relação com o despertador é…",["Quase imaginária, porque acordo antes dele","Respeitosa, mas nada romântica","Uma batalha judicial diária"]],
    ["Quando a vida acelera, a sua casa torna-se…",["Um refúgio confortável com algo para comer por perto","Um pouco desarrumada, mas recuperável","A prova de que aconteceu uma missão secundária"]],
    ["Surge uma conta, um formulário ou um lembrete de consulta. O que faz?",["Guarda num lugar seguro e depois esquece onde fica esse lugar","Define três lembretes e continua desconfiado","Resolve enquanto ainda é uma tarefa pequena"]],
    ["Para que mesa de petiscos se dirige?",["Fatias de maçã, amendoins e um pouco de chocolate amargo","Uma fatia generosa de bolo","Pasta de grão-de-bico, azeitonas e legumes crocantes","O alimento embalado que estiver mais perto"]],
    ["Na primeira refeição do dia, qual opção combina mais com a sua personalidade?",["Um café com confiança a mais","Primeira refeição? Prefiro começar em grande mais tarde","Algo de confiança para evitar a queda de energia da manhã"]],
    ["Num restaurante, costuma escolher…",["Algo novo, porque a curiosidade fala mais alto do que a cautela","Aquilo que sabe que lhe vai fazer bem","A especialidade da casa, depois de uma pergunta sensata","O prato mais rico do menu, porque a vida é curta"]],
    ["A sua garrafa de água está provavelmente…",["Por perto e é realmente usada","Algures em casa, tecnicamente","Substituída por café até nova indicação"]],
    ["Que lema sobre comida combina mais consigo?",["O meu eu do futuro pode apresentar uma reclamação","Quase sempre sensato, por vezes festivo","Se traz alegria, merece um lugar à mesa"]],
    ["Há uma tarefa a fazer aqui perto. Como costuma ir?",["De carro","De transporte público","A pé","De bicicleta"]],
    ["É domingo. Escolha o seu nível de movimento.",["Modo sofá","Um passeio tranquilo","Um passeio de bicicleta","Uma corrida a sério"]],
    ["Que plano de movimento conseguiria realmente manter?",["Um passeio que não exija uma nova personalidade","Uma fase dramática de exercício durante duas semanas","Dançar durante a limpeza e considerar isso exercício cardiovascular"]],
    ["A rotina antes de dormir parece-se mais com…",["Um período tranquilo que quase sempre resulta","Só mais uma coisa, depois outra… e já é tarde","Adormecer onde o dia me deixar"]],
    ["Quando o stress entra na sala, costuma…",["Tentar resolver seis coisas ao mesmo tempo","Fingir que não viu e esperar que vá embora","Reduzir o problema ao próximo passo claro"]],
    ["Quão descansado se sente normalmente ao acordar?",["Nada","Um pouco","Razoavelmente","Bastante","Por completo"]],
    ["Surge um pequeno problema. O que faz?",["Resolve antes de se tornar uma saga","Transforma numa saga muito bem contada","Deixa para depois e espera que tudo se resolva"]],
    ["O que mais ajuda a dormir?",["Ficar completamente esgotado por uma aventura","Ruído de fundo e uma fuga suave da realidade","Um quarto calmo e uma mente ainda mais calma"]],
    ["Depois de uma semana caótica, o início da semana costuma encontrar-me…",["De volta a um plano simples","A reiniciar com uma rotina reconfortante","Ainda a recuperar o fôlego"]],
    ["Para mim, os hábitos saudáveis são…",["Automáticos","Quase sempre consistentes","Intermitentes","Mais intenção do que rotina"]],
    ["Que regra pessoal ajudaria mais?",["Fazer já a tarefa que demora dois minutos","Deixar espaço para a surpresa","Descansar antes que tudo se torne dramático"]],
    ["O seu plano de grupo perfeito tem…",["Boas pessoas, horários claros e uma saída fácil","Um plano flexível que todos podem ajudar a moldar","Uma reviravolta que ninguém esperava"]],
    ["Numa festa, é mais provável que esteja…",["A fazer parte de uma história que começa com «de alguma forma»","A passar entre conversas e depois a fazer uma pausa tranquila","A ajudar com os petiscos, porque isso dá um propósito"]],
    ["Quando alguém escreve «pergunta rápida», como reage?",["Com entusiasmo, se acabar numa conversa sobre a vida alheia","Pergunto do que precisa antes de decidir quanta energia tenho","Estou pronto, mas com cautela"]],
    ["Os seus amigos provavelmente diriam que é…",["De confiança de uma forma agradavelmente normal","Estável quando importa e espontâneo quando ajuda","Uma fonte adorável de missões secundárias"]],
    ["Depois de um dia muito social, precisa de…",["Outro plano, se o ambiente estiver bom","Algo tranquilo com uma ou duas pessoas de quem gosto","Um longo descanso em silêncio antes de voltar ao normal"]],
    ["Com que frequência reserva tempo para as pessoas de quem realmente gosta?",["Quase nunca","Raramente","Às vezes","Muitas vezes","Com muita frequência"]],
    ["Quando um plano muda à última hora, costuma…",["Adaptar-se e encontrar a nova opção sensata","Fingir que esse sempre foi o plano","Precisar de um minuto para reiniciar"]],
    ["Que rotina melhoraria mais a sua vida?",["Um botão de pausa para a mente","Um reinício semanal simples","Mais diversão nos dias normais"]],
    ["Surge um voo barato para amanhã. O que faz?",["Verifica os detalhes antes que a imaginação tome conta","Começa mentalmente a fazer as malas","Fecha a página, porque amanhã é cedo demais"]],
    ["Que risco combina mais consigo?",["Dizer que sim antes de ler o plano completo","Pedir algo novo e esperar pelo melhor","Experimentar um hábito novo sem o transformar num drama"]],
    ["O seu calendário costuma estar…",["Cheio de coisas que já não lembrava ter aceitado","Organizado o suficiente para evitar desastres","Decorativo, em teoria"]],
    ["Que pequeno prazer resulta sempre?",["Ar fresco e uma tarefa agradável","Rir até o plano mudar","Um canto tranquilo e algo reconfortante"]],
    ["O seu momento de «estou vivo» costuma ser…",["Uma história absurda em tempo real","Perceber que posso dizer não e ficar em casa","Luz do sol, movimento e a mente clara"]],
    ["O seu eu do futuro agradeceria por…",["Criar uma memória inesquecível","Fazer uma pausa de verdade antes de se esgotar","Simplificar uma tarefa repetitiva"]],
    ["Em comparação com há cinco anos, a minha energia está…",["Melhor","Semelhante","Mais baixa"]],
    ["Até que idade imagina viver?",["70 e poucos","80 e poucos","90 e poucos","100 ou mais"]]
  ]
};

// One neutral Portuguese pack serves both Brazil and Portugal. These rewrites
// avoid regional breakfast vocabulary, gendered self-descriptions and literal
// English turns of phrase while preserving the answer-weight order.
banks.pt[0]=["Surge uma noite livre. Qual plano parece mais atraente?",["Escolher algo espontâneo e ver onde isso leva","Preparar uma boa refeição, dar um passeio e terminar a noite com calma","Combinar trabalho, amigos e tudo o que surgir"]];
banks.pt[1]=["A manhã de sábado ideal começa com…",["Uma refeição tranquila ao começar o dia e um plano realmente possível","Cinco alarmes, três tarefas e uma quantidade heroica de café","Plano nenhum: deixar o dia decidir"]];
banks.pt[8]=["Qual mesa de petiscos parece mais atraente?",["Fatias de maçã, amendoins e um pouco de chocolate amargo","Uma fatia generosa de bolo","Pasta de grão-de-bico, azeitonas e legumes crocantes","O petisco embalado mais próximo"]];
banks.pt[9]=["Ao começar o dia, qual opção parece mais familiar?",["Café, com confiança a mais","Prefiro comer algo mais tarde","Uma refeição equilibrada para evitar a queda de energia da manhã"]];
banks.pt[10][1][1]="Algo que costuma fazer bem";
banks.pt[11][1][1]="Em casa, em teoria";
banks.pt[12][1][1]="Quase sempre sensato, às vezes festivo";
banks.pt[18]=["Ao acordar, qual é normalmente o seu nível de descanso?",["Nenhum","Baixo","Médio","Alto","Completo"]];
banks.pt[21]=["Depois de uma semana caótica, como começa normalmente a semana seguinte?",["De volta a um plano simples","Com uma rotina reconfortante para recomeçar","Ainda a recuperar o fôlego"]];
banks.pt[26][1][2]="Aceito, mas com cautela";
banks.pt[33][0]="Que tipo de risco parece mais familiar?";
banks.pt[34]=["O calendário costuma estar…",["Cheio de compromissos que já tinham sido esquecidos","Organizado o suficiente para evitar desastres","Mais decorativo do que útil"]];
banks.pt[35][0]="Que pequeno prazer funciona sempre?";
banks.pt[37]=["O que mais ajudaria a sua versão futura?",["Viver algo inesquecível","Fazer uma pausa real antes do esgotamento","Simplificar uma tarefa repetitiva"]];
banks.pt[39]=["Até que idade imagina viver?",["Entre 70 e 79 anos","Entre 80 e 89 anos","Entre 90 e 99 anos","100 anos ou mais"]];

for (const [locale, rows] of Object.entries(banks)) {
  if (rows.length !== order.length) throw new Error(`${locale}: expected ${order.length} rows, found ${rows.length}`);
  const file = path.join(quizDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const byId = new Map(data.stages.flatMap((stage) => stage.questions).map((question) => [question.id, question]));
  order.forEach((id, index) => {
    const target = byId.get(id);
    if (!target) throw new Error(`${locale}: missing ${id}`);
    const [question, translatedAnswers] = rows[index];
    const weights = Object.values(target.answers);
    if (weights.length !== translatedAnswers.length) throw new Error(`${locale}/${id}: answer count changed`);
    target.question = question;
    target.answers = Object.fromEntries(translatedAnswers.map((answer, answerIndex) => [answer, weights[answerIndex]]));
  });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Rebuilt native Years Left bank: ${locale}`);
}
