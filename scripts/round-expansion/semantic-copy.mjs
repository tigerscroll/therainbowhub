import {anatomyPrompts} from './anatomy-prompt-copy.mjs';
// Reviewed meanings for short tokens that generic translation confuses with other senses.
export const treeParts = {
 ar:['الجذور','الجذع','الأغصان','النهر'],bg:['Корени','Ствол','Клони','Река'],cs:['Kořeny','Kmen','Větve','Řeka'],da:['Rødder','Stamme','Grene','Flod'],de:['Wurzeln','Stamm','Äste','Fluss'],el:['Ρίζες','Κορμός','Κλαδιά','Ποτάμι'],es:['Raíces','Tronco','Ramas','Río'],fi:['Juuret','Runko','Oksat','Joki'],fil:['Mga ugat','Puno ng kahoy','Mga sanga','Ilog'],fr:['Racines','Tronc','Branches','Rivière'],he:['שורשים','גזע','ענפים','נהר'],hr:['Korijenje','Deblo','Grane','Rijeka'],hu:['Gyökerek','Törzs','Ágak','Folyó'],id:['Akar','Batang','Dahan','Sungai'],it:['Radici','Tronco','Rami','Fiume'],ja:['根','幹','枝','川'],ms:['Akar','Batang','Dahan','Sungai'],nb:['Røtter','Stamme','Grener','Elv'],nl:['Wortels','Stam','Takken','Rivier'],pl:['Korzenie','Pień','Gałęzie','Rzeka'],pt:['Raízes','Tronco','Ramos','Rio'],ro:['Rădăcini','Trunchi','Ramuri','Râu'],sk:['Korene','Kmeň','Konáre','Rieka'],sr:['Корење','Стабло','Гране','Река'],sv:['Rötter','Stam','Grenar','Flod'],th:['ราก','ลำต้น','กิ่งไม้','แม่น้ำ'],tr:['Kökler','Gövde','Dallar','Nehir'],uk:['Коріння','Стовбур','Гілки','Річка'],vi:['Rễ','Thân cây','Cành cây','Sông'],
};
export const nimLogic = {
 ar:'كل NIM هو TOV، ولا يوجد أي TOV يكون RAK. هل يمكن أن يكون أي NIM هو RAK؟',
 bg:'Всички NIM са TOV. Нито едно TOV не е RAK. Възможно ли е някое NIM да е RAK?',
 cs:'Každé NIM je TOV. Žádné TOV není RAK. Může být některé NIM zároveň RAK?',
 da:'Alle NIM er TOV. Ingen TOV er RAK. Kan en NIM være RAK?',
 de:'Alle NIM sind TOV. Kein TOV ist RAK. Kann ein NIM ein RAK sein?',
 el:'Όλα τα NIM είναι TOV. Κανένα TOV δεν είναι RAK. Μπορεί κάποιο NIM να είναι RAK;',
 es:'Todos los NIM son TOV. Ningún TOV es RAK. ¿Puede algún NIM ser RAK?',
 fi:'Kaikki NIM ovat TOV. Yksikään TOV ei ole RAK. Voiko jokin NIM olla RAK?',
 fil:'Lahat ng NIM ay TOV. Walang TOV na RAK. Maaari bang may NIM na RAK?',
 fr:'Tous les NIM sont des TOV. Aucun TOV n’est un RAK. Un NIM peut-il être un RAK ?',
 he:'כל NIM הוא TOV. אף TOV אינו RAK. האם ייתכן ש־NIM כלשהו הוא RAK?',
 hr:'Svaki NIM je TOV. Nijedan TOV nije RAK. Može li neki NIM biti RAK?',
 hu:'Minden NIM egyben TOV. Egyetlen TOV sem RAK. Lehet-e bármelyik NIM egyben RAK?',
 id:'Semua NIM adalah TOV. Tidak ada TOV yang merupakan RAK. Mungkinkah ada NIM yang merupakan RAK?',
 it:'Tutti i NIM sono TOV. Nessun TOV è RAK. Un NIM può essere RAK?',
 ja:'NIMはすべてTOVです。TOVの中にRAKは一つもありません。NIMがRAKであることはありえますか？',
 ms:'Semua NIM ialah TOV. Tiada TOV yang merupakan RAK. Mungkinkah ada NIM yang merupakan RAK?',
 nb:'Alle NIM er TOV. Ingen TOV er RAK. Kan en NIM være RAK?',
 nl:'Alle NIM zijn TOV. Geen enkele TOV is RAK. Kan een NIM RAK zijn?',
 pl:'Każde NIM jest TOV. Żadne TOV nie jest RAK. Czy jakieś NIM może być RAK?',
 pt:'Todos os NIM são TOV. Nenhum TOV é RAK. Algum NIM pode ser RAK?',
 ro:'Toate NIM sunt TOV. Niciun TOV nu este RAK. Poate vreun NIM să fie RAK?',
 sk:'Každé NIM je TOV. Žiadne TOV nie je RAK. Môže byť niektoré NIM zároveň RAK?',
 sr:'Сваки NIM је TOV. Ниједан TOV није RAK. Може ли неки NIM бити RAK?',
 sv:'Alla NIM är TOV. Ingen TOV är RAK. Kan någon NIM vara RAK?',
 th:'NIM ทุกตัวเป็น TOV และไม่มี TOV ตัวใดเป็น RAK เป็นไปได้ไหมที่ NIM บางตัวจะเป็น RAK?',
 tr:'Bütün NIM’ler TOV’dur. Hiçbir TOV, RAK değildir. Herhangi bir NIM, RAK olabilir mi?',
 uk:'Кожен NIM є TOV. Жоден TOV не є RAK. Чи може якийсь NIM бути RAK?',
 vi:'Mọi NIM đều là TOV. Không có TOV nào là RAK. Có thể có NIM nào là RAK không?',
};
export const reasoningTitles={ar:'تحديات منطقية',bg:'Логически предизвикателства',cs:'Logické výzvy',da:'Logiske udfordringer',de:'Knifflige Denkaufgaben',el:'Προκλήσεις λογικής',es:'Retos de lógica',fi:'Päättelyhaasteet',fil:'Mga Hamon sa Pangangatwiran',fr:'Défis de logique',he:'אתגרי חשיבה',hr:'Logički izazovi',hu:'Logikai kihívások',id:'Tantangan Logika',it:'Sfide di logica',ja:'論理に挑戦',ms:'Cabaran Logik',nb:'Logiske utfordringer',nl:'Logische uitdagingen',pl:'Wyzwania logiczne',pt:'Desafios de lógica',ro:'Provocări de logică',sk:'Logické výzvy',sr:'Логички изазови',sv:'Logiska utmaningar',th:'ท้าทายตรรกะ',tr:'Mantık Soruları',uk:'Логічні виклики',vi:'Thử thách logic'};

// Quoted labels avoid case-inflection mismatches when composing association prompts.
export const wordPrompt={ar:'أي كلمة ترتبط أكثر بـ «{word}»؟',bg:'Коя дума е най-тясно свързана с „{word}“?',cs:'Které slovo nejvíce souvisí s výrazem „{word}“?',da:'Hvilket ord er tættest knyttet til »{word}«?',de:'Welches Wort passt am besten zu „{word}“?',el:'Ποια λέξη συνδέεται περισσότερο με τη λέξη «{word}»;',es:'¿Qué palabra está más relacionada con «{word}»?',fi:'Mikä sana liittyy läheisimmin sanaan ”{word}”?',fil:'Aling salita ang may pinakamalapit na kaugnayan sa “{word}”?',fr:'Quel mot est le plus étroitement lié à « {word} » ?',he:'איזו מילה קשורה ביותר למילה ״{word}״?',hr:'Koja je riječ najbliže povezana s pojmom „{word}“?',hu:'Melyik szó kapcsolódik legszorosabban ehhez: „{word}“?',id:'Kata mana yang paling erat kaitannya dengan “{word}”?',it:'Quale parola è più strettamente collegata a «{word}»?',ja:'「{word}」と最も関係が深い言葉はどれ？',ms:'Perkataan manakah yang paling berkait rapat dengan “{word}”?',nb:'Hvilket ord er nærmest knyttet til «{word}»?',nl:'Welk woord is het nauwst verbonden met ‘{word}’?',pl:'Które słowo jest najściślej związane z pojęciem „{word}“?',pt:'Qual palavra está mais relacionada com «{word}»?',ro:'Care cuvânt este cel mai strâns legat de „{word}“?',sk:'Ktoré slovo najviac súvisí s výrazom „{word}“?',sr:'Која реч је најближе повезана са појмом „{word}“?',sv:'Vilket ord är närmast kopplat till ”{word}”?',th:'คำใดเกี่ยวข้องกับ “{word}” มากที่สุด?',tr:'Hangi sözcük “{word}” ile en yakından ilişkilidir?',uk:'Яке слово найтісніше пов’язане з поняттям «{word}»?',vi:'Từ nào có liên hệ gần gũi nhất với “{word}”?' };
// Glacier, orchard, hive, estuary, thermometer, telescope, microscope, anchor,
// photosynthesis, evaporation, gravity, echo — in this exact order.
export const associationWords={
 ar:['نهر جليدي','بستان','خلية نحل','مصب نهر','مقياس حرارة','تلسكوب','مجهر','مرساة','البناء الضوئي','التبخر','الجاذبية','الصدى'],
 bg:['ледник','овощна градина','кошер','естуар','термометър','телескоп','микроскоп','котва','фотосинтеза','изпарение','гравитация','ехо'],
 cs:['ledovec','ovocný sad','úl','ústí řeky','teploměr','teleskop','mikroskop','kotva','fotosyntéza','vypařování','gravitace','ozvěna'],
 da:['gletsjer','frugtplantage','bistade','flodmunding','termometer','teleskop','mikroskop','anker','fotosyntese','fordampning','tyngdekraft','ekko'],
 de:['Gletscher','Obstgarten','Bienenstock','Flussmündung','Thermometer','Teleskop','Mikroskop','Anker','Fotosynthese','Verdunstung','Schwerkraft','Echo'],
 el:['παγετώνας','οπωρώνας','κυψέλη','εκβολή ποταμού','θερμόμετρο','τηλεσκόπιο','μικροσκόπιο','άγκυρα','φωτοσύνθεση','εξάτμιση','βαρύτητα','ηχώ'],
 es:['glaciar','huerto frutal','colmena','estuario','termómetro','telescopio','microscopio','ancla','fotosíntesis','evaporación','gravedad','eco'],
 fi:['jäätikkö','hedelmätarha','mehiläispesä','jokisuu','lämpömittari','kaukoputki','mikroskooppi','ankkuri','yhteyttäminen','haihtuminen','painovoima','kaiku'],
 fil:['glasyar','halamanan ng mga punong namumunga','bahay-pukyutan','bukana ng ilog','termometro','teleskopyo','mikroskopyo','angkla','potosintesis','pagsingaw','grabidad','alingawngaw'],
 fr:['glacier','verger','ruche','estuaire','thermomètre','télescope','microscope','ancre','photosynthèse','évaporation','gravité','écho'],
 he:['קרחון','מטע','כוורת','שפך נהר','מדחום','טלסקופ','מיקרוסקופ','עוגן','פוטוסינתזה','התאדות','כוח הכבידה','הד'],
 hr:['ledenjak','voćnjak','košnica','ušće rijeke','termometar','teleskop','mikroskop','sidro','fotosinteza','isparavanje','gravitacija','jeka'],
 hu:['gleccser','gyümölcsös','méhkaptár','folyótorkolat','hőmérő','távcső','mikroszkóp','horgony','fotoszintézis','párolgás','gravitáció','visszhang'],
 id:['gletser','kebun buah','sarang lebah','muara sungai','termometer','teleskop','mikroskop','jangkar','fotosintesis','penguapan','gravitasi','gema'],
 it:['ghiacciaio','frutteto','alveare','estuario','termometro','telescopio','microscopio','ancora','fotosintesi','evaporazione','gravità','eco'],
 ja:['氷河','果樹園','蜂の巣','河口','温度計','望遠鏡','顕微鏡','いかり','光合成','蒸発','重力','こだま'],
 ms:['glasier','kebun buah-buahan','sarang lebah','muara sungai','termometer','teleskop','mikroskop','sauh','fotosintesis','penyejatan','graviti','gema'],
 nb:['isbre','frukthage','bikube','elvemunning','termometer','teleskop','mikroskop','anker','fotosyntese','fordamping','tyngdekraft','ekko'],
 nl:['gletsjer','boomgaard','bijenkorf','riviermonding','thermometer','telescoop','microscoop','anker','fotosynthese','verdamping','zwaartekracht','echo'],
 pl:['lodowiec','sad','ul','ujście rzeki','termometr','teleskop','mikroskop','kotwica','fotosynteza','parowanie','grawitacja','echo'],
 pt:['glaciar','pomar','colmeia','estuário','termómetro','telescópio','microscópio','âncora','fotossíntese','evaporação','gravidade','eco'],
 ro:['ghețar','livadă','stup','estuar','termometru','telescop','microscop','ancoră','fotosinteză','evaporare','gravitație','ecou'],
 sk:['ľadovec','ovocný sad','úľ','ústie rieky','teplomer','teleskop','mikroskop','kotva','fotosyntéza','vyparovanie','gravitácia','ozvena'],
 sr:['глечер','воћњак','кошница','ушће реке','термометар','телескоп','микроскоп','сидро','фотосинтеза','испаравање','гравитација','ехо'],
 sv:['glaciär','fruktträdgård','bikupa','flodmynning','termometer','teleskop','mikroskop','ankare','fotosyntes','avdunstning','gravitation','eko'],
 th:['ธารน้ำแข็ง','สวนผลไม้','รังผึ้ง','ปากแม่น้ำ','เทอร์มอมิเตอร์','กล้องโทรทรรศน์','กล้องจุลทรรศน์','สมอเรือ','การสังเคราะห์ด้วยแสง','การระเหย','แรงโน้มถ่วง','เสียงสะท้อน'],
 tr:['buzul','meyve bahçesi','arı kovanı','nehir ağzı','termometre','teleskop','mikroskop','çapa','fotosentez','buharlaşma','yer çekimi','yankı'],
 uk:['льодовик','плодовий сад','вулик','гирло річки','термометр','телескоп','мікроскоп','якір','фотосинтез','випаровування','гравітація','луна'],
 vi:['sông băng','vườn cây ăn quả','tổ ong','cửa sông','nhiệt kế','kính thiên văn','kính hiển vi','mỏ neo','quang hợp','bay hơi','trọng lực','tiếng vang'],
};
export const birdRelations={
 ar:['أي زوج له العلاقة نفسها بين «طائر → سرب»؟','سمكة → سرب أسماك','أسد → عرين','نحلة → عسل','حصان → إسطبل'],
 bg:['Коя двойка има същото отношение като „птица → ято“?','Риба → Пасаж','Лъв → Леговище','Пчела → Мед','Кон → Конюшня'],
 cs:['Která dvojice má stejný vztah jako „pták → hejno“?','Ryba → Hejno ryb','Lev → Doupě','Včela → Med','Kůň → Stáj'],
 da:['Hvilket par har samme forhold som »fugl → flok«?','Fisk → Stime','Løve → Hule','Bi → Honning','Hest → Stald'],
 de:['Welches Paar hat dieselbe Beziehung wie „Vogel → Schwarm“?','Fisch → Schwarm','Löwe → Höhle','Biene → Honig','Pferd → Stall'],
 el:['Ποιο ζεύγος έχει την ίδια σχέση με το «πουλί → σμήνος»;','Ψάρι → Κοπάδι ψαριών','Λιοντάρι → Φωλιά','Μέλισσα → Μέλι','Άλογο → Στάβλος'],
 es:['¿Qué pareja sigue la misma relación que «ave → bandada»?','Pez → Banco de peces','León → Guarida','Abeja → Miel','Caballo → Establo'],
 fi:['Missä parissa on sama suhde kuin parissa ”lintu → parvi”?','Kala → Kalaparvi','Leijona → Luola','Mehiläinen → Hunaja','Hevonen → Talli'],
 fil:['Aling pares ang may parehong ugnayan tulad ng “ibon → kawan ng mga ibon”?','Isda → Kawan ng mga isda','Leon → Lungga','Pukyutan → Pulot-pukyutan','Kabayo → Kuwadra'],
 fr:['Quel couple suit la même relation que « oiseau → volée » ?','Poisson → Banc de poissons','Lion → Tanière','Abeille → Miel','Cheval → Écurie'],
 he:['איזה זוג מקיים את אותו קשר כמו ״ציפור → להקה״?','דג → להקת דגים','אריה → מאורה','דבורה → דבש','סוס → אורווה'],
 hr:['Koji par ima isti odnos kao „ptica → jato“?','Riba → Jato riba','Lav → Brlog','Pčela → Med','Konj → Staja'],
 hu:['Melyik szópár kapcsolata egyezik a „madár → madárraj” kapcsolatával?','Hal → Halraj','Oroszlán → Odú','Méh → Méz','Ló → Istálló'],
 id:['Pasangan mana yang memiliki hubungan yang sama dengan “burung → kawanan burung”?','Ikan → Kawanan ikan','Singa → Sarang','Lebah → Madu','Kuda → Kandang'],
 it:['Quale coppia segue la stessa relazione di «uccello → stormo»?','Pesce → Banco di pesci','Leone → Tana','Ape → Miele','Cavallo → Stalla'],
 ja:['「鳥 → 鳥の群れ」と同じ関係になっている組み合わせはどれ？','魚 → 魚の群れ','ライオン → すみか','蜂 → 蜂蜜','馬 → 馬小屋'],
 ms:['Pasangan manakah yang mempunyai hubungan yang sama seperti “burung → kawanan burung”?','Ikan → Kawanan ikan','Singa → Sarang','Lebah → Madu','Kuda → Kandang'],
 nb:['Hvilket par har samme forhold som «fugl → flokk»?','Fisk → Stim','Løve → Hule','Bie → Honning','Hest → Stall'],
 nl:['Welk paar heeft dezelfde relatie als ‘vogel → zwerm’?','Vis → School vissen','Leeuw → Hol','Bij → Honing','Paard → Stal'],
 pl:['Która para ma taką samą relację jak „ptak → stado“?','Ryba → Ławica','Lew → Legowisko','Pszczoła → Miód','Koń → Stajnia'],
 pt:['Qual par segue a mesma relação que «ave → bando»?','Peixe → Cardume','Leão → Toca','Abelha → Mel','Cavalo → Estábulo'],
 ro:['Care pereche are aceeași relație ca „pasăre → stol“?','Pește → Banc de pești','Leu → Bârlog','Albină → Miere','Cal → Grajd'],
 sk:['Ktorá dvojica má rovnaký vzťah ako „vták → kŕdeľ“?','Ryba → Húf rýb','Lev → Brloh','Včela → Med','Kôň → Stajňa'],
 sr:['Који пар има исти однос као „птица → јато“?','Риба → Јато риба','Лав → Јазбина','Пчела → Мед','Коњ → Штала'],
 sv:['Vilket par har samma förhållande som ”fågel → flock”?','Fisk → Stim','Lejon → Lya','Bi → Honung','Häst → Stall'],
 th:['คู่ใดมีความสัมพันธ์แบบเดียวกับ “นก → ฝูงนก”?','ปลา → ฝูงปลา','สิงโต → ถ้ำ','ผึ้ง → น้ำผึ้ง','ม้า → คอกม้า'],
 tr:['Hangi çift “kuş → kuş sürüsü” ile aynı ilişkiye sahiptir?','Balık → Balık sürüsü','Aslan → İn','Arı → Bal','At → Ahır'],
 uk:['Яка пара має такий самий зв’язок, як «птах → зграя»?','Риба → Косяк риб','Лев → Лігво','Бджола → Мед','Кінь → Стайня'],
 vi:['Cặp nào có cùng mối quan hệ như “chim → đàn chim”?','Cá → Đàn cá','Sư tử → Hang','Ong → Mật ong','Ngựa → Chuồng ngựa'],
};
export const chapterAnalogy={
 ar:['الفصل جزء من كتاب. والمشهد المسرحي جزء من ماذا؟','مسرحية'],
 bg:['Главата е част от книга. От какво е част една театрална сцена?','Пиеса'],
 cs:['Kapitola je součástí knihy. Čeho je součástí divadelní scéna?','Divadelní hra'],
 da:['Et kapitel er en del af en bog. Hvad er en teaterscene en del af?','Et skuespil'],
 de:['Ein Kapitel ist Teil eines Buches. Wovon ist eine Theaterszene ein Teil?','Theaterstück'],
 el:['Ένα κεφάλαιο είναι μέρος ενός βιβλίου. Μια θεατρική σκηνή είναι μέρος τίνος;','Θεατρικού έργου'],
 es:['Un capítulo forma parte de un libro. ¿De qué forma parte una escena teatral?','Una obra de teatro'],
 fi:['Luku on osa kirjaa. Minkä osa teatterikohtaus on?','Näytelmän'],
 fil:['Bahagi ng isang aklat ang kabanata. Saan naman kabilang ang isang eksena sa teatro?','Dula'],
 fr:['Un chapitre fait partie d’un livre. De quoi une scène de théâtre fait-elle partie ?','Une pièce de théâtre'],
 he:['פרק הוא חלק מספר. ממה סצנה בתיאטרון היא חלק?','מחזה'],
 hr:['Poglavlje je dio knjige. Čega je dio kazališni prizor?','Drame'],
 hu:['A fejezet egy könyv része. Minek a része egy színházi jelenet?','Egy színdarabnak'],
 id:['Bab merupakan bagian dari buku. Adegan teater merupakan bagian dari apa?','Lakon'],
 it:['Un capitolo fa parte di un libro. Di che cosa fa parte una scena teatrale?','Un’opera teatrale'],
 ja:['章は本の一部です。では、舞台の一場面は何の一部でしょう？','演劇作品'],
 ms:['Bab ialah sebahagian daripada buku. Adegan teater pula sebahagian daripada apa?','Lakonan pentas'],
 nb:['Et kapittel er en del av en bok. Hva er en teaterscene en del av?','Et skuespill'],
 nl:['Een hoofdstuk is onderdeel van een boek. Waarvan is een theaterscène onderdeel?','Een toneelstuk'],
 pl:['Rozdział jest częścią książki. Czego częścią jest scena teatralna?','Sztuki teatralnej'],
 pt:['Um capítulo faz parte de um livro. De que faz parte uma cena teatral?','Uma peça de teatro'],
 ro:['Un capitol face parte dintr-o carte. Din ce face parte o scenă de teatru?','O piesă de teatru'],
 sk:['Kapitola je súčasťou knihy. Čoho je súčasťou divadelná scéna?','Divadelnej hry'],
 sr:['Поглавље је део књиге. Чега је део позоришна сцена?','Позоришног комада'],
 sv:['Ett kapitel är en del av en bok. Vad är en teaterscen en del av?','En teaterpjäs'],
 th:['บทหนึ่งเป็นส่วนหนึ่งของหนังสือ แล้วฉากการแสดงเป็นส่วนหนึ่งของอะไร?','ละครเวที'],
 tr:['Bir bölüm kitabın parçasıdır. Tiyatrodaki bir sahne neyin parçasıdır?','Tiyatro oyununun'],
 uk:['Розділ є частиною книжки. Частиною чого є театральна сцена?','П’єси'],
 vi:['Một chương là một phần của cuốn sách. Vậy một cảnh sân khấu là một phần của gì?','Vở kịch'],
};
export function semanticPolish(slug,locale,c){
 const qs=Object.assign({},...Object.values(c.stages).map(s=>s.questions));
 if(slug==='anatomy'){
  qs['anatomy-round2-new4'].question=anatomyPrompts[locale][0];
  qs['anatomy-round4-new4'].question=anatomyPrompts[locale][1];
 }
 if(slug==='dentist'){
  qs['dentist-round1-new4'].question=anatomyPrompts[locale][2];
  qs['dentist-round4-new3'].question=anatomyPrompts[locale][3];
  if(locale==='es')qs['dentist-round5-new2'].question='¿Qué registra una impresión dental o un escaneo digital?';
 }
 if(slug==='iq'){
  qs['iq-s2q5'].question=nimLogic[locale];
  const [birdQuestion,...birdAnswers]=birdRelations[locale];
  qs['iq-s3q6'].question=birdQuestion;qs['iq-s3q6'].answers=Object.fromEntries(birdAnswers.map((x,i)=>[`a${i+1}`,x]));
  if(!['de','es','fr','it','nl','pt'].includes(locale))qs['iq-s4q5'].answers=Object.fromEntries(treeParts[locale].map((x,i)=>[`a${i+1}`,x]));
  c.stages['stage-4'].title=reasoningTitles[locale];c.career.stages['stage-4'].difficulty=reasoningTitles[locale];
  for(const q of Object.values(c.stages['stage-4'].questions))if(!q.headerLabel.includes('SPATIAL'))q.headerLabel=reasoningTitles[locale];
  if(locale==='ja'){
   for(const id of ['iq-s1q5','iq-s4q2'])qs[id].answers={a1:'1番目',a2:'2番目',a3:'3番目',a4:'4番目'};
   qs['iq-s3q6'].question='「鳥 → 鳥の群れ」と同じ関係になっている組み合わせはどれ？';
   qs['iq-s3q6'].answers={a1:'魚 → 魚の群れ',a2:'ライオン → すみか',a3:'蜂 → 蜂蜜',a4:'馬 → 馬小屋'};
  }
 }
 if(slug==='word'){
  const ids=[1,2,3].flatMap(r=>[1,2,3,4].map(q=>`word-round${r}-new${q}`));
  for(const[i,id]of ids.entries())qs[id].question=wordPrompt[locale].replace('{word}',associationWords[locale][i]);
  qs['word-round5-new1'].question=chapterAnalogy[locale][0];qs['word-round5-new1'].answers.a1=chapterAnalogy[locale][1];
  if(locale==='es'){
   c.landing.intro='Sigue los vínculos entre palabras.\nEncuentra la conexión.';
   qs['word-round4-new3'].answers={a1:'Ascender y descender',a2:'Leer y escribir',a3:'Mirar y escuchar',a4:'Construir y reparar'};
   qs['word-round4-new4'].answers.a2='Antes de la primera letra';
   qs['word-round5-new3'].question='Completa la relación: tronco es a árbol como tallo es a…';
   qs['word-round5-new4'].question='Completa la relación: pregunta es a respuesta como problema es a…';
   qs['word-round2-new4'].answers.a3='Tejido';
  }
 }
 if(slug==='pilot'&&locale==='de'){
  qs['pilot-round1-new4'].answers={a1:'Seitenruder',a2:'Höhenruder',a3:'Querruder',a4:'Nur die Landeklappe'};
  qs['pilot-round2-new4'].answers={a1:'Sie nimmt zu',a2:'Sie nimmt immer ab',a3:'Sie sinkt immer auf null',a4:'Die Flughöhe ändert sich von selbst'};
  qs['pilot-round3-new3'].question='Welche Bewegung steuert das Höhenruder hauptsächlich?';
  qs['pilot-round3-new4'].question='Was ist die Hauptursache eines aerodynamischen Strömungsabrisses?';
  qs['pilot-round3-new4'].answers.a2='Dass immer das Triebwerk ausfällt';
 }
 if(slug==='grammar'&&locale==='fr')for(const stage of Object.values(c.stages))for(const q of Object.values(stage.questions)){
  if(q.headerLabel==='ENREGISTREMENT DE LA GRAMMAIRE')q.headerLabel='LES BASES DE LA GRAMMAIRE';
  if(q.headerLabel==='PASS DE PRÉCISION')q.headerLabel='PRÉCISION DES MOTS';
 }
 return c;
}
