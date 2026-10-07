import {
  QualifierQuestion,
  StudentProfile,
  CompetitionSettings,
  EducationalStage,
  GradeNumber,
  QualifierDomain,
  DifficultyLevel,
  SpecialCaseAlert,
  AuditLogEntry,
  SeasonLifecycleStatus,
  HierarchyLevel,
  SchoolType,
  SchoolScoringFormula,
} from '../types/competition';

// ============================================================================
// 0. 🇪🇬 EGYPT'S 27 GOVERNORATES & SCHOOL TYPES METADATA
// ============================================================================

export const EGYPT_27_GOVERNORATES: {
  name: string;
  regionGroup: 'القاهرة الكبرى' | 'الإسكندرية والساحل' | 'الدلتا' | 'مدن القناة وسيناء' | 'صعيد مصر والوادي';
  defaultAdministrations: string[];
}[] = [
  { name: 'القاهرة', regionGroup: 'القاهرة الكبرى', defaultAdministrations: ['إدارة المعادي التعليمية', 'إدارة مدينة نصر التعليمية', 'إدارة مصر الجديدة التعليمية', 'إدارة القاهرة الجديدة التعليمية', 'إدارة شبرا التعليمية'] },
  { name: 'الجيزة', regionGroup: 'القاهرة الكبرى', defaultAdministrations: ['إدارة الدقي التعليمية', 'إدارة 6 أكتوبر التعليمية', 'إدارة الشيخ زايد التعليمية', 'إدارة الهرم التعليمية', 'إدارة العجوزة التعليمية'] },
  { name: 'القليوبية', regionGroup: 'القاهرة الكبرى', defaultAdministrations: ['إدارة بنها التعليمية', 'إدارة العبور التعليمية', 'إدارة شبرا الخيمة التعليمية', 'إدارة قليوب التعليمية'] },
  { name: 'الإسكندرية', regionGroup: 'الإسكندرية والساحل', defaultAdministrations: ['إدارة شرق الإسكندرية التعليمية', 'إدارة وسط الإسكندرية التعليمية', 'إدارة المنتزه التعليمية', 'إدارة برج العرب التعليمية', 'إدارة العجمي التعليمية'] },
  { name: 'البحيرة', regionGroup: 'الإسكندرية والساحل', defaultAdministrations: ['إدارة دمنهور التعليمية', 'إدارة كفر الدوار التعليمية', 'إدارة رشيد التعليمية'] },
  { name: 'مطروح', regionGroup: 'الإسكندرية والساحل', defaultAdministrations: ['إدارة مرسى مطروح التعليمية', 'إدارة العلمين التعليمية', 'إدارة الحمام التعليمية'] },
  { name: 'الدقهلية', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة غرب المنصورة التعليمية', 'إدارة شرق المنصورة التعليمية', 'إدارة ميت غمر التعليمية', 'إدارة طلخا التعليمية'] },
  { name: 'الغربية', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة طنطا التعليمية', 'إدارة المحلة الكبرى التعليمية', 'إدارة كفر الزيات التعليمية'] },
  { name: 'الشرقية', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة الزقازيق التعليمية', 'إدارة العاشر من رمضان التعليمية', 'إدارة بلبيس التعليمية'] },
  { name: 'المنوفية', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة شبين الكوم التعليمية', 'إدارة مدينة السادات التعليمية', 'إدارة منوف التعليمية'] },
  { name: 'كفر الشيخ', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة كفر الشيخ التعليمية', 'إدارة دسوق التعليمية', 'إدارة بلطيم التعليمية'] },
  { name: 'دمياط', regionGroup: 'الدلتا', defaultAdministrations: ['إدارة دمياط التعليمية', 'إدارة دمياط الجديدة التعليمية', 'إدارة فارسكور التعليمية'] },
  { name: 'بورسعيد', regionGroup: 'مدن القناة وسيناء', defaultAdministrations: ['إدارة شرق بورسعيد التعليمية', 'إدارة شمال بورسعيد التعليمية', 'إدارة بورفؤاد التعليمية'] },
  { name: 'الإسماعيلية', regionGroup: 'مدن القناة وسيناء', defaultAdministrations: ['إدارة شمال الإسماعيلية التعليمية', 'إدارة جنوب الإسماعيلية التعليمية', 'إدارة القنطرة التعليمية'] },
  { name: 'السويس', regionGroup: 'مدن القناة وسيناء', defaultAdministrations: ['إدارة شمال السويس التعليمية', 'إدارة جنوب السويس التعليمية', 'إدارة عتاقة التعليمية'] },
  { name: 'شمال سيناء', regionGroup: 'مدن القناة وسيناء', defaultAdministrations: ['إدارة العريش التعليمية', 'إدارة بئر العبد التعليمية'] },
  { name: 'جنوب سيناء', regionGroup: 'مدن القناة وسيناء', defaultAdministrations: ['إدارة طور سيناء التعليمية', 'إدارة شرم الشيخ التعليمية', 'إدارة دهب التعليمية'] },
  { name: 'الفيوم', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة غرب الفيوم التعليمية', 'إدارة شرق الفيوم التعليمية', 'إدارة سنورس التعليمية'] },
  { name: 'بني سويف', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة بني سويف التعليمية', 'إدارة الواسطى التعليمية'] },
  { name: 'المنيا', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة المنيا التعليمية', 'إدارة ملوي التعليمية', 'إدارة مغاغة التعليمية'] },
  { name: 'أسيوط', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة أسيوط التعليمية', 'إدارة ديروط التعليمية', 'إدارة منفلوط التعليمية'] },
  { name: 'سوهاج', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة سوهاج التعليمية', 'إدارة أخميم التعليمية', 'إدارة طهطا التعليمية'] },
  { name: 'قنا', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة قنا التعليمية', 'إدارة نجع حمادي التعليمية', 'إدارة قوص التعليمية'] },
  { name: 'الأقصر', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة الأقصر التعليمية', 'إدارة إسنا التعليمية', 'إدارة القرنة التعليمية'] },
  { name: 'أسوان', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة أسوان التعليمية', 'إدارة إدفو التعليمية', 'إدارة كوم أمبو التعليمية'] },
  { name: 'البحر الأحمر', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة الغردقة التعليمية', 'إدارة سفاجا التعليمية', 'إدارة القصير التعليمية'] },
  { name: 'الوادي الجديد', regionGroup: 'صعيد مصر والوادي', defaultAdministrations: ['إدارة الخارجة التعليمية', 'إدارة الداخلة التعليمية'] },
];

export const SCHOOL_TYPE_LABELS: Record<SchoolType, string> = {
  official_arabic: 'حكومي عربي',
  official_languages: 'رسمي لغات / متميز لغات',
  private_arabic: 'خاص عربي',
  private_languages: 'خاص لغات',
  international: 'دولي (International)',
  stem_feweq: 'مدارس المتفوقين (STEM)',
  azhari: 'معهد أزهري',
};

export const NATIONAL_BADGE_CATALOG: { id: string; badge: string; desc: string }[] = [
  { id: 'nb-1', badge: '🏅 أول مشاركة', desc: 'يُمنح تلقائياً عند إتمام التسجيل وخوض أول جولة في المسابقة' },
  { id: 'nb-2', badge: '🧠 عبقري المنطق', desc: 'تحقيق 85% فأكثر في أسئلة التفكير المنطقي والاستنتاج' },
  { id: 'nb-3', badge: '🔬 عالم صغير', desc: 'التفوق في أسئلة العلوم والابتكار والطبيعة' },
  { id: 'nb-4', badge: '➗ ملك الحساب', desc: 'إتقان الحساب الذهني والرياضيات السريعة' },
  { id: 'nb-5', badge: '📚 فارس اللغة', desc: 'التميز في اللغة العربية والمفردات والبلاغة' },
  { id: 'nb-6', badge: '👁️ عين الصقر', desc: 'قوة الملاحظة البصرية واكتشاف الأنماط والاختلافات' },
  { id: 'nb-7', badge: '⚡ أسرع بديهة', desc: 'الإجابة الصحيحة السريعة بمعدل سرعة يفوق 90%' },
  { id: 'nb-8', badge: '🎯 خبير المخاطرة', desc: 'النجاح في تحديات المخاطرة والكروت الاستراتيجية' },
  { id: 'nb-9', badge: '🏆 بطل المحافظة', desc: 'تصدر ترتيب المرحلة التعليمية على مستوى المحافظة' },
  { id: 'nb-10', badge: '🇪🇬 بطل الجمهورية', desc: 'الوصول إلى المراكز الثلاثة الأولى على مستوى الجمهورية في مرحلته' },
];

/**
 * Formats student name for public leaderboards according to Child Privacy Settings (#23).
 * Never exposes phone numbers or personal data publicly.
 */
export function formatStudentPublicName(
  fullName: string,
  privacyMode: 'full_name' | 'abbreviated_name' = 'full_name'
): string {
  if (!fullName) return 'متسابق';
  if (privacyMode !== 'abbreviated_name') return fullName;
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  const first = parts[0];
  const secondInitial = parts[1] ? `${parts[1].charAt(0)}.` : '';
  const thirdInitial = parts[2] ? ` ${parts[2].charAt(0)}.` : '';
  return `${first} ${secondInitial}${thirdInitial}`;
}

// ============================================================================
// 1. 🏫 STAGE & GRADE AUTO-GROUPING ENGINE (محرك توزيع المراحل والصفوف تلقائياً)
// ============================================================================

export const STAGE_METADATA: Record<
  EducationalStage,
  {
    label: string;
    shortLabel: string;
    grades: GradeNumber[];
    badgeColor: string;
    defaultQuota: number;
  }
> = {
  primary_lower: {
    label: 'ابتدائي صغير (الصفوف ١ - ٣)',
    shortLabel: 'ابتدائي صغير',
    grades: ['1', '2', '3'],
    badgeColor: '#38BDF8',
    defaultQuota: 100,
  },
  primary_upper: {
    label: 'ابتدائي كبير (الصفوف ٤ - ٦)',
    shortLabel: 'ابتدائي كبير',
    grades: ['4', '5', '6'],
    badgeColor: '#10B981',
    defaultQuota: 150,
  },
  preparatory: {
    label: 'المرحلة الإعدادية (١ع - ٣ع)',
    shortLabel: 'إعدادي',
    grades: ['7', '8', '9'],
    badgeColor: '#F59E0B',
    defaultQuota: 100,
  },
  secondary: {
    label: 'المرحلة الثانوية (١ث - ٣ث)',
    shortLabel: 'ثانوي',
    grades: ['10', '11', '12'],
    badgeColor: '#A855F7',
    defaultQuota: 80,
  },
};

export const GRADE_LABELS: Record<GradeNumber, string> = {
  '1': 'الصف الأول الابتدائي',
  '2': 'الصف الثاني الابتدائي',
  '3': 'الصف الثالث الابتدائي',
  '4': 'الصف الرابع الابتدائي',
  '5': 'الصف الخامس الابتدائي',
  '6': 'الصف السادس الابتدائي',
  '7': 'الصف الأول الإعدادي',
  '8': 'الصف الثاني الإعدادي',
  '9': 'الصف الثالث الإعدادي',
  '10': 'الصف الأول الثانوي',
  '11': 'الصف الثاني الثانوي',
  '12': 'الصف الثالث الثانوي',
};

/**
 * Automatically maps any grade ('1'..'12') to its exact EducationalStage
 * so primary_lower != primary_upper != preparatory != secondary.
 */
export function resolveStageFromGrade(grade: GradeNumber): EducationalStage {
  if (['1', '2', '3'].includes(grade)) return 'primary_lower';
  if (['4', '5', '6'].includes(grade)) return 'primary_upper';
  if (['7', '8', '9'].includes(grade)) return 'preparatory';
  return 'secondary';
}

/**
 * Builds the automatic hierarchy path string for a student:
 * e.g., "ابتدائي كبير ← الصف الخامس ← القاهرة ← إدارة المعادي ← مدرسة عيون مصر للغات"
 */
export function buildStudentGroupingPath(student: Partial<StudentProfile>): string {
  const grade = (student.grade || '5') as GradeNumber;
  const stage = student.stage || resolveStageFromGrade(grade);
  const stageLabel = STAGE_METADATA[stage].shortLabel;
  const gradeLabel = GRADE_LABELS[grade] || `صف ${grade}`;
  const gov = student.governorate || student.region || 'المحافظة';
  const admin = student.administration || 'الإدارة التعليمية';
  const school = student.schoolName || 'المدرسة';
  return `${stageLabel} ← ${gradeLabel} ← ${gov} ← ${admin} ← ${school}`;
}

// ============================================================================
// 2. 🧠 SMART QUESTION BANK & BALANCED RANDOMIZATION ENGINE (بنك الأسئلة الذكي والعادل)
// ============================================================================

/**
 * Deterministic seeded PRNG so each student gets a unique, fair, reproducible
 * question set and option order without mixing stages or breaking difficulty fairness.
 */
function createSeededRandom(seedStr: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    hash ^= seedStr.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += hash << 13;
    hash ^= hash >>> 7;
    hash += hash << 3;
    hash ^= hash >>> 17;
    hash += hash << 5;
    return (hash >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: T[], rand: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
}

const SEASON_ONE_OFFICIAL_DOMAINS: QualifierDomain[] = [
  'arabic',
  'math',
  'science',
  'egypt_world',
  'english',
  'general_culture',
  'logic',
];

/**
 * Validates a question against the official Season 1 schema and business rules:
 * - Non-empty question text
 * - Exactly 4 non-empty distinct options
 * - Valid correctIndex (0..3)
 * - Valid domain (one of the 7 official domains)
 * - Valid grade ('4', '5', '6', or 'all')
 * - Valid stage ('primary_upper' or 'all')
 * - Valid difficulty ('easy' | 'medium' | 'hard')
 */
export function validateOfficialQuestion(
  q: Partial<QualifierQuestion>,
  existingQuestions: QualifierQuestion[] = [],
  editingId?: string | null
): QuestionValidationResult {
  const errors: string[] = [];
  const trimmedQuestion = (q.question || '').trim();
  if (!trimmedQuestion) {
    errors.push('نص السؤال مطلوب ولا يمكن أن يكون فارغًا.');
  }

  if (!q.domain || !SEASON_ONE_OFFICIAL_DOMAINS.includes(q.domain)) {
    errors.push('يرجى اختيار مجال رسمي معتمد من المجالات الـ7 للموسم الأول.');
  }

  const validGrades: (GradeNumber | 'all')[] = ['4', '5', '6', 'all'];
  if (!q.grade || !validGrades.includes(q.grade)) {
    errors.push('الصف الدراسي للسؤال يجب أن يكون ضمن الصفوف المعتمدة (٤ أو ٥ أو ٦ أو جميع الصفوف ٤-٦).');
  }

  if (q.stage && q.stage !== 'primary_upper' && q.stage !== 'all') {
    errors.push('المرحلة التعليمية للسؤال يجب أن تكون المرحلة الابتدائية العليا (primary_upper).');
  }

  const validDiffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  if (!q.difficulty || !validDiffs.includes(q.difficulty)) {
    errors.push('مستوى الصعوبة يجب أن يكون: سهل (easy) أو متوسط (medium) أو صعب (hard).');
  }

  if (!Array.isArray(q.options) || q.options.length !== 4) {
    errors.push('يجب إدخال ٤ اختيارات كاملة للسؤال.');
  } else {
    const trimmedOpts = q.options.map((o) => (typeof o === 'string' ? o.trim() : ''));
    if (trimmedOpts.some((o) => !o)) {
      errors.push('جميع الاختيارات الأربعة مطلوبة ولا يُسمح بترك أي اختيار فارغًا.');
    }
    const uniqueOpts = new Set(trimmedOpts.map((o) => o.toLowerCase()));
    if (trimmedOpts.every(Boolean) && uniqueOpts.size < 4) {
      errors.push('يجب أن تكون الاختيارات الأربعة مختلفة وغير مكررة داخل نفس السؤال.');
    }
  }

  if (
    typeof q.correctIndex !== 'number' ||
    !Number.isInteger(q.correctIndex) ||
    q.correctIndex < 0 ||
    q.correctIndex > 3
  ) {
    errors.push('يجب تحديد إجابة صحيحة واحدة فقط من الاختيارات الأربعة (0 إلى 3).');
  }

  if (trimmedQuestion && existingQuestions.length > 0) {
    const normalizedNew = trimmedQuestion.replace(/\s+/g, ' ').toLowerCase();
    const duplicate = existingQuestions.find(
      (item) =>
        item.id !== editingId &&
        (item.question || '').trim().replace(/\s+/g, ' ').toLowerCase() === normalizedNew
    );
    if (duplicate) {
      errors.push('هذا السؤال موجود بالفعل في بنك الأسئلة (يُمنع تكرار نفس نص السؤال).');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export interface QuestionBankReadinessReport {
  isReady: boolean;
  totalRequired: number;
  totalAvailable: number;
  totalInBank: number;
  draftCount: number;
  archivedCount: number;
  fulfilledCount: number;
  domainStatus: {
    domain: QualifierDomain;
    required: number;
    available: number;
    totalDomainInBank: number;
    shortage: number;
    isComplete: boolean;
  }[];
  missingDomains: {
    domain: QualifierDomain;
    required: number;
    available: number;
    shortage: number;
  }[];
  missingTotal: number;
}

/**
 * Checks whether a question is approved, published, and valid for official Season 1 exams.
 * Supports both full admin questions (with `correctIndex`) and sanitized public delivery questions
 * (where `correctIndex` is intentionally stripped for security).
 */
export function isQuestionApprovedAndPublished(
  q: QualifierQuestion,
  requireAnswerKey = false
): boolean {
  if (!q || !q.id || typeof q.question !== 'string' || !q.question.trim()) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  if (q.options.some((opt) => typeof opt !== 'string' || !opt.trim())) return false;
  if (requireAnswerKey) {
    if (
      typeof q.correctIndex !== 'number' ||
      q.correctIndex < 0 ||
      q.correctIndex >= q.options.length
    ) {
      return false;
    }
  }
  const status = q.reviewStatus || 'approved';
  const isPub = q.published !== undefined ? q.published : status === 'approved';
  return status === 'approved' && isPub === true;
}

/**
 * Deduplicates questions by both `id` and normalized question text (`question.trim()`)
 * and filters to verified, approved, and published questions eligible for Season 1 (`primary_upper` / Grades 4, 5, 6).
 */
export function getDeduplicatedSeasonOnePool(
  allQuestions: QualifierQuestion[],
  eligibleGrades: GradeNumber[] = ['4', '5', '6'],
  targetPhaseId: 'stage_1_qualifiers' | 'stage_2_semi_finals' | 'stage_3_finals' = 'stage_1_qualifiers'
): QualifierQuestion[] {
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();
  const result: QualifierQuestion[] = [];

  for (const q of allQuestions) {
    if (!isQuestionApprovedAndPublished(q)) continue;
    if (q.seasonId && q.seasonId !== 'season_1') continue;
    if (q.phaseId && q.phaseId !== targetPhaseId) continue;
    if (q.stage && q.stage !== 'all' && q.stage !== 'primary_upper') continue;
    if (q.grade && q.grade !== 'all' && !eligibleGrades.includes(q.grade)) continue;

    const normText = q.question.trim().replace(/\s+/g, ' ').toLowerCase();
    if (!normText) continue;
    if (seenIds.has(q.id) || seenTexts.has(normText)) continue;

    seenIds.add(q.id);
    seenTexts.add(normText);
    result.push(q);
  }

  return result;
}

/**
 * Evaluates whether the official question bank satisfies the Season 1 30-question
 * blueprint across the 7 official domains for Grades 4, 5, and 6 (`primary_upper`).
 * Stage 1 (Qualifiers) cannot be opened for official attempts until `isReady === true`.
 */
export function evaluateSeasonOneQuestionBankReadiness(
  allQuestions: QualifierQuestion[],
  settings?: CompetitionSettings
): QuestionBankReadinessReport {
  const blueprint = settings?.qualifierBlueprint || {
    arabic: 5,
    math: 5,
    science: 4,
    egypt_world: 4,
    english: 4,
    general_culture: 4,
    logic: 4,
  };

  const eligibleGrades: GradeNumber[] =
    settings?.participatingGrades && settings.participatingGrades.length > 0
      ? settings.participatingGrades
      : ['4', '5', '6'];

  const eligiblePool = getDeduplicatedSeasonOnePool(
    allQuestions,
    eligibleGrades,
    'stage_1_qualifiers'
  );

  const totalInBank = allQuestions.length;
  const draftCount = allQuestions.filter(
    (q) => q.reviewStatus === 'draft' || q.published === false
  ).length;
  const archivedCount = allQuestions.filter((q) => q.reviewStatus === 'archived').length;

  const requiredDomains: { domain: QualifierDomain; required: number }[] = [
    { domain: 'arabic', required: blueprint.arabic ?? 5 },
    { domain: 'math', required: blueprint.math ?? 5 },
    { domain: 'science', required: blueprint.science ?? 4 },
    { domain: 'egypt_world', required: blueprint.egypt_world ?? 4 },
    { domain: 'english', required: blueprint.english ?? 4 },
    { domain: 'general_culture', required: blueprint.general_culture ?? 4 },
    { domain: 'logic', required: blueprint.logic ?? 4 },
  ];

  const domainStatus = requiredDomains.map(({ domain, required }) => {
    const available = eligiblePool.filter((q) => q.domain === domain).length;
    const totalDomainInBank = allQuestions.filter((q) => q.domain === domain).length;
    const shortage = Math.max(0, required - available);
    return {
      domain,
      required,
      available,
      totalDomainInBank,
      shortage,
      isComplete: available >= required && shortage === 0,
    };
  });

  const totalRequired = requiredDomains.reduce((sum, d) => sum + d.required, 0);
  const totalAvailable = domainStatus.reduce((sum, d) => sum + d.available, 0);
  const fulfilledCount = domainStatus.reduce(
    (sum, d) => sum + Math.min(d.available, d.required),
    0
  );
  const missingDomains = domainStatus
    .filter((d) => !d.isComplete)
    .map(({ domain, required, available, shortage }) => ({
      domain,
      required,
      available,
      shortage,
    }));
  const missingTotal = domainStatus.reduce((sum, d) => sum + d.shortage, 0);
  const isReady =
    requiredDomains.length === 7 &&
    totalRequired === 30 &&
    missingTotal === 0 &&
    fulfilledCount === totalRequired &&
    domainStatus.every((d) => d.isComplete && d.available >= d.required);

  return {
    isReady,
    totalRequired,
    totalAvailable,
    totalInBank,
    draftCount,
    archivedCount,
    fulfilledCount,
    domainStatus,
    missingDomains,
    missingTotal,
  };
}

/**
 * Generates a balanced, stage-isolated exam for a specific student according to
 * Season 1's 30-question domain blueprint:
 * - اللغة العربية: 5
 * - الرياضيات: 5
 * - العلوم: 4
 * - الدراسات الاجتماعية ومصر: 4
 * - اللغة الإنجليزية: 4
 * - الثقافة العامة: 4
 * - التفكير المنطقي والمهارات الذهنية: 4
 * Total = 30 questions, randomized order & randomized options per student.
 * Strictly prevents duplicate questions and blocks exam generation if any domain is incomplete.
 */
export function generateBalancedStudentExam(
  allQuestions: QualifierQuestion[],
  student: StudentProfile,
  settings: CompetitionSettings
): QualifierQuestion[] {
  const rand = createSeededRandom(`${student.participationCode}-${student.id}`);

  const eligibleGrades: GradeNumber[] =
    settings.participatingGrades && settings.participatingGrades.length > 0
      ? settings.participatingGrades
      : ['4', '5', '6'];

  // Strictly deduplicated pool for Season 1 (no duplicate IDs or question texts)
  const poolToUse = getDeduplicatedSeasonOnePool(allQuestions, eligibleGrades);

  // Enforce Blueprint Readiness: never generate an official exam if any domain has a shortage
  const readiness = evaluateSeasonOneQuestionBankReadiness(poolToUse, settings);
  if (!readiness.isReady) {
    return [];
  }

  const blueprint = settings.qualifierBlueprint || {
    arabic: 5,
    math: 5,
    science: 4,
    egypt_world: 4,
    english: 4,
    general_culture: 4,
    logic: 4,
  };

  const quotaOrder: { domain: QualifierDomain; count: number }[] = [
    { domain: 'arabic', count: blueprint.arabic ?? 5 },
    { domain: 'math', count: blueprint.math ?? 5 },
    { domain: 'science', count: blueprint.science ?? 4 },
    { domain: 'egypt_world', count: blueprint.egypt_world ?? 4 },
    { domain: 'english', count: blueprint.english ?? 4 },
    { domain: 'general_culture', count: blueprint.general_culture ?? 4 },
    { domain: 'logic', count: blueprint.logic ?? 4 },
  ];

  const targetTotal = settings.questionsCountPerExam || 30;
  const selectedQuestions: QualifierQuestion[] = [];
  const selectedIds = new Set<string>();
  const selectedTexts = new Set<string>();

  for (const { domain, count } of quotaOrder) {
    const domQuestions = poolToUse.filter(
      (q) => q.domain === domain && !selectedIds.has(q.id) && !selectedTexts.has(q.question.trim())
    );
    const easyQs = seededShuffle(
      domQuestions.filter((q) => q.difficulty === 'easy'),
      rand
    );
    const mediumQs = seededShuffle(
      domQuestions.filter((q) => q.difficulty === 'medium'),
      rand
    );
    const hardQs = seededShuffle(
      domQuestions.filter((q) => q.difficulty === 'hard'),
      rand
    );

    const combinedDom = seededShuffle([...easyQs, ...mediumQs, ...hardQs], rand);
    const picked = combinedDom.slice(0, count);
    if (picked.length < count) {
      // Never repeat a question or borrow from another domain if a domain is short
      return [];
    }
    picked.forEach((q) => {
      selectedIds.add(q.id);
      selectedTexts.add(q.question.trim());
      selectedQuestions.push(q);
    });
  }

  if (selectedQuestions.length !== targetTotal) {
    return [];
  }

  const sliced = selectedQuestions.slice(0, targetTotal);

  // Randomize question order if enabled
  const orderedQuestions =
    settings.randomizeQuestionsOrder !== false ? seededShuffle(sliced, rand) : sliced;

  // Optionally shuffle the 4 choices per question while tracking original option index (0..3)
  // WITHOUT exposing or requiring `correctIndex` on the client!
  if (settings.randomizeOptionsOrder !== false) {
    return orderedQuestions.map((q) => {
      const indexedOptions = q.options.map((text, idx) => ({
        text,
        originalIndex: idx,
        isCorrect: typeof q.correctIndex === 'number' ? idx === q.correctIndex : false,
      }));
      const shuffledOpts = seededShuffle(indexedOptions, rand);
      const resultQ: QualifierQuestion = {
        ...q,
        options: shuffledOpts.map((o) => o.text),
        optionOriginalIndices: shuffledOpts.map((o) => o.originalIndex),
      };
      if (typeof q.correctIndex === 'number') {
        resultQ.correctIndex = shuffledOpts.findIndex((o) => o.isCorrect);
      } else {
        delete resultQ.correctIndex;
      }
      return resultQ;
    });
  }

  return orderedQuestions.map((q) => ({
    ...q,
    optionOriginalIndices: [0, 1, 2, 3],
  }));
}

// ============================================================================
// 3. ⚡ AUTOMATED GRADING & SCORING ENGINE (محرك التصحيح الآلي واحتساب النقاط)
// ============================================================================

export function gradeStudentExamAutomatically(
  student: StudentProfile,
  examQuestions: QualifierQuestion[],
  answers: Record<string, number>,
  elapsedSeconds: number,
  entryTimestamp: string,
  autoSubmittedOnTimeout: boolean,
  settings: CompetitionSettings,
  verifiedCorrectQuestionIds?: Set<string>
): StudentProfile {
  const domainCorrect: Record<QualifierDomain, number> = {
    science: 0,
    math: 0,
    arabic: 0,
    egypt_world: 0,
    english: 0,
    logic: 0,
    observation: 0,
    general_culture: 0,
    technology: 0,
  };

  const domainTotal: Record<QualifierDomain, number> = {
    science: 0,
    math: 0,
    arabic: 0,
    egypt_world: 0,
    english: 0,
    logic: 0,
    observation: 0,
    general_culture: 0,
    technology: 0,
  };

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  const questionVersions = examQuestions.map((q) => {
    const chosenDisplayedIdx = answers[q.id];
    const hasChosen =
      chosenDisplayedIdx !== undefined &&
      chosenDisplayedIdx !== null &&
      Number.isInteger(chosenDisplayedIdx);
    const originalOptionIdx =
      hasChosen && Array.isArray(q.optionOriginalIndices)
        ? q.optionOriginalIndices[chosenDisplayedIdx] ?? chosenDisplayedIdx
        : hasChosen
        ? chosenDisplayedIdx
        : null;

    return {
      questionId: q.id,
      version: typeof q.version === 'number' && q.version > 0 ? q.version : 1,
      domain: q.domain,
      selectedOptionIndex: originalOptionIdx,
    };
  });

  examQuestions.forEach((q) => {
    domainTotal[q.domain] = (domainTotal[q.domain] || 0) + 1;

    const chosen = answers[q.id];
    if (chosen === undefined || chosen === null) {
      // Unanswered = 0 points (no penalty)
      unansweredCount++;
    } else {
      // Priority 1: Verified against protected Firestore `question_answer_keys` collection
      // Priority 2: Fallback only if question has local `correctIndex` (e.g. isolated practice mode)
      const isVerifiedCorrect = verifiedCorrectQuestionIds
        ? verifiedCorrectQuestionIds.has(q.id)
        : typeof q.correctIndex === 'number' && chosen === q.correctIndex;

      if (isVerifiedCorrect) {
        // Base score = exact number of correct answers (1 point per correct answer)
        correctCount++;
        domainCorrect[q.domain] = (domainCorrect[q.domain] || 0) + 1;
      } else {
        // Wrong answer = 0 points (no negative penalty, no risk deduction)
        wrongCount++;
      }
    }
  });

  const maxDurationSec = Math.max(60, (settings.qualifierDurationMinutes || 30) * 60);
  const speedRatio = Math.max(0.1, 1 - elapsedSeconds / maxDurationSec);
  const speedScore = Math.max(1, Math.min(99, Math.round(speedRatio * 100)));

  // Season 1 Official Scoring Rule:
  // Base Score = number of correct answers (out of 30).
  // Wrong = 0, Unanswered = 0, No risk deduction, Speed is strictly a tie-breaker!
  const finalTotalPoints = correctCount;
  const totalQuestionsCount = examQuestions.length || settings.questionsCountPerExam || 30;
  const percentage =
    totalQuestionsCount > 0
      ? Math.min(100, Math.round((correctCount / totalQuestionsCount) * 100))
      : 0;

  const pctDomain = (dom: QualifierDomain) =>
    domainTotal[dom] > 0 ? Math.round((domainCorrect[dom] / domainTotal[dom]) * 100) : 0;

  const earnedBadges: string[] = [];
  if (pctDomain('science') >= 80) earnedBadges.push('🔬 عبقري العلوم');
  if (pctDomain('logic') >= 80) earnedBadges.push('🧠 عبقري المنطق');
  if (pctDomain('math') >= 80) earnedBadges.push('➗ عبقري الحساب');
  if (pctDomain('arabic') >= 80) earnedBadges.push('📚 عبقري اللغة');
  if (pctDomain('english') >= 80) earnedBadges.push('🌐 متميز اللغة الإنجليزية');
  if (speedScore >= 90 && percentage >= 70) earnedBadges.push('⚡ أسرع بديهة');
  if (earnedBadges.length === 0) earnedBadges.push('🌟 مشارك متميز');

  const submitTimestamp = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const avgSecondsPerQuestion =
    examQuestions.length > 0
      ? Number((elapsedSeconds / examQuestions.length).toFixed(1))
      : 0;

  const stage = student.stage || resolveStageFromGrade(student.grade);

  return {
    ...student,
    stage,
    attemptsUsed: (student.attemptsUsed || 0) + 1,
    completedQualifier: true,
    qualifierEntryAt: entryTimestamp,
    qualifierSubmittedAt: submitTimestamp,
    qualifierDurationSeconds: elapsedSeconds,
    gradingReport: {
      correctCount,
      wrongCount,
      unansweredCount,
      rawPoints: finalTotalPoints,
      percentage,
      totalDurationSeconds: elapsedSeconds,
      avgSecondsPerQuestion,
      entryTimestamp,
      submitTimestamp,
      autoSubmittedOnTimeout,
      questionOrderIds: examQuestions.map((q) => q.id),
      questionVersions,
    },
    scores: {
      total: finalTotalPoints,
      speedScore,
      logic: pctDomain('logic'),
      science: pctDomain('science'),
      arabic: pctDomain('arabic'),
      observation: pctDomain('observation'),
      math: pctDomain('math'),
      egypt_world: pctDomain('egypt_world'),
      english: pctDomain('english'),
      general_culture: pctDomain('general_culture'),
      technology: pctDomain('technology'),
    },
    badges: earnedBadges,
  };
}

// ============================================================================
// 4. 🏆 AUTOMATED RANKING, TIE-DETECTION & MULTI-LEVEL QUALIFICATION ENGINE
// ============================================================================

export function runAutomatedRankingAndQualification(
  students: StudentProfile[],
  settings: CompetitionSettings
): {
  rankedStudents: StudentProfile[];
  detectedTieAlerts: SpecialCaseAlert[];
} {
  const quotas = settings.stageQuotas || {
    primary_lower: 100,
    primary_upper: 150,
    preparatory: 100,
    secondary: 80,
  };

  // Sort globally by: 1) Total Points DESC, 2) Duration ASC (faster wins), 3) Speed Score DESC
  const sortedGlobal = [...students].sort((a, b) => {
    if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
    const durA = a.qualifierDurationSeconds ?? 9999;
    const durB = b.qualifierDurationSeconds ?? 9999;
    if (durA !== durB) return durA - durB;
    return b.scores.speedScore - a.scores.speedScore;
  });

  // Track stage-specific rank counters
  const stageCounters: Record<EducationalStage, number> = {
    primary_lower: 0,
    primary_upper: 0,
    preparatory: 0,
    secondary: 0,
  };

  const detectedTieAlerts: SpecialCaseAlert[] = [];

  const nextLevelMap: Record<HierarchyLevel, { title: string; nextLevel: HierarchyLevel }> = {
    school: {
      title: '📍 تصفيات الإدارة التعليمية',
      nextLevel: 'administration',
    },
    administration: {
      title: '🗺️ تصفيات المحافظة',
      nextLevel: 'governorate',
    },
    governorate: {
      title: '🇪🇬 التصفيات النهائية على مستوى الجمهورية',
      nextLevel: 'republic',
    },
    republic: {
      title: '🏆 البطولة النهائية الكبرى — استوديو دماغ عالية',
      nextLevel: 'republic',
    },
  };

  const currentLevel: HierarchyLevel =
    settings.qualificationPathMode === 'national_direct'
      ? 'republic'
      : settings.currentHierarchyLevel || 'school';

  // Track counters per school, administration, and governorate WITHIN the student's stage
  const schoolStageCounters = new Map<string, number>();
  const adminStageCounters = new Map<string, number>();
  const govStageCounters = new Map<string, number>();

  const rankedStudents = sortedGlobal.map((stu, globalIdx) => {
    const stg = stu.stage || resolveStageFromGrade(stu.grade);
    stageCounters[stg] = (stageCounters[stg] || 0) + 1;
    const stageRank = stageCounters[stg];
    const stageQuota = quotas[stg] || 100;

    const schoolKey = `${stg}::${stu.schoolName || 'مدرسة'}`;
    const adminKey = `${stg}::${stu.administration || 'إدارة'}`;
    const govKey = `${stg}::${stu.governorate || stu.region || 'محافظة'}`;

    schoolStageCounters.set(schoolKey, (schoolStageCounters.get(schoolKey) || 0) + 1);
    adminStageCounters.set(adminKey, (adminStageCounters.get(adminKey) || 0) + 1);
    govStageCounters.set(govKey, (govStageCounters.get(govKey) || 0) + 1);

    const schoolRank = schoolStageCounters.get(schoolKey)!;
    const administrationRank = adminStageCounters.get(adminKey)!;
    const governorateRank = govStageCounters.get(govKey)!;

    // Qualified if completed qualifier, within stage quota, and score >= minimum threshold (50% of 30 = 15)
    const minPassScore = (settings.questionsCountPerExam || 30) <= 50 ? 15 : 250;
    const isQualified =
      stu.completedQualifier && stageRank <= stageQuota && stu.scores.total >= minPassScore;

    // Check if there is an exact tie in points AND duration with adjacent student
    const prevStu = globalIdx > 0 ? sortedGlobal[globalIdx - 1] : null;
    const isExactTie =
      Boolean(settings.enableElectronicTieBreaker) &&
      prevStu !== null &&
      prevStu.stage === stg &&
      prevStu.scores.total === stu.scores.total &&
      Math.abs((prevStu.qualifierDurationSeconds || 1000) - (stu.qualifierDurationSeconds || 1000)) <=
        5;

    if (isExactTie && prevStu) {
      detectedTieAlerts.push({
        id: `tie-${stu.id}-${prevStu.id}`,
        type: 'tie_breaker_needed',
        studentId: stu.id,
        studentName: `${stu.name} ⚖️ ${prevStu.name}`,
        participationCode: `${stu.participationCode} / ${prevStu.participationCode}`,
        schoolName: stu.schoolName || 'مدرسة مشاركة',
        governorate: stu.governorate || stu.region || 'القاهرة',
        stage: stg,
        description: `تعادل تام في النقاط (${stu.scores.total} نقطة) والزمن داخل مرحلة (${STAGE_METADATA[stg].shortLabel}). جاهز لتفعيل سؤال فاصل إلكتروني تلقائي.`,
        createdAt: 'الآن',
        status: 'pending',
      });
    }

    const nextInfo = nextLevelMap[currentLevel];

    // Add automatic national/governorate badges if top ranked after completing qualifier
    const updatedBadges = new Set(stu.badges || []);
    const is30PointScale = (settings.questionsCountPerExam || 30) <= 50;
    const govChampThreshold = is30PointScale ? 24 : 350;
    const repChampThreshold = is30PointScale ? 27 : 400;
    if (stu.completedQualifier) {
      updatedBadges.add('🏅 أول مشاركة');
      if (governorateRank === 1 && stu.scores.total >= govChampThreshold) {
        updatedBadges.add('🏆 بطل المحافظة');
      }
      if (stageRank <= 3 && stu.scores.total >= repChampThreshold) {
        updatedBadges.add('🇪🇬 بطل الجمهورية');
      }
    }

    return {
      ...stu,
      stage: stg,
      autoRank: globalIdx + 1,
      stageRank,
      republicStageRank: stageRank,
      schoolRank,
      administrationRank,
      governorateRank,
      qualifiedForFinals: isQualified,
      qualifiedLevel: (isQualified ? nextInfo.nextLevel : 'none') as HierarchyLevel | 'none',
      tieBreakerNeeded: isExactTie,
      badges: Array.from(updatedBadges),
      nextRoundInfo: isQualified
        ? {
            roundTitle:
              settings.qualificationPathMode === 'national_direct'
                ? '🇪🇬 التصفيات النهائية على مستوى الجمهورية'
                : nextInfo.title,
            scheduledDate: settings.endDate || '2026-10-28',
            instructions:
              'تم تأهلك تلقائياً بواسطة النظام الذاتي! احتفظ بكود مشاركتك للدخول المباشر عند فتح الجولة التالية.',
            statusLabel: settings.resultsCertified
              ? '🟢 مؤكد — جاهز للجولة التالية'
              : '🟣 مؤهل مبدئياً (بانتظار الاعتماد النهائي)',
          }
        : undefined,
    };
  });

  return { rankedStudents, detectedTieAlerts };
}

// ============================================================================
// 5. 📊 AGGREGATED ANALYTICS ENGINE (محرك إحصائيات المدارس والإدارات والمحافظات)
// ============================================================================

export interface EntityRankingSummary {
  name: string;
  subLabel: string;
  governorate: string;
  administration: string;
  stagesPresent: EducationalStage[];
  participantsCount: number;
  completedCount: number;
  qualifiedCount: number;
  topThreeCount: number;
  avgScore: number;
  topScore: number;
  compositePoints: number; // نقاط الترتيب الموزونة (لا تعتمد على الكثرة العددية وحدها)
  topStudentName: string;
  topSchoolName?: string;
}

export function computeAggregatedRankings(
  students: StudentProfile[],
  formula?: SchoolScoringFormula
): {
  topSchools: EntityRankingSummary[];
  topAdministrations: EntityRankingSummary[];
  topGovernorates: EntityRankingSummary[];
  stageBreakdown: Record<
    EducationalStage,
    { total: number; completed: number; qualified: number; avgScore: number }
  >;
} {
  const activeFormula: SchoolScoringFormula = formula || {
    avgStudentPointsWeight: 1.5,
    qualifiedStudentsBonus: 45,
    topThreePodiumBonus: 85,
    teamWinsBonus: 35,
    maxParticipationCapBonus: 90,
  };

  const schoolMap = new Map<string, StudentProfile[]>();
  const adminMap = new Map<string, StudentProfile[]>();
  const govMap = new Map<string, StudentProfile[]>();

  const stageBreakdown: Record<
    EducationalStage,
    { total: number; completed: number; qualified: number; avgScore: number }
  > = {
    primary_lower: { total: 0, completed: 0, qualified: 0, avgScore: 0 },
    primary_upper: { total: 0, completed: 0, qualified: 0, avgScore: 0 },
    preparatory: { total: 0, completed: 0, qualified: 0, avgScore: 0 },
    secondary: { total: 0, completed: 0, qualified: 0, avgScore: 0 },
  };

  students.forEach((s) => {
    const school = s.schoolName || 'مدرسة مشاركة';
    const admin = s.administration || 'إدارة تعليمية';
    const gov = s.governorate || s.region || 'القاهرة';
    const stg = s.stage || resolveStageFromGrade(s.grade);

    if (!schoolMap.has(school)) schoolMap.set(school, []);
    schoolMap.get(school)!.push(s);

    if (!adminMap.has(admin)) adminMap.set(admin, []);
    adminMap.get(admin)!.push(s);

    if (!govMap.has(gov)) govMap.set(gov, []);
    govMap.get(gov)!.push(s);

    stageBreakdown[stg].total += 1;
    if (s.completedQualifier) stageBreakdown[stg].completed += 1;
    if (s.qualifiedForFinals) stageBreakdown[stg].qualified += 1;
    stageBreakdown[stg].avgScore += s.scores.total;
  });

  (Object.keys(stageBreakdown) as EducationalStage[]).forEach((k) => {
    const count = stageBreakdown[k].total;
    stageBreakdown[k].avgScore = count > 0 ? Math.round(stageBreakdown[k].avgScore / count) : 0;
  });

  const buildSummary = (
    map: Map<string, StudentProfile[]>,
    getSubLabel: (list: StudentProfile[]) => string
  ): EntityRankingSummary[] => {
    const list: EntityRankingSummary[] = [];
    map.forEach((stuList, name) => {
      const completed = stuList.filter((s) => s.completedQualifier);
      const qualified = stuList.filter((s) => s.qualifiedForFinals);
      const topThree = stuList.filter((s) => (s.stageRank || 99) <= 3);
      const totalPts = stuList.reduce((acc, s) => acc + s.scores.total, 0);
      const avgScore = stuList.length > 0 ? Math.round(totalPts / stuList.length) : 0;
      const sortedByScore = [...stuList].sort((a, b) => b.scores.total - a.scores.total);
      const bestStudent = sortedByScore[0];
      const topScore = bestStudent?.scores.total || 0;
      const stagesPresent = Array.from(
        new Set(stuList.map((s) => s.stage || resolveStageFromGrade(s.grade)))
      );

      // Composite formula: rewards average quality + qualified students + podium winners, with capped participation bonus
      const cappedParticipationBonus = Math.min(
        activeFormula.maxParticipationCapBonus ?? 90,
        stuList.length * 18
      );
      const compositePoints = Math.round(
        avgScore * (activeFormula.avgStudentPointsWeight ?? 1.5) +
          qualified.length * (activeFormula.qualifiedStudentsBonus ?? 45) +
          topThree.length * (activeFormula.topThreePodiumBonus ?? 85) +
          cappedParticipationBonus
      );

      list.push({
        name,
        subLabel: getSubLabel(stuList),
        governorate: stuList[0]?.governorate || stuList[0]?.region || 'القاهرة',
        administration: stuList[0]?.administration || 'إدارة تعليمية',
        stagesPresent,
        participantsCount: stuList.length,
        completedCount: completed.length,
        qualifiedCount: qualified.length,
        topThreeCount: topThree.length,
        avgScore,
        topScore,
        compositePoints,
        topStudentName: bestStudent?.name || '—',
        topSchoolName: bestStudent?.schoolName || '—',
      });
    });
    return list.sort(
      (a, b) => b.compositePoints - a.compositePoints || b.avgScore - a.avgScore
    );
  };

  return {
    topSchools: buildSummary(
      schoolMap,
      (l) => `${l[0]?.administration || 'إدارة تعليمية'} · محافظة ${l[0]?.governorate || l[0]?.region || 'القاهرة'}`
    ),
    topAdministrations: buildSummary(
      adminMap,
      (l) => `محافظة ${l[0]?.governorate || l[0]?.region || 'القاهرة'}`
    ),
    topGovernorates: buildSummary(
      govMap,
      (l) => `${new Set(l.map((x) => x.schoolName)).size} مدارس مشاركة · جمهورية مصر العربية 🇪🇬`
    ),
    stageBreakdown,
  };
}

// ============================================================================
// 6. 📋 INITIAL REAL AUDIT LOGS & SPECIAL CASE ALERTS (NO FAKE DATA)
// ============================================================================

export const INITIAL_SPECIAL_CASES: SpecialCaseAlert[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

export const SEASON_STATUS_META: Record<
  SeasonLifecycleStatus,
  {
    badge: string;
    title: string;
    description: string;
    colorClass: string;
    dotColor: string;
  }
> = {
  registration_open: {
    badge: '🟢 التسجيل مفتوح',
    title: 'باب التسجيل الإلكتروني مفتوح للطلاب والمدارس',
    description: 'يقوم النظام بتسجيل الطلاب وإصدار أكواد المشاركة وتوزيعهم على المراحل والمحافظات تلقائياً.',
    colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    dotColor: '#10B981',
  },
  qualifiers_running: {
    badge: '🔵 التصفيات جارية',
    title: 'الاختبارات الإلكترونية الذاتية تعمل الآن تلقائياً',
    description: 'النظام يوزع الأسئلة العشوائية المتوازنة، يدير المؤقت، ويصحح الإجابات لحظياً دون تدخل بشري.',
    colorClass: 'bg-sky-500/20 text-sky-300 border-sky-400/50',
    dotColor: '#38BDF8',
  },
  auto_grading: {
    badge: '🟡 التصحيح والترتيب الآلي جارٍ',
    title: 'محرك التصحيح والترتيب يقوم بفرز النتائج وحسم التعادلات',
    description: 'يتم الآن حساب النقاط ومقارنة أزمنة الإجابة وتطبيق حصص التأهل لكل مرحلة تعليمية.',
    colorClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    dotColor: '#F59E0B',
  },
  results_ready: {
    badge: '🟣 النتائج جاهزة للمراجعة',
    title: 'تم تجهيز النتائج وقوائم المتأهلين تلقائياً — بانتظار اعتماد المشرفة',
    description: 'راجع الإحصائيات العامة والحالات الاستثنائية ثم اضغط «🏆 اعتماد النتائج» لنشرها وترقية المتأهلين.',
    colorClass: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
    dotColor: '#A855F7',
  },
  next_round_ready: {
    badge: '🏆 الجولة التالية جاهزة',
    title: 'تم اعتماد النتائج وانتقل المتأهلون تلقائياً إلى المرحلة التالية!',
    description: 'تظهر الآن لكل طالب متأهل بطاقة «🟢 لقد تأهلت!» مع موعد وتعليمات الجولة القادمة.',
    colorClass: 'bg-amber-400/25 text-amber-200 border-amber-400',
    dotColor: '#FBBF24',
  },
  season_closed: {
    badge: '🔴 الموسم مغلق',
    title: 'انتهى موسم المسابقة وتم أرشفة السجلات ولوحة الشرف',
    description: 'جميع النتائج والشهادات متاحة للاستعراض والطباعة في لوحة الأبطال.',
    colorClass: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
    dotColor: '#F43F5E',
  },
};
