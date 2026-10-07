export type GradeNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12';

export type EducationalStage =
  | 'primary_lower' // ابتدائي صغير (الصفوف 1 - 3)
  | 'primary_upper' // ابتدائي كبير (الصفوف 4 - 6)
  | 'preparatory'   // إعدادي (الصفوف 7 - 9 / 1ع - 3ع)
  | 'secondary';    // ثانوي (الصفوف 10 - 12 / 1ث - 3ث)

export type SeasonLifecycleStatus =
  | 'registration_open'   // 🟢 التسجيل مفتوح
  | 'qualifiers_running'  // 🔵 التصفيات جارية
  | 'auto_grading'        // 🟡 التصحيح جارٍ
  | 'results_ready'       // 🟣 النتائج جاهزة للمراجعة
  | 'next_round_ready'    // 🏆 الجولة التالية جاهزة
  | 'season_closed';      // 🔴 الموسم مغلق

export type QualificationPathMode =
  | 'national_direct'     // 🇪🇬 تصفيات جمهورية مباشرة
  | 'hierarchical';       // 🏫 مدرسة ← 📍 إدارة تعليمية ← 🗺️ محافظة ← 🇪🇬 جمهورية

export type HierarchyLevel = 'school' | 'administration' | 'governorate' | 'republic';

export type AnnualPhaseId =
  | 'phase_1_school'            // سبتمبر – أكتوبر: تصفيات المدارس
  | 'phase_2_administration'    // نوفمبر – ديسمبر: تصفيات الإدارات التعليمية
  | 'phase_3_winter_sector'     // يناير – فبراير: التحدي الشتوي وتصفيات القطاعات
  | 'phase_4_governorate'       // مارس – أبريل: تصفيات أبطال المحافظات الـ27
  | 'phase_5_republic_knockout' // مايو – يونيو: الأدوار الإقصائية للجمهورية
  | 'phase_6_grand_finals';     // يوليو – أغسطس: النهائيات الكبرى وكأس السوبر

export interface AnnualQualificationPhase {
  id: AnnualPhaseId;
  order: number;
  title: string;
  shortTitle: string;
  monthsLabel: string;
  startDate: string;
  endDate: string;
  targetLevel: HierarchyLevel;
  icon: string;
  badgeColor: string;
  description: string;
  qualificationRule: string;
  questionsCount: number;
  durationMinutes: number;
  AdvancementQuotaLabel: string;
  status: 'completed' | 'active' | 'upcoming';
}

export interface MonthlyChallengeItem {
  monthNumber: number;
  monthName: string;
  seasonQuarter: 'الخريف' | 'الشتاء' | 'الربيع' | 'الصيف';
  title: string;
  focusDomain: string;
  linkedPhaseId: AnnualPhaseId;
  bonusPoints: number;
  status: 'completed' | 'live' | 'upcoming';
}

export type QualifierDomain =
  | 'science'
  | 'math'
  | 'arabic'
  | 'egypt_world'
  | 'english'
  | 'logic'
  | 'observation'
  | 'general_culture'
  | 'technology';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type QuestionReviewStatus = 'draft' | 'approved' | 'archived';

export type OfficialPhaseTargetId =
  | 'stage_1_qualifiers'
  | 'stage_2_semi_finals'
  | 'stage_3_finals';

export interface QualifierQuestion {
  id: string;
  seasonId?: string;
  phaseId?: OfficialPhaseTargetId;
  domain: QualifierDomain;
  difficulty: DifficultyLevel;
  stage?: EducationalStage | 'all';
  grade: GradeNumber | 'all';
  question: string;
  contextPassage?: string; // للمعلومة الجديدة أو اللغز
  visualGrid?: string[]; // لأسئلة الملاحظة البصرية والأنماط
  options: string[];
  correctIndex?: number; // Strictly omitted from public_platform/custom_questions!
  explanation?: string;  // Strictly omitted from public_platform/custom_questions!
  points: number;
  timeSeconds: number;
  reviewStatus?: QuestionReviewStatus;
  published?: boolean;
  version?: number;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  // Internal mapping when options are shuffled on the client (index in shuffled options -> original 0..3 option index)
  optionOriginalIndices?: number[];
}

/**
 * Sanitized Public Question Delivery Schema (`public_platform/custom_questions`).
 * Contains ONLY the fields needed by the student to render and answer the question.
 * NEVER contains `correctIndex`, `explanation`, `createdBy`, `reviewStatus`, or answer key data.
 */
export interface PublicExamQuestion {
  id: string;
  seasonId: string;
  phaseId: OfficialPhaseTargetId;
  grade: GradeNumber | 'all';
  stage: EducationalStage | 'all';
  domain: QualifierDomain;
  difficulty: DifficultyLevel;
  question: string;
  contextPassage?: string;
  visualGrid?: string[];
  options: string[];
  points: number;
  timeSeconds: number;
  version: number;
}

/**
 * Private Answer Key Document stored in `question_answer_keys/{keyDocId}`
 * where `keyDocId = "${questionId}_opt_${correctIndex}"`.
 * Collection has `allow list: if isAdmin(); allow get: if true;` so a client can ONLY verify
 * a specific chosen answer via `getDoc` without ever being able to list or read `correctIndex`!
 */
export interface PrivateQuestionAnswerKeyDoc {
  questionId: string;
  optionIndex: number;
  isCorrect: true;
  domain: QualifierDomain;
  version: number;
  seasonId: string;
  phaseId: OfficialPhaseTargetId;
  updatedAt: string;
}

export interface QuestionAttemptVersionItem {
  questionId: string;
  version: number;
  domain: QualifierDomain;
  selectedOptionIndex: number | null;
}

/**
 * Sanitized Public Readiness Summary (`public_platform/custom_questions`).
 * Contains ONLY aggregate counts per domain so the public UI can show READY / NOT READY
 * WITHOUT exposing a single question text, option, or ID before an official attempt starts!
 */
export interface PublicQuestionBankReadinessSummary {
  id: 'custom_questions';
  updatedAt: string;
  isReady: boolean;
  totalRequired: number;
  totalAvailable: number;
  totalInBank: number;
  draftCount: number;
  archivedCount: number;
  fulfilledCount: number;
  missingTotal: number;
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
}

/**
 * Official Server-Managed Exam Attempt (`exam_attempts/{attemptId}`).
 * Created and updated ONLY by the Trusted Backend (`/api/exam/start`, `/api/exam/submit`).
 * Contains ONLY the 30 questions selected for this attempt (with options already randomized
 * by the server and NO `correctIndex` or `optionOriginalIndices`).
 */
export interface OfficialExamAttempt {
  id: string;
  attemptId: string;
  studentId: string;
  ownerUid: string;
  participationCode: string;
  seasonId: string;
  phaseId: OfficialPhaseTargetId;
  grade: GradeNumber;
  stage: EducationalStage;
  questionIds: string[];
  questionVersions: {
    questionId: string;
    version: number;
    domain: QualifierDomain;
  }[];
  questions: PublicExamQuestion[];
  startedAt: string;
  startedAtMs: number;
  expiresAt: string;
  expiresAtMs: number;
  submittedAt?: string;
  status: 'in_progress' | 'submitted' | 'expired';
  score?: number;
  correctCount?: number;
}

export interface AutomatedGradingReport {
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  rawPoints: number;
  percentage: number;
  totalDurationSeconds: number;
  avgSecondsPerQuestion: number;
  entryTimestamp: string;
  submitTimestamp: string;
  autoSubmittedOnTimeout?: boolean;
  questionOrderIds?: string[];
  questionVersions?: QuestionAttemptVersionItem[];
}

export type SchoolType =
  | 'official_arabic'    // حكومي عربي
  | 'official_languages' // رسمي لغات / متميز لغات
  | 'private_arabic'     // خاص عربي
  | 'private_languages'  // خاص لغات
  | 'international'      // دولي (International)
  | 'stem_feweq'         // متفوقين STEM
  | 'azhari';            // أزهري

export interface RegisteredSchool {
  id: string;
  ownerUid?: string;
  schoolCode: string;
  name: string;
  schoolType: SchoolType;
  governorate: string;
  administration: string;
  supervisorName: string;
  supervisorRole?: string;
  stagesOffered: EducationalStage[];
  registeredAt: string;
  isDemoData?: boolean;
}

export interface SeasonArchiveItem {
  id: string;
  seasonName?: string;
  title?: string;
  year: string | number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
  totalParticipants?: number;
  totalStudents?: number;
  totalSchools: number;
  totalGovernorates: number;
  championsByStage?: {
    primary_lower: { studentName: string; schoolName: string; governorate: string; points: number };
    primary_upper: { studentName: string; schoolName: string; governorate: string; points: number };
    preparatory: { studentName: string; schoolName: string; governorate: string; points: number };
    secondary: { studentName: string; schoolName: string; governorate: string; points: number };
  };
  topSchoolName?: string;
  championSchoolName?: string;
  topGovernorateName?: string;
  championGovernorate?: string;
  championStudentName?: string;
  highlights?: string;
}

export interface SchoolScoringFormula {
  avgStudentPointsWeight?: number;
  qualifiedStudentsBonus?: number;
  topThreePodiumBonus?: number;
  teamWinsBonus?: number;
  maxParticipationCapBonus?: number;
  totalPointsWeight?: number;
  avgScoreWeight?: number;
  qualifiedBonusPoints?: number;
  participantBonusPoints?: number;
}

export interface StudentProfile {
  id: string;
  ownerUid?: string;
  name: string;
  grade: GradeNumber;
  stage?: EducationalStage;
  className: string;
  schoolName?: string;
  schoolType?: SchoolType;
  schoolCode?: string;
  administration?: string; // الإدارة التعليمية
  governorate?: string;    // المحافظة
  region?: string;
  country?: string;
  participationCode: string;
  parentPhone?: string;
  teamId?: string;
  isDemoData?: boolean;
  attemptsUsed?: number;
  completedQualifier: boolean;
  qualifierSubmittedAt?: string;
  qualifierEntryAt?: string;
  qualifierDurationSeconds?: number;
  gradingReport?: AutomatedGradingReport;
  autoRank?: number;
  stageRank?: number;
  schoolRank?: number;
  administrationRank?: number;
  governorateRank?: number;
  republicStageRank?: number;
  republicRank?: number;
  qualifiedLevel?: HierarchyLevel | 'none';
  currentAnnualPhaseReached?: AnnualPhaseId;
  annualPhaseScores?: Partial<Record<AnnualPhaseId, number>>;
  nextRoundInfo?: {
    roundTitle: string;
    scheduledDate: string;
    instructions: string;
    statusLabel: string;
  };
  scores: {
    total: number;
    speedScore: number;
    logic: number;
    science: number;
    arabic: number;
    observation: number;
    math: number;
    egypt_world: number;
    english?: number;
    general_culture: number;
    technology: number;
  };
  qualifiedForFinals: boolean;
  tieBreakerNeeded?: boolean;
  xp?: number;
  achievementsCount?: number;
  badges: string[];
}

export type SpecialCaseType =
  | 'interrupted_exam'     // انقطاع الاختبار
  | 'duplicate_attempt'    // محاولة دخول مكررة
  | 'technical_issue'      // مشكلة تقنية
  | 'incomplete_result'    // نتيجة غير مكتملة
  | 'tie_breaker_needed'   // تعادل يستدعي سؤالاً فاصلاً
  | 'student_school_report'; // بلاغ من طالب أو مدرسة

export interface SpecialCaseAlert {
  id: string;
  type: SpecialCaseType;
  studentId?: string;
  studentName: string;
  participationCode: string;
  schoolName: string;
  governorate: string;
  stage: EducationalStage;
  description: string;
  createdAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolutionNote?: string;
}

export type AuditEventCategory =
  | 'student_register'
  | 'exam_start'
  | 'exam_submit'
  | 'auto_grade'
  | 'auto_qualify'
  | 'supervisor_override'
  | 'results_approved'
  | 'season_state_change';

export interface AuditLogEntry {
  id: string;
  category: AuditEventCategory;
  actor: '🤖 النظام الذاتي' | '👩‍💼 المشرفة العامة' | '👨‍🎓 طالب';
  title: string;
  details: string;
  timestamp: string;
}

export interface StageQuotas {
  primary_lower: number; // مثال: أفضل 100 طالب من ابتدائي صغير
  primary_upper: number; // مثال: أفضل 150 طالب من ابتدائي كبير
  preparatory: number;   // مثال: أفضل 100 طالب من الإعدادي
  secondary: number;     // مثال: أفضل 80 طالباً من الثانوي
}

export interface TeamMember {
  id: string;
  name: string;
  grade: GradeNumber;
  isReserve?: boolean;
}

export interface Team {
  id: string;
  ownerUid?: string;
  name: string;
  schoolName?: string;
  region?: string;
  country?: string;
  emblem: string;
  color: string;
  captainId: string;
  members: TeamMember[];
  points: number;
  wins: number;
  matchesPlayed: number;
  titleBadge: string;
  cards: {
    challengeCard: boolean; // 🃏 كارت التحدي
    swapQuestionCard: boolean; // 🃏 كارت تبديل السؤال
    doublePointsCard: boolean; // 🃏 كارت مضاعفة النقاط
  };
}

export interface JourneyNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  targetView: AppView;
  gameTab?: ChallengeGameId;
  unlockedByDefault?: boolean;
}

export type ChallengeGameId =
  | 'falcon_eye'
  | 'lightning_speed'
  | 'genius_brain'
  | 'mystery_fact'
  | 'risk_challenge'
  | 'point_steal'
  | 'mystery_box'
  | 'no_talking'
  | 'genius_alarm'
  | 'egypt_minute'
  | 'escape_room'
  | 'classic_board';

export interface RealPortfolioProject {
  id: string;
  name: string;
  description: string;
  category: 'competition' | 'project' | 'game' | 'app' | 'invention';
  status: 'published' | 'draft' | 'coming_soon';
  image: string; // empty if no real image provided
  realUrl: string; // empty if no real link provided ("الرابط سيتم إضافته لاحقًا")
  features: string[];
  content: string;
  createdAt: string;
  isInternalPlatform?: boolean;
}

export type AppView =
  | 'home'
  | 'real_projects'
  | 'content_management'
  | 'annual_roadmap'
  | 'journey'
  | 'qualifiers'
  | 'practice'
  | 'genius_card'
  | 'games_hub'
  | 'teams'
  | 'tournament'
  | 'leaderboard'
  | 'national_rankings'
  | 'schools_hub'
  | 'egypt_map'
  | 'certificates'
  | 'seasons_archive'
  | 'about_privacy'
  | 'awards'
  | 'how_to_play'
  | 'admin';

export interface CompetitionAward {
  id: string;
  icon: string;
  title: string;
  desc: string;
  categoryType: 'student' | 'team' | 'both';
  winnerType?: 'student' | 'team' | null;
  winnerId?: string | null;
  citationNote?: string;
  awardedAt?: string;
}

export type SeasonDocumentStatus = 'draft' | 'registration_open' | 'active' | 'ended';

export interface QualifierDomainQuota {
  arabic: number;
  math: number;
  science: number;
  egypt_world: number;
  english: number;
  general_culture: number;
  logic: number;
}

export interface SeasonOfficialPhase {
  phaseId: 'stage_1_qualifiers' | 'stage_2_semi_finals' | 'stage_3_finals';
  order: 1 | 2 | 3;
  title: string;
  description: string;
  status: 'locked_until_ready' | 'registration_open' | 'active' | 'completed';
  requiresQuestionBankComplete: boolean;
  questionsCount: number | null;
  durationMinutes: number | null;
  allowedAttempts: number | null;
  questionFormat: 'multiple_choice';
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  allowBackNavigation: boolean;
  wrongAnswerPoints: 0;
  unansweredPoints: 0;
  enableWrongAnswerPenalty: false;
  enableRiskPenalty: false;
  baseScoreRule: 'correct_count';
  tieBreakerRule: 'completion_speed';
  domainBlueprint?: QualifierDomainQuota;
}

export interface SeasonOneConfig {
  id: 'season_1';
  seasonId: string;
  name: string;
  status: SeasonDocumentStatus;
  registrationStart: string;
  registrationEnd: string;
  competitionStart: string;
  competitionEnd: string;
  eligibleGrades: GradeNumber[];
  stages: EducationalStage[];
  officialPhases?: SeasonOfficialPhase[];
  qualifierBlueprint?: QualifierDomainQuota;
  examSettings: {
    questionsCount: number | null;
    durationMinutes: number | null;
    allowedAttempts: number | null;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
    allowBackNavigation: boolean;
  };
  scoringSettings: {
    scoringMethod: 'standard_points' | 'speed_weighted' | 'difficulty_weighted' | '';
    enableTieBreaker: boolean;
    enableRiskPenalty: boolean;
  };
  awards: {
    id: string;
    title: string;
    description: string;
    categoryType: 'student' | 'team' | 'both';
  }[];
  publicVisibility: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionSettings {
  appProfileImage?: string;
  currentSeasonId?: string;
  seasonYear?: string;
  seasonName?: string;
  seasonStatus?: SeasonLifecycleStatus;
  seasonsArchive?: SeasonArchiveItem[];
  resultsCertified?: boolean;
  registrationStartDate?: string;
  registrationEndDate?: string;
  defaultSchoolName?: string;
  defaultAdministration?: string;
  defaultRegion?: string;
  defaultCountry?: string;
  startDate: string;
  endDate: string;
  participatingStages?: EducationalStage[];
  participatingGrades?: GradeNumber[];
  officialPhases?: SeasonOfficialPhase[];
  qualifierBlueprint?: QualifierDomainQuota;
  questionsCountPerExam?: number;
  qualifierDurationMinutes: number;
  allowedAttemptsPerStudent?: number;
  scoringMethod?: 'standard_points' | 'speed_weighted' | 'difficulty_weighted';
  enableElectronicTieBreaker?: boolean;
  randomizeQuestionsOrder?: boolean;
  randomizeOptionsOrder?: boolean;
  qualificationPathMode?: QualificationPathMode;
  currentHierarchyLevel?: HierarchyLevel;
  activeAnnualPhaseId?: AnnualPhaseId;
  annualPhases?: AnnualQualificationPhase[];
  stageQuotas?: StageQuotas;
  allowStudentStageOverride?: boolean;
  publicNamePrivacyMode?: 'full_name' | 'abbreviated_name';
  privacyMaskNames?: boolean;
  schoolScoringFormula?: SchoolScoringFormula;
  enabledGames?: any;
  qualifiedStudentsTarget: number;
  tournamentBracketSize: 16 | 8 | 4 | 2;
  allowBackNavigationInQualifier: boolean;
  enableRiskPenalty: boolean;
  showResultsDuringQualifiers: boolean;
  activeRoundStatus: 'qualifiers_open' | 'team_formation' | 'finals_live' | 'completed';
}

export interface MatchItem {
  id: string;
  round: 'R16' | 'QF' | 'SF' | 'FINAL';
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  winnerId?: string;
  status: 'upcoming' | 'live' | 'finished';
}
