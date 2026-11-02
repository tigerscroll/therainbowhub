// Shared UI corrections for article-only locale launches.
const patches = {
  bn: {
    'site.description':'নতুন চ্যালেঞ্জ আর চমকে দেওয়া ফলাফল নিয়ে নানা কুইজ।', 'nav.home':'হোম', 'nav.quickLinks':'আরও দেখুন',
    'footer.description':'একটি কুইজ বেছে নিন, নিজের ধারণার ওপর ভরসা করুন আর ফলাফল উপভোগ করুন। ফলাফল শুধু বিনোদন ও সাধারণ শেখার জন্য—এগুলো শিক্ষা, চিকিৎসা, চাকরি বা ভর্তির কোনও আনুষ্ঠানিক মূল্যায়ন নয়।',
    'footer.legal':'গুরুত্বপূর্ণ তথ্য', 'footer.links.about':'আমাদের সম্পর্কে', 'footer.links.accessibility':'ওয়েবসাইট ব্যবহারের সুবিধা', 'footer.links.disclaimer':'দায়বদ্ধতা সম্পর্কে ঘোষণা',
    'home.headlinePrefix':'নিজেকে বুদ্ধিমান মনে করেন?', 'home.headlineHighlight':'চলুন, যাচাই করে দেখা যাক।', 'home.intro':'একটি চ্যালেঞ্জ বেছে নিন, নিজের ধারণায় ভরসা রাখুন আর নিজের দক্ষতা জানুন।',
    'home.features.fastTitle':'দ্রুত খেলা যায়', 'home.features.fastCopy':'প্রতিটি পর্বে নতুন বিষয়', 'home.features.resultsTitle':'সঙ্গে সঙ্গেই ফলাফল', 'home.features.resultsCopy':'কেমন করলেন, দেখে নিন', 'home.features.challengeTitle':'নিজেকে যাচাই করুন', 'home.features.challengeCopy':'নিয়মিত নতুন কুইজ যোগ হয়',
    'quiz.socialProofTaken':'{count}+ জন এটি চেষ্টা করেছেন', 'quiz.continue':'এগিয়ে যান', 'quiz.restartTest':'আবার শুরু করুন', 'quiz.round':'রাউন্ড', 'quiz.answersToReview':'যেসব উত্তর আবার দেখবেন',
    'quiz.perfectReview':'দারুণ ফলাফল—আপনার সব উত্তর সঠিক!', 'quiz.preparingResultTitle':'আপনার ফলাফল প্রস্তুত হচ্ছে…', 'quiz.preparingResultCopy':'আপনার উত্তরগুলো দেখে ফলাফল তৈরি করা হচ্ছে।',
    'quiz.recommendationsEyebrow':'এরপর যা দেখতে পারেন', 'quiz.recommendationsTitle':'আরেকটি চ্যালেঞ্জ নিন', 'quiz.challengeProgress':'চ্যালেঞ্জে অগ্রগতি', 'quiz.howToPlayTitle':'কীভাবে খেলবেন', 'quiz.revealMyResults':'আমার ফলাফল দেখান',
    'results.stageComplete':'পর্ব শেষ', 'results.nextStage':'এগিয়ে যান', 'results.fullBreakdown.eyebrow':'সম্পূর্ণ বিশ্লেষণ', 'results.fullBreakdown.title':'আপনার সম্পূর্ণ বিশ্লেষণ দেখুন', 'results.fullBreakdown.copy':'প্রতিটি উত্তর আবার দেখুন, কোন বিষয়ে ভালো করেছেন জানুন এবং কোথায় ভুল হয়েছে বুঝে নিন।', 'results.fullBreakdown.button':'আমার সম্পূর্ণ বিশ্লেষণ দেখান', 'results.fullBreakdown.adNote':'একটি ছোট বিজ্ঞাপন, তারপর আপনার সম্পূর্ণ বিশ্লেষণ।',
    'results.matchBreakdown.eyebrow':'আপনার মিলের বিশ্লেষণ', 'results.matchBreakdown.title':'এই মিলটি কেন পেলেন, দেখুন', 'results.matchBreakdown.copy':'আপনার প্রতিকৃতি ও ফলাফলের পেছনে থাকা সম্পর্কের বৈশিষ্ট্যগুলো জানুন।', 'results.matchBreakdown.button':'আমার মিলের বিশ্লেষণ দেখান', 'results.matchBreakdown.adNote':'একটি ছোট বিজ্ঞাপন, তারপর আপনার মিলের বিশ্লেষণ।', 'results.matchBreakdown.heading':'সম্পর্কের ক্ষেত্রে আপনার বৈশিষ্ট্য', 'error.backHome':'হোমে ফিরুন',
    'ad.readyTitle':'শুরু করতে প্রস্তুত?', 'ad.readyCopy':'প্রথমে একটি ছোট বিজ্ঞাপন দেখানো হবে।', 'ad.returnInstructionBefore':'শেষ হলে চাপুন', 'ad.returnInstructionAction':'বন্ধ করুন বা ✕', 'ad.returnInstructionAfter':'তারপর কুইজে ফিরে আসুন।', 'ad.startsImmediately':'বিজ্ঞাপন শেষ হলেই কুইজ শুরু হবে।', 'ad.beforeTitle':'এগিয়ে যাওয়ার আগে', 'ad.stepOne':'একটি ছোট বিজ্ঞাপন দেখুন।', 'ad.stepTwo':'শেষ হলে ওপরের ডান দিকের বন্ধ করার বোতামে চাপ দিয়ে শুরু করুন।', 'ad.loading':'লোড হচ্ছে…', 'ad.retryUnavailable':'বিজ্ঞাপন পাওয়া যায়নি। আবার চেষ্টা করা হচ্ছে {attempt}/{max}', 'ad.startNote':'একটি ছোট বিজ্ঞাপন, তারপর শুরু হবে।', 'ad.continueNote':'প্রথমে একটি ছোট বিজ্ঞাপন, তারপর এগিয়ে যান।', 'ad.resultsNote':'একটি ছোট বিজ্ঞাপন, তারপর আপনার ফলাফল।', 'ad.quickStartNote':'একটি ছোট বিজ্ঞাপন, তারপর শুরু হবে।', 'ad.closeTopRightNote':'(ওপরের ডান দিকে বন্ধ করুন)',
  },
  ur: {
    'site.description':'نئے چیلنجوں اور دلچسپ نتائج سے بھرپور کوئز۔', 'nav.home':'ہوم', 'nav.quickLinks':'مزید دیکھیں',
    'footer.description':'کوئز منتخب کریں، اپنی سمجھ پر بھروسا کریں اور نتیجے سے لطف اٹھائیں۔ نتائج صرف تفریح اور عمومی معلومات کے لیے ہیں، نہ کہ تعلیم، طب، ملازمت یا داخلے کی کسی باضابطہ جانچ کے لیے۔', 'footer.legal':'اہم معلومات', 'footer.links.about':'ہمارے بارے میں', 'footer.links.contact':'رابطہ کریں', 'footer.links.disclaimer':'اعلانِ لاتعلقی',
    'home.headlinePrefix':'خود کو ذہین سمجھتے ہیں؟', 'home.headlineHighlight':'آئیے، آزما کر دیکھتے ہیں۔', 'home.intro':'ایک چیلنج منتخب کریں، اپنی سمجھ پر بھروسا رکھیں اور اپنی خوبیوں کو پہچانیں۔', 'home.moreQuizzes':'اپنا اگلا چیلنج منتخب کریں',
    'home.features.fastTitle':'جلدی مکمل کریں', 'home.features.fastCopy':'ہر مرحلے پر نئے موضوعات', 'home.features.resultsTitle':'نتیجہ فوراً دیکھیں', 'home.features.resultsCopy':'جانیے آپ نے کیسا کیا', 'home.features.challengeTitle':'اپنی صلاحیت آزمائیں', 'home.features.challengeCopy':'نئے کوئز باقاعدگی سے شامل ہوتے ہیں', 'home.difficulty.Hard':'مشکل',
    'quiz.start':'شروع کریں', 'quiz.restartTest':'دوبارہ شروع کریں', 'quiz.finalScore':'حتمی اسکور', 'quiz.answered':'دیے گئے جواب', 'quiz.round':'راؤنڈ', 'quiz.answersToReview':'دوبارہ دیکھنے کے لیے جواب', 'quiz.perfectReview':'شاندار نتیجہ—آپ کے سب جواب درست ہیں۔', 'quiz.preparingResultCopy':'آپ کے جواب دیکھ کر نتیجہ تیار کیا جا رہا ہے۔', 'quiz.recommendationsEyebrow':'اس کے بعد', 'quiz.recommendationsTitle':'ایک اور چیلنج آزمائیں', 'quiz.challengeProgress':'چیلنج میں پیش رفت', 'quiz.howToPlayTitle':'کھیلنے کا طریقہ', 'quiz.revealMyResults':'میرے نتائج دکھائیں', 'quiz.finalScoreCalculated':'آپ کا حتمی اسکور تیار ہے',
    'results.stageComplete':'مرحلہ مکمل', 'results.startStage':'شروع کریں', 'results.fullBreakdown.eyebrow':'تفصیلی جائزہ', 'results.fullBreakdown.title':'اپنا مکمل جائزہ دیکھیں', 'results.fullBreakdown.copy':'ہر جواب دوبارہ دیکھیں، اپنی سب سے مضبوط خوبی جانیں اور سمجھیے کہاں غلطی ہوئی۔', 'results.fullBreakdown.button':'میرا مکمل جائزہ دکھائیں', 'results.fullBreakdown.adNote':'ایک مختصر اشتہار، پھر آپ کا تفصیلی جائزہ۔',
    'results.matchBreakdown.eyebrow':'آپ کی مطابقت کا جائزہ', 'results.matchBreakdown.title':'جانیے یہ مطابقت کیوں سامنے آئی', 'results.matchBreakdown.copy':'اپنی تصویر اور نتیجے کے پیچھے تعلقات سے متعلق اشاروں کو سمجھیں۔', 'results.matchBreakdown.button':'میری مطابقت کا جائزہ دکھائیں', 'results.matchBreakdown.adNote':'ایک مختصر اشتہار، پھر آپ کی مطابقت کا جائزہ۔', 'results.matchBreakdown.heading':'تعلقات میں آپ کی خصوصیات', 'error.backHome':'ہوم پر واپس جائیں',
    'ad.readyTitle':'شروع کرنے کے لیے تیار ہیں؟', 'ad.returnInstructionBefore':'ختم ہونے پر دبائیں', 'ad.returnInstructionAction':'بند کریں یا ✕', 'ad.returnInstructionAfter':'اور کوئز پر واپس آ جائیں۔', 'ad.watchAdStart':'اشتہار دیکھیں اور شروع کریں', 'ad.startsImmediately':'اشتہار کے فوراً بعد کوئز شروع ہوگا۔', 'ad.beforeTitle':'آگے بڑھنے سے پہلے', 'ad.stepTwo':'اشتہار ختم ہونے پر اوپر دائیں جانب بند کرنے کا بٹن دبائیں اور شروع کریں۔', 'ad.loading':'لوڈ ہو رہا ہے…', 'ad.retryUnavailable':'اشتہار دستیاب نہیں تھا۔ دوبارہ کوشش جاری ہے {attempt}/{max}', 'ad.startNote':'ایک مختصر اشتہار، پھر آغاز۔', 'ad.continueNote':'پہلے ایک مختصر اشتہار، پھر آگے بڑھیں۔', 'ad.resultsNote':'ایک مختصر اشتہار، پھر آپ کے نتائج۔', 'ad.quickStartNote':'پہلے ایک مختصر اشتہار، پھر آغاز۔', 'ad.closeTopRightNote':'(اوپر دائیں جانب بند کریں)',
  },
  tr: {
    'site.description':'Yeni meydan okumalar ve şaşırtıcı sonuçlar sunan eğlenceli testler.', 'footer.description':'Bir test seçin, sezgilerinize güvenin ve sonucu keşfedin. Sonuçlar eğlence ve genel öğrenme amaçlıdır; resmî akademik, klinik, işe alım veya kabul değerlendirmesi değildir.', 'ad.loading':'Yükleniyor…', 'ad.retryUnavailable':'Reklam bulunamadı. Yeniden deneniyor: {attempt}/{max}', 'ad.quickStartNote':'Önce kısa bir reklam, ardından test başlar.',
  },
  fil: {'site.description':'Mga pagsusulit na may bagong hamon at nakakagulat na resulta.', 'ad.advertisement':'Patalastas', 'ad.loading':'Naglo-load…', 'ad.quickStartNote':'Maikling ad muna, saka magsisimula ang pagsusulit.'},
  vi: {'site.description':'Những bài đố với thử thách mới và kết quả bất ngờ.', 'footer.description':'Chọn một bài đố, tin vào trực giác và khám phá kết quả. Kết quả chỉ dành cho giải trí và tìm hiểu chung, không phải đánh giá chính thức về học tập, y tế, việc làm hay tuyển sinh.', 'ad.loading':'Đang tải…', 'ad.startsImmediately':'Bài đố bắt đầu ngay sau quảng cáo.', 'ad.retryUnavailable':'Chưa có quảng cáo. Đang thử lại {attempt}/{max}', 'ad.quickStartNote':'Một quảng cáo ngắn, rồi bắt đầu.', 'home.features.fastCopy':'Chủ đề mới ở mỗi chặng', 'home.socialProof':'2,4 triệu lượt chơi trong tháng này'},
  ms: {'site.description':'Kuiz dengan cabaran baharu dan keputusan yang menarik.', 'footer.links.contact':'Hubungi kami', 'ad.loading':'Memuatkan…', 'ad.quickStartNote':'Satu iklan ringkas dahulu, kemudian kuiz bermula.', 'home.features.fastCopy':'Topik baharu pada setiap peringkat'},
};

const infoTitles = {
  bn:['The Rainbow Hub সম্পর্কে','The Rainbow Hub-এর সঙ্গে যোগাযোগ','ওয়েবসাইট ব্যবহারের সুবিধা সম্পর্কে বিবৃতি','গোপনীয়তা নীতি','কুকি নীতি','ব্যবহারের শর্তাবলী','দায়বদ্ধতা সম্পর্কে ঘোষণা'],
  ur:['The Rainbow Hub کے بارے میں','The Rainbow Hub سے رابطہ کریں','رسائی سے متعلق بیان','رازداری کی پالیسی','کوکی پالیسی','استعمال کی شرائط','اعلانِ لاتعلقی'],
};

export function reviewShared(locale, value) {
  const result = structuredClone(value);
  for (const [path,text] of Object.entries(patches[locale] ?? {})) {
    const parts = path.split('.');
    parts.slice(0,-1).reduce((node,key) => node[key],result)[parts.at(-1)] = text;
  }
  return result;
}

export function reviewInfo(locale, value) {
  const result = structuredClone(value);
  const pages = ['about','contact','accessibility','privacy-policy','cookie-policy','terms-of-use','disclaimer'];
  pages.forEach((page,index) => {if (infoTitles[locale]) result[page].title = infoTitles[locale][index];});
  if (locale === 'tr') result['privacy-policy'].metaDescription = 'The Rainbow Hub’ın topladığı bilgileri, bunların nasıl kullanıldığını, kimlerle paylaşılabileceğini ve gizlilik seçeneklerinizi öğrenin.';
  function visit(node) {
    if (typeof node === 'string') return node.replace(/Trung tâm cầu vồng/gi,'The Rainbow Hub').replace(/(?<!The )Rainbow Hub/g,'The Rainbow Hub');
    if (Array.isArray(node)) return node.map(visit);
    return node && typeof node === 'object' ? Object.fromEntries(Object.entries(node).map(([key,item]) => [key,visit(item)])) : node;
  }
  return visit(result);
}
