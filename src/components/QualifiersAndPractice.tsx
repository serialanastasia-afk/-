import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  QualifierQuestion,
  StudentProfile,
  GradeNumber,
  CompetitionSettings,
  QualifierDomain,
  EducationalStage,
  SchoolType,
} from '../types/competition';
import {
  DOMAIN_META,
  ALL_STAGE_QUALIFIER_QUESTIONS,
  getPracticeQuestionsForStage,
} from '../data/qualifierQuestions';
import { DEFAULT_ANNUAL_PHASES } from '../data/challengesData';
import {
  STAGE_METADATA,
  GRADE_LABELS,
  EGYPT_27_GOVERNORATES,
  SCHOOL_TYPE_LABELS,
  resolveStageFromGrade,
  buildStudentGroupingPath,
  generateBalancedStudentExam,
  gradeStudentExamAutomatically,
} from '../services/qualificationEngine';
import { soundEngine } from '../utils/sound';

interface QualifiersAndPracticeProps {
  mode: 'qualifier' | 'practice';
  settings: CompetitionSettings;
  students: StudentProfile[];
  onRegisterStudent: (student: StudentProfile) => void;
  onCompleteQualifier: (studentId: string, updatedStudent: StudentProfile) => void;
  onNavigateView: (view: 'home' | 'journey' | 'genius_card' | 'games_hub') => void;
  activeStudent: StudentProfile | null;
  setActiveStudent: (s: StudentProfile | null) => void;
  customQuestions: QualifierQuestion[];
}

export const QualifiersAndPractice: React.FC<QualifiersAndPracticeProps> = ({
  mode,
  settings,
  students,
  onRegisterStudent,
  onCompleteQualifier,
  onNavigateView,
  activeStudent,
  setActiveStudent,
  customQuestions,
}) => {
  // Registration state
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState<GradeNumber>('5');
  const [className, setClassName] = useState('5 / أ');
  const [governorate, setGovernorate] = useState(settings.defaultRegion || 'القاهرة');
  const [administration, setAdministration] = useState(
    settings.defaultAdministration || 'إدارة المعادي التعليمية'
  );
  const [schoolName, setSchoolName] = useState(
    settings.defaultSchoolName || ''
  );
  const [schoolType, setSchoolType] = useState<SchoolType>('official_languages');
  const [country, setCountry] = useState(settings.defaultCountry || 'مصر 🇪🇬');
  const [codeInput, setCodeInput] = useState('');
  const [generatedTicketCode, setGeneratedTicketCode] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [practiceStage, setPracticeStage] = useState<EducationalStage>('primary_upper');

  // Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<QualifierDomain | 'ALL'>('ALL');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(
    mode === 'qualifier' ? settings.qualifierDurationMinutes * 60 : 10 * 60
  );
  const [startTimeMs, setStartTimeMs] = useState<number>(0);
  const [entryTimeStr, setEntryTimeStr] = useState<string>('');
  const [timeoutTriggered, setTimeoutTriggered] = useState<boolean>(false);

  // Practice immediate feedback
  const [practiceFeedbackIdx, setPracticeFeedbackIdx] = useState<number | null>(null);

  const rawPool: QualifierQuestion[] = [...customQuestions, ...ALL_STAGE_QUALIFIER_QUESTIONS];

  const baseList: QualifierQuestion[] = React.useMemo(() => {
    if (mode === 'practice') return getPracticeQuestionsForStage(practiceStage);
    if (activeStudent) {
      return generateBalancedStudentExam(rawPool, activeStudent, settings);
    }
    return rawPool.slice(0, settings.questionsCountPerExam || 50);
  }, [mode, practiceStage, activeStudent?.id, activeStudent?.participationCode, customQuestions.length, settings.questionsCountPerExam, settings.randomizeQuestionsOrder, settings.randomizeOptionsOrder]);

  const questionList: QualifierQuestion[] =
    selectedDomainFilter === 'ALL'
      ? baseList
      : baseList.filter((q) => q.domain === selectedDomainFilter);

  const currentQuestion = questionList[currentIndex] || baseList[0];

  // Reset when mode switches
  useEffect(() => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentIndex(0);
    setAnswers({});
    setPracticeFeedbackIdx(null);
    setSecondsLeft(mode === 'qualifier' ? settings.qualifierDurationMinutes * 60 : 10 * 60);
  }, [mode, settings.qualifierDurationMinutes]);

  // Countdown Timer (Auto-submits when time reaches 0 without supervisor intervention)
  useEffect(() => {
    if (!examStarted || examFinished) return;
    if (secondsLeft <= 0) {
      setTimeoutTriggered(true);
      handleFinishExam(true);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [examStarted, examFinished, secondsLeft]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const autoDetectedStage: EducationalStage = resolveStageFromGrade(grade);

  const handleCreateStudentTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const cleanCode =
      codeInput.trim().toUpperCase() ||
      `OM-${grade}${Math.floor(100 + Math.random() * 899)}`;

    const maxAttempts = settings.allowedAttemptsPerStudent || 1;

    // Check if code already exists
    const existing = students.find(
      (s) => s.participationCode.toUpperCase() === cleanCode
    );
    if (existing) {
      const used = existing.attemptsUsed || (existing.completedQualifier ? 1 : 0);
      if (existing.completedQualifier && used >= maxAttempts) {
        setLoginError(
          `🔒 قام النظام تلقائياً بمنع إعادة المحاولة: هذا الكود استنفد عدد المحاولات المسموح بها (${used}/${maxAttempts}).`
        );
        setActiveStudent(existing);
        return;
      }
      setActiveStudent(existing);
      setGeneratedTicketCode(existing.participationCode);
      setLoginError(null);
      soundEngine.playCorrect();
      return;
    }

    const stage = resolveStageFromGrade(grade);
    const newStu: StudentProfile = {
      id: `stu-${Date.now()}`,
      name: studentName.trim(),
      grade,
      stage,
      className: className.trim() || `${grade} / أ`,
      schoolName: schoolName.trim() || 'مدرستي',
      schoolType,
      administration: administration.trim() || 'الإدارة التعليمية',
      governorate: governorate.trim() || 'القاهرة',
      region: governorate.trim() || 'القاهرة',
      country: country.trim() || 'مصر 🇪🇬',
      participationCode: cleanCode,
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

    onRegisterStudent(newStu);
    setActiveStudent(newStu);
    setGeneratedTicketCode(cleanCode);
    setLoginError(null);
    soundEngine.playCorrect();
  };

  const handleStartExamNow = () => {
    const maxAttempts = settings.allowedAttemptsPerStudent || 1;
    const used = activeStudent?.attemptsUsed || (activeStudent?.completedQualifier ? 1 : 0);
    if (mode === 'qualifier' && activeStudent?.completedQualifier && used >= maxAttempts) {
      setLoginError(
        `لقد استنفدت المحاولة المسموحة (${used}/${maxAttempts}). يمكنك استعراض بطاقة العبقري وحالة التأهل التلقائي.`
      );
      return;
    }
    soundEngine.playBuzzer();
    setExamStarted(true);
    setExamFinished(false);
    setTimeoutTriggered(false);
    setCurrentIndex(0);
    setAnswers({});
    setStartTimeMs(Date.now());
    setEntryTimeStr(
      new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
    setSecondsLeft(mode === 'qualifier' ? settings.qualifierDurationMinutes * 60 : 10 * 60);
  };

  const handleSelectOption = (optIndex: number) => {
    if (!currentQuestion) return;
    soundEngine.playSelectTile();
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optIndex }));

    if (mode === 'practice') {
      setPracticeFeedbackIdx(optIndex);
      if (optIndex === currentQuestion.correctIndex) {
        soundEngine.playCorrect();
      } else {
        soundEngine.playWrong();
      }
    }
  };

  const handleFinishExam = (isTimeoutAutoSubmit = false) => {
    soundEngine.playFanfare();
    setExamFinished(true);
    setExamStarted(false);

    if (mode === 'practice' || !activeStudent) return;

    const elapsedSec = Math.max(
      15,
      Math.floor((Date.now() - startTimeMs) / 1000)
    );

    const gradedStudent = gradeStudentExamAutomatically(
      activeStudent,
      baseList,
      answers,
      elapsedSec,
      entryTimeStr || '١٠:٠٠ ص',
      isTimeoutAutoSubmit,
      settings
    );

    const activePhaseId = settings.activeAnnualPhaseId || 'phase_2_administration';
    const enrichedStudent: StudentProfile = {
      ...gradedStudent,
      currentAnnualPhaseReached: activePhaseId,
      annualPhaseScores: {
        ...(gradedStudent.annualPhaseScores || {}),
        [activePhaseId]: gradedStudent.scores.total,
      },
    };

    setActiveStudent(enrichedStudent);
    onCompleteQualifier(enrichedStudent.id, enrichedStudent);
  };

  // ==================== PRACTICE MODE VIEW (#26 & #28: 10 Stage-Specific Practice Questions) ====================
  if (mode === 'practice' && !examStarted && !examFinished) {
    return (
      <div className="max-w-4xl mx-auto rounded-3xl bg-[#131F38] border border-amber-400/40 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div>
          <div className="text-xs font-extrabold text-amber-400 mb-2">
            🎮 تجربة مجانية · ١٠ أسئلة تدريبية مخصصة حسب مرحلتك التعليمية
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
            اختر مرحلتك التعليمية وابدأ التدريب التجريبي الآن
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl mx-auto leading-relaxed">
            تختلف الأسئلة الـ١٠ حسب مرحلتك العمرية (ابتدائي صغير، ابتدائي كبير، إعدادي، أو ثانوي). هذه الجولة التجريبية لا تدخل في النتائج الرسمية وتهدف لتعريفك بطريقة المنافسة في «عباقرة عيون مصر».
          </p>
        </div>

        {/* 4 Stage Selector Cards (#26) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-right">
          {(
            [
              { id: 'primary_lower', icon: '🟢', title: 'ابتدائي صغير', sub: 'الصفوف ١ - ٣ ابتدائي (ملاحظة وحساب بسيط)' },
              { id: 'primary_upper', icon: '🔵', title: 'ابتدائي كبير', sub: 'الصفوف ٤ - ٦ ابتدائي (علوم ومنطق وثقافة)' },
              { id: 'preparatory', icon: '🟣', title: 'المرحلة الإعدادية', sub: 'الصفوف ١ع - ٣ع (استنتاج وتكنولوجيا وجبر)' },
              { id: 'secondary', icon: '🟠', title: 'المرحلة الثانوية', sub: 'الصفوف ١ث - ٣ث (تفكير نقدي وحل مشكلات)' },
            ] as { id: EducationalStage; icon: string; title: string; sub: string }[]
          ).map((st) => {
            const isSelected = practiceStage === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  setPracticeStage(st.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-amber-400/20 border-2 border-amber-400 shadow-lg scale-[1.02]'
                    : 'bg-slate-950/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{st.icon}</span>
                  {isSelected && (
                    <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-extrabold">
                      ✓ مختارة
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-sm font-extrabold text-white font-display">{st.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.sub}</div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleStartExamNow}
          className="px-8 py-3.5 text-sm font-extrabold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <Play className="w-4 h-4" />
          <span>
            ابدأ الـ١٠ أسئلة التجريبية لمرحلة ({STAGE_METADATA[practiceStage].shortLabel}) الآن
          </span>
        </button>
      </div>
    );
  }

  // ==================== REGISTRATION / LOGIN FOR OFFICIAL QUALIFIER (#3, #4, #5, #26) ====================
  if (mode === 'qualifier' && !examStarted && !examFinished) {
    const annualPhases =
      settings.annualPhases && settings.annualPhases.length > 0
        ? settings.annualPhases
        : DEFAULT_ANNUAL_PHASES;
    const activeAnnualPhase =
      annualPhases.find((p) => p.id === (settings.activeAnnualPhaseId || 'phase_2_administration')) ||
      annualPhases[1] ||
      annualPhases[0];

    return (
      <div className="space-y-6">
        {/* Year-Round Multi-Stage Qualifiers Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-amber-400/60 space-y-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[11px] font-extrabold">
                  📅 نظام المراحل والتصفيات الممتدة على مدار السنة (٦ مراحل)
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[11px] font-bold">
                  المرحلة الجارية الآن ({activeAnnualPhase.monthsLabel})
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white font-display mt-1.5">
                {activeAnnualPhase.icon} {activeAnnualPhase.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {activeAnnualPhase.qualificationRule}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigateView('annual_roadmap')}
              className="px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-400/60 text-amber-300 hover:bg-amber-400 hover:text-slate-950 text-xs font-extrabold transition-colors cursor-pointer shrink-0"
            >
              📅 عرض خريطة مراحل وتصفيات السنة الكاملة ←
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {annualPhases.map((ph) => {
              const isCurr = ph.id === activeAnnualPhase.id;
              return (
                <div
                  key={ph.id}
                  onClick={() => onNavigateView('annual_roadmap')}
                  className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    isCurr
                      ? 'bg-amber-400 text-slate-950 border-white font-extrabold shadow'
                      : ph.status === 'completed'
                      ? 'bg-emerald-950/35 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span>{ph.monthsLabel}</span>
                    <span>
                      {ph.status === 'completed' ? '✓' : isCurr ? '🟢 الآن' : '⏳'}
                    </span>
                  </div>
                  <div className="font-bold mt-0.5 truncate">
                    {ph.icon} {ph.shortTitle}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-6 rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8">
          <div className="text-xs font-extrabold text-emerald-400 mb-1">
            📝 التسجيل في عباقرة عيون مصر · مسابقة مفتوحة لجميع مدارس الجمهورية
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            اختر مرحلتك وسجّل بيانات مدرستك لاستخراج كود المشاركة 🎫
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            يرتبط كل طالب تلقائياً بمساره الوطني: (الطالب ← المدرسة ← الإدارة التعليمية ← المحافظة ← المرحلة التعليمية) دون جمع أي بيانات شخصية حساسة.
          </p>

          {/* Quick Stage Selector Strip (#26) */}
          <div className="mt-4 p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-amber-300">
              ١. اختر مرحلتك التعليمية (أو اختر الصف بالأسفل ليحدد النظام مستواك تلقائياً):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'primary_lower', label: '🟢 ابتدائي صغير', defaultGrade: '2' as GradeNumber },
                  { id: 'primary_upper', label: '🔵 ابتدائي كبير', defaultGrade: '5' as GradeNumber },
                  { id: 'preparatory', label: '🟣 إعدادي', defaultGrade: '8' as GradeNumber },
                  { id: 'secondary', label: '🟠 ثانوي', defaultGrade: '11' as GradeNumber },
                ] as const
              ).map((st) => {
                const isCurr = autoDetectedStage === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playSelectTile();
                      setGrade(st.defaultGrade);
                      setClassName(`${st.defaultGrade} / أ`);
                    }}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isCurr
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {loginError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleCreateStudentTicket} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">اسم الطالب الثلاثي *</label>
              <input
                required
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="مثال: أحمد محمد محمود"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">الصف الدراسي (توزيع تلقائي للمرحلة) *</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = e.target.value as GradeNumber;
                    setGrade(g);
                    setClassName(`${g} / أ`);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                >
                  <optgroup label="ابتدائي صغير (الصفوف 1 - 3)">
                    <option value="1">الصف الأول الابتدائي</option>
                    <option value="2">الصف الثاني الابتدائي</option>
                    <option value="3">الصف الثالث الابتدائي</option>
                  </optgroup>
                  <optgroup label="ابتدائي كبير (الصفوف 4 - 6)">
                    <option value="4">الصف الرابع الابتدائي</option>
                    <option value="5">الصف الخامس الابتدائي</option>
                    <option value="6">الصف السادس الابتدائي</option>
                  </optgroup>
                  <optgroup label="المرحلة الإعدادية (1ع - 3ع)">
                    <option value="7">الصف الأول الإعدادي</option>
                    <option value="8">الصف الثاني الإعدادي</option>
                    <option value="9">الصف الثالث الإعدادي</option>
                  </optgroup>
                  <optgroup label="المرحلة الثانوية (1ث - 3ث)">
                    <option value="10">الصف الأول الثانوي</option>
                    <option value="11">الصف الثاني الثانوي</option>
                    <option value="12">الصف الثالث الثانوي</option>
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">الفصل *</label>
                <input
                  required
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="مثال: 5 / أ"
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Governorate, Educational Administration, School Name & School Type Fields (#3 & #4) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div>
                <label className="block text-xs text-amber-300 font-bold mb-1">🗺️ المحافظة (٢٧ محافظة) *</label>
                <select
                  value={governorate}
                  onChange={(e) => {
                    const g = e.target.value;
                    setGovernorate(g);
                    const foundGov = EGYPT_27_GOVERNORATES.find((item) => item.name === g);
                    if (foundGov && foundGov.defaultAdministrations[0]) {
                      setAdministration(foundGov.defaultAdministrations[0]);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                >
                  {EGYPT_27_GOVERNORATES.map((g) => (
                    <option key={g.name} value={g.name}>
                      محافظة {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-amber-300 font-bold mb-1">📍 المنطقة / الإدارة التعليمية *</label>
                <input
                  required
                  type="text"
                  value={administration}
                  onChange={(e) => setAdministration(e.target.value)}
                  placeholder="مثال: إدارة شرق التعليمية..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-amber-300 font-bold mb-1">🏫 اسم المدرسة *</label>
                <input
                  required
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="اكتب اسم مدرستك في محافظتك..."
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-amber-300 font-bold mb-1">🏷️ نوع المدرسة *</label>
                <select
                  value={schoolType}
                  onChange={(e) => setSchoolType(e.target.value as SchoolType)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                >
                  {(Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[]).map((stKey) => (
                    <option key={stKey} value={stKey}>
                      {SCHOOL_TYPE_LABELS[stKey]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Automatic Group Placement Preview */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-400/40 text-xs space-y-1">
              <div className="font-bold text-emerald-300 flex items-center justify-between">
                <span>🤖 التسكين والتوزيع الآلي في النظام الذاتي:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[10px]">
                  {STAGE_METADATA[autoDetectedStage].label}
                </span>
              </div>
              <div className="text-[11px] text-slate-200 font-mono-num">
                {buildStudentGroupingPath({
                  grade,
                  stage: autoDetectedStage,
                  governorate,
                  administration,
                  schoolName,
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">
                كود المشاركة (اتركه فارغاً لتوليد كود جديد تلقائياً، أو أدخل كودك السابق)
              </label>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="مثال: OM-501"
                className="w-full px-3.5 py-2.5 text-sm font-mono-num bg-slate-950 border border-slate-700 rounded-xl text-amber-400 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-bold text-slate-950 bg-amber-400 rounded-xl hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>إصدار تذكرة وكود المشاركة 🎟️</span>
            </button>
          </form>
        </div>

        {/* Ticket Preview & Exam Distribution Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {activeStudent && (
            <div className="rounded-2xl bg-gradient-to-br from-[#162647] to-[#111C35] border-2 border-amber-400/70 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">
                    🎟️ تذكرة دخول رسمية — {activeStudent.schoolName || settings.defaultSchoolName || 'مدرسة عيون مصر للغات'}
                  </div>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">{activeStudent.name}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    {GRADE_LABELS[activeStudent.grade] || `الصف ${activeStudent.grade}`} · الفصل: {activeStudent.className}
                  </div>
                  <div className="text-[11px] text-emerald-300 font-semibold mt-1">
                    🤖 المسار التلقائي: {buildStudentGroupingPath(activeStudent)}
                  </div>
                </div>
                <div className="text-left bg-slate-950 px-4 py-2.5 rounded-xl border border-amber-400/40">
                  <div className="text-[10px] text-slate-400">كود المشاركة</div>
                  <div className="text-lg font-bold font-mono-num text-amber-400">
                    {activeStudent.participationCode}
                  </div>
                </div>
              </div>

              {/* Automatic Qualification Next Round Banner if Student Qualified */}
              {activeStudent.completedQualifier && activeStudent.qualifiedForFinals && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border-2 border-emerald-400/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-300">
                      🟢 «لقد تأهلت تلقائياً إلى المرحلة التالية!»
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[11px] font-bold">
                      الترتيب #{activeStudent.stageRank || activeStudent.autoRank || 1} في مرحلتك
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200 pt-1">
                    <div>
                      🎯 المرحلة التالية:{' '}
                      <strong className="text-amber-300">
                        {activeStudent.nextRoundInfo?.roundTitle || '📍 تصفيات الإدارة التعليمية'}
                      </strong>
                    </div>
                    <div>
                      📅 موعد الجولة القادمة:{' '}
                      <strong className="font-mono-num text-emerald-300">
                        {activeStudent.nextRoundInfo?.scheduledDate || settings.endDate}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    💡 التعليمات: {activeStudent.nextRoundInfo?.instructions || 'انتقلت تلقائياً دون الحاجة لأي إجراء يدوي. ادخل بكود مشاركتك عند فتح الجولة.'}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                {activeStudent.completedQualifier ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-emerald-400 font-semibold">
                      ✓ تم التصحيح والترتيب آلياً ({activeStudent.qualifierSubmittedAt}) · الدرجة: {activeStudent.scores.total} نقطة
                    </span>
                    <button
                      onClick={() => onNavigateView('genius_card')}
                      className="px-4 py-2 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300"
                    >
                      عرض بطاقة العبقري وتقرير التصحيح 🪪
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartExamNow}
                    className="w-full py-3.5 text-sm font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>
                      🚀 دخول الاختبار الإلكتروني التلقائي ({settings.questionsCountPerExam || 50} سؤالاً — {settings.qualifierDurationMinutes} دقيقة)
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 50-Question Breakdown Card */}
          <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6">
            <h3 className="text-base font-bold text-white font-display mb-1">
              توزيع مجالات اختبار التصفيات (50 سؤالاً — 30 دقيقة)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              تتدرج الأسئلة بين 🟢 سهل و🟡 متوسط و🔴 صعب، ولا تظهر الإجابة الصحيحة أثناء الاختبار الرسمي ضماناً للعدالة.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {(Object.keys(DOMAIN_META) as QualifierDomain[]).map((domKey) => {
                const info = DOMAIN_META[domKey];
                return (
                  <div
                    key={domKey}
                    className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-semibold" style={{ color: info.color }}>
                      {info.label}
                    </span>
                    <span className="font-mono-num text-slate-300 font-bold">
                      {info.targetCount} أسئلة
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  // ==================== EXAM COMPLETED MESSAGE ====================
  if (examFinished) {
    const practiceCorrectCount = questionList.filter(
      (q) => answers[q.id] === q.correctIndex
    ).length;

    return (
      <div className="max-w-2xl mx-auto rounded-2xl bg-[#131F38] border border-amber-400/50 p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        {mode === 'qualifier' ? (
          <div className="space-y-5">
            {timeoutTriggered && (
              <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-bold">
                ⏱️ انتهى الوقت! قام النظام تلقائياً بحفظ إجاباتك وتصحيح الاختبار دون تدخل بشري.
              </div>
            )}
            <h2 className="text-2xl font-bold text-white font-display">
              🤖 تم التصحيح الآلي واحتساب النتيجة والترتيب تلقائياً!
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              أحسنت يا <strong className="text-amber-400">{activeStudent?.name}</strong>! قام محرك التصفيات الذاتي بتصحيح إجاباتك وحساب نقاطك وزمن استجابتك وتحديث ترتيبك في مجموعة ({STAGE_METADATA[activeStudent?.stage || 'primary_upper'].shortLabel}).
            </p>

            {/* Automated Grading Breakdown Metrics */}
            {activeStudent?.gradingReport && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">الإجابات الصحيحة</div>
                  <div className="text-lg font-extrabold font-mono-num text-emerald-400 mt-0.5">
                    {activeStudent.gradingReport.correctCount} / {questionList.length}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">مجموع النقاط والنسبة</div>
                  <div className="text-lg font-extrabold font-mono-num text-amber-400 mt-0.5">
                    {activeStudent.scores.total} ({activeStudent.gradingReport.percentage}%)
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">زمن الاختبار الكلي</div>
                  <div className="text-lg font-extrabold font-mono-num text-sky-400 mt-0.5">
                    {activeStudent.gradingReport.totalDurationSeconds} ث
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-slate-400">متوسط زمن السؤال</div>
                  <div className="text-lg font-extrabold font-mono-num text-purple-400 mt-0.5">
                    {activeStudent.gradingReport.avgSecondsPerQuestion} ث/سؤال
                  </div>
                </div>
              </div>
            )}

            {/* Automatic Next Round Qualification Card */}
            {activeStudent?.qualifiedForFinals && (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-right space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-extrabold text-emerald-300">
                    🟢 مبروك! «لقد تأهلت تلقائياً للمرحلة التالية!»
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-bold">
                    {activeStudent.nextRoundInfo?.statusLabel || 'مؤهل تلقائياً'}
                  </span>
                </div>
                <div className="text-xs text-slate-200 space-y-1">
                  <div>
                    🏆 الجولة القادمة:{' '}
                    <strong className="text-amber-300">
                      {activeStudent.nextRoundInfo?.roundTitle || '📍 تصفيات الإدارة التعليمية'}
                    </strong>
                  </div>
                  <div>
                    📅 الموعد المحدد:{' '}
                    <strong className="font-mono-num text-emerald-300">
                      {activeStudent.nextRoundInfo?.scheduledDate || settings.endDate}
                    </strong>
                  </div>
                  <div>
                    📋 تعليمات المشاركة:{' '}
                    <span>
                      {activeStudent.nextRoundInfo?.instructions ||
                        'تم نقلك تلقائياً بواسطة النظام الذاتي دون الحاجة لمراجعة المشرف.'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onNavigateView('genius_card')}
                className="px-6 py-3 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition-colors"
              >
                🪪 استعراض بطاقة عبقري عيون مصر
              </button>
              <button
                onClick={() => onNavigateView('journey')}
                className="px-5 py-3 text-xs font-semibold bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                🧭 العودة إلى خريطة رحلة العباقرة
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white font-display">
              انتهى التدريب التجريبي بنجاح!
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              أجبت بشكل صحيح على <strong className="text-amber-400 font-mono-num">{practiceCorrectCount}</strong> من أصل <strong className="font-mono-num">{questionList.length}</strong> أسئلة تجريبية. أنت الآن جاهز لخوض التصفيات الرسمية!
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleStartExamNow}
                className="px-5 py-2.5 text-xs font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إعادة التدريب</span>
              </button>
              <button
                onClick={() => onNavigateView('qualifiers')}
                className="px-5 py-2.5 text-xs font-semibold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400"
              >
                الانتقال للتصفيات الرسمية
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ==================== ACTIVE QUESTION RUNNER (50 Qs OR 10 PRACTICE Qs) ====================
  if (!currentQuestion) return null;

  const domainInfo = DOMAIN_META[currentQuestion.domain];
  const selectedOpt = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Exam HUD Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span style={{ color: domainInfo.color }} className="font-bold">
              {domainInfo.label}
            </span>
            <span>·</span>
            <span>
              المستوى:{' '}
              {currentQuestion.difficulty === 'easy'
                ? '🟢 سهل'
                : currentQuestion.difficulty === 'medium'
                ? '🟡 متوسط'
                : '🔴 صعب'}
            </span>
            <span>·</span>
            <span className="font-mono-num text-amber-400">{currentQuestion.points} نقطة</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            السؤال <span className="font-mono-num text-amber-400">{currentIndex + 1}</span> من{' '}
            <span className="font-mono-num">{questionList.length}</span>
            {activeStudent && mode === 'qualifier' && (
              <span className="text-xs text-slate-400 mr-3">
                (الطالب: {activeStudent.name} · الكود: {activeStudent.participationCode})
              </span>
            )}
          </div>
        </div>

        {/* Countdown Clock */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl border font-mono-num text-base font-bold flex items-center gap-2 ${
              secondsLeft <= 180
                ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                : 'bg-slate-950 border-slate-700 text-amber-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button
            onClick={() => handleFinishExam(false)}
            className="px-4 py-2 text-xs font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors whitespace-nowrap"
          >
            تسليم الاختبار ({answeredCount}/{questionList.length})
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
        <div
          className="h-full bg-amber-400 transition-all duration-200"
          style={{ width: `${((currentIndex + 1) / questionList.length) * 100}%` }}
        />
      </div>

      {/* Domain Switcher Strip (تصفح المجالات المتنوعة) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => {
            setSelectedDomainFilter('ALL');
            setCurrentIndex(0);
            setPracticeFeedbackIdx(null);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-colors ${
            selectedDomainFilter === 'ALL'
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
          }`}
        >
          🌈 جميع المجالات متنوعة ({baseList.length})
        </button>
        {(Object.keys(DOMAIN_META) as QualifierDomain[]).map((domKey) => {
          const count = baseList.filter((q) => q.domain === domKey).length;
          if (count === 0) return null;
          return (
            <button
              key={domKey}
              onClick={() => {
                setSelectedDomainFilter(domKey);
                setCurrentIndex(0);
                setPracticeFeedbackIdx(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap border transition-colors ${
                selectedDomainFilter === domKey
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white'
              }`}
            >
              {DOMAIN_META[domKey].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#131F38] border border-slate-800 space-y-6">
        {/* Context Passage (for Mystery Fact / New Info Questions) */}
        {currentQuestion.contextPassage && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/40 text-amber-200 text-sm leading-relaxed">
            <strong className="block text-xs text-amber-400 mb-1">💡 اقرأ المعلومة التالية بتركيز ثم استنتج الإجابة:</strong>
            {currentQuestion.contextPassage}
          </div>
        )}

        {/* Visual Observation Strip */}
        {currentQuestion.visualGrid && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-xs text-slate-400 mb-2 text-center">👁️ لوحة الملاحظة البصرية والتركيز</div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {currentQuestion.visualGrid.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-lg font-bold text-white font-mono-num"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xl sm:text-2xl font-bold text-white font-display leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOpt === idx;

            // IMPORTANT: In official qualifier mode, NEVER reveal whether the answer is right or wrong during the test!
            let btnClass =
              'bg-slate-900/90 border-slate-700 text-slate-100 hover:border-amber-400';

            if (mode === 'qualifier') {
              if (isSelected) {
                btnClass = 'bg-amber-400/20 border-amber-400 text-amber-200 font-bold';
              }
            } else {
              // Practice mode shows immediate educational feedback
              if (practiceFeedbackIdx !== null) {
                if (idx === currentQuestion.correctIndex) {
                  btnClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                } else if (isSelected) {
                  btnClass = 'bg-rose-500/20 border-rose-400 text-rose-200';
                }
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                className={`p-4 rounded-xl border text-right text-sm sm:text-base transition-all flex items-center justify-between gap-3 ${btnClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-xs font-mono-num shrink-0">
                    {idx + 1}
                  </span>
                  <span>{opt}</span>
                </div>
                {mode === 'qualifier' && isSelected && (
                  <span className="text-xs text-amber-400 font-semibold shrink-0">● تم الاختيار</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
          <button
            disabled={
              currentIndex === 0 ||
              (mode === 'qualifier' && !settings.allowBackNavigationInQualifier)
            }
            onClick={() => {
              setPracticeFeedbackIdx(null);
              setCurrentIndex((i) => Math.max(0, i - 1));
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
              currentIndex === 0 ||
              (mode === 'qualifier' && !settings.allowBackNavigationInQualifier)
                ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 border-slate-700 text-slate-200 hover:text-white'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>
              {mode === 'qualifier' && !settings.allowBackNavigationInQualifier
                ? 'الرجوع مغلق في التصفيات'
                : 'السؤال السابق'}
            </span>
          </button>

          {currentIndex < questionList.length - 1 ? (
            <button
              onClick={() => {
                setPracticeFeedbackIdx(null);
                setCurrentIndex((i) => Math.min(questionList.length - 1, i + 1));
              }}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors flex items-center gap-2"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleFinishExam(false)}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
            >
              إنهاء وتسليم الإجابات ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
