import { JourneyNode, StudentProfile, Team, MatchItem, CompetitionSettings } from '../types/competition';

// 🧭 خريطة رحلة العباقرة التفاعلية (9 محطات)
export const JOURNEY_NODES: JourneyNode[] = [
  {
    id: 'node-start',
    title: '🚀 بوابة البداية',
    subtitle: 'التسجيل والحصول على كود المشاركة وخوض التصفيات الفردية',
    icon: '🚀',
    targetView: 'qualifiers',
    unlockedByDefault: true,
  },
  {
    id: 'node-logic',
    title: '🧠 مدينة الذكاء',
    subtitle: 'ألغاز الاستنتاج، الأنماط الذكية، وتحدي مخ العباقرة',
    icon: '🧠',
    targetView: 'games_hub',
    gameTab: 'genius_brain',
    unlockedByDefault: true,
  },
  {
    id: 'node-science',
    title: '🔬 مدينة العلوم',
    subtitle: 'تحدي المعلومة الغامضة والاكتشافات العلمية السريعة',
    icon: '🔬',
    targetView: 'games_hub',
    gameTab: 'mystery_fact',
  },
  {
    id: 'node-egypt',
    title: '🇪🇬 مدينة مصر',
    subtitle: 'تحدي مصر في دقيقة: محافظات، معالم، وتاريخ الحضارة',
    icon: '🇪🇬',
    targetView: 'games_hub',
    gameTab: 'egypt_minute',
  },
  {
    id: 'node-language',
    title: '📚 مدينة اللغة',
    subtitle: 'الصندوق الغامض ولعبة ممنوع الكلام والتمثيل الصامت',
    icon: '📚',
    targetView: 'games_hub',
    gameTab: 'mystery_box',
  },
  {
    id: 'node-observation',
    title: '👁️ مدينة الملاحظة',
    subtitle: 'لعبة عين الصقر: ذاكرة بصرية خاطفة في ٥ ثوانٍ',
    icon: '👁️',
    targetView: 'games_hub',
    gameTab: 'falcon_eye',
  },
  {
    id: 'node-speed',
    title: '⚡ مدينة السرعة',
    subtitle: 'سرعة البرق، تحدي المخاطرة، وسرقة النقاط بين الفرق',
    icon: '⚡',
    targetView: 'games_hub',
    gameTab: 'lightning_speed',
  },
  {
    id: 'node-secrets',
    title: '🔐 غرفة الأسرار',
    subtitle: 'غرفة العباقرة المغلقة: حل ٣ شفرات متتالية لفتح القفل النهائي',
    icon: '🔐',
    targetView: 'games_hub',
    gameTab: 'escape_room',
  },
  {
    id: 'node-champions',
    title: '🏆 قاعة الأبطال',
    subtitle: 'الأدوار الإقصائية للبطولة النهائية ولوحة شرف مدرسة عيون مصر',
    icon: '🏆',
    targetView: 'tournament',
  },
];

export interface FalconEyeChallenge {
  id: string;
  level: '👁️ عين سريعة' | '👁️ عين دقيقة' | '🦅 عين العبقري';
  sceneTitle: string;
  items: { icon: string; label: string; colorName: string; numberBadge: number; position: string }[];
  question: string;
  options: string[];
  correctIndex: number;
  points: number;
}

export const FALCON_EYE_CHALLENGES: FalconEyeChallenge[] = [
  {
    id: 'fe-1',
    level: '👁️ عين سريعة',
    sceneTitle: 'مختبر العلوم بمدرسة عيون مصر',
    items: [
      { icon: '🔬', label: 'ميكروسكوب', colorName: 'أزرق', numberBadge: 4, position: 'اليمين' },
      { icon: '🧪', label: 'أنبوبة اختبار', colorName: 'أخضر', numberBadge: 7, position: 'المنتصف' },
      { icon: '🧲', label: 'مغناطيس', colorName: 'أحمر', numberBadge: 9, position: 'اليسار' },
      { icon: '🌍', label: 'مجسم الكرة الأرضية', colorName: 'ذهبي', numberBadge: 2, position: 'الزاوية' },
    ],
    question: 'ما هو الرقم الذي كان مكتوباً على بطاقة «أنبوبة الاختبار 🧪» في المنتصف؟',
    options: ['الرقم 7', 'الرقم 4', 'الرقم 9', 'الرقم 2'],
    correctIndex: 0,
    points: 20,
  },
  {
    id: 'fe-2',
    level: '👁️ عين دقيقة',
    sceneTitle: 'لوحة رموز الحضارة والفضاء',
    items: [
      { icon: '🦅', label: 'صقر ذهبي', colorName: 'أصفر', numberBadge: 15, position: 'الأعلى يمين' },
      { icon: '🚀', label: 'صاروخ فضاء', colorName: 'فضي', numberBadge: 30, position: 'الأعلى يسار' },
      { icon: '🏺', label: 'إناء فرعوني', colorName: 'برتقالي', numberBadge: 12, position: 'الأسفل يمين' },
      { icon: '🔭', label: 'تلسكوب فلكي', colorName: 'بنفسجي', numberBadge: 25, position: 'الأسفل يسار' },
    ],
    question: 'أي عنصر كان لونه «بنفسجي» ويحمل الرقم 25 في اللوحة؟',
    options: ['التلسكوب الفلكي 🔭', 'الصاروخ الفضائي 🚀', 'الصقر الذهبي 🦅', 'الإناء الفرعوني 🏺'],
    correctIndex: 0,
    points: 25,
  },
  {
    id: 'fe-3',
    level: '🦅 عين العبقري',
    sceneTitle: 'تحدي الذاكرة الفائقة للعباقرة',
    items: [
      { icon: '📐', label: 'مثلث هندسي', colorName: 'أحمر', numberBadge: 18, position: 'الركن الأول' },
      { icon: '🧭', label: 'بوصلة ملاحية', colorName: 'أخضر', numberBadge: 24, position: 'الركن الثاني' },
      { icon: '⏳', label: 'ساعة رملية', colorName: 'ذهبي', numberBadge: 36, position: 'الركن الثالث' },
      { icon: '💡', label: 'مصباح مبتكر', colorName: 'أزرق', numberBadge: 42, position: 'الركن الرابع' },
    ],
    question: 'كم كان مجموع الرقمين الموجودين على «المثلث الهندسي 📐» و«البوصلة الملاحية 🧭» معاً؟',
    options: ['42 (18 + 24)', '54', '36', '60'],
    correctIndex: 0,
    points: 35,
  },
];

export interface LightningQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  basePoints: number;
}

export const LIGHTNING_QUESTIONS: LightningQuestion[] = [
  {
    id: 'lt-1',
    prompt: 'أكمل النمط فوراً:  2  →  6  →  12  →  20  →  ؟',
    options: ['30', '28', '24', '32'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-2',
    prompt: 'حساب خاطف: كم ثانية في دقيقتين ونصف؟',
    options: ['150 ثانية', '120 ثانية', '180 ثانية', '130 ثانية'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-3',
    prompt: 'ما هي المحافظة المصرية التي تُلقب بـ «عروس البحر المتوسط»؟',
    options: ['الإسكندرية', 'بورسعيد', 'مرسى مطروح', 'دمياط'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-4',
    prompt: 'إذا ضاعفنا العدد 15 مرتين متتاليتين (15 × 2 × 2)، فكم يصبح الناتج؟',
    options: ['60', '45', '90', '75'],
    correctIndex: 0,
    basePoints: 20,
  },
];

export interface GeniusBrainPuzzle {
  id: string;
  category: string;
  question: string;
  hint: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export const GENIUS_BRAIN_PUZZLES: GeniusBrainPuzzle[] = [
  {
    id: 'gb-1',
    category: 'حل المشكلات والمنطق',
    question: 'لديك دلوان فارغان: الأول سعته 5 لترات، والثاني سعته 3 لترات. كيف تحصل على 4 لترات بالضبط من الماء؟',
    hint: 'فكّر في ملء الدلو الكبير أولاً ثم تفريغ جزء منه في الدلو الصغير.',
    options: [
      'نملأ الـ5 لترات ونفرغ منه 3 في الصغير (يبقى 2)، نفرغ الصغير ونضع الـ2 فيه، ثم نملأ الـ5 ونصب 1 لتر ليكتمل الصغير فيتبقى 4 لترات!',
      'نملأ دلو الـ3 لترات مرتين ونصف بالتقدير',
      'نضع نصف دلو الـ5 لترات مع نصف دلو الـ3 لترات بالعين المجردة',
      'لا يمكن قياس 4 لترات أبداً بهذين الدلوين',
    ],
    correctIndex: 0,
    explanation: 'خطوات منطقية دقيقة: (5 - 3 = 2 لتر) ثم ننقل الـ 2 لتر للدلو الصغير ونكمله بـ1 لتر من الدلو الكبير فيتبقى 4 لترات.',
    points: 30,
  },
  {
    id: 'gb-2',
    category: 'ترتيب وعلاقات',
    question: 'يجلس 4 طلاب (سلمى، نور، زياد، حسن) في صف واحد. زياد لا يجلس في الأطراف، وسلمى تجلس أقصى اليمين، ونور تجلس بجانب سلمى مباشرة. من يجلس أقصى اليسار؟',
    hint: 'رتّب المقاعد الأربعة من اليمين إلى اليسار خطوة بخطوة.',
    options: ['حسن', 'زياد', 'نور', 'سلمى'],
    correctIndex: 0,
    explanation: 'الترتيب من اليمين لليسار: 1- سلمى ، 2- نور ، 3- زياد ، 4- حسن (أقصى اليسار).',
    points: 25,
  },
  {
    id: 'gb-3',
    category: 'احتمالات واستنتاج',
    question: 'طابور في فناء مدرسة عيون مصر يقف فيه «ياسين» بحيث يكون ترتيبه الخامس من الأمام، والخامس أيضاً من الخلف. كم عدد الطلاب في هذا الطابور؟',
    hint: 'انتبه لعدم حساب ياسين مرتين!',
    options: ['9 طلاب', '10 طلاب', '8 طلاب', '11 طالباً'],
    correctIndex: 0,
    explanation: 'أمام ياسين 4 طلاب، وخلفه 4 طلاب، وياسين نفسه هو الطالب رقم 5، إذن: 4 + 1 + 4 = 9 طلاب.',
    points: 25,
  },
];

export interface MysteryFactChallenge {
  id: string;
  title: string;
  factCard: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export const MYSTERY_FACT_CHALLENGES: MysteryFactChallenge[] = [
  {
    id: 'mf-1',
    title: 'ظاهرة «تأثير اللوتس» في الطبيعة',
    factCard:
      'تمتلك أوراق زهرة اللوتس المصرية نتوءات مجهرية دقيقة جداً مغطاة بطبقة شمعية طاردة للماء. عندما تسقط قطرات المطر على الورقة، لا تلتصق بها بل تتكور وتتدحرج سريعةً حاملةً معها ذرات الغبار والأتربة، فتبقى الورقة نظيفة ذاتياً دون تدخل!',
    question: 'بناءً على فهمك لهذه المعلومة الجديدة، في أي ابتكار هندسي حديث يمكن للعلماء تقليد «سطح ورقة اللوتس»؟',
    options: [
      'صناعة دهانات واجهات المباني والزجاج الذاتي التنظيف الذي لا يتسخ بالمطر والغبار',
      'صناعة إسفنج يمتص الماء بكميات كبيرة جداً',
      'صناعة إطارات سيارات تلتصق بالطين',
      'زيادة وزن الطائرات الورقية',
    ],
    correctIndex: 0,
    explanation: 'استلهم العلماء من زهرة اللوتس تقنية الأسطح الكارهة للماء لصناعة زجاج وأقمشة تنظف نفسها تلقائياً.',
    points: 30,
  },
  {
    id: 'mf-2',
    title: 'سر عيون «اليعسوب» المركبة',
    factCard:
      'تمتلك حشرة اليعسوب عيوناً مركبة تحتوي على نحو 30,000 عدسة صغيرة تمنحها رؤية بزاوية 360 درجة حولها، كما تستطيع عينها التقاط 200 صورة في الثانية الواحدة (بينما تلتقط عين الإنسان نحو 60 صورة في الثانية).',
    question: 'ماذا تستنتج من قدرة عين اليعسوب على التقاط 200 صورة في الثانية مقارنة بالإنسان؟',
    options: [
      'يرى اليعسوب الحركات السريعة جداً حوله وكأنها تتحرك بالتصوير البطيء فيسهل عليه المناورة',
      'لا يستطيع اليعسوب رؤية الأجسام الثابتة',
      'يرى اليعسوب خلفه فقط ولا يرى أمامه',
      'تحتاج عينه إلى نظارة مكبرة في النهار',
    ],
    correctIndex: 0,
    explanation: 'كلما زاد عدد اللقطات التي يراها الكائن في الثانية، بدت له الحركات الخاطفة بطيئة وواضحة.',
    points: 30,
  },
];

export interface RiskQuestion {
  id: string;
  tier: 10 | 20 | 30 | 50;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const RISK_QUESTIONS: RiskQuestion[] = [
  {
    id: 'rk-10',
    tier: 10,
    question: 'مخاطرة 10 نقاط (🟢 سهل): ما الغاز الذي نتنفسه وضروري لحياة جميع الكائنات الحية؟',
    options: ['الأكسجين', 'ثاني أكسيد الكربون', 'الهيليوم', 'النيتروجين'],
    correctIndex: 0,
    explanation: 'غاز الأكسجين يمثل نحو 21% من الغلاف الجوي وهو أساس التنفس.',
  },
  {
    id: 'rk-20',
    tier: 20,
    question: 'مخاطرة 20 نقطة (🟡 متوسط): كم عدد محافظات جمهورية مصر العربية؟',
    options: ['27 محافظة', '25 محافظة', '29 محافظة', '24 محافظة'],
    correctIndex: 0,
    explanation: 'تتكون جمهورية مصر العربية من 27 محافظة.',
  },
  {
    id: 'rk-30',
    tier: 30,
    question: 'مخاطرة 30 نقطة (🔴 صعب): ما هو العدد الأولي الوحيد الذي يُعد عدداً زوجياً؟',
    options: ['العدد 2', 'العدد 4', 'العدد 1', 'العدد 0'],
    correctIndex: 0,
    explanation: 'العدد 2 هو العدد الزوجي الوحيد الأولي.',
  },
  {
    id: 'rk-50',
    tier: 50,
    question: 'مخاطرة 50 نقطة (🔥 تحدي الأبطال): إذا كانت الساعة الآن تشير إلى 3:00 تماماً، فكم تبلغ الزاوية بالدرجات بين عقرب الساعات وعقرب الدقائق؟',
    options: ['90 درجة (زاوية قائمة)', '180 درجة', '60 درجة', '45 درجة'],
    correctIndex: 0,
    explanation: 'عند الساعة 3 تكون الزاوية 3 × 30 = 90 درجة.',
  },
];

export interface MysteryBoxItem {
  id: string;
  boxName: string;
  icon: string;
  isBlackBox?: boolean;
  surpriseEffect: string;
  bonusPoints: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export const MYSTERY_BOXES: MysteryBoxItem[] = [
  {
    id: 'box-sci',
    boxName: '🔬 صندوق العلوم',
    icon: '🔬',
    surpriseEffect: 'سؤال علمي بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما هو المعدن السائل الوحيد في درجة حرارة الغرفة العادية؟',
    options: ['الزئبق', 'الحديد', 'النحاس', 'الألومنيوم'],
    correctIndex: 0,
  },
  {
    id: 'box-iq',
    boxName: '🧠 صندوق الذكاء',
    icon: '🧠',
    surpriseEffect: 'لغز ذكاء بقيمة 30 نقطة!',
    bonusPoints: 30,
    question: 'شيء يمشي بلا أرجل، ويبكي بلا عيون، فما هو؟',
    options: ['السحاب', 'الرياح', 'الساعة', 'الظل'],
    correctIndex: 0,
  },
  {
    id: 'box-egy',
    boxName: '🇪🇬 صندوق مصر',
    icon: '🇪🇬',
    surpriseEffect: 'تحدي وطني بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما هي المدينة المصرية التي تُعرف بـ «مدينة السلام» وتقع في جنوب سيناء؟',
    options: ['شرم الشيخ', 'العريش', 'طابا', 'دهب'],
    correctIndex: 0,
  },
  {
    id: 'box-arb',
    boxName: '📚 صندوق اللغة',
    icon: '📚',
    surpriseEffect: 'سؤال بلاغة ولغة بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما جمع كلمة «عندليب» (طائر مغرد)؟',
    options: ['عنادل', 'عناديل', 'عندليبات', 'عواذل'],
    correctIndex: 0,
  },
  {
    id: 'box-black',
    boxName: '🎲 الصندوق الأسود',
    icon: '🎲',
    isBlackBox: true,
    surpriseEffect: 'مفاجأة الصندوق الأسود! نقاط مضاعفة (50 نقطة) + هدية كارت خاص للفريق!',
    bonusPoints: 50,
    question: 'سؤال الصندوق الأسود المفاجئ: كم مرة ينطبق عقربا الساعات والدقائق فوق بعضهما تماماً خلال 24 ساعة؟',
    options: ['22 مرة', '24 مرة', '12 مرة', '48 مرة'],
    correctIndex: 0,
  },
];

export const CHARADES_CARDS: { category: string; word: string; forbiddenWords: string[]; points: number }[] = [
  { category: 'اختراعات', word: 'التلسكوب الفضائي', forbiddenWords: ['نجوم', 'قمر', 'عدسة'], points: 20 },
  { category: 'أماكن مصرية', word: 'أهرامات الجيزة وأبو الهول', forbiddenWords: ['هرم', 'خوفو', 'جيزة'], points: 20 },
  { category: 'حيوانات', word: 'الكنغر الأسترالي', forbiddenWords: ['جيب', 'قفز', 'أستراليا'], points: 15 },
  { category: 'علوم', word: 'المغناطيس والجاذبية', forbiddenWords: ['حديد', 'يجذب', 'قطب'], points: 25 },
  { category: 'مهن', word: 'رائد فضاء', forbiddenWords: ['صاروخ', 'قمر', 'بدلة'], points: 20 },
  { category: 'شخصيات', word: 'طبيب جراح القلب (مجدي يعقوب)', forbiddenWords: ['قلب', 'مستشفى', 'عملية'], points: 25 },
  { category: 'أشياء', word: 'البوصلة الملاحية', forbiddenWords: ['شمال', 'اتجاه', 'سفينة'], points: 20 },
];

export const EGYPT_IN_A_MINUTE_TOPICS: {
  id: string;
  title: string;
  targetItems: string[];
  pointsPerItem: number;
}[] = [
  {
    id: 'egm-1',
    title: 'اذكر أكبر عدد من المحافظات المصرية خلال 60 ثانية',
    targetItems: [
      'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الدقهلية', 'الغربية', 'المنوفية',
      'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء',
      'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
    ],
    pointsPerItem: 5,
  },
  {
    id: 'egm-2',
    title: 'اذكر أكبر عدد من المعالم الأثرية والسياحية في مصر خلال 60 ثانية',
    targetItems: [
      'أهرامات الجيزة', 'أبو الهول', 'معبد الكرنك', 'معبد أبو سمبل', 'قلعة قايتباي', 'برج القاهرة',
      'المتحف المصري الكبير', 'مكتبة الإسكندرية', 'السد العالي', 'قلعة صلاح الدين', 'جامع الأزهر', 'وادي الملوك',
    ],
    pointsPerItem: 5,
  },
];

export const ESCAPE_ROOM_STAGES = [
  {
    stage: 1,
    title: 'اللغز الأول: شفرة الرقم السري',
    riddle: 'عدد مكون من رقمين: عشراته عدد قارات العالم (7)، وآحاده عدد أضلاع المثلث (3). ما هو؟',
    clueOutput: '73',
    options: ['73', '37', '53', '74'],
    correctIndex: 0,
  },
  {
    stage: 2,
    title: 'اللغز الثاني: كلمة المرور الذهبية',
    riddle: 'نهر عظيم يبدأ بحرف (ن) وينتهي بحرف (ل)، وهب مصر الحياة والحضارة. ما هو؟',
    clueOutput: 'النيل',
    options: ['النيل', 'الفرات', 'السند', 'الأردن'],
    correctIndex: 0,
  },
  {
    stage: 3,
    title: 'اللغز الثالث: اتجاه البوصلة النهائي',
    riddle: 'إذا وقفت صباحاً ووجهك نحو شروق الشمس (الشرق)، ثم درت ربع دورة إلى يسارك، فإلى أي اتجاه تشير؟',
    clueOutput: 'الشمال',
    options: ['الشمال', 'الجنوب', 'الغرب', 'الشرق'],
    correctIndex: 0,
  },
];

export const GENIUS_ALARM_QUESTIONS = [
  {
    id: 'alm-1',
    title: '🚨 إنذار العباقرة: تحدي النقاط المضاعفة لجميع الفرق!',
    type: 'لغز تركيز وحساب سريع',
    question:
      'انطلقت حافلة مدرسة عيون مصر وفيها 18 طالباً. في المحطة الأولى نزل 5 طلاب وصعد 7 طلاب، وفي المحطة الثانية صعد 4 طلاب. كم طالباً في الحافلة الآن؟',
    options: ['24 طالباً', '20 طالباً', '22 طالباً', '26 طالباً'],
    correctIndex: 0,
    doublePoints: 40,
  },
  {
    id: 'alm-2',
    title: '🚨 إنذار العباقرة: سؤال الملاحظة والبديهة الخاطفة!',
    type: 'سؤال استنتاج فوري',
    question: 'ما هو الشيء الذي يزداد كلما أخذت منه، ويصغر كلما أضفت إليه؟',
    options: ['الحفرة', 'الكتاب', 'حصالة النقود', 'خزان الماء'],
    correctIndex: 0,
    doublePoints: 40,
  },
];

export const OFFICIAL_AWARDS = [
  { id: 'aw-1', icon: '🏆', title: 'عبقري الموسم', desc: 'لأعلى مجموع شامل في البطولة' },
  { id: 'aw-2', icon: '🧠', title: 'عبقري المنطق', desc: 'لأفضل أداء في ألغاز الاستنتاج ومخ العباقرة' },
  { id: 'aw-3', icon: '🔬', title: 'عبقري العلوم', desc: 'للتفوق في أسئلة العلوم والمعلومة الغامضة' },
  { id: 'aw-4', icon: '➗', title: 'عبقري الحساب', desc: 'لبراعة الحساب الذهني والأنماط الرياضية' },
  { id: 'aw-5', icon: '📚', title: 'عبقري اللغة', desc: 'لإتقان قواعد وبلاغة اللغة العربية' },
  { id: 'aw-6', icon: '👁️', title: 'عين الصقر', desc: 'لدقة الملاحظة البصرية والذاكرة الفورية' },
  { id: 'aw-7', icon: '⚡', title: 'أسرع بديهة', desc: 'لأسرع استجابة صحيحة في جولات سرعة البرق' },
  { id: 'aw-8', icon: '🎯', title: 'أفضل قرار', desc: 'لأذكى اختيار في تحدي المخاطرة وكروت اللعب' },
  { id: 'aw-9', icon: '🤝', title: 'أفضل روح فريق', desc: 'للتعاون المثالي والعمل الجماعي الراقي' },
  { id: 'aw-10', icon: '🌟', title: 'نجم المسابقة', desc: 'للتميز الشامل والأخلاق الرياضية العالية' },
];

export const INITIAL_DEMO_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-1',
    name: 'يوسف أحمد محمود',
    grade: '6',
    className: '6 / أ',
    participationCode: 'OM-601',
    completedQualifier: true,
    qualifierSubmittedAt: '١٠:١٥ ص',
    qualifierDurationSeconds: 1120,
    scores: {
      total: 460,
      speedScore: 95,
      logic: 92,
      science: 96,
      arabic: 88,
      observation: 94,
      math: 95,
      egypt_world: 90,
      general_culture: 90,
      technology: 100,
    },
    qualifiedForFinals: true,
    badges: ['🏆 عبقري الموسم', '🔬 عبقري العلوم'],
  },
  {
    id: 'stu-2',
    name: 'مريم خالد عبد الرحمن',
    grade: '6',
    className: '6 / ب',
    participationCode: 'OM-602',
    completedQualifier: true,
    qualifierSubmittedAt: '١٠:١٨ ص',
    qualifierDurationSeconds: 1080,
    scores: {
      total: 450,
      speedScore: 96,
      logic: 95,
      science: 90,
      arabic: 96,
      observation: 92,
      math: 89,
      egypt_world: 94,
      general_culture: 92,
      technology: 95,
    },
    qualifiedForFinals: true,
    badges: ['🧠 عبقري المنطق', '📚 عبقري اللغة'],
  },
  {
    id: 'stu-3',
    name: 'عمر طارق حسن',
    grade: '5',
    className: '5 / أ',
    participationCode: 'OM-501',
    completedQualifier: true,
    qualifierSubmittedAt: '١٠:٢٢ ص',
    qualifierDurationSeconds: 990,
    scores: {
      total: 435,
      speedScore: 98,
      logic: 88,
      science: 89,
      arabic: 85,
      observation: 96,
      math: 94,
      egypt_world: 88,
      general_culture: 90,
      technology: 95,
    },
    qualifiedForFinals: true,
    badges: ['👁️ عين الصقر', '⚡ أسرع بديهة'],
  },
  {
    id: 'stu-4',
    name: 'سلمى وائل فؤاد',
    grade: '4',
    className: '4 / أ',
    participationCode: 'OM-401',
    completedQualifier: true,
    qualifierSubmittedAt: '١٠:٢٥ ص',
    qualifierDurationSeconds: 1210,
    scores: {
      total: 420,
      speedScore: 91,
      logic: 90,
      science: 92,
      arabic: 90,
      observation: 89,
      math: 92,
      egypt_world: 91,
      general_culture: 88,
      technology: 90,
    },
    qualifiedForFinals: true,
    badges: ['➗ عبقري الحساب', '🌟 نجم المسابقة'],
  },
];

export const INITIAL_DEMO_TEAMS: Team[] = [
  {
    id: 'team-nile',
    name: '🔥 فريق النيل',
    emblem: '🔥',
    color: '#F59E0B',
    captainId: 'm-1',
    points: 340,
    wins: 4,
    matchesPlayed: 4,
    titleBadge: '🏆 عبقري الموسم',
    cards: { challengeCard: true, swapQuestionCard: true, doublePointsCard: true },
    members: [
      { id: 'm-1', name: 'يوسف أحمد محمود (القائد)', grade: '6' },
      { id: 'm-2', name: 'نور الدين سامح', grade: '6' },
      { id: 'm-3', name: 'جنى محمد علي', grade: '5' },
      { id: 'm-4', name: 'آدم شريف كمال', grade: '4' },
      { id: 'm-5', name: 'كريم هاني (احتياطي)', grade: '5', isReserve: true },
    ],
  },
  {
    id: 'team-geniuses',
    name: '⚡ فريق العباقرة',
    emblem: '⚡',
    color: '#38BDF8',
    captainId: 'm-6',
    points: 315,
    wins: 3,
    matchesPlayed: 4,
    titleBadge: '🧠 عبقري المنطق',
    cards: { challengeCard: true, swapQuestionCard: true, doublePointsCard: true },
    members: [
      { id: 'm-6', name: 'مريم خالد عبد الرحمن (القائد)', grade: '6' },
      { id: 'm-7', name: 'زياد أيمن فوزي', grade: '5' },
      { id: 'm-8', name: 'حبيبة عمرو نبيل', grade: '5' },
      { id: 'm-9', name: 'ياسين تامر جلال', grade: '4' },
      { id: 'm-10', name: 'ملك حسام (احتياطي)', grade: '4', isReserve: true },
    ],
  },
  {
    id: 'team-falcon',
    name: '🦅 فريق الصقر',
    emblem: '🦅',
    color: '#10B981',
    captainId: 'm-11',
    points: 290,
    wins: 2,
    matchesPlayed: 3,
    titleBadge: '👁️ عين الصقر',
    cards: { challengeCard: true, swapQuestionCard: true, doublePointsCard: false },
    members: [
      { id: 'm-11', name: 'عمر طارق حسن (القائد)', grade: '5' },
      { id: 'm-12', name: 'فريدة أشرف عادل', grade: '6' },
      { id: 'm-13', name: 'حمزة محمود سعيد', grade: '5' },
      { id: 'm-14', name: 'ليان مصطفى كمال', grade: '4' },
      { id: 'm-15', name: 'سيف الدين رامي (احتياطي)', grade: '6', isReserve: true },
    ],
  },
  {
    id: 'team-future',
    name: '🌟 فريق المستقبل',
    emblem: '🌟',
    color: '#A855F7',
    captainId: 'm-16',
    points: 275,
    wins: 2,
    matchesPlayed: 3,
    titleBadge: '🤝 أفضل روح فريق',
    cards: { challengeCard: true, swapQuestionCard: false, doublePointsCard: true },
    members: [
      { id: 'm-16', name: 'سلمى وائل فؤاد (القائد)', grade: '4' },
      { id: 'm-17', name: 'مازن علاء الدين', grade: '6' },
      { id: 'm-18', name: 'هنا محمد عزت', grade: '5' },
      { id: 'm-19', name: 'باسل مدحت شوقي', grade: '4' },
      { id: 'm-20', name: 'رقية سامي (احتياطي)', grade: '5', isReserve: true },
    ],
  },
];

export const INITIAL_SETTINGS: CompetitionSettings = {
  startDate: '2026-10-10',
  endDate: '2026-10-25',
  qualifierDurationMinutes: 30,
  qualifiedStudentsTarget: 64,
  tournamentBracketSize: 4,
  allowBackNavigationInQualifier: false,
  enableRiskPenalty: true,
  showResultsDuringQualifiers: true,
  activeRoundStatus: 'finals_live',
};

export const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 'match-sf-1',
    round: 'SF',
    team1Id: 'team-nile',
    team2Id: 'team-falcon',
    team1Score: 180,
    team2Score: 150,
    winnerId: 'team-nile',
    status: 'finished',
  },
  {
    id: 'match-sf-2',
    round: 'SF',
    team1Id: 'team-geniuses',
    team2Id: 'team-future',
    team1Score: 170,
    team2Score: 145,
    winnerId: 'team-geniuses',
    status: 'finished',
  },
  {
    id: 'match-final',
    round: 'FINAL',
    team1Id: 'team-nile',
    team2Id: 'team-geniuses',
    team1Score: 210,
    team2Score: 195,
    winnerId: 'team-nile',
    status: 'live',
  },
];
