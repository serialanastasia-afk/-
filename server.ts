import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };
import {
  QualifierQuestion,
  PublicExamQuestion,
  OfficialExamAttempt,
  StudentProfile,
  CompetitionSettings,
  SeasonOneConfig,
  GradeNumber,
  QualifierDomain,
} from './src/types/competition.ts';
import {
  evaluateSeasonOneQuestionBankReadiness,
  getDeduplicatedSeasonOnePool,
  gradeStudentExamAutomatically,
  resolveStageFromGrade,
} from './src/services/qualificationEngine.ts';

const SERVER_DEFAULT_SETTINGS: CompetitionSettings = {
  currentSeasonId: 'season_1',
  seasonName: 'الموسم الأول — دماغ عالية',
  seasonStatus: 'registration_open',
  qualificationPathMode: 'hierarchical',
  currentHierarchyLevel: 'school',
  activeAnnualPhaseId: 'phase_2_administration',
  annualPhases: [],
  monthlyChallenges: [],
  schoolScoringFormula: {
    avgStudentPointsWeight: 1.5,
    qualifiedStudentsBonus: 45,
    topThreePodiumBonus: 85,
    teamWinsBonus: 35,
    maxParticipationCapBonus: 90,
  },
  stageQuotas: {
    primary_lower: 100,
    primary_upper: 150,
    preparatory: 100,
    secondary: 80,
  },
  resultsCertified: false,
  participatingStages: ['primary_upper'],
  participatingGrades: ['4', '5', '6'],
  defaultCountry: 'مصر 🇪🇬',
  defaultRegion: 'القاهرة',
  defaultAdministration: 'إدارة المعادي التعليمية',
  defaultSchoolName: '',
  qualifierBlueprint: {
    arabic: 5,
    math: 5,
    science: 4,
    egypt_world: 4,
    english: 4,
    general_culture: 4,
    logic: 4,
  },
  questionsCountPerExam: 30,
  qualifierDurationMinutes: 30,
  allowedAttemptsPerStudent: 1,
  randomizeQuestionsOrder: true,
  randomizeOptionsOrder: true,
  allowBackNavigationInQualifier: true,
  scoringMethod: 'standard_points',
  enableElectronicTieBreaker: true,
  enableRiskPenalty: false,
  startDate: '',
  endDate: '',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Private Server-Only Vault file (NEVER served by Vite or Express static)
const SERVER_VAULT_PATH = path.join(__dirname, '.server_exam_vault.json');
const BOOTSTRAPPED_ADMIN_EMAIL = 'serialanastasia@gmail.com';

interface PrivateAttemptKeyRecord {
  questionId: string;
  displayedCorrectIndex: number;
  originalCorrectIndex: number;
  displayedToOriginalOptionIndex: number[];
  domain: QualifierDomain;
  version: number;
}

interface ServerExamVault {
  updatedAt: string;
  questions: QualifierQuestion[];
  seasonOne: SeasonOneConfig | null;
  settings: CompetitionSettings;
  attempts: Record<string, OfficialExamAttempt>;
  attemptAnswerKeys: Record<string, Record<string, PrivateAttemptKeyRecord>>;
}

function readServerVault(): ServerExamVault {
  try {
    if (fs.existsSync(SERVER_VAULT_PATH)) {
      const raw = fs.readFileSync(SERVER_VAULT_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<ServerExamVault>;
      return {
        updatedAt: parsed.updatedAt || new Date().toISOString(),
        questions: Array.isArray(parsed.questions) ? parsed.questions : [],
        seasonOne: parsed.seasonOne || null,
        settings: parsed.settings
          ? ({ ...SERVER_DEFAULT_SETTINGS, ...parsed.settings } as CompetitionSettings)
          : { ...SERVER_DEFAULT_SETTINGS },
        attempts: parsed.attempts || {},
        attemptAnswerKeys: parsed.attemptAnswerKeys || {},
      };
    }
  } catch {}
  return {
    updatedAt: new Date().toISOString(),
    questions: [],
    seasonOne: null,
    settings: { ...SERVER_DEFAULT_SETTINGS },
    attempts: {},
    attemptAnswerKeys: {},
  };
}

function writeServerVault(vault: ServerExamVault): void {
  try {
    fs.writeFileSync(SERVER_VAULT_PATH, JSON.stringify(vault, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write server vault:', err);
  }
}

// Dedicated Server-Side Firebase Instance for reading public/student metadata when available
const serverFirebaseApp = initializeApp(firebaseConfig, 'trusted-backend-server');
const serverDb = getFirestore(serverFirebaseApp, firebaseConfig.firestoreDatabaseId);

function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return function () {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Verifies a Firebase Auth ID Token via Google Identity Toolkit REST API
 */
async function verifyFirebaseIdToken(idToken: string): Promise<{
  uid: string;
  email?: string;
  emailVerified?: boolean;
} | null> {
  if (!idToken) return null;
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      users?: { localId: string; email?: string; emailVerified?: boolean }[];
    };
    const user = data.users?.[0];
    if (!user || !user.localId) return null;
    return {
      uid: user.localId,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
    };
  } catch {
    return null;
  }
}

async function verifyIsSupervisorToken(idToken: string): Promise<boolean> {
  const verified = await verifyFirebaseIdToken(idToken);
  if (!verified) return false;
  if (
    verified.email &&
    verified.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    verified.emailVerified
  ) {
    return true;
  }
  return false;
}

async function loadAuthoritativeSettingsAndQuestions(): Promise<{
  settings: CompetitionSettings;
  seasonOne: SeasonOneConfig | null;
  questions: QualifierQuestion[];
}> {
  const vault = readServerVault();
  const baseSettings: CompetitionSettings = {
    ...SERVER_DEFAULT_SETTINGS,
    ...(vault.settings || {}),
  };

  let seasonOne: SeasonOneConfig | null = vault.seasonOne;
  try {
    const pubSeasonSnap = await getDoc(doc(serverDb, 'public_platform', 'season_1'));
    if (pubSeasonSnap.exists()) {
      seasonOne = {
        ...(seasonOne || {}),
        ...(pubSeasonSnap.data() as SeasonOneConfig),
      };
    }
  } catch {}

  if (seasonOne) {
    baseSettings.participatingGrades =
      Array.isArray(seasonOne.eligibleGrades) && seasonOne.eligibleGrades.length > 0
        ? seasonOne.eligibleGrades
        : ['4', '5', '6'];
    baseSettings.qualifierBlueprint = seasonOne.qualifierBlueprint || baseSettings.qualifierBlueprint;
    baseSettings.questionsCountPerExam = seasonOne.examSettings?.questionsCount ?? 30;
    baseSettings.qualifierDurationMinutes = seasonOne.examSettings?.durationMinutes ?? 30;
    baseSettings.allowedAttemptsPerStudent = seasonOne.examSettings?.allowedAttempts ?? 1;
    baseSettings.randomizeQuestionsOrder = seasonOne.examSettings?.randomizeQuestions ?? true;
    baseSettings.randomizeOptionsOrder = seasonOne.examSettings?.randomizeOptions ?? true;
    baseSettings.allowBackNavigationInQualifier =
      seasonOne.examSettings?.allowBackNavigation ?? true;
  }

  return {
    settings: baseSettings,
    seasonOne,
    questions: vault.questions,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Block any HTTP request attempting to access `.server_exam_vault.json`
  app.use((req, res, next) => {
    if (req.path.includes('.server_exam_vault')) {
      res.status(403).json({ error: 'Access Denied' });
      return;
    }
    next();
  });

  /**
   * 1. GET /api/server/identity
   * Health & Status endpoint for the Trusted Express Exam Engine.
   */
  app.get('/api/server/identity', (_req, res) => {
    const vault = readServerVault();
    res.json({
      serverUid: 'trusted-express-exam-engine-v1',
      status: 'READY',
      vaultQuestionCount: vault.questions.length,
      updatedAt: vault.updatedAt,
    });
  });

  /**
   * 2. POST /api/admin/sync-question-bank
   * Protected endpoint (`isAdmin()` verified via Firebase ID Token with Google Identity Toolkit).
   * Synchronizes the authoritative Question Bank (`platform/custom_questions`) and Season 1 settings
   * into the Trusted Server's Private Vault so the server can generate attempts and grade submissions
   * without ever exposing `correctIndex`, `explanation`, or the unselected Question Bank to students.
   */
  app.post('/api/admin/sync-question-bank', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const isSupervisor = await verifyIsSupervisorToken(idToken);
      if (!isSupervisor) {
        res.status(403).json({
          error: '🔒 غير مصرح: مزامنة بنك الأسئلة مع الخادم الموثوق متاحة فقط للمشرفة العامة الموثقة.',
        });
        return;
      }

      const { questions, seasonOne, settings } = req.body as {
        questions?: QualifierQuestion[];
        seasonOne?: SeasonOneConfig;
        settings?: CompetitionSettings;
      };

      const vault = readServerVault();
      if (Array.isArray(questions)) {
        vault.questions = questions;
      }
      if (seasonOne && typeof seasonOne === 'object') {
        vault.seasonOne = seasonOne;
      }
      if (settings && typeof settings === 'object') {
        vault.settings = { ...vault.settings, ...settings };
      }
      vault.updatedAt = new Date().toISOString();
      writeServerVault(vault);

      res.json({
        ok: true,
        syncedQuestionsCount: vault.questions.length,
        updatedAt: vault.updatedAt,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `تعذر مزامنة بنك الأسئلة مع الخادم الموثوق: ${msg}` });
    }
  });

  /**
   * 3. POST /api/exam/start
   * Trusted Server-Side Exam Attempt Generator.
   * - Verifies student identity, grade, season, phase, allowedAttempts, and Blueprint readiness.
   * - Selects 30 unique questions from the Private Server Question Bank according to the Season 1 Blueprint:
   *   arabic=5, math=5, science=4, egypt_world=4, english=4, general_culture=4, logic=4.
   * - Randomizes question order and option order ON THE SERVER.
   * - Stores the private option mapping + answer key inside the Server Vault (`attemptAnswerKeys[attemptId]`).
   * - Returns ONLY the 30 selected sanitized questions (`PublicExamQuestion[]` — NO `correctIndex`, NO `explanation`, NO unselected bank questions).
   */
  app.post('/api/exam/start', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const verifiedUser = idToken ? await verifyFirebaseIdToken(idToken) : null;

      const { studentId, participationCode, studentSnapshot } = req.body as {
        studentId?: string;
        participationCode?: string;
        studentSnapshot?: Partial<StudentProfile>;
      };

      if (!studentId || typeof studentId !== 'string') {
        res.status(400).json({ error: 'معرّف الطالب (studentId) مطلوب لبدء المحاولة الرسمية.' });
        return;
      }

      const safeStuId = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const { settings, seasonOne, questions } = await loadAuthoritativeSettingsAndQuestions();

      // Verify student record from public `leaderboard_students/{studentId}` or provided registration snapshot
      let student: StudentProfile | null = null;
      try {
        const pubStuSnap = await getDoc(doc(serverDb, 'leaderboard_students', safeStuId));
        if (pubStuSnap.exists()) {
          student = pubStuSnap.data() as StudentProfile;
        }
      } catch {}

      if (!student && studentSnapshot && studentSnapshot.id && studentSnapshot.grade) {
        student = studentSnapshot as StudentProfile;
      }

      if (!student) {
        res.status(404).json({ error: 'لم يتم العثور على سجل الطالب في قاعدة البيانات الرسمية.' });
        return;
      }

      // Ownership / Participation Code verification
      if (
        verifiedUser &&
        student.ownerUid &&
        student.ownerUid !== student.id &&
        student.ownerUid !== verifiedUser.uid
      ) {
        res.status(403).json({ error: 'غير مصرح لك ببدء اختبار لطالب آخر.' });
        return;
      }
      if (
        participationCode &&
        student.participationCode &&
        student.participationCode.toUpperCase() !== participationCode.trim().toUpperCase()
      ) {
        res.status(403).json({ error: 'كود المشاركة غير مطابق لسجل الطالب.' });
        return;
      }

      // Check Eligible Grades (4, 5, 6)
      const eligibleGrades: GradeNumber[] =
        Array.isArray(settings.participatingGrades) && settings.participatingGrades.length > 0
          ? settings.participatingGrades
          : ['4', '5', '6'];

      if (!eligibleGrades.includes(student.grade)) {
        res.status(403).json({
          error: `الصف الدراسي (${student.grade}) غير مدرج ضمن الفئة المستهدفة للموسم الأول (٤ - ٦ ابتدائي).`,
        });
        return;
      }

      // Single Attempt Enforcement
      const maxAttempts = settings.allowedAttemptsPerStudent || 1;
      const usedAttempts = student.attemptsUsed || (student.completedQualifier ? 1 : 0);
      if (student.completedQualifier || usedAttempts >= maxAttempts) {
        res.status(403).json({
          error: `🔒 قام النظام بمنع إعادة المحاولة: تم استنفاد المحاولة الرسمية المسموحة (${usedAttempts}/${maxAttempts}).`,
        });
        return;
      }

      // Check if an active or already submitted attempt exists in the Server Vault
      const vault = readServerVault();
      const attemptId = `att_s1_st1_${safeStuId}`;
      const existingAttempt = vault.attempts[attemptId];
      if (existingAttempt) {
        if (existingAttempt.status === 'submitted') {
          res.status(403).json({
            error: '🔒 تم تسليم هذه المحاولة الرسمية مسبقًا ولا يُسمح بإعادة المحاولة.',
          });
          return;
        }
        if (
          existingAttempt.status === 'in_progress' &&
          existingAttempt.expiresAtMs > Date.now()
        ) {
          res.json({ attempt: existingAttempt });
          return;
        }
      }

      // Verify Blueprint Readiness on the Trusted Server
      const readiness = evaluateSeasonOneQuestionBankReadiness(questions, settings);
      if (!readiness.isReady) {
        res.status(400).json({
          error: `🔒 المرحلة الأولى (التأهيل) غير جاهزة للبدء (NOT READY — المكتمل: ${readiness.fulfilledCount}/${readiness.totalRequired}).`,
          readiness,
        });
        return;
      }

      // Select 30 deduplicated questions matching the exact Blueprint
      const poolToUse = getDeduplicatedSeasonOnePool(
        questions,
        eligibleGrades,
        'stage_1_qualifiers'
      );

      const blueprint = settings.qualifierBlueprint || {
        arabic: 5,
        math: 5,
        science: 4,
        egypt_world: 4,
        english: 4,
        general_culture: 4,
        logic: 4,
      };

      const quotaOrder: { domain: QualifierDomain; count: number }[] = [
        { domain: 'arabic', count: blueprint.arabic ?? 5 },
        { domain: 'math', count: blueprint.math ?? 5 },
        { domain: 'science', count: blueprint.science ?? 4 },
        { domain: 'egypt_world', count: blueprint.egypt_world ?? 4 },
        { domain: 'english', count: blueprint.english ?? 4 },
        { domain: 'general_culture', count: blueprint.general_culture ?? 4 },
        { domain: 'logic', count: blueprint.logic ?? 4 },
      ];

      const rand = createSeededRandom(`${student.participationCode}-${student.id}-${Date.now()}`);
      const selectedFullQuestions: QualifierQuestion[] = [];
      const selectedIds = new Set<string>();
      const selectedTexts = new Set<string>();

      for (const { domain, count } of quotaOrder) {
        const domQuestions = poolToUse.filter(
          (q) =>
            q.domain === domain &&
            !selectedIds.has(q.id) &&
            !selectedTexts.has(q.question.trim().toLowerCase())
        );
        const easyQs = seededShuffle(
          domQuestions.filter((q) => q.difficulty === 'easy'),
          rand
        );
        const mediumQs = seededShuffle(
          domQuestions.filter((q) => q.difficulty === 'medium'),
          rand
        );
        const hardQs = seededShuffle(
          domQuestions.filter((q) => q.difficulty === 'hard'),
          rand
        );
        const combinedDom = seededShuffle([...easyQs, ...mediumQs, ...hardQs], rand);
        const picked = combinedDom.slice(0, count);
        if (picked.length < count) {
          res.status(400).json({
            error: `بنك الأسئلة غير مكتمل في مجال (${domain}) ولا يُسمح بتكرار الأسئلة.`,
          });
          return;
        }
        picked.forEach((q) => {
          selectedIds.add(q.id);
          selectedTexts.add(q.question.trim().toLowerCase());
          selectedFullQuestions.push(q);
        });
      }

      const targetTotal = settings.questionsCountPerExam || 30;
      if (selectedFullQuestions.length !== targetTotal) {
        res.status(400).json({ error: 'تعذر بناء الاختبار الرسمي بالعدد المطلوب (30 سؤالًا).' });
        return;
      }

      // Randomize question order on the server
      const orderedFull =
        settings.randomizeQuestionsOrder !== false
          ? seededShuffle(selectedFullQuestions, rand)
          : selectedFullQuestions;

      // Randomize options on the server and build:
      // 1) Sanitized PublicExamQuestion[] for the student (NO correctIndex, NO explanation, NO optionOriginalIndices)
      // 2) Server-side private answer map for this attempt (`questionId -> PrivateAttemptKeyRecord`)
      const sanitizedAttemptQuestions: PublicExamQuestion[] = [];
      const privateAttemptAnswerMap: Record<string, PrivateAttemptKeyRecord> = {};

      orderedFull.forEach((q) => {
        const indexedOptions = q.options.map((text, idx) => ({
          text,
          originalIndex: idx,
          isCorrect: idx === q.correctIndex,
        }));
        const finalOpts =
          settings.randomizeOptionsOrder !== false
            ? seededShuffle(indexedOptions, rand)
            : indexedOptions;

        const displayedCorrectIndex = finalOpts.findIndex((o) => o.isCorrect);
        const versionNum = typeof q.version === 'number' && q.version > 0 ? q.version : 1;

        privateAttemptAnswerMap[q.id] = {
          questionId: q.id,
          displayedCorrectIndex,
          originalCorrectIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          displayedToOriginalOptionIndex: finalOpts.map((o) => o.originalIndex),
          domain: q.domain,
          version: versionNum,
        };

        const pubQ: PublicExamQuestion = {
          id: q.id,
          seasonId: q.seasonId || seasonOne?.seasonId || 'season_1',
          phaseId: q.phaseId || 'stage_1_qualifiers',
          grade: q.grade || 'all',
          stage: q.stage || 'primary_upper',
          domain: q.domain,
          difficulty: q.difficulty,
          question: q.question,
          options: finalOpts.map((o) => o.text),
          points: 1,
          timeSeconds: typeof q.timeSeconds === 'number' ? q.timeSeconds : 60,
          version: versionNum,
        };
        if (q.contextPassage && q.contextPassage.trim()) {
          pubQ.contextPassage = q.contextPassage.trim();
        }
        if (Array.isArray(q.visualGrid) && q.visualGrid.length > 0) {
          pubQ.visualGrid = q.visualGrid;
        }
        sanitizedAttemptQuestions.push(cleanUndefined(pubQ));
      });

      const nowMs = Date.now();
      const durationMs = (settings.qualifierDurationMinutes || 30) * 60 * 1000;
      const expiresAtMs = nowMs + durationMs;
      const startedAtIso = new Date(nowMs).toISOString();
      const expiresAtIso = new Date(expiresAtMs).toISOString();

      const attemptDoc: OfficialExamAttempt = cleanUndefined({
        id: attemptId,
        attemptId,
        studentId: safeStuId,
        ownerUid: student.ownerUid || verifiedUser?.uid || safeStuId,
        participationCode: student.participationCode,
        seasonId: seasonOne?.seasonId || 'season_1',
        phaseId: 'stage_1_qualifiers',
        grade: student.grade,
        stage: student.stage || resolveStageFromGrade(student.grade),
        questionIds: sanitizedAttemptQuestions.map((q) => q.id),
        questionVersions: sanitizedAttemptQuestions.map((q) => ({
          questionId: q.id,
          version: q.version,
          domain: q.domain,
        })),
        questions: sanitizedAttemptQuestions,
        startedAt: startedAtIso,
        startedAtMs: nowMs,
        expiresAt: expiresAtIso,
        expiresAtMs,
        status: 'in_progress',
      });

      vault.attempts[attemptId] = attemptDoc;
      vault.attemptAnswerKeys[attemptId] = privateAttemptAnswerMap;
      writeServerVault(vault);

      res.json({ attempt: attemptDoc });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `تعذر إنشاء المحاولة الرسمية من الخادم الموثوق: ${msg}` });
    }
  });

  /**
   * 4. POST /api/exam/submit
   * Trusted Server-Side Exam Grading & Final Result Generation.
   * - Student sends `{ attemptId, studentId, answers, autoSubmittedOnTimeout }`.
   * - Server reads the private key from `vault.attemptAnswerKeys[attemptId]`.
   * - Server grades the attempt (Correct = 1, Wrong = 0, Unanswered = 0, No risk penalty, Speed is tie-breaker only).
   * - Server locks the attempt (`status: 'submitted'`) and generates a cryptographic `serverGradingSignature`
   *   so the result cannot be forged or re-submitted.
   * - Server NEVER returns the answer key (`correctIndex`) to the client.
   */
  app.post('/api/exam/submit', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      const verifiedUser = idToken ? await verifyFirebaseIdToken(idToken) : null;

      const { attemptId, studentId, answers, autoSubmittedOnTimeout, studentSnapshot } = req.body as {
        attemptId?: string;
        studentId?: string;
        answers?: Record<string, number>;
        autoSubmittedOnTimeout?: boolean;
        studentSnapshot?: Partial<StudentProfile>;
      };

      if (!attemptId || !studentId) {
        res.status(400).json({ error: 'بيانات تسليم المحاولة غير مكتملة (attemptId, studentId).' });
        return;
      }

      const safeStuId = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeAttemptId = attemptId.replace(/[^a-zA-Z0-9_-]/g, '_');

      const vault = readServerVault();
      const attempt = vault.attempts[safeAttemptId];
      const answerMap = vault.attemptAnswerKeys[safeAttemptId];
      const { settings } = await loadAuthoritativeSettingsAndQuestions();

      if (!attempt || !answerMap) {
        res.status(404).json({ error: 'لم يتم العثور على المحاولة الرسمية المطلوبة في الخادم الموثوق.' });
        return;
      }

      let student: StudentProfile | null = null;
      try {
        const pubStuSnap = await getDoc(doc(serverDb, 'leaderboard_students', safeStuId));
        if (pubStuSnap.exists()) {
          student = pubStuSnap.data() as StudentProfile;
        }
      } catch {}

      if (!student && studentSnapshot && studentSnapshot.id) {
        student = studentSnapshot as StudentProfile;
      }
      if (!student) {
        res.status(404).json({ error: 'لم يتم العثور على سجل الطالب.' });
        return;
      }

      if (attempt.studentId !== safeStuId) {
        res.status(403).json({ error: 'هذه المحاولة لا تخص هذا الطالب.' });
        return;
      }
      if (
        verifiedUser &&
        student.ownerUid &&
        student.ownerUid !== student.id &&
        student.ownerUid !== verifiedUser.uid
      ) {
        res.status(403).json({ error: 'غير مصرح لك بتسليم محاولة لطالب آخر.' });
        return;
      }
      if (attempt.status === 'submitted' || student.completedQualifier) {
        res.status(403).json({
          error: '🔒 تم تسليم هذه المحاولة الرسمية مسبقًا ولا يمكن إعادة تسليمها أو تعديل نتيجتها.',
        });
        return;
      }

      const safeAnswers: Record<string, number> =
        answers && typeof answers === 'object' ? answers : {};

      const verifiedCorrectIds = new Set<string>();
      const reconstructedQuestions: QualifierQuestion[] = attempt.questions.map((pubQ) => {
        const keyInfo = answerMap[pubQ.id];
        const chosenDisplayedIdx = safeAnswers[pubQ.id];
        if (
          keyInfo &&
          chosenDisplayedIdx !== undefined &&
          chosenDisplayedIdx !== null &&
          Number.isInteger(chosenDisplayedIdx) &&
          chosenDisplayedIdx === keyInfo.displayedCorrectIndex
        ) {
          verifiedCorrectIds.add(pubQ.id);
        }
        return {
          ...pubQ,
          optionOriginalIndices: keyInfo?.displayedToOriginalOptionIndex || [0, 1, 2, 3],
        };
      });

      const nowMs = Date.now();
      const maxDurationSec = (settings.qualifierDurationMinutes || 30) * 60;
      const rawElapsedSec = Math.floor((nowMs - (attempt.startedAtMs || nowMs - 60000)) / 1000);
      const elapsedSeconds = Math.max(15, Math.min(maxDurationSec, rawElapsedSec));

      const entryTimeFormatted = new Date(attempt.startedAtMs || nowMs).toLocaleTimeString(
        'ar-EG',
        {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }
      );

      const gradedStudent = gradeStudentExamAutomatically(
        student,
        reconstructedQuestions,
        safeAnswers,
        elapsedSeconds,
        entryTimeFormatted,
        Boolean(autoSubmittedOnTimeout),
        settings,
        verifiedCorrectIds
      );

      const activePhaseId = settings.activeAnnualPhaseId || 'phase_2_administration';
      const enrichedStudent: StudentProfile = cleanUndefined({
        ...gradedStudent,
        id: safeStuId,
        ownerUid: student.ownerUid || verifiedUser?.uid || safeStuId,
        xp: gradedStudent.scores.total,
        achievementsCount: gradedStudent.badges.length,
        currentAnnualPhaseReached: activePhaseId,
        annualPhaseScores: {
          ...(gradedStudent.annualPhaseScores || {}),
          [activePhaseId]: gradedStudent.scores.total,
        },
      });

      const submittedAtIso = new Date(nowMs).toISOString();
      const updatedAttempt: OfficialExamAttempt = cleanUndefined({
        ...attempt,
        status: 'submitted',
        submittedAt: submittedAtIso,
        score: enrichedStudent.scores.total,
        correctCount: enrichedStudent.gradingReport?.correctCount ?? enrichedStudent.scores.total,
      });

      vault.attempts[safeAttemptId] = updatedAttempt;
      writeServerVault(vault);

      // Compute a server-side cryptographic seal over the attempt and score
      const sealToken = crypto
        .createHash('sha256')
        .update(`${safeAttemptId}:${safeStuId}:${enrichedStudent.scores.total}:${submittedAtIso}`)
        .digest('hex');

      res.json({
        gradedStudent: enrichedStudent,
        attempt: updatedAttempt,
        serverGradingSeal: sealToken,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      res.status(500).json({ error: `تعذر تصحيح وحفظ نتيجة المحاولة الرسمية: ${msg}` });
    }
  });

  // Mount Vite in development or static dist in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trusted Exam Server & Vite running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
