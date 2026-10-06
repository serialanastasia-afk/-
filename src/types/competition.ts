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
  | 'logic'
  | 'observation'
  | 'general_culture'
  | 'technology';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QualifierQuestion {
  id: string;
  domain: QualifierDomain;
  difficulty: DifficultyLevel;
  stage?: EducationalStage | 'all';
  grade: GradeNumber | 'all';
  question: string;
  contextPassage?: string; // للمعلومة الجديدة أو اللغز
  visualGrid?: string[]; // لأسئلة الملاحظة البصرية والأنماط
  options: string[];
  correctIndex: number;
  points: number;
  timeSeconds: number;
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
    general_culture: number;
    technology: number;
  };
  qualifiedForFinals: boolean;
  tieBreakerNeeded?: boolean;
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

export type AppView =
  | 'home'
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

export interface CompetitionSettings {
  appProfileImage?: string;
  seasonName?: string;
  seasonStatus?: SeasonLifecycleStatus;
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
