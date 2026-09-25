// One vocabulary supplies study cards, choices and quoted recall clues. This
// prevents synonyms introduced by translation from revealing or hiding answers.
const words = ['Key','Kite','Train','Vehicle','Airplane','Elephant','Rabbit','Tiger','Giraffe','Blue','Purple','Silver','Gold','Red','Green','Black','Yellow','Pine','River','Candle','Shell','Lemon','Ribbon','Tower','Fox','Ladder','Pear','Apple','Plum','Anchor','Coin','Wolf','Bear','Deer','Star','Triangle','Square','Circle','Violin','Compass','Scarf','Teapot','Baker','Pilot','Artist','Vet','Mug','Leaf','Cup','Book','Bell','Ring','Moon','Sun','Brass','Wood','Glass','Orbit','Velvet','Harbour','Meadow','Flowers','Garden','Kitchen','Library','Beach'];
const rows = {
  fr: 'Clé|Cerf-volant|Train|Véhicule|Avion|Éléphant|Lapin|Tigre|Girafe|Bleu|Violet|Argenté|Doré|Rouge|Vert|Noir|Jaune|Pin|Rivière|Bougie|Coquillage|Citron|Ruban|Tour|Renard|Échelle|Poire|Pomme|Prune|Ancre|Pièce|Loup|Ours|Cerf|Étoile|Triangle|Carré|Cercle|Violon|Boussole|Écharpe|Théière|Boulanger|Pilote|Artiste|Vétérinaire|Mug|Feuille|Tasse|Livre|Cloche|Bague|Lune|Soleil|Laiton|Bois|Verre|Orbite|Velours|Port|Prairie|Fleurs|Jardin|Cuisine|Bibliothèque|Plage',
  de: 'Schlüssel|Drachen|Zug|Fahrzeug|Flugzeug|Elefant|Kaninchen|Tiger|Giraffe|Blau|Lila|Silberfarben|Goldfarben|Rot|Grün|Schwarz|Gelb|Kiefer|Fluss|Kerze|Muschel|Zitrone|Band|Turm|Fuchs|Leiter|Birne|Apfel|Pflaume|Anker|Münze|Wolf|Bär|Hirsch|Stern|Dreieck|Quadrat|Kreis|Geige|Kompass|Schal|Teekanne|Bäcker|Pilot|Künstler|Tierarzt|Becher|Blatt|Tasse|Buch|Glocke|Ring|Mond|Sonne|Messing|Holz|Glas|Umlaufbahn|Samt|Hafen|Wiese|Blumen|Garten|Küche|Bibliothek|Strand',
  it: 'Chiave|Aquilone|Treno|Veicolo|Aereo|Elefante|Coniglio|Tigre|Giraffa|Blu|Viola|Argentato|Dorato|Rosso|Verde|Nero|Giallo|Pino|Fiume|Candela|Conchiglia|Limone|Nastro|Torre|Volpe|Scala|Pera|Mela|Prugna|Ancora|Moneta|Lupo|Orso|Cervo|Stella|Triangolo|Quadrato|Cerchio|Violino|Bussola|Sciarpa|Teiera|Panettiere|Pilota|Artista|Veterinario|Tazza grande|Foglia|Tazza|Libro|Campana|Anello|Luna|Sole|Ottone|Legno|Vetro|Orbita|Velluto|Porto|Prato|Fiori|Giardino|Cucina|Biblioteca|Spiaggia',
  nl: 'Sleutel|Vlieger|Trein|Voertuig|Vliegtuig|Olifant|Konijn|Tijger|Giraffe|Blauw|Paars|Zilverkleurig|Goudkleurig|Rood|Groen|Zwart|Geel|Den|Rivier|Kaars|Schelp|Citroen|Lint|Toren|Vos|Ladder|Peer|Appel|Pruim|Anker|Munt|Wolf|Beer|Hert|Ster|Driehoek|Vierkant|Cirkel|Viool|Kompas|Sjaal|Theepot|Bakker|Piloot|Kunstenaar|Dierenarts|Mok|Blad|Kopje|Boek|Bel|Ring|Maan|Zon|Messing|Hout|Glas|Baan|Fluweel|Haven|Weide|Bloemen|Tuin|Keuken|Bibliotheek|Strand',
  es: 'Llave|Cometa|Tren|Vehículo|Avión|Elefante|Conejo|Tigre|Jirafa|Azul|Morado|Plateado|Dorado|Rojo|Verde|Negro|Amarillo|Pino|Río|Vela|Concha|Limón|Cinta|Torre|Zorro|Escalera|Pera|Manzana|Ciruela|Ancla|Moneda|Lobo|Oso|Ciervo|Estrella|Triángulo|Cuadrado|Círculo|Violín|Brújula|Bufanda|Tetera|Panadero|Piloto|Artista|Veterinario|Taza grande|Hoja|Taza|Libro|Campana|Anillo|Luna|Sol|Latón|Madera|Vidrio|Órbita|Terciopelo|Puerto|Pradera|Flores|Jardín|Cocina|Biblioteca|Playa',
  pt: 'Chave|Avião|Veículo|Veículo|Avião|Elefante|Coelho|Tigre|Girafa|Azul|Roxo|Prateado|Dourado|Vermelho|Verde|Preto|Amarelo|Pinheiro|Rio|Vela|Concha|Limão|Fita|Torre|Raposa|Escada|Pera|Maçã|Ameixa|Âncora|Moeda|Lobo|Urso|Veado|Estrela|Triângulo|Quadrado|Círculo|Violino|Bússola|Cachecol|Bule|Padeiro|Piloto|Artista|Veterinário|Caneca|Folha|Taça|Livro|Sino|Anel|Lua|Sol|Latão|Madeira|Vidro|Órbita|Veludo|Porto|Prado|Flores|Jardim|Cozinha|Biblioteca|Praia',
  ar: 'مفتاح|طائرة ورقية|قطار|مركبة|طائرة|فيل|أرنب|نمر|زرافة|أزرق|أرجواني|فضي|ذهبي|أحمر|أخضر|أسود|أصفر|صنوبر|نهر|شمعة|صدفة|ليمون|شريط|برج|ثعلب|سلّم|كمثرى|تفاح|برقوق|مرساة|عملة معدنية|ذئب|دب|أيل|نجمة|مثلث|مربع|دائرة|كمان|بوصلة|وشاح|إبريق شاي|خباز|طيار|فنان|طبيب بيطري|كوب كبير|ورقة شجر|كوب|كتاب|جرس|خاتم|قمر|شمس|نحاس أصفر|خشب|زجاج|مدار|مخمل|ميناء|مرج|زهور|حديقة|مطبخ|مكتبة|شاطئ',
};
export const vocabulary = Object.fromEntries(Object.entries(rows).map(([locale, row]) => {
  const values = row.split('|');
  if (values.length !== words.length) throw Error(`${locale}: memory vocabulary length ${values.length}/${words.length}`);
  return [locale, Object.fromEntries(words.map((word, i) => [word, values[i]]))];
}));

export const names = {
  Mia: 'ميا', Omar: 'عمر', Lena: 'لينا', Noah: 'نوح', Ava: 'آفا', Leo: 'ليو', Zoe: 'زوي', Finn: 'فين',
  Maya: 'مايا', Kai: 'كاي', Nora: 'نورا', Sam: 'سام', Ivy: 'آيفي', Max: 'ماكس', Nina: 'نينا',
};

// Full phrases preserve agreement (e.g. clé bleue, cerf-volant argenté).
const phraseKeys = ['BLUE KEY','PURPLE ELEPHANT','SILVER KITE','STRIPED MUG','PLAIN KEY','DOTTED KITE','CHECKED SCARF','Dots','Checks','No pattern','Stripes'];
const phraseRows = {
  fr: 'CLÉ BLEUE|ÉLÉPHANT VIOLET|CERF-VOLANT ARGENTÉ|MUG RAYÉ|CLÉ SANS MOTIF|CERF-VOLANT À POIS|ÉCHARPE À CARREAUX|Pois|Carreaux|Sans motif|Rayures',
  de: 'BLAUER SCHLÜSSEL|LILA ELEFANT|SILBERFARBENER DRACHEN|GESTREIFTER BECHER|SCHLÜSSEL OHNE MUSTER|GEPUNKTETER DRACHEN|KARIERTER SCHAL|Punkte|Karos|Kein Muster|Streifen',
  it: 'CHIAVE BLU|ELEFANTE VIOLA|AQUILONE ARGENTATO|TAZZA GRANDE A RIGHE|CHIAVE SENZA MOTIVO|AQUILONE A POIS|SCIARPA A QUADRI|Pois|Quadri|Nessun motivo|Righe',
  nl: 'BLAUWE SLEUTEL|PAARSE OLIFANT|ZILVERKLEURIGE VLIEGER|GESTREEPTE MOK|SLEUTEL ZONDER PATROON|GESTIPPELDE VLIEGER|GERUITE SJAAL|Stippen|Ruiten|Geen patroon|Strepen',
  es: 'LLAVE AZUL|ELEFANTE MORADO|COMETA PLATEADA|TAZA GRANDE A RAYAS|LLAVE SIN DIBUJO|COMETA CON PUNTOS|BUFANDA A CUADROS|Puntos|Cuadros|Sin dibujo|Rayas',
  pt: 'CHAVE AZUL|ELEFANTE ROXO|AVIÃO PRATEADO|CANECA ÀS RISCAS|CHAVE SEM PADRÃO|AVIÃO COM PONTOS|CACHECOL AOS QUADRADOS|Pontos|Quadrados|Sem padrão|Riscas',
  ar: 'مفتاح أزرق|فيل أرجواني|طائرة ورقية فضية|كوب كبير مخطط|مفتاح بلا نقوش|طائرة ورقية منقطة|وشاح بنقشة مربعات|نقاط|مربعات|بلا نقوش|خطوط',
};
export const phrases = Object.fromEntries(Object.entries(phraseRows).map(([locale, row]) => [locale, Object.fromEntries(phraseKeys.map((key, index) => [key, row.split('|')[index]]))]));
phrases.pt['SILVER AIRPLANE'] = phrases.pt['SILVER KITE'];
phrases.pt['DOTTED AIRPLANE'] = phrases.pt['DOTTED KITE'];

const pairKeys = ['Leaf and star','Book and ring','Bell and cup','Bell and ring','Ring, star','Cup, ring','Book, cup','Star, ring'];
const connectors = {fr:'et',de:'und',it:'e',nl:'en',es:'y',pt:'e',ar:'و'};
for (const locale of Object.keys(rows)) for (const pair of pairKeys) {
  const comma = pair.includes(','), [first, second] = pair.split(comma ? ', ' : ' and ');
  const word = value => vocabulary[locale][value[0].toUpperCase() + value.slice(1)];
  phrases[locale][pair] = comma ? `${word(first)}, ${word(second)}` : `${word(first)} ${connectors[locale]} ${word(second)}`;
}
