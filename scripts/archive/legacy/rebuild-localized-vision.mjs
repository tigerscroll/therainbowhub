import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const quizDir = path.join(root, "data", "quizzes", "vision");
const locales = ["fr", "de", "it", "nl", "es", "pt"];
const english = JSON.parse(fs.readFileSync(path.join(quizDir, "en.json"), "utf8"));
const englishById = new Map(
  english.stages.flatMap((stage) => stage.questions).map((question) => [question.id, question]),
);

const banks = {
  fr: {
    questions: {
      "vision-r1q1": ["Quelle case a une couleur différente ?", ["En haut à gauche", "En bas à droite", "En haut à droite", "En bas à gauche"]],
      "vision-r3q4": ["À quelle position se trouve le symbole différent ?", ["Première", "Deuxième", "Troisième", "Quatrième"]],
      "vision-r1q2": ["Quel code correspond exactement au modèle ?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["Quelle forme vient ensuite ?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["La flèche pivote d’un quart de tour vers la droite à chaque étape. Quelle est la suivante ?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["Quel symbole est apparu en premier ?", ["Étoile", "Clé", "Parapluie", "Citron"]],
      "vision-r1q6": ["Combien y a-t-il de disques noirs ?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["Où se trouve la case violette ?", ["Au centre", "En bas à droite", "En haut à gauche", "En haut à droite"]],
      "vision-r4q3": ["Quelle flèche doit occuper l’étape 4 ?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["Quelle flèche est l’image de ↗ dans un miroir vertical ?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["Quelle paire est parfaitement identique ?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["Quelle ligne contient exactement sept points ?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["Quel symbole reste identique après un demi-tour ?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["Combien de lettres F sont affichées ?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["Quelle case vient ensuite ?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["Quel objet occupait la position en bas à gauche ?", ["Clé", "Feuille", "Lune", "Étoile"]],
      "vision-r9q5": ["Quelle forme se trouvait juste à droite du triangle doré ?", ["Étoile violette", "Carré corail", "Cercle bleu", "Losange vert"]],
      "vision-r7q2": ["Quel code apparaît deux fois ?", ["B4M", "A7Q", "C2R", "Aucun"]],
      "vision-r4q1": ["Quelle forme poursuit l’augmentation du nombre de côtés ?", ["Cercle", "Hexagone", "Triangle", "Carré"]],
      "vision-r4q2": ["Quel élément complète l’alternance ?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["Quelle couleur contraste le plus avec un bleu marine foncé ?", ["Nuance A", "Nuance B", "Nuance D", "Nuance C"]],
      "vision-r4q6": ["Quelle ligne reproduit exactement le modèle ?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["Quel nombre était associé au bleu ?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["Quel code est resté inchangé ?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["Les carrés centraux sont identiques. Pourquoi semblent-ils malgré tout différents ?", ["L’un est forcément plus clair", "La couleur change avec la distance", "Deux couleurs identiques paraissent toujours identiques", "Le contraste environnant modifie leur apparence"]],
      "vision-r8q3": ["Partez du point rouge et suivez son tracé en pointillés. Quelle lettre atteignez-vous ?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["Combien de fois BLEU apparaît-il comme mot isolé ?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["À quelle position se trouve le cercle contenant un point ?", ["Première", "Deuxième", "Quatrième", "Troisième"]],
      "vision-r7q5": ["Quelle case centrale ressort le plus dans l’ensemble sombre ?", ["En bas à gauche", "En haut à droite", "En haut à gauche", "En bas à droite"]],
      "vision-r9q2": ["Quelle position précise a changé dans la version B ?", ["Le premier V", "Le Q", "Le deuxième caractère", "Le dernier chiffre"]],
      "vision-r9q4": ["Dans quelle direction la flèche pointe-t-elle finalement ?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["Quelle étiquette ne correspond pas à sa couleur ?", ["Première", "Deuxième", "Troisième", "Quatrième"]],
      "vision-r10q2": ["Quels sont les deux caractères qui ont changé ?", ["7 et N", "8 et 6", "Q et P", "K et R"]],
      "vision-r10q4": ["Un carré est plié deux fois, puis perforé une fois à travers toutes les épaisseurs, loin des plis. Combien de trous voit-on après l’avoir déplié ?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["Quelle case tire légèrement vers le vert ?", ["En haut à gauche", "Au centre", "En bas à droite", "Au milieu en bas"]],
      "vision-r8q2": ["Quel code correspond exactement au modèle ?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Faites pivoter ↘ deux fois vers la droite.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["Quel symbole est apparu en quatrième position ?", ["Lune", "Ancre", "Soleil", "Étoile"]],
      "vision-r8q6": ["Combien y a-t-il d’étoiles noires ?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["Quel élément vient après les six formes affichées ?", ["●", "■", "○", "□"]]
    },
    text: {
      "REFERENCE": "MODÈLE", "BASE": "ORIGINAL", "COPY": "COPIE",
      "TOP LEFT — STAR": "EN HAUT À GAUCHE — ÉTOILE", "TOP RIGHT — MOON": "EN HAUT À DROITE — LUNE", "BOTTOM LEFT — KEY": "EN BAS À GAUCHE — CLÉ", "BOTTOM RIGHT — LEAF": "EN BAS À DROITE — FEUILLE",
      "RED — 4": "ROUGE — 4", "BLUE — 7": "BLEU — 7", "GOLD — 2": "DORÉ — 2",
      "BLUE 🟦": "BLEU 🟦", "GREEN 🟩": "VERT 🟩", "RED 🟦": "ROUGE 🟦", "GOLD 🟨": "DORÉ 🟨",
      "BASE::M8Q2-K7P4-R6N3": "RÉFÉRENCE::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3": "COPIE::M8Q2-K1P4-R6M3"
    },
    context: { "vision-r3q6":"Fanny finit cinq fiches, puis ferme facilement le fichier final.", "vision-r7q1": "BLEU CLAIR, CIEL BLEU, BLEU.", "vision-r9q2": "VERSION A : VISION-M7Q2-2026\nVERSION B : V1SION-M7Q2-2026", "vision-r4q6": "MODÈLE : ◇ ● ▲ ■", "vision-r9q4": "Faites d’abord pivoter la flèche de 90° dans le sens horaire. Reflétez ensuite le résultat dans un miroir vertical.", "vision-r10q3": "Suivez séparément le cycle des formes et celui du remplissage." },
    study: ["Mémorisez l’ordre", "Mémorisez les quatre positions", "Mémorisez les cinq formes", "Mémorisez les associations couleur-nombre", "Regard éclair"],
    aria: ["Quatre nuances de bleu proches, avec une case légèrement différente en bas à droite", "Quatre demi-cercles remplis ; le troisième l’est du côté opposé", "Code modèle M 7 K 2 P 9", "Triangle, cercle, triangle, cercle, point d’interrogation", "Flèche vers le haut, vers la droite, vers le bas, puis point d’interrogation", "Quatre disques noirs et deux cercles vides", "Grille de trois cases sur trois : violet au centre et bleu ailleurs", "Quatre étapes numérotées : nord-est, sud-est, sud-ouest, puis point d’interrogation", "Flèche nord-est reflétée dans un miroir vertical", "Carré noir, deux carrés vides, carré noir, deux carrés vides, puis point d’interrogation", "Cercle bleu, triangle doré, carré corail, losange vert et étoile violette", "Codes A7Q, B4M, C2R et B4M", "Triangle, carré, pentagone, puis point d’interrogation", "X, O, X, O, X, puis point d’interrogation", "Carrés centraux identiques sur deux fonds contrastés", "Quatre cercles ; le troisième contient un point", "Quatre ensembles sombres avec, au centre, une case jaune, violette, bleue ou verte", "Flèche nord-est, quart de tour vers la droite, puis miroir vertical", "Quatre étiquettes de couleur ; la troisième ne correspond pas à sa case", "Original M8Q2 K7P4 R6N3 et copie M8Q2 K1P4 R6M3", "Neuf nuances de bleu fixes, dont une tire vers le vert", "Flèche sud-est suivie de deux quarts de tour vers la droite", "Cinq étoiles noires parmi sept autres formes", "Six formes combinant une alternance cercle-carré et un cycle de remplissage en trois étapes"],
    imageAlt: ["Un point de départ rouge et quatre tracés en pointillés qui se croisent avant d’atteindre les lettres A, B, C et D", "Quatre étapes illustrées : un carré plié vers la droite, puis vers le bas, perforé une fois et enfin déplié"]
  },
  de: {
    questions: {
      "vision-r1q1": ["Welche Kachel hat eine andere Farbe?", ["Oben links", "Unten rechts", "Oben rechts", "Unten links"]],
      "vision-r3q4": ["An welcher Position steht das abweichende Symbol?", ["Erste", "Zweite", "Dritte", "Vierte"]],
      "vision-r1q2": ["Welcher Code stimmt exakt mit der Vorlage überein?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["Welche Form kommt als Nächstes?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["Der Pfeil dreht sich jedes Mal um 90 Grad nach rechts. Was kommt als Nächstes?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["Welches Symbol erschien zuerst?", ["Stern", "Schlüssel", "Regenschirm", "Zitrone"]],
      "vision-r1q6": ["Wie viele ausgefüllte Kreise sind zu sehen?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["Wo befindet sich die violette Kachel?", ["In der Mitte", "Unten rechts", "Oben links", "Oben rechts"]],
      "vision-r4q3": ["Welcher Pfeil gehört an Position 4?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["Welcher Pfeil ist das Spiegelbild von ↗ an einer senkrechten Achse?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["Welches Paar ist vollkommen identisch?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["Welche Reihe enthält genau sieben Punkte?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["Welches Symbol sieht nach einer halben Drehung unverändert aus?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["Wie viele Buchstaben F sind zu sehen?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["Welche Kachel kommt als Nächstes?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["Welcher Gegenstand lag unten links?", ["Schlüssel", "Blatt", "Mond", "Stern"]],
      "vision-r9q5": ["Welche Form lag direkt rechts neben dem goldenen Dreieck?", ["Violetter Stern", "Korallfarbenes Quadrat", "Blauer Kreis", "Grüne Raute"]],
      "vision-r7q2": ["Welcher Code kommt zweimal vor?", ["B4M", "A7Q", "C2R", "Keiner"]],
      "vision-r4q1": ["Welche Form setzt die steigende Anzahl der Seiten fort?", ["Kreis", "Sechseck", "Dreieck", "Quadrat"]],
      "vision-r4q2": ["Welche Kachel vervollständigt die abwechselnde Reihe?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["Welche Farbe hebt sich am stärksten von dunklem Marineblau ab?", ["Feld A", "Feld B", "Feld D", "Feld C"]],
      "vision-r4q6": ["Welche Reihe entspricht exakt der Vorlage?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["Welche Zahl war Blau zugeordnet?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["Welcher Code ist unverändert?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["Die mittleren Quadrate sind identisch. Warum können sie trotzdem unterschiedlich wirken?", ["Eines muss heimlich heller sein", "Die Farbe verändert sich mit dem Abstand", "Identische Farben sehen immer gleich aus", "Der umgebende Kontrast verändert ihre Wirkung"]],
      "vision-r8q3": ["Starten Sie am roten Punkt und folgen Sie seiner gepunkteten Linie. Welchen Buchstaben erreichen Sie?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["Wie oft steht BLAU als eigenständiges Wort?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["An welcher Position befindet sich der Kreis mit einem Punkt?", ["Erste", "Zweite", "Vierte", "Dritte"]],
      "vision-r7q5": ["Welche mittlere Kachel fällt in der dunklen Gruppe am stärksten auf?", ["Unten links", "Oben rechts", "Oben links", "Unten rechts"]],
      "vision-r9q2": ["Welche genaue Position hat sich in Version B verändert?", ["Das erste F", "Das Q", "Das zweite Zeichen", "Die letzte Ziffer"]],
      "vision-r9q4": ["In welche Richtung zeigt der Pfeil am Ende?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["Welche Beschriftung passt nicht zur Farbe ihrer Kachel?", ["Erste", "Zweite", "Dritte", "Vierte"]],
      "vision-r10q2": ["Welche beiden Zeichen haben sich verändert?", ["7 und N", "8 und 6", "Q und P", "K und R"]],
      "vision-r10q4": ["Ein Quadrat wird zweimal gefaltet und dann abseits der Faltkanten einmal durch alle Lagen gelocht. Wie viele Löcher sieht man nach dem Auffalten?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["Welche Kachel hat einen leichten Grünstich?", ["Oben links", "In der Mitte", "Unten rechts", "Unten in der Mitte"]],
      "vision-r8q2": ["Welcher Code stimmt exakt mit der Vorlage überein?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Drehen Sie ↘ zweimal um 90 Grad nach rechts.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["Welches Symbol erschien an vierter Stelle?", ["Mond", "Anker", "Sonne", "Stern"]],
      "vision-r8q6": ["Wie viele ausgefüllte Sterne sind zu sehen?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["Welches Element folgt auf die sechs gezeigten Formen?", ["●", "■", "○", "□"]]
    },
    text: { "REFERENCE":"VORLAGE", "BASE":"ORIGINAL", "COPY":"KOPIE", "TOP LEFT — STAR":"OBEN LINKS — STERN", "TOP RIGHT — MOON":"OBEN RECHTS — MOND", "BOTTOM LEFT — KEY":"UNTEN LINKS — SCHLÜSSEL", "BOTTOM RIGHT — LEAF":"UNTEN RECHTS — BLATT", "RED — 4":"ROT — 4", "BLUE — 7":"BLAU — 7", "GOLD — 2":"GOLD — 2", "BLUE 🟦":"BLAU 🟦", "GREEN 🟩":"GRÜN 🟩", "RED 🟦":"ROT 🟦", "GOLD 🟨":"GOLD 🟨", "BASE::M8Q2-K7P4-R6N3":"VORLAGE::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3":"KOPIE::M8Q2-K1P4-R6M3" },
    context: { "vision-r3q6":"Felix findet sofort fünf Fehler im Formular.", "vision-r7q1":"BLAU LEUCHTET, HIMMEL BLAU, BLAU.", "vision-r9q2":"VERSION A: FOKUS-M7Q2-2026\nVERSION B: F0KUS-M7Q2-2026", "vision-r4q6":"VORLAGE: ◇ ● ▲ ■", "vision-r9q4":"Drehen Sie den Pfeil zunächst um 90 Grad im Uhrzeigersinn. Spiegeln Sie das Ergebnis anschließend an einer senkrechten Achse.", "vision-r10q3":"Verfolgen Sie den Formen- und den Füllzyklus getrennt." },
    study: ["Reihenfolge merken", "Vier Positionen merken", "Fünf Formen merken", "Farb-Zahl-Paare merken", "Kurzer Blick"],
    aria: ["Vier ähnliche Blautöne; die Kachel unten rechts weicht leicht ab", "Vier halb gefüllte Kreise; beim dritten liegt die Füllung auf der anderen Seite", "Vorlagencode M 7 K 2 P 9", "Dreieck, Kreis, Dreieck, Kreis, Fragezeichen", "Pfeil nach oben, rechts, unten, Fragezeichen", "Vier ausgefüllte und zwei leere Kreise", "Drei-mal-drei-Raster mit Violett in der Mitte und Blau rundherum", "Vier nummerierte Schritte: Nordost, Südost, Südwest, Fragezeichen", "Nordostpfeil an einer senkrechten Spiegelachse", "Ausgefülltes Quadrat, zwei leere Quadrate, ausgefülltes Quadrat, zwei leere Quadrate, Fragezeichen", "Blauer Kreis, goldenes Dreieck, korallfarbenes Quadrat, grüne Raute, violetter Stern", "Codes A7Q, B4M, C2R und B4M", "Dreieck, Quadrat, Fünfeck, Fragezeichen", "X, O, X, O, X, Fragezeichen", "Zwei identische mittlere Quadrate auf unterschiedlich kontrastierenden Flächen", "Vier Kreise; im dritten befindet sich ein Punkt", "Vier dunkle Gruppen mit einer gelben, violetten, blauen oder grünen Kachel in der Mitte", "Nordostpfeil, Vierteldrehung im Uhrzeigersinn, senkrechte Spiegelung", "Vier Farbbeschriftungen; die dritte passt nicht zur Kachel", "Original M8Q2 K7P4 R6N3 und Kopie M8Q2 K1P4 R6M3", "Neun feste Blautöne; einer hat einen Grünstich", "Südostpfeil mit zwei Vierteldrehungen im Uhrzeigersinn", "Fünf ausgefüllte Sterne zwischen sieben leeren oder geometrischen Formen", "Sechs Formen mit einem Kreis-Quadrat-Wechsel und einem dreistufigen Füllmuster"],
    imageAlt: ["Ein roter Startpunkt und vier gleichartige gepunktete Linien, die sich mehrfach kreuzen und zu A, B, C und D führen", "Vier Schritte: ein Quadrat nach rechts und nach unten falten, einmal lochen und wieder auffalten"]
  },
  it: {
    questions: {
      "vision-r1q1": ["Quale riquadro ha un colore diverso?", ["In alto a sinistra", "In basso a destra", "In alto a destra", "In basso a sinistra"]],
      "vision-r3q4": ["In quale posizione si trova il simbolo diverso?", ["Prima", "Seconda", "Terza", "Quarta"]],
      "vision-r1q2": ["Quale codice corrisponde esattamente al modello?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["Quale forma viene dopo?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["La freccia ruota ogni volta di 90 gradi verso destra. Qual è la successiva?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["Quale simbolo è apparso per primo?", ["Stella", "Chiave", "Ombrello", "Limone"]],
      "vision-r1q6": ["Quanti cerchi pieni sono mostrati?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["Dove si trova il riquadro viola?", ["Al centro", "In basso a destra", "In alto a sinistra", "In alto a destra"]],
      "vision-r4q3": ["Quale freccia va inserita al passaggio 4?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["Quale freccia è l’immagine speculare verticale di ↗?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["Quale coppia è perfettamente identica?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["Quale riga contiene esattamente sette punti?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["Quale simbolo resta invariato dopo una rotazione di 180 gradi?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["Quante lettere F sono mostrate?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["Quale riquadro viene dopo?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["Quale oggetto occupava la posizione in basso a sinistra?", ["Chiave", "Foglia", "Luna", "Stella"]],
      "vision-r9q5": ["Quale forma si trovava subito a destra del triangolo dorato?", ["Stella viola", "Quadrato corallo", "Cerchio blu", "Rombo verde"]],
      "vision-r7q2": ["Quale codice compare due volte?", ["B4M", "A7Q", "C2R", "Nessuno"]],
      "vision-r4q1": ["Quale forma continua l’aumento del numero di lati?", ["Cerchio", "Esagono", "Triangolo", "Quadrato"]],
      "vision-r4q2": ["Quale elemento completa la sequenza alternata?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["Quale colore risalta di più sul blu navy scuro?", ["Campione A", "Campione B", "Campione D", "Campione C"]],
      "vision-r4q6": ["Quale riga riproduce esattamente il modello?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["Quale numero era abbinato al blu?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["Quale codice è rimasto invariato?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["I quadrati centrali sono identici. Perché possono comunque sembrare diversi?", ["Uno deve essere in realtà più chiaro", "Il colore cambia con la distanza", "Colori identici appaiono sempre identici", "Il contrasto circostante ne cambia l’aspetto"]],
      "vision-r8q3": ["Parti dal punto rosso e segui il suo percorso tratteggiato. Quale lettera raggiungi?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["Quante volte compare BLU come parola isolata?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["In quale posizione si trova il cerchio con un punto al centro?", ["Prima", "Seconda", "Quarta", "Terza"]],
      "vision-r7q5": ["Quale riquadro centrale risalta di più nel gruppo scuro?", ["In basso a sinistra", "In alto a destra", "In alto a sinistra", "In basso a destra"]],
      "vision-r9q2": ["Quale posizione precisa è cambiata nella versione B?", ["La prima F", "La Q", "Il secondo carattere", "L’ultima cifra"]],
      "vision-r9q4": ["In quale direzione punta infine la freccia?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["Quale etichetta non corrisponde al colore del riquadro?", ["Prima", "Seconda", "Terza", "Quarta"]],
      "vision-r10q2": ["Quali due caratteri sono cambiati?", ["7 e N", "8 e 6", "Q e P", "K e R"]],
      "vision-r10q4": ["Un quadrato viene piegato due volte e poi forato una volta attraverso tutti gli strati, lontano dalle pieghe. Quanti fori si vedono quando viene riaperto?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["Quale riquadro tende leggermente al verde?", ["In alto a sinistra", "Al centro", "In basso a destra", "Al centro in basso"]],
      "vision-r8q2": ["Quale codice corrisponde esattamente al modello?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Ruota ↘ due volte di 90 gradi verso destra.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["Quale simbolo è apparso in quarta posizione?", ["Luna", "Ancora", "Sole", "Stella"]],
      "vision-r8q6": ["Quante stelle piene sono mostrate?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["Quale elemento segue le sei forme mostrate?", ["●", "■", "○", "□"]]
    },
    text: { "REFERENCE":"MODELLO", "BASE":"ORIGINALE", "COPY":"COPIA", "TOP LEFT — STAR":"IN ALTO A SINISTRA — STELLA", "TOP RIGHT — MOON":"IN ALTO A DESTRA — LUNA", "BOTTOM LEFT — KEY":"IN BASSO A SINISTRA — CHIAVE", "BOTTOM RIGHT — LEAF":"IN BASSO A DESTRA — FOGLIA", "RED — 4":"ROSSO — 4", "BLUE — 7":"BLU — 7", "GOLD — 2":"ORO — 2", "BLUE 🟦":"BLU 🟦", "GREEN 🟩":"VERDE 🟩", "RED 🟦":"ROSSO 🟦", "GOLD 🟨":"ORO 🟨", "BASE::M8Q2-K7P4-R6N3":"ORIGINALE::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3":"COPIA::M8Q2-K1P4-R6M3" },
    context: { "vision-r3q6":"Fabio fotografa cinque fogli, ma finisce fuori fuoco.", "vision-r7q1":"BLU CHIARO, CIELO BLU, BLU.", "vision-r9q2":"VERSIONE A: FOCUS-M7Q2-2026\nVERSIONE B: F0CUS-M7Q2-2026", "vision-r4q6":"MODELLO: ◇ ● ▲ ■", "vision-r9q4":"Ruota prima la freccia di 90° in senso orario. Poi rifletti il risultato rispetto a un asse verticale.", "vision-r10q3":"Segui separatamente il ciclo delle forme e quello del riempimento." },
    study: ["Ricorda l’ordine", "Ricorda le quattro posizioni", "Memorizza le cinque forme", "Ricorda gli abbinamenti colore-numero", "Occhiata rapida"],
    aria: ["Quattro tonalità di blu molto simili; il riquadro in basso a destra è leggermente diverso", "Quattro semicerchi pieni; nel terzo il riempimento è sul lato opposto", "Codice modello M 7 K 2 P 9", "Triangolo, cerchio, triangolo, cerchio, punto interrogativo", "Freccia in alto, a destra, in basso, punto interrogativo", "Quattro cerchi pieni e due vuoti", "Griglia tre per tre con il viola al centro e il blu nelle altre caselle", "Quattro passaggi numerati: nord-est, sud-est, sud-ovest, punto interrogativo", "Freccia verso nord-est riflessa su un asse verticale", "Quadrato pieno, due quadrati vuoti, quadrato pieno, due quadrati vuoti, punto interrogativo", "Cerchio blu, triangolo dorato, quadrato corallo, rombo verde, stella viola", "Codici A7Q, B4M, C2R e B4M", "Triangolo, quadrato, pentagono, punto interrogativo", "X, O, X, O, X, punto interrogativo", "Due quadrati centrali identici su sfondi con contrasto diverso", "Quattro cerchi; il terzo contiene un punto", "Quattro gruppi scuri con un riquadro centrale giallo, viola, blu o verde", "Freccia verso nord-est, quarto di giro in senso orario, specchio verticale", "Quattro etichette di colore; la terza non corrisponde al riquadro", "Originale M8Q2 K7P4 R6N3 e copia M8Q2 K1P4 R6M3", "Nove tonalità di blu fisse, di cui una tende al verde", "Freccia verso sud-est seguita da due quarti di giro in senso orario", "Cinque stelle piene tra sette forme vuote o geometriche", "Sei forme che combinano un’alternanza cerchio-quadrato e un ciclo di riempimento in tre passaggi"],
    imageAlt: ["Un punto di partenza rosso e quattro percorsi tratteggiati simili che si incrociano prima di raggiungere A, B, C e D", "Quattro passaggi illustrati: un quadrato piegato verso destra, poi verso il basso, forato una volta e infine riaperto"]
  },
  nl: {
    questions: {
      "vision-r1q1": ["Welk vak heeft een andere kleur?", ["Linksboven", "Rechtsonder", "Rechtsboven", "Linksonder"]],
      "vision-r3q4": ["Op welke positie staat het afwijkende symbool?", ["Eerste", "Tweede", "Derde", "Vierde"]],
      "vision-r1q2": ["Welke code komt exact overeen met het voorbeeld?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["Welke vorm komt hierna?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["De pijl draait elke stap een kwartslag naar rechts. Wat komt hierna?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["Welk symbool verscheen als eerste?", ["Ster", "Sleutel", "Paraplu", "Citroen"]],
      "vision-r1q6": ["Hoeveel gevulde cirkels zie je?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["Waar staat het paarse vak?", ["In het midden", "Rechtsonder", "Linksboven", "Rechtsboven"]],
      "vision-r4q3": ["Welke pijl hoort bij stap 4?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["Welke pijl is het spiegelbeeld van ↗ in een verticale spiegel?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["Welk paar is volledig identiek?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["Welke rij bevat precies zeven punten?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["Welk symbool blijft hetzelfde na een halve draai?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["Hoeveel letters F zie je?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["Welk vak komt hierna?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["Welk voorwerp stond linksonder?", ["Sleutel", "Blad", "Maan", "Ster"]],
      "vision-r9q5": ["Welke vorm stond direct rechts van de gouden driehoek?", ["Paarse ster", "Koraalkleurig vierkant", "Blauwe cirkel", "Groene ruit"]],
      "vision-r7q2": ["Welke code komt twee keer voor?", ["B4M", "A7Q", "C2R", "Geen"]],
      "vision-r4q1": ["Welke vorm zet het oplopende aantal zijden voort?", ["Cirkel", "Zeshoek", "Driehoek", "Vierkant"]],
      "vision-r4q2": ["Welk element maakt het afwisselende patroon af?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["Welke kleur valt het meest op tegen donker marineblauw?", ["Kleurvlak A", "Kleurvlak B", "Kleurvlak D", "Kleurvlak C"]],
      "vision-r4q6": ["Welke rij komt exact overeen met het voorbeeld?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["Welk getal hoorde bij blauw?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["Welke code is niet veranderd?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["De middelste vierkanten zijn identiek. Waarom kunnen ze toch verschillend lijken?", ["Eén ervan moet stiekem lichter zijn", "De kleur verandert met de kijkafstand", "Identieke kleuren zien er altijd hetzelfde uit", "Het contrast eromheen verandert hun uiterlijk"]],
      "vision-r8q3": ["Begin bij de rode stip en volg de bijbehorende stippellijn. Welke letter bereik je?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["Hoe vaak staat BLAUW als los woord?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["Op welke positie staat de cirkel met een stip erin?", ["Eerste", "Tweede", "Vierde", "Derde"]],
      "vision-r7q5": ["Welk middelste vak valt het meest op in de donkere groep?", ["Linksonder", "Rechtsboven", "Linksboven", "Rechtsonder"]],
      "vision-r9q2": ["Welke precieze positie veranderde in versie B?", ["De eerste F", "De Q", "Het tweede teken", "Het laatste cijfer"]],
      "vision-r9q4": ["Waarheen wijst de pijl uiteindelijk?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["Welk label past niet bij de kleur van het vak?", ["Eerste", "Tweede", "Derde", "Vierde"]],
      "vision-r10q2": ["Welke twee tekens zijn veranderd?", ["7 en N", "8 en 6", "Q en P", "K en R"]],
      "vision-r10q4": ["Een vierkant wordt twee keer gevouwen en daarna één keer door alle lagen geperforeerd, weg van de vouwen. Hoeveel gaten zie je na het openvouwen?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["Welk vak heeft een lichte groene tint?", ["Linksboven", "In het midden", "Rechtsonder", "Middenonder"]],
      "vision-r8q2": ["Welke code komt exact overeen met het voorbeeld?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Draai ↘ twee keer een kwartslag naar rechts.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["Welk symbool verscheen als vierde?", ["Maan", "Anker", "Zon", "Ster"]],
      "vision-r8q6": ["Hoeveel gevulde sterren zie je?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["Welk element volgt op de zes getoonde vormen?", ["●", "■", "○", "□"]]
    },
    text: { "REFERENCE":"VOORBEELD", "BASE":"ORIGINEEL", "COPY":"KOPIE", "TOP LEFT — STAR":"LINKSBOVEN — STER", "TOP RIGHT — MOON":"RECHTSBOVEN — MAAN", "BOTTOM LEFT — KEY":"LINKSONDER — SLEUTEL", "BOTTOM RIGHT — LEAF":"RECHTSONDER — BLAD", "RED — 4":"ROOD — 4", "BLUE — 7":"BLAUW — 7", "GOLD — 2":"GOUD — 2", "BLUE 🟦":"BLAUW 🟦", "GREEN 🟩":"GROEN 🟩", "RED 🟦":"ROOD 🟦", "GOLD 🟨":"GOUD 🟨", "BASE::M8Q2-K7P4-R6N3":"BASIS::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3":"KOPIE::M8Q2-K1P4-R6M3" },
    context: { "vision-r3q6":"Fenna fotografeert vijf frisse bloemen voor het familiefotoalbum.", "vision-r7q1":"BLAUW LICHT, LUCHT BLAUW, BLAUW.", "vision-r9q2":"VERSIE A: FOCUS-M7Q2-2026\nVERSIE B: F0CUS-M7Q2-2026", "vision-r4q6":"VOORBEELD: ◇ ● ▲ ■", "vision-r9q4":"Draai de pijl eerst 90° met de klok mee. Spiegel het resultaat daarna in een verticale as.", "vision-r10q3":"Volg de vormcyclus en de vulcyclus afzonderlijk." },
    study: ["Onthoud de volgorde", "Onthoud de vier posities", "Onthoud de vijf vormen", "Onthoud de kleur-getalparen", "Snelle blik"],
    aria: ["Vier bijna gelijke blauwe kleurvlakken; rechtsonder wijkt subtiel af", "Vier halfgevulde cirkels; de derde is aan de andere kant gevuld", "Voorbeeldcode M 7 K 2 P 9", "Driehoek, cirkel, driehoek, cirkel, vraagteken", "Pijl omhoog, naar rechts, omlaag, vraagteken", "Vier gevulde en twee lege cirkels", "Een raster van drie bij drie met paars in het midden en blauw eromheen", "Vier genummerde stappen: noordoost, zuidoost, zuidwest, vraagteken", "Noordoostelijke pijl gespiegeld in een verticale spiegel", "Gevuld vierkant, twee lege vierkanten, gevuld vierkant, twee lege vierkanten, vraagteken", "Blauwe cirkel, gouden driehoek, koraalkleurig vierkant, groene ruit, paarse ster", "Codes A7Q, B4M, C2R en B4M", "Driehoek, vierkant, vijfhoek, vraagteken", "X, O, X, O, X, vraagteken", "Twee identieke middelste vierkanten tegen contrasterende achtergronden", "Vier cirkels; de derde bevat een stip", "Vier donkere groepen met een geel, paars, blauw of groen middenvlak", "Noordoostelijke pijl, kwartslag met de klok mee, verticale spiegeling", "Vier kleurlabels; het derde past niet bij zijn vak", "Origineel M8Q2 K7P4 R6N3 en kopie M8Q2 K1P4 R6M3", "Negen vaste blauwe tinten; één tint neigt naar groen", "Zuidoostelijke pijl gevolgd door twee kwartslagen met de klok mee", "Vijf gevulde sterren tussen zeven lege of geometrische vormen", "Zes vormen met een afwisselend cirkel-vierkantpatroon en een driedelige vulcyclus"],
    imageAlt: ["Een rode startstip met vier gelijksoortige stippellijnen die elkaar kruisen en eindigen bij A, B, C en D", "Vier geïllustreerde stappen: een vierkant naar rechts en omlaag vouwen, eenmaal perforeren en weer openvouwen"]
  },
  es: {
    questions: {
      "vision-r1q1": ["¿Qué casilla tiene un color diferente?", ["Arriba a la izquierda", "Abajo a la derecha", "Arriba a la derecha", "Abajo a la izquierda"]],
      "vision-r3q4": ["¿En qué posición está el símbolo diferente?", ["Primera", "Segunda", "Tercera", "Cuarta"]],
      "vision-r1q2": ["¿Qué código coincide exactamente con el modelo?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["¿Qué forma viene después?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["La flecha gira 90 grados a la derecha en cada paso. ¿Cuál viene después?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["¿Qué símbolo apareció primero?", ["Estrella", "Llave", "Paraguas", "Limón"]],
      "vision-r1q6": ["¿Cuántos círculos rellenos aparecen?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["¿Dónde está la casilla violeta?", ["En el centro", "Abajo a la derecha", "Arriba a la izquierda", "Arriba a la derecha"]],
      "vision-r4q3": ["¿Qué flecha corresponde al paso 4?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["¿Qué flecha es el reflejo vertical de ↗?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["¿Qué pareja es completamente idéntica?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["¿Qué fila contiene exactamente siete puntos?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["¿Qué símbolo se ve igual después de girarlo 180 grados?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["¿Cuántas letras F aparecen?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["¿Qué casilla viene después?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["¿Qué objeto estaba abajo a la izquierda?", ["Llave", "Hoja", "Luna", "Estrella"]],
      "vision-r9q5": ["¿Qué forma estaba justo a la derecha del triángulo dorado?", ["Estrella violeta", "Cuadrado coral", "Círculo azul", "Rombo verde"]],
      "vision-r7q2": ["¿Qué código aparece dos veces?", ["B4M", "A7Q", "C2R", "Ninguno"]],
      "vision-r4q1": ["¿Qué forma continúa el aumento del número de lados?", ["Círculo", "Hexágono", "Triángulo", "Cuadrado"]],
      "vision-r4q2": ["¿Qué elemento completa la secuencia alterna?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["¿Qué color destaca más sobre un azul marino oscuro?", ["Muestra A", "Muestra B", "Muestra D", "Muestra C"]],
      "vision-r4q6": ["¿Qué fila reproduce exactamente el modelo?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["¿Qué número estaba asociado con el azul?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["¿Qué código no ha cambiado?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["Los cuadrados centrales son idénticos. ¿Por qué pueden parecer diferentes?", ["Uno debe de ser más claro", "El color cambia con la distancia", "Los colores idénticos siempre se ven iguales", "El contraste del entorno cambia su apariencia"]],
      "vision-r8q3": ["Empieza en el punto rojo y sigue su línea discontinua. ¿A qué letra llegas?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["¿Cuántas veces aparece AZUL como palabra independiente?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["¿En qué posición está el círculo con un punto dentro?", ["Primera", "Segunda", "Cuarta", "Tercera"]],
      "vision-r7q5": ["¿Qué casilla central destaca más en el grupo oscuro?", ["Abajo a la izquierda", "Arriba a la derecha", "Arriba a la izquierda", "Abajo a la derecha"]],
      "vision-r9q2": ["¿Qué posición exacta cambió en la versión B?", ["La primera F", "La Q", "El segundo carácter", "El último dígito"]],
      "vision-r9q4": ["¿Hacia dónde apunta finalmente la flecha?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["¿Qué etiqueta no coincide con el color de su casilla?", ["Primera", "Segunda", "Tercera", "Cuarta"]],
      "vision-r10q2": ["¿Qué dos caracteres cambiaron?", ["7 y N", "8 y 6", "Q y P", "K y R"]],
      "vision-r10q4": ["Un cuadrado se dobla dos veces y luego se perfora una vez a través de todas las capas, lejos de los pliegues. ¿Cuántos agujeros se ven al desdoblarlo?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["¿Qué casilla tiene un ligero tono verdoso?", ["Arriba a la izquierda", "En el centro", "Abajo a la derecha", "Abajo en el centro"]],
      "vision-r8q2": ["¿Qué código coincide exactamente con el modelo?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Gira ↘ dos veces 90 grados a la derecha.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["¿Qué símbolo apareció en cuarto lugar?", ["Luna", "Ancla", "Sol", "Estrella"]],
      "vision-r8q6": ["¿Cuántas estrellas rellenas aparecen?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["¿Qué elemento sigue a las seis formas mostradas?", ["●", "■", "○", "□"]]
    },
    text: { "REFERENCE":"MODELO", "BASE":"ORIGINAL", "COPY":"COPIA", "TOP LEFT — STAR":"ARRIBA A LA IZQUIERDA — ESTRELLA", "TOP RIGHT — MOON":"ARRIBA A LA DERECHA — LUNA", "BOTTOM LEFT — KEY":"ABAJO A LA IZQUIERDA — LLAVE", "BOTTOM RIGHT — LEAF":"ABAJO A LA DERECHA — HOJA", "RED — 4":"ROJO — 4", "BLUE — 7":"AZUL — 7", "GOLD — 2":"DORADO — 2", "BLUE 🟦":"AZUL 🟦", "GREEN 🟩":"VERDE 🟩", "RED 🟦":"ROJO 🟦", "GOLD 🟨":"DORADO 🟨", "BASE::M8Q2-K7P4-R6N3":"MODELO::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3":"COPIA::M8Q2-K1P4-R6M3" },
    context: { "vision-r3q6":"Felipe fotografía cinco flores frágiles fuera de foco.", "vision-r7q1":"AZUL CLARO, CIELO AZUL, AZUL.", "vision-r9q2":"VERSIÓN A: FOCO-M7Q2-2026\nVERSIÓN B: F0CO-M7Q2-2026", "vision-r4q6":"MODELO: ◇ ● ▲ ■", "vision-r9q4":"Primero gira la flecha 90° en sentido horario. Después refleja el resultado en un eje vertical.", "vision-r10q3":"Sigue por separado el ciclo de formas y el ciclo de relleno." },
    study: ["Recuerda el orden", "Recuerda las cuatro posiciones", "Memoriza las cinco formas", "Recuerda las parejas de color y número", "Vistazo rápido"],
    aria: ["Cuatro tonos de azul muy parecidos; la casilla inferior derecha es ligeramente distinta", "Cuatro semicírculos rellenos; el tercero está relleno por el lado opuesto", "Código modelo M 7 K 2 P 9", "Triángulo, círculo, triángulo, círculo, signo de interrogación", "Flecha hacia arriba, derecha, abajo, signo de interrogación", "Cuatro círculos rellenos y dos vacíos", "Cuadrícula de tres por tres con violeta en el centro y azul en las demás casillas", "Cuatro pasos numerados: nordeste, sudeste, suroeste, signo de interrogación", "Flecha al nordeste reflejada en un espejo vertical", "Cuadrado relleno, dos cuadrados vacíos, cuadrado relleno, dos cuadrados vacíos, signo de interrogación", "Círculo azul, triángulo dorado, cuadrado coral, rombo verde y estrella violeta", "Códigos A7Q, B4M, C2R y B4M", "Triángulo, cuadrado, pentágono, signo de interrogación", "X, O, X, O, X, signo de interrogación", "Dos cuadrados centrales idénticos sobre fondos con distinto contraste", "Cuatro círculos; el tercero contiene un punto", "Cuatro grupos oscuros con una casilla central amarilla, violeta, azul o verde", "Flecha al nordeste, cuarto de giro en sentido horario y reflejo vertical", "Cuatro etiquetas de color; la tercera no coincide con la casilla", "Original M8Q2 K7P4 R6N3 y copia M8Q2 K1P4 R6M3", "Nueve tonos de azul fijos; uno tiende ligeramente al verde", "Flecha al sudeste seguida de dos cuartos de giro en sentido horario", "Cinco estrellas rellenas entre siete formas vacías o geométricas", "Seis formas que combinan una alternancia círculo-cuadrado y un ciclo de relleno de tres pasos"],
    imageAlt: ["Un punto de inicio rojo y cuatro líneas discontinuas similares que se cruzan antes de llegar a A, B, C y D", "Cuatro pasos ilustrados: un cuadrado doblado a la derecha, luego hacia abajo, perforado una vez y finalmente desdoblado"]
  },
  pt: {
    questions: {
      "vision-r1q1": ["Qual quadrado tem uma cor diferente?", ["Em cima à esquerda", "Em baixo à direita", "Em cima à direita", "Em baixo à esquerda"]],
      "vision-r3q4": ["Em que posição está o símbolo diferente?", ["Primeira", "Segunda", "Terceira", "Quarta"]],
      "vision-r1q2": ["Qual código corresponde exatamente ao modelo?", ["M7K2P9", "M7K2R9", "M7KZP9", "N7K2P9"]],
      "vision-r1q3": ["Que forma vem a seguir?", ["■", "●", "◆", "▲"]],
      "vision-r1q4": ["A seta gira 90 graus para a direita em cada passo. Qual vem a seguir?", ["↑", "→", "↓", "←"]],
      "vision-r1q5": ["Que símbolo apareceu primeiro?", ["Estrela", "Chave", "Guarda-chuva", "Limão"]],
      "vision-r1q6": ["Quantos círculos preenchidos aparecem?", ["3", "6", "5", "4"]],
      "vision-r2q1": ["Onde está o quadrado violeta?", ["Ao centro", "Em baixo à direita", "Em cima à esquerda", "Em cima à direita"]],
      "vision-r4q3": ["Que seta pertence ao passo 4?", ["↖", "↘", "↗", "↓"]],
      "vision-r5q1": ["Que seta é o reflexo vertical de ↗?", ["↙", "↘", "↗", "↖"]],
      "vision-r3q1": ["Que par é totalmente idêntico?", ["R7Q3B6 / R7O3B6", "K4M8P2 / K4M8P2", "T9L2C5 / T9LZC5", "A6D4N8 / A6D4M8"]],
      "vision-r3q2": ["Que linha contém exatamente sete pontos?", ["••••••", "•••••", "••••••••", "•••••••"]],
      "vision-r3q5": ["Que símbolo permanece igual depois de meia volta?", ["L", "↑", "●", "↗"]],
      "vision-r3q6": ["Quantas letras F aparecem?", ["6", "7", "8", "9"]],
      "vision-r5q5": ["Que quadrado vem a seguir?", ["●", "□", "■", "◇"]],
      "vision-r5q6": ["Que objeto estava em baixo à esquerda?", ["Chave", "Folha", "Lua", "Estrela"]],
      "vision-r9q5": ["Que forma estava imediatamente à direita do triângulo dourado?", ["Estrela violeta", "Quadrado coral", "Círculo azul", "Losango verde"]],
      "vision-r7q2": ["Que código aparece duas vezes?", ["B4M", "A7Q", "C2R", "Nenhum"]],
      "vision-r4q1": ["Que forma continua o aumento do número de lados?", ["Círculo", "Hexágono", "Triângulo", "Quadrado"]],
      "vision-r4q2": ["Que elemento completa a sequência alternada?", ["O", "XX", "OO", "X"]],
      "vision-r4q5": ["Que cor se destaca mais sobre azul-marinho escuro?", ["Amostra A", "Amostra B", "Amostra D", "Amostra C"]],
      "vision-r4q6": ["Que linha reproduz exatamente o modelo?", ["◇ ● ■ ▲", "◇ ● ▲ ■", "◇ ○ ▲ ■", "● ◇ ▲ ■"]],
      "vision-r6q1": ["Que número estava associado ao azul?", ["2", "7", "4", "9"]],
      "vision-r6q6": ["Que código não mudou?", ["R3N8K2", "R3M8K2", "P3M8K2", "R3M8KZ"]],
      "vision-r9q1": ["Os quadrados centrais são idênticos. Por que podem parecer diferentes?", ["Um deles tem de ser mais claro", "A cor muda com a distância", "Cores idênticas parecem sempre iguais", "O contraste em redor altera a sua aparência"]],
      "vision-r8q3": ["Comece no ponto vermelho e siga a respetiva linha pontilhada. A que letra chega?", ["A", "B", "C", "D"]],
      "vision-r7q1": ["Quantas vezes AZUL aparece como palavra isolada?", ["5", "4", "3", "6"]],
      "vision-r7q3": ["Em que posição está o círculo com um ponto dentro?", ["Primeira", "Segunda", "Quarta", "Terceira"]],
      "vision-r7q5": ["Que quadrado central se destaca mais no grupo escuro?", ["Em baixo à esquerda", "Em cima à direita", "Em cima à esquerda", "Em baixo à direita"]],
      "vision-r9q2": ["Que posição exata mudou na versão B?", ["O primeiro F", "O Q", "O segundo caráter", "O último algarismo"]],
      "vision-r9q4": ["Para onde aponta a seta no final?", ["↗", "↘", "↙", "↖"]],
      "vision-r9q6": ["Que etiqueta não corresponde à cor do quadrado?", ["Primeira", "Segunda", "Terceira", "Quarta"]],
      "vision-r10q2": ["Que dois carateres mudaram?", ["7 e N", "8 e 6", "Q e P", "K e R"]],
      "vision-r10q4": ["Um quadrado é dobrado duas vezes e depois perfurado uma vez através de todas as camadas, longe das dobras. Quantos furos aparecem ao desdobrá-lo?", ["1", "2", "4", "8"]],
      "vision-r8q1": ["Que quadrado tem um ligeiro tom esverdeado?", ["Em cima à esquerda", "Ao centro", "Em baixo à direita", "Ao centro em baixo"]],
      "vision-r8q2": ["Qual código corresponde exatamente ao modelo?", ["V6K9-M2Q3", "V6K9-M2Q8", "V6K9-M2O8", "V6K9-N2Q8"]],
      "vision-r8q4": ["Gire ↘ duas vezes 90 graus para a direita.", ["↙", "↘", "↗", "↖"]],
      "vision-r8q5": ["Que símbolo apareceu em quarto lugar?", ["Lua", "Âncora", "Sol", "Estrela"]],
      "vision-r8q6": ["Quantas estrelas preenchidas aparecem?", ["5", "3", "4", "2"]],
      "vision-r10q3": ["Que elemento vem depois das seis formas apresentadas?", ["●", "■", "○", "□"]]
    },
    text: { "REFERENCE":"MODELO", "BASE":"ORIGINAL", "COPY":"CÓPIA", "TOP LEFT — STAR":"EM CIMA À ESQUERDA — ESTRELA", "TOP RIGHT — MOON":"EM CIMA À DIREITA — LUA", "BOTTOM LEFT — KEY":"EM BAIXO À ESQUERDA — CHAVE", "BOTTOM RIGHT — LEAF":"EM BAIXO À DIREITA — FOLHA", "RED — 4":"VERMELHO — 4", "BLUE — 7":"AZUL — 7", "GOLD — 2":"DOURADO — 2", "BLUE 🟦":"AZUL 🟦", "GREEN 🟩":"VERDE 🟩", "RED 🟦":"VERMELHO 🟦", "GOLD 🟨":"DOURADO 🟨", "BASE::M8Q2-K7P4-R6N3":"REFERÊNCIA::M8Q2-K7P4-R6N3", "COPY::M8Q2-K1P4-R6M3":"CÓPIA::M8Q2-K1P4-R6M3" },
    context: { "vision-r3q6":"Fábio fotografa cinco flores finas fora de foco.", "vision-r7q1":"AZUL CLARO, CÉU AZUL, AZUL.", "vision-r9q2":"VERSÃO A: FOCO-M7Q2-2026\nVERSÃO B: F0CO-M7Q2-2026", "vision-r4q6":"MODELO: ◇ ● ▲ ■", "vision-r9q4":"Primeiro, gire a seta 90° no sentido horário. Depois, reflita o resultado em relação a um eixo vertical.", "vision-r10q3":"Acompanhe separadamente o ciclo das formas e o ciclo do preenchimento." },
    study: ["Memorize a ordem", "Memorize as quatro posições", "Memorize as cinco formas", "Memorize os pares de cor e número", "Olhar rápido"],
    aria: ["Quatro tons de azul muito próximos; o quadrado inferior direito é ligeiramente diferente", "Quatro semicírculos preenchidos; no terceiro, o preenchimento está no lado oposto", "Código-modelo M 7 K 2 P 9", "Triângulo, círculo, triângulo, círculo, ponto de interrogação", "Seta para cima, direita, baixo, ponto de interrogação", "Quatro círculos preenchidos e dois vazios", "Grelha de três por três com violeta ao centro e azul nos restantes quadrados", "Quatro passos numerados: nordeste, sudeste, sudoeste, ponto de interrogação", "Seta para nordeste refletida num espelho vertical", "Quadrado preenchido, dois quadrados vazios, quadrado preenchido, dois quadrados vazios, ponto de interrogação", "Círculo azul, triângulo dourado, quadrado coral, losango verde, estrela violeta", "Códigos A7Q, B4M, C2R e B4M", "Triângulo, quadrado, pentágono, ponto de interrogação", "X, O, X, O, X, ponto de interrogação", "Dois quadrados centrais idênticos sobre fundos com contrastes diferentes", "Quatro círculos; o terceiro contém um ponto", "Quatro grupos escuros com um quadrado central amarelo, violeta, azul ou verde", "Seta para nordeste, quarto de volta no sentido horário, reflexo vertical", "Quatro etiquetas de cor; a terceira não corresponde ao quadrado", "Original M8Q2 K7P4 R6N3 e cópia M8Q2 K1P4 R6M3", "Nove tons de azul fixos; um deles tem um ligeiro tom verde", "Seta para sudeste seguida de dois quartos de volta no sentido horário", "Cinco estrelas preenchidas entre sete formas vazias ou geométricas", "Seis formas que combinam uma alternância círculo-quadrado e um ciclo de preenchimento de três passos"],
    imageAlt: ["Um ponto inicial vermelho e quatro linhas pontilhadas semelhantes que se cruzam antes de chegar a A, B, C e D", "Quatro passos ilustrados: um quadrado dobrado para a direita, depois para baixo, perfurado uma vez e finalmente desdobrado"]
  }
};

const studyIds = ["vision-r1q5", "vision-r5q6", "vision-r9q5", "vision-r6q1", "vision-r8q5"];
const ariaIds = ["vision-r1q1", "vision-r3q4", "vision-r1q2", "vision-r1q3", "vision-r1q4", "vision-r1q6", "vision-r2q1", "vision-r4q3", "vision-r5q1", "vision-r5q5", "vision-r9q5", "vision-r7q2", "vision-r4q1", "vision-r4q2", "vision-r9q1", "vision-r7q3", "vision-r7q5", "vision-r9q4", "vision-r9q6", "vision-r10q2", "vision-r8q1", "vision-r8q4", "vision-r8q6", "vision-r10q3"];
const imageIds = ["vision-r8q3", "vision-r10q4"];

function replaceVisible(value, replacements) {
  if (typeof value === "string") return replacements[value] ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceVisible(item, replacements));
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) value[key] = replaceVisible(value[key], replacements);
  }
  return value;
}

for (const locale of locales) {
  const bank = banks[locale];
  const file = path.join(quizDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const questions = data.stages.flatMap((stage) => stage.questions);
  const byId = new Map(questions.map((question) => [question.id, question]));

  if (Object.keys(bank.questions).length !== 40 || questions.length !== 40) {
    throw new Error(`${locale}: expected 40 curated and 40 runtime questions`);
  }

  // Start every generated locale from the canonical English presentation data.
  // This prevents stale or partially translated visual/study labels from surviving
  // a rebuild when a bank mapping is later corrected.
  for (const target of questions) {
    const source = englishById.get(target.id);
    if (!source) throw new Error(`${locale}: missing English source ${target.id}`);
    for (const field of ["context", "visual", "study", "image"]) {
      if (field in source) target[field] = structuredClone(source[field]);
      else delete target[field];
    }
  }

  for (const [id, [question, answers]] of Object.entries(bank.questions)) {
    const target = byId.get(id);
    if (!target) throw new Error(`${locale}: missing ${id}`);
    target.question = question;
    target.answers = answers;
  }

  for (const [id, context] of Object.entries(bank.context)) byId.get(id).context = context;
  replaceVisible(data, bank.text);

  studyIds.forEach((id, index) => {
    const target = byId.get(id);
    if (!target.study) throw new Error(`${locale}: missing study for ${id}`);
    target.study.title = bank.study[index];
  });
  ariaIds.forEach((id, index) => {
    const target = byId.get(id);
    const holder = target.visual ?? target.study;
    if (!holder) throw new Error(`${locale}: missing visual/study for ${id}`);
    holder.ariaLabel = bank.aria[index];
  });
  imageIds.forEach((id, index) => { byId.get(id).image.alt = bank.imageAlt[index]; });

  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`Rebuilt native Vision bank: ${locale}`);
}
