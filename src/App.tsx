import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Share2,
  CheckCircle2,
  Siren,
  Rocket,
  Brain,
  Trophy,
  Info,
  Compass,
  Gamepad2,
  Users,
  Settings,
  IdCard,
  Sparkles,
} from 'lucide-react';
import {
  AppView,
  ChallengeGameId,
  StudentProfile,
  Team,
  QualifierQuestion,
  CompetitionSettings,
  MatchItem,
} from './types/competition';
import {
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_TEAMS,
  INITIAL_SETTINGS,
  INITIAL_MATCHES,
  GENIUS_ALARM_QUESTIONS,
} from './data/challengesData';
import { QualifiersAndPractice } from './components/QualifiersAndPractice';
import { GamesArenaHub } from './components/GamesArenaHub';
import { AdminDashboard } from './components/AdminDashboard';
import {
  JourneyMapView,
  GeniusCardView,
  TournamentAndLeaderboard,
} from './components/JourneyAndCards';
import { soundEngine } from './utils/sound';

import heroArenaImg from './assets/images/oyoun_misr_arena_hero_1791274244399.jpg';
import schoolCrestImg from './assets/images/school_crest_emblem_1791274256508.jpg';

const STORAGE_STUDENTS = 'om_geniuses_students_v2';
const STORAGE_TEAMS = 'om_geniuses_teams_v2';
const STORAGE_SETTINGS = 'om_geniuses_settings_v2';
const STORAGE_CUSTOM_QS = 'om_geniuses_custom_qs_v2';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedGameTab, setSelectedGameTab] = useState<ChallengeGameId>('falcon_eye');
  const [unlockedJourneyIdx, setUnlockedJourneyIdx] = useState<number>(3);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // Persistent State
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEMO_STUDENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TEAMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEMO_TEAMS;
  });

  const [settings, setSettings] = useState<CompetitionSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SETTINGS;
  });

  const [customQuestions, setCustomQuestions] = useState<QualifierQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOM_QS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [matches, setMatches] = useState<MatchItem[]>(INITIAL_MATCHES);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(students[0] || null);

  // 🚨 Genius Alarm Modal State
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmIdx, setAlarmIdx] = useState(0);
  const [alarmSelectedOpt, setAlarmSelectedOpt] = useState<number | null>(null);
  const [alarmWinnerTeamId, setAlarmWinnerTeamId] = useState<string>(teams[0]?.id || 'team-nile');

  useEffect(() => {
    soundEngine.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STUDENTS, JSON.stringify(students));
    } catch {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEAMS, JSON.stringify(teams));
    } catch {}
  }, [teams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CUSTOM_QS, JSON.stringify(customQuestions));
    } catch {}
  }, [customQuestions]);

  const handleAwardTeamPoints = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              points: Math.max(0, t.points + delta),
              wins: delta > 0 ? t.wins + 1 : t.wins,
            }
          : t
      )
    );
  };

  const handleUseTeamCard = (
    teamId: string,
    cardKey: 'challengeCard' | 'swapQuestionCard' | 'doublePointsCard'
  ) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, cards: { ...t.cards, [cardKey]: false } } : t
      )
    );
  };

  const handleTriggerAlarm = () => {
    soundEngine.playBuzzer();
    setAlarmSelectedOpt(null);
    setAlarmOpen(true);
  };

  const handleShareLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setToast('تم نسخ رابط موقع «عباقرة عيون مصر» لمشاركته على الهاتف والكمبيوتر والتابلت!');
        setTimeout(() => setToast(null), 3500);
      });
    }
  };

  const currentAlarmQ = GENIUS_ALARM_QUESTIONS[alarmIdx % GENIUS_ALARM_QUESTIONS.length];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120] text-[#F8FAFC]">
      {/* ==================== TOP BAR CONTRACT (3 ZONES) ==================== */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800/80 no-print">
        {/* Zone 1: Brand Title */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            setCurrentView('home');
          }}
          className="text-xl font-bold tracking-tight text-amber-400 font-display whitespace-nowrap"
        >
          🏆 عباقرة عيون مصر
        </a>

        {/* Zone 2: 6 Single-line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            onClick={() => setCurrentView('home')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'home'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setCurrentView('journey')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'journey'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            رحلة العباقرة
          </button>
          <button
            onClick={() => setCurrentView('qualifiers')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'qualifiers'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            التصفيات (50 س)
          </button>
          <button
            onClick={() => setCurrentView('games_hub')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'games_hub'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            الألعاب والتحديات
          </button>
          <button
            onClick={() => setCurrentView('leaderboard')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'leaderboard'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            لوحة الأبطال
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`py-1 whitespace-nowrap border-b-2 transition-colors ${
              currentView === 'admin'
                ? 'text-white border-amber-400 font-bold'
                : 'border-transparent hover:text-white'
            }`}
          >
            لوحة المشرف
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="px-3 py-2 text-xs font-medium text-slate-200 bg-slate-800/90 border border-slate-700 rounded-lg hover:bg-slate-700 whitespace-nowrap flex items-center gap-1.5"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {soundEnabled ? '🔊 الصوت مفعل' : '🔇 صامت'}
            </span>
          </button>

          <button
            onClick={handleTriggerAlarm}
            className="px-3.5 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <Siren className="w-4 h-4" />
            <span className="hidden sm:inline">إنذار العباقرة</span>
          </button>
        </div>
      </header>

      {/* Secondary Quick Access Strip for Mobile & Sub-views */}
      <div className="bg-[#111C35] border-b border-slate-800/80 px-4 py-2 no-print">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            {(
              [
                { id: 'home', label: '🏠 الرئيسية' },
                { id: 'journey', label: '🧭 خريطة الرحلة' },
                { id: 'qualifiers', label: '🟢 التصفيات الفردية' },
                { id: 'practice', label: '🧠 جرّب تدريباً' },
                { id: 'genius_card', label: '🪪 بطاقة العبقري' },
                { id: 'teams', label: '🧩 الفرق والقادة' },
                { id: 'games_hub', label: '🎮 الألعاب الـ11' },
                { id: 'tournament', label: '🏆 البطولة النهائية' },
                { id: 'leaderboard', label: '📊 لوحة الأبطال' },
                { id: 'how_to_play', label: 'ℹ️ كيف نلعب؟' },
                { id: 'admin', label: '🛠️ لوحة المشرف' },
              ] as { id: AppView; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  currentView === item.id
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ==================== MAIN CONTENT AREA ==================== */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ==================== 🏠 HOME VIEW ==================== */}
        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Hero Banner */}
            <section className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-l from-[#0B1120] via-[#0B1120]/85 to-[#0B1120]/95 z-10" />
              <img
                src={heroArenaImg}
                alt="مسرح بطولة عباقرة عيون مصر"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
              />

              <div className="relative z-20 p-6 sm:p-10 lg:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold">
                      <span>مدرسة عيون مصر · الصفوف الرابع والخامس والسادس الابتدائي</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={schoolCrestImg}
                        alt="شعار مدرسة عيون مصر"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-amber-400/60 object-cover shrink-0"
                      />
                      <div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-white font-display tracking-tight">
                          🏆 عباقرة عيون مصر
                        </h1>
                        <p className="text-lg sm:text-2xl font-bold text-amber-400 font-display mt-1">
                          «فكّر أسرع… اعرف أكثر… العب كفريق!»
                        </p>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
                      مرحباً بك في البطولة التفاعلية الكبرى لطلاب المرحلة الابتدائية العليا بمدرسة عيون مصر! رحلة مشوقة تجمع بين المعرفة، سرعة البديهة، التفكير المنطقي، دقة الملاحظة، والعمل الجماعي عبر الهاتف أو الكمبيوتر أو التابلت.
                    </p>

                    {/* Primary 4 Required Hero Action Buttons + Journey Map */}
                    <div className="pt-2 flex flex-wrap items-center gap-3.5">
                      <button
                        onClick={() => {
                          soundEngine.playBuzzer();
                          setCurrentView('qualifiers');
                        }}
                        className="px-6 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 transition-all shadow-lg flex items-center gap-2"
                      >
                        <span>🎮 ابدأ المسابقة</span>
                      </button>

                      <button
                        onClick={() => {
                          soundEngine.playSelectTile();
                          setCurrentView('practice');
                        }}
                        className="px-5 py-3.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm hover:bg-emerald-400 transition-all flex items-center gap-2"
                      >
                        <span>🧠 جرّب تدريباً</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('leaderboard')}
                        className="px-5 py-3.5 rounded-xl bg-[#162647] border border-amber-400/50 text-white font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2"
                      >
                        <span>🏆 لوحة الأبطال</span>
                      </button>

                      <button
                        onClick={() => setCurrentView('how_to_play')}
                        className="px-5 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-200 font-semibold text-sm hover:text-white hover:border-slate-500 transition-all flex items-center gap-2"
                      >
                        <span>ℹ️ كيف نلعب؟</span>
                      </button>

                      <button
                        onClick={handleShareLink}
                        className="px-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sky-300 text-xs font-semibold hover:text-white flex items-center gap-1.5"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>مشاركة رابط الموقع</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Symbols of Intelligence & Knowledge */}
                  <div className="lg:col-span-4 grid grid-cols-2 gap-3">
                    {[
                      { icon: '💡', title: 'مصباح الفكرة', sub: 'المعلومة الغامضة والابتكار' },
                      { icon: '🧩', title: 'قطع الألغاز', sub: 'مخ العباقرة والاستنتاج' },
                      { icon: '👁️', title: 'عين الصقر', sub: 'قوة الملاحظة والذاكرة' },
                      { icon: '🌍', title: 'مصر والكواكب', sub: 'العلوم والحضارة المصرية' },
                      { icon: '➗', title: 'الأرقام والأنماط', sub: 'سرعة البرق والحساب الذهني' },
                      { icon: '⭐', title: 'نجمة البطولة', sub: 'غرفة الأسرار وكأس العباقرة' },
                    ].map((card) => (
                      <div
                        key={card.title}
                        onClick={() => setCurrentView('games_hub')}
                        className="p-4 rounded-2xl bg-slate-900/85 border border-slate-800 hover:border-amber-400/60 transition-all cursor-pointer"
                      >
                        <div className="text-2xl mb-1">{card.icon}</div>
                        <div className="text-xs font-bold text-white font-display">{card.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{card.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Interactive Preview of the Journey Map on Home Page */}
            <JourneyMapView
              unlockedIndex={unlockedJourneyIdx}
              onUnlockNextNode={() =>
                setUnlockedJourneyIdx((prev) => Math.min(8, prev + 1))
              }
              onSelectNode={(target, gameTab) => {
                if (gameTab) setSelectedGameTab(gameTab);
                setCurrentView(target);
              }}
            />
          </div>
        )}

        {/* ==================== 🧭 JOURNEY VIEW ==================== */}
        {currentView === 'journey' && (
          <JourneyMapView
            unlockedIndex={unlockedJourneyIdx}
            onUnlockNextNode={() =>
              setUnlockedJourneyIdx((prev) => Math.min(8, prev + 1))
            }
            onSelectNode={(target, gameTab) => {
              if (gameTab) setSelectedGameTab(gameTab);
              setCurrentView(target);
            }}
          />
        )}

        {/* ==================== 🟢 QUALIFIERS (50 Qs) & 🧠 PRACTICE (10 Qs) ==================== */}
        {(currentView === 'qualifiers' || currentView === 'practice') && (
          <QualifiersAndPractice
            mode={currentView === 'qualifiers' ? 'qualifier' : 'practice'}
            settings={settings}
            students={students}
            onRegisterStudent={(newStu) => setStudents((prev) => [newStu, ...prev])}
            onCompleteQualifier={(stuId, updated) => {
              setStudents((prev) =>
                prev.map((s) => (s.id === stuId ? updated : s))
              );
              setUnlockedJourneyIdx((prev) => Math.max(prev, 5));
            }}
            onNavigateView={(v) => setCurrentView(v)}
            activeStudent={activeStudent}
            setActiveStudent={setActiveStudent}
            customQuestions={customQuestions}
          />
        )}

        {/* ==================== 🪪 GENIUS CARD VIEW ==================== */}
        {currentView === 'genius_card' && activeStudent && (
          <GeniusCardView
            student={activeStudent}
            allStudents={students}
            onSelectStudent={(s) => setActiveStudent(s)}
          />
        )}

        {/* ==================== 🎮 11 GAMES & CHALLENGES HUB ==================== */}
        {currentView === 'games_hub' && (
          <GamesArenaHub
            initialGameTab={selectedGameTab}
            teams={teams}
            onAwardTeamPoints={handleAwardTeamPoints}
            onUseTeamCard={handleUseTeamCard}
            settings={settings}
            onTriggerGeniusAlarm={handleTriggerAlarm}
          />
        )}

        {/* ==================== 🧩 TEAMS / 🏆 TOURNAMENT / 📊 LEADERBOARD / ℹ️ HOW TO PLAY ==================== */}
        {(currentView === 'teams' ||
          currentView === 'tournament' ||
          currentView === 'leaderboard' ||
          currentView === 'how_to_play') && (
          <TournamentAndLeaderboard
            mode={currentView}
            teams={teams}
            students={students}
            matches={matches}
            settings={settings}
            onStartGameArena={() => setCurrentView('games_hub')}
          />
        )}

        {/* ==================== 🛠️ ADMIN DASHBOARD ==================== */}
        {currentView === 'admin' && (
          <AdminDashboard
            students={students}
            setStudents={setStudents}
            teams={teams}
            setTeams={setTeams}
            customQuestions={customQuestions}
            setCustomQuestions={setCustomQuestions}
            settings={settings}
            setSettings={setSettings}
            matches={matches}
            setMatches={setMatches}
            onTriggerGeniusAlarm={handleTriggerAlarm}
          />
        )}
      </main>

      {/* ==================== 🚨 GENIUS ALARM GLOBAL MODAL ==================== */}
      {alarmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl bg-[#161F35] border-2 border-rose-500 p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Siren className="w-5 h-5" />
                <span>{currentAlarmQ.title}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                +{currentAlarmQ.doublePoints} نقطة مضاعفة!
              </span>
            </div>

            <div className="text-xs text-slate-300">
              تتنافس جميع الفرق في اللحظة نفسها! حدد الفريق الأسرع في الإجابة الصحيحة لمنحه النقاط المضاعفة:
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAlarmWinnerTeamId(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border ${
                    alarmWinnerTeamId === t.id
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <h3 className="text-xl font-bold text-white font-display leading-relaxed">
              {currentAlarmQ.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentAlarmQ.options.map((opt, idx) => {
                const isCorrect = idx === currentAlarmQ.correctIndex;
                const isChosen = alarmSelectedOpt === idx;
                let cls = 'bg-slate-900 border-slate-700 text-white hover:border-amber-400';
                if (alarmSelectedOpt !== null) {
                  if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                  else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                }
                return (
                  <button
                    key={idx}
                    disabled={alarmSelectedOpt !== null}
                    onClick={() => {
                      setAlarmSelectedOpt(idx);
                      if (isCorrect) {
                        soundEngine.playFanfare();
                        handleAwardTeamPoints(alarmWinnerTeamId, currentAlarmQ.doublePoints);
                      } else {
                        soundEngine.playWrong();
                      }
                    }}
                    className={`p-4 rounded-xl border text-right text-sm ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setAlarmIdx((i) => i + 1);
                  setAlarmSelectedOpt(null);
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                سؤال إنذار آخر ←
              </button>
              <button
                onClick={() => setAlarmOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700"
              >
                إغلاق الإنذار
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-auto border-t border-slate-800/80 py-5 px-6 text-center text-xs text-slate-400 no-print">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>🏆 عباقرة عيون مصر — مسابقة الذكاء والمعرفة لطلاب الصفوف الرابع والخامس والسادس الابتدائي</span>
          <span>«فكّر أسرع… اعرف أكثر… العب كفريق!» · تطبيق ويب تفاعلي متوافق مع الهاتف والكمبيوتر والتابلت</span>
        </div>
      </footer>
    </div>
  );
}
