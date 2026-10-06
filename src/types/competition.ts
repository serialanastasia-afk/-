export type GradeNumber = '4' | '5' | '6';

export type QualifierDomain =
  | 'science'
  | 'math'
  | 'arabic'
  | 'egypt_world'
  | 'logic'
  | 'observation'
  | 'general_culture'
  | 'technology';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QualifierQuestion {
  id: string;
  domain: QualifierDomain;
  difficulty: DifficultyLevel;
  grade: GradeNumber | 'all';
  question: string;
  contextPassage?: string; // للمعلومة الجديدة أو اللغز
  visualGrid?: string[]; // لأسئلة الملاحظة البصرية والأنماط
  options: string[];
  correctIndex: number;
  points: number;
  timeSeconds: number;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: GradeNumber;
  className: string;
  participationCode: string;
  parentPhone?: string;
  teamId?: string;
  completedQualifier: boolean;
  qualifierSubmittedAt?: string;
  qualifierDurationSeconds?: number;
  scores: {
    total: number;
    speedScore: number;
    logic: number;
    science: number;
    arabic: number;
    observation: number;
    math: number;
    egypt_world: number;
    general_culture: number;
    technology: number;
  };
  qualifiedForFinals: boolean;
  badges: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  grade: GradeNumber;
  isReserve?: boolean;
}

export interface Team {
  id: string;
  name: string;
  emblem: string;
  color: string;
  captainId: string;
  members: TeamMember[];
  points: number;
  wins: number;
  matchesPlayed: number;
  titleBadge: string;
  cards: {
    challengeCard: boolean; // 🃏 كارت التحدي
    swapQuestionCard: boolean; // 🃏 كارت تبديل السؤال
    doublePointsCard: boolean; // 🃏 كارت مضاعفة النقاط
  };
}

export interface JourneyNode {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  targetView: AppView;
  gameTab?: ChallengeGameId;
  unlockedByDefault?: boolean;
}

export type ChallengeGameId =
  | 'falcon_eye'
  | 'lightning_speed'
  | 'genius_brain'
  | 'mystery_fact'
  | 'risk_challenge'
  | 'point_steal'
  | 'mystery_box'
  | 'no_talking'
  | 'genius_alarm'
  | 'egypt_minute'
  | 'escape_room'
  | 'classic_board';

export type AppView =
  | 'home'
  | 'journey'
  | 'qualifiers'
  | 'practice'
  | 'genius_card'
  | 'games_hub'
  | 'teams'
  | 'tournament'
  | 'leaderboard'
  | 'awards'
  | 'how_to_play'
  | 'admin';

export interface CompetitionAward {
  id: string;
  icon: string;
  title: string;
  desc: string;
  categoryType: 'student' | 'team' | 'both';
  winnerType?: 'student' | 'team' | null;
  winnerId?: string | null;
  citationNote?: string;
  awardedAt?: string;
}

export interface CompetitionSettings {
  startDate: string;
  endDate: string;
  qualifierDurationMinutes: number;
  qualifiedStudentsTarget: number;
  tournamentBracketSize: 16 | 8 | 4 | 2;
  allowBackNavigationInQualifier: boolean;
  enableRiskPenalty: boolean;
  showResultsDuringQualifiers: boolean;
  activeRoundStatus: 'qualifiers_open' | 'team_formation' | 'finals_live' | 'completed';
}

export interface MatchItem {
  id: string;
  round: 'R16' | 'QF' | 'SF' | 'FINAL';
  team1Id: string;
  team2Id: string;
  team1Score: number;
  team2Score: number;
  winnerId?: string;
  status: 'upcoming' | 'live' | 'finished';
}
