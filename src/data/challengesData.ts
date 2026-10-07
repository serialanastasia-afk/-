import {
  JourneyNode,
  StudentProfile,
  Team,
  MatchItem,
  CompetitionSettings,
  CompetitionAward,
  AnnualQualificationPhase,
  MonthlyChallengeItem,
  RealPortfolioProject,
  SeasonOneConfig,
} from '../types/competition';
import abakeraOyounMisrProfile from '../assets/images/abakera_oyoun_misr_profile_1791291145794.jpg';
import abakeraOyounMisrBanner from '../assets/images/abakera_oyoun_misr_banner_1791291132965.jpg';
import appProfileGoldLogo from '../assets/images/app_profile_logo_gold_1791290529640.jpg';
import appProfileFalconCrest from '../assets/images/app_profile_falcon_crest_1791290541065.jpg';
import schoolCrestEmblem from '../assets/images/school_crest_emblem_1791274256508.jpg';

export const OFFICIAL_HERO_BANNER = abakeraOyounMisrBanner;

export const APP_PROFILE_PRESETS = [
  {
    id: 'preset-official-kids',
    name: 'بروفيل مسابقة دماغ عالية الرسمي (بلية والأبطال)',
    url: abakeraOyounMisrProfile,
  },
  {
    id: 'preset-official-banner',
    name: 'البانر الرسمي لمسابقة دماغ عالية',
    url: abakeraOyounMisrBanner,
  },
  {
    id: 'preset-gold-logo',
    name: 'شعار دماغ عالية الذهبي الملكي',
    url: appProfileGoldLogo,
  },
  {
    id: 'preset-falcon-crest',
    name: 'درع صقر دماغ عالية المتوّج',
    url: appProfileFalconCrest,
  },
  {
    id: 'preset-school-crest',
    name: 'الوسام الكلاسيكي للمسابقة',
    url: schoolCrestEmblem,
  },
];

// 🧭 خريطة رحلة دماغ عالية التفاعلية (9 محطات)
export const JOURNEY_NODES: JourneyNode[] = [
  {
    id: 'node-start',
    title: '🚀 بوابة البداية',
    subtitle: 'التسجيل والحصول على كود المشاركة وخوض التصفيات الفردية مع بلية',
    icon: '🚀',
    targetView: 'qualifiers',
    unlockedByDefault: true,
  },
  {
    id: 'node-logic',
    title: '🧠 مدينة الذكاء',
    subtitle: 'ألغاز الاستنتاج، الأنماط الذكية، وتحدي دماغ عالية',
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
    subtitle: 'غرفة دماغ عالية المغلقة: حل ٣ شفرات متتالية لفتح القفل النهائي',
    icon: '🔐',
    targetView: 'games_hub',
    gameTab: 'escape_room',
  },
  {
    id: 'node-champions',
    title: '🏆 قاعة الأبطال',
    subtitle: 'الأدوار الإقصائية للبطولة النهائية ولوحة شرف دماغ عالية',
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
    prompt: '🔢 Quick Math (English): Complete the pattern:  10  →  20  →  30  →  40  →  ... ?',
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
    question: 'طابور في فناء المدرسة يقف فيه «ياسين» بحيث يكون ترتيبه الخامس من الأمام، والخامس أيضاً من الخلف. كم عدد الطلاب في هذا الطابور؟',
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
    title: '🔬 Science Mystery: The Lotus Leaf Effect 🌸',
    factCard:
      'The leaves of the Egyptian Lotus flower are covered with a natural waxy layer. When water droplets fall on the leaf, they roll off and carry away dust particles, keeping the leaf clean and dry all the time!',
    question: 'How did scientists and engineers use this "Lotus Effect" in everyday life?',
    options: [
      'They invented self-cleaning paints, glass, and waterproof fabrics that repel water and dirt',
      'They made paper that dissolves in water immediately',
      'They stopped planting flowers in gardens',
      'They made heavy iron tires',
    ],
    correctIndex: 0,
    explanation: 'Biomimicry (learning from nature) helped engineers design self-cleaning surfaces inspired by the lotus leaf.',
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
    question: '🔥 50-Point Risk (Math & Geometry): When the clock shows exactly 3:00, what type of angle is formed between the hour hand and the minute hand?',
    options: ['Right angle (90°)', 'Straight angle (180°)', 'Obtuse angle (120°)', 'Zero angle (0°)'],
    correctIndex: 0,
    explanation: 'At 3:00, the hour and minute hands are perpendicular, forming a Right Angle (90 degrees).',
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
    title: '🚨 Genius Alarm (Mental Math Challenge in English)!',
    type: 'Mental Math & Focus',
    question:
      '🚌 An Oyoun Misr school bus started with 18 students. At the first stop, 5 students got off and 7 got on. At the second stop, 4 more students got on. How many students are on the bus now?',
    options: ['24 students', '20 students', '22 students', '26 students'],
    correctIndex: 0,
    doublePoints: 40,
  },
  {
    id: 'alm-2',
    title: '🚨 إنذار دماغ عالية: سؤال الملاحظة والبديهة الخاطفة!',
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
    title: 'بطل الموسم',
    desc: 'يُمنح لأعلى مجموع نقاط شامل وأداء استثنائي طوال مراحل البطولة',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-2',
    icon: '🧠',
    title: 'بطل المنطق',
    desc: 'يُمنح لأفضل أداء في ألغاز الاستنتاج، الأنماط، وتحدي مخ دماغ عالية',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-3',
    icon: '🔬',
    title: 'بطل العلوم',
    desc: 'يُمنح للتفوق في أسئلة العلوم والابتكار واستنتاج المعلومة الغامضة',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-4',
    icon: '➗',
    title: 'بطل الحساب',
    desc: 'يُمنح لبراعة الحساب الذهني السريع والأنماط والمعادلات الرياضية',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-5',
    icon: '📚',
    title: 'بطل اللغة',
    desc: 'يُمنح لإتقان القواعد النحوية، الإملاء، الفهم القرائي، وبلاغة اللغة العربية',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-6',
    icon: '👁️',
    title: 'عين الصقر',
    desc: 'يُمنح لدقة الملاحظة البصرية الخاطفة والذاكرة الصورية في ٥ ثوانٍ',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-7',
    icon: '⚡',
    title: 'أسرع بديهة',
    desc: 'يُمنح لأسرع استجابة صحيحة في جولات سرعة البرق وإنذار دماغ عالية',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-8',
    icon: '🎯',
    title: 'أفضل قرار',
    desc: 'يُمنح لأذكى اختيار استراتيجي في تحدي المخاطرة واستخدام الكروت الخاصة',
    categoryType: 'team',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-9',
    icon: '🤝',
    title: 'أفضل روح فريق',
    desc: 'يُمنح للتعاون المثالي، التشاور المنظم، والعمل الجماعي الراقي',
    categoryType: 'team',
    winnerType: null,
    winnerId: null,
  },
  {
    id: 'aw-10',
    icon: '🌟',
    title: 'نجم المسابقة',
    desc: 'يُمنح للتميز الشامل، الحضور المشرّف، والأخلاق الرياضية العالية',
    categoryType: 'both',
    winnerType: null,
    winnerId: null,
  },
];

// ⚠️ ZERO DEMO DATA IN PRODUCTION: All student, team, school, archive, and match lists start completely empty (real user-entered data only)
export const INITIAL_DEMO_STUDENTS: StudentProfile[] = [];

export const INITIAL_DEMO_TEAMS: Team[] = [];

export const DEFAULT_ANNUAL_PHASES: AnnualQualificationPhase[] = [
  {
    id: 'phase_1_school',
    order: 1,
    title: 'المرحلة ١: التمهيد وتصفيات المدارس (بداية العام الدراسي)',
    shortTitle: '١. تصفيات المدارس',
    monthsLabel: 'سبتمبر – أكتوبر',
    startDate: '2026-09-15',
    endDate: '2026-10-31',
    targetLevel: 'school',
    icon: '🏫',
    badgeColor: '#10B981',
    description:
      'فتح باب التسجيل لجميع طلاب المدارس في الـ27 محافظة، وإجراء التصفية الإلكترونية الأولى داخل كل مدرسة لاختيار أوائل كل مرحلة (ابتدائي صغير، ابتدائي كبير، إعدادي، ثانوي).',
    qualificationRule: 'يتأهل أفضل 5 طلاب من كل مرحلة داخل كل مدرسة إلى تصفيات الإدارة التعليمية تلقائياً.',
    questionsCount: 30,
    durationMinutes: 25,
    AdvancementQuotaLabel: 'أفضل 5 من كل مدرسة بكل مرحلة',
    status: 'completed',
  },
  {
    id: 'phase_2_administration',
    order: 2,
    title: 'المرحلة ٢: تصفيات الإدارات التعليمية وتكوين فرق المدارس',
    shortTitle: '٢. تصفيات الإدارات',
    monthsLabel: 'نوفمبر – ديسمبر',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    targetLevel: 'administration',
    icon: '🏛️',
    badgeColor: '#38BDF8',
    description:
      'تنافس أوائل المدارس على مستوى كل إدارة تعليمية في الـ27 محافظة، مع فتح باب تكوين الفرق المدرسية (4 أو 5 لاعبين) لخوض تحديات الخريف.',
    qualificationRule: 'يتأهل أفضل 15 طالباً وأفضل 3 مدارس من كل إدارة تعليمية إلى التحدي الشتوي وتصفيات القطاعات.',
    questionsCount: 40,
    durationMinutes: 30,
    AdvancementQuotaLabel: 'أفضل 15 طالباً + 3 مدارس بكل إدارة',
    status: 'active',
  },
  {
    id: 'phase_3_winter_sector',
    order: 3,
    title: 'المرحلة ٣: بطولة التحدي الشتوي وتصفيات قطاعات المحافظات',
    shortTitle: '٣. التحدي الشتوي',
    monthsLabel: 'يناير – فبراير',
    startDate: '2027-01-01',
    endDate: '2027-02-28',
    targetLevel: 'governorate',
    icon: '❄️',
    badgeColor: '#A855F7',
    description:
      'تحديات إلكترونية مكثفة خلال إجازة نصف العام وبداية الفصل الدراسي الثاني تشمل ألعاب السرعة والذكاء والمنطق بين أبطال الإدارات التعليمية.',
    qualificationRule: 'يتأهل أفضل 25 طالباً في كل مرحلة داخل المحافظة لخوض نهائيات أبطال المحافظات.',
    questionsCount: 45,
    durationMinutes: 30,
    AdvancementQuotaLabel: 'أفضل 25 طالباً بكل محافظة',
    status: 'upcoming',
  },
  {
    id: 'phase_4_governorate',
    order: 4,
    title: 'المرحلة ٤: تصفيات أبطال المحافظات الـ٢٧ (ربيع دماغ عالية)',
    shortTitle: '٤. تصفيات المحافظات',
    monthsLabel: 'مارس – أبريل',
    startDate: '2027-03-01',
    endDate: '2027-04-30',
    targetLevel: 'governorate',
    icon: '🗺️',
    badgeColor: '#F59E0B',
    description:
      'التصفية الحاسمة داخل كل محافظة من محافظات مصر الـ27 لتحديد «بطل المحافظة» في كل مرحلة تعليمية و«المدرسة الأولى بالمحافظة» المتأهلة لتمثيل المحافظة جمهورياً.',
    qualificationRule: 'يتأهل أوائل كل محافظة (أفضل 3 في كل مرحلة + الفريق البطل) إلى الأدوار الإقصائية للجمهورية.',
    questionsCount: 50,
    durationMinutes: 30,
    AdvancementQuotaLabel: 'أوائل الـ27 محافظة للجمهورية',
    status: 'upcoming',
  },
  {
    id: 'phase_5_republic_knockout',
    order: 5,
    title: 'المرحلة ٥: الأدوار الإقصائية الكبرى للجمهورية (دور الـ32 ← نصف النهائي)',
    shortTitle: '٥. إقصائيات الجمهورية',
    monthsLabel: 'مايو – يونيو',
    startDate: '2027-05-01',
    endDate: '2027-06-30',
    targetLevel: 'republic',
    icon: '⚔️',
    badgeColor: '#EC4899',
    description:
      'مواجهات مباشرة في استوديو دماغ عالية بين ممثلي المحافظات الـ27 (أفراد وفرق) بنظام خروج المغلوب والتصويت اللحظي للفرق وكروت الحسم.',
    qualificationRule: 'يصعد أفضل 4 أبطال وأفضل 4 فرق من كل مرحلة إلى مهرجان النهائيات الكبرى وتتويج الجمهورية.',
    questionsCount: 50,
    durationMinutes: 25,
    AdvancementQuotaLabel: 'المربع الذهبي للجمهورية',
    status: 'upcoming',
  },
  {
    id: 'phase_6_grand_finals',
    order: 6,
    title: 'المرحلة ٦: النهائيات الكبرى وكأس السوبر الصيفي لأبطال الجمهورية',
    shortTitle: '٦. نهائي الجمهورية',
    monthsLabel: 'يوليو – أغسطس',
    startDate: '2027-07-01',
    endDate: '2027-08-31',
    targetLevel: 'republic',
    icon: '🏆',
    badgeColor: '#D4AF37',
    description:
      'المهرجان الختامي السنوي لمسابقة «دماغ عالية»: تتويج أبطال الجمهورية في المراحل الأربع، منح درع أفضل مدرسة وأفضل محافظة، وإصدار الشهادات المعتمدة.',
    qualificationRule: 'تتويج بطل الجمهورية الأول والوصيف والمركز الثالث في كل مرحلة تعليمية.',
    questionsCount: 50,
    durationMinutes: 25,
    AdvancementQuotaLabel: '🏆 تتويج أبطال الجمهورية',
    status: 'upcoming',
  },
];

export const MONTHLY_GENIUS_CHALLENGES_12: MonthlyChallengeItem[] = [
  {
    monthNumber: 1,
    monthName: 'سبتمبر',
    seasonQuarter: 'الخريف',
    title: '🚀 انطلاقة العام الدراسي وفتح بوابة المدارس',
    focusDomain: 'المعرفة العامة واستكشاف المراحل',
    linkedPhaseId: 'phase_1_school',
    bonusPoints: 50,
    status: 'completed',
  },
  {
    monthNumber: 2,
    monthName: 'أكتوبر',
    seasonQuarter: 'الخريف',
    title: '🇪🇬 تحدي انتصارات أكتوبر وتصفيات المدارس',
    focusDomain: 'تاريخ وجغرافيا مصر + سرعة البديهة',
    linkedPhaseId: 'phase_1_school',
    bonusPoints: 75,
    status: 'completed',
  },
  {
    monthNumber: 3,
    monthName: 'نوفمبر',
    seasonQuarter: 'الخريف',
    title: '🏛️ انطلاق تصفيات الإدارات التعليمية',
    focusDomain: 'التفكير المنطقي والحساب الذهني',
    linkedPhaseId: 'phase_2_administration',
    bonusPoints: 80,
    status: 'live',
  },
  {
    monthNumber: 4,
    monthName: 'ديسمبر',
    seasonQuarter: 'الشتاء',
    title: '🔬 أولمبياد العلوم والابتكار للإدارات',
    focusDomain: 'العلوم والفضاء والتكنولوجيا',
    linkedPhaseId: 'phase_2_administration',
    bonusPoints: 90,
    status: 'live',
  },
  {
    monthNumber: 5,
    monthName: 'يناير',
    seasonQuarter: 'الشتاء',
    title: '❄️ كأس التحدي الشتوي لنصف العام',
    focusDomain: 'الألغاز البصرية ودقة الملاحظة (عين الصقر)',
    linkedPhaseId: 'phase_3_winter_sector',
    bonusPoints: 100,
    status: 'upcoming',
  },
  {
    monthNumber: 6,
    monthName: 'فبراير',
    seasonQuarter: 'الشتاء',
    title: '🧩 دوري فرق المدارس وتصفيات القطاعات',
    focusDomain: 'العمل الجماعي والتصويت اللحظي للفرق',
    linkedPhaseId: 'phase_3_winter_sector',
    bonusPoints: 100,
    status: 'upcoming',
  },
  {
    monthNumber: 7,
    monthName: 'مارس',
    seasonQuarter: 'الربيع',
    title: '🗺️ انطلاق تصفيات المحافظات الـ٢٧ الكبرى',
    focusDomain: 'اللغة العربية والأدب والبلاغة',
    linkedPhaseId: 'phase_4_governorate',
    bonusPoints: 120,
    status: 'upcoming',
  },
  {
    monthNumber: 8,
    monthName: 'أبريل',
    seasonQuarter: 'الربيع',
    title: '👑 حسم أبطال المحافظات وأفضل مدرسة بكل محافظة',
    focusDomain: 'بنك الأسئلة الشامل للمحافظات',
    linkedPhaseId: 'phase_4_governorate',
    bonusPoints: 130,
    status: 'upcoming',
  },
  {
    monthNumber: 9,
    monthName: 'مايو',
    seasonQuarter: 'الربيع',
    title: '⚔️ انطلاق دور الـ32 ودور الـ16 لبطولة الجمهورية',
    focusDomain: 'مواجهات استوديو دماغ عالية المباشرة',
    linkedPhaseId: 'phase_5_republic_knockout',
    bonusPoints: 150,
    status: 'upcoming',
  },
  {
    monthNumber: 10,
    monthName: 'يونيو',
    seasonQuarter: 'الصيف',
    title: '🔥 ربع النهائي ونصف النهائي للجمهورية',
    focusDomain: 'تحدي المخاطرة وسرقة النقاط وغرفة دماغ عالية',
    linkedPhaseId: 'phase_5_republic_knockout',
    bonusPoints: 175,
    status: 'upcoming',
  },
  {
    monthNumber: 11,
    monthName: 'يوليو',
    seasonQuarter: 'الصيف',
    title: '🏆 المهرجان الختامي ونهائي أبطال الجمهورية',
    focusDomain: 'المباراة النهائية الكبرى للمراحل الأربع',
    linkedPhaseId: 'phase_6_grand_finals',
    bonusPoints: 200,
    status: 'upcoming',
  },
  {
    monthNumber: 12,
    monthName: 'أغسطس',
    seasonQuarter: 'الصيف',
    title: '🌟 كأس السوبر الصيفي وتكريم أبطال الموسم',
    focusDomain: 'حفل التتويج وإصدار الشهادات وأرشفة الموسم',
    linkedPhaseId: 'phase_6_grand_finals',
    bonusPoints: 250,
    status: 'upcoming',
  },
];

export const SEASON_ONE_QUALIFIER_BLUEPRINT = {
  arabic: 5,
  math: 5,
  science: 4,
  egypt_world: 4,
  english: 4,
  general_culture: 4,
  logic: 4,
} as const;

export const SEASON_ONE_OFFICIAL_PHASES: SeasonOneConfig['officialPhases'] = [
  {
    phaseId: 'stage_1_qualifiers',
    order: 1,
    title: 'المرحلة الأولى: التأهيل',
    description:
      'اختبار التأهيل الإلكتروني الموحد للصفوف الرابع والخامس والسادس الابتدائي (30 سؤال اختيار من متعدد في 30 دقيقة، محاولة رسمية واحدة، الدرجة الأساسية = عدد الإجابات الصحيحة من 30، وسرعة الإنجاز عامل كسر تعادل فقط). لا تُفتح المرحلة إلا عند اكتمال بنك الأسئلة المعتمد وإعدادات الاختبار.',
    status: 'locked_until_ready',
    requiresQuestionBankComplete: true,
    questionsCount: 30,
    durationMinutes: 30,
    allowedAttempts: 1,
    questionFormat: 'multiple_choice',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowBackNavigation: true,
    wrongAnswerPoints: 0,
    unansweredPoints: 0,
    enableWrongAnswerPenalty: false,
    enableRiskPenalty: false,
    baseScoreRule: 'correct_count',
    tieBreakerRule: 'completion_speed',
    domainBlueprint: { ...SEASON_ONE_QUALIFIER_BLUEPRINT },
  },
  {
    phaseId: 'stage_2_semi_finals',
    order: 2,
    title: 'المرحلة الثانية: التصفيات النهائية',
    description:
      'مغلقة حاليًا — لا تُفتح إلا بعد انتهاء المرحلة الأولى (التأهيل) واعتماد المتأهلين وإعداد بنك أسئلتها الخاص.',
    status: 'locked_until_ready',
    requiresQuestionBankComplete: true,
    questionsCount: null,
    durationMinutes: null,
    allowedAttempts: 1,
    questionFormat: 'multiple_choice',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowBackNavigation: true,
    wrongAnswerPoints: 0,
    unansweredPoints: 0,
    enableWrongAnswerPenalty: false,
    enableRiskPenalty: false,
    baseScoreRule: 'correct_count',
    tieBreakerRule: 'completion_speed',
  },
  {
    phaseId: 'stage_3_finals',
    order: 3,
    title: 'المرحلة الثالثة: النهائي الكبير وتتويج الأبطال',
    description:
      'مغلقة حاليًا — المرحلة الختامية للموسم الأول (دماغ عالية — مسابقة المعرفة والذكاء والتفكير)، ولا تُفتح إلا بعد انتهاء المرحلة الثانية واعتماد المتأهلين للنهائي.',
    status: 'locked_until_ready',
    requiresQuestionBankComplete: true,
    questionsCount: null,
    durationMinutes: null,
    allowedAttempts: 1,
    questionFormat: 'multiple_choice',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowBackNavigation: true,
    wrongAnswerPoints: 0,
    unansweredPoints: 0,
    enableWrongAnswerPenalty: false,
    enableRiskPenalty: false,
    baseScoreRule: 'correct_count',
    tieBreakerRule: 'completion_speed',
  },
];

export const INITIAL_SETTINGS: CompetitionSettings = {
  appProfileImage: abakeraOyounMisrProfile,
  currentSeasonId: 'season_1',
  seasonName: 'الموسم الأول — دماغ عالية',
  seasonStatus: 'registration_open',
  resultsCertified: false,
  registrationStartDate: '',
  registrationEndDate: '',
  defaultSchoolName: '',
  defaultAdministration: '',
  defaultRegion: '',
  defaultCountry: 'مصر 🇪🇬',
  startDate: '',
  endDate: '',
  participatingStages: ['primary_upper'],
  participatingGrades: ['4', '5', '6'],
  officialPhases: SEASON_ONE_OFFICIAL_PHASES,
  qualifierBlueprint: { ...SEASON_ONE_QUALIFIER_BLUEPRINT },
  questionsCountPerExam: 30,
  qualifierDurationMinutes: 30,
  allowedAttemptsPerStudent: 1,
  scoringMethod: 'standard_points',
  enableElectronicTieBreaker: true,
  randomizeQuestionsOrder: true,
  randomizeOptionsOrder: true,
  qualificationPathMode: 'hierarchical',
  currentHierarchyLevel: 'administration',
  activeAnnualPhaseId: 'phase_2_administration',
  annualPhases: DEFAULT_ANNUAL_PHASES,
  stageQuotas: {
    primary_lower: 100,
    primary_upper: 150,
    preparatory: 100,
    secondary: 80,
  },
  allowStudentStageOverride: false,
  publicNamePrivacyMode: 'full_name',
  schoolScoringFormula: {
    avgStudentPointsWeight: 1.5,
    qualifiedStudentsBonus: 45,
    topThreePodiumBonus: 85,
    teamWinsBonus: 35,
    maxParticipationCapBonus: 90,
  },
  enabledGames: {
    classic_board: true,
    falcon_eye: true,
    lightning_speed: true,
    genius_brain: true,
    mystery_fact: true,
    risk_challenge: true,
    point_steal: true,
    mystery_box: true,
    no_talking: true,
    genius_alarm: true,
    egypt_minute: true,
    escape_room: true,
  },
  qualifiedStudentsTarget: 64,
  tournamentBracketSize: 4,
  allowBackNavigationInQualifier: true,
  enableRiskPenalty: false,
  showResultsDuringQualifiers: true,
  activeRoundStatus: 'qualifiers_open',
};

export const INITIAL_REGISTERED_SCHOOLS: any[] = [];

export const INITIAL_SEASONS_ARCHIVE: any[] = [];

export const INITIAL_MATCHES: MatchItem[] = [];

// 🌟 المشروعات الحقيقية فقط (بدون أي اختلاق لمعلومات أو روابط أو صور غير مقدمة)
export const INITIAL_REAL_PROJECTS: RealPortfolioProject[] = [
  {
    id: 'proj-oyoun-misr',
    name: 'دماغ عالية',
    description:
      'مسابقة المعرفة والذكاء والتفكير (بلية ودماغه عالية!) — منصة مسابقات تعليمية تفاعلية أونلاين مفتوحة لطلاب المدارس في جميع محافظات جمهورية مصر العربية.',
    category: 'competition',
    status: 'published',
    image: '',
    realUrl: '',
    features: [
      'مسابقة المعرفة والذكاء والتفكير بشخصية بلية (بلية ودماغه عالية!)',
      'تصفيات إلكترونية ذاتية ومنظمة حسب المراحل المعتمدة',
      'ترتيب عادل على مستوى المدرسة والإدارة التعليمية والمحافظة والجمهورية',
    ],
    content: 'منصة مسابقة دماغ عالية الرسمية المفتوحة للتسجيل والمشاركة الفعلية.',
    createdAt: '2026-10-07',
    isInternalPlatform: true,
  },
  {
    id: 'proj-nesmet-hayah',
    name: 'نسمة حياة',
    description: 'سيتم إضافة المحتوى قريبًا — بانتظار إدخال الوصف والتفاصيل الحقيقية من قسم إدارة المحتوى.',
    category: 'project',
    status: 'coming_soon',
    image: '',
    realUrl: '',
    features: [],
    content: '',
    createdAt: '2026-10-07',
  },
];
