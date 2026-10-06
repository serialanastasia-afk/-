import React, { useState, useEffect } from 'react';
import {
  Eye,
  Zap,
  Brain,
  FlaskConical,
  Target,
  Flame,
  Package,
  Drama,
  Siren,
  Flag,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Grid,
} from 'lucide-react';
import { ChallengeGameId, Team, CompetitionSettings } from '../types/competition';
import {
  FALCON_EYE_CHALLENGES,
  LIGHTNING_QUESTIONS,
  GENIUS_BRAIN_PUZZLES,
  MYSTERY_FACT_CHALLENGES,
  RISK_QUESTIONS,
  MYSTERY_BOXES,
  CHARADES_CARDS,
  EGYPT_IN_A_MINUTE_TOPICS,
  ESCAPE_ROOM_STAGES,
} from '../data/challengesData';
import { CATEGORIES, INITIAL_QUESTIONS } from '../data/questions';
import { soundEngine } from '../utils/sound';

interface GamesArenaHubProps {
  initialGameTab?: ChallengeGameId;
  teams: Team[];
  onAwardTeamPoints: (teamId: string, deltaPoints: number) => void;
  onUseTeamCard: (teamId: string, cardKey: 'challengeCard' | 'swapQuestionCard' | 'doublePointsCard') => void;
  settings: CompetitionSettings;
  onTriggerGeniusAlarm: () => void;
}

const GAME_TABS: { id: ChallengeGameId; label: string; icon: string; shortDesc: string }[] = [
  { id: 'falcon_eye', label: '👁️ عين الصقر', icon: '👁️', shortDesc: 'ملاحظة الصورة في ٥ ثوانٍ قبل اختفائها' },
  { id: 'lightning_speed', label: '⚡ سرعة البرق', icon: '⚡', shortDesc: 'نقاط إضافية كلما أجبت أسرع' },
  { id: 'genius_brain', label: '🧠 مخ العباقرة', icon: '🧠', shortDesc: 'ألغاز تفكير واستنتاج وعلاقات منطقية' },
  { id: 'mystery_fact', label: '🔬 المعلومة الغامضة', icon: '🔬', shortDesc: 'تعلم معلومة جديدة واستنتج الحل فوراً' },
  { id: 'risk_challenge', label: '🎯 تحدي المخاطرة', icon: '🎯', shortDesc: 'اختر ١٠ أو ٢٠ أو ٣٠ أو ٥٠ نقطة قبل السؤال' },
  { id: 'point_steal', label: '🔥 سرقة النقاط', icon: '🔥', shortDesc: 'اقنص نقاط السؤال إذا أخطأ الفريق المنافس' },
  { id: 'mystery_box', label: '📦 الصندوق الغامض', icon: '📦', shortDesc: '٥ صناديق مفاجآت بينها الصندوق الأسود' },
  { id: 'no_talking', label: '🎭 ممنوع الكلام', icon: '🎭', shortDesc: 'تمثيل صامت بالإشارات فقط خلال ٦٠ ثانية' },
  { id: 'egypt_minute', label: '🇪🇬 مصر في دقيقة', icon: '🇪🇬', shortDesc: 'اذكر أكبر عدد من عناصر مصر في ٦٠ ثانية' },
  { id: 'escape_room', label: '🔐 غرفة العباقرة', icon: '🔐', shortDesc: 'حل ٣ ألغاز متتالية لفتح رمز الخروج' },
  { id: 'classic_board', label: '🏛️ لوحة المجالات', icon: '🏛️', shortDesc: 'لوحة العباقرة الكلاسيكية للمواجهات المباشرة' },
];

export const GamesArenaHub: React.FC<GamesArenaHubProps> = ({
  initialGameTab = 'falcon_eye',
  teams,
  onAwardTeamPoints,
  onUseTeamCard,
  settings,
  onTriggerGeniusAlarm,
}) => {
  const [activeGame, setActiveGame] = useState<ChallengeGameId>(initialGameTab);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-nile');
  const [rivalTeamId, setRivalTeamId] = useState<string>(teams[1]?.id || 'team-geniuses');
  const [doubleCardActive, setDoubleCardActive] = useState(false);

  useEffect(() => {
    if (initialGameTab) setActiveGame(initialGameTab);
  }, [initialGameTab]);

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const rivalTeam = teams.find((t) => t.id === rivalTeamId) || teams[1] || teams[0];

  const awardWithMultiplier = (teamId: string, pts: number) => {
    const finalPts = doubleCardActive ? pts * 2 : pts;
    onAwardTeamPoints(teamId, finalPts);
    if (doubleCardActive) setDoubleCardActive(false);
  };

  // ==================== 1. 👁️ FALCON EYE STATE ====================
  const [feIndex, setFeIndex] = useState(0);
  const [fePhase, setFePhase] = useState<'ready' | 'showing' | 'question' | 'done'>('ready');
  const [feTimer, setFeTimer] = useState(5);
  const [feSelected, setFeSelected] = useState<number | null>(null);

  useEffect(() => {
    if (fePhase !== 'showing') return;
    if (feTimer <= 0) {
      setFePhase('question');
      soundEngine.playBuzzer();
      return;
    }
    const t = setTimeout(() => setFeTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [fePhase, feTimer]);

  const currentFalcon = FALCON_EYE_CHALLENGES[feIndex % FALCON_EYE_CHALLENGES.length];

  // ==================== 2. ⚡ LIGHTNING SPEED STATE ====================
  const [ltIndex, setLtIndex] = useState(0);
  const [ltRunning, setLtRunning] = useState(false);
  const [ltTimeLeft, setLtTimeLeft] = useState(15);
  const [ltAnswered, setLtAnswered] = useState<number | null>(null);

  useEffect(() => {
    if (!ltRunning || ltAnswered !== null) return;
    if (ltTimeLeft <= 0) {
      setLtRunning(false);
      soundEngine.playWrong();
      return;
    }
    const t = setTimeout(() => setLtTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [ltRunning, ltTimeLeft, ltAnswered]);

  const currentLightning = LIGHTNING_QUESTIONS[ltIndex % LIGHTNING_QUESTIONS.length];

  // ==================== 3. 🧠 GENIUS BRAIN STATE ====================
  const [gbIndex, setGbIndex] = useState(0);
  const [gbSelected, setGbSelected] = useState<number | null>(null);
  const [gbShowHint, setGbShowHint] = useState(false);
  const currentBrain = GENIUS_BRAIN_PUZZLES[gbIndex % GENIUS_BRAIN_PUZZLES.length];

  // ==================== 4. 🔬 MYSTERY FACT STATE ====================
  const [mfIndex, setMfIndex] = useState(0);
  const [mfSelected, setMfSelected] = useState<number | null>(null);
  const currentMysteryFact = MYSTERY_FACT_CHALLENGES[mfIndex % MYSTERY_FACT_CHALLENGES.length];

  // ==================== 5 & 6. 🎯 RISK CHALLENGE & 🔥 POINT STEAL STATE ====================
  const [riskTier, setRiskTier] = useState<10 | 20 | 30 | 50 | null>(null);
  const [riskSelected, setRiskSelected] = useState<number | null>(null);
  const [stealModeActive, setStealModeActive] = useState(false);
  const [stealTimeLeft, setStealTimeLeft] = useState(10);
  const [stealSelected, setStealSelected] = useState<number | null>(null);

  useEffect(() => {
    if (!stealModeActive || stealSelected !== null) return;
    if (stealTimeLeft <= 0) {
      setStealModeActive(false);
      return;
    }
    const t = setTimeout(() => setStealTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [stealModeActive, stealTimeLeft, stealSelected]);

  const currentRiskQ = RISK_QUESTIONS.find((r) => r.tier === riskTier) || RISK_QUESTIONS[0];

  // ==================== 7. 📦 MYSTERY BOX STATE ====================
  const [openedBoxId, setOpenedBoxId] = useState<string | null>(null);
  const [boxAnswerIdx, setBoxAnswerIdx] = useState<number | null>(null);
  const currentBox = MYSTERY_BOXES.find((b) => b.id === openedBoxId);

  // ==================== 8. 🎭 NO TALKING (CHARADES) STATE ====================
  const [charadeIdx, setCharadeIdx] = useState(0);
  const [charadeTimer, setCharadeTimer] = useState(60);
  const [charadeRunning, setCharadeRunning] = useState(false);
  const [charadeRevealed, setCharadeRevealed] = useState(false);

  useEffect(() => {
    if (!charadeRunning) return;
    if (charadeTimer <= 0) {
      setCharadeRunning(false);
      soundEngine.playWrong();
      return;
    }
    const t = setTimeout(() => setCharadeTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [charadeRunning, charadeTimer]);

  const currentCharade = CHARADES_CARDS[charadeIdx % CHARADES_CARDS.length];

  // ==================== 10. 🇪🇬 EGYPT IN A MINUTE STATE ====================
  const [egmTopicIdx, setEgmTopicIdx] = useState(0);
  const [egmTimer, setEgmTimer] = useState(60);
  const [egmRunning, setEgmRunning] = useState(false);
  const [egmCheckedItems, setEgmCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    if (!egmRunning) return;
    if (egmTimer <= 0) {
      setEgmRunning(false);
      soundEngine.playFanfare();
      return;
    }
    const t = setTimeout(() => setEgmTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [egmRunning, egmTimer]);

  const currentEgyptTopic = EGYPT_IN_A_MINUTE_TOPICS[egmTopicIdx % EGYPT_IN_A_MINUTE_TOPICS.length];

  // ==================== 11. 🔐 ESCAPE ROOM STATE ====================
  const [escapeStageIdx, setEscapeStageIdx] = useState(0);
  const [escapeClues, setEscapeClues] = useState<string[]>([]);
  const [escapeTimer, setEscapeTimer] = useState(120);
  const [escapeRunning, setEscapeRunning] = useState(false);
  const [escapeCompleted, setEscapeCompleted] = useState(false);

  useEffect(() => {
    if (!escapeRunning || escapeCompleted) return;
    if (escapeTimer <= 0) {
      setEscapeRunning(false);
      soundEngine.playWrong();
      return;
    }
    const t = setTimeout(() => setEscapeTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [escapeRunning, escapeTimer, escapeCompleted]);

  // ==================== CLASSIC BOARD STATE ====================
  const [classicAnswered, setClassicAnswered] = useState<Record<string, boolean>>({});
  const [classicActiveQ, setClassicActiveQ] = useState<typeof INITIAL_QUESTIONS[0] | null>(null);
  const [classicChosen, setClassicChosen] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Top Active Team & Special Cards Bar */}
      <div className="p-5 rounded-2xl bg-[#131F38] border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">🎤 الفريق صاحب الدور (بقيادة القائد):</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-3.5 py-2 text-sm font-bold bg-slate-950 border border-amber-400/60 rounded-xl text-white"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.points} نقطة)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">🔥 الفريق المنافس (جاهز لسرقة النقاط):</label>
            <select
              value={rivalTeamId}
              onChange={(e) => setRivalTeamId(e.target.value)}
              className="px-3.5 py-2 text-sm font-semibold bg-slate-950 border border-slate-700 rounded-xl text-slate-200"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.points} نقطة)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Special Cards (🃏 كروت خاصة) + Genius Alarm Button */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 ml-1">🃏 كروت القائد:</span>
          <button
            disabled={!activeTeam?.cards.doublePointsCard || doubleCardActive}
            onClick={() => {
              if (!activeTeam) return;
              soundEngine.playBuzzer();
              setDoubleCardActive(true);
              onUseTeamCard(activeTeam.id, 'doublePointsCard');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              doubleCardActive
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : activeTeam?.cards.doublePointsCard
                ? 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-400 hover:text-slate-950'
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            🃏 مضاعفة النقاط {doubleCardActive ? '(مفعّل ×٢)' : ''}
          </button>

          <button
            disabled={!activeTeam?.cards.swapQuestionCard}
            onClick={() => {
              if (!activeTeam) return;
              soundEngine.playSelectTile();
              onUseTeamCard(activeTeam.id, 'swapQuestionCard');
              setFeIndex((i) => i + 1);
              setLtIndex((i) => i + 1);
              setGbIndex((i) => i + 1);
              setMfIndex((i) => i + 1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeTeam?.cards.swapQuestionCard
                ? 'bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-sky-400 hover:text-slate-950'
                : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
            }`}
          >
            🃏 تبديل السؤال
          </button>

          <button
            onClick={onTriggerGeniusAlarm}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors flex items-center gap-1.5 shadow-md"
          >
            <Siren className="w-4 h-4" />
            <span>🚨 إنذار العباقرة!</span>
          </button>
        </div>
      </div>

      {/* Game Selector Navigation Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {GAME_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveGame(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
              activeGame === tab.id
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : 'bg-[#131F38] text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== GAME 1: 👁️ FALCON EYE (عين الصقر) ==================== */}
      {activeGame === 'falcon_eye' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 text-center">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="text-right">
              <span className="text-xs text-amber-400 font-semibold">{currentFalcon.level}</span>
              <h3 className="text-xl font-bold text-white font-display">
                👁️ لعبة عين الصقر — {currentFalcon.sceneTitle}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {FALCON_EYE_CHALLENGES.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setFeIndex(idx);
                    setFePhase('ready');
                    setFeSelected(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    feIndex === idx ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  {c.level}
                </button>
              ))}
            </div>
          </div>

          {fePhase === 'ready' && (
            <div className="py-10 space-y-4">
              <p className="text-sm text-slate-300 max-w-lg mx-auto">
                ستظهر لوحة تحتوي على ٤ عناصر بألوان وأرقام ومواضع محددة لمدة <strong className="text-amber-400">٥ ثوانٍ فقط</strong> ثم تختفي تماماً! ركّز جيداً يا {activeTeam?.name}.
              </p>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setFeTimer(5);
                  setFeSelected(null);
                  setFePhase('showing');
                }}
                className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300 inline-flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                <span>اعرض الصورة لمدة ٥ ثوانٍ الآن!</span>
              </button>
            </div>
          )}

          {fePhase === 'showing' && (
            <div className="py-6 space-y-6">
              <div className="inline-block px-5 py-2 rounded-full bg-rose-500/20 border border-rose-400 text-rose-300 font-mono-num font-bold text-lg">
                تختفي اللوحة خلال: {feTimer} ثوانٍ
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {currentFalcon.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-400/50 flex flex-col items-center gap-2 shadow-lg"
                  >
                    <span className="text-xs text-slate-400">{item.position}</span>
                    <div className="text-4xl my-1">{item.icon}</div>
                    <div className="text-sm font-bold text-white">{item.label}</div>
                    <div className="text-xs text-amber-300">اللون: {item.colorName}</div>
                    <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 font-mono-num font-bold text-sky-400">
                      رقم {item.numberBadge}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(fePhase === 'question' || fePhase === 'done') && (
            <div className="py-6 max-w-2xl mx-auto space-y-6 text-right">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-xs text-amber-400">اختفت اللوحة! أجب من ذاكرتك البصرية:</span>
                <h4 className="text-xl font-bold text-white font-display mt-1">
                  {currentFalcon.question}
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFalcon.options.map((opt, idx) => {
                  const isCorrect = idx === currentFalcon.correctIndex;
                  const isChosen = feSelected === idx;
                  let cls = 'bg-slate-900 border-slate-700 text-white hover:border-amber-400';
                  if (fePhase === 'done') {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={fePhase === 'done'}
                      onClick={() => {
                        setFeSelected(idx);
                        setFePhase('done');
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, currentFalcon.points);
                        } else {
                          soundEngine.playWrong();
                        }
                      }}
                      className={`p-4 rounded-xl border text-right text-sm transition-all ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {fePhase === 'done' && (
                <div className="text-center pt-2">
                  <button
                    onClick={() => {
                      setFeIndex((i) => i + 1);
                      setFePhase('ready');
                      setFeSelected(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    المستوى التالي في عين الصقر ←
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 2: ⚡ LIGHTNING SPEED (سرعة البرق) ==================== */}
      {activeGame === 'lightning_speed' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 text-center">
          <div className="text-xs text-amber-400 font-semibold mb-1">
            ⚡ سرعة البرق · كل ثانية متبقية تمنحك نقاط سرعة إضافية!
          </div>
          <h3 className="text-2xl font-bold text-white font-display">
            تحدي سرعة البديهة والأنماط السريعة
          </h3>

          {!ltRunning && ltAnswered === null ? (
            <div className="py-8">
              <button
                onClick={() => {
                  soundEngine.playBuzzer();
                  setLtTimeLeft(15);
                  setLtAnswered(null);
                  setLtRunning(true);
                }}
                className="px-8 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm hover:bg-amber-300"
              >
                ⚡ ابدأ عداد سرعة البرق (١٥ ثانية)
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto mt-6 space-y-6">
              <div className="inline-block px-5 py-2 rounded-xl bg-slate-950 border border-amber-400 font-mono-num text-xl font-bold text-amber-400">
                ⏱️ {ltTimeLeft} ثانية (مكافأة السرعة: +{ltTimeLeft * 2} نقطة)
              </div>

              <h4 className="text-xl sm:text-2xl font-bold text-white font-display">
                {currentLightning.prompt}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {currentLightning.options.map((opt, idx) => {
                  const isCorrect = idx === currentLightning.correctIndex;
                  const isSelected = ltAnswered === idx;
                  let cls = 'bg-slate-900 border-slate-700 text-white hover:border-amber-400';
                  if (ltAnswered !== null) {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={ltAnswered !== null}
                      onClick={() => {
                        setLtAnswered(idx);
                        setLtRunning(false);
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          const speedBonus = ltTimeLeft * 2;
                          awardWithMultiplier(selectedTeamId, currentLightning.basePoints + speedBonus);
                        } else {
                          soundEngine.playWrong();
                        }
                      }}
                      className={`p-4 rounded-xl border text-center font-bold text-base ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {ltAnswered !== null && (
                <button
                  onClick={() => {
                    setLtIndex((i) => i + 1);
                    setLtAnswered(null);
                    setLtTimeLeft(15);
                    setLtRunning(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  سؤال البرق التالي ←
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 3: 🧠 GENIUS BRAIN (مخ العباقرة) ==================== */}
      {activeGame === 'genius_brain' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-purple-400 font-semibold">
                🧠 مخ العباقرة · {currentBrain.category}
              </span>
              <h3 className="text-xl font-bold text-white font-display mt-0.5">
                ألغاز التفكير المنطقي وحل المشكلات (بدون حفظ)
              </h3>
            </div>
            <button
              onClick={() => setGbShowHint(!gbShowHint)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-amber-300"
            >
              💡 إظهار تلميح ذكي
            </button>
          </div>

          {gbShowHint && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs text-amber-200">
              تلميح العباقرة: {currentBrain.hint}
            </div>
          )}

          <h4 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentBrain.question}
          </h4>

          <div className="space-y-3">
            {currentBrain.options.map((opt, idx) => {
              const isCorrect = idx === currentBrain.correctIndex;
              const isChosen = gbSelected === idx;
              let cls = 'bg-slate-900 border-slate-700 text-slate-100 hover:border-amber-400';
              if (gbSelected !== null) {
                if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
              }
              return (
                <button
                  key={idx}
                  disabled={gbSelected !== null}
                  onClick={() => {
                    setGbSelected(idx);
                    if (isCorrect) {
                      soundEngine.playCorrect();
                      awardWithMultiplier(selectedTeamId, currentBrain.points);
                    } else {
                      soundEngine.playWrong();
                    }
                  }}
                  className={`w-full p-4 rounded-xl border text-right text-sm transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {gbSelected !== null && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-slate-300">{currentBrain.explanation}</p>
              <button
                onClick={() => {
                  setGbIndex((i) => i + 1);
                  setGbSelected(null);
                  setGbShowHint(false);
                }}
                className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
              >
                اللغز المنطقي التالي ←
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 4: 🔬 MYSTERY FACT (المعلومة الغامضة) ==================== */}
      {activeGame === 'mystery_fact' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs text-emerald-400 font-semibold">
              🔬 المعلومة الغامضة · قياس سرعة الفهم والاستنتاج من معلومة جديدة
            </span>
            <h3 className="text-2xl font-bold text-white font-display mt-1">
              {currentMysteryFact.title}
            </h3>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-100 text-sm sm:text-base leading-relaxed">
            <div className="text-xs font-bold text-emerald-400 mb-2">📖 اقرأ هذه المعلومة الجديدة مع فريقك:</div>
            {currentMysteryFact.factCard}
          </div>

          <h4 className="text-lg font-bold text-white">{currentMysteryFact.question}</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentMysteryFact.options.map((opt, idx) => {
              const isCorrect = idx === currentMysteryFact.correctIndex;
              const isChosen = mfSelected === idx;
              let cls = 'bg-slate-900 border-slate-700 text-slate-100 hover:border-amber-400';
              if (mfSelected !== null) {
                if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
              }
              return (
                <button
                  key={idx}
                  disabled={mfSelected !== null}
                  onClick={() => {
                    setMfSelected(idx);
                    if (isCorrect) {
                      soundEngine.playCorrect();
                      awardWithMultiplier(selectedTeamId, currentMysteryFact.points);
                    } else {
                      soundEngine.playWrong();
                    }
                  }}
                  className={`p-4 rounded-xl border text-right text-sm transition-all ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {mfSelected !== null && (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-300">{currentMysteryFact.explanation}</p>
              <button
                onClick={() => {
                  setMfIndex((i) => i + 1);
                  setMfSelected(null);
                }}
                className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shrink-0"
              >
                المعلومة الغامضة التالية ←
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 5 & 6: 🎯 RISK & 🔥 POINT STEAL ==================== */}
      {(activeGame === 'risk_challenge' || activeGame === 'point_steal') && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold">
                🎯 تحدي المخاطرة + 🔥 سرقة النقاط الفورية
              </span>
              <h3 className="text-2xl font-bold text-white font-display mt-1">
                اختر قيمة النقاط قبل رؤية السؤال!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                قاعدة خصم النقاط عند الخطأ: {settings.enableRiskPenalty ? 'مفعّلة من المشرف' : 'متوقفة (بدون خصم)'} · إذا أخطأ الفريق تظهر فرصة سرقة السؤال للفريق المنافس!
              </p>
            </div>
          </div>

          {/* Step 1: Choose Risk Tier */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { tier: 10, label: '🟢 10 نقاط', sub: 'مستوى آمن' },
              { tier: 20, label: '🟡 20 نقطة', sub: 'مخاطرة متوسطة' },
              { tier: 30, label: '🔴 30 نقطة', sub: 'مخاطرة عالية' },
              { tier: 50, label: '🔥 50 نقطة', sub: 'مخاطرة الأبطال القصوى' },
            ] as const).map((item) => (
              <button
                key={item.tier}
                onClick={() => {
                  soundEngine.playSelectTile();
                  setRiskTier(item.tier);
                  setRiskSelected(null);
                  setStealModeActive(false);
                  setStealSelected(null);
                }}
                className={`p-5 rounded-2xl border text-center transition-all ${
                  riskTier === item.tier
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg'
                    : 'bg-slate-900 border-slate-700 text-white hover:border-amber-400'
                }`}
              >
                <div className="text-lg font-bold font-display">{item.label}</div>
                <div className="text-xs opacity-80 mt-1">{item.sub}</div>
              </button>
            ))}
          </div>

          {riskTier && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="text-xs text-amber-400 font-semibold">
                سؤال مخاطرة بقيمة {riskTier} نقطة للفريق: {activeTeam?.name}
              </div>
              <h4 className="text-xl font-bold text-white font-display">{currentRiskQ.question}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentRiskQ.options.map((opt, idx) => {
                  const isCorrect = idx === currentRiskQ.correctIndex;
                  const isChosen = riskSelected === idx;
                  const isStealChosen = stealSelected === idx;

                  let cls = 'bg-slate-950 border-slate-700 text-white hover:border-amber-400';
                  if (riskSelected !== null && !stealModeActive) {
                    if (isCorrect && (riskSelected === currentRiskQ.correctIndex || stealSelected !== null)) {
                      cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    } else if (isChosen || isStealChosen) {
                      cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={riskSelected !== null && !stealModeActive}
                      onClick={() => {
                        if (stealModeActive) {
                          setStealSelected(idx);
                          setStealModeActive(false);
                          if (isCorrect) {
                            soundEngine.playCorrect();
                            onAwardTeamPoints(rivalTeam.id, riskTier);
                          } else {
                            soundEngine.playWrong();
                          }
                          return;
                        }

                        setRiskSelected(idx);
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, riskTier);
                        } else {
                          soundEngine.playWrong();
                          if (settings.enableRiskPenalty) {
                            onAwardTeamPoints(selectedTeamId, -riskTier);
                          }
                        }
                      }}
                      className={`p-4 rounded-xl border text-right text-sm transition-all ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* 🔥 POINT STEAL TRIGGER WHEN WRONG */}
              {riskSelected !== null &&
                riskSelected !== currentRiskQ.correctIndex &&
                stealSelected === null &&
                !stealModeActive && (
                  <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-400 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-rose-300">
                        🔥 أخطأ {activeTeam?.name}! هل يريد «{rivalTeam?.name}» سرقة السؤال والحصول على الـ{riskTier} نقطة؟
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playBuzzer();
                        setStealTimeLeft(10);
                        setStealModeActive(true);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap"
                    >
                      🔥 نعم! تفعيل سرقة النقاط (١٠ ثوانٍ)
                    </button>
                  </div>
                )}

              {stealModeActive && (
                <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-400 text-center text-sm font-bold text-amber-300">
                  ⚡ فرصة سرقة السؤال لـ {rivalTeam?.name} — اختر الإجابة الصحيحة خلال {stealTimeLeft} ثوانٍ!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 7: 📦 MYSTERY BOX (الصندوق الغامض) ==================== */}
      {activeGame === 'mystery_box' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-xs text-amber-400 font-semibold">📦 الصندوق الغامض · اختر صندوقك قبل رؤية السؤال</span>
            <h3 className="text-2xl font-bold text-white font-display mt-1">
              صناديق المفاجآت الخمسة والصندوق الأسود
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {MYSTERY_BOXES.map((box) => (
              <button
                key={box.id}
                onClick={() => {
                  soundEngine.playSelectTile();
                  setOpenedBoxId(box.id);
                  setBoxAnswerIdx(null);
                }}
                className={`p-5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                  openedBoxId === box.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg'
                    : box.isBlackBox
                    ? 'bg-slate-950 border-purple-500/60 text-purple-300 hover:border-purple-400'
                    : 'bg-slate-900 border-slate-700 text-white hover:border-amber-400'
                }`}
              >
                <span className="text-3xl">{box.icon}</span>
                <span className="text-xs font-bold">{box.boxName}</span>
              </button>
            ))}
          </div>

          {currentBox && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="text-xs font-bold text-amber-400">{currentBox.surpriseEffect}</div>
              <h4 className="text-xl font-bold text-white font-display">{currentBox.question}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentBox.options.map((opt, idx) => {
                  const isCorrect = idx === currentBox.correctIndex;
                  const isSelected = boxAnswerIdx === idx;
                  let cls = 'bg-slate-950 border-slate-700 text-white hover:border-amber-400';
                  if (boxAnswerIdx !== null) {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={boxAnswerIdx !== null}
                      onClick={() => {
                        setBoxAnswerIdx(idx);
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, currentBox.bonusPoints);
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
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 8: 🎭 NO TALKING (ممنوع الكلام) ==================== */}
      {activeGame === 'no_talking' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 text-center space-y-6">
          <div>
            <span className="text-xs text-amber-400 font-semibold">🎭 لعبة ممنوع الكلام · الإشارات والتمثيل الصامت فقط</span>
            <h3 className="text-2xl font-bold text-white font-display mt-1">
              مثّل الكلمة لفريقك بدون نطق أي حرف!
            </h3>
          </div>

          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>الفئة: {currentCharade.category}</span>
              <span className="font-mono-num text-amber-400 font-bold">⏱️ {charadeTimer} ثانية</span>
            </div>

            {charadeRevealed ? (
              <div className="py-4 space-y-2">
                <div className="text-xs text-emerald-400">الكلمة المطلوب تمثيلها بالإشارات:</div>
                <div className="text-2xl font-bold text-white font-display">{currentCharade.word}</div>
                <div className="text-xs text-rose-300 mt-2">
                  ممنوع الإشارة بالكلام إلى: ({currentCharade.forbiddenWords.join(' — ')})
                </div>
              </div>
            ) : (
              <div className="py-6 text-sm text-slate-400">
                اضغط على «اكشف الكلمة للممثل» عندما يقف الطالب أمام فريقه.
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setCharadeRevealed(true);
                  setCharadeTimer(60);
                  setCharadeRunning(true);
                  soundEngine.playSelectTile();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                👁️ اكشف الكلمة وابدأ الـ60 ثانية
              </button>

              {charadeRevealed && (
                <>
                  <button
                    onClick={() => {
                      soundEngine.playCorrect();
                      setCharadeRunning(false);
                      awardWithMultiplier(selectedTeamId, currentCharade.points);
                      setCharadeIdx((i) => i + 1);
                      setCharadeRevealed(false);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    ✓ خمّنها الفريق بنجاح (+{currentCharade.points})
                  </button>
                  <button
                    onClick={() => {
                      setCharadeIdx((i) => i + 1);
                      setCharadeRevealed(false);
                      setCharadeRunning(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    بطاقة أخرى
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== GAME 10: 🇪🇬 EGYPT IN A MINUTE (مصر في دقيقة) ==================== */}
      {activeGame === 'egypt_minute' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold">🇪🇬 مصر في دقيقة · ٦٠ ثانية من التحدي الوطني</span>
              <h3 className="text-xl font-bold text-white font-display mt-1">{currentEgyptTopic.title}</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-400 font-mono-num font-bold text-amber-400">
                ⏱️ {egmTimer} ثانية
              </div>
              <button
                onClick={() => {
                  soundEngine.playBuzzer();
                  setEgmTimer(60);
                  setEgmCheckedItems([]);
                  setEgmRunning(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                ابدأ الـ60 ثانية
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300">
            اضغط على كل عنصر يذكره الفريق بشكل صحيح خلال الدقيقة ليتم احتساب نقاطه فوراً ({egmCheckedItems.length} إجابات = {egmCheckedItems.length * currentEgyptTopic.pointsPerItem} نقطة):
          </p>

          <div className="flex flex-wrap gap-2">
            {currentEgyptTopic.targetItems.map((item) => {
              const checked = egmCheckedItems.includes(item);
              return (
                <button
                  key={item}
                  onClick={() => {
                    if (checked) return;
                    soundEngine.playSelectTile();
                    setEgmCheckedItems((prev) => [...prev, item]);
                    onAwardTeamPoints(selectedTeamId, currentEgyptTopic.pointsPerItem);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    checked
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-amber-400'
                  }`}
                >
                  {checked ? `✓ ${item}` : item}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setEgmTopicIdx((i) => i + 1);
                setEgmCheckedItems([]);
                setEgmTimer(60);
                setEgmRunning(false);
              }}
              className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white"
            >
              تغيير موضوع «مصر في دقيقة» ←
            </button>
          </div>
        </div>
      )}

      {/* ==================== GAME 11: 🔐 ESCAPE ROOM (غرفة العباقرة) ==================== */}
      {activeGame === 'escape_room' && (
        <div className="rounded-2xl bg-[#131F38] border border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="text-xs text-amber-400 font-semibold">🔐 غرفة العباقرة المغلقة · حل ٣ ألغاز متتالية لاستخراج رمز الخروج</span>
              <h3 className="text-2xl font-bold text-white font-display mt-1">
                مهمة الهروب الذكي لفريق {activeTeam?.name}
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 rounded-xl bg-slate-950 border border-amber-400 font-mono-num font-bold text-amber-400">
                ⏱️ {escapeTimer} ثانية
              </div>
              {!escapeRunning && !escapeCompleted && (
                <button
                  onClick={() => {
                    soundEngine.playBuzzer();
                    setEscapeStageIdx(0);
                    setEscapeClues([]);
                    setEscapeCompleted(false);
                    setEscapeTimer(120);
                    setEscapeRunning(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  دخول الغرفة وتشغيل المؤقت
                </button>
              )}
            </div>
          </div>

          {/* Collected Clues Bar */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-center ${
                  escapeClues[idx]
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <div className="text-[11px]">مفتاح اللغز {idx + 1}</div>
                <div className="text-base font-bold font-mono-num mt-0.5">
                  {escapeClues[idx] ? `🔓 ${escapeClues[idx]}` : '🔒 مغلق'}
                </div>
              </div>
            ))}
          </div>

          {escapeCompleted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-400 text-center space-y-3">
              <Unlock className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-2xl font-bold text-white font-display">
                🎉 تم فتح غرفة العباقرة بنجاح! الرمز النهائي: ({escapeClues.join(' - ')})
              </h4>
              <p className="text-sm text-emerald-200">
                حصل {activeTeam?.name} على مكافأة الخروج السريع (+60 نقطة)!
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="text-xs text-amber-400 font-bold">
                {ESCAPE_ROOM_STAGES[escapeStageIdx].title}
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {ESCAPE_ROOM_STAGES[escapeStageIdx].riddle}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ESCAPE_ROOM_STAGES[escapeStageIdx].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const stageObj = ESCAPE_ROOM_STAGES[escapeStageIdx];
                      if (idx === stageObj.correctIndex) {
                        soundEngine.playCorrect();
                        const nextClues = [...escapeClues, stageObj.clueOutput];
                        setEscapeClues(nextClues);
                        if (escapeStageIdx < ESCAPE_ROOM_STAGES.length - 1) {
                          setEscapeStageIdx((s) => s + 1);
                        } else {
                          soundEngine.playFanfare();
                          setEscapeCompleted(true);
                          setEscapeRunning(false);
                          awardWithMultiplier(selectedTeamId, 60);
                        }
                      } else {
                        soundEngine.playWrong();
                      }
                    }}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold hover:border-amber-400"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== GAME 12: 🏛️ CLASSIC BOARD (لوحة المجالات الثمانية المحفوظة) ==================== */}
      {activeGame === 'classic_board' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const catQs = INITIAL_QUESTIONS.filter((q) => q.categoryId === cat.id).slice(0, 3);
              return (
                <div key={cat.id} className="p-5 rounded-xl bg-[#131F38] border border-slate-800">
                  <h4 className="text-base font-bold font-display" style={{ color: cat.accentColor }}>
                    {cat.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">{cat.subtitle}</p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {catQs.map((q) => {
                      const used = classicAnswered[q.id];
                      return (
                        <button
                          key={q.id}
                          disabled={used}
                          onClick={() => {
                            soundEngine.playSelectTile();
                            setClassicActiveQ(q);
                            setClassicChosen(null);
                          }}
                          className={`py-3 rounded-lg font-mono-num font-bold text-sm border ${
                            used
                              ? 'bg-slate-950 border-slate-800 text-slate-600'
                              : 'bg-slate-900 border-slate-700 text-white hover:border-amber-400'
                          }`}
                        >
                          {used ? '✓' : q.points}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {classicActiveQ && (
            <div className="p-6 rounded-2xl bg-slate-900 border border-amber-400/50 space-y-4">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span>سؤال بقيمة {classicActiveQ.points} نقطة</span>
                <button onClick={() => setClassicActiveQ(null)} className="text-slate-400 hover:text-white">
                  إغلاق ✕
                </button>
              </div>
              <h4 className="text-lg font-bold text-white">{classicActiveQ.question}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {classicActiveQ.options.map((opt, idx) => {
                  const isCorrect = idx === classicActiveQ.correctIndex;
                  const isChosen = classicChosen === idx;
                  let cls = 'bg-slate-950 border-slate-700 text-white hover:border-amber-400';
                  if (classicChosen !== null) {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={classicChosen !== null}
                      onClick={() => {
                        setClassicChosen(idx);
                        setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, classicActiveQ.points);
                        } else {
                          soundEngine.playWrong();
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-right text-sm ${cls}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
