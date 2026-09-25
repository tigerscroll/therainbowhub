import {quiz, sourceBank} from './remaining-shared.mjs';
import catholic from './catholic.mjs';
const vows = sourceBank('religious', [
 ['Which three evangelical counsels are professed in Catholic religious life?', 'Chastity, poverty and obedience', 'Wealth, fame and independence', 'Silence, travel and fasting only', 'Study, music and gardening only'],
 ['What is a religious vow?', 'A deliberate promise made to God', 'A timetable printed for visitors', 'A civil employment contract only', 'A type of church building'],
 ['What does religious poverty concern?', 'A way of life involving dependence and limits on the use of possessions', 'A requirement to neglect everyone’s basic needs', 'A promise to avoid all work', 'A guarantee of personal wealth'],
 ['In Catholic religious life, what is consecrated chastity associated with?', 'Celibacy for the sake of the Kingdom of God', 'A requirement to marry within the community', 'A ban on all friendship', 'A promise to avoid every conversation'],
 ['What does religious obedience involve?', 'Commitment within the institute’s lawful rule and authority', 'Following any stranger’s instruction', 'Having no personal responsibility', 'Ignoring the community’s constitution'],
 ['What is temporary profession?', 'Religious vows made for a defined period', 'A vow made without any commitment', 'An automatic appointment as a bishop', 'A promise lasting only for one meal'],
 ['What is perpetual profession?', 'Religious profession intended for life', 'A short visit to a monastery', 'The daily reading of a timetable', 'A temporary teaching contract'],
]);
const formation = sourceBank('religious', [
 ['What is the novitiate intended to help a candidate do?', 'Explore the vocation and experience the institute’s way of life', 'Avoid learning about the community', 'Receive automatic ordination', 'Skip all personal discernment'],
 ['What is a novice in religious life?', 'A person undergoing the novitiate', 'Every visitor to a church', 'Any retired bishop', 'The name of a prayer book'],
 ['What does discernment of a vocation involve?', 'Prayerful reflection on a possible calling', 'Choosing only by the colour of a habit', 'A guarantee that no questions will arise', 'Ignoring personal freedom'],
 ['Why does formation include learning the community’s rule?', 'It explains the way of life being considered', 'It replaces every relationship in the community', 'It ensures all religious institutes are identical', 'It removes the need for understanding'],
 ['What is the role of a novice director or formation guide?', 'To accompany and guide the formation process', 'To choose every visitor’s profession', 'To replace all community responsibilities', 'To lead every diocese'],
 ['Why does religious formation continue after initial profession?', 'Learning and growth remain part of the vocation', 'Initial profession has no meaning', 'A person must repeat baptism annually', 'The community’s history is rewritten daily'],
 ['What is essential to a genuine religious profession?', 'A free commitment made with the required understanding and preparation', 'Pressure from an unrelated observer', 'A decision made only by visitors', 'A promise given without knowing its meaning'],
]);
const daily = [
 ['What is the Liturgy of the Hours?', 'The Church’s prayer at appointed times of the day', 'A list of meal recipes', 'A type of church tax', 'A calendar of civil elections'],
 ['Which prayer time is traditionally associated with Vespers?', 'Evening prayer', 'Morning prayer', 'A wedding ceremony only', 'An ordination ceremony only'],
 ['Which prayer time is traditionally associated with Lauds?', 'Morning prayer', 'Night prayer', 'The blessing of meals only', 'A funeral procession only'],
 ['What is lectio divina?', 'Prayerful reading and reflection on Scripture', 'A form of building inspection', 'A list of community expenses', 'A musical instrument'],
 ['What is a refectory in a religious community?', 'A dining room', 'A bell tower', 'A baptismal font', 'A vestment cupboard'],
 ['What is a chapel?', 'A place set aside for worship and prayer', 'A community’s financial report', 'A stage of legal training', 'A type of religious vow'],
 ['What does a period of silence commonly support in contemplative life?', 'Prayer, attention and reflection', 'A claim that communication never matters', 'A rule that all communities are identical', 'A replacement for every form of service'],
];
const orders = [
 ['Which saint is closely associated with the Rule of Saint Benedict?', 'Benedict of Nursia', 'Francis of Assisi', 'Dominic de Guzmán', 'Ignatius of Loyola'],
 ['Which saint is closely associated with the Poor Clares?', 'Clare of Assisi', 'Catherine of Siena', 'Teresa of Calcutta', 'Joan of Arc'],
 ['Which religious tradition takes its name from Mount Carmel?', 'Carmelite', 'Benedictine', 'Dominican', 'Ursuline'],
 ['Which saint helped reform Carmelite life in sixteenth-century Spain?', 'Teresa of Ávila', 'Scholastica', 'Monica of Hippo', 'Hildegard of Bingen'],
 ['Which saint founded the Missionaries of Charity?', 'Teresa of Calcutta', 'Thérèse of Lisieux', 'Catherine of Alexandria', 'Brigid of Kildare'],
 ['Which tradition is closely associated with Saint Dominic?', 'Dominican', 'Franciscan', 'Carmelite', 'Benedictine'],
 ['Which saint is associated with the Ursuline tradition’s beginnings?', 'Angela Merici', 'Clare of Assisi', 'Teresa of Ávila', 'Scholastica'],
];
const community = [
 ['What is a charism in the context of a religious institute?', 'A distinctive spiritual gift and mission expressed in its life', 'The colour of every member’s eyes', 'A universal timetable shared by all institutes', 'A type of civil passport'],
 ['What does contemplative religious life particularly emphasise?', 'Prayer and contemplation', 'A rejection of all concern for others', 'Identical work in every community', 'The absence of any daily structure'],
 ['What does apostolic religious life often include?', 'Service such as education, health care or other ministries', 'A requirement that every sister become a priest', 'A ban on prayer', 'The same job for every institute'],
 ['Why should a visitor avoid assuming every community has the same customs?', 'Rules, traditions and missions can differ', 'All communities use one timetable worldwide', 'Every habit has identical meaning', 'Every member follows the same occupation'],
 ['What is a religious habit?', 'Distinctive clothing worn by members of some religious institutes', 'A book containing only financial records', 'A type of church window', 'An ordination certificate'],
 ['Who is an abbess?', 'The female superior of an abbey of nuns', 'The bishop of every diocese', 'A person who rings any church bell', 'A title for every visitor'],
 ['What should this knowledge quiz’s score be understood to reflect?', 'Answers to the questions asked', 'A person’s holiness', 'Eligibility for every religious institute', 'The value of a person’s faith'],
];
const catholicBank = index => catholic.rounds[index].questions.map(row => {
 const [prompt,answer,a,b,c,key] = row;
 return [prompt,answer,a,b,c,key];
});
const nun = quiz('Catholic religious life', [
 ['The meaning of vows','vows',vows], ['Exploring a vocation','formation',formation], ['Prayer through the day','daily_life',daily], ['Religious families','orders_traditions',orders], ['The sacraments','daily_life',catholicBank(1)], ['Seasons and celebrations','daily_life',catholicBank(4)], ['Prayer and the Rosary','daily_life',catholicBank(5)], ['Mary and the Gospels','formation',catholicBank(6)], ['Scripture connections','formation',catholicBank(7)], ['Community and mission','orders_traditions',community],
], {...catholic.sources, religious: 'https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib2-cann607-709_en.html'}, 'This is knowledge about Catholic religious life, not a measure of faith or a vocational assessment. Customs vary between institutes and rites.');
nun.sourceUrl = catholic.sourceUrl;
const dishes = [
 ['Which grain is the base of risotto?', 'Rice', 'Barley only', 'Oats', 'Rye'],
 ['What is the main starchy ingredient in traditional polenta?', 'Maize meal', 'Rice flour', 'Potato starch', 'Ground lentils'],
 ['Which dish is made with layers of pasta and fillings or sauce?', 'Lasagne', 'Risotto', 'Bruschetta', 'Panna cotta'],
 ['What is minestrone?', 'A vegetable soup with regional variations', 'A frozen coffee dessert', 'A cured ham', 'A hard cheese'],
 ['What is bruschetta commonly built on?', 'Toasted or grilled bread', 'A layer of raw pasta', 'A sheet of gelatin', 'A bowl of rice pudding'],
 ['Which dish typically combines tomatoes, mozzarella and basil?', 'Insalata caprese', 'Risotto alla milanese', 'Polenta', 'Tiramisù'],
 ['What is frittata?', 'An egg-based dish cooked with various possible fillings', 'A type of dry pasta tube', 'A citrus sorbet', 'A cured sausage'],
];
const pasta = [
 ['Which pasta shape consists of long, thin strands?', 'Spaghetti', 'Penne', 'Farfalle', 'Conchiglie'],
 ['Which pasta shape resembles small bows or butterflies?', 'Farfalle', 'Rigatoni', 'Spaghetti', 'Lasagne sheets'],
 ['Which pasta shape resembles small ears?', 'Orecchiette', 'Tagliatelle', 'Bucatini', 'Penne'],
 ['Which pasta is a broad, flat ribbon?', 'Pappardelle', 'Orzo', 'Ditalini', 'Capellini'],
 ['Which pasta consists of small filled parcels?', 'Ravioli', 'Spaghetti', 'Penne', 'Fusilli'],
 ['Which pasta is shaped into twists or spirals?', 'Fusilli', 'Lasagne sheets', 'Tagliatelle', 'Cannelloni'],
 ['Which pasta consists of large tubes often filled before baking?', 'Cannelloni', 'Capellini', 'Orzo', 'Farfalle'],
];
const ingredients = [
 ['What is ricotta?', 'A fresh dairy product traditionally made from whey', 'A cured meat', 'A dried herb', 'A type of vinegar'],
 ['What is pancetta?', 'Cured pork belly', 'A fresh sheep’s cheese', 'A rice variety', 'A citrus preserve'],
 ['What is guanciale made from?', 'Pork cheek or jowl', 'Beef shoulder', 'Turkey breast', 'Lamb shank'],
 ['What does pecorino traditionally refer to?', 'Cheese made from sheep’s milk', 'Cheese made only from rice', 'A tomato sauce', 'A cured fish'],
 ['Which herb is central to pesto alla genovese?', 'Basil', 'Dill', 'Mint alone', 'Rosemary alone'],
 ['What is mascarpone?', 'A rich, soft Italian dairy product', 'A dry pasta shape', 'A cured sausage', 'A type of rice'],
 ['What is extra virgin olive oil made from?', 'Olives', 'Grapes', 'Almonds only', 'Sunflower seeds'],
];
const regions = [
 ['Pesto alla genovese is associated with which Italian region?', 'Liguria', 'Sicily', 'Piedmont', 'Umbria'],
 ['Traditional Neapolitan pizza is associated with which city?', 'Naples', 'Milan', 'Turin', 'Venice'],
 ['Risotto alla milanese is associated with which city?', 'Milan', 'Palermo', 'Bari', 'Genoa'],
 ['Orecchiette are especially associated with which region?', 'Puglia', 'Aosta Valley', 'Liguria', 'Trentino-Alto Adige'],
 ['Cannoli are especially associated with which island?', 'Sicily', 'Sardinia', 'Elba', 'Capri'],
 ['Piadina is strongly associated with which area?', 'Romagna', 'Sicily', 'Aosta Valley', 'Sardinia'],
 ['Pane carasau is a traditional bread from which island?', 'Sardinia', 'Sicily', 'Elba', 'Ischia'],
];
const sauces = [
 ['What gives pesto alla genovese much of its green colour?', 'Basil leaves', 'Black olives', 'Tomato skins', 'Saffron'],
 ['What does a classic béchamel sauce begin with?', 'A butter-and-flour mixture with milk added', 'Only raw eggs and sugar', 'Only olive oil and vinegar', 'Whipped cream and coffee'],
 ['In a traditional Roman carbonara, which ingredients form the characteristic sauce?', 'Eggs and grated hard cheese with rendered pork fat and pasta water', 'Only cream and mushrooms', 'Tomatoes and basil only', 'Butter and jam'],
 ['What does aglio e olio mean in a pasta dish name?', 'Garlic and oil', 'Tomato and cheese', 'Cream and mushrooms', 'Butter and sage'],
 ['What gives an arrabbiata sauce its characteristic heat?', 'Chilli', 'Sugar', 'Milk', 'Vanilla'],
 ['What is ragù in Italian cooking?', 'A slowly cooked sauce, commonly based on meat', 'A single pasta shape', 'A frozen fruit drink', 'A type of coffee bean'],
 ['Why can a little starchy pasta water help a sauce?', 'It can help the sauce combine and cling to the pasta', 'It removes all flavour', 'It turns every sauce into cheese', 'It guarantees a dish contains no salt'],
];
const dough = [
 ['What gives a typical yeast pizza dough much of its rise?', 'Gas produced during yeast fermentation', 'The colour of the flour', 'Salt crystals expanding into air', 'Olive oil turning into flour'],
 ['What does kneading wheat dough help develop?', 'A gluten network', 'A layer of ice', 'A coffee aroma', 'A hard cheese rind'],
 ['What is focaccia?', 'An Italian flatbread often made with olive oil', 'A filled chocolate', 'A rice soup', 'A type of cured ham'],
 ['Why might pasta dough be rested before rolling?', 'To allow hydration and relaxation of the dough', 'To make the flour permanently dry', 'To remove every trace of starch', 'To convert eggs into yeast'],
 ['What is semolina made from?', 'Coarsely milled wheat, often durum wheat', 'Ground olives', 'Dried basil', 'Powdered cheese'],
 ['What is gnocchi best described as?', 'Small dumplings with ingredients that vary by recipe', 'Always long hollow pasta tubes', 'Only slices of cured meat', 'A type of espresso'],
 ['Why does a recipe specify an oven temperature?', 'Heat affects cooking, texture and browning', 'It determines the dish’s region of origin', 'All temperatures produce identical results', 'It replaces checking whether food is cooked'],
];
const desserts = [
 ['Which dessert commonly contains coffee-soaked sponge biscuits and mascarpone?', 'Tiramisù', 'Panna cotta', 'Cannoli', 'Granita'],
 ['What does panna cotta literally mean?', 'Cooked cream', 'Frozen coffee', 'Sweet bread', 'Fried apple'],
 ['What are cannoli?', 'Crisp pastry tubes with a sweet filling', 'Flat pasta ribbons', 'Round rice cakes only', 'Small savoury meatballs'],
 ['What is granita?', 'A semi-frozen dessert with an icy crystalline texture', 'A hard aged cheese', 'A baked pasta dish', 'A cured sausage'],
 ['Which festive Italian bread traditionally has a tall domed shape and often contains dried fruit?', 'Panettone', 'Focaccia', 'Ciabatta', 'Pane carasau'],
 ['What is affogato commonly made by pouring over ice cream or gelato?', 'Espresso', 'Tomato sauce', 'Olive brine', 'Vegetable stock'],
 ['Which ingredient gives almond amaretti their characteristic flavour?', 'Almonds or related almond-flavoured kernels', 'Basil', 'Saffron', 'Black olives'],
];
const menu = [
 ['On an Italian menu, what are antipasti?', 'Starters served before the main courses', 'Desserts only', 'Hot drinks only', 'Only side vegetables'],
 ['Which category commonly includes pasta and risotto?', 'Primi piatti', 'Dolci', 'Bevande', 'Contorni'],
 ['What does contorni commonly refer to?', 'Side dishes', 'Desserts', 'Aperitifs only', 'Filled pasta only'],
 ['What does dolci mean on a menu?', 'Desserts or sweets', 'Fish dishes', 'Breads only', 'Hot sauces'],
 ['What does al dente describe?', 'Pasta cooked with some firmness when bitten', 'Pasta completely raw in the centre', 'A dish always served cold', 'A sauce made only from tomatoes'],
 ['What does al forno mean?', 'Cooked in the oven', 'Served raw', 'Frozen solid', 'Cooked only in water'],
 ['What does ripieno mean in a food description?', 'Filled or stuffed', 'Always bitter', 'Always grilled', 'Without any seasoning'],
];
const amounts = [
 ['A pasta recipe uses 400 g for four equal portions. How much is that per portion?', '100 g', '80 g', '125 g', '160 g'],
 ['A sauce recipe uses 600 g of tomatoes. What amount is needed for half the recipe?', '300 g', '200 g', '400 g', '1200 g'],
 ['A dough rests for 40 minutes from 11:25. When does the rest end?', '12:05', '11:55', '12:15', '12:25'],
 ['Three identical pizzas are cut into eight slices each. How many slices are there?', '24', '18', '21', '32'],
 ['A recipe needs 250 mL of stock for each batch. How much is needed for three batches?', '750 mL', '500 mL', '650 mL', '1000 mL'],
 ['A 500 g cheese portion is reduced by 150 g. How much remains?', '350 g', '250 g', '400 g', '650 g'],
 ['A recipe serves six. What scale factor makes nine equal portions?', '1.5', '0.5', '2', '3'],
];
const connections = [
 ['A dish combines rice, saffron and the culinary tradition of Milan. Which is the best match?', 'Risotto alla milanese', 'Pesto alla genovese', 'Insalata caprese', 'Cannoli'],
 ['A recipe calls for long hollow pasta strands. Which shape is the best match?', 'Bucatini', 'Farfalle', 'Orecchiette', 'Lasagne sheets'],
 ['A dish needs a cheese traditionally made from sheep’s milk. Which is the best match?', 'Pecorino', 'Mascarpone', 'Cow’s-milk mozzarella', 'Cow’s-milk ricotta'],
 ['A menu describes a dessert of cooked cream set into a soft form. Which is the best match?', 'Panna cotta', 'Bruschetta', 'Polenta', 'Minestrone'],
 ['A pasta sauce calls for basil, olive oil, garlic, nuts and hard cheese. Which is the closest classic family?', 'Pesto', 'Béchamel', 'Carbonara', 'Arrabbiata'],
 ['A guest avoids wheat. Which ingredient in ordinary dried pasta needs attention?', 'Durum wheat semolina', 'Olive oil', 'Basil', 'Tomatoes'],
 ['Two regional versions of a dish use different ingredients. What is the most accurate conclusion?', 'Italian cooking includes regional and family variations', 'Only one family can ever cook the dish', 'All Italian dishes have identical recipes', 'Regional names never relate to food traditions'],
];
const italian = quiz('Italian cuisine', [
 ['Recognise the dish','classic_dishes',dishes], ['Pasta shapes','pasta_language',pasta], ['Essential ingredients','ingredients',ingredients], ['A taste of the regions','regions',regions], ['Sauces and flavour','ingredients',sauces], ['Bread and dough','ingredients',dough], ['The sweet course','classic_dishes',desserts], ['Reading the menu','pasta_language',menu], ['Recipe calculations','ingredients',amounts], ['Connect the flavours','classic_dishes',connections],
], {}, 'Regional and family recipes vary. Questions name a specific tradition when that distinction matters; Italian dish names are retained across languages.');
italian.references = 'Regional context: [Italian National Tourist Board food guide](https://www.italia.it/en/italy/things-to-do/food-and-wine). Names are culinary vocabulary; calculation answers follow the quantities stated.';
export const cultureQuizzes = {italian, nun};
