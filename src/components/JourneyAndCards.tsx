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
} from 'lucide-react';
import {
  StudentProfile,
  Team,
  MatchItem,
  CompetitionSettings,
  AppView,
  ChallengeGameId,
} from '../types/competition';
import { JOURNEY_NODES, OFFICIAL_AWARDS } from '../data/challengesData';
import { soundEngine } from '../utils/sound';

// ==================== 1. 🧭 JOURNEY MAP VIEW ====================
interface JourneyMapViewProps {
  unlockedIndex: number;
  onUnlockNextNode: () => void;
  onSelectNode: (targetView: AppView, gameTab?: ChallengeGameId) => void;
}

export const JourneyMapView: React.FC<JourneyMapViewProps> = ({
  unlockedIndex,
  onUnlockNextNode,
  onSelectNode,
}) => {
  return (
    <section className="space-y-6">
      <div className="p-6 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-amber-400">
            🧭 خريطة رحلة العباقرة التفاعلية — ٩ مدن ومحطات معرفية
          </span>
          <h2 className="text-2xl font-bold text-white font-display mt-1">
            رحلة التحديات من بوابة البداية حتى قاعة الأبطال
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            كل مرحلة تفتح لك أبواب المدينة التالية بعد خوض تحدياتها بنجاح!
          </p>
        </div>
        <button
          onClick={() => {
            soundEngine.playFanfare();
            onUnlockNextNode();
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap hover:bg-amber-300"
        >
          🔓 فتح المرحلة التالية للتجربة
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {JOURNEY_NODES.map((node, index) => {
          const isUnlocked = index <= unlockedIndex || Boolean(node.unlockedByDefault);
          return (
            <div
              key={node.id}
              className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-[#131F38] border-amber-400/50 shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/80 opacity-65'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="font-mono-num text-slate-400">المحطة 0{index + 1}</span>
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> مفتوحة الآن
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> مغلقة
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white font-display">{node.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{node.subtitle}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <button
                  disabled={!isUnlocked}
                  onClick={() => {
                    soundEngine.playSelectTile();
                    onSelectNode(node.targetView, node.gameTab);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                    isUnlocked
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{isUnlocked ? 'دخول المحطة وبدء التحدي' : 'أكمل المرحلة السابقة أولاً'}</span>
                </button>
              </div>
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

// ==================== 3. 🧩 TEAMS & 🏆 TOURNAMENT BRACKET & 📊 LEADERBOARD ====================
interface TournamentAndLeaderboardProps {
  mode: 'teams' | 'tournament' | 'leaderboard' | 'how_to_play';
  teams: Team[];
  students: StudentProfile[];
  matches: MatchItem[];
  settings: CompetitionSettings;
  onStartGameArena: () => void;
}

export const TournamentAndLeaderboard: React.FC<TournamentAndLeaderboardProps> = ({
  mode,
  teams,
  students,
  settings,
  onStartGameArena,
}) => {
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);

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
              🧩 المرحلة الثانية: الفرق المتأهلة للبطولة المدرسية
            </span>
            <h2 className="text-2xl font-bold text-white font-display mt-1">
              فرق عباقرة مدرسة عيون مصر (٤ طلاب أساسيين + احتياطي)
            </h2>
          </div>
          <button
            onClick={onStartGameArena}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap"
          >
            🎮 دخول ساحة الألعاب والتحديات
          </button>
        </div>

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
  return (
    <section className="space-y-8">
      <div className="border-b border-slate-800 pb-4">
        <span className="text-xs font-semibold text-amber-400">
          📊 لوحة الأبطال والترتيب العام — مدرسة عيون مصر
        </span>
        <h2 className="text-2xl font-bold text-white font-display mt-1">
          ترتيب الفرق المتنافسة وألقاب التميز العشرة
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
                    <span className="text-slate-400">{t.wins} انتصارات</span>
                  </div>
                  <h3 className="text-xl font-bold text-white font-display">{t.name}</h3>
                  <div className="text-2xl font-bold font-mono-num text-emerald-400 mt-2">
                    {t.points} نقطة
                  </div>
                  <div className="text-xs text-amber-300 mt-1">اللقب: {t.titleBadge}</div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-1">
                    {t.members.slice(0, 4).map((m) => (
                      <div key={m.id}>• {m.name}</div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 10 Official Awards Grid (🏅 ألقاب وجوائز المسابقة) */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white font-display">
              🏅 ألقاب وجوائز التميز في «عباقرة عيون مصر»
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {OFFICIAL_AWARDS.map((aw) => (
                <div
                  key={aw.id}
                  className="p-4 rounded-xl bg-[#131F38] border border-slate-800 flex flex-col justify-between"
                >
                  <div className="text-2xl mb-1">{aw.icon}</div>
                  <div className="text-sm font-bold text-white font-display">{aw.title}</div>
                  <p className="text-[11px] text-slate-400 mt-1">{aw.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
};
