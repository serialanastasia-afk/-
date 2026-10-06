import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Download,
  Settings,
  CheckCircle2,
  Sliders,
  Shield,
  BookOpen,
  Play,
  Square,
  Crown,
  Camera,
  Upload,
  AlertTriangle,
  ClipboardList,
  Pause,
  Lock,
  Trophy,
  BarChart3,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  StudentProfile,
  Team,
  QualifierQuestion,
  CompetitionSettings,
  MatchItem,
  GradeNumber,
  QualifierDomain,
  DifficultyLevel,
  CompetitionAward,
  SpecialCaseAlert,
  AuditLogEntry,
  SeasonLifecycleStatus,
  EducationalStage,
  HierarchyLevel,
  AnnualPhaseId,
} from '../types/competition';
import { DOMAIN_META } from '../data/qualifierQuestions';
import { APP_PROFILE_PRESETS, DEFAULT_ANNUAL_PHASES } from '../data/challengesData';
import {
  STAGE_METADATA,
  GRADE_LABELS,
  SEASON_STATUS_META,
  INITIAL_SPECIAL_CASES,
  INITIAL_AUDIT_LOGS,
  resolveStageFromGrade,
  buildStudentGroupingPath,
  runAutomatedRankingAndQualification,
  computeAggregatedRankings,
} from '../services/qualificationEngine';
import { soundEngine } from '../utils/sound';

interface AdminDashboardProps {
  students: StudentProfile[];
  setStudents: React.Dispatch<React.SetStateAction<StudentProfile[]>>;
  teams: Team[];
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>;
  customQuestions: QualifierQuestion[];
  setCustomQuestions: React.Dispatch<React.SetStateAction<QualifierQuestion[]>>;
  settings: CompetitionSettings;
  setSettings: React.Dispatch<React.SetStateAction<CompetitionSettings>>;
  matches: MatchItem[];
  setMatches: React.Dispatch<React.SetStateAction<MatchItem[]>>;
  awards: CompetitionAward[];
  setAwards: React.Dispatch<React.SetStateAction<CompetitionAward[]>>;
  initialSection?: AdminSection;
  onTriggerGeniusAlarm: () => void;
}

export type AdminSection =
  | 'overview'
  | 'special_cases'
  | 'audit_log'
  | 'students'
  | 'questions'
  | 'competition'
  | 'teams'
  | 'awards'
  | 'matches'
  | 'results';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  setStudents,
  teams,
  setTeams,
  customQuestions,
  setCustomQuestions,
  settings,
  setSettings,
  matches,
  setMatches,
  awards,
  setAwards,
  initialSection = 'overview',
  onTriggerGeniusAlarm,
}) => {
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ⚠️ Special Cases & 📋 Audit Log State
  const [specialCases, setSpecialCases] = useState<SpecialCaseAlert[]>(() => {
    try {
      const saved = localStorage.getItem('om_geniuses_special_cases_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SPECIAL_CASES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('om_geniuses_audit_logs_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_AUDIT_LOGS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('om_geniuses_special_cases_v1', JSON.stringify(specialCases));
    } catch {}
  }, [specialCases]);

  React.useEffect(() => {
    try {
      localStorage.setItem('om_geniuses_audit_logs_v1', JSON.stringify(auditLogs));
    } catch {}
  }, [auditLogs]);

  const appendAuditLog = (
    category: AuditLogEntry['category'],
    actor: AuditLogEntry['actor'],
    title: string,
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 999)}`,
      category,
      actor,
      title,
      details,
      timestamp: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  React.useEffect(() => {
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  // Add Student State
  const [stuName, setStuName] = useState('');
  const [stuGrade, setStuGrade] = useState<GradeNumber>('5');
  const [stuClass, setStuClass] = useState('5 / أ');
  const [stuSchool, setStuSchool] = useState(
    settings.defaultSchoolName || 'مدرسة عيون مصر للغات'
  );
  const [stuRegion, setStuRegion] = useState(settings.defaultRegion || 'القاهرة');
  const [stuCountry, setStuCountry] = useState(settings.defaultCountry || 'مصر 🇪🇬');

  // Add Question State
  const [qText, setQText] = useState('');
  const [qDomain, setQDomain] = useState<QualifierDomain>('science');
  const [qDiff, setQDiff] = useState<DifficultyLevel>('medium');
  const [qPoints, setQPoints] = useState(15);
  const [qTime, setQTime] = useState(35);
  const [qOpt0, setQOpt0] = useState('');
  const [qOpt1, setQOpt1] = useState('');
  const [qOpt2, setQOpt2] = useState('');
  const [qOpt3, setQOpt3] = useState('');
  const [qCorrect, setQCorrect] = useState(0);

  // Add Team State
  const [teamName, setTeamName] = useState('');
  const [teamEmblem, setTeamEmblem] = useState('🦁');
  const [teamColor, setTeamColor] = useState('#F59E0B');
  const [teamSchool, setTeamSchool] = useState(
    settings.defaultSchoolName || 'مدرسة عيون مصر للغات'
  );
  const [teamRegion, setTeamRegion] = useState(settings.defaultRegion || 'القاهرة');
  const [teamCountry, setTeamCountry] = useState(settings.defaultCountry || 'مصر 🇪🇬');
  const [teamPlayerCount, setTeamPlayerCount] = useState<4 | 5>(4);
  const [newTeamMembers, setNewTeamMembers] = useState<
    { name: string; grade: GradeNumber; isReserve?: boolean }[]
  >([
    { name: '', grade: '6' },
    { name: '', grade: '5' },
    { name: '', grade: '5' },
    { name: '', grade: '4' },
    { name: '', grade: '4', isReserve: true },
  ]);
  const [addingMemberToTeamId, setAddingMemberToTeamId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGrade, setNewMemberGrade] = useState<GradeNumber>('5');

  const notify = (msg: string) => {
    setToastMsg(msg);
    soundEngine.playSelectTile();
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Export Results CSV
  const handleExportCSV = () => {
    const header = 'الاسم,الصف,الفصل,اسم المدرسة,المنطقة,البلد,كود المشاركة,النقاط الكلية,السرعة,تأهل للنهائيات\n';
    const rows = students
      .map(
        (s) =>
          `"${s.name}",${s.grade},"${s.className}","${s.schoolName || settings.defaultSchoolName || 'مدرسة عيون مصر للغات'}","${s.region || settings.defaultRegion || 'القاهرة'}","${s.country || settings.defaultCountry || 'مصر'}",${s.participationCode},${s.scores.total},${s.scores.speedScore},${
            s.qualifiedForFinals ? 'نعم' : 'لا'
          }`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oyoun_misr_geniuses_results.csv';
    a.click();
    notify('تم تصدير ملف نتائج طلاب مدرسة عيون مصر بصيغة CSV');
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.includes(searchQuery) ||
      s.participationCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.className.includes(searchQuery)
  );

  // ==================== 📊 SELF-MANAGED SEASON ANALYTICS & RECHARTS DATA ====================
  const currentSeasonStatus: SeasonLifecycleStatus =
    settings.seasonStatus || 'qualifiers_running';
  const statusMeta = SEASON_STATUS_META[currentSeasonStatus];

  const uniqueSchoolsCount = new Set(
    students.map((s) => s.schoolName || settings.defaultSchoolName || 'مدرسة عيون مصر للغات')
  ).size;
  const uniqueGovernoratesCount = new Set(
    students.map((s) => s.governorate || s.region || settings.defaultRegion || 'القاهرة')
  ).size;
  const completedQualifiersCount = students.filter((s) => s.completedQualifier).length;
  const qualifiedStudentsCount = students.filter((s) => s.qualifiedForFinals).length;
  const pendingSpecialCasesCount = specialCases.filter((c) => c.status === 'pending').length;

  // 1. Recharts Data: Distribution of Participating Students by Governorate (توزيع الطلاب حسب المحافظات)
  const governorateChartData = React.useMemo(() => {
    const govMap = new Map<
      string,
      { governorate: string; total: number; qualified: number; completed: number }
    >();
    students.forEach((s) => {
      const gov = s.governorate || s.region || 'القاهرة';
      const entry = govMap.get(gov) || {
        governorate: gov,
        total: 0,
        qualified: 0,
        completed: 0,
      };
      entry.total += 1;
      if (s.completedQualifier) entry.completed += 1;
      if (s.qualifiedForFinals) entry.qualified += 1;
      govMap.set(gov, entry);
    });
    return Array.from(govMap.values()).sort((a, b) => b.total - a.total);
  }, [students]);

  // 2. Recharts Data: Distribution of Participating Students by Grade & Stage (توزيع الطلاب حسب الصفوف والمراحل)
  const gradeChartData = React.useMemo(() => {
    const gradeOrder: GradeNumber[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const gradeShortNames: Record<GradeNumber, string> = {
      '1': '١ ب',
      '2': '٢ ب',
      '3': '٣ ب',
      '4': '٤ ب',
      '5': '٥ ب',
      '6': '٦ ب',
      '7': '١ ع',
      '8': '٢ ع',
      '9': '٣ ع',
      '10': '١ ث',
      '11': '٢ ث',
      '12': '٣ ث',
    };

    return gradeOrder
      .map((g) => {
        const inGrade = students.filter((s) => s.grade === g);
        const qualifiedInGrade = inGrade.filter((s) => s.qualifiedForFinals).length;
        const avgPoints =
          inGrade.length > 0
            ? Math.round(inGrade.reduce((acc, s) => acc + s.scores.total, 0) / inGrade.length)
            : 0;
        return {
          gradeKey: g,
          gradeName: gradeShortNames[g],
          fullGradeLabel: GRADE_LABELS[g],
          participants: inGrade.length,
          qualified: qualifiedInGrade,
          avgPoints,
        };
      })
      .filter((row) => row.participants > 0 || ['3', '4', '5', '6', '8', '11'].includes(row.gradeKey));
  }, [students]);

  const PIE_COLORS = ['#F59E0B', '#38BDF8', '#10B981', '#A855F7', '#EC4899', '#F97316'];

  const aggregatedRankings = React.useMemo(
    () => computeAggregatedRankings(students),
    [students]
  );

  // ==================== 🚀 1-CLICK SELF-MANAGED SEASON ACTIONS ====================
  const handleOpenQualifiers = () => {
    soundEngine.playFanfare();
    setSettings((prev) => ({
      ...prev,
      seasonStatus: 'qualifiers_running',
      resultsCertified: false,
      activeRoundStatus: 'qualifiers_open',
    }));
    appendAuditLog(
      'season_state_change',
      '👩‍💼 المشرفة العامة',
      '🚀 فتح وتفعيل التصفيات الإلكترونية الذاتية',
      'بدأ النظام في استقبال الطلاب وتوزيع الأسئلة العشوائية المتوازنة وتصحيحها آلياً.'
    );
    notify('🚀 تم فتح التصفيات الإلكترونية! النظام الذاتي يدير الاختبارات والتصحيح الآن تلقائياً.');
  };

  const handlePauseQualifiers = () => {
    soundEngine.playSelectTile();
    setSettings((prev) => ({
      ...prev,
      seasonStatus: 'registration_open',
    }));
    appendAuditLog(
      'season_state_change',
      '👩‍💼 المشرفة العامة',
      '⏸️ إيقاف مؤقت للتصفيات الإلكترونية',
      'تم إيقاف استقبال محاولات الاختبار مؤقتاً مع الاحتفاظ بكافة إجابات ونتائج الطلاب.'
    );
    notify('⏸️ تم إيقاف التصفيات مؤقتاً.');
  };

  const handleCloseAndAutoPrepareResults = () => {
    soundEngine.playBuzzer();
    const { rankedStudents, detectedTieAlerts } = runAutomatedRankingAndQualification(
      students,
      { ...settings, resultsCertified: false }
    );
    setStudents(rankedStudents);
    if (detectedTieAlerts.length > 0) {
      setSpecialCases((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newAlerts = detectedTieAlerts.filter((a) => !existingIds.has(a.id));
        return [...newAlerts, ...prev];
      });
    }
    setSettings((prev) => ({
      ...prev,
      seasonStatus: 'results_ready',
      resultsCertified: false,
    }));
    appendAuditLog(
      'auto_qualify',
      '🤖 النظام الذاتي',
      '🔒 إغلاق التصفيات وتجهيز الترتيب والمتأهلين تلقائياً',
      `تمت مراجعة وترتيب ${rankedStudents.length} طالباً آلياً وتحديد المتأهلين حسب حصص كل مرحلة. «تم تجهيز النتائج تلقائياً.»`
    );
    notify('🔒 تم إغلاق التصفيات: «تم تجهيز النتائج تلقائياً.» جاهزة لمراجعتك واعتمادك!');
  };

  const handleCertifyAndPublishResults = () => {
    soundEngine.playFanfare();
    const { rankedStudents } = runAutomatedRankingAndQualification(students, {
      ...settings,
      resultsCertified: true,
    });
    setStudents(rankedStudents);
    setSettings((prev) => ({
      ...prev,
      seasonStatus: 'next_round_ready',
      resultsCertified: true,
      showResultsDuringQualifiers: true,
    }));
    appendAuditLog(
      'results_approved',
      '👩‍💼 المشرفة العامة',
      '🏆 الاعتماد النهائي للنتائج وترقية المتأهلين للجولة التالية تلقائياً',
      'تم نشر قوائم أفضل الطلاب وأفضل المدارس والإدارات والمحافظات، وتفعيل بطاقة «🟢 لقد تأهلت!» للمتأهلين.'
    );
    notify('🏆 تم اعتماد النتائج رسمياً! انتقل المتأهلون تلقائياً إلى المرحلة التالية.');
  };

  return (
    <div className="space-y-6">
      {/* ==================== 👩‍💼 GENERAL SUPERVISOR SEASON STATUS & 1-CLICK CONTROL BAR ==================== */}
      <div className="p-6 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 space-y-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
                👩‍💼 المشرفة العامة على المسابقة
              </span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${statusMeta.colorClass}`}>
                {statusMeta.badge}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {settings.seasonName || 'موسم عباقرة عيون مصر ٢٠٢٦'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-display mt-1">
              {statusMeta.title}
            </h2>
            <p className="text-xs text-slate-300">
              {statusMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTriggerGeniusAlarm}
              className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 cursor-pointer"
            >
              🚨 إنذار العباقرة
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-400 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تصدير النتائج (CSV)</span>
            </button>
          </div>
        </div>

        {/* 4 One-Click Season Lifecycle Buttons (#47) */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenQualifiers}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                currentSeasonStatus === 'qualifiers_running'
                  ? 'bg-emerald-400 text-slate-950 shadow-lg ring-2 ring-emerald-300'
                  : 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-400 hover:text-slate-950'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>🚀 فتح التصفيات</span>
            </button>

            <button
              type="button"
              onClick={handlePauseQualifiers}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                currentSeasonStatus === 'registration_open'
                  ? 'bg-sky-400 text-slate-950 border-sky-300'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-sky-400'
              }`}
            >
              <Pause className="w-4 h-4" />
              <span>⏸️ إيقاف التصفيات</span>
            </button>

            <button
              type="button"
              onClick={handleCloseAndAutoPrepareResults}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
                currentSeasonStatus === 'results_ready'
                  ? 'bg-purple-400 text-slate-950 border-purple-300 shadow-lg'
                  : 'bg-slate-900 text-purple-300 border-purple-500/40 hover:bg-purple-500/20'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>🔒 إغلاق التصفيات (تجهيز تلقائي)</span>
            </button>

            <button
              type="button"
              onClick={handleCertifyAndPublishResults}
              className={`px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                currentSeasonStatus === 'next_round_ready'
                  ? 'bg-amber-400 text-slate-950 shadow-lg ring-2 ring-amber-200'
                  : 'bg-amber-400/20 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>🏆 اعتماد النتائج وترقية المتأهلين</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-300 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            🤖 <strong className="text-amber-400">التشغيل الذاتي:</strong> التسجيل ← التوزيع ← الاختبار ← التصحيح ← الترتيب ← التأهل يتم تلقائياً 100%
          </div>
        </div>

        {/* 📅 6-Phase Year-Round Qualifiers Quick Switcher for Supervisor */}
        <div className="p-4 rounded-2xl bg-slate-950/85 border border-amber-400/35 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-extrabold text-amber-400">
              📅 التحكم في مراحل وتصفيات السنة الـ٦ (اضغط على أي مرحلة لتفعيلها فوراً وتحديث التصفيات):
            </span>
            <span className="text-[11px] text-emerald-300">
              سبتمبر ← أكتوبر ← نوفمبر ← ديسمبر ← يناير ← فبراير ← مارس ← أبريل ← مايو ← يونيو ← يوليو ← أغسطس
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(settings.annualPhases && settings.annualPhases.length > 0
              ? settings.annualPhases
              : DEFAULT_ANNUAL_PHASES
            ).map((ph) => {
              const isCurr =
                (settings.activeAnnualPhaseId || 'phase_2_administration') === ph.id;
              return (
                <button
                  key={ph.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playFanfare();
                    const allPhases =
                      settings.annualPhases && settings.annualPhases.length > 0
                        ? settings.annualPhases
                        : DEFAULT_ANNUAL_PHASES;
                    const updatedPhases = allPhases.map((item) => ({
                      ...item,
                      status: (item.order < ph.order
                        ? 'completed'
                        : item.order === ph.order
                        ? 'active'
                        : 'upcoming') as 'completed' | 'active' | 'upcoming',
                    }));
                    setSettings((prev) => ({
                      ...prev,
                      activeAnnualPhaseId: ph.id as AnnualPhaseId,
                      currentHierarchyLevel: ph.targetLevel,
                      questionsCountPerExam: ph.questionsCount,
                      qualifierDurationMinutes: ph.durationMinutes,
                      annualPhases: updatedPhases,
                    }));
                    appendAuditLog(
                      'season_state_change',
                      '👩‍💼 المشرفة العامة',
                      `📅 تفعيل المرحلة السنوية: ${ph.title}`,
                      `تم انتقال المسابقة إلى (${ph.shortTitle} — ${ph.monthsLabel}) وتحديث إعدادات التصفية (${ph.questionsCount} سؤالاً في ${ph.durationMinutes} دقيقة).`
                    );
                    notify(`📅 تم تفعيل «${ph.title} (${ph.monthsLabel})» بنجاح!`);
                  }}
                  className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                    isCurr
                      ? 'bg-amber-400 text-slate-950 border-white font-extrabold shadow-lg scale-[1.02]'
                      : ph.status === 'completed'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200 hover:border-amber-400'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-amber-400/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span>{ph.monthsLabel}</span>
                    <span>
                      {isCurr ? '🟢 نشطة' : ph.status === 'completed' ? '✓ تمت' : '⏳'}
                    </span>
                  </div>
                  <div className="text-xs font-bold mt-0.5 truncate">
                    {ph.icon} {ph.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {currentSeasonStatus === 'results_ready' && (
          <div className="p-3.5 rounded-xl bg-purple-500/20 border border-purple-400 text-purple-200 text-xs font-bold flex items-center justify-between">
            <span>✨ «تم تجهيز النتائج تلقائيًا.» قام النظام بفرز وترتيب جميع الطلاب وتحديد المتأهلين وفق حصص كل مرحلة.</span>
            <button
              onClick={handleCertifyAndPublishResults}
              className="px-4 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
            >
              اعتماد نهائي الآن ✓
            </button>
          </div>
        )}
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(
          [
            { id: 'overview', label: '👩‍💼 لوحة المشرفة والإحصائيات (Recharts)' },
            { id: 'special_cases', label: `⚠️ مراجعة الحالات (${pendingSpecialCasesCount})` },
            { id: 'audit_log', label: `📋 سجل المسابقة (${auditLogs.length})` },
            { id: 'competition', label: '⚙️ دورة وإعدادات الموسم الذاتي' },
            { id: 'students', label: '👨‍🎓 الطلاب والمتأهلون' },
            { id: 'questions', label: '❓ بنك الأسئلة الذكي' },
            { id: 'teams', label: '🧩 إدارة الفرق (4-5)' },
            { id: 'awards', label: '🏅 ربط الجوائز بالفائزين' },
            { id: 'matches', label: '⚔️ المباريات المباشرة' },
            { id: 'results', label: '📊 النتائج العامة والمدارس' },
          ] as { id: AdminSection; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
              section === tab.id
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                : 'bg-[#131F38] text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== 0. SUPERVISOR OVERVIEW & RECHARTS VISUAL COMPONENT ==================== */}
      {section === 'overview' && (
        <div className="space-y-6">
          {/* 6 Automatic Executive KPI Cards (#46) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 rounded-2xl bg-[#131F38] border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">👥 المشاركون</div>
              <div className="text-2xl font-extrabold font-mono-num text-white">
                {students.length}
              </div>
              <div className="text-[11px] text-emerald-400">مسجلون تلقائياً</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#131F38] border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">🏫 المدارس</div>
              <div className="text-2xl font-extrabold font-mono-num text-amber-400">
                {uniqueSchoolsCount}
              </div>
              <div className="text-[11px] text-slate-300">مدرسة مشاركة</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#131F38] border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">🗺️ المحافظات</div>
              <div className="text-2xl font-extrabold font-mono-num text-sky-400">
                {uniqueGovernoratesCount}
              </div>
              <div className="text-[11px] text-slate-300">محافظة مشاركة</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#131F38] border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400">📊 التصفيات</div>
              <div className="text-2xl font-extrabold font-mono-num text-purple-400">
                {completedQualifiersCount}
              </div>
              <div className="text-[11px] text-slate-300">أنهوا الاختبار آلياً</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#131F38] border border-emerald-500/40 space-y-1">
              <div className="text-xs text-emerald-300">🏆 المتأهلون</div>
              <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                {qualifiedStudentsCount}
              </div>
              <div className="text-[11px] text-emerald-300">تأهلوا تلقائياً</div>
            </div>

            <div
              onClick={() => setSection('special_cases')}
              className="p-4 rounded-2xl bg-[#131F38] border border-rose-500/50 hover:border-rose-400 cursor-pointer space-y-1 transition-all"
            >
              <div className="text-xs text-rose-300">⚠️ الحالات الخاصة</div>
              <div className="text-2xl font-extrabold font-mono-num text-rose-400">
                {pendingSpecialCasesCount}
              </div>
              <div className="text-[11px] text-rose-300 underline">اضغط للمراجعة ←</div>
            </div>
          </div>

          {/* ==================== 📈 RECHARTS VISUAL COMPONENT: GOVERNORATES & GRADES DISTRIBUTION ==================== */}
          <div className="p-6 rounded-3xl bg-[#131F38] border border-amber-400/40 space-y-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>الإحصائيات المرئية الحية (Recharts Analytics)</span>
                </span>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  📊 توزيع الطلاب المشاركين والمتأهلين حسب المحافظات والصفوف الدراسية
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  // Add a sample batch of multi-governorate & multi-grade students to see live auto-scaling
                  soundEngine.playSelectTile();
                  const demoGovs = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'أسيوط'];
                  const demoGrades: GradeNumber[] = ['2', '3', '4', '5', '6', '8', '9', '11'];
                  const pickedGov = demoGovs[Math.floor(Math.random() * demoGovs.length)];
                  const pickedGrade = demoGrades[Math.floor(Math.random() * demoGrades.length)];
                  const stage = resolveStageFromGrade(pickedGrade);
                  const newStu: StudentProfile = {
                    id: `stu-auto-${Date.now()}`,
                    name: `طالب متسابق (${pickedGov})`,
                    grade: pickedGrade,
                    stage,
                    className: `${pickedGrade} / أ`,
                    schoolName: `مدرسة عيون مصر (${pickedGov})`,
                    administration: `إدارة ${pickedGov} التعليمية`,
                    governorate: pickedGov,
                    region: pickedGov,
                    country: 'مصر 🇪🇬',
                    participationCode: `OM-${pickedGrade}${Math.floor(100 + Math.random() * 899)}`,
                    attemptsUsed: 1,
                    completedQualifier: true,
                    qualifierDurationSeconds: 1050,
                    scores: {
                      total: Math.floor(380 + Math.random() * 100),
                      speedScore: 92,
                      logic: 90,
                      science: 91,
                      arabic: 89,
                      observation: 93,
                      math: 92,
                      egypt_world: 90,
                      general_culture: 88,
                      technology: 94,
                    },
                    qualifiedForFinals: true,
                    badges: ['🌟 متأهل تلقائياً'],
                  };
                  const { rankedStudents } = runAutomatedRankingAndQualification(
                    [newStu, ...students],
                    settings
                  );
                  setStudents(rankedStudents);
                  appendAuditLog(
                    'student_register',
                    '🤖 النظام الذاتي',
                    `تسجيل وتصحيح آلي لطالب جديد من محافظة ${pickedGov}`,
                    `تم تسكين الطالب في (${STAGE_METADATA[stage].shortLabel} - صف ${pickedGrade}) وتحديث رسوم Recharts تلقائياً.`
                  );
                  notify(`تمت محاكاة تسجيل وتصحيح طالب جديد من محافظة ${pickedGov} (صف ${pickedGrade})!`);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                + محاكاة دخول طالب جديد وتحديث الرسم البياني تلقائياً
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: BarChart of Students & Qualified by Governorate (توزيع الطلاب حسب المحافظات) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">
                      ١. توزيع الطلاب المشاركين والمتأهلين حسب المحافظات 🗺️
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      مقارنة إجمالي المسجلين بعدد المتأهلين تلقائياً في كل محافظة
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={governorateChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis
                        dataKey="governorate"
                        stroke="#94A3B8"
                        tick={{ fill: '#E2E8F0', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#D4AF37',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          textAlign: 'right',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Bar
                        dataKey="total"
                        name="إجمالي المشاركين بالمحافظة"
                        fill="#38BDF8"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="qualified"
                        name="المتأهلون تلقائياً"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: BarChart of Students Distribution by Grade (توزيع الطلاب حسب الصفوف الدراسية) */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white font-display">
                      ٢. توزيع الطلاب المشاركين حسب الصفوف الدراسية 🎓
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      يوضح أعداد الطلاب والمتأهلين عبر الصفوف (ابتدائي صغير، كبير، إعدادي، ثانوي)
                    </p>
                  </div>
                </div>

                <div className="h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={gradeChartData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis
                        dataKey="gradeName"
                        stroke="#94A3B8"
                        tick={{ fill: '#E2E8F0', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#D4AF37',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                          textAlign: 'right',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Bar
                        dataKey="participants"
                        name="عدد الطلاب بالصف"
                        fill="#F59E0B"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="qualified"
                        name="المتأهلون بالصف"
                        fill="#A855F7"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: PieChart of Governorate Share + Stage Quotas Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-amber-400" />
                  <span>٣. النسبة المئوية للمشاركة حسب المحافظات</span>
                </h4>
                <div className="h-60 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={governorateChartData}
                        dataKey="total"
                        nameKey="governorate"
                        cx="50%"
                        cy="50%"
                        outerRadius={78}
                        label={({ name, percent }) =>
                          `${name} (${Math.round((percent || 0) * 100)}%)`
                        }
                      >
                        {governorateChartData.map((_, idx) => (
                          <Cell
                            key={`cell-${idx}`}
                            fill={PIE_COLORS[idx % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#D4AF37',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Automatic Stage Quotas Summary (#40 & #44) */}
              <div className="lg:col-span-7 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white font-display">
                    ٤. التوزيع التلقائي للمراحل وحصص التأهل (بنوك أسئلة منفصلة لكل مرحلة)
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-bold">
                    ابتدائي صغير ≠ ابتدائي كبير ≠ إعدادي ≠ ثانوي
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(STAGE_METADATA) as EducationalStage[]).map((stgKey) => {
                    const meta = STAGE_METADATA[stgKey];
                    const stat = aggregatedRankings.stageBreakdown[stgKey];
                    const quota =
                      settings.stageQuotas?.[stgKey] || meta.defaultQuota;
                    return (
                      <div
                        key={stgKey}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs font-extrabold"
                            style={{ color: meta.badgeColor }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-amber-300 font-mono-num">
                            حصة التأهل: أفضل {quota}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>المشاركون: <strong className="text-white font-mono-num">{stat.total}</strong></span>
                          <span>تأهل تلقائياً: <strong className="text-emerald-400 font-mono-num">{stat.qualified}</strong></span>
                          <span>المتوسط: <strong className="text-amber-400 font-mono-num">{stat.avgScore}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 0.5 ⚠️ SPECIAL CASES REVIEW SECTION (#49) ==================== */}
      {section === 'special_cases' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-rose-400">
                ⚠️ نظام مراجعة الحالات الاستثنائية فقط (لا يوقف النظام الذاتي)
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-0.5">
                الحالات التي تحتاج قراراً إشرافياً ({pendingSpecialCasesCount} قيد المراجعة)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                جميع الطلاب العاديين يصححهم النظام ويرتبهم تلقائياً؛ وتظهر هنا فقط حالات الانقطاع أو التعادل أو محاولات الدخول المكررة.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {specialCases.map((sc) => (
              <div
                key={sc.id}
                className={`p-4 rounded-2xl border flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                  sc.status === 'pending'
                    ? 'bg-slate-950/90 border-rose-500/50'
                    : 'bg-slate-900/50 border-slate-800 opacity-75'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[11px] font-bold">
                      {sc.type === 'interrupted_exam'
                        ? '🔌 انقطاع الاختبار'
                        : sc.type === 'duplicate_attempt'
                        ? '🚫 محاولة دخول مكررة'
                        : sc.type === 'tie_breaker_needed'
                        ? '⚖️ تعادل يستدعي سؤالاً فاصلاً'
                        : '⚠️ بلاغ تقني'}
                    </span>
                    <span className="text-sm font-bold text-white">{sc.studentName}</span>
                    <span className="font-mono-num text-xs text-amber-400">({sc.participationCode})</span>
                    <span className="text-xs text-emerald-300">
                      🏫 {sc.schoolName} · 🗺️ {sc.governorate}
                    </span>
                    <span className="text-[11px] text-slate-500">{sc.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-300">{sc.description}</p>
                  {sc.resolutionNote && (
                    <div className="text-xs text-emerald-400 font-bold">
                      ✓ قرار المشرفة: {sc.resolutionNote}
                    </div>
                  )}
                </div>

                {sc.status === 'pending' ? (
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {sc.type === 'interrupted_exam' && (
                      <button
                        onClick={() => {
                          setSpecialCases((prev) =>
                            prev.map((item) =>
                              item.id === sc.id
                                ? {
                                    ...item,
                                    status: 'resolved',
                                    resolutionNote: 'تم السماح باستئناف الوقت المتبقي (9 دقائق) مع الاحتفاظ بالإجابات السابقة.',
                                  }
                                : item
                            )
                          );
                          appendAuditLog(
                            'supervisor_override',
                            '👩‍💼 المشرفة العامة',
                            `معالجة انقطاع اختبار الطالب ${sc.studentName}`,
                            'تم تفعيل استئناف الجلسة للطالب من السؤال رقم 38.'
                          );
                          notify('تم السماح للطالب باستئناف الاختبار وتسجيل القرار في سجل المسابقة.');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        ✓ السماح باستكمال المحاولة
                      </button>
                    )}

                    {sc.type === 'tie_breaker_needed' && (
                      <button
                        onClick={() => {
                          setSpecialCases((prev) =>
                            prev.map((item) =>
                              item.id === sc.id
                                ? {
                                    ...item,
                                    status: 'resolved',
                                    resolutionNote: 'تم إرسال سؤال فاصل إلكتروني تلقائي وحسم الترتيب.',
                                  }
                                : item
                            )
                          );
                          appendAuditLog(
                            'supervisor_override',
                            '🤖 النظام الذاتي',
                            `تفعيل السؤال الفاصل الإلكتروني لـ ${sc.studentName}`,
                            'تم إرسال سؤال السرعة الفاصل وحسم التأهل تلقائياً.'
                          );
                          notify('تم تفعيل السؤال الفاصل الإلكتروني وحسم التعادل!');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        ⚡ إرسال سؤال فاصل إلكتروني
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSpecialCases((prev) =>
                          prev.map((item) =>
                            item.id === sc.id
                              ? {
                                  ...item,
                                  status: 'dismissed',
                                  resolutionNote: 'تم اعتماد قرار النظام الآلي وإغلاق الحالة.',
                                }
                              : item
                          )
                        );
                        appendAuditLog(
                          'supervisor_override',
                          '👩‍💼 المشرفة العامة',
                          `اعتماد قرار النظام الآلي في حالة ${sc.studentName}`,
                          'تمت مراجعة الحالة واعتماد الإجراء التلقائي للنظام.'
                        );
                        notify('تم اعتماد إجراء النظام الآلي وإغلاق الحالة.');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer"
                    >
                      اعتماد إجراء النظام الآلي
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                    ✓ تمت المعالجة
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== 0.8 📋 COMPETITION AUDIT LOG SECTION (#50) ==================== */}
      {section === 'audit_log' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400">
                📋 سجل عمليات المسابقة والشفافية الكاملة (Audit Log)
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-0.5">
                التوثيق التلقائي لجميع أحداث التسجيل، التصحيح، التأهل، وقرارات المشرفة
              </h3>
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        log.actor === '👩‍💼 المشرفة العامة'
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                      }`}
                    >
                      {log.actor}
                    </span>
                    <span className="text-sm font-bold text-white">{log.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{log.details}</p>
                </div>
                <span className="font-mono-num text-xs text-amber-400 shrink-0">
                  🕒 {log.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. STUDENTS SECTION */}
      {section === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">إضافة طالب جديد</h3>
            <input
              type="text"
              value={stuName}
              onChange={(e) => setStuName(e.target.value)}
              placeholder="اسم الطالب الثلاثي"
              className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={stuGrade}
                onChange={(e) => setStuGrade(e.target.value as GradeNumber)}
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                <option value="4">الصف الرابع</option>
                <option value="5">الصف الخامس</option>
                <option value="6">الصف السادس</option>
              </select>
              <input
                type="text"
                value={stuClass}
                onChange={(e) => setStuClass(e.target.value)}
                placeholder="الفصل (5 / أ)"
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="space-y-2.5 pt-1 border-t border-slate-800">
              <div>
                <label className="block text-[11px] text-amber-300 font-bold mb-1">🏫 اسم المدرسة</label>
                <input
                  type="text"
                  value={stuSchool}
                  onChange={(e) => setStuSchool(e.target.value)}
                  placeholder="اسم المدرسة (مثال: مدرسة عيون مصر للغات)"
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-amber-300 font-bold mb-1">📍 المنطقة / المحافظة</label>
                  <input
                    type="text"
                    value={stuRegion}
                    onChange={(e) => setStuRegion(e.target.value)}
                    placeholder="المنطقة (مثال: القاهرة)"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-amber-300 font-bold mb-1">🌍 البلد</label>
                  <input
                    type="text"
                    value={stuCountry}
                    onChange={(e) => setStuCountry(e.target.value)}
                    placeholder="البلد (مثال: مصر 🇪🇬)"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (!stuName.trim()) return;
                const code = `OM-${stuGrade}${Math.floor(100 + Math.random() * 899)}`;
                const newS: StudentProfile = {
                  id: `stu-${Date.now()}`,
                  name: stuName.trim(),
                  grade: stuGrade,
                  className: stuClass,
                  schoolName: stuSchool.trim() || 'مدرسة عيون مصر للغات',
                  region: stuRegion.trim() || 'القاهرة',
                  country: stuCountry.trim() || 'مصر 🇪🇬',
                  participationCode: code,
                  completedQualifier: false,
                  scores: {
                    total: 0,
                    speedScore: 0,
                    logic: 0,
                    science: 0,
                    arabic: 0,
                    observation: 0,
                    math: 0,
                    egypt_world: 0,
                    general_culture: 0,
                    technology: 0,
                  },
                  qualifiedForFinals: false,
                  badges: [],
                };
                setStudents((prev) => [newS, ...prev]);
                setStuName('');
                notify(`تم تسجيل الطالب وإصدار الكود: ${code}`);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              + إضافة الطالب وتوليد كود المشاركة
            </button>
          </div>

          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-bold text-white font-display">
                سجل الطلاب المسجلين ({filteredStudents.length})
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الكود أو الفصل..."
                className="px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">الاسم</th>
                    <th className="py-2.5 px-3">الصف/الفصل</th>
                    <th className="py-2.5 px-3">المدرسة / المنطقة / البلد</th>
                    <th className="py-2.5 px-3">الكود</th>
                    <th className="py-2.5 px-3">مجموع التصفيات</th>
                    <th className="py-2.5 px-3">التأهل للنهائي</th>
                    <th className="py-2.5 px-3">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-3 font-bold text-white">{s.name}</td>
                      <td className="py-3 px-3 text-slate-300">
                        الصف {s.grade} ({s.className})
                      </td>
                      <td className="py-3 px-3 text-emerald-300">
                        {s.schoolName || settings.defaultSchoolName || 'مدرسة عيون مصر للغات'} · {s.region || settings.defaultRegion || 'القاهرة'} · {s.country || settings.defaultCountry || 'مصر 🇪🇬'}
                      </td>
                      <td className="py-3 px-3 font-mono-num text-amber-400 font-bold">
                        {s.participationCode}
                      </td>
                      <td className="py-3 px-3 font-mono-num text-emerald-400 font-bold">
                        {s.scores.total} نقطة
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            setStudents((prev) =>
                              prev.map((item) =>
                                item.id === s.id
                                  ? { ...item, qualifiedForFinals: !item.qualifiedForFinals }
                                  : item
                              )
                            );
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                            s.qualifiedForFinals
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-900 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {s.qualifiedForFinals ? '✓ متأهل' : 'غير متأهل'}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() =>
                            setStudents((prev) => prev.filter((item) => item.id !== s.id))
                          }
                          className="text-rose-400 hover:text-rose-300"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUESTIONS SECTION */}
      {section === 'questions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white font-display">إضافة سؤال جديد</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">المجال</label>
                <select
                  value={qDomain}
                  onChange={(e) => setQDomain(e.target.value as QualifierDomain)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  {(Object.keys(DOMAIN_META) as QualifierDomain[]).map((k) => (
                    <option key={k} value={k}>
                      {DOMAIN_META[k].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الصعوبة</label>
                <select
                  value={qDiff}
                  onChange={(e) => setQDiff(e.target.value as DifficultyLevel)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="easy">🟢 سهل</option>
                  <option value="medium">🟡 متوسط</option>
                  <option value="hard">🔴 صعب</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">النقاط</label>
                <input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">الوقت (ثانية)</label>
                <input
                  type="number"
                  value={qTime}
                  onChange={(e) => setQTime(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <textarea
              rows={2}
              value={qText}
              onChange={(e) => setQText(e.target.value)}
              placeholder="نص السؤال..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={qOpt0}
                onChange={(e) => setQOpt0(e.target.value)}
                placeholder="الاختيار 1"
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
              <input
                type="text"
                value={qOpt1}
                onChange={(e) => setQOpt1(e.target.value)}
                placeholder="الاختيار 2"
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
              <input
                type="text"
                value={qOpt2}
                onChange={(e) => setQOpt2(e.target.value)}
                placeholder="الاختيار 3"
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
              <input
                type="text"
                value={qOpt3}
                onChange={(e) => setQOpt3(e.target.value)}
                placeholder="الاختيار 4"
                className="px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <select
              value={qCorrect}
              onChange={(e) => setQCorrect(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              <option value={0}>الإجابة الصحيحة: الاختيار 1</option>
              <option value={1}>الإجابة الصحيحة: الاختيار 2</option>
              <option value={2}>الإجابة الصحيحة: الاختيار 3</option>
              <option value={3}>الإجابة الصحيحة: الاختيار 4</option>
            </select>

            <button
              onClick={() => {
                if (!qText.trim() || !qOpt0.trim() || !qOpt1.trim()) return;
                const newQ: QualifierQuestion = {
                  id: `cust-${Date.now()}`,
                  domain: qDomain,
                  difficulty: qDiff,
                  grade: 'all',
                  question: qText.trim(),
                  options: [
                    qOpt0.trim(),
                    qOpt1.trim(),
                    qOpt2.trim() || 'اختيار ثالث',
                    qOpt3.trim() || 'اختيار رابع',
                  ],
                  correctIndex: qCorrect,
                  points: qPoints,
                  timeSeconds: qTime,
                };
                setCustomQuestions((prev) => [newQ, ...prev]);
                setQText('');
                setQOpt0('');
                setQOpt1('');
                setQOpt2('');
                setQOpt3('');
                notify('تمت إضافة السؤال بنجاح إلى بنك الأسئلة!');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              + حفظ السؤال في بنك المسابقة
            </button>
          </div>

          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-white font-display">
              الأسئلة المضافة من المشرف ({customQuestions.length}) + 50 سؤالاً أساسياً معتمداً
            </h3>
            {customQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                النظام يعمل حالياً بـ ٥٠ سؤالاً أساسياً موزعاً على الـ٨ مجالات. أي سؤال تضيفه هنا سيظهر فوراً!
              </p>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] text-amber-400">
                        {DOMAIN_META[q.domain].label} · {q.points} نقطة
                      </span>
                      <div className="text-xs font-bold text-white mt-0.5">{q.question}</div>
                    </div>
                    <button
                      onClick={() =>
                        setCustomQuestions((prev) => prev.filter((item) => item.id !== q.id))
                      }
                      className="text-xs text-rose-400 hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. COMPETITION SETTINGS & ANTI-CHEAT */}
      {section === 'competition' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-6">
          {/* App Profile Image Picker in Admin Settings */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-400/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={settings.appProfileImage || APP_PROFILE_PRESETS[0].url}
                  alt="صورة بروفيل التطبيق"
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shrink-0"
                />
                <div>
                  <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>صورة بروفيل التطبيق وشعار البطولة الرسمي</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر من الشعارات الملكية الجاهزة أو ارفع شعار مدرستك الخاص من جهازك ليظهر في كافة صفحات التطبيق:
                  </p>
                </div>
              </div>

              <label className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>رفع صورة من جهازك</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        setSettings({ ...settings, appProfileImage: reader.result as string });
                        notify('تم تغيير صورة بروفيل التطبيق بنجاح!');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {APP_PROFILE_PRESETS.map((preset) => {
                const isSelected =
                  (settings.appProfileImage || APP_PROFILE_PRESETS[0].url) === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSettings({ ...settings, appProfileImage: preset.url });
                      notify(`تم اعتماد: ${preset.name}`);
                    }}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700"
                    />
                    <span className="text-[11px] font-bold">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <h3 className="text-lg font-bold text-white font-display">
            ⚙️ إعدادات دورة التصفيات الإلكترونية الذاتية والحصص ومسار التأهل
          </h3>

          {/* Season Name, Qualification Path Mode (#45) & Stage Quotas (#44) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-emerald-400/40 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-emerald-300 font-bold mb-1">🏷️ اسم الموسم الحالي</label>
                <input
                  type="text"
                  value={settings.seasonName || 'موسم عباقرة عيون مصر ٢٠٢٦'}
                  onChange={(e) => setSettings({ ...settings, seasonName: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-emerald-300 font-bold mb-1">🛤️ نظام مسار التأهل (#45)</label>
                <select
                  value={settings.qualificationPathMode || 'hierarchical'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      qualificationPathMode: e.target.value as 'national_direct' | 'hierarchical',
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="hierarchical">
                    🏫 تدرج هرمي: مدرسة ← إدارة تعليمية ← محافظة ← جمهورية
                  </option>
                  <option value="national_direct">
                    🇪🇬 تصفيات جمهورية مباشرة
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-emerald-300 font-bold mb-1">🎯 المستوى الحالي للتصفية</label>
                <select
                  value={settings.currentHierarchyLevel || 'school'}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      currentHierarchyLevel: e.target.value as HierarchyLevel,
                    })
                  }
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                >
                  <option value="school">🏫 تصفية المدرسة</option>
                  <option value="administration">📍 تصفية الإدارة التعليمية</option>
                  <option value="governorate">🗺️ تصفية المحافظة</option>
                  <option value="republic">🇪🇬 التصفية النهائية على مستوى الجمهورية</option>
                </select>
              </div>
            </div>

            {/* Stage Quotas (#44) */}
            <div className="pt-2 border-t border-slate-800">
              <div className="font-bold text-amber-300 mb-2">
                🏆 حصص التأهل التلقائي حسب المرحلة التعليمية (يحدد النظام المتأهلين تلقائياً حسب هذه الأعداد):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ابتدائي صغير (صفوف ١-٣)</label>
                  <input
                    type="number"
                    value={settings.stageQuotas?.primary_lower ?? 100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stageQuotas: {
                          ...(settings.stageQuotas || {
                            primary_lower: 100,
                            primary_upper: 150,
                            preparatory: 100,
                            secondary: 80,
                          }),
                          primary_lower: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ابتدائي كبير (صفوف ٤-٦)</label>
                  <input
                    type="number"
                    value={settings.stageQuotas?.primary_upper ?? 150}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stageQuotas: {
                          ...(settings.stageQuotas || {
                            primary_lower: 100,
                            primary_upper: 150,
                            preparatory: 100,
                            secondary: 80,
                          }),
                          primary_upper: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المرحلة الإعدادية</label>
                  <input
                    type="number"
                    value={settings.stageQuotas?.preparatory ?? 100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stageQuotas: {
                          ...(settings.stageQuotas || {
                            primary_lower: 100,
                            primary_upper: 150,
                            preparatory: 100,
                            secondary: 80,
                          }),
                          preparatory: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">المرحلة الثانوية</label>
                  <input
                    type="number"
                    value={settings.stageQuotas?.secondary ?? 80}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stageQuotas: {
                          ...(settings.stageQuotas || {
                            primary_lower: 100,
                            primary_upper: 150,
                            preparatory: 100,
                            secondary: 80,
                          }),
                          secondary: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono-num"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleOpenQualifiers}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs cursor-pointer hover:bg-emerald-300"
              >
                🚀 تفعيل التصفيات وفق هذه الإعدادات الآن
              </button>
            </div>
          </div>

          {/* Default School Name, Region/Governorate & Country Settings */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-400/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-amber-300 font-bold mb-1">🏫 اسم المدرسة الافتراضي</label>
              <input
                type="text"
                value={settings.defaultSchoolName || 'مدرسة عيون مصر للغات'}
                onChange={(e) =>
                  setSettings({ ...settings, defaultSchoolName: e.target.value })
                }
                placeholder="مثال: مدرسة عيون مصر للغات"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-amber-300 font-bold mb-1">📍 المنطقة / المحافظة الافتراضية</label>
              <input
                type="text"
                value={settings.defaultRegion || 'القاهرة'}
                onChange={(e) =>
                  setSettings({ ...settings, defaultRegion: e.target.value })
                }
                placeholder="مثال: القاهرة / الجيزة"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-amber-300 font-bold mb-1">🌍 البلد الافتراضي</label>
              <input
                type="text"
                value={settings.defaultCountry || 'مصر 🇪🇬'}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCountry: e.target.value })
                }
                placeholder="مثال: مصر 🇪🇬"
                className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">تاريخ البداية</label>
              <input
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">تاريخ النهاية</label>
              <input
                type="date"
                value={settings.endDate}
                onChange={(e) => setSettings({ ...settings, endDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">مدة اختبار التصفيات (بالدقائق)</label>
              <input
                type="number"
                value={settings.qualifierDurationMinutes}
                onChange={(e) =>
                  setSettings({ ...settings, qualifierDurationMinutes: Number(e.target.value) })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">عدد الفرق في شجرة البطولة النهائية</label>
              <select
                value={settings.tournamentBracketSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    tournamentBracketSize: Number(e.target.value) as 16 | 8 | 4 | 2,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              >
                <option value={16}>16 فريقاً (دور الـ16)</option>
                <option value={8}>8 فرق (ربع النهائي)</option>
                <option value={4}>4 فرق (نصف النهائي)</option>
                <option value={2}>فريقان (المباراة النهائية مباشرة)</option>
              </select>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>إغلاق الرجوع للأسئلة السابقة في التصفيات</span>
              <input
                type="checkbox"
                checked={!settings.allowBackNavigationInQualifier}
                onChange={(e) =>
                  setSettings({ ...settings, allowBackNavigationInQualifier: !e.target.checked })
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>تفعيل خصم النقاط عند الخطأ في تحدي المخاطرة</span>
              <input
                type="checkbox"
                checked={settings.enableRiskPenalty}
                onChange={(e) => setSettings({ ...settings, enableRiskPenalty: e.target.checked })}
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <span>عرض لوحة الأبطال للجمهور أثناء التصفيات</span>
              <input
                type="checkbox"
                checked={settings.showResultsDuringQualifiers}
                onChange={(e) =>
                  setSettings({ ...settings, showResultsDuringQualifiers: e.target.checked })
                }
                className="w-4 h-4 accent-amber-400"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-300 block">
                  🔒 وضع حماية خصوصية الطلاب والأطفال (#31)
                </span>
                <span className="text-[11px] text-slate-400">
                  إظهار الاسم الأول والحرف الأول من اسم الأب (مثال: أحمد م.) في اللوحات العامة
                </span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(settings.privacyMaskNames)}
                onChange={(e) =>
                  setSettings({ ...settings, privacyMaskNames: e.target.checked })
                }
                className="w-4 h-4 accent-emerald-400"
              />
            </div>
          </div>

          {/* National School Composite Points Formula (#14 & #27) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-400/40 space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-400">
                🏫 معادلة احتساب نقاط وترتيب المدارس على مستوى الجمهورية (#14)
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                النقاط المركبة للمدرسة = (مجموع نقاط الطلاب × معامل) + (المتوسط × معامل) + (بونص المتأهلين) + (بونص كل مشارك)
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1">معامل مجموع نقاط الطلاب</label>
                <input
                  type="number"
                  step="0.1"
                  value={settings.schoolScoringFormula?.totalPointsWeight ?? 1}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schoolScoringFormula: {
                        totalPointsWeight: Number(e.target.value),
                        avgScoreWeight: settings.schoolScoringFormula?.avgScoreWeight ?? 2,
                        qualifiedBonusPoints:
                          settings.schoolScoringFormula?.qualifiedBonusPoints ?? 75,
                        participantBonusPoints:
                          settings.schoolScoringFormula?.participantBonusPoints ?? 15,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1">معامل متوسط درجات المدرسة</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.schoolScoringFormula?.avgScoreWeight ?? 2}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schoolScoringFormula: {
                        totalPointsWeight: settings.schoolScoringFormula?.totalPointsWeight ?? 1,
                        avgScoreWeight: Number(e.target.value),
                        qualifiedBonusPoints:
                          settings.schoolScoringFormula?.qualifiedBonusPoints ?? 75,
                        participantBonusPoints:
                          settings.schoolScoringFormula?.participantBonusPoints ?? 15,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1">بونص كل طالب متأهل (نقطة)</label>
                <input
                  type="number"
                  value={settings.schoolScoringFormula?.qualifiedBonusPoints ?? 75}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schoolScoringFormula: {
                        totalPointsWeight: settings.schoolScoringFormula?.totalPointsWeight ?? 1,
                        avgScoreWeight: settings.schoolScoringFormula?.avgScoreWeight ?? 2,
                        qualifiedBonusPoints: Number(e.target.value),
                        participantBonusPoints:
                          settings.schoolScoringFormula?.participantBonusPoints ?? 15,
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <label className="block text-slate-400 mb-1">بونص كل طالب مشارك (نقطة)</label>
                <input
                  type="number"
                  value={settings.schoolScoringFormula?.participantBonusPoints ?? 15}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      schoolScoringFormula: {
                        totalPointsWeight: settings.schoolScoringFormula?.totalPointsWeight ?? 1,
                        avgScoreWeight: settings.schoolScoringFormula?.avgScoreWeight ?? 2,
                        qualifiedBonusPoints:
                          settings.schoolScoringFormula?.qualifiedBonusPoints ?? 75,
                        participantBonusPoints: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono-num"
                />
              </div>
            </div>
          </div>

          {/* Enable / Disable Interactive Games (#12 & #27) */}
          <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">
                🎮 تفعيل أو إيقاف ألعاب وتحديات «عباقرة عيون مصر» (#27)
              </span>
              <span className="text-[11px] text-slate-400">
                يمكن للمشرفة التحكم في الألعاب المتاحة للطلاب والفرق
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 text-xs">
              {[
                { id: 'falcon_eye', label: '🦅 عين الصقر' },
                { id: 'lightning_speed', label: '⚡ سرعة البرق' },
                { id: 'genius_mind', label: '🧠 مخ العباقرة' },
                { id: 'mystery_fact', label: '🔍 المعلومة الغامضة' },
                { id: 'risk_ladder', label: '🎲 تحدي المخاطرة' },
                { id: 'point_heist', label: '🏴‍☠️ سرقة النقاط' },
                { id: 'black_box', label: '📦 الصندوق الأسود' },
                { id: 'no_words', label: '🙊 ممنوع الكلام' },
                { id: 'egypt_minute', label: '🇪🇬 مصر في دقيقة' },
                { id: 'genius_room', label: '🚪 غرفة العباقرة' },
                { id: 'classic_board', label: '📺 لوحة العباقرة' },
                { id: 'wheel_of_fortune', label: '🎡 عجلة الحظ' },
              ].map((gm) => {
                const isEnabled =
                  !settings.enabledGames ||
                  settings.enabledGames.includes(gm.id as any);
                return (
                  <label
                    key={gm.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isEnabled
                        ? 'bg-slate-900 border-emerald-400/50 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="font-bold">{gm.label}</span>
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => {
                        const current = settings.enabledGames || [
                          'classic_board',
                          'falcon_eye',
                          'lightning_speed',
                          'genius_mind',
                          'mystery_fact',
                          'risk_ladder',
                          'point_heist',
                          'black_box',
                          'no_words',
                          'egypt_minute',
                          'genius_room',
                          'wheel_of_fortune',
                        ];
                        const next = e.target.checked
                          ? [...current, gm.id as any]
                          : current.filter((x) => x !== gm.id);
                        setSettings({ ...settings, enabledGames: next });
                      }}
                      className="accent-emerald-400"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. TEAMS MANAGEMENT */}
      {section === 'teams' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  🧩 إنشاء فريق جديد في برنامج «عباقرة عيون مصر» (٤ أو ٥ لاعبين)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  يمكنك تكوين الفريق من ٤ لاعبين أساسيين، أو ٥ لاعبين (٤ أساسيين + لاعب خامس أساسي أو احتياطي) على غرار نظام برنامج العباقرة.
                </p>
              </div>

              {/* 4 or 5 Players Selector */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setTeamPlayerCount(4)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    teamPlayerCount === 4
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  👥 فريق من 4 لاعبين
                </button>
                <button
                  type="button"
                  onClick={() => setTeamPlayerCount(5)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    teamPlayerCount === 5
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  🖐️ فريق من 5 لاعبين
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">اسم الفريق الجديد</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="مثال: 🦁 فريق أسود عيون مصر"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">شعار الفريق (رمز)</label>
                <input
                  type="text"
                  value={teamEmblem}
                  onChange={(e) => setTeamEmblem(e.target.value)}
                  className="w-full px-3 py-2.5 text-center text-sm bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            {/* School Name, Region & Country for Team */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <div>
                <label className="block text-[11px] text-amber-300 font-bold mb-1">🏫 اسم المدرسة</label>
                <input
                  type="text"
                  value={teamSchool}
                  onChange={(e) => setTeamSchool(e.target.value)}
                  placeholder="مثال: مدرسة عيون مصر للغات"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-300 font-bold mb-1">📍 المنطقة / المحافظة</label>
                <input
                  type="text"
                  value={teamRegion}
                  onChange={(e) => setTeamRegion(e.target.value)}
                  placeholder="مثال: القاهرة / الجيزة"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-amber-300 font-bold mb-1">🌍 البلد</label>
                <input
                  type="text"
                  value={teamCountry}
                  onChange={(e) => setTeamCountry(e.target.value)}
                  placeholder="مثال: مصر 🇪🇬"
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Dynamic 4 or 5 Players Input Rows */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-amber-400">
                أسماء وصفوف لاعبي الفريق ({teamPlayerCount} لاعبين):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {newTeamMembers.slice(0, teamPlayerCount).map((mem, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-amber-300">
                        {idx === 0
                          ? '🎤 اللاعب ١ (قائد الفريق)'
                          : idx === 4
                          ? '🌟 اللاعب ٥ (اللاعب الخامس)'
                          : `🎙️ اللاعب ${idx + 1}`}
                      </span>
                      {idx === 4 && (
                        <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(mem.isReserve)}
                            onChange={(e) => {
                              const updated = [...newTeamMembers];
                              updated[idx] = { ...updated[idx], isReserve: e.target.checked };
                              setNewTeamMembers(updated);
                            }}
                            className="accent-amber-400"
                          />
                          <span>احتياطي</span>
                        </label>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={mem.name}
                        onChange={(e) => {
                          const updated = [...newTeamMembers];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setNewTeamMembers(updated);
                        }}
                        placeholder={`اسم اللاعب ${idx + 1}...`}
                        className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                      <select
                        value={mem.grade}
                        onChange={(e) => {
                          const updated = [...newTeamMembers];
                          updated[idx] = { ...updated[idx], grade: e.target.value as GradeNumber };
                          setNewTeamMembers(updated);
                        }}
                        className="px-2 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        <option value="4">صف 4</option>
                        <option value="5">صف 5</option>
                        <option value="6">صف 6</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (!teamName.trim()) {
                  notify('يرجى كتابة اسم الفريق أولاً');
                  return;
                }
                const ts = Date.now();
                const builtMembers = newTeamMembers
                  .slice(0, teamPlayerCount)
                  .map((m, idx) => ({
                    id: `mem-${ts}-${idx + 1}`,
                    name:
                      m.name.trim() ||
                      (idx === 0
                        ? 'قائد الفريق الأول'
                        : `لاعب الفريق ${idx + 1}`),
                    grade: m.grade,
                    isReserve: idx === 4 ? Boolean(m.isReserve) : false,
                  }));

                const newTeam: Team = {
                  id: `team-${ts}`,
                  name: teamName.trim(),
                  schoolName: teamSchool.trim() || settings.defaultSchoolName || 'مدرسة عيون مصر للغات',
                  region: teamRegion.trim() || settings.defaultRegion || 'القاهرة',
                  country: teamCountry.trim() || settings.defaultCountry || 'مصر 🇪🇬',
                  emblem: teamEmblem || '🏆',
                  color: teamColor,
                  captainId: builtMembers[0].id,
                  points: 100,
                  wins: 0,
                  matchesPlayed: 0,
                  titleBadge: '🌟 عباقرة عيون مصر',
                  cards: { challengeCard: true, swapQuestionCard: true, doublePointsCard: true },
                  members: builtMembers,
                };
                setTeams((prev) => [...prev, newTeam]);
                setTeamName('');
                setNewTeamMembers([
                  { name: '', grade: '6' },
                  { name: '', grade: '5' },
                  { name: '', grade: '5' },
                  { name: '', grade: '4' },
                  { name: '', grade: '4', isReserve: true },
                ]);
                notify(`تم إنشاء ${newTeam.name} المكون من ${teamPlayerCount} لاعبين بنجاح!`);
              }}
              className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
            >
              + اعتماد وإنشاء الفريق ({teamPlayerCount} لاعبين)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teams.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-bold text-white font-display">{t.name}</h4>
                    <span className="text-[11px] text-amber-400 font-semibold block">
                      التشكيل الحالي: {t.members.length} لاعبين (الحد المسموح: 4 أو 5 لاعبين)
                    </span>
                    <span className="text-[11px] text-emerald-300 block mt-0.5">
                      🏫 {t.schoolName || settings.defaultSchoolName || 'مدرسة عيون مصر للغات'} · 📍 {t.region || settings.defaultRegion || 'القاهرة'} · 🌍 {t.country || settings.defaultCountry || 'مصر 🇪🇬'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num text-amber-400 font-bold">{t.points} نقطة</span>
                    <button
                      onClick={() =>
                        setTeams((prev) =>
                          prev.map((item) =>
                            item.id === t.id
                              ? {
                                  ...item,
                                  cards: {
                                    challengeCard: true,
                                    swapQuestionCard: true,
                                    doublePointsCard: true,
                                  },
                                }
                              : item
                          )
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-sky-300 cursor-pointer"
                    >
                      إعادة شحن الكروت 🃏
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  أعضاء الفريق ({t.members.length} لاعبين) — يمكنك تعيين القائد أو التبديل بين ٤ و ٥ لاعبين:
                </div>
                <div className="space-y-1.5">
                  {t.members.map((m) => {
                    const isCapt = t.captainId === m.id;
                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                      >
                        <span className="text-white font-medium">
                          {m.name} (صف {m.grade}) {m.isReserve ? '· لاعب خامس/احتياطي' : ''}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setTeams((prev) =>
                                prev.map((item) =>
                                  item.id === t.id ? { ...item, captainId: m.id } : item
                                )
                              );
                              notify(`تم تعيين ${m.name} قائداً لـ ${t.name}`);
                            }}
                            className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer ${
                              isCapt
                                ? 'bg-amber-400 text-slate-950'
                                : 'bg-slate-950 text-slate-400 hover:text-white'
                            }`}
                          >
                            {isCapt ? '🎤 القائد' : 'تعيين كقائد'}
                          </button>
                          {t.members.length > 4 && !isCapt && (
                            <button
                              onClick={() => {
                                setTeams((prev) =>
                                  prev.map((item) =>
                                    item.id === t.id
                                      ? {
                                          ...item,
                                          members: item.members.filter((mem) => mem.id !== m.id),
                                        }
                                      : item
                                  )
                                );
                                notify(`تم تقليص الفريق إلى 4 لاعبين`);
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 text-[11px] cursor-pointer"
                              title="حذف اللاعب ليصبح الفريق 4 لاعبين"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add 5th player if team currently has 4 players */}
                {t.members.length < 5 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    {addingMemberToTeamId === t.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder="اسم اللاعب الخامس..."
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                        />
                        <select
                          value={newMemberGrade}
                          onChange={(e) => setNewMemberGrade(e.target.value as GradeNumber)}
                          className="px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white"
                        >
                          <option value="4">صف 4</option>
                          <option value="5">صف 5</option>
                          <option value="6">صف 6</option>
                        </select>
                        <button
                          onClick={() => {
                            if (!newMemberName.trim()) return;
                            setTeams((prev) =>
                              prev.map((item) =>
                                item.id === t.id
                                  ? {
                                      ...item,
                                      members: [
                                        ...item.members,
                                        {
                                          id: `m-${Date.now()}`,
                                          name: newMemberName.trim(),
                                          grade: newMemberGrade,
                                          isReserve: false,
                                        },
                                      ],
                                    }
                                  : item
                              )
                            );
                            setNewMemberName('');
                            setAddingMemberToTeamId(null);
                            notify(`تمت إضافة اللاعب الخامس إلى ${t.name}`);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          حفظ اللاعب الخامس
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingMemberToTeamId(t.id)}
                        className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
                      >
                        + إضافة لاعب خامس لهذا الفريق (ليصبح 5 لاعبين)
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4.5 AWARDS & TITLES ASSIGNMENT SECTION */}
      {section === 'awards' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                🏅 تخصيص وربط جوائز المسابقة والألقاب العشرة بالفرق أو الطلاب الفائزين
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                اختر لكل لقب ما إذا كان الفائز به «طالباً» أو «فريقاً»، ثم حدد اسم الفائز وسبب الاستحقاق ليظهر فوراً في صفحة الجوائز ولوحة الأبطال وبطاقة الطالب.
              </p>
            </div>
            <button
              onClick={() => {
                // Auto-assign smart winners based on highest scores
                const topStudent = [...students].sort((a, b) => b.scores.total - a.scores.total)[0];
                const topLogic = [...students].sort((a, b) => b.scores.logic - a.scores.logic)[0];
                const topSci = [...students].sort((a, b) => b.scores.science - a.scores.science)[0];
                const topMath = [...students].sort((a, b) => b.scores.math - a.scores.math)[0];
                const topArb = [...students].sort((a, b) => b.scores.arabic - a.scores.arabic)[0];
                const topSpeed = [...students].sort((a, b) => b.scores.speedScore - a.scores.speedScore)[0];
                const topTeam = [...teams].sort((a, b) => b.points - a.points)[0];

                setAwards((prev) =>
                  prev.map((aw) => {
                    if (aw.id === 'aw-1' && topStudent)
                      return { ...aw, winnerType: 'student', winnerId: topStudent.id };
                    if (aw.id === 'aw-2' && topLogic)
                      return { ...aw, winnerType: 'student', winnerId: topLogic.id };
                    if (aw.id === 'aw-3' && topSci)
                      return { ...aw, winnerType: 'student', winnerId: topSci.id };
                    if (aw.id === 'aw-4' && topMath)
                      return { ...aw, winnerType: 'student', winnerId: topMath.id };
                    if (aw.id === 'aw-5' && topArb)
                      return { ...aw, winnerType: 'student', winnerId: topArb.id };
                    if (aw.id === 'aw-7' && topSpeed)
                      return { ...aw, winnerType: 'student', winnerId: topSpeed.id };
                    if ((aw.id === 'aw-8' || aw.id === 'aw-10') && topTeam)
                      return { ...aw, winnerType: 'team', winnerId: topTeam.id };
                    return aw;
                  })
                );
                notify('تم التوزيع الذكي للألقاب تلقائياً بناءً على أعلى درجات الطلاب والفرق!');
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs whitespace-nowrap hover:bg-emerald-400"
            >
              ✨ توزيع الألقاب تلقائياً حسب الأعلى نقاطاً
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {awards.map((award) => {
              const currentWinnerType = award.winnerType || 'none';

              return (
                <div
                  key={award.id}
                  className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{award.icon}</span>
                      <div>
                        <h4 className="text-base font-bold text-white font-display">
                          {award.title}
                        </h4>
                        <p className="text-[11px] text-slate-400">{award.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Select Winner Type (Student / Team / Unassigned) */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const defaultStuId = students[0]?.id || null;
                        setAwards((prev) =>
                          prev.map((a) =>
                            a.id === award.id
                              ? { ...a, winnerType: 'student', winnerId: defaultStuId }
                              : a
                          )
                        );
                        notify(`تم تحديد فئة (طالب فائز) للقب ${award.title}`);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                        currentWinnerType === 'student'
                          ? 'bg-amber-400 text-slate-950 border-amber-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      👨‍🎓 ربط بطالب
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const defaultTeamId = teams[0]?.id || null;
                        setAwards((prev) =>
                          prev.map((a) =>
                            a.id === award.id
                              ? { ...a, winnerType: 'team', winnerId: defaultTeamId }
                              : a
                          )
                        );
                        notify(`تم تحديد فئة (فريق فائز) للقب ${award.title}`);
                      }}
                      className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                        currentWinnerType === 'team'
                          ? 'bg-sky-400 text-slate-950 border-sky-300'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
                      }`}
                    >
                      🧩 ربط بفريق
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAwards((prev) =>
                          prev.map((a) =>
                            a.id === award.id
                              ? { ...a, winnerType: null, winnerId: null }
                              : a
                          )
                        );
                        notify(`تم إلغاء ربط لقب ${award.title}`);
                      }}
                      className={`py-2 px-3 rounded-xl font-semibold border transition-all ${
                        currentWinnerType === 'none'
                          ? 'bg-slate-800 text-white border-slate-600'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      بدون فائز
                    </button>
                  </div>

                  {/* Step 2: Select Specific Student or Team */}
                  {award.winnerType === 'student' && (
                    <div>
                      <label className="block text-[11px] text-amber-400 font-semibold mb-1">
                        اختر الطالب الفائز بلقب «{award.title}»:
                      </label>
                      <select
                        value={award.winnerId || ''}
                        onChange={(e) => {
                          const newStuId = e.target.value;
                          setAwards((prev) =>
                            prev.map((a) =>
                              a.id === award.id ? { ...a, winnerId: newStuId } : a
                            )
                          );
                          // Also add badge to student's profile if not already present
                          const badgeLabel = `${award.icon} ${award.title}`;
                          setStudents((prev) =>
                            prev.map((s) =>
                              s.id === newStuId && !s.badges.includes(badgeLabel)
                                ? { ...s, badges: [...s.badges, badgeLabel] }
                                : s
                            )
                          );
                          notify(`تم تتويج الطالب بلقب ${award.title} بنجاح!`);
                        }}
                        className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-amber-400/50 rounded-xl text-white"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} — الصف {s.grade} ({s.className}) · [{s.scores.total} نقطة]
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {award.winnerType === 'team' && (
                    <div>
                      <label className="block text-[11px] text-sky-400 font-semibold mb-1">
                        اختر الفريق الفائز بلقب «{award.title}»:
                      </label>
                      <select
                        value={award.winnerId || ''}
                        onChange={(e) => {
                          const newTeamId = e.target.value;
                          setAwards((prev) =>
                            prev.map((a) =>
                              a.id === award.id ? { ...a, winnerId: newTeamId } : a
                            )
                          );
                          const badgeLabel = `${award.icon} ${award.title}`;
                          setTeams((prev) =>
                            prev.map((t) =>
                              t.id === newTeamId ? { ...t, titleBadge: badgeLabel } : t
                            )
                          );
                          notify(`تم تتويج الفريق بلقب ${award.title} بنجاح!`);
                        }}
                        className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-sky-400/50 rounded-xl text-white"
                      >
                        {teams.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} — ({t.points} نقطة · {t.wins} انتصارات)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Step 3: Citation / Reason Note */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      سبب الاستحقاق / كلمة التتويج في الشهادة:
                    </label>
                    <input
                      type="text"
                      value={award.citationNote || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAwards((prev) =>
                          prev.map((a) =>
                            a.id === award.id ? { ...a, citationNote: val } : a
                          )
                        );
                      }}
                      placeholder="اكتب سبب منح الجائزة ليظهر في بطاقة التتويج..."
                      className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. LIVE MATCHES CONTROL */}
      {section === 'matches' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
          <h3 className="text-lg font-bold text-white font-display">⚔️ إدارة المباريات وتعديل النقاط المباشرة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-white">{t.name}</div>
                  <div className="text-xs text-slate-400">الانتصارات: {t.wins}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setTeams((prev) =>
                        prev.map((item) =>
                          item.id === t.id ? { ...item, points: Math.max(0, item.points - 10) } : item
                        )
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 font-mono-num font-bold text-xs"
                  >
                    -10
                  </button>
                  <span className="font-mono-num text-lg font-bold text-amber-400 px-2">
                    {t.points}
                  </span>
                  <button
                    onClick={() =>
                      setTeams((prev) =>
                        prev.map((item) =>
                          item.id === t.id ? { ...item, points: item.points + 10 } : item
                        )
                      )
                    }
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono-num font-bold text-xs"
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. RESULTS OVERVIEW (#53: Top Students, Top Schools, Top Administrations, Top Governorates) */}
      {section === 'results' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-amber-400">
                📊 النتائج العامة المعتمدة (تُنشر تلقائياً مع الحفاظ على خصوصية البيانات)
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-0.5">
                🏆 أفضل الطلاب · 🏫 أفضل المدارس · 📍 أفضل الإدارات · 🗺️ أفضل المحافظات
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCertifyAndPublishResults}
                className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                🏆 اعتماد ونشر النتائج العامة
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                تصدير جدول النتائج CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Schools */}
            <div className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
              <h4 className="text-base font-bold text-amber-400 font-display">
                🏫 أفضل المدارس المشاركة
              </h4>
              <div className="space-y-2">
                {aggregatedRankings.topSchools.map((sch, i) => (
                  <div
                    key={sch.name}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        #{i + 1} {sch.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{sch.subLabel}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-mono-num font-bold text-emerald-400">
                        متوسط {sch.avgScore} نقطة
                      </div>
                      <div className="text-[10px] text-amber-300">
                        {sch.qualifiedCount} متأهل من {sch.participantsCount}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Educational Administrations */}
            <div className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
              <h4 className="text-base font-bold text-sky-400 font-display">
                📍 أفضل الإدارات التعليمية
              </h4>
              <div className="space-y-2">
                {aggregatedRankings.topAdministrations.map((adm, i) => (
                  <div
                    key={adm.name}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        #{i + 1} {adm.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{adm.subLabel}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-mono-num font-bold text-sky-400">
                        متوسط {adm.avgScore} نقطة
                      </div>
                      <div className="text-[10px] text-amber-300">
                        {adm.qualifiedCount} متأهل
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Governorates */}
            <div className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
              <h4 className="text-base font-bold text-emerald-400 font-display">
                🗺️ أفضل المحافظات المشاركة
              </h4>
              <div className="space-y-2">
                {aggregatedRankings.topGovernorates.map((gov, i) => (
                  <div
                    key={gov.name}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        #{i + 1} محافظة {gov.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{gov.subLabel}</div>
                    </div>
                    <div className="text-left">
                      <div className="font-mono-num font-bold text-emerald-400">
                        متوسط {gov.avgScore} نقطة
                      </div>
                      <div className="text-[10px] text-amber-300">
                        {gov.participantsCount} مشارك · {gov.qualifiedCount} متأهل
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
