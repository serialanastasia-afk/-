import { JourneyNode, StudentProfile, Team, MatchItem, CompetitionSettings, CompetitionAward } from '../types/competition';

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
    sceneTitle: 'مهرجان الأنشطة الرياضية والفنية بالمدرسة',
    items: [
      { icon: '⚽', label: 'كرة قدم', colorName: 'أبيض وأسود', numberBadge: 10, position: 'اليمين' },
      { icon: '🎨', label: 'لوحة ألوان', colorName: 'أصفر', numberBadge: 5, position: 'المنتصف' },
      { icon: '🏆', label: 'كأس البطولة', colorName: 'ذهبي', numberBadge: 1, position: 'اليسار' },
      { icon: '🎸', label: 'آلة موسيقية', colorName: 'أحمر', numberBadge: 8, position: 'الزاوية' },
    ],
    question: 'ما هو الرقم الذي كان مكتوباً على بطاقة «كرة القدم ⚽» في جهة اليمين؟',
    options: ['الرقم 10', 'الرقم 5', 'الرقم 1', 'الرقم 8'],
    correctIndex: 0,
    points: 20,
  },
  {
    id: 'fe-2',
    level: '👁️ عين دقيقة',
    sceneTitle: 'رحلة سياحية لمعالم مصر الجميلة',
    items: [
      { icon: '🦅', label: 'نسر العلم المصري', colorName: 'ذهبي', numberBadge: 15, position: 'الأعلى يمين' },
      { icon: '⛵', label: 'مركب شراعي بالنيل', colorName: 'أزرق', numberBadge: 30, position: 'الأعلى يسار' },
      { icon: '🏺', label: 'إناء فرعوني', colorName: 'برتقالي', numberBadge: 12, position: 'الأسفل يمين' },
      { icon: '🌴', label: 'نخلة مثمرة', colorName: 'أخضر', numberBadge: 25, position: 'الأسفل يسار' },
    ],
    question: 'أي عنصر كان لونه «أزرق» ويحمل الرقم 30 في اللوحة؟',
    options: ['المركب الشراعي بالنيل ⛵', 'النخلة المثمرة 🌴', 'نسر العلم 🦅', 'الإناء الفرعوني 🏺'],
    correctIndex: 0,
    points: 25,
  },
  {
    id: 'fe-3',
    level: '🦅 عين العبقري',
    sceneTitle: 'تحدي الذاكرة الفائقة للعباقرة الصغار',
    items: [
      { icon: '🏀', label: 'كرة سلة', colorName: 'برتقالي', numberBadge: 12, position: 'الركن الأول' },
      { icon: '🧭', label: 'بوصلة الكشافة', colorName: 'أخضر', numberBadge: 18, position: 'الركن الثاني' },
      { icon: '📚', label: 'موسوعة ثقافية', colorName: 'ذهبي', numberBadge: 20, position: 'الركن الثالث' },
      { icon: '🎭', label: 'قناع المسرح', colorName: 'بنفسجي', numberBadge: 40, position: 'الركن الرابع' },
    ],
    question: 'كم كان مجموع الرقمين الموجودين على «كرة السلة 🏀» و«بوصلة الكشافة 🧭» معاً؟',
    options: ['30 (12 + 18)', '32', '40', '28'],
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
    prompt: '⚽ رياضة سريعة: كم شوطاً أساسياً في مباراة كرة القدم؟',
    options: ['شوطان (كل شوط 45 دقيقة)', '4 أشواط', '3 أشواط', 'شوط واحد فقط'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-2',
    prompt: '🇪🇬 ثقافة مصرية: ما هي المحافظة المصرية التي تُلقب بـ «عروس البحر المتوسط»؟',
    options: ['الإسكندرية', 'أسوان', 'الفيوم', 'المنيا'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-3',
    prompt: '🤝 سلوك اجتماعي: ما الرقم السريع لطلب الإسعاف في مصر عند الطوارئ؟',
    options: ['123', '999', '100', '555'],
    correctIndex: 0,
    basePoints: 20,
  },
  {
    id: 'lt-4',
    prompt: '🔢 حساب خاطف: أكمل النمط السريع:  10  →  20  →  30  →  40  →  ؟',
    options: ['50', '45', '60', '55'],
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
    title: 'قصة اختراع «رياضة كرة السلة» 🏀',
    factCard:
      'في عام 1891، كان فصل الشتاء شديد البرودة والثلوج تمنع الطلاب من اللعب في الفناء الخارجي. فكر معلم التربية الرياضية «جيمس نايسميث» في ابتكار لعبة جماعية ممتعة داخل الصالة المغلقة، فقام بتعليق سلتين من سلال الخوخ على ارتفاع 3 أمتار، وطلب من الفريقين تمرير الكرة بالتعاون ورميها داخل السلة دون عنف!',
    question: 'بناءً على فهمك لهذه القصة الجديدة، ما الذي دفع المعلم «جيمس نايسميث» لابتكار رياضة كرة السلة؟',
    options: [
      'الرغبة في توفير رياضة جماعية آمنة وممتعة للطلاب داخل الصالة المغلقة أثناء برد الشتاء القارس',
      'الرغبة في بيع محصول الخوخ في السوق',
      'تدمير الكرات الجلدية القديمة',
      'منع الطلاب من ممارسة أي نشاط رياضي',
    ],
    correctIndex: 0,
    explanation: 'الحاجة أم الاختراع! ابتكر المعلم كرة السلة ليحافظ على نشاط الطلاب ولياقتهم داخل القاعة المغلقة في فصل الشتاء.',
    points: 30,
  },
  {
    id: 'mf-2',
    title: 'سر «حمام الزاجل» وساعي البريد قديماً 🕊️',
    factCard:
      'قبل اختراع الهواتف والإنترنت، اعتمد الناس في مصر والعالم على طائر ذكي يُسمى «الحمام الزاجل» لنقل الرسائل بين المدن البعيدة؛ لأن هذا الطائر يمتلك قدرة فطرية مدهشة على معرفة الاتجاهات والعودة دائماً إلى موطنه وعشه مهما طار لمسافات طويلة!',
    question: 'ماذا تستنتج من استخدام الناس للحمام الزاجل في نقل الرسائل قديماً؟',
    options: [
      'تميز الحمام الزاجل بذاكرة مكانية قوية وبوصلة طبيعية تجعله يعود لموطنه بدقة دون أن يضل الطريق',
      'أن الحمام الزاجل يستطيع قراءة الرسائل المكتوبة بالعربية',
      'أن الحمام الزاجل يطير تحت الماء',
      'أنه أبطأ من السلحفاة في الحركة',
    ],
    correctIndex: 0,
    explanation: 'يمتلك الحمام الزاجل قدرة عجيبة على تحديد المجال المغناطيسي للأرض والعودة إلى بيته بدقة.',
    points: 30,
  },
  {
    id: 'mf-3',
    title: 'زهرة اللوتس المصرية والأسطح النظيفة 🌸',
    factCard:
      'أوراق زهرة اللوتس المصرية مغطاة بطبقة شمعية طبيعية تجعل قطرات الماء تتدحرج فوقها وتأخذ معها ذرات الغبار، فتبقى الورقة نظيفة دائماً.',
    question: 'كيف استفاد المهندسون من ملاحظة ورقة اللوتس في حياتنا اليومية؟',
    options: [
      'صنعوا دهانات وزجاجاً وملابس لا يلتصق بها الماء أو التراب وتنظف نفسها بسهولة',
      'صنعوا ورقاً يذوب في الماء فوراً',
      'صنعوا إطارات سيارات ثقيلة',
      'قللوا من زراعة الزهور في الحدائق',
    ],
    correctIndex: 0,
    explanation: 'تقليد الطبيعة يساعد العلماء والمهندسين على ابتكار منتجات ذكية ومفيدة للإنسان.',
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
    question: 'مخاطرة 10 نقاط (🟢 سهل - رياضة): كم عدد أشواط الوقت الأصلي في مباراة كرة القدم؟',
    options: ['شوطان', '4 أشواط', '3 أشواط', 'شوط واحد'],
    correctIndex: 0,
    explanation: 'مباراة كرة القدم تتكون من شوطين، مدة كل شوط 45 دقيقة.',
  },
  {
    id: 'rk-20',
    tier: 20,
    question: 'مخاطرة 20 نقطة (🟡 متوسط - دراسات ومجتمع): كم عدد محافظات جمهورية مصر العربية؟',
    options: ['27 محافظة', '20 محافظة', '32 محافظة', '19 محافظة'],
    correctIndex: 0,
    explanation: 'تتكون جمهورية مصر العربية من 27 محافظة.',
  },
  {
    id: 'rk-30',
    tier: 30,
    question: 'مخاطرة 30 نقطة (🔴 صعب - ثقافة ورياضة): في أي دولة عربية أُقيمت بطولة كأس العالم لكرة القدم عام 2022 لأول مرة في الوطن العربي؟',
    options: ['دولة قطر الشقيقة', 'البرازيل', 'فرنسا', 'اليابان'],
    correctIndex: 0,
    explanation: 'استضافت دولة قطر بطولة كأس العالم 2022 كأول دولة عربية تنظم البطولة.',
  },
  {
    id: 'rk-50',
    tier: 50,
    question: 'مخاطرة 50 نقطة (🔥 تحدي الأبطال - ذكاء وحساب): إذا كانت الساعة تشير إلى 3:00 تماماً، فما نوع الزاوية المتكونة بين عقرب الساعات وعقرب الدقائق؟',
    options: ['زاوية قائمة (90 درجة)', 'زاوية مستقيمة (180 درجة)', 'زاوية منفرجة', 'زاوية صفرية'],
    correctIndex: 0,
    explanation: 'عند الساعة الثالثة تماماً يتعامد العقربان فيشكلان زاوية قائمة قياسها 90 درجة.',
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
    boxName: '⚽ صندوق الرياضة والأبطال',
    icon: '⚽',
    surpriseEffect: 'سؤال رياضي ممتع بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما اسم البطولة الكروية الكبرى التي فاز بها منتخب مصر الوطني 7 مرات (وهو الرقم القياسي في قارتنا)؟',
    options: ['كأس الأمم الأفريقية', 'كأس آسيا', 'كأس أوروبا', 'دوري أبطال أوروبا'],
    correctIndex: 0,
  },
  {
    id: 'box-iq',
    boxName: '🧠 صندوق الذكاء والفوازير',
    icon: '🧠',
    surpriseEffect: 'فزورة ذكية بقيمة 30 نقطة!',
    bonusPoints: 30,
    question: 'شيء يمشي بلا أرجل، ويبكي بلا عيون، ويسقي الزرع والأشجار.. فما هو؟',
    options: ['السحاب (المطر)', 'الرياح', 'الساعة', 'الظل'],
    correctIndex: 0,
  },
  {
    id: 'box-egy',
    boxName: '🇪🇬 صندوق مصر والمجتمع',
    icon: '🇪🇬',
    surpriseEffect: 'تحدي وطني واجتماعي بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما هي المدينة المصرية الجميلة في جنوب سيناء التي تُلقب بـ «مدينة السلام»؟',
    options: ['شرم الشيخ', 'دمياط', 'طنطا', 'المحلة الكبرى'],
    correctIndex: 0,
  },
  {
    id: 'box-arb',
    boxName: '📚 صندوق اللغة والفنون',
    icon: '📚',
    surpriseEffect: 'سؤال لغة وثقافة بقيمة 25 نقطة!',
    bonusPoints: 25,
    question: 'ما اسم الفن الجميل الذي يعتمد على تحسين كتابة الحروف العربية بأشكال مزخرفة كالنسخ والرقعة والثلث؟',
    options: ['فن الخط العربي', 'فن النحت على الجليد', 'فن التمثيل الصامت', 'فن الأوريجامي'],
    correctIndex: 0,
  },
  {
    id: 'box-black',
    boxName: '🎲 الصندوق الأسود للمفاجآت',
    icon: '🎲',
    isBlackBox: true,
    surpriseEffect: 'مفاجأة الصندوق الأسود! نقاط مضاعفة (50 نقطة) للفريق!',
    bonusPoints: 50,
    question: 'سؤال الصندوق الأسود المفاجئ: شهر في السنة الميلادية إذا حذفتَ حرفَه الأول تحوّل إلى اسم «فاكهة لذيذة».. ما هو هذا الشهر؟',
    options: ['شهر تموز (إذا حذفنا التاء يصبح: موز!)', 'شهر يناير', 'شهر مارس', 'شهر أكتوبر'],
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

export const OFFICIAL_AWARDS: CompetitionAward[] = [
  {
    id: 'aw-1',
    icon: '🏆',
    title: 'عبقري الموسم',
    desc: 'يُمنح لأعلى مجموع نقاط شامل وأداء استثنائي طوال مراحل البطولة',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-1',
    citationNote: 'تحقيق المركز الأول في التصفيات الفردية وقيادة فريقه نحو القمة',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-2',
    icon: '🧠',
    title: 'عبقري المنطق',
    desc: 'يُمنح لأفضل أداء في ألغاز الاستنتاج، الأنماط، وتحدي مخ العباقرة',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-2',
    citationNote: 'حل جميع ألغاز الاستنتاج المنطقي المعقدة بدون أخطاء',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-3',
    icon: '🔬',
    title: 'عبقري العلوم',
    desc: 'يُمنح للتفوق في أسئلة العلوم والابتكار واستنتاج المعلومة الغامضة',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-1',
    citationNote: 'درجة متميزة (٩٦٪) في محور العلوم واستنتاج ظاهرة اللوتس العلمية',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-4',
    icon: '➗',
    title: 'عبقري الحساب',
    desc: 'يُمنح لبراعة الحساب الذهني السريع والأنماط والمعادلات الرياضية',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-4',
    citationNote: 'سرعة فائقة ودقة كاملة في مسائل الحساب الذهني والهندسة',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-5',
    icon: '📚',
    title: 'عبقري اللغة',
    desc: 'يُمنح لإتقان القواعد النحوية، الإملاء، الفهم القرائي، وبلاغة اللغة العربية',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-2',
    citationNote: 'إتقان كامل للإعراب والمفردات اللغوية في التصفيات والنهائيات',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-6',
    icon: '👁️',
    title: 'عين الصقر',
    desc: 'يُمنح لدقة الملاحظة البصرية الخاطفة والذاكرة الصورية في ٥ ثوانٍ',
    categoryType: 'both',
    winnerType: 'team',
    winnerId: 'team-falcon',
    citationNote: 'اجتياز مستويات لعبة عين الصقر الثلاثة بالعلامة الكاملة',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-7',
    icon: '⚡',
    title: 'أسرع بديهة',
    desc: 'يُمنح لأسرع استجابة صحيحة في جولات سرعة البرق وإنذار العباقرة',
    categoryType: 'both',
    winnerType: 'student',
    winnerId: 'stu-3',
    citationNote: 'تحقيق أعلى معدل سرعة استجابة (٩٨٪) في البطولة',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-8',
    icon: '🎯',
    title: 'أفضل قرار',
    desc: 'يُمنح لأذكى اختيار استراتيجي في تحدي المخاطرة واستخدام الكروت الخاصة',
    categoryType: 'team',
    winnerType: 'team',
    winnerId: 'team-nile',
    citationNote: 'اختيار توقيت مثالي لكارت مضاعفة النقاط وتحدي الـ٥٠ نقطة',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-9',
    icon: '🤝',
    title: 'أفضل روح فريق',
    desc: 'يُمنح للتعاون المثالي، التشاور المنظم، والعمل الجماعي الراقي',
    categoryType: 'team',
    winnerType: 'team',
    winnerId: 'team-future',
    citationNote: 'تعاون رائع بين القائد والأعضاء في غرفة العباقرة ولعبة ممنوع الكلام',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
  {
    id: 'aw-10',
    icon: '🌟',
    title: 'نجم المسابقة',
    desc: 'يُمنح للتميز الشامل، الحضور المشرّف، والأخلاق الرياضية العالية',
    categoryType: 'both',
    winnerType: 'team',
    winnerId: 'team-geniuses',
    citationNote: 'أداء مشرف وثبات في المستوى طوال جولات البطولة المدرسية',
    awardedAt: 'أكتوبر ٢٠٢٦',
  },
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
