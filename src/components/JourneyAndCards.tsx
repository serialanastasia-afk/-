import React from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Play,
  Users,
  ShieldCheck,
  Crown,
  Printer,
  BarChart3,
  Activity,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from 'recharts';
import {
  StudentProfile,
  Team,
  MatchItem,
  CompetitionSettings,
  AppView,
  ChallengeGameId,
  CompetitionAward,
} from '../types/competition';
import { JOURNEY_NODES } from '../data/challengesData';
import { soundEngine } from '../utils/sound';
import victoryTrophyImg from '../assets/images/victory_cup_trophy_1791274266991.jpg';

// ==================== 1. 🧭 JOURNEY MAP VIEW ====================
interface JourneyMapViewProps {
  unlockedIndex: number;
  onUnlockNextNode: () => void;
  onSelectNode: (targetView: AppView, gameTab?: ChallengeGameId) => void;
}

const STATION_ENGLISH_CODES = [
  'GATEWAY',
  'INTELLIGENCE',
  'SCIENCE',
  'EGYPT',
  'LANGUAGE',
  'OBSERVATION',
  'VELOCITY',
  'SECRETS',
  'CHAMPIONS',
];

export const JourneyMapView: React.FC<JourneyMapViewProps> = ({
  unlockedIndex,
  onUnlockNextNode,
  onSelectNode,
}) => {
  return (
    <section className="space-y-6">
      <div className="p-6 border border-[rgba(242,239,235,0.1)] bg-[#0f0f12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="label">JOURNEY MAP · 09 STATIONS</span>
          <h2 className="text-2xl font-bold text-[#f2efeb] font-display mt-1">
            🧭 خريطة رحلة العباقرة التفاعلية — ٩ محطات معرفية
          </h2>
          <p className="text-xs text-[rgba(242,239,235,0.6)] mt-1">
            كل مرحلة تفتح لك أبواب المدينة التالية بعد خوض تحدياتها بنجاح!
          </p>
        </div>
        <button
          onClick={() => {
            soundEngine.playFanfare();
            onUnlockNextNode();
          }}
          className="btn btn-primary whitespace-nowrap"
          style={{ padding: '0.7rem 1.4rem' }}
        >
          🔓 فتح المرحلة التالية للتجربة
        </button>
      </div>

      <div className="stations-grid">
        {JOURNEY_NODES.map((node, index) => {
          const isUnlocked = index <= unlockedIndex || Boolean(node.unlockedByDefault);
          const numCode = String(index + 1).padStart(2, '0');
          const engLabel = isUnlocked
            ? STATION_ENGLISH_CODES[index] || 'STATION'
            : 'LOCKED';

          return (
            <div
              key={node.id}
              className={`station-card ${!isUnlocked ? 'locked' : ''}`}
            >
              <span className="label">
                [{numCode}] {engLabel}
              </span>
              <h3>{node.title}</h3>
              <p>{node.subtitle}</p>
              {isUnlocked && (
                <button
                  onClick={() => {
                    soundEngine.playSelectTile();
                    onSelectNode(node.targetView, node.gameTab);
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: 'auto', padding: '0.6rem', width: '100%' }}
                >
                  دخول
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

// ==================== 2. 🪪 GENIUS CARD VIEW (بطاقة عبقري عيون مصر) ====================
interface GeniusCardViewProps {
  student: StudentProfile;
  allStudents: StudentProfile[];
  onSelectStudent: (s: StudentProfile) => void;
}

export const GeniusCardView: React.FC<GeniusCardViewProps> = ({
  student,
  allStudents,
  onSelectStudent,
}) => {
  const metrics = [
    { label: '⚡ سرعة الإجابة', value: student.scores.speedScore, color: '#F59E0B' },
    { label: '🧠 المنطق والاستنتاج', value: student.scores.logic, color: '#A855F7' },
    { label: '🔬 العلوم والابتكار', value: student.scores.science, color: '#10B981' },
    { label: '📚 اللغة العربية', value: student.scores.arabic, color: '#F97316' },
    { label: '👁️ الملاحظة والتركيز', value: student.scores.observation, color: '#EC4899' },
    { label: '➗ الحساب والذكاء الرياضي', value: student.scores.math, color: '#38BDF8' },
  ];

  return (
    <section className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <span className="text-xs font-semibold text-amber-400">
            🪪 البطاقة الرقمية التحفيزية لطلاب مدرسة عيون مصر
          </span>
          <h2 className="text-2xl font-bold text-white font-display mt-0.5">
            بطاقة عبقري عيون مصر
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={student.id}
            onChange={(e) => {
              const found = allStudents.find((s) => s.id === e.target.value);
              if (found) onSelectStudent(found);
            }}
            className="px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white"
          >
            {allStudents.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.participationCode})
              </option>
            ))}
          </select>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة البطاقة</span>
          </button>
        </div>
      </div>

      {/* Digital Genius Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#162647] via-[#111C35] to-[#0B1120] border-2 border-amber-400/70 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-bold text-amber-400">
              🏆 مدرسة عيون مصر · بطاقة عبقري معتمدة
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              {student.name}
            </h3>
            <div className="text-xs text-slate-300 mt-1">
              الصف {student.grade === '4' ? 'الرابع' : student.grade === '5' ? 'الخامس' : 'السادس'} الابتدائي · الفصل: {student.className} · كود المشاركة:{' '}
              <span className="font-mono-num text-amber-300 font-bold">
                {student.participationCode}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 rounded-2xl bg-slate-950 border border-amber-400/50 text-center shrink-0">
            <div className="text-xs text-slate-400">⭐ مجموع النقاط</div>
            <div className="text-3xl font-bold font-mono-num text-amber-400 mt-0.5">
              {student.scores.total}
            </div>
          </div>
        </div>

        {/* 6 Skill Bars */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white">{m.label}</span>
                <span className="font-mono-num font-bold" style={{ color: m.color }}>
                  {m.value}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${m.value}%`, backgroundColor: m.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            الأوسمة التشجيعية: <strong className="text-amber-400">{student.badges.join(' · ') || '🌟 عبقري واعد'}</strong>
          </div>
          <div className="text-[11px] text-slate-400">
            * هذه البطاقة وسام تحفيزي لاكتشاف مواهبك المتنوعة وتنمية قدراتك في رحلة العباقرة.
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== 3. 🏅 AWARDS SHOWCASE VIEW (صفحة جوائز وألقاب المسابقة) ====================
interface AwardsShowcaseViewProps {
  awards: CompetitionAward[];
  students: StudentProfile[];
  teams: Team[];
  onGoToAdminAwards: () => void;
}

export const AwardsShowcaseView: React.FC<AwardsShowcaseViewProps> = ({
  awards,
  students,
  teams,
  onGoToAdminAwards,
}) => {
  const [filterMode, setFilterMode] = React.useState<'all' | 'awarded' | 'student' | 'team'>('all');
  const [selectedCertAward, setSelectedCertAward] = React.useState<CompetitionAward | null>(null);

  const resolveWinnerDetails = (award: CompetitionAward) => {
    if (!award.winnerType || !award.winnerId) return null;
    if (award.winnerType === 'student') {
      const stu = students.find((s) => s.id === award.winnerId);
      if (!stu) return null;
      return {
        typeLabel: 'طالب فائز باللقب',
        name: stu.name,
        subLabel: `الصف ${stu.grade === '4' ? 'الرابع' : stu.grade === '5' ? 'الخامس' : 'السادس'} الابتدائي · الفصل ${stu.className}`,
        scoreLabel: `${stu.scores.total} نقطة`,
        codeOrEmblem: stu.participationCode,
      };
    } else {
      const tm = teams.find((t) => t.id === award.winnerId);
      if (!tm) return null;
      const captain = tm.members.find((m) => m.id === tm.captainId) || tm.members[0];
      return {
        typeLabel: 'فريق متوّج باللقب',
        name: tm.name,
        subLabel: `القائد: ${captain?.name || 'غير محدد'} · (${tm.members.length} أعضاء)`,
        scoreLabel: `${tm.points} نقطة`,
        codeOrEmblem: tm.emblem,
      };
    }
  };

  const filteredAwards = awards.filter((aw) => {
    if (filterMode === 'awarded') return Boolean(aw.winnerId && aw.winnerType);
    if (filterMode === 'student') return aw.winnerType === 'student';
    if (filterMode === 'team') return aw.winnerType === 'team';
    return true;
  });

  const awardedCount = awards.filter((a) => Boolean(a.winnerId && a.winnerType)).length;

  return (
    <section className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#17284A] via-[#131F38] to-[#0F172A] border border-amber-400/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400/60 shrink-0 hidden sm:block">
            <img
              src={victoryTrophyImg}
              alt="جوائز عباقرة عيون مصر"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-400">
              🏅 منصة التتويج والأوسمة الرسمية — مدرسة عيون مصر
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mt-1">
              جوائز وألقاب «عباقرة عيون مصر» العشرة
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              لا تقتصر البطولة على المركز الأول فقط؛ بل نحتفي بكل موهبة في المنطق، العلوم، الحساب، اللغة، دقة الملاحظة، سرعة البديهة، وروح الفريق.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 no-print">
          <div className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400">الألقاب الممنوحة</div>
            <div className="text-lg font-bold font-mono-num text-amber-400">
              {awardedCount} / {awards.length}
            </div>
          </div>
          <button
            onClick={onGoToAdminAwards}
            className="px-4 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            🛠️ تخصيص الفائزين من لوحة المشرف
          </button>
        </div>
      </div>

      {/* Interactive Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 no-print">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(
            [
              { id: 'all', label: 'جميع الألقاب (10)' },
              { id: 'awarded', label: 'الألقاب الممنوحة' },
              { id: 'student', label: 'فائزون أفراد (طلاب)' },
              { id: 'team', label: 'فرق متوجة' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                filterMode === tab.id
                  ? 'bg-amber-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>طباعة قائمة الجوائز الرسمية</span>
        </button>
      </div>

      {/* 10 Awards Showcase Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAwards.map((award, idx) => {
          const winner = resolveWinnerDetails(award);
          return (
            <div
              key={award.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                winner
                  ? 'bg-[#131F38] border-amber-400/50 shadow-lg'
                  : 'bg-[#111C35]/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-amber-400/40 flex items-center justify-center text-3xl shrink-0">
                      {award.icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="font-mono-num">وسام 0{idx + 1}</span>
                        <span>·</span>
                        <span className="text-amber-400 font-semibold">
                          {award.awardedAt || 'موسم ٢٠٢٦'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white font-display mt-0.5">
                        {award.title}
                      </h3>
                    </div>
                  </div>

                  {winner ? (
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold whitespace-nowrap">
                      ✓ تم التتويج
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400 text-[11px] whitespace-nowrap">
                      بانتظار الحسم
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{award.desc}</p>

                {/* Winner Box */}
                {winner ? (
                  <div className="mt-5 p-4 rounded-xl bg-slate-900/95 border border-amber-400/30 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-semibold">
                        👑 {winner.typeLabel}
                      </span>
                      <span className="font-mono-num font-bold text-emerald-400">
                        {winner.scoreLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-bold text-white font-display">
                          {winner.name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{winner.subLabel}</div>
                      </div>
                      <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono-num text-amber-300 font-bold">
                        {winner.codeOrEmblem}
                      </div>
                    </div>
                    {award.citationNote && (
                      <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                        <strong className="text-amber-300">سبب الاستحقاق:</strong> {award.citationNote}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 text-center text-xs text-slate-400">
                    لم يتم ربط فائز بهذا اللقب بعد. يمكن للمشرف تعيين الطالب أو الفريق الفائز من لوحة التحكم.
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 no-print">
                {winner ? (
                  <button
                    onClick={() => {
                      soundEngine.playFanfare();
                      setSelectedCertAward(award);
                    }}
                    className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>عرض شهادة اللقب الفخرية</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-500">متاح للطلاب والفرق</span>
                )}

                <button
                  onClick={onGoToAdminAwards}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  تعديل الفائز ←
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Certificate Modal for Selected Award */}
      {selectedCertAward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-gradient-to-b from-[#17284A] to-[#0B1120] border-2 border-amber-400 p-8 text-center space-y-5 shadow-2xl">
            <div className="text-5xl">{selectedCertAward.icon}</div>
            <div className="text-xs font-bold text-amber-400">
              🏆 مدرسة عيون مصر · شهادة استحقاق لقب رسمي
            </div>
            <h3 className="text-3xl font-bold text-white font-display">
              وسام «{selectedCertAward.title}»
            </h3>
            {(() => {
              const w = resolveWinnerDetails(selectedCertAward);
              if (!w) return null;
              return (
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-amber-400/40 space-y-2">
                  <div className="text-xs text-slate-400">يُمنح بكل فخر واعتزاز إلى:</div>
                  <div className="text-2xl font-bold text-amber-400 font-display">{w.name}</div>
                  <div className="text-xs text-slate-300">{w.subLabel}</div>
                  {selectedCertAward.citationNote && (
                    <p className="text-xs text-emerald-300 pt-2">
                      «{selectedCertAward.citationNote}»
                    </p>
                  )}
                </div>
              );
            })()}
            <div className="flex items-center justify-center gap-3 pt-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
              <button
                onClick={() => setSelectedCertAward(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ==================== 4. 🧩 TEAMS & 🏆 TOURNAMENT BRACKET & 📊 LEADERBOARD ====================
interface TournamentAndLeaderboardProps {
  mode: 'teams' | 'tournament' | 'leaderboard' | 'how_to_play';
  teams: Team[];
  students: StudentProfile[];
  matches: MatchItem[];
  settings: CompetitionSettings;
  awards: CompetitionAward[];
  onStartGameArena: () => void;
  onOpenAwardsPage?: () => void;
  onCreateTeam?: (newTeam: Team) => void;
}

export const TournamentAndLeaderboard: React.FC<TournamentAndLeaderboardProps> = ({
  mode,
  teams,
  students,
  settings,
  awards,
  onStartGameArena,
  onOpenAwardsPage,
  onCreateTeam,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const [showBuilder, setShowBuilder] = React.useState(false);
  const [builderSize, setBuilderSize] = React.useState<4 | 5>(4);
  const [builderName, setBuilderName] = React.useState('');
  const [builderEmblem, setBuilderEmblem] = React.useState('🦅');
  const [builderPlayers, setBuilderPlayers] = React.useState<
    { name: string; grade: '4' | '5' | '6'; isReserve?: boolean }[]
  >([
    { name: '', grade: '6' },
    { name: '', grade: '5' },
    { name: '', grade: '5' },
    { name: '', grade: '4' },
    { name: '', grade: '4', isReserve: false },
  ]);

  if (mode === 'how_to_play') {
    return (
      <section className="max-w-4xl mx-auto space-y-6">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
          <span className="text-xs font-semibold text-amber-400">
            ℹ️ دليل البطولة وقواعد اللعب — عباقرة عيون مصر
          </span>
          <h2 className="text-2xl font-bold text-white font-display">
            كيف نلعب في بطولة «عباقرة عيون مصر»؟
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            صُممت مسابقة عباقرة عيون مصر لطلاب الصفوف الرابع والخامس والسادس الابتدائي لتجمع بين المتعة، التفكير المنطقي، سرعة البديهة، والعمل الجماعي عبر ٣ مراحل كبرى:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-sm font-bold text-emerald-400">١. التصفيات الفردية 🌐</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يسجل الطالب اسمه وصفه وفصله ليحصل على كود مشاركة 🎟️، ويخوض اختباراً من ٥٠ سؤالاً في ٣٠ دقيقة موزعة على ٨ مجالات، ثم يحصل على «بطاقة العبقري» الرقمية.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-sm font-bold text-amber-400">٢. تكوين الفرق والقادة 🧩</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                يتأهل أفضل الطلاب لتكوين فرق رباعية (٤ طلاب أساسيين + لاعب احتياطي) لكل فريق اسم وشعار وقائد 🎤 يتحكم في كروت اللعب ومستويات المخاطرة.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-sm font-bold text-sky-400">٣. التحديات الـ١١ والبطولة 🏆</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                تتنافس الفرق في ألعاب: عين الصقر، سرعة البرق، مخ العباقرة، المعلومة الغامضة، تحدي المخاطرة، سرقة النقاط، الصندوق الأسود، ممنوع الكلام، مصر في دقيقة، وغرفة العباقرة!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (mode === 'teams') {
    return (
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-semibold text-amber-400">
              🧩 المرحلة الثانية: الفرق المتأهلة لبرنامج «عباقرة عيون مصر»
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              فرق عباقرة مدرسة عيون مصر (تكوين الفريق من ٤ أو ٥ لاعبين)
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer hover:bg-emerald-300"
            >
              {showBuilder ? '✕ إغلاق نافذة تكوين الفريق' : '+ تكوين فريق جديد (4 أو 5 لاعبين)'}
            </button>
            <button
              onClick={onStartGameArena}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer hover:bg-amber-300"
            >
              📺 دخول استوديو برنامج العباقرة
            </button>
          </div>
        </div>

        {/* Interactive 4 or 5 Player Team Builder directly on Teams Page */}
        {showBuilder && onCreateTeam && (
          <div className="p-6 rounded-2xl bg-[#162442] border-2 border-amber-400/70 space-y-5 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-display">
                  ✨ تكوين فريق جديد لخوض منافسات «عباقرة عيون مصر»
                </h3>
                <p className="text-xs text-slate-300">
                  اختر عدد لاعبي الفريق (٤ لاعبين أو ٥ لاعبين) وسجّل أسماءهم وصفوفهم الدراسية:
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setBuilderSize(4)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    builderSize === 4 ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
                  }`}
                >
                  👥 4 لاعبين
                </button>
                <button
                  type="button"
                  onClick={() => setBuilderSize(5)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    builderSize === 5 ? 'bg-amber-400 text-slate-950' : 'text-slate-300'
                  }`}
                >
                  🖐️ 5 لاعبين
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs text-slate-300 mb-1">اسم الفريق</label>
                <input
                  type="text"
                  value={builderName}
                  onChange={(e) => setBuilderName(e.target.value)}
                  placeholder="مثال: 🦅 فريق صقور عيون مصر"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">شعار الفريق</label>
                <input
                  type="text"
                  value={builderEmblem}
                  onChange={(e) => setBuilderEmblem(e.target.value)}
                  className="w-full px-3 py-2 text-center text-sm bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {builderPlayers.slice(0, builderSize).map((pl, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2"
                >
                  <div className="text-[11px] font-bold text-amber-300">
                    {idx === 0
                      ? '👑 اللاعب ١ (قائد الفريق)'
                      : idx === 4
                      ? '🌟 اللاعب ٥ (اللاعب الخامس)'
                      : `🎙️ اللاعب ${idx + 1}`}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={pl.name}
                      onChange={(e) => {
                        const next = [...builderPlayers];
                        next[idx] = { ...next[idx], name: e.target.value };
                        setBuilderPlayers(next);
                      }}
                      placeholder={`اسم اللاعب ${idx + 1}...`}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <select
                      value={pl.grade}
                      onChange={(e) => {
                        const next = [...builderPlayers];
                        next[idx] = {
                          ...next[idx],
                          grade: e.target.value as '4' | '5' | '6',
                        };
                        setBuilderPlayers(next);
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!builderName.trim()) return;
                  soundEngine.playFanfare();
                  const now = Date.now();
                  const membersList = builderPlayers.slice(0, builderSize).map((p, i) => ({
                    id: `tm-${now}-${i + 1}`,
                    name: p.name.trim() || `لاعب ${i + 1}`,
                    grade: p.grade,
                    isReserve: false,
                  }));
                  onCreateTeam({
                    id: `team-${now}`,
                    name: builderName.trim(),
                    emblem: builderEmblem || '🏆',
                    color: '#F59E0B',
                    captainId: membersList[0].id,
                    points: 100,
                    wins: 0,
                    matchesPlayed: 0,
                    titleBadge: '🌟 عباقرة عيون مصر',
                    cards: {
                      challengeCard: true,
                      swapQuestionCard: true,
                      doublePointsCard: true,
                    },
                    members: membersList,
                  });
                  setBuilderName('');
                  setShowBuilder(false);
                }}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
              >
                ✓ حفظ الفريق واعتماده ({builderSize} لاعبين)
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => {
            const captain = team.members.find((m) => m.id === team.captainId) || team.members[0];
            return (
              <div
                key={team.id}
                className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{team.emblem}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white font-display">{team.name}</h3>
                      <span className="text-xs text-amber-400">{team.titleBadge}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold font-mono-num text-amber-400">
                      {team.points}
                    </div>
                    <div className="text-[11px] text-slate-400">نقطة · {team.wins} انتصارات</div>
                  </div>
                </div>

                <div className="text-xs text-slate-300">
                  🎤 قائد الفريق: <strong className="text-amber-300">{captain?.name}</strong> (يتولى اختيار المجال، مستوى المخاطرة، واستخدام الكروت الخاصة)
                </div>

                <div className="space-y-1.5">
                  {team.members.map((m) => (
                    <div
                      key={m.id}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-white font-medium">{m.name}</span>
                      <span className="text-slate-400">
                        الصف {m.grade} الابتدائي {m.isReserve ? '· (احتياطي)' : '· (أساسي)'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-slate-400">🃏 الكروت المتاحة:</span>
                  <span className={team.cards.challengeCard ? 'text-emerald-400' : 'text-slate-600'}>
                    ● كارت التحدي
                  </span>
                  <span className={team.cards.swapQuestionCard ? 'text-sky-400' : 'text-slate-600'}>
                    ● كارت تبديل السؤال
                  </span>
                  <span className={team.cards.doublePointsCard ? 'text-amber-400' : 'text-slate-600'}>
                    ● كارت مضاعفة النقاط
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  if (mode === 'tournament') {
    return (
      <section className="space-y-8">
        <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-400">
              🏆 المرحلة النهائية: الأدوار الإقصائية لبطولة مدرسة عيون مصر
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              شجرة البطولة النهائية (نظام {settings.tournamentBracketSize} فرق → البطل)
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              ١٦ فريقاً ← ٨ فرق ← ٤ فرق ← فريقان ← 🏆 حامل كأس عباقرة عيون مصر
            </p>
          </div>
          <button
            onClick={onStartGameArena}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap"
          >
            ⚔️ بدء مواجهة النهائي الآن
          </button>
        </div>

        {/* Visual Bracket Progression */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Semi Finals */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 text-center">
              الدور نصف النهائي (٤ فرق)
            </div>
            <div className="p-4 rounded-xl bg-[#131F38] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-amber-400">
                <span>🔥 فريق النيل</span>
                <span className="font-mono-num">180</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>🦅 فريق الصقر</span>
                <span className="font-mono-num">150</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#131F38] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-sm font-bold text-sky-400">
                <span>⚡ فريق العباقرة</span>
                <span className="font-mono-num">170</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <span>🌟 فريق المستقبل</span>
                <span className="font-mono-num">145</span>
              </div>
            </div>
          </div>

          {/* Grand Final */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#17284A] to-[#131F38] border-2 border-amber-400/70 text-center space-y-4 shadow-xl">
            <div className="text-xs font-bold text-amber-400">⚔️ المباراة النهائية الكبرى</div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-400/50 flex items-center justify-between">
                <span className="font-bold text-white">{sortedTeams[0]?.name}</span>
                <span className="font-mono-num font-bold text-amber-400 text-lg">
                  {sortedTeams[0]?.points}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-bold">ضـــد</div>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-sky-400/50 flex items-center justify-between">
                <span className="font-bold text-white">{sortedTeams[1]?.name}</span>
                <span className="font-mono-num font-bold text-sky-400 text-lg">
                  {sortedTeams[1]?.points}
                </span>
              </div>
            </div>
          </div>

          {/* Champion Cup */}
          <div className="p-6 rounded-2xl bg-[#131F38] border border-emerald-400/50 text-center space-y-2">
            <div className="text-4xl">🏆</div>
            <div className="text-xs text-emerald-400 font-bold">المتصدر الحالي للبطولة</div>
            <h3 className="text-2xl font-bold text-white font-display">{sortedTeams[0]?.name}</h3>
            <p className="text-xs text-slate-300">
              برصيد <strong className="font-mono-num text-amber-400">{sortedTeams[0]?.points}</strong> نقطة
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ==================== LEADERBOARD & 10 AWARDS VIEW ====================
  const [selectedRadarTeamId, setSelectedRadarTeamId] = React.useState<string>(
    sortedTeams[0]?.id || teams[0]?.id || 'team-nile'
  );

  // Calculate skill averages and progress metrics for each team
  const teamAnalytics = sortedTeams.map((t, idx) => {
    const memberCount = Math.max(1, t.members.length);
    const avgPointsPerPlayer = Math.round(t.points / memberCount);

    // Match team members with student profiles or compute realistic skill averages
    const matchedStudents = students.filter(
      (s) =>
        s.teamId === t.id ||
        t.members.some((m) => m.name.includes(s.name.split(' ')[0]))
    );

    const baseOffset = Math.max(0, 12 - idx * 3);
    const avgSpeed = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.speedScore, 0) /
            matchedStudents.length
        )
      : Math.min(99, 84 + baseOffset);

    const avgLogic = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.logic, 0) /
            matchedStudents.length
        )
      : Math.min(99, 82 + baseOffset);

    const avgScience = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.science, 0) /
            matchedStudents.length
        )
      : Math.min(99, 85 + baseOffset);

    const avgCulture = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.general_culture, 0) /
            matchedStudents.length
        )
      : Math.min(99, 86 + baseOffset);

    const avgObservation = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.observation, 0) /
            matchedStudents.length
        )
      : Math.min(99, 83 + baseOffset);

    const avgMath = matchedStudents.length
      ? Math.round(
          matchedStudents.reduce((acc, s) => acc + s.scores.math, 0) /
            matchedStudents.length
        )
      : Math.min(99, 84 + baseOffset);

    const overallSkillAvg = Math.round(
      (avgSpeed + avgLogic + avgScience + avgCulture + avgObservation + avgMath) / 6
    );

    return {
      id: t.id,
      name: t.name,
      color: t.color || '#F59E0B',
      totalPoints: t.points,
      avgPointsPerPlayer,
      overallSkillAvg,
      avgSpeed,
      avgLogic,
      avgScience,
      avgCulture,
      avgObservation,
      avgMath,
    };
  });

  const activeRadarTeam =
    teamAnalytics.find((ta) => ta.id === selectedRadarTeamId) || teamAnalytics[0];
  const topLeaderTeam = teamAnalytics[0];

  const radarSkillsData = [
    {
      skill: '⚡ السرعة والبديهة',
      selectedTeam: activeRadarTeam?.avgSpeed || 85,
      leaderTeam: topLeaderTeam?.avgSpeed || 92,
      fullMark: 100,
    },
    {
      skill: '🧠 المنطق والذكاء',
      selectedTeam: activeRadarTeam?.avgLogic || 85,
      leaderTeam: topLeaderTeam?.avgLogic || 92,
      fullMark: 100,
    },
    {
      skill: '🌍 الثقافة والرياضة',
      selectedTeam: activeRadarTeam?.avgCulture || 85,
      leaderTeam: topLeaderTeam?.avgCulture || 92,
      fullMark: 100,
    },
    {
      skill: '🔬 العلوم والابتكار',
      selectedTeam: activeRadarTeam?.avgScience || 85,
      leaderTeam: topLeaderTeam?.avgScience || 92,
      fullMark: 100,
    },
    {
      skill: '👁️ قوة الملاحظة',
      selectedTeam: activeRadarTeam?.avgObservation || 85,
      leaderTeam: topLeaderTeam?.avgObservation || 92,
      fullMark: 100,
    },
    {
      skill: '➗ الحساب الذهني',
      selectedTeam: activeRadarTeam?.avgMath || 85,
      leaderTeam: topLeaderTeam?.avgMath || 92,
      fullMark: 100,
    },
  ];

  // Stage progression data across competition rounds
  const roundsProgressionData = [
    { round: '١. البداية' },
    { round: '٢. التصفيات' },
    { round: '٣. التحديات' },
    { round: '٤. نصف النهائي' },
    { round: '٥. الاستوديو الحالي' },
  ].map((r, rIdx) => {
    const row: Record<string, string | number> = { round: r.round };
    const ratio = [0.25, 0.48, 0.68, 0.85, 1][rIdx];
    teamAnalytics.forEach((ta) => {
      row[ta.name] = Math.round(ta.totalPoints * ratio);
    });
    return row;
  });

  return (
    <section className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-semibold text-amber-400">
          📊 لوحة الأبطال والتحليل الإحصائي — مدرسة عيون مصر
        </span>
        <h2 className="text-2xl font-bold text-white font-display mt-1">
          ترتيب الفرق المتنافسة، الرسوم البيانية للتقدم، وألقاب التميز العشرة
        </h2>
      </div>

      {!settings.showResultsDuringQualifiers ? (
        <div className="p-8 rounded-2xl bg-[#131F38] border border-slate-800 text-center text-sm text-slate-300">
          🔒 تم إخفاء النتائج مؤقتاً بواسطة المشرف أثناء سير التصفيات، وسيتم إعلانها فور انتهاء الجولة.
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sortedTeams.slice(0, 3).map((t, index) => {
              const medal = index === 0 ? '🥇 المركز الأول' : index === 1 ? '🥈 المركز الثاني' : '🥉 المركز الثالث';
              const analytics = teamAnalytics.find((a) => a.id === t.id);
              return (
                <div
                  key={t.id}
                  className={`p-6 rounded-2xl border ${
                    index === 0
                      ? 'bg-gradient-to-b from-[#1B2C52] to-[#131F38] border-amber-400 shadow-xl'
                      : 'bg-[#131F38] border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-amber-400">{medal}</span>
                    <span className="text-slate-400">{t.wins} انتصارات · ({t.members.length} لاعبين)</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">{t.name}</h3>
                  <div className="flex items-baseline justify-between mt-2">
                    <div className="text-2xl font-bold font-mono-num text-emerald-400">
                      {t.points} نقطة
                    </div>
                    <div className="text-xs font-mono-num text-sky-300">
                      متوسط اللاعب: {analytics?.avgPointsPerPlayer} نقطة
                    </div>
                  </div>
                  <div className="text-xs text-amber-300 mt-1">
                    اللقب: {t.titleBadge} · متوسط المهارات: {analytics?.overallSkillAvg}%
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                    {t.members.map((m) => (
                      <div key={m.id}>• {m.name} (صف {m.grade})</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ==================== 📈 RECHARTS TEAM ANALYTICS & PROGRESS SECTION ==================== */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  <span>التحليل البياني لمستوى تقدم الفرق ومتوسط المهارات</span>
                </span>
                <h3 className="text-xl font-bold text-white font-display mt-0.5">
                  📊 مؤشرات الأداء، متوسط النقاط، وبصمة المهارات لكل فريق
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Chart 1: Bar Chart of Total Points, Average Points per Player & Overall Skill Average */}
              <div className="lg:col-span-7 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white font-display">
                    ١. مقارنة إجمالي النقاط، متوسط نقاط اللاعب، ومتوسط المهارات (%)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يوضح الرسم البياني رصيد كل فريق مقارنة بمتوسط نقاط اللاعب الواحد ومتوسط إتقان المهارات الست
                  </p>
                </div>

                <div className="h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teamAnalytics}
                      margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis
                        dataKey="name"
                        stroke="#94A3B8"
                        tick={{ fill: '#E2E8F0', fontSize: 12 }}
                      />
                      <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
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
                        dataKey="totalPoints"
                        name="إجمالي نقاط الفريق"
                        fill="#F59E0B"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="overallSkillAvg"
                        name="متوسط المهارات (%)"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="avgPointsPerPlayer"
                        name="متوسط نقاط اللاعب"
                        fill="#38BDF8"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Interactive Radar Chart of the 6 Genius Skills per Team */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-white font-display">
                      ٢. رادار متوسط المهارات الست للفريق
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      اختر الفريق لمقارنة مهاراته مع متصدر البطولة:
                    </p>
                  </div>
                  <select
                    value={selectedRadarTeamId}
                    onChange={(e) => setSelectedRadarTeamId(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold bg-slate-950 border border-amber-400/60 rounded-xl text-white"
                  >
                    {teamAnalytics.map((ta) => (
                      <option key={ta.id} value={ta.id}>
                        {ta.name} (متوسط {ta.overallSkillAvg}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="h-72 w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="72%" data={radarSkillsData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: '#E2E8F0', fontSize: 11 }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: '#94A3B8', fontSize: 10 }}
                      />
                      <Radar
                        name={activeRadarTeam?.name || 'الفريق المختار'}
                        dataKey="selectedTeam"
                        stroke="#F59E0B"
                        fill="#F59E0B"
                        fillOpacity={0.45}
                      />
                      {activeRadarTeam?.id !== topLeaderTeam?.id && (
                        <Radar
                          name={`المتصدر (${topLeaderTeam?.name})`}
                          dataKey="leaderTeam"
                          stroke="#38BDF8"
                          fill="#38BDF8"
                          fillOpacity={0.2}
                        />
                      )}
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderColor: '#D4AF37',
                          borderRadius: '12px',
                          color: '#F8FAFC',
                          fontSize: '12px',
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Chart 3: Line Chart of Team Progress Across Competition Stages */}
            <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-base font-bold text-white font-display flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>٣. منحنى تطور نقاط الفرق عبر مراحل البطولة الخمس</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يتتبع مستوى صعود كل فريق من بوابة البداية والتصفيات وحتى مواجهات استوديو العباقرة المباشرة
                  </p>
                </div>
              </div>

              <div className="h-64 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={roundsProgressionData}
                    margin={{ top: 10, right: 25, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis
                      dataKey="round"
                      stroke="#94A3B8"
                      tick={{ fill: '#E2E8F0', fontSize: 12 }}
                    />
                    <YAxis stroke="#94A3B8" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#D4AF37',
                        borderRadius: '12px',
                        color: '#F8FAFC',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    {teamAnalytics.map((ta, i) => {
                      const strokeColors = ['#F59E0B', '#38BDF8', '#10B981', '#A855F7', '#EC4899'];
                      return (
                        <Line
                          key={ta.id}
                          type="monotone"
                          dataKey={ta.name}
                          stroke={strokeColors[i % strokeColors.length]}
                          strokeWidth={3}
                          dot={{ r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 10 Official Awards Grid (🏅 ألقاب وجوائز المسابقة) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-bold text-white font-display">
                🏅 ألقاب وجوائز التميز في «عباقرة عيون مصر»
              </h3>
              {onOpenAwardsPage && (
                <button
                  onClick={onOpenAwardsPage}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
                >
                  عرض صفحة الجوائز والفائزين الكاملة ←
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {awards.map((aw) => {
                const winnerStu =
                  aw.winnerType === 'student'
                    ? students.find((s) => s.id === aw.winnerId)?.name
                    : null;
                const winnerTeam =
                  aw.winnerType === 'team'
                    ? teams.find((t) => t.id === aw.winnerId)?.name
                    : null;
                const winnerLabel = winnerStu || winnerTeam;
                return (
                  <div
                    key={aw.id}
                    onClick={onOpenAwardsPage}
                    className="p-4 rounded-xl bg-[#131F38] border border-slate-800 hover:border-amber-400/50 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-2xl mb-1">{aw.icon}</div>
                      <div className="text-sm font-bold text-white font-display">{aw.title}</div>
                      <p className="text-[11px] text-slate-400 mt-1">{aw.desc}</p>
                    </div>
                    {winnerLabel && (
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-amber-400 font-bold truncate">
                        👑 {winnerLabel}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
