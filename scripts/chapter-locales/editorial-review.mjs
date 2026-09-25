// Context-specific corrections from the full 2026-09-25 editorial audit.
// Columns: French, German, Italian, Dutch, Spanish, Portuguese, Arabic.
// Match English meaning, not isolated translated words with unrelated senses.
import {translationRowLocales} from './config.mjs';
import {editorialInterfaceFamilies} from './editorial-interface.mjs';
import {editorialReasoningFamily} from './editorial-reasoning.mjs';
import {editorialCabinFamily} from './editorial-cabin.mjs';
import {editorialAnatomyFamily} from './editorial-anatomy.mjs';
import {editorialLegalFamily} from './editorial-legal.mjs';
import {editorialListeningFamily} from './editorial-listening.mjs';
import {editorialProfessionalFamily} from './editorial-professional.mjs';
import {editorialPoliceFamily} from './editorial-police.mjs';
import {editorialSocialCareFamilies} from './editorial-social-care.mjs';
import {editorialTeacherFamily} from './editorial-teacher.mjs';
import {editorialBibleFamily} from './editorial-bible.mjs';
import {editorialCatholicFamily} from './editorial-catholic.mjs';
import {editorialNunFamily} from './editorial-nun.mjs';
import {editorialCambridgeFamily} from './editorial-cambridge.mjs';
import {editorialChefFamily} from './editorial-chef.mjs';
import {editorialDentistFamily} from './editorial-dentist.mjs';
import {editorialClinicalFamily} from './editorial-clinical.mjs';
import {editorialDoctorFamily} from './editorial-doctor.mjs';
import {editorialMedicalFamily} from './editorial-medical.mjs';
import {editorialNursingFamily} from './editorial-nursing.mjs';
import {editorialParamedicFamily} from './editorial-paramedic.mjs';
import {editorialMidwiferyFamily} from './editorial-midwifery.mjs';
import {editorialSurgeonFamily} from './editorial-surgeon.mjs';
import {editorialFirefighterFamily} from './editorial-firefighter.mjs';
import {editorialMechanicalFamily} from './editorial-mechanical.mjs';
import {editorialTrainFamily} from './editorial-train.mjs';
import {editorialMotorbikeFamily} from './editorial-motorbike.mjs';
import {editorialHarvardFamily} from './editorial-harvard.mjs';
import {editorialIqFamily} from './editorial-iq.mjs';
import {editorialItalianFamily} from './editorial-italian.mjs';
import {editorialMechanicFamily} from './editorial-mechanic.mjs';
import {editorialMemoryFamily} from './editorial-memory.mjs';
import {editorialOxfordFamily} from './editorial-oxford.mjs';
import {editorialPersonalityFamily} from './editorial-personality.mjs';
import {editorialTreatmentsFamily} from './editorial-treatments.mjs';
import {editorialVisionFamily, syncReviewedVisionAlts} from './editorial-vision.mjs';
import {editorialYearsLeftFamily} from './editorial-years-left.mjs';

const aviation = {
  'Lift alone': ['La portance seule','Nur der Auftrieb','Solo la portanza','Alleen de liftkracht','Solo la sustentación','Apenas a sustentação','قوة الرفع وحدها'],
  'Engine thrust': ['La poussée du moteur','Triebwerksschub','La spinta del motore','Stuwkracht van de motor','Empuje del motor','Impulso do motor','دفع المحرك'],
  'Cabin pressure': ['La pression dans la cabine','Kabinendruck','La pressione in cabina','Druk in de cabine','Presión en la cabina','Pressão na cabine','ضغط المقصورة'],
  'A removal of all weight': ['La suppression de tout le poids','Die Aufhebung des gesamten Gewichts','L’annullamento di tutto il peso','Het verdwijnen van al het gewicht','La eliminación de todo el peso','A eliminação de todo o peso','إلغاء الوزن بالكامل'],
  'A propulsive force': ['Une force de propulsion','Eine Antriebskraft','Una forza propulsiva','Een voortstuwende kracht','Una fuerza propulsora','Uma força propulsora','قوة دافعة'],
  'A guarantee of level flight': ['La garantie d’un vol en palier','Eine Garantie für Horizontalflug','La garanzia di un volo livellato','Een garantie op horizontale vlucht','La garantía de un vuelo nivelado','A garantia de um voo nivelado','ضمان الطيران الأفقي'],
  'A replacement for the wings': ['Un remplacement des ailes','Einen Ersatz für die Tragflächen','Un sostituto delle ali','Een vervanging voor de vleugels','Un sustituto de las alas','Um substituto para as asas','بديلًا للأجنحة'],
  'What does engine thrust primarily provide?': ['Que fournit principalement la poussée du moteur ?','Was liefert der Triebwerksschub hauptsächlich?','Che cosa fornisce principalmente la spinta del motore?','Wat levert de stuwkracht van de motor vooral op?','¿Qué proporciona principalmente el empuje del motor?','O que proporciona principalmente o impulso do motor?','ما الذي يوفره دفع المحرك أساسًا؟'],
  'In steady straight-and-level flight at constant speed, how do lift and weight compare?': ['En vol rectiligne et horizontal à vitesse constante, comment se comparent la portance et le poids ?','Wie verhalten sich Auftrieb und Gewicht im stationären horizontalen Geradeausflug bei konstanter Geschwindigkeit?','In un volo rettilineo e livellato a velocità costante, come si confrontano la portanza e il peso?','Hoe verhouden de liftkracht en het gewicht zich tijdens een rechte, horizontale vlucht met constante snelheid?','En un vuelo recto y nivelado a velocidad constante, ¿cómo se comparan la sustentación y el peso?','Num voo reto e nivelado, a velocidade constante, como se comparam a sustentação e o peso?','في طيران مستقيم وأفقي بسرعة ثابتة، كيف تتقارن قوة الرفع مع الوزن؟'],
  'Weight becomes zero': ['Le poids devient nul','Das Gewicht wird null','Il peso diventa zero','Het gewicht wordt nul','El peso se vuelve cero','O peso passa a zero','يصبح الوزن صفرًا'],
  'They act in the same direction': ['Ils agissent dans le même sens','Sie wirken in dieselbe Richtung','Agiscono nella stessa direzione','Ze werken in dezelfde richting','Actúan en la misma dirección','Atuam na mesma direção','تؤثران في الاتجاه نفسه'],
  'They balance': ['Ils s’équilibrent','Sie halten sich die Waage','Si bilanciano','Ze zijn in evenwicht','Se equilibran','Equilibram-se','تتعادلان'],
  'Lift is always twice the weight': ['La portance est toujours égale au double du poids','Der Auftrieb ist immer doppelt so groß wie das Gewicht','La portanza è sempre il doppio del peso','De liftkracht is altijd tweemaal het gewicht','La sustentación siempre es el doble del peso','A sustentação é sempre o dobro do peso','قوة الرفع تساوي دائمًا ضعف الوزن'],
  'What does the word airfoil describe?': ['Que désigne le terme « profil aérodynamique » ?','Was bezeichnet der Begriff „Tragflächenprofil“?','Che cosa indica il termine «profilo alare»?','Wat wordt bedoeld met een vleugelprofiel?','¿Qué describe el término «perfil aerodinámico»?','O que descreve o termo «perfil aerodinâmico»?','ماذا يعني مصطلح المقطع الهوائي للجناح؟'],
  'Only the fuel inside a wing': ['Uniquement le carburant à l’intérieur d’une aile','Nur den Treibstoff in einer Tragfläche','Solo il carburante all’interno di un’ala','Alleen de brandstof in een vleugel','Solo el combustible dentro de un ala','Apenas o combustível dentro de uma asa','الوقود داخل الجناح فقط'],
  'A radio frequency': ['Une fréquence radio','Eine Funkfrequenz','Una frequenza radio','Een radiofrequentie','Una frecuencia de radio','Uma frequência de rádio','ترددًا لاسلكيًا'],
  'Only the rudder': ['Uniquement la gouverne de direction','Nur das Seitenruder','Solo il timone di direzione','Alleen het richtingsroer','Solo el timón de dirección','Apenas o leme de direção','دفة الاتجاه فقط'],
  'The runway contact surface': ['La surface en contact avec la piste','Die Kontaktfläche zur Start- und Landebahn','La superficie a contatto con la pista','Het oppervlak dat de start- en landingsbaan raakt','La superficie en contacto con la pista','A superfície que toca a pista','السطح الذي يلامس المدرج'],
  'The main body': ['Le corps principal','Der zentrale Flugzeugkörper','Il corpo principale','Het hoofdgedeelte van het vliegtuig','El cuerpo principal','O corpo principal','الجزء الرئيسي من جسم الطائرة'],
  'Only the left wing tip': ['Uniquement l’extrémité de l’aile gauche','Nur die linke Flügelspitze','Solo l’estremità dell’ala sinistra','Alleen de linkervleugeltip','Solo la punta del ala izquierda','Apenas a ponta da asa esquerda','طرف الجناح الأيسر فقط'],
  'What is the leading edge of a wing?': ['Qu’est-ce que le bord d’attaque d’une aile ?','Was bezeichnet die Vorderkante eines Flügels?','Che cos’è il bordo d’attacco di un’ala?','Wat is de voorrand van een vleugel?','¿Qué es el borde de ataque de un ala?','O que é o bordo de ataque de uma asa?','ما المقصود بحافة الهجوم في الجناح؟'],
  'Which control surface primarily controls yaw?': ['Quelle gouverne commande principalement le lacet ?','Welche Steuerfläche steuert hauptsächlich das Gieren?','Quale superficie di controllo governa principalmente l’imbardata?','Welk stuurvlak regelt vooral het gieren?','¿Qué superficie de control regula principalmente la guiñada?','Que superfície de comando controla principalmente a guinada?','أي سطح تحكم يضبط أساسًا حركة الانعراج؟'],
  'The aircraft rotating around its nose-to-tail axis': ['L’avion tourne autour de son axe longitudinal, du nez à la queue','Das Flugzeug dreht sich um seine Längsachse vom Bug zum Heck','L’aereo ruota attorno al suo asse longitudinale, dal muso alla coda','Het vliegtuig draait om zijn lengteas, van neus tot staart','El avión gira alrededor de su eje longitudinal, del morro a la cola','A aeronave roda em torno do eixo longitudinal, do nariz à cauda','دوران الطائرة حول محورها الطولي الممتد من المقدمة إلى الذيل'],
  'The nose rotating left or right': [null,null,'Il muso ruota a sinistra o a destra',null,'El morro gira hacia la izquierda o hacia la derecha','O nariz da aeronave roda para a esquerda ou para a direita','دوران مقدمة الطائرة إلى اليسار أو اليمين'],
  'The nose rotating up or down': [null,null,'Il muso ruota verso l’alto o verso il basso',null,'El morro gira hacia arriba o hacia abajo','O nariz da aeronave roda para cima ou para baixo',null],
  'A change in cabin pressure only': ['Uniquement un changement de pression dans la cabine',null,null,null,null,null,'تغيّر في ضغط المقصورة فقط'],
  'What is roll motion?': [null,null,null,null,null,null,'ما المقصود بحركة تدحرج الطائرة؟'],
  'Rotation around the nose-to-tail axis': ['Une rotation autour de l’axe longitudinal, du nez à la queue','Drehung um die Längsachse vom Bug zum Heck','Rotazione attorno all’asse longitudinale, dal muso alla coda','Een draaiing om de lengteas, van neus tot staart','Rotación alrededor del eje longitudinal, del morro a la cola','Rotação em torno do eixo longitudinal, do nariz à cauda','الدوران حول المحور الطولي الممتد من المقدمة إلى الذيل'],
  'Straight upward movement only': ['Uniquement un déplacement en ligne droite vers le haut','Nur eine geradlinige Bewegung nach oben','Solo un movimento in linea retta verso l’alto','Alleen een beweging recht omhoog','Solo un movimiento en línea recta hacia arriba','Apenas um movimento em linha reta para cima','حركة في خط مستقيم إلى أعلى فقط'],
  'The nose rotating upward only': [null,null,'Il muso ruota solo verso l’alto',null,'El morro gira solo hacia arriba','O nariz da aeronave roda apenas para cima','دوران مقدمة الطائرة إلى أعلى فقط'],
  'The wings banking around the nose-to-tail axis': ['L’avion s’incline autour de son axe longitudinal','Das Flugzeug rollt um seine Längsachse','L’aereo compie un rollio attorno al proprio asse longitudinale','Het vliegtuig kantelt om zijn lengteas','El avión se inclina alrededor de su eje longitudinal','A aeronave roda lateralmente em torno do eixo longitudinal','ميل الطائرة حول محورها الطولي'],
  'The nose rotating left or right around the vertical axis': ['Le nez pivote à gauche ou à droite autour de l’axe vertical',null,'Il muso ruota a sinistra o a destra attorno all’asse verticale',null,'El morro gira a la izquierda o a la derecha alrededor del eje vertical','O nariz da aeronave roda para a esquerda ou para a direita em torno do eixo vertical','دوران مقدمة الطائرة إلى اليسار أو اليمين حول المحور العمودي'],
  'A wheel turning on the ground only': [null,'Ein Rad dreht sich auf dem Boden',null,null,null,'Uma roda gira no solo','دوران عجلة على الأرض فقط'],
  'The aircraft’s registration': [null,'Das Kennzeichen des Flugzeugs','L’immatricolazione dell’aereo','Het registratieteken van het vliegtuig',null,null,'رقم تسجيل الطائرة'],
  'Attitude indicator': ['Horizon artificiel','Künstlicher Horizont','Orizzonte artificiale','Kunstmatige horizon',null,'Indicador de atitude (horizonte artificial)','مؤشر وضعية الطائرة (الأفق الاصطناعي)'],
  'What does a pressure altimeter use to estimate altitude?': ['Qu’utilise un altimètre barométrique pour estimer l’altitude ?',null,null,null,null,null,'ما الذي يستخدمه مقياس الارتفاع البارومتري لتقدير الارتفاع؟'],
  'Engine oil quantity': [null,null,'Quantità di olio motore',null,null,null,null],
  'Fuel temperature': [null,null,null,'Brandstoftemperatuur',null,null,null],
  'It controls the wind speed': ['Il contrôle la vitesse du vent','Sie steuert die Windgeschwindigkeit',null,'De instelling regelt de windsnelheid',null,'Controla a velocidade do vento','يتحكم في سرعة الرياح'],
  'It changes the aircraft’s actual mass': ['Il modifie la masse réelle de l’avion','Sie verändert die tatsächliche Masse des Flugzeugs',null,'De instelling verandert de werkelijke massa van het vliegtuig',null,null,'يغيّر الكتلة الفعلية للطائرة'],
  'It replaces all navigation checks': [null,'Sie ersetzt alle Navigationsprüfungen',null,'De instelling vervangt alle navigatiecontroles',null,null,'يحل محل جميع عمليات التحقق الملاحية'],
  'It affects the indicated altitude': ['Il modifie l’altitude indiquée','Sie beeinflusst die angezeigte Höhe',null,'De instelling beïnvloedt de aangegeven hoogte',null,null,'يؤثر في الارتفاع المعروض'],
  'Speed relative to the surrounding air, subject to instrument and pressure effects': ['La vitesse par rapport à l’air, avec des écarts possibles liés à l’instrument et à la pression','Die Geschwindigkeit gegenüber der Luft, mit möglichen Abweichungen durch das Instrument und die Druckverhältnisse','La velocità rispetto all’aria, con possibili scostamenti dovuti allo strumento e alla pressione','De snelheid ten opzichte van de lucht, met mogelijke afwijkingen door het instrument en de luchtdruk','La velocidad respecto al aire, con posibles desviaciones debidas al instrumento y a la presión','A velocidade em relação ao ar, com possíveis desvios devidos ao instrumento e à pressão','السرعة بالنسبة إلى الهواء، مع احتمال وجود فروق في القياس بسبب الجهاز والضغط'],
  'What does a vertical speed indicator indicate?': ['Qu’indique un variomètre ?','Was zeigt ein Variometer an?','Che cosa indica un variometro?',null,null,null,'ما الذي يبيّنه مؤشر السرعة العمودية؟'],
  'Fuel remaining': [null,'Verbleibender Kraftstoff',null,null,null,null,null],
  'Rate of climb or descent': [null,null,null,'Stijg- of daalsnelheid',null,null,null],
  'Total distance flown': [null,null,null,'De totale gevlogen afstand',null,null,null],
  'Airspeed indicator': ['Anémomètre','Fahrtmesser','Anemometro',null,'Indicador de velocidad aérea',null,null],
  'Magnetic compass': ['Compas magnétique',null,null,null,'Brújula magnética',null,null],
  'What does a fuel quantity indication tell a pilot?': ['Quelle information la jauge de carburant fournit-elle au pilote ?','Welche Information liefert die Kraftstoffmengenanzeige dem Piloten?','Quale informazione fornisce al pilota l’indicatore della quantità di carburante?','Welke informatie geeft de brandstofmeter aan een piloot?','¿Qué información proporciona al piloto el indicador de cantidad de combustible?','Que informação fornece ao piloto o indicador da quantidade de combustível?',null],
  'The indicated amount of fuel remaining': [null,null,null,null,null,null,'كمية الوقود المتبقية التي يعرضها المؤشر'],
  'The direction of a crosswind': [null,null,null,null,null,null,'اتجاه الرياح الجانبية'],
  'The exact time of every future landing': [null,null,null,null,null,'A hora exata de todas as futuras aterragens (pousos)',null],
  'A heading of 090° points approximately in which direction?': ['Dans quelle direction un cap de 090° pointe-t-il approximativement ?','In welche Richtung zeigt ein Steuerkurs von 090° ungefähr?','A quale direzione corrisponde all’incirca una prua di 090°?','Welke richting hoort ongeveer bij een koers van 090°?','¿En qué dirección apunta aproximadamente un rumbo de 090°?',null,'إلى أي جهة يشير الاتجاه 090° تقريبًا؟'],
  'A heading of 180° points approximately in which direction?': ['Dans quelle direction un cap de 180° pointe-t-il approximativement ?','In welche Richtung zeigt ein Steuerkurs von 180° ungefähr?','A quale direzione corrisponde all’incirca una prua di 180°?','Welke richting hoort ongeveer bij een koers van 180°?','¿En qué dirección apunta aproximadamente un rumbo de 180°?',null,'إلى أي جهة يشير الاتجاه 180° تقريبًا؟'],
  'A heading of 270° points approximately in which direction?': ['Dans quelle direction un cap de 270° pointe-t-il approximativement ?','In welche Richtung zeigt ein Steuerkurs von 270° ungefähr?','A quale direzione corrisponde all’incirca una prua di 270°?','Welke richting hoort ongeveer bij een koers van 270°?','¿En qué dirección apunta aproximadamente un rumbo de 270°?',null,'إلى أي جهة يشير الاتجاه 270° تقريبًا؟'],
  'A quarter-turn clockwise from north points where?': ['Face au nord, vers quelle direction se retrouve-t-on après un quart de tour dans le sens des aiguilles d’une montre ?','Welche Richtung ergibt sich nach einer Vierteldrehung im Uhrzeigersinn ausgehend von Norden?','Guardando verso nord, verso quale direzione ci si trova dopo un quarto di giro in senso orario?','Je kijkt naar het noorden en draait een kwartslag met de klok mee. In welke richting kijk je nu?','Si miras al norte y giras un cuarto de vuelta en el sentido de las agujas del reloj, ¿hacia dónde miras?','Ao olhar para norte e dar um quarto de volta no sentido dos ponteiros do relógio, para que direção passa a olhar?','إذا كنت تواجه الشمال واستدرت ربع دورة مع عقارب الساعة، فأي جهة ستواجه؟'],
  'A half-turn from east points where?': ['Face à l’est, vers quelle direction se retrouve-t-on après un demi-tour ?','Welche Richtung ergibt sich nach einer halben Drehung ausgehend von Osten?','Guardando verso est, verso quale direzione ci si trova dopo mezzo giro?','Je kijkt naar het oosten en maakt een halve draai. In welke richting kijk je nu?','Si miras al este y das media vuelta, ¿hacia dónde miras?','Ao olhar para leste e dar meia volta, para que direção passa a olhar?','إذا كنت تواجه الشرق واستدرت نصف دورة، فأي جهة ستواجه؟'],
  'An aircraft points south. Which direction is on its right?': [null,'Ein Flugzeug zeigt mit der Nase nach Süden. Welche Himmelsrichtung liegt auf seiner rechten Seite?',null,'Een vliegtuig wijst met zijn neus naar het zuiden. Welke richting ligt aan zijn rechterkant?',null,null,'تتجه مقدمة طائرة نحو الجنوب. أي جهة تقع على يمين الطائرة؟'],
  'A map is drawn with north at the top. Which direction runs toward its lower left corner?': ['Sur une carte, le nord est en haut. Quelle direction correspond au coin inférieur gauche ?','Auf einer Karte ist Norden oben. Welche Himmelsrichtung liegt in der unteren linken Ecke?','Su una mappa il nord è in alto. Quale direzione corrisponde all’angolo in basso a sinistra?','Op een kaart staat het noorden bovenaan. Welke richting hoort bij de linkerbenedenhoek?','En un mapa con el norte arriba, ¿qué dirección corresponde a la esquina inferior izquierda?','Num mapa com o norte no topo, que direção corresponde ao canto inferior esquerdo?','على خريطة يكون فيها الشمال في الأعلى، أي جهة تقابل الزاوية السفلية اليسرى؟'],
  'North': [null,null,null,null,'Norte',null,null],
  'East': [null,null,null,null,'Este',null,null],
  'Southwest': [null,null,null,null,'Suroeste',null,null],
  'Northeast': [null,null,null,null,null,null,'الشمال الشرقي'],
  'Northwest': [null,null,null,null,null,null,'الشمال الغربي'],
  'Southeast': [null,null,null,null,null,null,'الجنوب الشرقي'],
  'Pitch angle': ['Angle de tangage',null,'Angolo di beccheggio','Stamphoek','Ángulo de cabeceo','Ângulo de arfagem',null],
  'What is groundspeed?': [null,'Was ist die Geschwindigkeit über Grund?',null,null,'¿Qué es la velocidad respecto al suelo?','O que é a velocidade em relação ao solo?',null],
  'With true airspeed unchanged, what does a direct headwind do to groundspeed?': ['À vitesse vraie par rapport à l’air constante, quel effet un vent de face a-t-il sur la vitesse sol ?','Wie wirkt sich Gegenwind direkt von vorn auf die Geschwindigkeit über Grund aus, wenn die wahre Geschwindigkeit gegenüber der Luft gleich bleibt?','Se la velocità vera rispetto all’aria resta costante, che effetto ha un vento frontale sulla velocità al suolo?',null,'Si la velocidad verdadera respecto al aire no cambia, ¿qué efecto tiene un viento de frente sobre la velocidad respecto al suelo?','Mantendo a velocidade real em relação ao ar, que efeito tem um vento de frente sobre a velocidade em relação ao solo?','إذا بقيت السرعة الجوية الحقيقية ثابتة، فما تأثير الرياح الأمامية المباشرة في السرعة بالنسبة إلى الأرض؟'],
  'Always doubles it': ['Il la double toujours','Er verdoppelt sie immer','La raddoppia sempre','Verdubbelt de grondsnelheid altijd','Siempre la duplica','Duplica sempre essa velocidade','تضاعفها دائمًا'],
  'Leaves it unchanged': ['Il la laisse inchangée','Er lässt sie unverändert','La lascia invariata','Laat de grondsnelheid ongewijzigd','La deja igual','Mantém essa velocidade','تبقيها كما هي'],
  'Reduces it': ['Il la réduit','Er verringert sie','La riduce','Verlaagt de grondsnelheid','La reduce','Reduz essa velocidade','تقللها'],
  'Makes lift impossible': ['Il empêche toute portance','Er macht Auftrieb unmöglich','Rende impossibile la portanza','Maakt liftkracht onmogelijk','Hace imposible la sustentación','Torna a sustentação impossível','تجعل توليد قوة الرفع مستحيلًا'],
  'With true airspeed unchanged, what does a direct tailwind do to groundspeed?': ['À vitesse vraie par rapport à l’air constante, quel effet un vent arrière a-t-il sur la vitesse sol ?','Wie wirkt sich Rückenwind direkt von hinten auf die Geschwindigkeit über Grund aus, wenn die wahre Geschwindigkeit gegenüber der Luft gleich bleibt?','Se la velocità vera rispetto all’aria resta costante, che effetto ha un vento di coda sulla velocità al suolo?',null,'Si la velocidad verdadera respecto al aire no cambia, ¿qué efecto tiene un viento de cola sobre la velocidad respecto al suelo?','Mantendo a velocidade real em relação ao ar, que efeito tem um vento de cauda sobre a velocidade em relação ao solo?','إذا بقيت السرعة الجوية الحقيقية ثابتة، فما تأثير الرياح الخلفية المباشرة في السرعة بالنسبة إلى الأرض؟'],
  'Always halves it': ['Il la divise toujours par deux','Er halbiert sie immer','La dimezza sempre','Halveert de grondsnelheid altijd','Siempre la reduce a la mitad','Reduz sempre essa velocidade para metade','تقللها دائمًا إلى النصف'],
  'Makes it zero': ['Il la rend nulle','Er verringert sie auf null','La annulla','Brengt de grondsnelheid terug tot nul','La reduce a cero','Reduz essa velocidade a zero','تجعلها صفرًا'],
  'Changes only the altimeter setting': [null,null,null,null,null,null,'تغيّر إعداد مقياس الارتفاع فقط'],
  'What is an aircraft’s ground track?': [null,'Was ist mit dem Flugweg eines Flugzeugs über Grund gemeint?',null,null,'¿Qué es la trayectoria de un avión respecto al suelo?','O que é a trajetória de uma aeronave em relação ao solo?',null],
  'The direction its nose must always point': ['La direction dans laquelle son nez doit toujours pointer',null,'La direzione in cui deve sempre puntare il muso',null,'La dirección hacia la que siempre debe apuntar su morro','A direção para a qual o nariz da aeronave deve sempre apontar','الاتجاه الذي يجب أن تشير إليه مقدمة الطائرة دائمًا'],
  'The line of its wing chord': [null,null,null,'De lijn van de vleugelkoorde',null,'A linha da corda da asa',null],
  'The shape of a tyre': [null,null,null,null,null,null,'شكل الإطار'],
  'Its path over the ground': ['Sa trajectoire par rapport au sol','Sein Weg über Grund',null,'Zijn afgelegde pad ten opzichte van de grond','La trayectoria que sigue respecto al suelo',null,null],
  'Why can heading and ground track differ?': [null,'Warum können Steuerkurs und Kurs über Grund voneinander abweichen?','Perché la prua e la rotta al suolo possono differire?',null,'¿Por qué pueden diferir el rumbo y la trayectoria respecto al suelo?',null,'لماذا قد يختلف اتجاه مقدمة الطائرة عن مسارها بالنسبة إلى الأرض؟'],
  'Aircraft cannot travel sideways relative to their heading': ['Les avions ne peuvent pas se déplacer latéralement par rapport à leur cap','Flugzeuge können sich nicht seitlich zu ihrem Steuerkurs bewegen','Gli aerei non possono spostarsi lateralmente rispetto alla direzione della prua','Vliegtuigen kunnen niet zijwaarts bewegen ten opzichte van hun koers','Los aviones no pueden desplazarse lateralmente respecto a su rumbo','As aeronaves não podem deslocar-se lateralmente em relação ao rumo',null],
  'Position east or west of the prime meridian': ['La position à l’est ou à l’ouest du méridien de Greenwich',null,null,null,'La posición al este o al oeste del meridiano de Greenwich','A posição a leste ou a oeste do meridiano de Greenwich','الموقع شرق خط غرينتش أو غربه'],
  'What is angle of attack?': [null,null,null,'Wat is de invalshoek van een vleugel?',null,null,null],
  'The slope of the cabin floor alone': ['Uniquement l’inclinaison du plancher de la cabine',null,null,'Alleen de helling van de cabinevloer',null,null,'ميل أرضية المقصورة فقط'],
  'The angle between the wing’s chord line and the relative airflow': [null,null,'L’angolo tra la corda alare e il flusso d’aria relativo',null,null,null,null],
  'An aerodynamic stall occurs when a wing exceeds what?': ['Quelle limite une aile dépasse-t-elle lors d’un décrochage aérodynamique ?','Welche Grenze wird bei einem Strömungsabriss am Flügel überschritten?','Quale limite supera un’ala quando entra in stallo?','Welke grens overschrijdt een vleugel bij overtrekken?','¿Qué límite supera un ala cuando entra en pérdida aerodinámica?','Que limite ultrapassa uma asa ao entrar em perda de sustentação (estol)?','عند تجاوز أيّ حد يتعرض الجناح لفقدان الرفع (الانهيار الهوائي)؟'],
  'Its critical angle of attack': [null,'Der kritische Anstellwinkel',null,'De kritische invalshoek',null,'O ângulo de ataque crítico','زاوية الهجوم الحرجة'],
  'One universal altitude': ['Une altitude limite identique pour tous les avions','Eine für alle Flugzeuge gleiche Höhengrenze','Un unico limite di altitudine valido per tutti gli aerei','Eén hoogtegrens die voor alle vliegtuigen geldt','Un único límite de altitud para todos los aviones','Uma altitude limite igual para todas as aeronaves','ارتفاع محدد واحد ينطبق على جميع الطائرات'],
  'One universal engine speed': ['Un régime moteur limite identique pour tous les avions','Eine für alle Flugzeuge gleiche Motordrehzahlgrenze','Un unico limite di giri del motore valido per tutti gli aerei','Eén motortoerental dat voor alle vliegtuigen geldt','Un único límite de revoluciones del motor para todos los aviones','Uma rotação limite do motor igual para todas as aeronaves','سرعة دوران محددة للمحرك تنطبق على جميع الطائرات'],
  'What is the chord line of an airfoil?': [null,null,null,null,null,'O que é a corda de um perfil aerodinâmico?','ما المقصود بخط الوتر في المقطع الهوائي للجناح؟'],
  'The height of the tail above the ground': ['La hauteur de la queue au-dessus du sol','Die Höhe des Hecks über dem Boden',null,null,null,null,null],
  'The route drawn on a map': [null,null,null,null,null,null,'المسار المرسوم على الخريطة'],
  'The line between the two engines': ['La ligne entre les deux moteurs',null,null,null,null,null,null],
  'A straight line from its leading edge to its trailing edge': [null,null,'Una linea retta dal bordo d’attacco al bordo d’uscita',null,null,'Uma linha reta do bordo de ataque ao bordo de fuga','خط مستقيم من حافة الهجوم إلى الحافة الخلفية'],
  'What does subsonic mean?': [null,null,null,null,null,'O que significa «subsónico» (ou «subsônico»)?',null],
  'It removes the need for fuel': [null,'Er macht Kraftstoff überflüssig',null,'Het maakt brandstof overbodig',null,null,null],
  'It makes the aircraft weightless': ['Il rend l’avion en apesanteur','Er macht das Flugzeug schwerelos',null,null,null,'Torna a aeronave sem peso',null],
  'It affects aircraft stability and control': ['Il influence la stabilité et la maniabilité de l’avion','Er beeinflusst die Stabilität und Steuerbarkeit des Flugzeugs',null,'Het beïnvloedt de stabiliteit en bestuurbaarheid van het vliegtuig',null,'Afeta a estabilidade e a capacidade de controlar a aeronave','يؤثر في استقرار الطائرة والتحكم بها'],
  'It eliminates all drag': [null,'Er beseitigt den gesamten Luftwiderstand',null,null,'Elimina toda la resistencia aerodinámica',null,'يلغي مقاومة الهواء بالكامل'],
  'At the same true airspeed, what does greater air density do to dynamic pressure?': ['À vitesse vraie par rapport à l’air constante, quel effet une plus grande densité de l’air a-t-elle sur la pression dynamique ?',null,'A parità di velocità vera rispetto all’aria, che effetto ha una maggiore densità dell’aria sulla pressione dinamica?',null,'A la misma velocidad verdadera respecto al aire, ¿qué efecto tiene una mayor densidad del aire sobre la presión dinámica?','Mantendo a velocidade real em relação ao ar, que efeito tem uma maior densidade do ar sobre a pressão dinâmica?',null],
  'Changes only the compass heading': [null,null,null,null,null,null,'تغيّر اتجاه البوصلة فقط'],
  'Decreases it': ['Elle la diminue','Sie verringert ihn','La riduce','Verlaagt de dynamische druk','La reduce','Reduz essa pressão','تقلل الضغط الديناميكي'],
  'Makes it exactly zero': ['Elle la rend exactement nulle','Sie senkt ihn auf genau null','La porta esattamente a zero','Brengt de dynamische druk terug tot precies nul','La reduce exactamente a cero','Reduz essa pressão exatamente a zero','تجعل الضغط الديناميكي يساوي صفرًا تمامًا'],
  'Compared with cooler air at the same pressure, warmer air is generally what?': ['À pression égale, comment l’air chaud se compare-t-il généralement à l’air froid ?','Welche Eigenschaft hat wärmere Luft im Vergleich zu kühlerer Luft bei gleichem Druck?','A parità di pressione, com’è generalmente l’aria più calda rispetto a quella più fredda?','Hoe verschilt warmere lucht doorgaans van koelere lucht bij dezelfde druk?','A la misma presión, ¿cómo suele ser el aire más cálido en comparación con el más frío?','À mesma pressão, como é geralmente o ar mais quente em comparação com o ar mais frio?','عند تساوي الضغط، كيف يختلف الهواء الدافئ عمومًا عن الهواء البارد؟'],
  'More dense': [null,null,'Più densa',null,'Más denso',null,null],
  'Less dense': [null,null,'Meno densa',null,'Menos denso',null,null],
  'Unable to exert pressure': [null,null,null,null,'Incapaz de ejercer presión',null,'غير قادر على إحداث ضغط'],
  'Always the same density': ['Il a toujours la même densité','Sie hat immer die gleiche Dichte','Ha sempre la stessa densità','Heeft altijd dezelfde dichtheid','Siempre tiene la misma densidad','Tem sempre a mesma densidade','له دائمًا الكثافة نفسها'],
  'An informed prediction that must be checked as conditions change': ['Une prévision fondée sur des données, à vérifier au fil de l’évolution des conditions',null,'Una previsione basata su dati, da verificare man mano che cambiano le condizioni',null,'Una predicción basada en datos que debe revisarse a medida que cambian las condiciones','Uma previsão baseada em dados, que deve ser revista à medida que as condições mudam','توقع مبني على معلومات، يجب مراجعته كلما تغيرت الظروف'],
  'A guarantee of exact future conditions': [null,'Eine Garantie für den genauen künftigen Wetterverlauf',null,null,null,null,'ضمان بأن الأحوال المستقبلية ستطابق التوقعات تمامًا'],
  'A replacement for flight planning': ['Un substitut à la préparation du vol',null,null,null,null,'Um substituto da preparação do voo',null],
  'What does reported visibility concern?': ['À quoi correspond la visibilité annoncée dans un bulletin météo ?','Worauf bezieht sich die gemeldete Sichtweite?','A che cosa si riferisce la visibilità riportata nel bollettino meteo?','Wat betekent de gemelde zichtafstand?','¿A qué se refiere la visibilidad indicada en un informe meteorológico?','A que se refere a visibilidade indicada num boletim meteorológico?','ما المقصود بمدى الرؤية الوارد في تقرير الطقس؟'],
  'How far suitable objects can be seen and identified': ['La distance à laquelle on peut voir et identifier des objets servant de repères','Die Entfernung, aus der geeignete Objekte gesehen und erkannt werden können','La distanza alla quale si possono vedere e identificare oggetti di riferimento','De afstand waarop geschikte herkenningspunten zichtbaar en herkenbaar zijn','La distancia a la que se pueden ver e identificar objetos de referencia','A distância a que é possível ver e identificar objetos de referência','المسافة التي يمكن عندها رؤية أجسام مناسبة للاستدلال وتمييزها'],
  'It improves every control response': ['Elle améliore toutes les réactions aux commandes','Es verbessert jede Reaktion auf Steuereingaben','Migliora ogni risposta ai comandi','Het verbetert elke reactie op stuurbewegingen','Mejora todas las respuestas a los mandos','Melhora todas as respostas aos comandos','يحسّن جميع استجابات الطائرة لأوامر التحكم'],
  'It always increases lift without drag': ['Elle augmente toujours la portance sans créer de traînée',null,null,null,'Siempre aumenta la sustentación sin generar resistencia aerodinámica',null,null],
  'It can change airflow and reduce performance': ['Elle peut modifier l’écoulement de l’air et réduire les performances',null,null,null,null,null,null],
  'They affect aircraft only on the ground': [null,null,null,null,null,'Só afetam aeronaves no solo','تؤثر في الطائرات على الأرض فقط'],
  'They guarantee smooth air beneath them': ['Ils garantissent l’absence de turbulences sous eux','Sie garantieren turbulenzfreie Luft unter sich','Garantiscono aria priva di turbolenze al di sotto','Ze garanderen turbulentieloze lucht eronder','Garantizan aire sin turbulencias debajo de ellas','Garantem ar sem turbulência por baixo','تضمن هواءً خاليًا من الاضطرابات تحتها'],
  'They are harmless without visible lightning': [null,null,null,null,'Son inofensivas si no se ven rayos','São inofensivas se não houver relâmpagos visíveis','لا تشكل خطرًا إذا لم يكن البرق مرئيًا'],
  'What is a crosswind?': [null,null,null,null,null,null,'ما المقصود بالرياح الجانبية؟'],
  'Wind with a component across the direction of travel': ['Un vent dont une composante souffle perpendiculairement à la direction du déplacement','Wind mit einer Komponente quer zur Flugrichtung','Vento con una componente trasversale alla direzione di volo','Wind met een component dwars op de vliegrichting',null,null,'رياح لها مركبة عرضية على اتجاه حركة الطائرة'],
  'Wind blowing only vertically': [null,'Wind, der nur senkrecht weht',null,'Wind die alleen verticaal waait',null,'Vento que sopra apenas na vertical','رياح تهب عموديًا فقط'],
  'What is turbulence?': ['Que sont les turbulences ?',null,null,null,null,null,'ما المقصود بالمطبات الهوائية؟'],
  'A change in the aircraft registration': ['Un changement d’immatriculation de l’avion','Eine Änderung des Flugzeugkennzeichens','Un cambiamento nell’immatricolazione dell’aereo',null,'Un cambio en la matrícula de la aeronave',null,'تغيّر في رقم تسجيل الطائرة'],
  'What is wind shear?': [null,null,'Che cos’è il wind shear, o gradiente del vento?',null,null,'O que é o cisalhamento (corte) do vento?',null],
  'A flight leg takes 40 minutes and the next takes 55 minutes. What is the combined time?': [null,'Ein Flugabschnitt dauert 40 Minuten, der nächste 55 Minuten. Wie lange dauern beide zusammen?','Una tratta di volo dura 40 minuti e la successiva 55 minuti. Qual è la durata totale?','Een deel van een vlucht duurt 40 minuten en het volgende deel 55 minuten. Hoe lang duren ze samen?','Un tramo de vuelo dura 40 minutos y el siguiente 55 minutos. ¿Cuánto duran en total?','Um trecho de voo dura 40 minutos e o seguinte 55 minutos. Qual é a duração total?','تستغرق مرحلة من الرحلة 40 دقيقة، والمرحلة التالية 55 دقيقة. ما المدة الإجمالية؟'],
  'A tank contains 90 L. A calculation predicts 35 L used on a leg. How much remains?': ['Un réservoir contient 90 L. La consommation prévue pour une étape du vol est de 35 L. Combien restera-t-il ?','Ein Tank enthält 90 Liter. Für einen Flugabschnitt ist ein Verbrauch von 35 Litern berechnet. Wie viel bleibt übrig?','Un serbatoio contiene 90 L. Il consumo previsto per una tratta di volo è di 35 L. Quanto ne rimane?','Een tank bevat 90 liter. Voor een deel van de vlucht is een verbruik van 35 liter berekend. Hoeveel blijft er over?','Un tanque contiene 90 L. Se calcula un consumo de 35 L en un tramo del vuelo. ¿Cuánto queda?',null,'يحتوي خزان على 90 لترًا. يُتوقع استهلاك 35 لترًا في مرحلة من الرحلة. كم يتبقى؟'],
  'A schedule uses UTC throughout. Departure is 10:45 and flight time is 2 hours 20 minutes. What is arrival time?': ['Tous les horaires sont en UTC. Le départ est à 10 h 45 et le vol dure 2 heures 20 minutes. À quelle heure arrive-t-on ?',null,'Tutti gli orari sono in UTC. La partenza è alle 10:45 e il volo dura 2 ore e 20 minuti. Qual è l’orario di arrivo?','Alle tijden staan in UTC. Het vertrek is om 10:45 en de vlucht duurt 2 uur en 20 minuten. Wat is de aankomsttijd?',null,null,'جميع الأوقات بالتوقيت العالمي المنسق (UTC). موعد المغادرة 10:45 وتستغرق الرحلة ساعتين و20 دقيقة. ما موعد الوصول؟'],
  'A loading example has 300 kg plus 2 loads of 45 kg each. What is the combined mass?': ['On ajoute deux charges de 45 kg chacune à un chargement de 300 kg. Quelle est la masse totale ?','Zu einer Ladung von 300 kg kommen zwei weitere Ladungen von je 45 kg hinzu. Wie groß ist die Gesamtmasse?','A un carico di 300 kg si aggiungono due carichi da 45 kg ciascuno. Qual è la massa totale?','Bij een lading van 300 kg komen twee ladingen van elk 45 kg. Wat is de totale massa?','A una carga de 300 kg se añaden dos cargas de 45 kg cada una. ¿Cuál es la masa total?','A uma carga de 300 kg juntam-se duas cargas de 45 kg cada. Qual é a massa total?','تُضاف حمولتان، كتلة كل منهما 45 كجم، إلى حمولة كتلتها 300 كجم. ما الكتلة الإجمالية؟'],
  'To avoid monitoring conditions': ['Pour éviter de surveiller les conditions','Um die Bedingungen nicht überwachen zu müssen','Per evitare di monitorare le condizioni','Om de omstandigheden niet te hoeven volgen','Para evitar vigilar las condiciones','Para evitar acompanhar as condições','لتجنب مراقبة الظروف'],
  'To replace training entirely': [null,'Um die Ausbildung vollständig zu ersetzen',null,null,null,null,'ليحل محل التدريب تمامًا'],
  'To support consistent completion of required steps': ['Pour aider à effectuer toutes les étapes nécessaires à chaque fois','Um die erforderlichen Schritte jedes Mal vollständig auszuführen','Per aiutare a completare ogni volta tutti i passaggi necessari','Om alle vereiste stappen steeds volledig uit te voeren','Para ayudar a completar todos los pasos necesarios en cada ocasión','Para ajudar a cumprir todos os passos necessários em cada ocasião','للمساعدة على إتمام جميع الخطوات المطلوبة في كل مرة'],
  'Knowing only the destination name': [null,'Nur den Namen des Ziels kennen',null,null,null,null,null],
  'Watching one instrument and ignoring everything else': [null,null,null,null,null,'Observar um único instrumento e ignorar tudo o resto',null],
  'Remembering one old forecast': [null,'Sich an eine alte Vorhersage erinnern','Ricordare una vecchia previsione','Zich één oude voorspelling herinneren','Recordar un pronóstico antiguo',null,'تذكّر توقع قديم واحد'],
  'A plan relied on conditions that have now changed. What is needed?': [null,'Ein Plan beruhte auf Bedingungen, die sich inzwischen geändert haben. Was ist jetzt nötig?',null,null,null,null,null],
  'Ignore the change if arrival is important': [null,'Die Änderung ignorieren, wenn die Ankunft wichtig ist','Ignorare il cambiamento se arrivare è importante',null,'Ignorar el cambio si llegar es importante','Ignorar a mudança se chegar for importante',null],
  'Continue only because time has already been spent': ['Continuer uniquement parce qu’on y a déjà consacré du temps','Nur deshalb weitermachen, weil bereits Zeit investiert wurde','Continuare solo perché si è già investito del tempo','Alleen doorgaan omdat er al tijd in is gestoken','Continuar solo porque ya se ha invertido tiempo','Continuar apenas porque já se investiu tempo','استمر فقط لأنك استغرقت وقتًا بالفعل'],
  'Reassess the plan using current information': [null,'Den Plan anhand aktueller Informationen neu bewerten',null,null,null,null,'أعد تقييم الخطة باستخدام المعلومات الحالية'],
  'Use the oldest available information': [null,'Die ältesten verfügbaren Informationen verwenden','Usare le informazioni più vecchie disponibili',null,'Usar la información más antigua disponible','Usar as informações mais antigas disponíveis',null],
  'Why is fatigue relevant to aviation decisions?': ['Pourquoi faut-il tenir compte de la fatigue dans les décisions liées au vol ?','Warum muss Müdigkeit bei Entscheidungen in der Luftfahrt berücksichtigt werden?','Perché bisogna tenere conto della stanchezza nelle decisioni relative al volo?','Waarom moet je bij beslissingen over een vlucht rekening houden met vermoeidheid?','¿Por qué hay que tener en cuenta la fatiga al tomar decisiones sobre un vuelo?','Por que é importante considerar a fadiga nas decisões relacionadas com um voo?','لماذا يجب مراعاة الإرهاق عند اتخاذ قرارات تتعلق بالطيران؟'],
  'It can impair attention and judgement': ['Elle peut altérer l’attention et le jugement','Sie kann die Aufmerksamkeit und das Urteilsvermögen beeinträchtigen',null,null,null,null,'قد يضعف الانتباه والقدرة على تقدير الأمور'],
  'It affects only passengers': ['Elle ne touche que les passagers','Sie betrifft nur Passagiere',null,null,null,null,null],
  'It removes the need for rest': ['Elle supprime le besoin de repos','Sie beseitigt das Bedürfnis nach Ruhe',null,null,null,null,null],
  'It guarantees faster reactions': ['Elle garantit des réactions plus rapides','Sie garantiert schnellere Reaktionen',null,null,null,null,'يضمن ردود فعل أسرع'],
  'The original promise regardless of conditions': [null,null,null,'De oorspronkelijke belofte, ongeacht de omstandigheden',null,null,null],
  'The actual conditions and applicable operating limits': [null,null,null,'De werkelijke omstandigheden en de geldende operationele limieten',null,null,null],
  'Cover the warning to reduce distraction': ['Masquer l’alerte pour réduire la distraction','Die Warnanzeige abdecken, um weniger abgelenkt zu werden','Coprire l’avviso per ridurre la distrazione',null,'Tapar la advertencia para reducir la distracción','Tapar o aviso para reduzir a distração',null],
  'Use the applicable procedure to assess the discrepancy': [null,'Die Abweichung anhand des geltenden Verfahrens prüfen',null,null,'Usar el procedimiento aplicable para evaluar la discrepancia','Usar o procedimento aplicável para avaliar a discrepância',null],
  'Choose whichever indication is more reassuring': ['Choisir l’indication la plus rassurante','Die Anzeige wählen, die beruhigender wirkt','Scegliere l’indicazione più rassicurante',null,'Elegir la indicación más tranquilizadora','Escolher a indicação mais tranquilizadora',null],
  'Assume warnings can never be correct': [null,'Davon ausgehen, dass Warnungen niemals zutreffen können','Presumere che gli avvisi non possano mai essere corretti',null,'Suponer que las advertencias nunca pueden ser correctas','Supor que os avisos nunca podem estar corretos',null],
  'They make fuel planning unnecessary': ['Elles rendent inutile la planification du carburant',null,null,null,null,'Tornam desnecessário calcular as necessidades de combustível',null],
  'A planned destination is always unavailable': [null,'Ein geplantes Ziel steht niemals zur Verfügung','Una destinazione pianificata non è mai disponibile','Een geplande bestemming is nooit beschikbaar','El destino previsto nunca está disponible',null,null],
};

const communication = {
  'An important instruction is unclear. What is the best response?': [null,'Eine wichtige Anweisung ist unklar. Wie reagiert man am besten?',null,null,null,null,null],
  'Ignore every later message': [null,'Alle späteren Nachrichten ignorieren','Ignorare tutti i messaggi successivi',null,'Ignorar todos los mensajes posteriores','Ignorar todas as mensagens posteriores',null],
  'Request clarification before acting': [null,'Vor dem Handeln um Klärung bitten',null,'Vraag om verduidelijking voordat je handelt','Pedir una aclaración antes de actuar','Pedir esclarecimentos antes de agir',null],
  'Assume another team’s instruction applies': ['Supposer que l’instruction destinée à une autre équipe s’applique','Annehmen, dass die Anweisung für ein anderes Team gilt','Presumere che valga l’istruzione destinata a un’altra squadra',null,'Suponer que se aplica la instrucción destinada a otro equipo','Supor que se aplica a instrução destinada a outro grupo',null],
  'Guess from one familiar word': ['Deviner à partir d’un seul mot familier','Anhand eines einzigen vertrauten Wortes raten','Indovinare da una sola parola familiare',null,'Adivinar a partir de una sola palabra conocida','Adivinhar a partir de uma única palavra familiar','خمّن المقصود اعتمادًا على كلمة مألوفة واحدة'],
  'What is the purpose of reading back a critical instruction?': ['Pourquoi répéter à voix haute une instruction importante à la personne qui l’a donnée ?','Warum wiederholt man eine wichtige Anweisung gegenüber der Person, die sie gegeben hat?','Perché si ripete ad alta voce un’istruzione importante alla persona che l’ha data?','Waarom herhaal je een belangrijke instructie voor degene die deze heeft gegeven?','¿Para qué se repite en voz alta una instrucción importante a quien la ha dado?','Por que se repete em voz alta uma instrução importante à pessoa que a deu?','لماذا نكرر التعليمات المهمة بصوت مسموع للشخص الذي أعطاها؟'],
  'To make the message longer for its own sake': ['Pour allonger le message sans autre raison','Nur um die Nachricht länger zu machen','Solo per allungare il messaggio','Alleen om het bericht langer te maken','Solo para alargar el mensaje','Apenas para tornar a mensagem mais longa','لإطالة الرسالة دون غرض آخر'],
  'To replace carrying out the confirmed instruction': [null,'Um die Ausführung der bestätigten Anweisung zu ersetzen','Per sostituire l’esecuzione dell’istruzione confermata',null,null,null,'ليحل التكرار محل تنفيذ التعليمات المؤكدة'],
  'To let the sender check that it was understood correctly': ['Pour que la personne qui l’a donnée vérifie qu’elle a été bien comprise','Damit die Person, die sie gegeben hat, prüfen kann, ob sie richtig verstanden wurde','Per consentire a chi l’ha data di verificare che sia stata capita correttamente','Zodat degene die de instructie gaf, kan controleren of die goed is begrepen','Para que quien dio la instrucción compruebe que se ha entendido correctamente',null,'ليتحقق الشخص الذي أعطى التعليمات من فهمها بشكل صحيح'],
  'Which task has the shorter name': [null,'Welche Aufgabe den kürzeren Namen hat',null,null,'Qué tarea tiene el nombre más corto',null,null],
  'Nothing; the conflict resolves itself': [null,'Nichts; der Konflikt löst sich von selbst',null,null,null,null,null],
  'What makes a handover useful?': ['Quelles informations sont utiles lors d’une passation de consignes ?',null,null,null,'¿Qué información es útil al pasar el relevo a otra persona?','Que informações são úteis ao passar uma tarefa a outra pessoa?','ما المعلومات المفيدة عند تسليم المهام إلى شخص آخر؟'],
  'A list of unrelated events': [null,'Eine Liste von Ereignissen ohne Bezug zur Aufgabe',null,null,null,null,null],
  'Only a reassurance that everything is fine': [null,null,null,null,'Solo asegurar que todo está bien',null,'مجرد التأكيد أن كل شيء على ما يرام'],
  'Listen, clarify and address the concern': ['Écouter, clarifier le problème et y répondre','Zuhören, das Problem klären und sich darum kümmern',null,null,null,'Ouvir, esclarecer e procurar resolver o problema','استمع إلى المخاوف واطلب توضيحها واعمل على معالجتها'],
  'Wait until nobody can respond': ['Attendre que plus personne ne puisse répondre','Warten, bis niemand mehr reagieren kann','Aspettare finché nessuno può più intervenire',null,'Esperar hasta que nadie pueda responder','Esperar até ninguém poder responder',null],
  'Dismiss it because the colleague is junior': ['Écarter le problème parce que le collègue est moins expérimenté','Das Problem abtun, weil der Kollege weniger Erfahrung hat','Liquidare il problema perché il collega ha meno esperienza','Wijs het probleem af omdat de collega minder ervaring heeft','Descartar el problema porque el colega tiene menos experiencia','Ignorar o problema porque o colega tem menos experiência','تجاهل المشكلة لأن الزميل أقل خبرة'],
  'Hide it to protect the schedule': ['Dissimuler le problème pour tenir le planning','Das Problem verschweigen, um den Zeitplan einzuhalten','Nascondere il problema per rispettare il programma',null,'Ocultar el problema para cumplir el horario','Ocultar o problema para cumprir o horário','أخفِ المشكلة للحفاظ على الجدول الزمني'],
  'A procedure changes. Which document should guide the task?': [null,'Ein Verfahren wurde geändert. Nach welchem Dokument sollte die Aufgabe ausgeführt werden?',null,'Een procedure is gewijzigd. Welk document moet je bij de taak volgen?',null,null,null],
  'Any older copy that looks familiar': [null,'Eine beliebige ältere Kopie, die vertraut wirkt',null,null,null,null,null],
  'A remembered version from another organisation': ['Le souvenir d’une version utilisée dans une autre organisation','Eine aus einer anderen Organisation erinnerte Version','Una versione di un’altra organizzazione che si ricorda','Een versie van een andere organisatie die je uit het hoofd kent','Una versión de otra organización que se recuerda de memoria',null,'نسخة من مؤسسة أخرى تعتمد فيها على الذاكرة'],
  'An unverified social media summary': [null,null,'Un riepilogo non verificato pubblicato sui social media',null,null,'Um resumo não verificado publicado nas redes sociais','ملخص منشور على وسائل التواصل الاجتماعي لم يتم التحقق منه'],
  'Why assign a clear owner to a follow-up action?': ['Pourquoi désigner clairement une personne responsable d’une action de suivi ?','Warum sollte für eine Folgeaufgabe eine verantwortliche Person benannt werden?','Perché è importante indicare chiaramente chi è responsabile di un’azione successiva?','Waarom wijs je voor een vervolgactie een verantwoordelijke aan?','¿Por qué designar claramente a una persona responsable de una acción de seguimiento?',null,'لماذا نحدد بوضوح شخصًا مسؤولًا عن إجراء متابعة؟'],
  'So the action becomes automatically complete': ['Pour que l’action soit automatiquement terminée','Damit die Aufgabe automatisch erledigt ist','Perché l’azione risulti automaticamente completata','Zodat de actie vanzelf is afgerond','Para que la acción se complete automáticamente','Para que a ação fique automaticamente concluída','حتى يكتمل الإجراء تلقائيًا'],
  'So no record is needed': ['Pour n’avoir rien à consigner','Damit nichts dokumentiert werden muss','Per non dover documentare nulla','Zodat er niets hoeft te worden vastgelegd','Para que no haga falta dejar constancia de nada','Para que não seja necessário documentar nada','حتى لا تكون هناك حاجة إلى التوثيق'],
  'So nobody else may raise concerns': ['Pour que personne d’autre ne puisse signaler de problème','Damit niemand sonst Bedenken äußern darf','Perché nessun altro possa sollevare dubbi','Zodat niemand anders zorgen mag uiten','Para que nadie más pueda plantear preocupaciones','Para que mais ninguém possa manifestar preocupações','حتى لا يُسمح لأي شخص آخر بإثارة مخاوف'],
  'So responsibility and completion can be tracked': ['Pour savoir qui en est responsable et suivre son avancement jusqu’à la fin','Damit klar ist, wer verantwortlich ist und ob die Aufgabe erledigt wurde','Per sapere chi ne è responsabile e verificare che venga completata','Zodat duidelijk is wie verantwoordelijk is en of de actie is afgerond','Para saber quién es responsable y comprobar si la acción se ha completado','Para saber quem é responsável e verificar se a ação foi concluída','حتى نعرف من المسؤول ونتابع إتمام الإجراء'],
};

// Pronouns and short answers need their question's context. For example,
// "Increases it" refers to speed in one question and pressure in another.
const aviationQuestions = {
  'A tank contains 90 L. A calculation predicts 35 L used on a leg. How much remains?': {
    'A tank contains 90 L. A calculation predicts 35 L used on a leg. How much remains?': [null,null,null,null,null,'Um reservatório contém 90 L. O consumo previsto num trecho da rota é de 35 L. Quanto resta?',null],
  },
  'Which part of an aircraft is its fuselage?': {
    'Which part of an aircraft is its fuselage?': [null,null,null,null,null,null,'ما المقصود بجسم الطائرة؟'],
    'The main body': [null,null,null,null,null,null,'القسم المركزي الذي تتصل به الأجنحة والذيل'],
  },
  'What is the leading edge of a wing?': {
    'What is the leading edge of a wing?': [null,'Welche Kante eines Flügels trifft im normalen Vorwärtsflug zuerst auf die anströmende Luft?',null,'Welke rand van een vleugel raakt bij normaal voorwaarts vliegen als eerste de tegemoetkomende lucht?',null,null,null],
    'Its rear edge': [null,null,null,null,null,null,'حافته الخلفية'],
    'Its front edge': [null,null,null,null,null,null,'حافته الأمامية'],
  },
  'With true airspeed unchanged, what does a direct tailwind do to groundspeed?': {
    'Increases it': ['Il l’augmente','Er erhöht sie','La aumenta','Verhoogt de grondsnelheid','La aumenta','Aumenta essa velocidade','تزيدها'],
  },
  'At the same true airspeed, what does greater air density do to dynamic pressure?': {
    'Increases it': ['Elle l’augmente','Sie erhöht ihn','La aumenta','Verhoogt de dynamische druk','La aumenta','Aumenta essa pressão','تزيد الضغط الديناميكي'],
  },
};

// Use consistent, compact unit notation in the calculation choices. This is
// restricted to authored numeric answers; prose and question values stay intact.
for (const [unit, values] of [['L', [6,12,18,45,48,55,65,125]], ['km/h', [30,60,120,180]], ['kg', [345,360,390,435]]]) {
  for (const value of values) aviation[`${value} ${unit}`] = [null,null,null,null,null,null,null].map((_, column) =>
    column === 6 ? null : `${value} ${unit === 'km/h' && column === 3 ? 'km/u' : unit}`);
}

const families = [
  ...editorialInterfaceFamilies,
  editorialReasoningFamily,
  editorialCabinFamily,
  editorialAnatomyFamily,
  editorialLegalFamily,
  editorialListeningFamily,
  editorialProfessionalFamily,
  editorialPoliceFamily,
  ...editorialSocialCareFamilies,
  editorialTeacherFamily,
  editorialBibleFamily,
  editorialCatholicFamily,
  editorialNunFamily,
  editorialCambridgeFamily,
  editorialChefFamily,
  editorialDentistFamily,
  editorialClinicalFamily,
  editorialDoctorFamily,
  editorialMedicalFamily,
  editorialNursingFamily,
  editorialParamedicFamily,
  editorialMidwiferyFamily,
  editorialSurgeonFamily,
  editorialFirefighterFamily,
  editorialMechanicalFamily,
  editorialTrainFamily,
  editorialMotorbikeFamily,
  editorialHarvardFamily,
  editorialIqFamily,
  editorialItalianFamily,
  editorialMechanicFamily,
  editorialMemoryFamily,
  editorialOxfordFamily,
  editorialPersonalityFamily,
  editorialTreatmentsFamily,
  editorialVisionFamily,
  editorialYearsLeftFamily,
  {slugs: ['airforce','pilot','flightattendant'], phrases: aviation, questions: aviationQuestions},
  {slugs: ['airforce','firefighter','flightattendant','pilot','train'], phrases: communication},
];
for (const family of families) {
  const tables = [family.phrases, ...Object.values(family.questions ?? {})];
  for (const table of tables) for (const [source, row] of Object.entries(table)) {
    if (!Array.isArray(row) || row.length !== translationRowLocales.length || row.some(value => value !== null && (typeof value !== 'string' || !value.trim()))) {
      throw new Error(`Invalid editorial translation row: ${source}`);
    }
  }
}
export function applyEditorialReview(slug, locale, copy, source) {
  const column = translationRowLocales.indexOf(locale);
  if (column < 0) return;
  const relevant = families.filter(family => family.slugs === null || family.slugs.includes(slug));
  const phrases = Object.assign({}, ...relevant.map(family => family.phrases));
  const questions = Object.assign({}, ...relevant.map(family => family.questions));
  function walk(value, original, context = phrases) {
    if (typeof value === 'string') return context[original]?.[column] ?? value;
    if (original?.question && original?.answers) context = {...context, ...questions[original.question]};
    if (Array.isArray(value)) return value.map((item, i) => walk(item, original?.[i], context));
    if (value && typeof value === 'object') for (const [key, item] of Object.entries(value)) value[key] = walk(item, original?.[key], context);
    return value;
  }
  walk(copy, source);
  if (slug === 'vision') syncReviewedVisionAlts(locale, copy);
}
