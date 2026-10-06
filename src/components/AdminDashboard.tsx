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
} from 'lucide-react';
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
} from '../types/competition';
import { DOMAIN_META } from '../data/qualifierQuestions';
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

export type AdminSection = 'students' | 'questions' | 'competition' | 'teams' | 'awards' | 'matches' | 'results';

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
  initialSection = 'students',
  onTriggerGeniusAlarm,
}) => {
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialSection) setSection(initialSection);
  }, [initialSection]);

  // Add Student State
  const [stuName, setStuName] = useState('');
  const [stuGrade, setStuGrade] = useState<GradeNumber>('5');
  const [stuClass, setStuClass] = useState('5 / أ');

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
    const header = 'الاسم,الصف,الفصل,كود المشاركة,النقاط الكلية,السرعة,تأهل للنهائيات\n';
    const rows = students
      .map(
        (s) =>
          `"${s.name}",${s.grade},"${s.className}",${s.participationCode},${s.scores.total},${s.scores.speedScore},${
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

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-400">
            🛠️ لوحة تحكم المشرف وإدارة البطولة — مدرسة عيون مصر
          </span>
          <h2 className="text-2xl font-bold text-white font-display mt-1">
            الإدارة الكاملة للطلاب، الأسئلة، الفرق، المباريات، والإعدادات
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTriggerGeniusAlarm}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500"
          >
            🚨 إطلاق إنذار العباقرة الآن
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>تصدير النتائج (CSV)</span>
          </button>
        </div>
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
            { id: 'students', label: '👨‍🎓 الطلاب والمتأهلون' },
            { id: 'questions', label: '❓ بنك الأسئلة' },
            { id: 'teams', label: '🧩 إدارة الفرق والقادة' },
            { id: 'awards', label: '🏅 ربط الجوائز والألقاب بالفائزين' },
            { id: 'competition', label: '⚙️ إعدادات المسابقة والحماية' },
            { id: 'matches', label: '⚔️ إدارة المباريات المباشرة' },
            { id: 'results', label: '📊 التقارير والنتائج' },
          ] as { id: AdminSection; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSection(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
              section === tab.id
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-[#131F38] text-slate-300 border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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
            <button
              onClick={() => {
                if (!stuName.trim()) return;
                const code = `OM-${stuGrade}${Math.floor(100 + Math.random() * 899)}`;
                const newS: StudentProfile = {
                  id: `stu-${Date.now()}`,
                  name: stuName.trim(),
                  grade: stuGrade,
                  className: stuClass,
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
          <h3 className="text-lg font-bold text-white font-display">
            ⚙️ إعدادات المسابقة وإجراءات الحماية وتقليل الغش
          </h3>
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
                    <span className="text-[11px] text-amber-400 font-semibold">
                      التشكيل الحالي: {t.members.length} لاعبين (الحد المسموح: 4 أو 5 لاعبين)
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

      {/* 6. RESULTS OVERVIEW */}
      {section === 'results' && (
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white font-display">📊 ملخص نتائج الفرق والطلاب</h3>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
            >
              تصدير جدول النتائج CSV
            </button>
          </div>
          <p className="text-xs text-slate-400">
            يتم حفظ جميع تعديلات المشرف والأسئلة والنتائج محلياً في المتصفح بشكل فوري لتعمل المنصة بكامل طاقتها في قاعة المدرسة.
          </p>
        </div>
      )}
    </div>
  );
};
