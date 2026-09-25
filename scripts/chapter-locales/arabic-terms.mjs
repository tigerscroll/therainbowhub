// Domain meanings, including distractors. Avoid literal translations such as
// pupil → student, spring → season, and dressing → medical bandage.
const terms = {
  anatomy: {
    'Pupil': 'حدقة العين', 'Axon': 'المحور العصبي', 'Ball and socket': 'مفصل كروي حُقّي',
    'Ball-and-socket': 'مفصل كروي حُقّي', 'Voluntary': 'إرادية', 'Medial': 'إنسي',
    'Lateral': 'وحشي', 'Transverse': 'مستعرض', 'Frontal': 'جبهي', 'Coronal': 'إكليلي',
  },
  iq: {'Hexagon': 'سداسي الأضلاع'},
  chef: {
    'So excess water does not dilute the dressing': 'حتى لا يخفف الماء الزائد صلصة السلطة',
    'So the dressing turns solid': 'حتى تصبح صلصة السلطة صلبة',
    'Fat and flour cooked together': 'دهن ودقيق يُطهَيان معًا',
    'They cook at a similar rate': 'لتنضج بوتيرة متقاربة',
    'Separate timers': 'مؤقتات منفصلة',
    'The 20-minute component': 'المكوّن الذي يحتاج إلى 20 دقيقة',
  },
  mechanic: {
    'Spring and wheel oscillation': 'تذبذب النوابض والعجلات',
    'Hot liquid and steam can escape and burn': 'قد يندفع سائل ساخن وبخار ويسببان حروقًا',
    'The original supply path': 'مسار التغذية الكهربائية الأصلي',
    'Deliver a controlled amount of fuel': 'توصيل كمية مضبوطة من الوقود',
    'Turning the steering wheel': 'تدوير عجلة القيادة',
  },
  catholic: {
    'The Creed': 'قانون الإيمان', 'A statement of belief': 'صيغة تعبّر عن المعتقدات',
    'Dismissal': 'صرف الشعب في ختام القداس', 'The dismissal': 'صرف الشعب في ختام القداس',
    'The tabernacle': 'بيت القربان', 'The ambo': 'منبر القراءات',
    'Chasuble': 'حُلّة القداس', 'Advent': 'زمن المجيء',
    'Joyful': 'أسرار الفرح', 'Sorrowful': 'أسرار الحزن', 'Glorious': 'أسرار المجد', 'Luminous': 'أسرار النور',
    'Charity': 'المحبة', 'The Sanctus': 'صلاة «قدوس، قدوس، قدوس»',
  },
};
const biblical = {
  'Joseph': 'يوسف', 'Deborah': 'دبورة', 'Gabriel': 'جبرائيل', 'Elizabeth': 'أليصابات',
  'Thomas': 'توما', 'Stephen': 'إسطفانوس', 'Silas': 'سيلا',
  'A burning bush that is not consumed': 'عليقة تشتعل بالنار ولا تحترق',
  'A sling and a stone': 'مقلاع وحجر',
  'Moses and Elijah': 'موسى وإيليا',
};

export function correctArabicTerm(slug, source) {
  return terms[slug]?.[source] ?? (['bible','catholic'].includes(slug) ? biblical[source] : undefined);
}
