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
} from '../types/competition';
import { DOMAIN_META, QUALIFIER_50_QUESTIONS, PRACTICE_10_QUESTIONS } from '../data/qualifierQuestions';
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
  const [codeInput, setCodeInput] = useState('');
  const [generatedTicketCode, setGeneratedTicketCode] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Exam State
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(
    mode === 'qualifier' ? settings.qualifierDurationMinutes * 60 : 10 * 60
  );
  const [startTimeMs, setStartTimeMs] = useState<number>(0);

  // Practice immediate feedback
  const [practiceFeedbackIdx, setPracticeFeedbackIdx] = useState<number | null>(null);

  const questionList: QualifierQuestion[] =
    mode === 'practice'
      ? PRACTICE_10_QUESTIONS
      : [...QUALIFIER_50_QUESTIONS, ...customQuestions].slice(0, 50);

  const currentQuestion = questionList[currentIndex];

  // Reset when mode switches
  useEffect(() => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentIndex(0);
    setAnswers({});
    setPracticeFeedbackIdx(null);
    setSecondsLeft(mode === 'qualifier' ? settings.qualifierDurationMinutes * 60 : 10 * 60);
  }, [mode, settings.qualifierDurationMinutes]);

  // Countdown Timer
  useEffect(() => {
    if (!examStarted || examFinished) return;
    if (secondsLeft <= 0) {
      handleFinishExam();
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

  const handleCreateStudentTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    const cleanCode =
      codeInput.trim().toUpperCase() ||
      `OM-${grade}${Math.floor(100 + Math.random() * 899)}`;

    // Check if code already exists
    const existing = students.find(
      (s) => s.participationCode.toUpperCase() === cleanCode
    );
    if (existing) {
      if (existing.completedQualifier) {
        setLoginError('هذا الكود قام بتسليم اختبار التصفيات مسبقاً! لا يُسمح بإعادة الإرسال أكثر من مرة.');
        setActiveStudent(existing);
        return;
      }
      setActiveStudent(existing);
      setGeneratedTicketCode(existing.participationCode);
      setLoginError(null);
      soundEngine.playCorrect();
      return;
    }

    const newStu: StudentProfile = {
      id: `stu-${Date.now()}`,
      name: studentName.trim(),
      grade,
      className: className.trim() || `${grade} / أ`,
      participationCode: cleanCode,
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

    onRegisterStudent(newStu);
    setActiveStudent(newStu);
    setGeneratedTicketCode(cleanCode);
    setLoginError(null);
    soundEngine.playCorrect();
  };

  const handleStartExamNow = () => {
    if (mode === 'qualifier' && activeStudent?.completedQualifier) {
      setLoginError('لقد قمت بأداء وتسليم اختبار التصفيات من قبل. يمكنك استعراض بطاقة العبقري الخاصة بك.');
      return;
    }
    soundEngine.playBuzzer();
    setExamStarted(true);
    setExamFinished(false);
    setCurrentIndex(0);
    setAnswers({});
    setStartTimeMs(Date.now());
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

  const handleFinishExam = () => {
    soundEngine.playFanfare();
    setExamFinished(true);
    setExamStarted(false);

    if (mode === 'practice' || !activeStudent) return;

    const elapsedSec = Math.max(
      30,
      Math.floor((Date.now() - startTimeMs) / 1000)
    );

    // Calculate domain scores
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

    let rawTotalPoints = 0;

    questionList.forEach((q) => {
      domainTotal[q.domain] = (domainTotal[q.domain] || 0) + 1;
      const chosen = answers[q.id];
      if (chosen === q.correctIndex) {
        domainCorrect[q.domain] = (domainCorrect[q.domain] || 0) + 1;
        rawTotalPoints += q.points;
      }
    });

    const pct = (dom: QualifierDomain) =>
      domainTotal[dom] > 0
        ? Math.round((domainCorrect[dom] / domainTotal[dom]) * 100)
        : 85;

    const maxDurationSec = settings.qualifierDurationMinutes * 60;
    const speedRatio = Math.max(0.6, 1 - elapsedSec / (maxDurationSec * 1.25));
    const speedScore = Math.min(99, Math.round(speedRatio * 100));

    const earnedBadges: string[] = [];
    if (pct('science') >= 80) earnedBadges.push('🔬 عبقري العلوم');
    if (pct('logic') >= 80) earnedBadges.push('🧠 عبقري المنطق');
    if (pct('math') >= 80) earnedBadges.push('➗ عبقري الحساب');
    if (pct('observation') >= 80) earnedBadges.push('👁️ عين الصقر');
    if (pct('arabic') >= 80) earnedBadges.push('📚 عبقري اللغة');
    if (earnedBadges.length === 0) earnedBadges.push('🌟 نجم المسابقة');

    const updatedStudent: StudentProfile = {
      ...activeStudent,
      completedQualifier: true,
      qualifierSubmittedAt: new Date().toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      qualifierDurationSeconds: elapsedSec,
      scores: {
        total: rawTotalPoints,
        speedScore,
        logic: pct('logic'),
        science: pct('science'),
        arabic: pct('arabic'),
        observation: pct('observation'),
        math: pct('math'),
        egypt_world: pct('egypt_world'),
        general_culture: pct('general_culture'),
        technology: pct('technology'),
      },
      qualifiedForFinals: rawTotalPoints >= 300,
      badges: earnedBadges,
    };

    setActiveStudent(updatedStudent);
    onCompleteQualifier(updatedStudent.id, updatedStudent);
  };

  // ==================== PRACTICE MODE VIEW ====================
  if (mode === 'practice' && !examStarted && !examFinished) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 text-center">
        <div className="text-xs font-semibold text-amber-400 mb-2">
          🧪 وضع التدريب التجريبي · ١٠ أسئلة متنوعة
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
          جرّب قبل البطولة — تدريب العباقرة
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto leading-relaxed">
          يحتوي هذا التدريب على ١٠ أسئلة تجريبية متنوعة (علوم، حساب ذهني، ملاحظة بصرية، معلومة جديدة، ومنطق). هذه الأسئلة لا تدخل في النتائج الرسمية، والغرض منها التعرف على طريقة اللعب قبل التصفيات.
        </p>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="font-bold text-amber-400 font-mono-num text-base">10</div>
            <div>أسئلة تجريبية</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="font-bold text-emerald-400 font-mono-num text-base">فوري</div>
            <div>تصحيح وشرح مباشر</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="font-bold text-sky-400 font-mono-num text-base">8 مجالات</div>
            <div>معرفة وتفكير وملاحظة</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="font-bold text-purple-400 font-mono-num text-base">مفتوح</div>
            <div>تدرّب في أي وقت</div>
          </div>
        </div>

        <button
          onClick={handleStartExamNow}
          className="mt-8 px-8 py-3.5 text-sm font-bold bg-amber-400 text-slate-950 rounded-xl hover:bg-amber-300 transition-colors inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          <span>ابدأ الأسئلة التجريبية الـ١٠ الآن</span>
        </button>
      </div>
    );
  }

  // ==================== REGISTRATION / LOGIN FOR OFFICIAL QUALIFIER ====================
  if (mode === 'qualifier' && !examStarted && !examFinished) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Registration Form */}
        <div className="lg:col-span-6 rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8">
          <div className="text-xs font-semibold text-emerald-400 mb-1">
            🟢 المرحلة الأولى: التصفيات الفردية الأونلاين
          </div>
          <h2 className="text-2xl font-bold text-white font-display">
            تسجيل بيانات العبقري واستخراج كود المشاركة
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            أدخل البيانات المدرسية الأساسية فقط للحصول على تذكرة وكود الدخول للاختبار الفردي (٥٠ سؤالاً في ٣٠ دقيقة).
          </p>

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
                <label className="block text-xs text-slate-300 mb-1">الصف الدراسي *</label>
                <select
                  value={grade}
                  onChange={(e) => {
                    const g = e.target.value as GradeNumber;
                    setGrade(g);
                    setClassName(`${g} / أ`);
                  }}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-amber-400 focus:outline-none"
                >
                  <option value="4">الصف الرابع الابتدائي</option>
                  <option value="5">الصف الخامس الابتدائي</option>
                  <option value="6">الصف السادس الابتدائي</option>
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
            <div className="rounded-2xl bg-gradient-to-br from-[#162647] to-[#111C35] border-2 border-amber-400/70 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">🎟️ تذكرة دخول رسمية — مدرسة عيون مصر</div>
                  <h3 className="text-xl font-bold text-white font-display mt-0.5">{activeStudent.name}</h3>
                  <div className="text-xs text-slate-300 mt-1">
                    الصف {activeStudent.grade === '4' ? 'الرابع' : activeStudent.grade === '5' ? 'الخامس' : 'السادس'} الابتدائي · الفصل: {activeStudent.className}
                  </div>
                </div>
                <div className="text-left bg-slate-950 px-4 py-2.5 rounded-xl border border-amber-400/40">
                  <div className="text-[10px] text-slate-400">كود المشاركة</div>
                  <div className="text-lg font-bold font-mono-num text-amber-400">
                    {activeStudent.participationCode}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                {activeStudent.completedQualifier ? (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-emerald-400 font-semibold">
                      ✓ تم أداء وتسليم اختبار التصفيات بنجاح ({activeStudent.qualifierSubmittedAt})
                    </span>
                    <button
                      onClick={() => onNavigateView('genius_card')}
                      className="px-4 py-2 text-xs font-bold bg-amber-400 text-slate-950 rounded-lg hover:bg-amber-300"
                    >
                      عرض بطاقة العبقري 🪪
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartExamNow}
                    className="w-full py-3.5 text-sm font-bold bg-emerald-500 text-slate-950 rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Play className="w-4 h-4" />
                    <span>🚀 دخول اختبار التصفيات الآن (50 سؤالاً — 30 دقيقة)</span>
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
          <>
            <h2 className="text-2xl font-bold text-white font-display">
              «تم تسجيل إجاباتك بنجاح. سيتم إعلان نتائج التصفيات بعد انتهاء المسابقة.»
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              أحسنت يا <strong className="text-amber-400">{activeStudent?.name}</strong>! تم حفظ وقت البداية والنهاية وكود مشاركتك (<span className="font-mono-num text-amber-300">{activeStudent?.participationCode}</span>) في سجل مدرسة عيون مصر، وتم إصدار بطاقة العبقري التحفيزية الخاصة بك.
            </p>
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
          </>
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
            onClick={handleFinishExam}
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
              onClick={handleFinishExam}
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
