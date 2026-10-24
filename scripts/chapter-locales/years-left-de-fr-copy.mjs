// Quiz-specific prose. Shared buttons, loading states and ad consent remain in
// data/i18n; these entries preserve the same placeholders as the English copy.
export const yearsInterface = {
  de: {
    title: 'Wie lange hast du noch zu leben?',
    eyebrow: 'Deine Lebensuhr',
    summary: 'Langfristig planen oder lieber Geschichten erleben? Entdecke deinen Lebensuhr-Typ und eine spielerische Altersschätzung.',
    landing: {intro: 'Deine täglichen Entscheidungen geben Hinweise.\nWelches Alter verbirgt sich dahinter?', cta: 'Selbsttest starten'},
    about: {
      body: 'Entdecke, was deine Alltagsgewohnheiten über deine Lebensuhr erzählen. Zehn Themenbereiche erkunden deine Routinen, Energie, Bewegung, Erholung, Belastung, Beziehungen, Gewohnheiten, Neugier, Pläne und spontanen Entscheidungen. Am Ende warten eine spielerische Altersschätzung und dein persönlicher Lebensstil-Typ.\n\nDas Alter ist ein Unterhaltungswert aus deinen Antworten, keine Vorhersage. Dein tatsächliches Alter, medizinische Unterlagen, familiäre Vorerkrankungen oder eine persönliche Risikobewertung fließen nicht ein.',
      howToPlay: {steps: [
        'Wähle die Antwort, die am ehesten zu dir passt. Es gibt keine richtigen Antworten.',
        'Durchlaufe zehn kurze Themenbereiche, die jeweils eine andere Seite deines Alltags beleuchten.',
        'Entdecke nach jedem Thema deine bisherige Tendenz und am Ende deinen Lebensuhr-Typ mit einer spielerischen Altersschätzung.',
      ]},
      disclaimer: 'Nur zur Unterhaltung und Selbstreflexion. Dieses Quiz sagt weder deine Lebensdauer noch deine Gesundheit, dein Sterberisiko oder medizinische Entwicklungen voraus. Bei gesundheitlichen Sorgen wende dich an qualifiziertes medizinisches Fachpersonal.',
    },
    career: {
      resultProgressLabel: 'Deine Lebensuhr-Auswertung',
      stages: {
        'stage-1': {
          difficulty: 'DEIN START IN DEN TAG', preAdTitle: 'Der erste Hinweis ist da',
          preAdCopy: 'Dein bisheriges Profil in dieser Runde: {profile}. Passen deine Essgewohnheiten dazu?',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Was gibt dir im Alltag wirklich Energie?'}, preAdButton: 'Weiter',
        },
        'stage-2': {
          difficulty: 'WAS DIR ENERGIE GIBT', preAdTitle: 'Dein Geschmack hat Persönlichkeit',
          preAdCopy: 'Dein Profil beim Thema Essen: {profile}. Als Nächstes geht es um Gemütlichkeit und ein bisschen Bewegung.',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Dein Alltagstempo hat seine eigene Handschrift.'}, preAdButton: 'Weiter',
        },
        'stage-3': {
          difficulty: 'DEIN TEMPO IM ALLTAG', preAdTitle: 'Dein Tempo zeichnet sich ab',
          preAdCopy: 'Dein Profil beim Thema Bewegung: {profile}. Doch was passiert, wenn du abschalten möchtest?',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Jetzt zeigt sich, wie du den Tag ausklingen lässt.'}, preAdButton: 'Weiter',
        },
        'stage-4': {
          difficulty: 'WIE DU ABSCHALTEST', preAdTitle: 'So tickst du nach Feierabend',
          preAdCopy: 'Dein Profil in dieser Runde: {profile}. Wie reagierst du, wenn der Alltag den Druck erhöht?',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Voller Tag. Noch eine Bitte. Was tust du?'}, preAdButton: 'Weiter',
        },
        'stage-5': {
          difficulty: 'DU UNTER DRUCK', preAdTitle: 'Dein Umgang mit Druck wird sichtbar',
          preAdCopy: 'Dein Profil unter Druck: {profile}. Als Nächstes geht es um die Menschen, die eine andere Seite von dir hervorbringen.',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Deine Chatgruppe könnte diese Antworten wiedererkennen.'}, preAdButton: 'Weiter',
        },
        'stage-6': {
          difficulty: 'DEINE MENSCHEN', preAdTitle: 'Deine soziale Seite zeigt sich',
          preAdCopy: 'Dein Profil im Miteinander: {profile}. Jetzt kommen die kleinen Gewohnheiten, die dir selbst kaum auffallen.',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Was passiert, wenn dein Autopilot übernimmt?'}, preAdButton: 'Weiter',
        },
        'stage-7': {
          difficulty: 'DEIN AUTOPILOT', preAdTitle: 'Dein Autopilot zeigt sich',
          preAdCopy: 'Dein Profil bei den Gewohnheiten: {profile}. Jetzt wird es leichter: Was macht einen gewöhnlichen Tag unvergesslich?',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Gemütlichkeit, Neugier oder eine ganz neue Geschichte?'}, preAdButton: 'Weiter',
        },
        'stage-8': {
          difficulty: 'WAS DICH BEGEISTERT', preAdTitle: 'Deine Begeisterung hat ein Profil',
          preAdCopy: 'Dein Profil in dieser Runde: {profile}. Was verraten deine Entscheidungen über das Leben, das du dir aufbauen möchtest?',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Wofür würde dein zukünftiges Ich dir danken?'}, preAdButton: 'Weiter',
        },
        'stage-9': {
          difficulty: 'DEIN ZUKÜNFTIGES ICH', preAdTitle: 'Deine Zukunftswünsche nehmen Form an',
          preAdCopy: 'Dein Profil beim Blick nach vorn: {profile}. Folge jetzt deinem ersten Gefühl und bring das Gesamtbild zusammen.',
          next: {eyebrow: 'ALS NÄCHSTES', tagline: 'Was sagt dein Bauchgefühl über das große Ganze?'}, preAdButton: 'Weiter',
        },
        'stage-10': {
          difficulty: 'DEIN LEBENSUHR-ERGEBNIS', preAdTitle: 'Deine Lebensuhr-Auswertung ist bereit',
          preAdCopy: 'Alle Themen sind abgeschlossen. Entdecke deinen Lebensuhr-Typ und die spielerische Altersschätzung. Danach kannst du die Entscheidungen dahinter ansehen.',
          preAdChecks: ['Deine Alltagsentscheidungen verknüpft', 'Deinen Lebensuhr-Typ gefunden', 'Deine spielerische Altersschätzung bereit'], preAdButton: 'Mein Ergebnis',
        },
      },
    },
    results: {
      name: 'DEIN LEBENSUHR-TYP',
      profiles: {
        centenarian_energy: {tier: 'Auf lange Sicht', title: 'Der Langstrecken-Profi', copy: 'Du machst dir kleine Versprechen und hältst sie auch. Deine Antworten stehen für verlässliche Gewohnheiten, Raum zur Erholung und Entscheidungen, für die du dir morgen dankbar sein wirst. Deine Stärke: leise und beharrlich langfristig denken.'},
        steady_long_game: {tier: 'Beständig im Alltag', title: 'Beständig von Natur aus', copy: 'Du weißt, wie wertvoll ein Alltag ist, der sich nach dir anfühlt. Vertraute Rituale und verlässliche Menschen geben deinen Tagen Struktur. Deine Stärke: Andere können auf dich zählen, ohne dass du viel Aufhebens darum machst.'},
        balanced_realist: {tier: 'Platz für beides', title: 'Mit Sinn fürs Gleichgewicht', copy: 'Bei dir haben vernünftige Entscheidungen und Lebensfreude beide Platz. Du passt dich dem Tag an, statt einer perfekten Routine hinterherzulaufen. Deine Stärke: Du weißt, wann der Plan zählt und wann es Zeit für ein Stück Kuchen ist.'},
        weekend_chaos: {tier: 'Geschichten inklusive', title: 'Die Wochenend-Wundertüte', copy: 'Deine besten Geschichten beginnen selten mit einem strengen Plan. Deine Antworten passen zu spontanen Momenten, guter Gesellschaft und gelegentlichen Verhandlungen mit deinem morgigen Ich. Deine Stärke: Aus einem gewöhnlichen Abend wird etwas, von dem man noch erzählt.'},
        stress_sprinter: {tier: 'Immer noch eine Sache', title: 'Mit voller Kraft voraus', copy: 'Du bringst fast überall Schwung hinein. In deinen Antworten kommt oft die nächste Aufgabe vor der nächsten Pause. Deine Stärke: Du setzt Dinge in Bewegung. Etwas mehr Luft könnte dafür sorgen, dass du dein Tempo wieder bewusster wählst.'},
        comfort_creature: {tier: 'Gemütlichkeit ist eine Kunst', title: 'Zu Hause im Wohlfühlmodus', copy: 'Du weißt genau, was dir guttut: vertraute Orte, Lieblingsmenschen und eine echte Gelegenheit zum Abschalten. Deine Stärke: Du machst den Alltag einladend. Zu wissen, was zu dir passt, ist eine Kunst für sich.'},
        adventure_fuse: {tier: 'Hauptsache, es gibt etwas zu erzählen', title: 'Immer einer Geschichte auf der Spur', copy: 'Deine Neugier darf mitentscheiden. In deinen Antworten stecken neue Orte, ungewöhnliche Ideen und Tage, die eine unerwartete Wendung nehmen. Deine Stärke: Du kommst mit einer Geschichte zurück, mit der niemand gerechnet hat.'},
        reset_needed: {tier: 'Ein neuer Abschnitt wartet', title: 'Bereit für den Neuanfang', copy: 'Deine Antworten wünschen sich oft mehr Freiraum, weniger Anforderungen und die Chance, durchzuatmen. Dein Thema gerade: ein Neuanfang, der zum echten Leben passt. Dieser Lebensuhr-Typ ist eine Momentaufnahme deiner Antworten, kein festes Etikett.'},
      },
      dimensions: {
        'dimension-1': {label: '🌿 Beständig auf lange Sicht'}, 'dimension-2': {label: '⚖️ Gleichgewicht und Erholung'},
        'dimension-3': {label: '✨ Begeisterung und Abenteuer'}, 'dimension-4': {label: '⚡ Druck und Tempo'},
      },
      estimate: {
        eyebrow: 'DEIN SPIELERISCHES LEBENSUHR-ALTER', ageSuffix: 'JAHRE ALT', strongestSignal: 'Deine stärkste Alltagstendenz', wildcard: 'Dein Überraschungsfaktor', consistency: 'Stimmigkeit deiner Antworten',
        consistencyLabels: {high: 'Hoch', medium: 'Mittel', mixed: 'Gemischt'},
        reviewUnlock: {
          title: 'Welche Entscheidungen haben deine Lebensuhr geprägt?', copy: 'Schau hinter die Zahl: Welche Antworten haben die spielerische Schätzung erhöht, gesenkt oder unverändert gelassen?',
          button: 'Meine Antworten im Detail', adNote: 'Tippe, um die Entscheidungen hinter deiner Schätzung zu sehen.', reviewTitle: 'Was deine Schätzung geprägt hat', yourChoice: 'Deine Wahl',
          raised: 'Erhöht', lowered: 'Gesenkt', neutral: 'Neutral', raisedCopy: 'Diese Antwort hat die spielerische Schätzung erhöht.', loweredCopy: 'Diese Antwort hat die spielerische Schätzung gesenkt.', neutralCopy: 'Diese Antwort hat zusätzlichen Kontext geliefert, ohne die Schätzung wesentlich zu verändern.',
        },
        insights: {overview: 'Deine Schätzung auf einen Blick', estimate: 'Deine Schätzung', signal: 'Deine führende Alltagstendenz', consistency: 'Stimmigkeit deiner Antworten', breakdown: 'Deine Alltagstendenzen im Überblick', snapshot: 'Was dein Profil zeigt'},
        disclaimer: 'Nur zur Unterhaltung. Keine medizinische Prognose oder Vorhersage deiner Lebenserwartung.',
      },
    },
  },
  fr: {
    title: 'Combien de temps te reste-t-il à vivre ?',
    eyebrow: 'Ton horloge de vie',
    summary: 'Tu construis sur la durée ou tu vis pour les belles histoires ? Découvre le profil de ton horloge et un âge estimé juste pour le plaisir.',
    landing: {intro: 'Tes habitudes laissent des indices.\nQuel âge se cache derrière tes choix ?', cta: 'Commencer le test'},
    about: {
      body: 'Découvre ce que tes habitudes racontent sur ton horloge de vie. Dix étapes explorent ton quotidien, ton énergie, ton rythme, ton repos, la pression, tes relations, tes automatismes, ta curiosité, tes projets et tes instincts. À la fin, découvre un âge estimé pour le plaisir et ton profil de vie.\n\nCet âge est un résultat ludique calculé à partir de tes choix, pas une prévision. Le quiz ne prend en compte ni ton âge réel, ni ton dossier médical, ni tes antécédents familiaux, ni une évaluation personnelle des risques.',
      howToPlay: {steps: [
        'Choisis la réponse qui te ressemble le plus. Il n’y a pas de bonne réponse.',
        'Parcours dix étapes rapides, chacune explorant une autre facette de ton quotidien.',
        'Découvre la tendance qui se dégage après chaque étape, puis le profil de ton horloge et un âge estimé pour le plaisir.',
      ]},
      disclaimer: 'Pour le divertissement et la réflexion personnelle uniquement. Ce quiz ne prédit ni la durée de vie, ni l’état de santé, ni le risque de décès, ni une évolution médicale. Pour toute inquiétude concernant ta santé, consulte un professionnel de santé qualifié.',
    },
    career: {
      resultProgressLabel: 'Le bilan de ton horloge',
      stages: {
        'stage-1': {
          difficulty: 'TON DÉBUT DE JOURNÉE', preAdTitle: 'Le premier indice est là',
          preAdCopy: 'Pour cette étape, ton profil tend vers : {profile}. Tes choix à table raconteront-ils la même histoire ?',
          next: {eyebrow: 'À SUIVRE', tagline: 'Qu’est-ce qui te donne vraiment de l’énergie ?'}, preAdButton: 'Continuer',
        },
        'stage-2': {
          difficulty: 'CE QUI TE DONNE DE L’ÉNERGIE', preAdTitle: 'Tes goûts ont leur personnalité',
          preAdCopy: 'Ton profil côté repas : {profile}. Place maintenant au choix entre confort et petit élan.',
          next: {eyebrow: 'À SUIVRE', tagline: 'Ton rythme quotidien a sa propre signature.'}, preAdButton: 'Continuer',
        },
        'stage-3': {
          difficulty: 'TON RYTHME AU QUOTIDIEN', preAdTitle: 'Ton rythme se dessine',
          preAdCopy: 'Ton profil côté mouvement : {profile}. Mais que se passe-t-il quand il est temps de déconnecter ?',
          next: {eyebrow: 'À SUIVRE', tagline: 'Place à la personne que tu es en fin de soirée.'}, preAdButton: 'Continuer',
        },
        'stage-4': {
          difficulty: 'TA FAÇON DE DÉCONNECTER', preAdTitle: 'Voici ton profil après la journée',
          preAdCopy: 'Ton profil sur ce thème : {profile}. Découvre maintenant comment tu réagis quand la pression monte.',
          next: {eyebrow: 'À SUIVRE', tagline: 'Journée chargée. Un service de plus. Que fais-tu ?'}, preAdButton: 'Continuer',
        },
        'stage-5': {
          difficulty: 'TOI SOUS PRESSION', preAdTitle: 'Ta façon de gérer la pression apparaît',
          preAdCopy: 'Ton profil sous pression : {profile}. Place aux personnes qui font ressortir une autre facette de toi.',
          next: {eyebrow: 'À SUIVRE', tagline: 'Tes proches pourraient reconnaître ces réponses.'}, preAdButton: 'Continuer',
        },
        'stage-6': {
          difficulty: 'TON ENTOURAGE', preAdTitle: 'Ta signature sociale se révèle',
          preAdCopy: 'Ton profil dans les relations : {profile}. Voici maintenant les petites habitudes que tu remarques à peine.',
          next: {eyebrow: 'À SUIVRE', tagline: 'Que se passe-t-il quand tu passes en pilote automatique ?'}, preAdButton: 'Continuer',
        },
        'stage-7': {
          difficulty: 'TON PILOTE AUTOMATIQUE', preAdTitle: 'Ton pilote automatique se dévoile',
          preAdCopy: 'Ton profil côté habitudes : {profile}. Passons à plus léger : qu’est-ce qui rend une journée ordinaire mémorable ?',
          next: {eyebrow: 'À SUIVRE', tagline: 'Du confort, de la curiosité ou une toute nouvelle histoire ?'}, preAdButton: 'Continuer',
        },
        'stage-8': {
          difficulty: 'CE QUI T’ANIME', preAdTitle: 'Ton étincelle a son profil',
          preAdCopy: 'Ton profil sur ce thème : {profile}. Que disent tes choix de la vie que tu veux construire ?',
          next: {eyebrow: 'À SUIVRE', tagline: 'Pour quoi ton toi du futur te remercierait-il ?'}, preAdButton: 'Continuer',
        },
        'stage-9': {
          difficulty: 'TON TOI DU FUTUR', preAdTitle: 'Ton avenir se dessine',
          preAdCopy: 'Ton profil quand tu regardes vers l’avenir : {profile}. Suis maintenant ton instinct pour réunir toutes les pièces.',
          next: {eyebrow: 'À SUIVRE', tagline: 'Que te dit ton instinct quand tu regardes l’ensemble ?'}, preAdButton: 'Continuer',
        },
        'stage-10': {
          difficulty: 'LE BILAN DE TON HORLOGE', preAdTitle: 'Le bilan de ton horloge est prêt',
          preAdCopy: 'Toutes les étapes sont terminées. Découvre le profil de ton horloge et ton âge estimé pour le plaisir, puis explore les choix qui les ont façonnés.',
          preAdChecks: ['Tes choix du quotidien reliés', 'Le profil de ton horloge identifié', 'Ton âge estimé pour le plaisir prêt'], preAdButton: 'Voir mon résultat',
        },
      },
    },
    results: {
      name: 'LE PROFIL DE TON HORLOGE',
      profiles: {
        centenarian_energy: {tier: 'Le cap sur la durée', title: 'Le sens du long terme', copy: 'Tu te fais de petites promesses et tu les tiens vraiment. Tes réponses privilégient les habitudes durables, le temps de récupérer et les choix que ton toi de demain appréciera. Ta signature : construire sur la durée, sans faire de bruit.'},
        steady_long_game: {tier: 'La force de la régularité', title: 'La constance au naturel', copy: 'Tu connais la valeur d’une routine qui te ressemble. Des rituels familiers et des personnes fiables donnent une forme à tes journées. Ta signature : être là quand on a besoin de toi, sans en faire toute une affaire.'},
        balanced_realist: {tier: 'Une place pour les deux', title: 'Le goût de l’équilibre', copy: 'Tu fais une place aux choix raisonnables comme au plaisir de vivre. Tes réponses s’adaptent à la journée au lieu de chercher la routine parfaite. Ta signature : savoir quand suivre le programme et quand commander le gâteau.'},
        weekend_chaos: {tier: 'Des histoires en prime', title: 'L’imprévu du week-end', copy: 'Tes meilleures histoires commencent rarement par un programme strict. Tes réponses aiment les moments improvisés, la bonne compagnie et les petites négociations avec ton toi du lendemain. Ta signature : transformer une soirée ordinaire en souvenir à raconter.'},
        stress_sprinter: {tier: 'Toujours une chose de plus', title: 'La vie à toute allure', copy: 'Tu mets de l’élan dans presque tout. Dans tes réponses, la prochaine tâche passe souvent avant la prochaine pause. Ta signature : faire avancer les choses. Un peu plus de marge pourrait t’aider à choisir ton rythme plutôt qu’à le subir.'},
        comfort_creature: {tier: 'Le confort est tout un art', title: 'L’art de se sentir bien', copy: 'Tu sais ce qui fait du bien : des lieux familiers, des personnes que tu aimes et une vraie occasion de déconnecter. Ta signature : rendre le quotidien accueillant. Savoir ce qui te convient est un talent en soi.'},
        adventure_fuse: {tier: 'Le plaisir des belles histoires', title: 'L’appel de l’aventure', copy: 'Ta curiosité a son mot à dire dans tes décisions. Tes réponses voient des possibilités dans les nouveaux lieux, les idées étonnantes et les journées qui prennent un tournant inattendu. Ta signature : revenir avec une histoire que personne n’avait vue venir.'},
        reset_needed: {tier: 'Un nouveau chapitre t’attend', title: 'L’envie de repartir', copy: 'Tes réponses demandent souvent plus d’espace, moins d’exigences et le temps de souffler. Ton envie du moment : un nouveau départ qui corresponde à ta vraie vie. Ce profil reflète tes choix d’aujourd’hui, pas une étiquette définitive.'},
      },
      dimensions: {
        'dimension-1': {label: '🌿 Constance sur la durée'}, 'dimension-2': {label: '⚖️ Équilibre et récupération'},
        'dimension-3': {label: '✨ Élan et aventure'}, 'dimension-4': {label: '⚡ Pression et rythme'},
      },
      estimate: {
        eyebrow: 'L’ÂGE DE TON HORLOGE, JUSTE POUR LE PLAISIR', ageSuffix: 'ANS', strongestSignal: 'Ta tendance de vie dominante', wildcard: 'Ton côté inattendu', consistency: 'Cohérence de tes réponses',
        consistencyLabels: {high: 'Élevée', medium: 'Moyenne', mixed: 'Variable'},
        reviewUnlock: {
          title: 'Quels choix ont façonné ton horloge ?', copy: 'Regarde derrière le chiffre : quelles réponses ont fait monter ou baisser cette estimation ludique, et lesquelles l’ont laissée inchangée ?',
          button: 'Voir mes réponses en détail', adNote: 'Appuie pour découvrir ce qui a façonné ton estimation.', reviewTitle: 'Ce qui a façonné ton estimation', yourChoice: 'Ton choix',
          raised: 'À la hausse', lowered: 'À la baisse', neutral: 'Neutre', raisedCopy: 'Cette réponse a fait monter l’estimation ludique.', loweredCopy: 'Cette réponse a fait baisser l’estimation ludique.', neutralCopy: 'Cette réponse a apporté du contexte sans modifier sensiblement l’estimation.',
        },
        insights: {overview: 'Ton estimation en un coup d’œil', estimate: 'Ton estimation', signal: 'Ta tendance de vie principale', consistency: 'Cohérence de tes réponses', breakdown: 'Tes tendances de vie en détail', snapshot: 'Ce que révèle ton profil'},
        disclaimer: 'Pour le divertissement uniquement. Ce résultat ne constitue pas une prévision médicale ni une prédiction de ton espérance de vie.',
      },
    },
  },
};

// Keep native sentence casing rather than lowercasing all-caps labels: German
// nouns must retain their capitals in titles shown at checkpoints and results.
export const yearsStageTitles = {
  de: ['Dein Start in den Tag', 'Was dir Energie gibt', 'Dein Tempo im Alltag', 'Wie du abschaltest', 'Du unter Druck', 'Deine Menschen', 'Dein Autopilot', 'Was dich begeistert', 'Dein zukünftiges Ich', 'Dein Lebensuhr-Ergebnis'],
  fr: ['Ton début de journée', 'Ce qui te donne de l’énergie', 'Ton rythme au quotidien', 'Ta façon de déconnecter', 'Toi sous pression', 'Ton entourage', 'Ton pilote automatique', 'Ce qui t’anime', 'Ton toi du futur', 'Le bilan de ton horloge'],
};
