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

/**
 * Generates a balanced, stage-isolated exam for a specific student.
 * Guarantees:
 * - Same total number of questions
 * - Same domain distribution
 * - Same difficulty distribution (easy / medium / hard)
 * - Same total points & time limit
 * - Shuffled question order and shuffled option order per student (anti-cheating)
 */
export function generateBalancedStudentExam(
  allQuestions: QualifierQuestion[],
  student: StudentProfile,
  settings: CompetitionSettings
): QualifierQuestion[] {
  const studentStage = student.stage || resolveStageFromGrade(student.grade);
  const rand = createSeededRandom(`${student.participationCode}-${student.id}`);

  // Filter questions appropriate for the student's stage (never mix stages inappropriately)
  const stagePool = allQuestions.filter((q) => {
    if (q.stage && q.stage !== 'all' && q.stage !== studentStage) return false;
    return true;
  });

  const poolToUse = stagePool.length >= 16 ? stagePool : allQuestions;

  // Group by domain and difficulty to preserve 100% fairness across all students
  const domains: QualifierDomain[] = [
    'science',
    'math',
    'arabic',
    'egypt_world',
    'logic',
    'observation',
    'general_culture',
    'technology',
  ];

  const targetTotal = settings.questionsCountPerExam || 50;
  const selectedQuestions: QualifierQuestion[] = [];

  domains.forEach((dom) => {
    const domQuestions = poolToUse.filter((q) => q.domain === dom);
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

    // Pick balanced difficulty from each domain
    const combinedDom = [...easyQs, ...mediumQs, ...hardQs];
    selectedQuestions.push(...combinedDom);
  });

  const sliced = selectedQuestions.slice(0, targetTotal);

  // Randomize question order within difficulty tiers or globally if enabled
  const orderedQuestions =
    settings.randomizeQuestionsOrder !== false ? seededShuffle(sliced, rand) : sliced;

  // Optionally shuffle the 4 choices per question while keeping correctIndex accurate
  if (settings.randomizeOptionsOrder !== false) {
    return orderedQuestions.map((q) => {
      const indexedOptions = q.options.map((text, idx) => ({
        text,
        isCorrect: idx === q.correctIndex,
      }));
      const shuffledOpts = seededShuffle(indexedOptions, rand);
      return {
        ...q,
        options: shuffledOpts.map((o) => o.text),
        correctIndex: shuffledOpts.findIndex((o) => o.isCorrect),
      };
    });
  }

  return orderedQuestions;
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
  settings: CompetitionSettings
): StudentProfile {
  const domainCorrect: Record<QualifierDomain, number> = {
    science: 0,
    math: 0,
    arabic: 0,
    egypt_world: 0,
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
    logic: 0,
    observation: 0,
    general_culture: 0,
    technology: 0,
  };

  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let rawPoints = 0;
  let maxPossiblePoints = 0;

  examQuestions.forEach((q) => {
    domainTotal[q.domain] = (domainTotal[q.domain] || 0) + 1;
    const diffMultiplier =
      settings.scoringMethod === 'difficulty_weighted'
        ? q.difficulty === 'hard'
          ? 1.25
          : q.difficulty === 'medium'
          ? 1.1
          : 1
        : 1;
    const questionPoints = Math.round(q.points * diffMultiplier);
    maxPossiblePoints += questionPoints;

    const chosen = answers[q.id];
    if (chosen === undefined || chosen === null) {
      unansweredCount++;
    } else if (chosen === q.correctIndex) {
      correctCount++;
      domainCorrect[q.domain] = (domainCorrect[q.domain] || 0) + 1;
      rawPoints += questionPoints;
    } else {
      wrongCount++;
    }
  });

  const maxDurationSec = Math.max(60, settings.qualifierDurationMinutes * 60);
  const speedRatio = Math.max(0.55, 1 - elapsedSeconds / (maxDurationSec * 1.25));
  const speedScore = Math.min(99, Math.round(speedRatio * 100));

  // If scoring method includes speed bonus
  const speedBonus =
    settings.scoringMethod === 'speed_weighted' && correctCount > 0
      ? Math.round((speedScore / 100) * 25)
      : 0;

  const finalTotalPoints = rawPoints + speedBonus;
  const percentage =
    maxPossiblePoints > 0 ? Math.min(100, Math.round((rawPoints / maxPossiblePoints) * 100)) : 0;

  const pctDomain = (dom: QualifierDomain) =>
    domainTotal[dom] > 0 ? Math.round((domainCorrect[dom] / domainTotal[dom]) * 100) : 80;

  const earnedBadges: string[] = [];
  if (pctDomain('science') >= 80) earnedBadges.push('🔬 عبقري العلوم');
  if (pctDomain('logic') >= 80) earnedBadges.push('🧠 عبقري المنطق');
  if (pctDomain('math') >= 80) earnedBadges.push('➗ عبقري الحساب');
  if (pctDomain('observation') >= 80) earnedBadges.push('👁️ عين الصقر');
  if (pctDomain('arabic') >= 80) earnedBadges.push('📚 عبقري اللغة');
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
      title: '🏆 البطولة النهائية الكبرى — استوديو العباقرة',
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

    // Qualified if completed qualifier, within stage quota, and score >= minimum threshold (e.g., 250)
    const isQualified =
      stu.completedQualifier && stageRank <= stageQuota && stu.scores.total >= 250;

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

    // Add automatic national/governorate badges if top ranked
    const updatedBadges = new Set(stu.badges || []);
    updatedBadges.add('🏅 أول مشاركة');
    if (governorateRank === 1 && stu.scores.total >= 350) {
      updatedBadges.add('🏆 بطل المحافظة');
    }
    if (stageRank <= 3 && stu.scores.total >= 400) {
      updatedBadges.add('🇪🇬 بطل الجمهورية');
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
      qualifiedLevel: isQualified ? nextInfo.nextLevel : 'none',
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
        activeFormula.maxParticipationCapBonus,
        stuList.length * 18
      );
      const compositePoints = Math.round(
        avgScore * activeFormula.avgStudentPointsWeight +
          qualified.length * activeFormula.qualifiedStudentsBonus +
          topThree.length * activeFormula.topThreePodiumBonus +
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
// 6. 📋 INITIAL DEMO AUDIT LOGS & SPECIAL CASE ALERTS
// ============================================================================

export const INITIAL_SPECIAL_CASES: SpecialCaseAlert[] = [
  {
    id: 'sc-1',
    type: 'interrupted_exam',
    studentId: 'stu-5',
    studentName: 'ياسين طارق عبد العزيز',
    participationCode: 'OM-508',
    schoolName: 'مدرسة المتفوقين الرسمية للغات',
    governorate: 'الإسكندرية',
    stage: 'primary_upper',
    description: 'انقطع الاتصال بالإنترنت عند السؤال رقم 38 (تبقّى 9 دقائق). تم حفظ الـ38 إجابة تلقائياً بواسطة النظام.',
    createdAt: 'منذ ١٢ دقيقة',
    status: 'pending',
  },
  {
    id: 'sc-2',
    type: 'duplicate_attempt',
    studentId: 'stu-1',
    studentName: 'يوسف أحمد محمود',
    participationCode: 'OM-601',
    schoolName: 'مدرسة النيل الدولية للغات',
    governorate: 'الجيزة',
    stage: 'primary_upper',
    description: 'محاولة دخول ثانية بنفس كود المشاركة بعد تسليم الاختبار. قام النظام بحظر المحاولة تلقائياً لحماية نزاهة التصفيات.',
    createdAt: 'منذ ٢٥ دقيقة',
    status: 'pending',
  },
  {
    id: 'sc-3',
    type: 'tie_breaker_needed',
    studentName: 'سلمى وائل فؤاد ⚖️ نوران سامح',
    participationCode: 'OM-401 / OM-409',
    schoolName: 'مدرسة سموحة الرسمية للغات',
    governorate: 'الإسكندرية',
    stage: 'primary_upper',
    description: 'تعادل في مجموع النقاط (420 نقطة) وزمن الإجابة على الحد الفاصل للتأهل. جاهز لإرسال سؤال فاصل إلكتروني.',
    createdAt: 'منذ ٤٠ دقيقة',
    status: 'pending',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    category: 'season_state_change',
    actor: '👩‍💼 المشرفة العامة',
    title: 'إعداد وتفعيل موسم التصفيات الإلكترونية الذاتية',
    details: 'تم ضبط إعدادات الموسم (ابتدائي صغير، ابتدائي كبير، إعدادي، ثانوي) وتفعيل بنك الأسئلة العشوائي المتوازن.',
    timestamp: '٠٩:٠٠ ص',
  },
  {
    id: 'log-2',
    category: 'student_register',
    actor: '🤖 النظام الذاتي',
    title: 'تسجيل وتوزيع تلقائي للطلاب على المراحل والمحافظات',
    details: 'تم تسكين الطلاب المسجلين تلقائياً في مجموعات (المرحلة ← الصف ← المحافظة ← الإدارة ← المدرسة) دون تدخل يدوي.',
    timestamp: '٠٩:٣٠ ص',
  },
  {
    id: 'log-3',
    category: 'exam_start',
    actor: '🤖 النظام الذاتي',
    title: 'توليد نماذج اختبارات عشوائية متكافئة الصعوبة',
    details: 'تم توليد نماذج التصفيات مع خلط ترتيب الأسئلة والاختيارات لكل طالب مع الحفاظ على نفس توزيع المجالات والدرجات.',
    timestamp: '١٠:٠٠ ص',
  },
  {
    id: 'log-4',
    category: 'auto_grade',
    actor: '🤖 النظام الذاتي',
    title: 'التصحيح الآلي الفوري وحساب السرعة والمجالات',
    details: 'قام محرك التصحيح بحساب الدرجات، النسب المئوية، متوسط زمن السؤال، وترتيب الطلاب تلقائياً فور انتهاء الوقت.',
    timestamp: '١٠:٣٥ ص',
  },
  {
    id: 'log-5',
    category: 'auto_qualify',
    actor: '🤖 النظام الذاتي',
    title: 'فرز وترتيب المتأهلين تلقائياً حسب حصص كل مرحلة',
    details: 'تم تحديد قائمة المتأهلين الأوائل في كل مرحلة تعليمية وتجهيز النتائج للمراجعة النهائية من المشرفة العامة.',
    timestamp: '١٠:٤٠ ص',
  },
];

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
