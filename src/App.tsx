import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Siren,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AppView,
  ChallengeGameId,
  StudentProfile,
  Team,
  QualifierQuestion,
  CompetitionSettings,
  MatchItem,
  CompetitionAward,
} from './types/competition';
import {
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_TEAMS,
  INITIAL_SETTINGS,
  INITIAL_MATCHES,
  GENIUS_ALARM_QUESTIONS,
  OFFICIAL_AWARDS,
  JOURNEY_NODES,
} from './data/challengesData';
import { QualifiersAndPractice } from './components/QualifiersAndPractice';
import { GamesArenaHub } from './components/GamesArenaHub';
import { AdminDashboard, AdminSection } from './components/AdminDashboard';
import {
  JourneyMapView,
  GeniusCardView,
  TournamentAndLeaderboard,
  AwardsShowcaseView,
} from './components/JourneyAndCards';
import { soundEngine } from './utils/sound';

const STORAGE_STUDENTS = 'om_geniuses_students_v2';
const STORAGE_TEAMS = 'om_geniuses_teams_v2';
const STORAGE_SETTINGS = 'om_geniuses_settings_v2';
const STORAGE_CUSTOM_QS = 'om_geniuses_custom_qs_v2';
const STORAGE_AWARDS = 'om_geniuses_awards_v2';

const SUB_NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'home', label: '🏠 الرئيسية' },
  { id: 'games_hub', label: '📺 استوديو برنامج العباقرة' },
  { id: 'teams', label: '🧩 الفرق (4 أو 5 لاعبين)' },
  { id: 'qualifiers', label: '🟢 التصفيات الفردية' },
  { id: 'practice', label: '🧠 جرّب تدريباً' },
  { id: 'journey', label: '🧭 خريطة الرحلة' },
  { id: 'genius_card', label: '🪪 بطاقة العبقري' },
  { id: 'tournament', label: '🏆 البطولة النهائية' },
  { id: 'leaderboard', label: '📊 لوحة الأبطال' },
  { id: 'awards', label: '🏅 جوائز المسابقة' },
  { id: 'how_to_play', label: 'ℹ️ كيف نلعب؟' },
  { id: 'admin', label: '🛠️ لوحة المشرف' },
];

const STATION_CODES = [
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

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedGameTab, setSelectedGameTab] = useState<ChallengeGameId>('classic_board');
  const [adminInitialSection, setAdminInitialSection] = useState<AdminSection>('students');
  const [unlockedJourneyIdx, setUnlockedJourneyIdx] = useState<number>(2);
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

  const [awards, setAwards] = useState<CompetitionAward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AWARDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return OFFICIAL_AWARDS;
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_AWARDS, JSON.stringify(awards));
    } catch {}
  }, [awards]);

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

  const currentAlarmQ = GENIUS_ALARM_QUESTIONS[alarmIdx % GENIUS_ALARM_QUESTIONS.length];

  return (
    <div className="app-shell bg-[#0f0f12] text-[#f2efeb]">
      {/* ==================== ROW 1: LUXURY HEADER (Variation 2) ==================== */}
      <header className="px-6 sm:px-12 py-6 flex justify-between items-center border-b-[1.5px] border-[#f2efeb] no-print">
        <div
          onClick={() => setCurrentView('home')}
          className="font-syne text-2xl font-extrabold tracking-[-0.04em] text-[#d4af37] cursor-pointer"
        >
          OYOUN MISR
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {(
            [
              { id: 'home', label: 'الرئيسية' },
              { id: 'journey', label: 'رحلة العباقرة' },
              { id: 'qualifiers', label: 'التصفيات' },
              { id: 'games_hub', label: 'الألعاب' },
              { id: 'awards', label: 'الجوائز' },
              { id: 'admin', label: 'المشرف' },
            ] as { id: AppView; label: string }[]
          ).map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => {
                if (navItem.id === 'admin') setAdminInitialSection('students');
                setCurrentView(navItem.id);
              }}
              className={`bg-transparent border-none text-[0.8rem] font-bold cursor-pointer transition-colors ${
                currentView === navItem.id
                  ? 'text-[#f2efeb]'
                  : 'text-[rgba(242,239,235,0.6)] hover:text-[#f2efeb]'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            className="p-2 rounded-full border border-[rgba(242,239,235,0.2)] text-[rgba(242,239,235,0.75)] hover:text-[#d4af37] hover:border-[#d4af37] transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleTriggerAlarm}
            className="status-badge cursor-pointer hover:bg-[#d4af37] hover:text-[#0f0f12] transition-colors"
          >
            <span>🏆 عباقرة عيون مصر</span>
          </button>
        </div>
      </header>

      {/* ==================== ROW 2: SUB-NAV STRIP (Variation 2) ==================== */}
      <div className="px-6 sm:px-12 py-3 bg-[rgba(242,239,235,0.1)] flex items-center gap-4 overflow-x-auto no-print">
        {SUB_NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'admin') setAdminInitialSection('students');
                setCurrentView(item.id);
              }}
              className={`whitespace-nowrap bg-transparent px-4 py-1.5 rounded text-[0.72rem] cursor-pointer transition-all border ${
                isActive
                  ? 'border-[#d4af37] text-[#d4af37] font-bold bg-[#0f0f12]/60'
                  : 'border-transparent text-[rgba(242,239,235,0.6)] hover:border-[rgba(242,239,235,0.15)] hover:text-[#f2efeb]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#0f0f12] border border-[#d4af37] text-[#d4af37] px-5 py-3 rounded shadow-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ==================== ROW 3: MAIN CONTENT AREA ==================== */}
      {currentView === 'home' ? (
        /* Variation 2 Split 2-Column Main Layout for Home */
        <main className="grid grid-cols-1 lg:grid-cols-[1.45fr_1fr] gap-8 p-6 sm:p-12 overflow-y-auto items-center">
          {/* Left/Right Column 1: Hero Editorial Section */}
          <section className="flex flex-col justify-center">
            <span className="label mb-3">Primary Competition 2026 · Grades 4, 5 & 6</span>
            <h1
              className="font-syne font-extrabold text-[#f2efeb] mb-6"
              style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
              }}
            >
              عباقرة عيون مصر
            </h1>
            <p className="hero-tagline mb-6">
              «فكّر أسرع… اعرف أكثر… العب كفريق!»
            </p>
            <p className="max-w-[520px] leading-[1.7] text-[rgba(242,239,235,0.6)] mb-10 text-sm sm:text-base">
              مرحباً بك في البطولة التفاعلية الكبرى لطلاب المرحلة الابتدائية العليا بمدرسة عيون مصر! رحلة مشوقة تجمع بين المعرفة، سرعة البديهة، التفكير المنطقي، دقة الملاحظة، والعمل الجماعي.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  soundEngine.playBuzzer();
                  setSelectedGameTab('classic_board');
                  setCurrentView('games_hub');
                }}
                className="btn btn-primary"
              >
                📺 استوديو برنامج العباقرة
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('teams');
                }}
                className="btn btn-secondary"
              >
                🧩 تكوين فريق (4 أو 5 لاعبين)
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('qualifiers');
                }}
                className="btn btn-secondary"
              >
                🟢 التصفيات الفردية
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('practice');
                }}
                className="btn btn-secondary"
              >
                🧠 جرّب تدريباً
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className="btn btn-secondary"
              >
                🏆 لوحة الأبطال
              </button>
              <button
                onClick={() => setCurrentView('awards')}
                className="btn btn-secondary"
              >
                🏅 جوائز المسابقة
              </button>
            </div>
          </section>

          {/* Column 2: Grid of Stations (1px Hairline Border Matrix) */}
          <section className="stations-grid">
            {JOURNEY_NODES.slice(0, 6).map((node, index) => {
              const isUnlocked = index <= unlockedJourneyIdx || Boolean(node.unlockedByDefault);
              const codeNum = String(index + 1).padStart(2, '0');
              const codeLabel = isUnlocked ? STATION_CODES[index] : 'LOCKED';

              return (
                <div
                  key={node.id}
                  className={`station-card ${!isUnlocked ? 'locked' : ''}`}
                >
                  <span className="label">
                    [{codeNum}] {codeLabel}
                  </span>
                  <h3>{node.title}</h3>
                  <p>{node.subtitle}</p>
                  {isUnlocked && (
                    <button
                      onClick={() => {
                        soundEngine.playSelectTile();
                        if (node.gameTab) setSelectedGameTab(node.gameTab);
                        setCurrentView(node.targetView);
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
          </section>
        </main>
      ) : (
        /* Inner Views Container */
        <main className="p-6 sm:p-12 overflow-y-auto">
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

          {currentView === 'genius_card' && activeStudent && (
            <GeniusCardView
              student={activeStudent}
              allStudents={students}
              onSelectStudent={(s) => setActiveStudent(s)}
            />
          )}

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

          {currentView === 'awards' && (
            <AwardsShowcaseView
              awards={awards}
              students={students}
              teams={teams}
              onGoToAdminAwards={() => {
                setAdminInitialSection('awards');
                setCurrentView('admin');
              }}
            />
          )}

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
              awards={awards}
              onStartGameArena={() => {
                setSelectedGameTab('classic_board');
                setCurrentView('games_hub');
              }}
              onOpenAwardsPage={() => setCurrentView('awards')}
              onCreateTeam={(newTeam) => {
                setTeams((prev) => [newTeam, ...prev]);
                setToast(`تم إنشاء ${newTeam.name} (${newTeam.members.length} لاعبين) بنجاح!`);
                setTimeout(() => setToast(null), 3500);
              }}
            />
          )}

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
              awards={awards}
              setAwards={setAwards}
              initialSection={adminInitialSection}
              onTriggerGeniusAlarm={handleTriggerAlarm}
            />
          )}
        </main>
      )}

      {/* ==================== ROW 4: LUXURY FOOTER (Variation 2) ==================== */}
      <footer className="border-t border-[rgba(242,239,235,0.1)] px-6 sm:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 no-print">
        <div className="label">© 2026 OYOUN MISR SCHOOL - GENIUS COMPETITION</div>
        <div className="label">DEVELOPED FOR EXCELLENCE</div>
      </footer>

      {/* ==================== 🚨 GENIUS ALARM GLOBAL MODAL ==================== */}
      {alarmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0f0f12] border-2 border-[#d4af37] p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(242,239,235,0.1)] pb-4">
              <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm">
                <Siren className="w-5 h-5" />
                <span>{currentAlarmQ.title}</span>
              </div>
              <span className="status-badge">
                +{currentAlarmQ.doublePoints} نقطة مضاعفة
              </span>
            </div>

            <div className="text-xs text-[rgba(242,239,235,0.6)]">
              تتنافس جميع الفرق في اللحظة نفسها! حدد الفريق الأسرع في الإجابة الصحيحة لمنحه النقاط المضاعفة:
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAlarmWinnerTeamId(t.id)}
                  className={`px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer ${
                    alarmWinnerTeamId === t.id
                      ? 'bg-[#d4af37] text-[#0f0f12] border-[#d4af37]'
                      : 'bg-transparent text-[#f2efeb] border-[rgba(242,239,235,0.2)]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <h3 className="text-xl font-bold text-[#f2efeb] font-display leading-relaxed">
              {currentAlarmQ.question}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentAlarmQ.options.map((opt, idx) => {
                const isCorrect = idx === currentAlarmQ.correctIndex;
                const isChosen = alarmSelectedOpt === idx;
                let cls = 'bg-[#141418] border-[rgba(242,239,235,0.15)] text-[#f2efeb] hover:border-[#d4af37]';
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
                    className={`p-4 border text-right text-sm cursor-pointer ${cls}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[rgba(242,239,235,0.1)]">
              <button
                onClick={() => {
                  setAlarmIdx((i) => i + 1);
                  setAlarmSelectedOpt(null);
                }}
                className="text-xs text-[#d4af37] hover:underline cursor-pointer"
              >
                سؤال إنذار آخر ←
              </button>
              <button
                onClick={() => setAlarmOpen(false)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1.2rem' }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
