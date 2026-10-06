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
  students: { id: string; name: string; grade: '4' | '5' | '6'; className: string; participationCode: string; scores: { total: number } }[];
  onAwardTeamPoints: (teamId: string, deltaPoints: number) => void;
  onAwardStudentPoints?: (studentId: string, deltaPoints: number) => void;
  onUseTeamCard: (teamId: string, cardKey: 'challengeCard' | 'swapQuestionCard' | 'doublePointsCard') => void;
  settings: CompetitionSettings;
  onTriggerGeniusAlarm: () => void;
}

const GAME_TABS: { id: ChallengeGameId; label: string; icon: string; shortDesc: string }[] = [
  { id: 'classic_board', label: '📺 استوديو برنامج العباقرة (لوحة المجالات)', icon: '📺', shortDesc: 'المواجهة التلفزيونية المباشرة بين الفريقين على غرار برنامج العباقرة' },
  { id: 'falcon_eye', label: '👁️ عين الصقر', icon: '👁️', shortDesc: 'ملاحظة الصورة في ٥ ثوانٍ قبل اختفائها' },
  { id: 'lightning_speed', label: '⚡ سرعة البرق', icon: '⚡', shortDesc: 'نقاط إضافية كلما أجبت أسرع' },
  { id: 'genius_brain', label: '🧠 مخ العباقرة', icon: '🧠', shortDesc: 'ألغاز تفكير واستنتاج وعلاقات منطقية' },
  { id: 'mystery_fact', label: '🔬 المعلومة الغامضة', icon: '🔬', shortDesc: 'تعلم معلومة جديدة واستنتج الحل فوراً' },
  { id: 'risk_challenge', label: '🎯 فقرة عجلة الحظ والمخاطرة', icon: '🎯', shortDesc: 'اختر ١٠ أو ٢٠ أو ٣٠ أو ٥٠ نقطة قبل السؤال' },
  { id: 'point_steal', label: '🔥 سرقة النقاط', icon: '🔥', shortDesc: 'اقنص نقاط السؤال إذا أخطأ الفريق المنافس' },
  { id: 'mystery_box', label: '📦 الصندوق الغامض', icon: '📦', shortDesc: '٥ صناديق مفاجآت بينها الصندوق الأسود' },
  { id: 'no_talking', label: '🎭 فقرة التمثيل الصامت (الفنون)', icon: '🎭', shortDesc: 'تمثيل صامت بالإشارات فقط خلال ٦٠ ثانية' },
  { id: 'egypt_minute', label: '🇪🇬 مصر في دقيقة', icon: '🇪🇬', shortDesc: 'اذكر أكبر عدد من عناصر مصر في ٦٠ ثانية' },
  { id: 'escape_room', label: '🔐 غرفة العباقرة', icon: '🔐', shortDesc: 'حل ٣ ألغاز متتالية لفتح رمز الخروج' },
];

export const GamesArenaHub: React.FC<GamesArenaHubProps> = ({
  initialGameTab = 'classic_board',
  teams,
  students = [],
  onAwardTeamPoints,
  onAwardStudentPoints,
  onUseTeamCard,
  settings,
  onTriggerGeniusAlarm,
}) => {
  const [activeGame, setActiveGame] = useState<ChallengeGameId>(initialGameTab);
  const [playSystemMode, setPlaySystemMode] = useState<'teams' | 'individual'>('teams');
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-nile');
  const [rivalTeamId, setRivalTeamId] = useState<string>(teams[1]?.id || 'team-geniuses');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'stu-1');
  const [rivalStudentId, setRivalStudentId] = useState<string>(students[1]?.id || 'stu-2');
  const [doubleCardActive, setDoubleCardActive] = useState(false);
  const [answeringMemberId, setAnsweringMemberId] = useState<string>('');
  const [classicTimer, setClassicTimer] = useState<number>(30);
  const [classicTimerRunning, setClassicTimerRunning] = useState<boolean>(false);
  const [classicStealTurn, setClassicStealTurn] = useState<boolean>(false);

  // 🗳️ Live Team Consensus Voting State (التصويت اللحظي لأعضاء الفريق قبل قفل السؤال)
  const [teamConsensusEnabled, setTeamConsensusEnabled] = useState<boolean>(true);
  const [memberVotes, setMemberVotes] = useState<Record<string, number>>({});
  const [activeVotingMemberId, setActiveVotingMemberId] = useState<string>('');
  const [lastVotedOptionIdx, setLastVotedOptionIdx] = useState<number | null>(null);
  const [lastVotedMemberName, setLastVotedMemberName] = useState<string>('');
  const [votePulseTick, setVotePulseTick] = useState<number>(0);

  useEffect(() => {
    if (initialGameTab) setActiveGame(initialGameTab);
  }, [initialGameTab]);

  // Reset member votes whenever game, question, or turn changes
  useEffect(() => {
    setMemberVotes({});
    setActiveVotingMemberId('');
    setLastVotedOptionIdx(null);
    setLastVotedMemberName('');
  }, [
    activeGame,
    selectedTeamId,
    rivalTeamId,
    classicActiveQ?.id,
    classicStealTurn,
    feIndex,
    ltIndex,
    gbIndex,
    mfIndex,
    riskTier,
    stealModeActive,
    openedBoxId,
  ]);

  const activeTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];
  const rivalTeam = teams.find((t) => t.id === rivalTeamId) || teams[1] || teams[0];
  const activeStudentObj = students.find((s) => s.id === selectedStudentId) || students[0];
  const rivalStudentObj = students.find((s) => s.id === rivalStudentId) || students[1] || students[0];

  const awardWithMultiplier = (targetId: string, pts: number) => {
    const finalPts = doubleCardActive ? pts * 2 : pts;
    if (playSystemMode === 'individual' && onAwardStudentPoints) {
      const stuId = targetId === rivalTeamId ? rivalStudentId : selectedStudentId;
      onAwardStudentPoints(stuId, finalPts);
    } else {
      onAwardTeamPoints(targetId, finalPts);
    }
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

  useEffect(() => {
    if (!classicTimerRunning || classicChosen !== null || !classicActiveQ) return;
    if (classicTimer <= 0) {
      setClassicTimerRunning(false);
      soundEngine.playBuzzer();
      return;
    }
    const t = setTimeout(() => setClassicTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [classicTimerRunning, classicTimer, classicChosen, classicActiveQ]);

  const activeCaptain = activeTeam?.members.find((m) => m.id === activeTeam.captainId) || activeTeam?.members[0];
  const rivalCaptain = rivalTeam?.members.find((m) => m.id === rivalTeam.captainId) || rivalTeam?.members[0];

  // Determine which team is currently voting (Active Team or Rival Team during Steal Turn)
  const votingTeam =
    (activeGame === 'classic_board' && classicStealTurn) ||
    ((activeGame === 'risk_challenge' || activeGame === 'point_steal') && stealModeActive)
      ? rivalTeam
      : activeTeam;

  const votingMembers = votingTeam?.members || [];
  const votingCaptId = votingTeam?.captainId || votingMembers[0]?.id || '';
  const currentVoterId = activeVotingMemberId && votingMembers.some((m) => m.id === activeVotingMemberId)
    ? activeVotingMemberId
    : votingCaptId;

  // Cast a single vote for a specific team member (each member has exactly 1 vote they can cast/update before locking)
  const castMemberVote = (memberId: string, optionIdx: number) => {
    soundEngine.playSelectTile();
    const voterObj = votingMembers.find((m) => m.id === memberId);
    setLastVotedOptionIdx(optionIdx);
    setLastVotedMemberName(voterObj?.name || 'عضو الفريق');
    setVotePulseTick((t) => t + 1);

    setMemberVotes((prev) => {
      const updated = { ...prev, [memberId]: optionIdx };
      // Automatically advance active voter cursor to the next member who hasn't voted yet
      const nextUnvoted = votingMembers.find((m) => updated[m.id] === undefined);
      if (nextUnvoted) {
        setActiveVotingMemberId(nextUnvoted.id);
      }
      return updated;
    });
  };

  // Clear flash burst after 700ms so subsequent clicks re-trigger the animation cleanly
  useEffect(() => {
    if (lastVotedOptionIdx === null) return;
    const timer = setTimeout(() => {
      setLastVotedOptionIdx(null);
    }, 700);
    return () => clearTimeout(timer);
  }, [votePulseTick, lastVotedOptionIdx]);

  // Compute vote counts per option index & consensus winner
  const getVoteStats = (optionsCount: number) => {
    const counts: number[] = Array(optionsCount).fill(0);
    const votersByOption: Record<number, { id: string; name: string; isCaptain: boolean }[]> = {};
    for (let i = 0; i < optionsCount; i++) votersByOption[i] = [];

    votingMembers.forEach((m) => {
      const v = memberVotes[m.id];
      if (v !== undefined && v >= 0 && v < optionsCount) {
        counts[v] += 1;
        votersByOption[v].push({
          id: m.id,
          name: m.name,
          isCaptain: m.id === votingCaptId,
        });
      }
    });

    const totalVotesCast = Object.keys(memberVotes).filter((mId) =>
      votingMembers.some((m) => m.id === mId)
    ).length;

    let maxVotes = 0;
    let leadingOptionIdx: number | null = null;
    counts.forEach((c, idx) => {
      if (c > maxVotes) {
        maxVotes = c;
        leadingOptionIdx = idx;
      } else if (c === maxVotes && c > 0) {
        // Tie-breaker: Captain's vote breaks ties
        const captVote = memberVotes[votingCaptId];
        if (captVote === idx) {
          leadingOptionIdx = idx;
        }
      }
    });

    const isUnanimous = totalVotesCast > 0 && maxVotes === totalVotesCast && totalVotesCast === votingMembers.length;
    const consensusPct = totalVotesCast > 0 ? Math.round((maxVotes / totalVotesCast) * 100) : 0;

    return {
      counts,
      votersByOption,
      totalVotesCast,
      totalMembers: votingMembers.length,
      leadingOptionIdx,
      maxVotes,
      isUnanimous,
      consensusPct,
    };
  };

  // Visual animation classes for any option button when team members are casting live votes before consensus lock
  const getOptionVoteVisualClass = (
    optionIdx: number,
    optionsCount: number,
    isQuestionLocked: boolean
  ) => {
    if (playSystemMode !== 'teams' || !teamConsensusEnabled || isQuestionLocked) return '';
    const stats = getVoteStats(optionsCount);
    const votesForThis = stats.counts[optionIdx] || 0;
    if (votesForThis === 0) return '';

    const justPicked = lastVotedOptionIdx === optionIdx;
    if (stats.isUnanimous && stats.leadingOptionIdx === optionIdx) {
      return `vote-option-unanimous vote-animated-frame ${justPicked ? 'vote-option-just-picked' : ''}`;
    }
    if (stats.leadingOptionIdx === optionIdx) {
      return `vote-option-active vote-animated-frame ${justPicked ? 'vote-option-just-picked' : ''}`;
    }
    return `border-sky-400/80 bg-sky-500/10 ${justPicked ? 'vote-option-just-picked' : ''}`;
  };

  // Render the interactive Live Team Voting Bar & Lock Consensus Button
  const renderTeamConsensusPanel = (
    options: string[],
    isQuestionLocked: boolean,
    onLockFinalAnswer: (finalOptionIdx: number) => void
  ) => {
    if (playSystemMode !== 'teams' || !teamConsensusEnabled || !votingTeam) return null;

    const stats = getVoteStats(options.length);
    const waitingForConsensus = stats.totalVotesCast > 0 && stats.totalVotesCast < stats.totalMembers;

    return (
      <div
        className={`p-4 sm:p-5 rounded-2xl bg-slate-950/95 border-2 space-y-4 text-right shadow-xl transition-all ${
          !isQuestionLocked && stats.isUnanimous
            ? 'vote-option-unanimous border-emerald-400'
            : !isQuestionLocked && waitingForConsensus
            ? 'vote-option-active border-amber-400'
            : 'border-amber-400/60'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-slate-950 animate-ping" />
              <span>🗳️ التصويت اللحظي لأعضاء {votingTeam.name}</span>
            </span>
            {lastVotedMemberName && !isQuestionLocked ? (
              <span
                key={votePulseTick}
                className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-200 text-xs font-bold animate-bounce"
              >
                ⚡ اختار «{lastVotedMemberName}» إجابته للتو! ({stats.totalVotesCast}/{stats.totalMembers})
              </span>
            ) : (
              <span className="text-xs text-slate-300">
                يختار كل لاعب إجابة واحدة فقط، ويتم اعتماد الإجابة النهائية بناءً على إجماع الفريق قبل قفل السؤال
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full border text-xs font-mono-num font-bold transition-all ${
                stats.isUnanimous
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 scale-105'
                  : waitingForConsensus
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-amber-300'
              }`}
            >
              {stats.isUnanimous
                ? `🌟 اكتمل الإجماع (${stats.totalVotesCast}/${stats.totalMembers})`
                : waitingForConsensus
                ? `⏳ جاري التصويت (${stats.totalVotesCast}/${stats.totalMembers})`
                : `صوّت ${stats.totalVotesCast} من ${stats.totalMembers} لاعبين`}
            </span>
            {stats.totalVotesCast > 0 && !isQuestionLocked && (
              <button
                type="button"
                onClick={() => {
                  setMemberVotes({});
                  setLastVotedOptionIdx(null);
                  setLastVotedMemberName('');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-400 hover:text-white cursor-pointer"
              >
                إعادة التصويت
              </button>
            )}
          </div>
        </div>

        {/* Live Team Consensus Progress Bar */}
        {!isQuestionLocked && stats.totalVotesCast > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-amber-300 font-bold">
                {stats.isUnanimous
                  ? '🔥 إجماع كامل من جميع أعضاء الفريق! جاهزون لقفل السؤال!'
                  : `⚡ نبض التصويت المباشر: بانتظار ${stats.totalMembers - stats.totalVotesCast} من أعضاء الفريق لاكتمال الإجماع...`}
              </span>
              <span className="font-mono-num text-emerald-400 font-bold">
                نسبة التوافق: {stats.consensusPct}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800 flex">
              <div
                className={`h-full transition-all duration-300 ${
                  stats.isUnanimous
                    ? 'bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-400 via-sky-400 to-amber-400 animate-pulse'
                }`}
                style={{ width: `${(stats.totalVotesCast / Math.max(1, stats.totalMembers)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 1: Member Voter Selector Pills (Choose who is voting or vote directly per member) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>١. اختر عضو الفريق للتصويت (أو اضغط على الخيار مباشرة لتسجيل صوت اللاعب المحدد):</span>
            {!isQuestionLocked && (
              <button
                type="button"
                onClick={() => {
                  // Simulate quick unanimous consensus on leading option or captain's choice
                  const targetOpt = stats.leadingOptionIdx ?? 0;
                  soundEngine.playSelectTile();
                  const allVotes: Record<string, number> = {};
                  votingMembers.forEach((m) => {
                    allVotes[m.id] = targetOpt;
                  });
                  setMemberVotes(allVotes);
                }}
                className="text-[11px] text-emerald-400 hover:underline font-bold cursor-pointer"
              >
                🤝 إجماع سريع لجميع الأعضاء على الخيار رقم {(stats.leadingOptionIdx ?? 0) + 1}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {votingMembers.map((m, mIdx) => {
              const isCapt = m.id === votingCaptId;
              const isCurrentVoter = m.id === currentVoterId;
              const votedOpt = memberVotes[m.id];
              const hasVoted = votedOpt !== undefined;

              return (
                <div
                  key={m.id}
                  onClick={() => !isQuestionLocked && setActiveVotingMemberId(m.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                    isCurrentVoter && !isQuestionLocked
                      ? 'bg-amber-400/20 border-2 border-amber-400 shadow-md'
                      : hasVoted
                      ? 'bg-emerald-950/30 border-emerald-500/50'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-amber-300">
                      {isCapt ? '👑 القائد' : `🎙️ لاعب ${mIdx + 1}`}
                    </span>
                    {hasVoted ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono-num font-bold">
                        صوت: #{votedOpt + 1}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500">لم يصوّت</span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-white truncate">{m.name}</div>

                  {/* Quick 1-click option buttons per member */}
                  {!isQuestionLocked && (
                    <div className="grid grid-cols-4 gap-1 pt-1 border-t border-slate-800/80">
                      {options.map((_, optIdx) => {
                        const isPicked = votedOpt === optIdx;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              castMemberVote(m.id, optIdx);
                            }}
                            title={`تصويت ${m.name} للخيار ${optIdx + 1}`}
                            className={`py-1 rounded text-[11px] font-mono-num font-extrabold transition-all cursor-pointer ${
                              isPicked
                                ? 'bg-amber-400 text-slate-950 shadow'
                                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {optIdx + 1}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Consensus Summary & Final Lock Button */}
        {!isQuestionLocked && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs">
              {stats.leadingOptionIdx !== null ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-300">قرار الأغلبية / الإجماع الحالي:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold">
                    الخيار #{stats.leadingOptionIdx + 1}: {options[stats.leadingOptionIdx]}
                  </span>
                  <span className="text-[11px] font-mono-num text-amber-400 font-bold">
                    ({stats.maxVotes} أصوات · نسبة التوافق {stats.consensusPct}%{' '}
                    {stats.isUnanimous ? '🌟 إجماع كامل!' : ''})
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">
                  👈 اضغط على أرقام الخيارات (1 - {options.length}) تحت اسم كل لاعب أو اضغط على بطاقة الإجابة لتسجيل أصوات الفريق قبل قفل السؤال.
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={stats.leadingOptionIdx === null}
              onClick={() => {
                if (stats.leadingOptionIdx !== null) {
                  onLockFinalAnswer(stats.leadingOptionIdx);
                }
              }}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all flex items-center justify-center gap-2 ${
                stats.leadingOptionIdx !== null
                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg cursor-pointer'
                  : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                اعتماد إجماع الفريق وقفل السؤال النهائي
                {stats.leadingOptionIdx !== null ? ` (خيار #${stats.leadingOptionIdx + 1})` : ''}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ==================== 📺 AL-ABAKERA TV STUDIO DUAL PODIUM SCOREBOARD ==================== */}
      <div className="rounded-3xl bg-gradient-to-b from-[#16223B] via-[#111A2E] to-[#0B101D] border-2 border-[#d4af37]/60 p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/90 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#d4af37] text-[#0f0f12] text-xs font-extrabold tracking-wide">
              📺 استوديو برنامج العباقرة — مدرسة عيون مصر
            </span>

            {/* Competition Mode Switcher: Individual vs Teams */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-amber-400/40">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  setPlaySystemMode('teams');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  playSystemMode === 'teams'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👥 نظام الفرق (مجموعة 4 أو 5 أولاد)
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  setPlaySystemMode('individual');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  playSystemMode === 'individual'
                    ? 'bg-emerald-400 text-slate-950 shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                👤 النظام الفردي (طالب ضد طالب)
              </button>
            </div>

            {playSystemMode === 'teams' && (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  setTeamConsensusEnabled(!teamConsensusEnabled);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  teamConsensusEnabled
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>🗳️ تصويت وإجماع الفريق:</span>
                <span>{teamConsensusEnabled ? 'مفعّل ✓' : 'متوقف'}</span>
              </button>
            )}
          </div>

          {/* Special Cards (🃏 كروت خاصة) + Genius Alarm Button */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-amber-300 font-bold ml-1">🃏 كروت المساعدة:</span>
            <button
              disabled={playSystemMode === 'teams' ? (!activeTeam?.cards.doublePointsCard || doubleCardActive) : doubleCardActive}
              onClick={() => {
                soundEngine.playBuzzer();
                setDoubleCardActive(true);
                if (playSystemMode === 'teams' && activeTeam) {
                  onUseTeamCard(activeTeam.id, 'doublePointsCard');
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                doubleCardActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : playSystemMode === 'individual' || activeTeam?.cards.doublePointsCard
                  ? 'bg-slate-900 text-amber-300 border-amber-500/40 hover:bg-amber-400 hover:text-slate-950'
                  : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              🃏 مضاعفة النقاط {doubleCardActive ? '(مفعّل ×٢)' : ''}
            </button>

            <button
              disabled={playSystemMode === 'teams' && !activeTeam?.cards.swapQuestionCard}
              onClick={() => {
                soundEngine.playSelectTile();
                if (playSystemMode === 'teams' && activeTeam) {
                  onUseTeamCard(activeTeam.id, 'swapQuestionCard');
                }
                setFeIndex((i) => i + 1);
                setLtIndex((i) => i + 1);
                setGbIndex((i) => i + 1);
                setMfIndex((i) => i + 1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                playSystemMode === 'individual' || activeTeam?.cards.swapQuestionCard
                  ? 'bg-slate-900 text-sky-300 border-sky-500/40 hover:bg-sky-400 hover:text-slate-950'
                  : 'bg-slate-950 text-slate-600 border-slate-800 cursor-not-allowed'
              }`}
            >
              🃏 تبديل السؤال
            </button>

            <button
              onClick={onTriggerGeniusAlarm}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Siren className="w-4 h-4" />
              <span>🚨 جرس إنذار العباقرة!</span>
            </button>
          </div>
        </div>

        {playSystemMode === 'teams' ? (
          /* Two Opposing Studio Podiums: Right Podium (Active Team) vs Left Podium (Rival Team) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Right Podium: Active Team */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border-2 border-amber-400/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[11px] font-bold">
                    🎤 منصة الفريق صاحب الدور
                  </span>
                  <select
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="px-2.5 py-1 text-sm font-bold bg-slate-900 border border-amber-400/50 rounded-lg text-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.members.length} لاعبين)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold font-mono-num text-amber-400">
                    {activeTeam?.points || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">نقطة</div>
                </div>
              </div>

              {/* 4 or 5 Players Podium Seats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {activeTeam?.members.map((m, idx) => {
                  const isCapt = activeTeam.captainId === m.id;
                  const isSelectedPlayer = answeringMemberId === m.id || (!answeringMemberId && isCapt);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAnsweringMemberId(m.id)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelectedPlayer
                          ? 'bg-amber-400/20 border-amber-400 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-[10px] text-amber-300 font-bold">
                        {isCapt ? '👑 القائد' : m.isReserve ? '🔄 لاعب 5' : `🎙️ مقعد ${idx + 1}`}
                      </div>
                      <div className="text-[11px] font-bold truncate mt-0.5">{m.name}</div>
                      <div className="text-[10px] text-slate-400">صف {m.grade}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Center Studio VS & Turn Switcher */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-[#d4af37] tracking-widest">TEAM VS TEAM</div>
              <div className="w-12 h-12 rounded-full bg-[#d4af37]/15 border-2 border-[#d4af37] flex items-center justify-center text-lg font-extrabold text-[#d4af37]">
                VS
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  const temp = selectedTeamId;
                  setSelectedTeamId(rivalTeamId);
                  setRivalTeamId(temp);
                  setAnsweringMemberId('');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-[11px] font-bold text-slate-200 transition-colors cursor-pointer w-full"
              >
                🔄 تبديل الدور بين الفريقين
              </button>
            </div>

            {/* Left Podium: Rival Team */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border-2 border-sky-400/60 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-sky-400 text-slate-950 text-[11px] font-bold">
                    🔥 منصة الفريق المنافس
                  </span>
                  <select
                    value={rivalTeamId}
                    onChange={(e) => setRivalTeamId(e.target.value)}
                    className="px-2.5 py-1 text-sm font-bold bg-slate-900 border border-sky-400/50 rounded-lg text-white"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.members.length} لاعبين)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold font-mono-num text-sky-400">
                    {rivalTeam?.points || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">نقطة</div>
                </div>
              </div>

              {/* 4 or 5 Players Podium Seats */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                {rivalTeam?.members.map((m, idx) => {
                  const isCapt = rivalTeam.captainId === m.id;
                  return (
                    <div
                      key={m.id}
                      className={`p-2 rounded-xl border text-center ${
                        isCapt
                          ? 'bg-sky-500/15 border-sky-400/60 text-white'
                          : 'bg-slate-900/90 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-[10px] text-sky-300 font-bold">
                        {isCapt ? '👑 القائد' : m.isReserve ? '🔄 لاعب 5' : `🎙️ مقعد ${idx + 1}`}
                      </div>
                      <div className="text-[11px] font-bold truncate mt-0.5">{m.name}</div>
                      <div className="text-[10px] text-slate-400">صف {m.grade}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Individual 1v1 Studio Podiums: Student 1 vs Student 2 */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Right Individual Podium */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border-2 border-emerald-400/70 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-400 text-slate-950 text-[11px] font-bold">
                    👤 المتسابق الفردي صاحب الدور
                  </span>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="px-2.5 py-1 text-sm font-bold bg-slate-900 border border-emerald-400/50 rounded-lg text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (صف {s.grade} - {s.className})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold font-mono-num text-emerald-400">
                    {activeStudentObj?.scores.total || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">نقطة فردية</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  🎓 الطالب: <strong className="text-white">{activeStudentObj?.name}</strong> (فصل {activeStudentObj?.className})
                </span>
                <span className="font-mono-num text-amber-300 font-bold">
                  كود: {activeStudentObj?.participationCode}
                </span>
              </div>
            </div>

            {/* Center 1v1 Switcher */}
            <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/70 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-bold text-emerald-400 tracking-widest">1 VS 1 SOLO</div>
              <div className="w-12 h-12 rounded-full bg-emerald-400/15 border-2 border-emerald-400 flex items-center justify-center text-lg font-extrabold text-emerald-400">
                1v1
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelectTile();
                  const temp = selectedStudentId;
                  setSelectedStudentId(rivalStudentId);
                  setRivalStudentId(temp);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-400 hover:text-slate-950 text-[11px] font-bold text-slate-200 transition-colors cursor-pointer w-full"
              >
                🔄 تبديل الدور بين الطالبين
              </button>
            </div>

            {/* Left Individual Podium */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-slate-950/90 border-2 border-sky-400/60 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-sky-400 text-slate-950 text-[11px] font-bold">
                    🔥 المتسابق الفردي المنافس
                  </span>
                  <select
                    value={rivalStudentId}
                    onChange={(e) => setRivalStudentId(e.target.value)}
                    className="px-2.5 py-1 text-sm font-bold bg-slate-900 border border-sky-400/50 rounded-lg text-white"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (صف {s.grade} - {s.className})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-extrabold font-mono-num text-sky-400">
                    {rivalStudentObj?.scores.total || 0}
                  </div>
                  <div className="text-[10px] text-slate-400">نقطة فردية</div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300">
                  🎓 الطالب: <strong className="text-white">{rivalStudentObj?.name}</strong> (فصل {rivalStudentObj?.className})
                </span>
                <span className="font-mono-num text-sky-300 font-bold">
                  كود: {rivalStudentObj?.participationCode}
                </span>
              </div>
            </div>
          </div>
        )}
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

              {renderTeamConsensusPanel(currentFalcon.options, fePhase === 'done', (finalIdx) => {
                setFeSelected(finalIdx);
                setFePhase('done');
                if (finalIdx === currentFalcon.correctIndex) {
                  soundEngine.playCorrect();
                  awardWithMultiplier(selectedTeamId, currentFalcon.points);
                } else {
                  soundEngine.playWrong();
                }
              })}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentFalcon.options.map((opt, idx) => {
                  const isCorrect = idx === currentFalcon.correctIndex;
                  const isChosen = feSelected === idx;
                  const voteStats = getVoteStats(currentFalcon.options.length);
                  const optVotes = voteStats.counts[idx] || 0;
                  const voteVisualCls = getOptionVoteVisualClass(
                    idx,
                    currentFalcon.options.length,
                    fePhase === 'done'
                  );
                  let cls = `bg-slate-900 border-slate-700 text-white hover:border-amber-400 ${voteVisualCls}`;
                  if (fePhase === 'done') {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={fePhase === 'done'}
                      onClick={() => {
                        if (playSystemMode === 'teams' && teamConsensusEnabled) {
                          castMemberVote(currentVoterId, idx);
                          return;
                        }
                        setFeSelected(idx);
                        setFePhase('done');
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, currentFalcon.points);
                        } else {
                          soundEngine.playWrong();
                        }
                      }}
                      className={`p-4 rounded-xl border text-right text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
                    >
                      <span>{opt}</span>
                      {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                          🗳️ {optVotes}
                        </span>
                      )}
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

          {renderTeamConsensusPanel(currentBrain.options, gbSelected !== null, (finalIdx) => {
            setGbSelected(finalIdx);
            if (finalIdx === currentBrain.correctIndex) {
              soundEngine.playCorrect();
              awardWithMultiplier(selectedTeamId, currentBrain.points);
            } else {
              soundEngine.playWrong();
            }
          })}

          <div className="space-y-3">
            {currentBrain.options.map((opt, idx) => {
              const isCorrect = idx === currentBrain.correctIndex;
              const isChosen = gbSelected === idx;
              const voteStats = getVoteStats(currentBrain.options.length);
              const optVotes = voteStats.counts[idx] || 0;
              const voteVisualCls = getOptionVoteVisualClass(
                idx,
                currentBrain.options.length,
                gbSelected !== null
              );
              let cls = `bg-slate-900 border-slate-700 text-slate-100 hover:border-amber-400 ${voteVisualCls}`;
              if (gbSelected !== null) {
                if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
              }
              return (
                <button
                  key={idx}
                  disabled={gbSelected !== null}
                  onClick={() => {
                    if (playSystemMode === 'teams' && teamConsensusEnabled) {
                      castMemberVote(currentVoterId, idx);
                      return;
                    }
                    setGbSelected(idx);
                    if (isCorrect) {
                      soundEngine.playCorrect();
                      awardWithMultiplier(selectedTeamId, currentBrain.points);
                    } else {
                      soundEngine.playWrong();
                    }
                  }}
                  className={`w-full p-4 rounded-xl border text-right text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
                >
                  <span>{opt}</span>
                  {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                      🗳️ {optVotes}
                    </span>
                  )}
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

          {renderTeamConsensusPanel(currentMysteryFact.options, mfSelected !== null, (finalIdx) => {
            setMfSelected(finalIdx);
            if (finalIdx === currentMysteryFact.correctIndex) {
              soundEngine.playCorrect();
              awardWithMultiplier(selectedTeamId, currentMysteryFact.points);
            } else {
              soundEngine.playWrong();
            }
          })}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentMysteryFact.options.map((opt, idx) => {
              const isCorrect = idx === currentMysteryFact.correctIndex;
              const isChosen = mfSelected === idx;
              const voteStats = getVoteStats(currentMysteryFact.options.length);
              const optVotes = voteStats.counts[idx] || 0;
              const voteVisualCls = getOptionVoteVisualClass(
                idx,
                currentMysteryFact.options.length,
                mfSelected !== null
              );
              let cls = `bg-slate-900 border-slate-700 text-slate-100 hover:border-amber-400 ${voteVisualCls}`;
              if (mfSelected !== null) {
                if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                else if (isChosen) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
              }
              return (
                <button
                  key={idx}
                  disabled={mfSelected !== null}
                  onClick={() => {
                    if (playSystemMode === 'teams' && teamConsensusEnabled) {
                      castMemberVote(currentVoterId, idx);
                      return;
                    }
                    setMfSelected(idx);
                    if (isCorrect) {
                      soundEngine.playCorrect();
                      awardWithMultiplier(selectedTeamId, currentMysteryFact.points);
                    } else {
                      soundEngine.playWrong();
                    }
                  }}
                  className={`p-4 rounded-xl border text-right text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
                >
                  <span>{opt}</span>
                  {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                      🗳️ {optVotes}
                    </span>
                  )}
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

              {renderTeamConsensusPanel(
                currentRiskQ.options,
                riskSelected !== null && !stealModeActive,
                (finalIdx) => {
                  const isCorrect = finalIdx === currentRiskQ.correctIndex;
                  if (stealModeActive) {
                    setStealSelected(finalIdx);
                    setStealModeActive(false);
                    if (isCorrect) {
                      soundEngine.playCorrect();
                      onAwardTeamPoints(rivalTeam.id, riskTier);
                    } else {
                      soundEngine.playWrong();
                    }
                    return;
                  }
                  setRiskSelected(finalIdx);
                  if (isCorrect) {
                    soundEngine.playCorrect();
                    awardWithMultiplier(selectedTeamId, riskTier);
                  } else {
                    soundEngine.playWrong();
                    if (settings.enableRiskPenalty) {
                      onAwardTeamPoints(selectedTeamId, -riskTier);
                    }
                  }
                }
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentRiskQ.options.map((opt, idx) => {
                  const isCorrect = idx === currentRiskQ.correctIndex;
                  const isChosen = riskSelected === idx;
                  const isStealChosen = stealSelected === idx;
                  const voteStats = getVoteStats(currentRiskQ.options.length);
                  const optVotes = voteStats.counts[idx] || 0;
                  const voteVisualCls = getOptionVoteVisualClass(
                    idx,
                    currentRiskQ.options.length,
                    riskSelected !== null && !stealModeActive
                  );

                  let cls = `bg-slate-950 border-slate-700 text-white hover:border-amber-400 ${voteVisualCls}`;
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
                        if (playSystemMode === 'teams' && teamConsensusEnabled) {
                          castMemberVote(currentVoterId, idx);
                          return;
                        }
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
                      className={`p-4 rounded-xl border text-right text-sm transition-all flex items-center justify-between gap-2 ${cls}`}
                    >
                      <span>{opt}</span>
                      {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                          🗳️ {optVotes}
                        </span>
                      )}
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

              {renderTeamConsensusPanel(currentBox.options, boxAnswerIdx !== null, (finalIdx) => {
                setBoxAnswerIdx(finalIdx);
                if (finalIdx === currentBox.correctIndex) {
                  soundEngine.playCorrect();
                  awardWithMultiplier(selectedTeamId, currentBox.bonusPoints);
                } else {
                  soundEngine.playWrong();
                }
              })}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentBox.options.map((opt, idx) => {
                  const isCorrect = idx === currentBox.correctIndex;
                  const isSelected = boxAnswerIdx === idx;
                  const voteStats = getVoteStats(currentBox.options.length);
                  const optVotes = voteStats.counts[idx] || 0;
                  const voteVisualCls = getOptionVoteVisualClass(
                    idx,
                    currentBox.options.length,
                    boxAnswerIdx !== null
                  );
                  let cls = `bg-slate-950 border-slate-700 text-white hover:border-amber-400 ${voteVisualCls}`;
                  if (boxAnswerIdx !== null) {
                    if (isCorrect) cls = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                    else if (isSelected) cls = 'bg-rose-500/20 border-rose-400 text-rose-200';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={boxAnswerIdx !== null}
                      onClick={() => {
                        if (playSystemMode === 'teams' && teamConsensusEnabled) {
                          castMemberVote(currentVoterId, idx);
                          return;
                        }
                        setBoxAnswerIdx(idx);
                        if (isCorrect) {
                          soundEngine.playCorrect();
                          awardWithMultiplier(selectedTeamId, currentBox.bonusPoints);
                        } else {
                          soundEngine.playWrong();
                        }
                      }}
                      className={`p-4 rounded-xl border text-right text-sm flex items-center justify-between gap-2 transition-all ${cls}`}
                    >
                      <span>{opt}</span>
                      {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-bold text-xs">
                          🗳️ {optVotes}
                        </span>
                      )}
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

      {/* ==================== GAME 12: 📺 AL-ABAKERA TV STUDIO BOARD (لوحة مجالات برنامج العباقرة) ==================== */}
      {activeGame === 'classic_board' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-[#131F38] border border-amber-400/40 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <span>📺 لوحة مجالات برنامج «العباقرة» الرسمية</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  ٨ مجالات × ٣ مستويات (١٠ - ٢٠ - ٣٠ نقطة)
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                يختار قائد الفريق ({activeCaptain?.name}) المجال وقيمة السؤال (١٠ أو ٢٠ أو ٣٠ نقطة). في حال الإجابة الخاطئة تنتقل فرصة سرقة السؤال للفريق المنافس ({rivalTeam?.name})!
              </p>
            </div>
            <button
              onClick={() => {
                setClassicAnswered({});
                setClassicActiveQ(null);
                setClassicChosen(null);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white cursor-pointer"
            >
              🔄 تصفير لوحة المجالات لمباراة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const catQs = INITIAL_QUESTIONS.filter((q) => q.categoryId === cat.id).slice(0, 3);
              return (
                <div
                  key={cat.id}
                  className="p-5 rounded-2xl bg-gradient-to-b from-[#162442] to-[#0F182C] border-2 border-slate-800 hover:border-amber-400/40 transition-all shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold font-display" style={{ color: cat.accentColor }}>
                      {cat.name}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{cat.subtitle}</p>
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
                            setClassicStealTurn(false);
                            setClassicTimer(30);
                            setClassicTimerRunning(true);
                          }}
                          className={`py-3.5 rounded-xl font-mono-num font-extrabold text-base border-2 transition-all cursor-pointer ${
                            used
                              ? 'bg-slate-950/80 border-slate-800/80 text-slate-600 cursor-not-allowed'
                              : 'bg-slate-950 border-amber-400/50 text-amber-300 hover:bg-amber-400 hover:text-slate-950 shadow-md'
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
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#17284A] to-[#0D1527] border-2 border-amber-400 shadow-2xl space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">
                    سؤال بقيمة {classicActiveQ.points} نقطة {doubleCardActive ? '(مضاعف ×٢)' : ''}
                  </span>
                  <span className="text-xs font-bold text-sky-300">
                    {classicStealTurn
                      ? `🔥 فرصة سرقة النقاط لفريق: ${rivalTeam?.name}`
                      : `🎤 السؤال موجه لفريق: ${activeTeam?.name}`}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`px-4 py-1.5 rounded-full font-mono-num font-bold text-sm border ${
                      classicTimer <= 10
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                        : 'bg-slate-950 border-amber-400/50 text-amber-300'
                    }`}
                  >
                    ⏱️ ساعة الاستوديو: {classicTimer} ثانية
                  </div>
                  <button
                    onClick={() => {
                      setClassicActiveQ(null);
                      setClassicTimerRunning(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    إغلاق ✕
                  </button>
                </div>
              </div>

              <h4 className="text-xl sm:text-2xl font-bold text-white font-display leading-relaxed">
                {classicActiveQ.question}
              </h4>

              {/* 🗳️ Live Team Consensus Voting Bar before locking the question */}
              {renderTeamConsensusPanel(
                classicActiveQ.options,
                classicChosen !== null,
                (finalIdx) => {
                  const targetTeam = classicStealTurn ? rivalTeamId : selectedTeamId;
                  const isCorrect = finalIdx === classicActiveQ.correctIndex;
                  if (isCorrect) {
                    setClassicChosen(finalIdx);
                    setClassicTimerRunning(false);
                    setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                    soundEngine.playCorrect();
                    awardWithMultiplier(targetTeam, classicActiveQ.points);
                  } else {
                    soundEngine.playWrong();
                    if (!classicStealTurn) {
                      setClassicStealTurn(true);
                      setClassicTimer(15);
                    } else {
                      setClassicChosen(finalIdx);
                      setClassicTimerRunning(false);
                      setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                    }
                  }
                }
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {classicActiveQ.options.map((opt, idx) => {
                  const isCorrect = idx === classicActiveQ.correctIndex;
                  const isChosen = classicChosen === idx;
                  const voteStats = getVoteStats(classicActiveQ.options.length);
                  const optVotes = voteStats.counts[idx] || 0;
                  const optVoters = voteStats.votersByOption[idx] || [];
                  const isLeadingVote =
                    playSystemMode === 'teams' &&
                    teamConsensusEnabled &&
                    classicChosen === null &&
                    voteStats.leadingOptionIdx === idx;

                  const voteVisualCls = getOptionVoteVisualClass(
                    idx,
                    classicActiveQ.options.length,
                    classicChosen !== null
                  );

                  let cls =
                    'bg-slate-950/90 border-slate-700 text-white hover:border-amber-400 hover:bg-slate-900';
                  if (classicChosen !== null) {
                    if (isCorrect)
                      cls = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold';
                    else if (isChosen) cls = 'bg-rose-500/25 border-rose-400 text-rose-200';
                  } else if (isLeadingVote) {
                    cls = `bg-amber-400/15 border-amber-400 text-white shadow-lg ${voteVisualCls}`;
                  } else if (voteVisualCls) {
                    cls = `bg-slate-900 text-white ${voteVisualCls}`;
                  }

                  return (
                    <button
                      key={idx}
                      disabled={classicChosen !== null}
                      onClick={() => {
                        if (playSystemMode === 'teams' && teamConsensusEnabled) {
                          // Cast vote for the currently selected team member instead of immediately locking
                          castMemberVote(currentVoterId, idx);
                          return;
                        }
                        const targetTeam = classicStealTurn ? rivalTeamId : selectedTeamId;
                        if (isCorrect) {
                          setClassicChosen(idx);
                          setClassicTimerRunning(false);
                          setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                          soundEngine.playCorrect();
                          awardWithMultiplier(targetTeam, classicActiveQ.points);
                        } else {
                          soundEngine.playWrong();
                          if (!classicStealTurn) {
                            // Offer steal opportunity to Rival Team just like Al-Abakera!
                            setClassicStealTurn(true);
                            setClassicTimer(15);
                          } else {
                            setClassicChosen(idx);
                            setClassicTimerRunning(false);
                            setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                          }
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 text-right text-sm sm:text-base transition-all cursor-pointer flex flex-col gap-2 ${cls}`}
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono-num text-amber-300 shrink-0">
                            {idx + 1}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {playSystemMode === 'teams' && teamConsensusEnabled && optVotes > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono-num font-extrabold text-xs shrink-0">
                            🗳️ {optVotes} {optVotes === 1 ? 'صوت' : 'أصوات'}
                          </span>
                        )}
                      </div>

                      {playSystemMode === 'teams' && teamConsensusEnabled && optVoters.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800/80">
                          {optVoters.map((v) => (
                            <span
                              key={v.id}
                              className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-amber-300 border border-amber-400/30"
                            >
                              {v.isCaptain ? '👑 ' : '👤 '}
                              {v.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {classicStealTurn && classicChosen === null && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400 text-amber-200 text-xs font-bold flex items-center justify-between">
                  <span>
                    ⚠️ أخطأ {activeTeam?.name}! انتقل السؤال الآن إلى {rivalTeam?.name} لسرقة النقاط خلال ١٥ ثانية!
                  </span>
                  <button
                    onClick={() => {
                      setClassicChosen(-1);
                      setClassicTimerRunning(false);
                      setClassicAnswered((prev) => ({ ...prev, [classicActiveQ.id]: true }));
                    }}
                    className="px-3 py-1 rounded bg-slate-900 text-slate-300 hover:text-white"
                  >
                    كشف الإجابة وإنهاء السؤال
                  </button>
                </div>
              )}

              {classicChosen !== null && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-300">
                    <strong className="text-amber-400">💡 معلومة العباقرة:</strong>{' '}
                    {classicActiveQ.explanation}
                  </div>
                  <button
                    onClick={() => {
                      // Switch turn automatically to the other podium
                      if (playSystemMode === 'individual') {
                        const tempStu = selectedStudentId;
                        setSelectedStudentId(rivalStudentId);
                        setRivalStudentId(tempStu);
                      } else {
                        const temp = selectedTeamId;
                        setSelectedTeamId(rivalTeamId);
                        setRivalTeamId(temp);
                      }
                      setClassicActiveQ(null);
                      setClassicChosen(null);
                      setClassicStealTurn(false);
                    }}
                    className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap cursor-pointer"
                  >
                    السؤال التالي وتبديل الدور للمنصة الأخرى ←
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
