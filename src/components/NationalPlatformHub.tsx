import React, { useState, useMemo } from 'react';
import {
  Trophy,
  School,
  MapPin,
  Users,
  CheckCircle2,
  Award,
  Search,
  Plus,
  Building2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Printer,
} from 'lucide-react';
import {
  StudentProfile,
  RegisteredSchool,
  SeasonArchiveItem,
  CompetitionSettings,
  EducationalStage,
  GradeNumber,
  SchoolType,
  AppView,
  AnnualPhaseId,
  AnnualQualificationPhase,
} from '../types/competition';
import {
  DEFAULT_ANNUAL_PHASES,
  MONTHLY_GENIUS_CHALLENGES_12,
} from '../data/challengesData';
import {
  STAGE_METADATA,
  GRADE_LABELS,
  EGYPT_27_GOVERNORATES,
  SCHOOL_TYPE_LABELS,
  resolveStageFromGrade,
  computeAggregatedRankings,
  formatStudentPublicName,
} from '../services/qualificationEngine';
import { soundEngine } from '../utils/sound';

// ============================================================================
// 1. 🏅 NATIONAL RANKINGS & 🇪🇬 REPUBLIC PODIUMS (ترتيب العباقرة وعباقرة الجمهورية)
// ============================================================================

interface NationalRankingsViewProps {
  students: StudentProfile[];
  settings: CompetitionSettings;
  onSelectStudentCard: (student: StudentProfile) => void;
  onInspectSchool: (schoolName: string) => void;
  onNavigateView: (view: AppView) => void;
}

export const NationalRankingsView: React.FC<NationalRankingsViewProps> = ({
  students,
  settings,
  onSelectStudentCard,
  onInspectSchool,
  onNavigateView,
}) => {
  const [selectedStage, setSelectedStage] = useState<EducationalStage>('primary_upper');
  const [selectedGov, setSelectedGov] = useState<string>('ALL');
  const [selectedSchool, setSelectedSchool] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSymbolicGeneralOrder, setShowSymbolicGeneralOrder] = useState<boolean>(false);

  const privacyMode = settings.publicNamePrivacyMode || 'full_name';

  // Unique schools list for filter
  const availableSchools = useMemo(() => {
    const filteredByGov =
      selectedGov === 'ALL'
        ? students
        : students.filter((s) => (s.governorate || s.region) === selectedGov);
    return Array.from(
      new Set(filteredByGov.map((s) => s.schoolName || 'مدرسة مشاركة'))
    );
  }, [students, selectedGov]);

  // Rule #20: Primary ranking is ALWAYS isolated within each EducationalStage so a Grade 2 student is NEVER unfairly compared with Grade 12
  const stageFilteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const stg = s.stage || resolveStageFromGrade(s.grade);
        if (!showSymbolicGeneralOrder && stg !== selectedStage) return false;
        if (selectedGov !== 'ALL' && (s.governorate || s.region) !== selectedGov) return false;
        if (selectedSchool !== 'ALL' && s.schoolName !== selectedSchool) return false;
        if (
          searchQuery.trim() &&
          !s.name.includes(searchQuery.trim()) &&
          !s.participationCode.toLowerCase().includes(searchQuery.trim().toLowerCase()) &&
          !(s.schoolName || '').includes(searchQuery.trim())
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
        return (a.qualifierDurationSeconds || 9999) - (b.qualifierDurationSeconds || 9999);
      });
  }, [students, selectedStage, selectedGov, selectedSchool, searchQuery, showSymbolicGeneralOrder]);

  // Top 3 Republic Champions for the currently selected stage (#10: 🇪🇬 عباقرة الجمهورية)
  const republicTopThreeForStage = useMemo(() => {
    return students
      .filter((s) => (s.stage || resolveStageFromGrade(s.grade)) === selectedStage)
      .sort((a, b) => {
        if (b.scores.total !== a.scores.total) return b.scores.total - a.scores.total;
        return (a.qualifierDurationSeconds || 9999) - (b.qualifierDurationSeconds || 9999);
      })
      .slice(0, 3);
  }, [students, selectedStage]);

  const stageMeta = STAGE_METADATA[selectedStage];

  return (
    <section className="space-y-8">
      {/* Demo Data Notice Banner (#31) */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>
            تنبيه الشفافية: تتضمن هذه اللوحة «بيانات تجريبية (Demo Data)» لمدارس ومحافظات مصرية مختلفة لعرض نظام الترتيب الوطني، بجانب أي طلاب تسجلهم الآن.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded bg-slate-950 text-emerald-300 font-semibold">
          🔒 حماية خصوصية الطفل مفعّلة
        </span>
      </div>

      {/* Header & Stage Selector Pills (#9 & #10 & #20) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 space-y-5 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold text-amber-400">
              🇪🇬 عباقرة الجمهورية · الترتيب الرسمي العادل حسب كل مرحلة تعليمية
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              🏅 ترتيب العباقرة وقاعة أبطال الجمهورية
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              منعاً للظلم بين الأعمار المختلفة، يتم الترتيب الأكاديمي الأساسي بشكل مستقل تماماً داخل كل مرحلة تعليمية (ابتدائي صغير ≠ ابتدائي كبير ≠ إعدادي ≠ ثانوي) حسب النقاط ثم زمن الإجابة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateView('schools_hub')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-400 hover:text-slate-950 cursor-pointer transition-colors"
            >
              🏫 ترتيب مدارس الجمهورية
            </button>
            <button
              onClick={() => onNavigateView('egypt_map')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-sky-400/50 text-sky-300 text-xs font-bold hover:bg-sky-400 hover:text-slate-950 cursor-pointer transition-colors"
            >
              🗺️ خريطة محافظات مصر
            </button>
          </div>
        </div>

        {/* 4 Educational Stage Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {(
            [
              { id: 'primary_lower', icon: '🟢', badge: 'الصفوف ١ - ٣ ابتدائي' },
              { id: 'primary_upper', icon: '🔵', badge: 'الصفوف ٤ - ٦ ابتدائي' },
              { id: 'preparatory', icon: '🟣', badge: 'الصفوف ١ع - ٣ع' },
              { id: 'secondary', icon: '🟠', badge: 'الصفوف ١ث - ٣ث' },
            ] as { id: EducationalStage; icon: string; badge: string }[]
          ).map((st) => {
            const meta = STAGE_METADATA[st.id];
            const isSelected = !showSymbolicGeneralOrder && selectedStage === st.id;
            const countInStage = students.filter(
              (s) => (s.stage || resolveStageFromGrade(s.grade)) === st.id
            ).length;

            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  setShowSymbolicGeneralOrder(false);
                  setSelectedStage(st.id);
                }}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-400/20 border-2 border-amber-400 shadow-lg scale-[1.01]'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{st.icon}</span>
                  <span className="text-[11px] font-mono-num px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-bold">
                    {countInStage} متسابق
                  </span>
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white font-display">
                    {meta.shortLabel}
                  </div>
                  <div className="text-[11px] text-slate-400">{st.badge}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== 🇪🇬 REPUBLIC TOP 3 PODIUM FOR SELECTED STAGE (#10) ==================== */}
      <div className="p-6 rounded-3xl bg-[#131F38] border border-amber-400/50 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-amber-400">
              🇪🇬 لوحة شرف أبطال الجمهورية (ترتيب منفصل للمرحلة المختارة)
            </span>
            <h3 className="text-xl font-bold text-white font-display mt-0.5">
              أفضل ٣ طلاب في «{stageMeta.label}» على مستوى جمهورية مصر العربية
            </h3>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-extrabold text-slate-950"
            style={{ backgroundColor: stageMeta.badgeColor }}
          >
            {stageMeta.shortLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {republicTopThreeForStage.map((champ, idx) => {
            const medalLabel =
              idx === 0
                ? '🥇 المركز الأول على الجمهورية'
                : idx === 1
                ? '🥈 المركز الثاني على الجمهورية'
                : '🥉 المركز الثالث على الجمهورية';

            return (
              <div
                key={champ.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                  idx === 0
                    ? 'bg-gradient-to-b from-[#1E325C] to-[#131F38] border-2 border-amber-400 shadow-xl'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-amber-400">{medalLabel}</span>
                    <span className="font-mono-num text-slate-400">{champ.participationCode}</span>
                  </div>

                  <h4 className="text-xl font-bold text-white font-display">
                    {formatStudentPublicName(champ.name, privacyMode)}
                  </h4>

                  <div className="text-xs text-slate-300">
                    {GRADE_LABELS[champ.grade]} · الفصل: {champ.className}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1 text-xs">
                    <div
                      onClick={() => champ.schoolName && onInspectSchool(champ.schoolName)}
                      className="text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      🏫 المدرسة: {champ.schoolName || 'مدرسة مشاركة'}
                    </div>
                    <div className="text-sky-300">
                      📍 الإدارة: {champ.administration || 'إدارة تعليمية'}
                    </div>
                    <div className="text-amber-300">
                      🗺️ المحافظة: {champ.governorate || champ.region || 'القاهرة'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">النقاط والزمن</div>
                    <div className="text-xl font-extrabold font-mono-num text-emerald-400">
                      {champ.scores.total} نقطة{' '}
                      <span className="text-xs text-slate-400 font-normal">
                        ({champ.qualifierDurationSeconds || 1050} ث)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectStudentCard(champ)}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 cursor-pointer"
                  >
                    🪪 بطاقة العبقري
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== FILTER BAR: STAGE + GOVERNORATE + SCHOOL (#9) ==================== */}
      <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white font-display">
            🔍 تصفية وبحث في ترتيب طلاب الجمهورية ({stageFilteredStudents.length} طالب)
          </h3>

          <button
            type="button"
            onClick={() => setShowSymbolicGeneralOrder(!showSymbolicGeneralOrder)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
              showSymbolicGeneralOrder
                ? 'bg-purple-500/20 border-purple-400 text-purple-200'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {showSymbolicGeneralOrder
              ? '🌟 معروض الآن: الترتيب العام الرمزي للمشاركة (لجميع المراحل)'
              : '🌟 عرض الترتيب العام الرمزي للمشاركة'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">١. المرحلة التعليمية</label>
            <select
              value={selectedStage}
              disabled={showSymbolicGeneralOrder}
              onChange={(e) => setSelectedStage(e.target.value as EducationalStage)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              <option value="primary_lower">🟢 ابتدائي صغير (الصفوف 1 - 3)</option>
              <option value="primary_upper">🔵 ابتدائي كبير (الصفوف 4 - 6)</option>
              <option value="preparatory">🟣 المرحلة الإعدادية (1ع - 3ع)</option>
              <option value="secondary">🟠 المرحلة الثانوية (1ث - 3ث)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">٢. المحافظة</label>
            <select
              value={selectedGov}
              onChange={(e) => {
                setSelectedGov(e.target.value);
                setSelectedSchool('ALL');
              }}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              <option value="ALL">🇪🇬 جميع محافظات الجمهورية (27 محافظة)</option>
              {EGYPT_27_GOVERNORATES.map((g) => (
                <option key={g.name} value={g.name}>
                  📍 محافظة {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">٣. المدرسة</label>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            >
              <option value="ALL">🏫 جميع المدارس</option>
              {availableSchools.map((sch) => (
                <option key={sch} value={sch}>
                  {sch}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">٤. بحث باسم الطالب أو الكود</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="اكتب اسم الطالب أو كود المشاركة..."
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        {/* Rankings Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">الترتيب بالمرحلة</th>
                <th className="py-3 px-3">المتسابق</th>
                <th className="py-3 px-3">المرحلة / الصف</th>
                <th className="py-3 px-3">المدرسة ← الإدارة ← المحافظة</th>
                <th className="py-3 px-3">النقاط</th>
                <th className="py-3 px-3">زمن الإجابة</th>
                <th className="py-3 px-3">الحالة</th>
                <th className="py-3 px-3">بطاقة الطالب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stageFilteredStudents.map((stu, idx) => {
                const stg = stu.stage || resolveStageFromGrade(stu.grade);
                return (
                  <tr key={stu.id} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-mono-num font-extrabold text-amber-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{formatStudentPublicName(stu.name, privacyMode)}</span>
                        {stu.isDemoData && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                            تجريبي
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono-num text-slate-400">
                        كود: {stu.participationCode}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950 inline-block mb-0.5"
                        style={{ backgroundColor: STAGE_METADATA[stg].badgeColor }}
                      >
                        {STAGE_METADATA[stg].shortLabel}
                      </span>
                      <div className="text-slate-300">{GRADE_LABELS[stu.grade]}</div>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => stu.schoolName && onInspectSchool(stu.schoolName)}
                        className="font-bold text-emerald-300 hover:underline cursor-pointer block"
                      >
                        🏫 {stu.schoolName || 'مدرسة مشاركة'}
                      </button>
                      <span className="text-slate-400 text-[11px]">
                        📍 {stu.administration || 'إدارة تعليمية'} · 🗺️{' '}
                        {stu.governorate || stu.region || 'القاهرة'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono-num text-sm font-extrabold text-emerald-400">
                      {stu.scores.total} نقطة
                    </td>
                    <td className="py-3 px-3 font-mono-num text-sky-300">
                      {stu.qualifierDurationSeconds || 1080} ثانية
                    </td>
                    <td className="py-3 px-3">
                      {stu.qualifiedForFinals ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold">
                          🟢 متأهل
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[11px]">
                          مشارك
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onSelectStudentCard(stu)}
                        className="px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs cursor-pointer"
                      >
                        🪪 عرض البطاقة
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// 2. 🏫 SCHOOLS RANKING, SCHOOL PROFILE PAGE & BULK SCHOOL REGISTRATION (#11, #13, #14, #22)
// ============================================================================

interface SchoolsHubViewProps {
  students: StudentProfile[];
  registeredSchools: RegisteredSchool[];
  settings: CompetitionSettings;
  inspectedSchoolName: string | null;
  onSelectSchoolName: (name: string | null) => void;
  onRegisterNewSchool: (
    school: RegisteredSchool,
    initialBulkStudents: StudentProfile[]
  ) => void;
  onSelectStudentCard: (student: StudentProfile) => void;
}

export const SchoolsHubView: React.FC<SchoolsHubViewProps> = ({
  students,
  registeredSchools,
  settings,
  inspectedSchoolName,
  onSelectSchoolName,
  onRegisterNewSchool,
  onSelectStudentCard,
}) => {
  const [activeTab, setActiveTab] = useState<
    'schools_ranking' | 'administrations_ranking' | 'register_school' | 'school_profile'
  >(inspectedSchoolName ? 'school_profile' : 'schools_ranking');

  React.useEffect(() => {
    if (inspectedSchoolName) {
      setActiveTab('school_profile');
    }
  }, [inspectedSchoolName]);

  // Bulk School Registration Form State (#22)
  const [schName, setSchName] = useState('');
  const [schType, setSchType] = useState<SchoolType>('official_languages');
  const [schGov, setSchGov] = useState('القاهرة');
  const [schAdmin, setSchAdmin] = useState('إدارة المعادي التعليمية');
  const [schSupervisor, setSchSupervisor] = useState('');
  const [bulkStudentsRows, setBulkStudentsRows] = useState<
    { name: string; grade: GradeNumber; className: string }[]
  >([
    { name: '', grade: '5', className: '5 / أ' },
    { name: '', grade: '8', className: '2ع / أ' },
    { name: '', grade: '11', className: '2ث / علمي' },
  ]);
  const [createdSchoolCertificate, setCreatedSchoolCertificate] = useState<{
    school: RegisteredSchool;
    students: StudentProfile[];
  } | null>(null);

  const rankings = useMemo(
    () => computeAggregatedRankings(students, settings.schoolScoringFormula),
    [students, settings.schoolScoringFormula]
  );

  const activeSchoolProfileName =
    inspectedSchoolName || rankings.topSchools[0]?.name || 'مدرسة المتفوقين الرسمية للغات';

  const activeSchoolSummary =
    rankings.topSchools.find((s) => s.name === activeSchoolProfileName) ||
    rankings.topSchools[0];

  const activeSchoolRankIndex =
    rankings.topSchools.findIndex((s) => s.name === activeSchoolProfileName) + 1;

  const activeSchoolStudents = useMemo(
    () =>
      students
        .filter((s) => s.schoolName === activeSchoolProfileName)
        .sort((a, b) => b.scores.total - a.scores.total),
    [students, activeSchoolProfileName]
  );

  return (
    <section className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-amber-400">
            🏫 منظومة المدارس والإدارات التعليمية في جمهورية مصر العربية
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            أفضل مدارس الجمهورية · أفضل الإدارات التعليمية · تسجيل مدرسة جديدة
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            يُحسب ترتيب المدارس بنظام نقاط مركّب يجمع بين متوسط درجات الطلاب، عدد المتأهلين، والمراكز المتقدمة، بحيث لا تكفي كثرة عدد المشاركين وحدها للفوز.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'schools_ranking', label: '🏫 أفضل مدارس الجمهورية' },
              { id: 'administrations_ranking', label: '📍 أفضل الإدارات التعليمية' },
              { id: 'school_profile', label: '⭐ صفحة ونجوم المدرسة' },
              { id: 'register_school', label: '+ سجّل مدرستك الآن (تسجيل جماعي)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundEngine.playSelectTile();
                setActiveTab(t.id);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeTab === t.id
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TOP SCHOOLS IN THE REPUBLIC (#11) */}
      {activeTab === 'schools_ranking' && (
        <div className="space-y-6">
          {/* Top 3 Podium Schools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {rankings.topSchools.slice(0, 3).map((sch, idx) => {
              const medal =
                idx === 0
                  ? '🥇 المدرسة الأولى على الجمهورية'
                  : idx === 1
                  ? '🥈 المدرسة الثانية على الجمهورية'
                  : '🥉 المدرسة الثالثة على الجمهورية';
              return (
                <div
                  key={sch.name}
                  onClick={() => {
                    onSelectSchoolName(sch.name);
                    setActiveTab('school_profile');
                  }}
                  className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                    idx === 0
                      ? 'bg-gradient-to-b from-[#1E325C] to-[#131F38] border-2 border-amber-400 shadow-xl'
                      : 'bg-[#131F38] border-slate-800 hover:border-amber-400/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-400">{medal}</span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-950 text-emerald-300 font-mono-num font-bold">
                        {sch.compositePoints} نقطة مدرسة
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white font-display">{sch.name}</h3>
                    <div className="text-xs text-slate-300">
                      📍 {sch.administration} · 🗺️ محافظة {sch.governorate}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {sch.stagesPresent.map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                          style={{ backgroundColor: STAGE_METADATA[st].badgeColor }}
                        >
                          {STAGE_METADATA[st].shortLabel}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-slate-950">
                      <div className="text-[10px] text-slate-400">المشاركون</div>
                      <div className="font-mono-num font-bold text-white">{sch.participantsCount}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950">
                      <div className="text-[10px] text-slate-400">المتأهلون</div>
                      <div className="font-mono-num font-bold text-emerald-400">{sch.qualifiedCount}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950">
                      <div className="text-[10px] text-slate-400">متوسط الطلاب</div>
                      <div className="font-mono-num font-bold text-amber-400">{sch.avgScore}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Participating Schools Table */}
          <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white font-display">
              🏫 جدول ترتيب جميع المدارس المشاركة ({rankings.topSchools.length} مدرسة)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">المركز</th>
                    <th className="py-3 px-3">اسم المدرسة</th>
                    <th className="py-3 px-3">الإدارة التعليمية / المحافظة</th>
                    <th className="py-3 px-3">المراحل المشاركة</th>
                    <th className="py-3 px-3">المشاركون / المتأهلون</th>
                    <th className="py-3 px-3">متوسط الدرجات</th>
                    <th className="py-3 px-3">نقاط المدرسة الموزونة</th>
                    <th className="py-3 px-3">صفحة المدرسة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rankings.topSchools.map((sch, idx) => (
                    <tr key={sch.name} className="hover:bg-slate-900/50">
                      <td className="py-3 px-3 font-mono-num font-extrabold text-amber-400">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">{sch.name}</td>
                      <td className="py-3 px-3 text-slate-300">
                        📍 {sch.administration} · 🗺️ {sch.governorate}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {sch.stagesPresent.map((st) => (
                            <span
                              key={st}
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                              style={{ backgroundColor: STAGE_METADATA[st].badgeColor }}
                            >
                              {STAGE_METADATA[st].shortLabel}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono-num text-slate-200">
                        {sch.participantsCount} طلاب ({sch.qualifiedCount} متأهل)
                      </td>
                      <td className="py-3 px-3 font-mono-num text-sky-300 font-bold">
                        {sch.avgScore} نقطة
                      </td>
                      <td className="py-3 px-3 font-mono-num text-sm font-extrabold text-emerald-400">
                        {sch.compositePoints} نقطة
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => {
                            onSelectSchoolName(sch.name);
                            setActiveTab('school_profile');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          ⭐ نجوم المدرسة
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

      {/* TAB 2: EDUCATIONAL ADMINISTRATIONS RANKING (#13) */}
      {activeTab === 'administrations_ranking' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
          <div>
            <span className="text-xs font-bold text-sky-400">
              📍 المستوى الأوسط في الهيكل الوطني: المدرسة ← الإدارة التعليمية ← المحافظة ← الجمهورية
            </span>
            <h3 className="text-xl font-bold text-white font-display mt-1">
              🏆 ترتيب أفضل الإدارات التعليمية في الجمهورية ({rankings.topAdministrations.length} إدارة)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankings.topAdministrations.map((adm, idx) => (
              <div
                key={adm.name}
                className={`p-5 rounded-2xl border space-y-3 ${
                  idx === 0
                    ? 'bg-gradient-to-b from-[#172C4C] to-[#131F38] border-sky-400 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-400">
                    {idx === 0
                      ? '🥇 المركز الأول'
                      : idx === 1
                      ? '🥈 المركز الثاني'
                      : idx === 2
                      ? '🥉 المركز الثالث'
                      : `المركز #${idx + 1}`}
                  </span>
                  <span className="font-mono-num font-bold text-emerald-400">
                    {adm.compositePoints} نقطة إدارة
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white font-display">📍 {adm.name}</h4>
                <div className="text-xs text-sky-300">🗺️ {adm.subLabel}</div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">الطلاب</div>
                    <div className="font-mono-num font-bold text-white">{adm.participantsCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">المتأهلون</div>
                    <div className="font-mono-num font-bold text-emerald-400">{adm.qualifiedCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">المتوسط</div>
                    <div className="font-mono-num font-bold text-amber-400">{adm.avgScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DEDICATED SCHOOL PROFILE PAGE (#14: 🏫 صفحة المدرسة ونجوم المدرسة) */}
      {activeTab === 'school_profile' && activeSchoolSummary && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#162647] via-[#111C35] to-[#0B1120] border-2 border-amber-400/70 space-y-6 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs font-bold text-amber-400">
                  🏫 بطاقة وصفحة المدرسة الرسمية في مسابقة الجمهورية
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
                  🏫 {activeSchoolSummary.name}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-2">
                  <span>🗺️ المحافظة: <strong className="text-amber-300">{activeSchoolSummary.governorate}</strong></span>
                  <span>·</span>
                  <span>📍 الإدارة التعليمية: <strong className="text-sky-300">{activeSchoolSummary.administration}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={activeSchoolProfileName}
                  onChange={(e) => onSelectSchoolName(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-950 border border-amber-400/50 rounded-xl text-white font-bold"
                >
                  {rankings.topSchools.map((s) => (
                    <option key={s.name} value={s.name}>
                      🏫 {s.name} ({s.governorate})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4 School KPI Metrics (#14) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">👥 عدد المشاركين</div>
                <div className="text-2xl font-extrabold font-mono-num text-white mt-1">
                  {activeSchoolSummary.participantsCount}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">🏆 عدد المتأهلين</div>
                <div className="text-2xl font-extrabold font-mono-num text-emerald-400 mt-1">
                  {activeSchoolSummary.qualifiedCount}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div className="text-xs text-slate-400">⭐ أفضل نتيجة</div>
                <div className="text-2xl font-extrabold font-mono-num text-amber-400 mt-1">
                  {activeSchoolSummary.topScore} نقطة
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-amber-400/50 text-center">
                <div className="text-xs text-amber-300">🇪🇬 ترتيب المدرسة بالجمهورية</div>
                <div className="text-2xl font-extrabold font-mono-num text-amber-400 mt-1">
                  المركز #{activeSchoolRankIndex}
                </div>
              </div>
            </div>

            {/* ⭐ نجوم المدرسة (Stars of the School) */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-amber-400 font-display">
                ⭐ نجوم المدرسة — أفضل الطلاب المشاركين من «{activeSchoolSummary.name}»
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSchoolStudents.map((stu, idx) => {
                  const stg = stu.stage || resolveStageFromGrade(stu.grade);
                  return (
                    <div
                      key={stu.id}
                      className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-amber-400">
                            ⭐ نجم #{idx + 1} بالمدرسة
                          </span>
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-950"
                            style={{ backgroundColor: STAGE_METADATA[stg].badgeColor }}
                          >
                            {STAGE_METADATA[stg].shortLabel}
                          </span>
                        </div>
                        <div className="text-base font-bold text-white font-display">
                          {stu.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {GRADE_LABELS[stu.grade]} · الفصل: {stu.className}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stu.badges.slice(0, 3).map((b) => (
                            <span
                              key={b}
                              className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-amber-300"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="font-mono-num font-extrabold text-emerald-400 text-sm">
                          {stu.scores.total} نقطة
                        </span>
                        <button
                          onClick={() => onSelectStudentCard(stu)}
                          className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                        >
                          🪪 بطاقة الطالب
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BULK SCHOOL REGISTRATION (#22: 🏫 تسجيل مدرسة وإصدار كود مدرسة وأكواد طلاب) */}
      {activeTab === 'register_school' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-400">
                🏫 بوابة التسجيل الجماعي للمدارس من جميع محافظات مصر
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-0.5">
                تسجيل مدرسة وإصدار «كود مدرسة رسمي» وأكواد مشاركة للطلاب
              </h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!schName.trim()) return;
                soundEngine.playFanfare();
                const schoolCode = `SCH-${Math.floor(1000 + Math.random() * 8999)}`;
                const newSchool: RegisteredSchool = {
                  id: `reg-sch-${Date.now()}`,
                  schoolCode,
                  name: schName.trim(),
                  schoolType: schType,
                  governorate: schGov,
                  administration: schAdmin.trim() || `إدارة ${schGov} التعليمية`,
                  supervisorName: schSupervisor.trim() || 'منسق المدرسة',
                  stagesOffered: ['primary_lower', 'primary_upper', 'preparatory', 'secondary'],
                  registeredAt: new Date().toLocaleDateString('ar-EG'),
                };

                const validRows = bulkStudentsRows.filter((r) => r.name.trim().length > 0);
                const generatedStudents: StudentProfile[] = validRows.map((row, idx) => {
                  const stg = resolveStageFromGrade(row.grade);
                  const stuCode = `OM-${row.grade}${Math.floor(100 + Math.random() * 899)}`;
                  return {
                    id: `stu-bulk-${Date.now()}-${idx}`,
                    name: row.name.trim(),
                    grade: row.grade,
                    stage: stg,
                    className: row.className || `${row.grade} / أ`,
                    schoolName: newSchool.name,
                    schoolType: newSchool.schoolType,
                    schoolCode: newSchool.schoolCode,
                    administration: newSchool.administration,
                    governorate: newSchool.governorate,
                    region: newSchool.governorate,
                    country: 'مصر 🇪🇬',
                    participationCode: stuCode,
                    attemptsUsed: 0,
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
                    badges: ['🏅 أول مشاركة'],
                  };
                });

                onRegisterNewSchool(newSchool, generatedStudents);
                setCreatedSchoolCertificate({ school: newSchool, students: generatedStudents });
                setSchName('');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">🏫 اسم المدرسة *</label>
                  <input
                    required
                    type="text"
                    value={schName}
                    onChange={(e) => setSchName(e.target.value)}
                    placeholder="مثال: مدرسة الشهيد أحمد المنسي الرسمية للغات"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">🏷️ نوع المدرسة *</label>
                  <select
                    value={schType}
                    onChange={(e) => setSchType(e.target.value as SchoolType)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map((k) => (
                      <option key={k} value={k}>
                        {SCHOOL_TYPE_LABELS[k]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">🗺️ المحافظة *</label>
                  <select
                    value={schGov}
                    onChange={(e) => {
                      const g = e.target.value;
                      setSchGov(g);
                      const foundGov = EGYPT_27_GOVERNORATES.find((item) => item.name === g);
                      if (foundGov && foundGov.defaultAdministrations[0]) {
                        setSchAdmin(foundGov.defaultAdministrations[0]);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  >
                    {EGYPT_27_GOVERNORATES.map((g) => (
                      <option key={g.name} value={g.name}>
                        محافظة {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">📍 الإدارة التعليمية *</label>
                  <input
                    required
                    type="text"
                    value={schAdmin}
                    onChange={(e) => setSchAdmin(e.target.value)}
                    placeholder="مثال: إدارة شرق التعليمية"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">👩‍🏫 اسم المشرف المسؤول بالمدرسة *</label>
                  <input
                    required
                    type="text"
                    value={schSupervisor}
                    onChange={(e) => setSchSupervisor(e.target.value)}
                    placeholder="مثال: أ. محمد عبد السلام"
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Optional Bulk Student List */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400">
                    👨‍🎓 إضافة دفعة طلاب مشاركين باسم المدرسة (اختياري — يُصدر لكل طالب كود مشاركة فوري):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setBulkStudentsRows((prev) => [
                        ...prev,
                        { name: '', grade: '5', className: '5 / أ' },
                      ])
                    }
                    className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 font-bold text-[11px] cursor-pointer"
                  >
                    + سطر طالب آخر
                  </button>
                </div>

                {bulkStudentsRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                    <div className="sm:col-span-6">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => {
                          const next = [...bulkStudentsRows];
                          next[rIdx] = { ...next[rIdx], name: e.target.value };
                          setBulkStudentsRows(next);
                        }}
                        placeholder={`اسم الطالب رقم ${rIdx + 1}...`}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <select
                        value={row.grade}
                        onChange={(e) => {
                          const next = [...bulkStudentsRows];
                          next[rIdx] = {
                            ...next[rIdx],
                            grade: e.target.value as GradeNumber,
                          };
                          setBulkStudentsRows(next);
                        }}
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      >
                        {(Object.keys(GRADE_LABELS) as GradeNumber[]).map((gKey) => (
                          <option key={gKey} value={gKey}>
                            {GRADE_LABELS[gKey]} ({STAGE_METADATA[resolveStageFromGrade(gKey)].shortLabel})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={row.className}
                        onChange={(e) => {
                          const next = [...bulkStudentsRows];
                          next[rIdx] = { ...next[rIdx], className: e.target.value };
                          setBulkStudentsRows(next);
                        }}
                        placeholder="الفصل"
                        className="w-full px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-sm hover:bg-amber-300 cursor-pointer"
              >
                🏫 اعتماد تسجيل المدرسة وإصدار كود المدرسة وأكواد الطلاب
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {createdSchoolCertificate && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-[#131F38] border-2 border-emerald-400 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-300">
                    ✓ تم تسجيل المدرسة بنجاح!
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-slate-950 border border-amber-400 font-mono-num text-amber-400 font-bold text-xs">
                    كود المدرسة: {createdSchoolCertificate.school.schoolCode}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white font-display">
                  🏫 {createdSchoolCertificate.school.name}
                </h4>
                <div className="text-xs text-slate-300">
                  📍 {createdSchoolCertificate.school.administration} · 🗺️ محافظة{' '}
                  {createdSchoolCertificate.school.governorate} · المنسق:{' '}
                  {createdSchoolCertificate.school.supervisorName}
                </div>
                {createdSchoolCertificate.students.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800">
                    <div className="text-xs font-bold text-amber-300">
                      🎫 أكواد المشاركة الصادرة لطلاب المدرسة ({createdSchoolCertificate.students.length}):
                    </div>
                    {createdSchoolCertificate.students.map((st) => (
                      <div
                        key={st.id}
                        className="p-2 rounded-lg bg-slate-950 flex items-center justify-between text-xs"
                      >
                        <span className="text-white font-bold">{st.name}</span>
                        <span className="font-mono-num text-emerald-400 font-bold">
                          {st.participationCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 space-y-3">
              <h4 className="text-base font-bold text-white font-display">
                📋 المدارس المسجلة رسمياً في المنصة ({registeredSchools.length})
              </h4>
              <div className="space-y-2 max-h-[380px] overflow-y-auto">
                {registeredSchools.map((rs) => (
                  <div
                    key={rs.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">{rs.name}</div>
                      <div className="text-[11px] text-slate-400">
                        📍 {rs.administration} · 🗺️ {rs.governorate} · {SCHOOL_TYPE_LABELS[rs.schoolType]}
                      </div>
                    </div>
                    <span className="font-mono-num text-amber-400 font-bold">
                      {rs.schoolCode}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ============================================================================
// 3. 🗺️ INTERACTIVE MAP OF EGYPT'S 27 GOVERNORATES (#12: خريطة عباقرة مصر)
// ============================================================================

interface EgyptGovernoratesMapViewProps {
  students: StudentProfile[];
  settings: CompetitionSettings;
  onInspectSchool: (schoolName: string) => void;
  onSelectStudentCard: (student: StudentProfile) => void;
}

export const EgyptGovernoratesMapView: React.FC<EgyptGovernoratesMapViewProps> = ({
  students,
  settings,
  onInspectSchool,
  onSelectStudentCard,
}) => {
  const [selectedGovName, setSelectedGovName] = useState<string>('الإسكندرية');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');

  const rankings = useMemo(
    () => computeAggregatedRankings(students, settings.schoolScoringFormula),
    [students, settings.schoolScoringFormula]
  );

  // Build stats for all 27 Egyptian governorates
  const all27GovernoratesStats = useMemo(() => {
    return EGYPT_27_GOVERNORATES.map((govMeta) => {
      const govStudents = students.filter(
        (s) => (s.governorate || s.region) === govMeta.name
      );
      const summary = rankings.topGovernorates.find((g) => g.name === govMeta.name);
      const uniqueSchools = Array.from(
        new Set(govStudents.map((s) => s.schoolName || 'مدرسة'))
      );
      const sortedStudents = [...govStudents].sort(
        (a, b) => b.scores.total - a.scores.total
      );
      const topStudent = sortedStudents[0];

      return {
        name: govMeta.name,
        regionGroup: govMeta.regionGroup,
        defaultAdministrations: govMeta.defaultAdministrations,
        participantsCount: govStudents.length,
        schoolsCount: uniqueSchools.length,
        qualifiedCount: govStudents.filter((s) => s.qualifiedForFinals).length,
        topScore: topStudent?.scores.total || 0,
        topStudent,
        topSchoolName: topStudent?.schoolName || uniqueSchools[0] || 'متاح للتسجيل',
        governoratePoints: summary?.compositePoints || govStudents.length * 120,
        studentsList: sortedStudents,
      };
    });
  }, [students, rankings]);

  const activeGovStat =
    all27GovernoratesStats.find((g) => g.name === selectedGovName) ||
    all27GovernoratesStats[0];

  const filteredGovCards =
    regionFilter === 'ALL'
      ? all27GovernoratesStats
      : all27GovernoratesStats.filter((g) => g.regionGroup === regionFilter);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold text-amber-400">
            🗺️ خريطة عباقرة مصر التفاعلية · تغطية جميع محافظات الجمهورية الـ٢٧
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
            اختر أي محافظة مصرية لاستعراض مدارسها، إداراتها، وأبطالها المتأهلين
          </h2>
        </div>

        {/* Region Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'ALL', label: '🇪🇬 كل المحافظات (27)' },
              { id: 'القاهرة الكبرى', label: 'القاهرة الكبرى' },
              { id: 'الإسكندرية والساحل', label: 'الإسكندرية والساحل' },
              { id: 'الدلتا', label: 'محافظات الدلتا' },
              { id: 'مدن القناة وسيناء', label: 'القناة وسيناء' },
              { id: 'صعيد مصر والوادي', label: 'صعيد مصر والوادي' },
            ] as const
          ).map((rg) => (
            <button
              key={rg.id}
              onClick={() => setRegionFilter(rg.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                regionFilter === rg.id
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {rg.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Right 7 Cols: Interactive Grid Map of the 27 Egyptian Governorates */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#131F38] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-display">
              🗺️ لوحة محافظات جمهورية مصر العربية (اضغط على المحافظة)
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              الأخضر = محافظات بها مشاركون حالياً
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
            {filteredGovCards.map((gov) => {
              const isSelected = gov.name === selectedGovName;
              const hasActiveParticipants = gov.participantsCount > 0;
              return (
                <button
                  key={gov.name}
                  type="button"
                  onClick={() => {
                    soundEngine.playSelectTile();
                    setSelectedGovName(gov.name);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-2 border-white shadow-xl scale-[1.03]'
                      : hasActiveParticipants
                      ? 'bg-emerald-950/35 border-emerald-500/50 text-white hover:border-amber-400'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold">📍 {gov.name}</span>
                    {hasActiveParticipants && (
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono-num text-[10px] font-extrabold ${
                          isSelected
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {gov.participantsCount} طلاب
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-[10px] ${
                      isSelected ? 'text-slate-800 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {hasActiveParticipants
                      ? `${gov.schoolsCount} مدارس · ${gov.governoratePoints} نقطة`
                      : gov.regionGroup}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right/Left 5 Cols: Selected Governorate Detailed Inspector (#12) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#17284A] via-[#131F38] to-[#0B1120] border-2 border-amber-400/70 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-bold text-amber-400">
                📍 بطاقة إحصائيات المحافظة المختارة
              </span>
              <h3 className="text-2xl font-bold text-white font-display mt-0.5">
                محافظة {activeGovStat.name}
              </h3>
              <span className="text-xs text-slate-400">{activeGovStat.regionGroup}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950 border border-amber-400/50 text-center">
              <div className="text-[10px] text-slate-400">نقاط المحافظة</div>
              <div className="text-xl font-extrabold font-mono-num text-amber-400">
                {activeGovStat.governoratePoints}
              </div>
            </div>
          </div>

          {/* 6 Governorate Metrics requested in #12 */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">👥 عدد المشاركين</div>
              <div className="text-xl font-extrabold font-mono-num text-white mt-0.5">
                {activeGovStat.participantsCount}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">🏫 عدد المدارس</div>
              <div className="text-xl font-extrabold font-mono-num text-amber-400 mt-0.5">
                {activeGovStat.schoolsCount}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">🏆 عدد المتأهلين</div>
              <div className="text-xl font-extrabold font-mono-num text-emerald-400 mt-0.5">
                {activeGovStat.qualifiedCount}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-slate-400">⭐ أعلى نتيجة</div>
              <div className="text-xl font-extrabold font-mono-num text-sky-400 mt-0.5">
                {activeGovStat.topScore} نقطة
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">🏫 أفضل مدرسة بالمحافظة:</span>
              <button
                type="button"
                onClick={() =>
                  activeGovStat.topSchoolName &&
                  activeGovStat.participantsCount > 0 &&
                  onInspectSchool(activeGovStat.topSchoolName)
                }
                className="font-bold text-emerald-300 hover:underline cursor-pointer"
              >
                {activeGovStat.topSchoolName}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">👑 أفضل طالب بالمحافظة:</span>
              {activeGovStat.topStudent ? (
                <button
                  type="button"
                  onClick={() => onSelectStudentCard(activeGovStat.topStudent!)}
                  className="font-bold text-amber-300 hover:underline cursor-pointer"
                >
                  {activeGovStat.topStudent.name} ({activeGovStat.topStudent.scores.total} نقطة)
                </button>
              ) : (
                <span className="text-slate-500">باب التسجيل مفتوح لطلاب المحافظة</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-300">
              📍 أبرز الإدارات التعليمية في محافظة {activeGovStat.name}:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeGovStat.defaultAdministrations.map((adm) => (
                <span
                  key={adm}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-sky-300"
                >
                  {adm}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// 4. 📜 DIGITAL CERTIFICATES VIEW (#25), 🏛️ SEASONS ARCHIVE (#23), 🛡️ PRIVACY (#31)
// & UNIFIED NATIONAL PLATFORM HUB EXPORT
// ============================================================================

export interface NationalPlatformHubProps {
  mode:
    | 'annual_roadmap'
    | 'national_rankings'
    | 'schools_hub'
    | 'egypt_map'
    | 'seasons_archive'
    | 'certificates'
    | 'about_privacy';
  students: StudentProfile[];
  settings: CompetitionSettings;
  onUpdateSettings?: React.Dispatch<React.SetStateAction<CompetitionSettings>>;
  registeredSchools: RegisteredSchool[];
  onRegisterSchool: (newSchool: RegisteredSchool) => void;
  seasonsArchive: SeasonArchiveItem[];
  activeStudent: StudentProfile | null;
  onSelectStudent: (s: StudentProfile) => void;
  onNavigate: (view: AppView) => void;
}

export const NationalPlatformHub: React.FC<NationalPlatformHubProps> = ({
  mode,
  students,
  settings,
  onUpdateSettings,
  registeredSchools,
  onRegisterSchool,
  seasonsArchive,
  activeStudent,
  onSelectStudent,
  onNavigate,
}) => {
  const [inspectedSchoolName, setInspectedSchoolName] = useState<string | null>(null);
  const [certType, setCertType] = useState<
    'participation' | 'excellence' | 'school_champion' | 'governorate_champion' | 'republic_genius'
  >('republic_genius');
  const [selectedQuarterFilter, setSelectedQuarterFilter] = useState<
    'ALL' | 'الخريف' | 'الشتاء' | 'الربيع' | 'الصيف'
  >('ALL');
  const [inspectedPhaseId, setInspectedPhaseId] = useState<AnnualPhaseId>(
    settings.activeAnnualPhaseId || 'phase_2_administration'
  );

  const selectedCertStudent = activeStudent || students[0];
  const annualPhases: AnnualQualificationPhase[] =
    settings.annualPhases && settings.annualPhases.length > 0
      ? settings.annualPhases
      : DEFAULT_ANNUAL_PHASES;
  const currentActivePhaseId: AnnualPhaseId =
    settings.activeAnnualPhaseId || 'phase_2_administration';
  const inspectedPhase =
    annualPhases.find((p) => p.id === inspectedPhaseId) || annualPhases[1] || annualPhases[0];

  const handleActivatePhase = (phaseId: AnnualPhaseId) => {
    if (!onUpdateSettings) return;
    soundEngine.playFanfare();
    const targetPhase = annualPhases.find((p) => p.id === phaseId);
    const targetOrder = targetPhase?.order || 2;
    const updatedPhases = annualPhases.map((p) => ({
      ...p,
      status: (p.order < targetOrder
        ? 'completed'
        : p.order === targetOrder
        ? 'active'
        : 'upcoming') as 'completed' | 'active' | 'upcoming',
    }));
    onUpdateSettings((prev) => ({
      ...prev,
      activeAnnualPhaseId: phaseId,
      currentHierarchyLevel: targetPhase?.targetLevel || prev.currentHierarchyLevel,
      questionsCountPerExam: targetPhase?.questionsCount || prev.questionsCountPerExam,
      qualifierDurationMinutes: targetPhase?.durationMinutes || prev.qualifierDurationMinutes,
      annualPhases: updatedPhases,
    }));
    setInspectedPhaseId(phaseId);
  };

  if (mode === 'annual_roadmap') {
    const filteredMonths =
      selectedQuarterFilter === 'ALL'
        ? MONTHLY_GENIUS_CHALLENGES_12
        : MONTHLY_GENIUS_CHALLENGES_12.filter((m) => m.seasonQuarter === selectedQuarterFilter);

    return (
      <section className="space-y-8">
        {/* Top Hero Banner for Year-Round Multi-Stage Qualifiers */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/70 space-y-5 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
                  📅 نظام المسابقة الممتدة على مدار السنة (12 شهراً · 6 مراحل تصفيات)
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold">
                  المرحلة النشطة حالياً: {
                    (annualPhases.find((p) => p.id === currentActivePhaseId) || annualPhases[1])
                      .shortTitle
                  }
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                خريطة المراحل والتصفيات السنوية لمسابقة «عباقرة عيون مصر»
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                تستمر المسابقة طوال العام عبر <strong>٦ مراحل تصفيات متدرجة</strong> تبدأ من تصفيات المدارس في الخريف، مروراً بتصفيات الإدارات التعليمية والتحدي الشتوي، ثم تصفيات المحافظات الـ٢٧ في الربيع، وصولاً إلى الأدوار الإقصائية والنهائيات الكبرى للجمهورية في الصيف!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  onNavigate('qualifiers');
                }}
                className="px-5 py-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs hover:bg-amber-300 cursor-pointer shadow-lg"
              >
                🚀 دخول اختبار المرحلة الحالية الآن
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  onNavigate('national_rankings');
                }}
                className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs cursor-pointer"
              >
                🇪🇬 الترتيب العام المتأهلين
              </button>
            </div>
          </div>

          {/* 6-Phase Visual Timeline Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {annualPhases.map((phase) => {
              const isCurrentActive = phase.id === currentActivePhaseId;
              const isInspected = phase.id === inspectedPhaseId;
              return (
                <div
                  key={phase.id}
                  onClick={() => {
                    soundEngine.playSelectTile();
                    setInspectedPhaseId(phase.id);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isInspected
                      ? 'bg-[#17284A] border-2 border-amber-400 shadow-xl scale-[1.02]'
                      : isCurrentActive
                      ? 'bg-emerald-950/35 border-emerald-400/60'
                      : phase.status === 'completed'
                      ? 'bg-slate-900/90 border-emerald-500/30'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-mono-num font-bold text-amber-400">
                        🗓️ {phase.monthsLabel}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          phase.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : phase.status === 'active'
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {phase.status === 'completed'
                          ? '✓ مكتملة'
                          : phase.status === 'active'
                          ? '🟢 جارية الآن'
                          : '⏳ قادمة'}
                      </span>
                    </div>
                    <div className="text-2xl mb-1">{phase.icon}</div>
                    <h3 className="text-sm font-extrabold text-white font-display leading-snug">
                      {phase.shortTitle}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {phase.AdvancementQuotaLabel}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-sky-300 font-mono-num">
                      {phase.questionsCount} سؤال · {phase.durationMinutes} د
                    </span>
                    <span className="text-amber-300 font-bold">التفاصيل ←</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Inspector for Selected Annual Phase + Supervisor Phase Switcher */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 p-6 rounded-3xl bg-[#131F38] border-2 border-amber-400/50 space-y-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-amber-400/50 flex items-center justify-center text-3xl">
                  {inspectedPhase.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-amber-400">
                      🗓️ الفترة الزمنية: {inspectedPhase.monthsLabel}
                    </span>
                    <span>·</span>
                    <span className="font-mono-num text-slate-400">
                      ({inspectedPhase.startDate} إلى {inspectedPhase.endDate})
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">
                    {inspectedPhase.title}
                  </h3>
                </div>
              </div>

              {onUpdateSettings && (
                <button
                  type="button"
                  onClick={() => handleActivatePhase(inspectedPhase.id)}
                  disabled={inspectedPhase.id === currentActivePhaseId}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${
                    inspectedPhase.id === currentActivePhaseId
                      ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-300 cursor-default'
                      : 'bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-lg'
                  }`}
                >
                  {inspectedPhase.id === currentActivePhaseId
                    ? '✓ هذه هي المرحلة المفعّلة حالياً'
                    : '🚀 تفعيل هذه المرحلة الآن (للمشرفة)'}
                </button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {inspectedPhase.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 space-y-1.5">
              <div className="text-xs font-extrabold text-emerald-400">
                ⚖️ قاعدة التأهل والتصعيد التلقائي في هذه المرحلة:
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {inspectedPhase.qualificationRule}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">عدد الأسئلة</div>
                <div className="text-lg font-extrabold font-mono-num text-amber-400 mt-0.5">
                  {inspectedPhase.questionsCount} سؤالاً
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">زمن الاختبار</div>
                <div className="text-lg font-extrabold font-mono-num text-sky-400 mt-0.5">
                  {inspectedPhase.durationMinutes} دقيقة
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">مستوى التنافس</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-1">
                  {inspectedPhase.targetLevel === 'school'
                    ? '🏫 داخل المدرسة'
                    : inspectedPhase.targetLevel === 'administration'
                    ? '🏛️ الإدارة التعليمية'
                    : inspectedPhase.targetLevel === 'governorate'
                    ? '🗺️ المحافظة (27)'
                    : '🇪🇬 الجمهورية'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-slate-400">المراحل المشاركة</div>
                <div className="text-sm font-extrabold text-purple-300 mt-1">
                  ٤ مراحل منفصلة
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400">
                * الأسئلة والتوقيت والترتيب منفصل لكل مرحلة تعليمية (ابتدائي صغير ≠ كبير ≠ إعدادي ≠ ثانوي).
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('practice')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-amber-300 hover:bg-slate-700 font-bold text-xs cursor-pointer"
                >
                  🧠 تدريب تمهيدي (١٠ أسئلة)
                </button>
                <button
                  onClick={() => onNavigate('qualifiers')}
                  className="px-5 py-2 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-extrabold text-xs cursor-pointer"
                >
                  📝 دخول تصفية المرحلة ←
                </button>
              </div>
            </div>
          </div>

          {/* Student Year-Round Progression Tracker across the 6 Phases */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#162647] via-[#111C35] to-[#0B1120] border border-amber-400/50 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-bold text-amber-400">
                  👨‍🎓 متتبع مسار الطالب عبر تصفيات السنة الـ٦
                </span>
                <h3 className="text-lg font-bold text-white font-display mt-0.5">
                  سجل التأهل التراكمي على مدار العام
                </h3>
              </div>
              {selectedCertStudent && (
                <select
                  value={selectedCertStudent.id}
                  onChange={(e) => {
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) onSelectStudent(found);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-bold max-w-[180px]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.governorate})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedCertStudent && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">{selectedCertStudent.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      🏫 {selectedCertStudent.schoolName} · 🗺️ {selectedCertStudent.governorate}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-slate-400">النقاط السنوية</div>
                    <div className="text-lg font-extrabold font-mono-num text-amber-400">
                      {selectedCertStudent.scores.total} نقطة
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {annualPhases.map((ph, idx) => {
                    const activeOrder =
                      annualPhases.find((p) => p.id === currentActivePhaseId)?.order || 2;
                    const isPassed = ph.order < activeOrder && selectedCertStudent.completedQualifier;
                    const isCurrent = ph.order === activeOrder;
                    const phaseScore =
                      selectedCertStudent.annualPhaseScores?.[ph.id] ||
                      (isPassed
                        ? Math.max(350, selectedCertStudent.scores.total - (2 - idx) * 15)
                        : isCurrent && selectedCertStudent.completedQualifier
                        ? selectedCertStudent.scores.total
                        : null);

                    return (
                      <div
                        key={ph.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          isCurrent
                            ? 'bg-amber-400/15 border-amber-400 text-white'
                            : isPassed
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{ph.icon}</span>
                          <div>
                            <div className="font-bold text-white">{ph.shortTitle}</div>
                            <div className="text-[10px] text-slate-400">{ph.monthsLabel}</div>
                          </div>
                        </div>

                        <div className="text-left">
                          {phaseScore !== null ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono-num font-bold text-[11px]">
                              ✓ {phaseScore} نقطة (متأهل)
                            </span>
                          ) : isCurrent ? (
                            <button
                              onClick={() => onNavigate('qualifiers')}
                              className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[11px] cursor-pointer"
                            >
                              خُض التصفية الآن ←
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-500">تفتح في {ph.monthsLabel}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 12-Month Genius Sprints Calendar across the 4 Seasons of the Year */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#131F38] border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs font-extrabold text-amber-400">
                🗓️ أجندة التحديات الشهرية المستمرة (12 شهراً — الخريف · الشتاء · الربيع · الصيف)
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-display mt-0.5">
                تحديات وتصفيات كل شهر على مدار السنة الكاملة
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(['ALL', 'الخريف', 'الشتاء', 'الربيع', 'الصيف'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuarterFilter(q)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    selectedQuarterFilter === q
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {q === 'ALL' ? '🗓️ كل شهور السنة (12)' : `فصل ${q}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMonths.map((mItem) => {
              const linkedPhase = annualPhases.find((p) => p.id === mItem.linkedPhaseId);
              return (
                <div
                  key={mItem.monthNumber}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                    mItem.status === 'live'
                      ? 'bg-gradient-to-b from-[#17284A] to-[#111C35] border-2 border-amber-400 shadow-lg'
                      : mItem.status === 'completed'
                      ? 'bg-slate-900/90 border-emerald-500/35'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-400">
                        شهر {mItem.monthNumber} · {mItem.monthName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          mItem.status === 'live'
                            ? 'bg-amber-400 text-slate-950'
                            : mItem.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {mItem.status === 'live'
                          ? '🔥 نشط هذا الشهر'
                          : mItem.status === 'completed'
                          ? '✓ مكتمل'
                          : `فصل ${mItem.seasonQuarter}`}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-display leading-snug">
                      {mItem.title}
                    </h4>
                    <div className="text-[11px] text-sky-300">
                      🎯 التركيز: {mItem.focusDomain}
                    </div>
                    {linkedPhase && (
                      <div className="text-[10px] text-slate-400">
                        ضمن: {linkedPhase.shortTitle}
                      </div>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono-num font-bold text-emerald-400">
                      +{mItem.bonusPoints} نقطة بونص
                    </span>
                    <button
                      onClick={() =>
                        onNavigate(mItem.status === 'live' ? 'qualifiers' : 'practice')
                      }
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      {mItem.status === 'live' ? 'دخول التصفية ←' : 'تدريب الشهر ←'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  if (mode === 'national_rankings') {
    return (
      <NationalRankingsView
        students={students}
        settings={settings}
        onSelectStudentCard={(stu) => {
          onSelectStudent(stu);
          onNavigate('genius_card');
        }}
        onInspectSchool={(schoolName) => {
          setInspectedSchoolName(schoolName);
          onNavigate('schools_hub');
        }}
        onNavigateView={onNavigate}
      />
    );
  }

  if (mode === 'schools_hub') {
    return (
      <SchoolsHubView
        students={students}
        registeredSchools={registeredSchools}
        settings={settings}
        inspectedSchoolName={inspectedSchoolName}
        onSelectSchoolName={(name) => setInspectedSchoolName(name)}
        onRegisterNewSchool={(newSchool) => {
          onRegisterSchool(newSchool);
        }}
        onSelectStudentCard={(stu) => {
          onSelectStudent(stu);
          onNavigate('genius_card');
        }}
      />
    );
  }

  if (mode === 'egypt_map') {
    return (
      <EgyptGovernoratesMapView
        students={students}
        settings={settings}
        onInspectSchool={(schoolName) => {
          setInspectedSchoolName(schoolName);
          onNavigate('schools_hub');
        }}
        onSelectStudentCard={(stu) => {
          onSelectStudent(stu);
          onNavigate('genius_card');
        }}
      />
    );
  }

  if (mode === 'certificates' && selectedCertStudent) {
    const stg = selectedCertStudent.stage || resolveStageFromGrade(selectedCertStudent.grade);
    const certMetaMap = {
      participation: {
        title: '📜 شهادة مشاركة وطنية معتمدة',
        badge: '🏅 وسام المشاركة المشرفة في مسابقة عباقرة عيون مصر',
        subtitle: 'تقديراً للمشاركة الفعالة والتميز المعرفي في تصفيات الجمهورية',
      },
      excellence: {
        title: '🌟 شهادة تفوق وتميز علمي',
        badge: '⭐ وسام التفوق والسرعة الذهنية',
        subtitle: 'لتحقيق درجات متميزة في مجالات الذكاء والتفكير المنطقي والعلوم',
      },
      school_champion: {
        title: '🏫 شهادة بطل المدرسة الأول',
        badge: '🥇 وسام المركز الأول على مستوى المدرسة',
        subtitle: `لتصدر ترتيب طلاب ${selectedCertStudent.schoolName || 'المدرسة'} بجدارة`,
      },
      governorate_champion: {
        title: '🗺️ شهادة بطل المحافظة',
        badge: `👑 وسام عبقري محافظة ${selectedCertStudent.governorate || 'القاهرة'}`,
        subtitle: `لتصدر التصفيات على مستوى محافظة ${selectedCertStudent.governorate || 'القاهرة'}`,
      },
      republic_genius: {
        title: '🇪🇬 شهادة عبقري الجمهورية',
        badge: '🏆 الوسام الذهبي الأعلى — عبقري الجمهورية في عيون مصر',
        subtitle: 'لتحقيق صدارة الجمهورية في مسابقة عباقرة عيون مصر للمعرفة والذكاء والتفكير',
      },
    };
    const currentCert = certMetaMap[certType];

    return (
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 rounded-3xl bg-[#131F38] border border-amber-400/50 flex flex-wrap items-center justify-between gap-4 no-print">
          <div>
            <span className="text-xs font-bold text-amber-400">
              📜 مركز إصدار الشهادات الرقمية المعتمدة (#25)
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-0.5">
              إصدار وطباعة شهادات مسابقة «عباقرة عيون مصر»
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCertStudent.id}
              onChange={(e) => {
                const found = students.find((s) => s.id === e.target.value);
                if (found) onSelectStudent(found);
              }}
              className="px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.schoolName} ({s.governorate})
                </option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة الشهادة الرقمية</span>
            </button>
          </div>
        </div>

        {/* 5 Certificate Types Selector */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {(
            [
              { id: 'participation', label: '📜 شهادة مشاركة' },
              { id: 'excellence', label: '🌟 شهادة تفوق' },
              { id: 'school_champion', label: '🏫 شهادة بطل المدرسة' },
              { id: 'governorate_champion', label: '🗺️ شهادة بطل المحافظة' },
              { id: 'republic_genius', label: '🇪🇬 شهادة عبقري الجمهورية' },
            ] as const
          ).map((ct) => (
            <button
              key={ct.id}
              onClick={() => {
                soundEngine.playSelectTile();
                setCertType(ct.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                certType === ct.id
                  ? 'bg-amber-400 text-slate-950 shadow-lg'
                  : 'bg-[#131F38] border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {ct.label}
            </button>
          ))}
        </div>

        {/* Printable Luxury Certificate */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-[#17284A] via-[#111C35] to-[#090F1D] border-4 border-double border-amber-400 text-center space-y-6 shadow-2xl">
          <div className="flex items-center justify-between text-xs text-amber-300/90 border-b border-amber-400/20 pb-4">
            <span>🇪🇬 جمهورية مصر العربية · مسابقة عباقرة عيون مصر الوطنية</span>
            <span className="font-mono-num">كود التوثيق: {selectedCertStudent.participationCode}-2026</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-extrabold text-amber-400">{currentCert.badge}</div>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              {currentCert.title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">{currentCert.subtitle}</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-950/90 border border-amber-400/40 max-w-2xl mx-auto space-y-3">
            <div className="text-xs text-slate-400">تشهد إدارة مسابقة «عباقرة عيون مصر» بمنح هذه الشهادة إلى الطالب/ـة:</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-display">
              {selectedCertStudent.name}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-emerald-300 font-bold pt-1">
              <span>🎓 {STAGE_METADATA[stg].label} ({GRADE_LABELS[selectedCertStudent.grade]})</span>
              <span>·</span>
              <span>🏫 {selectedCertStudent.schoolName || 'مدرسة عيون مصر'}</span>
              <span>·</span>
              <span>🏛️ {selectedCertStudent.administration || 'إدارة تعليمية'}</span>
              <span>·</span>
              <span>🗺️ محافظة {selectedCertStudent.governorate || 'القاهرة'}</span>
            </div>
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-center gap-6 text-xs">
              <span>
                الدرجة الكلية: <strong className="font-mono-num text-amber-400">{selectedCertStudent.scores.total} نقطة</strong>
              </span>
              <span>
                ترتيب المدرسة: <strong className="font-mono-num text-emerald-400">#{selectedCertStudent.schoolRank || 1}</strong>
              </span>
              <span>
                ترتيب المحافظة: <strong className="font-mono-num text-sky-400">#{selectedCertStudent.governorateRank || 1}</strong>
              </span>
              <span>
                ترتيب الجمهورية: <strong className="font-mono-num text-amber-300">#{selectedCertStudent.republicRank || 1}</strong>
              </span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-around text-xs text-slate-300">
            <div>
              <div className="font-bold text-amber-400">المشرفة العامة على المسابقة</div>
              <div className="mt-1 text-slate-400">اعتماد إلكتروني رسمي ✓</div>
            </div>
            <div>
              <div className="font-bold text-amber-400">ختم منصة عباقرة عيون مصر</div>
              <div className="mt-1 font-mono-num text-slate-400">OYOUN MISR 2026</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (mode === 'seasons_archive') {
    return (
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 space-y-2">
          <span className="text-xs font-extrabold text-amber-400">
            🏛️ سجل المواسم الوطنية وأرشيف الأبطال (#23)
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            مواسم مسابقة «عباقرة عيون مصر» عبر السنوات
          </h2>
          <p className="text-xs text-slate-300">
            توثيق رسمي للمواسم الحالية والقادمة وأبطال كل مرحلة وأفضل المدارس والمحافظات.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {seasonsArchive.map((season) => (
            <div
              key={season.id}
              className={`p-6 rounded-3xl border space-y-4 ${
                season.status === 'active'
                  ? 'bg-[#131F38] border-2 border-amber-400 shadow-xl'
                  : 'bg-[#111C35]/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono-num text-xs font-bold text-amber-400">
                  موسم {season.year}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    season.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : season.status === 'upcoming'
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {season.status === 'active'
                    ? '🟢 الموسم الجاري حالياً'
                    : season.status === 'upcoming'
                    ? '⏳ موسم قادم'
                    : '✓ موسم مكتمل'}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white font-display">{season.title}</h3>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs">
                <div>
                  <div className="text-slate-400">الطلاب</div>
                  <div className="font-mono-num font-bold text-white text-base">
                    {season.totalStudents}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">المدارس</div>
                  <div className="font-mono-num font-bold text-amber-400 text-base">
                    {season.totalSchools}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">المحافظات</div>
                  <div className="font-mono-num font-bold text-emerald-400 text-base">
                    {season.totalGovernorates} / 27
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div>
                  🏆 <strong className="text-amber-300">بطل الجمهورية:</strong> {season.championStudentName}
                </div>
                <div>
                  🏫 <strong className="text-emerald-300">أفضل مدرسة:</strong> {season.championSchoolName}
                </div>
                <div>
                  🗺️ <strong className="text-sky-300">أفضل محافظة:</strong> {season.championGovernorate}
                </div>
                <p className="text-slate-400 pt-1">{season.highlights}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // mode === 'about_privacy' (#1, #19, #20, #31)
  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 sm:p-8 rounded-3xl bg-[#131F38] border-2 border-amber-400/60 space-y-5">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold">
          <ShieldCheck className="w-5 h-5" />
          <span>🛡️ هوية المسابقة الوطنية · العدالة · حماية خصوصية الأطفال (#31)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
          عن مسابقة «عباقرة عيون مصر» — مسابقة الجمهورية للمعرفة والذكاء والتفكير
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          «عيون مصر» هي اسم وهوية المسابقة الوطنية التفاعلية المفتوحة لجميع طلاب المدارس الحكومية والرسمية للغات والخاصة والأزهرية والدولية في جميع محافظات جمهورية مصر العربية الـ٢٧، وليست مقتصرة على مدرسة واحدة.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-emerald-400">
              ⚖️ عدالة المنافسة وفصل المراحل (#6 و #20)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              لا يُقارن طالب الصف الثاني الابتدائي بطالب المرحلة الثانوية! لكل مرحلة تعليمية (ابتدائي صغير، ابتدائي كبير، إعدادي، ثانوي) بنك أسئلة مستقل، وزمن مناسب، وترتيب مستقل تماماً.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-amber-400">
              🔒 حماية خصوصية الطلاب والأطفال (#31)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              لا يجمع الموقع أي بيانات حساسة غير ضرورية (لا يطلب الرقم القومي أو عنوان المنزل أو صور المستندات). ويمكن للمشرفة تفعيل وضع الخصوصية لعرض الأسماء المختصرة (مثل: أحمد م.) في اللوحات العامة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

