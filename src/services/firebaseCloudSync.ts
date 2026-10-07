import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
  writeBatch,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  StudentProfile,
  RegisteredSchool,
  Team,
  CompetitionSettings,
  QualifierQuestion,
  PublicExamQuestion,
  PrivateQuestionAnswerKeyDoc,
  PublicQuestionBankReadinessSummary,
  OfficialExamAttempt,
  CompetitionAward,
  SeasonArchiveItem,
  RealPortfolioProject,
  SeasonOneConfig,
} from '../types/competition';
import { evaluateSeasonOneQuestionBankReadiness } from './qualificationEngine';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const BOOTSTRAPPED_ADMIN_EMAIL = 'serialanastasia@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

// Validate connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export async function ensureParticipantAuth(): Promise<User | null> {
  return auth.currentUser;
}

/**
 * Real Google Authentication for Participants (Students) so they get a real Firebase Auth UID
 * to read their own private `/students/{studentId}` record under `resource.data.ownerUid == request.auth.uid`.
 */
export async function signInStudentWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch {
    return null;
  }
}

/**
 * Real Google Authentication for the General Supervisor / Admin
 */
export async function signInSupervisorWithGoogle(): Promise<{
  user: User | null;
  isAdmin: boolean;
  error?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    const user = cred.user;
    const isAdmin = await verifyUserIsAdmin(user);
    if (!isAdmin) {
      return {
        user,
        isAdmin: false,
        error: `الحساب (${user.email || 'غير معروف'}) ليس لديه صلاحية المشرفة العامة (Admin/Supervisor) في قواعد بيانات Firestore.`,
      };
    }
    return { user, isAdmin: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      user: null,
      isAdmin: false,
      error: `تعذر تسجيل الدخول عبر Google Auth: ${msg}`,
    };
  }
}

export async function signOutFirebaseUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Registers the Trusted Express Backend's Firebase UID in `/admins/{serverUid}`
 * whenever the Supervisor (`isAdmin()`) is authenticated, enabling the server
 * to read `platform/custom_questions`, `question_answer_keys`, and write `exam_attempts`.
 */
export async function authorizeTrustedServerBackendUid(): Promise<void> {
  try {
    const res = await fetch('/api/server/identity');
    if (!res.ok) return;
    const data = (await res.json()) as { serverUid?: string; email?: string };
    if (data && data.serverUid) {
      await setDoc(
        doc(db, 'admins', data.serverUid),
        {
          uid: data.serverUid,
          email: data.email || 'trusted-exam-engine@demagh-3alya-internal.local',
          role: 'admin',
        },
        { merge: true }
      );
    }
  } catch {}
}

/**
 * Checks whether the authenticated Firebase user is a verified Admin/Supervisor:
 * 1. Matches the bootstrapped verified supervisor email, OR
 * 2. Has a role document in `/admins/{uid}` in Firestore.
 */
export async function verifyUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user || user.isAnonymous) return false;
  if (
    user.email &&
    user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    user.emailVerified
  ) {
    try {
      await setDoc(
        doc(db, 'admins', user.uid),
        {
          uid: user.uid,
          email: user.email,
          role: 'supervisor',
        },
        { merge: true }
      );
      await authorizeTrustedServerBackendUid();
    } catch {}
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    if (adminDoc.exists()) {
      await authorizeTrustedServerBackendUid();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Clean undefined properties recursively for Firestore
function cleanUndefined<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Projects a full StudentProfile into a sanitized public Leaderboard entry
 * (Stripping private fields like parentPhone and gradingReport).
 */
export function buildSanitizedLeaderboardStudent(
  student: StudentProfile,
  safeId: string,
  ownerUid: string
): StudentProfile {
  const { parentPhone, gradingReport, ...publicFields } = student;
  return cleanUndefined({
    ...publicFields,
    id: safeId,
    ownerUid,
  });
}

/**
 * Projects a RegisteredSchool into a sanitized public school entry
 */
export function buildSanitizedPublicSchool(
  school: RegisteredSchool,
  safeId: string
): RegisteredSchool {
  return cleanUndefined({
    id: safeId,
    schoolCode: school.schoolCode,
    name: school.name,
    schoolType: school.schoolType,
    governorate: school.governorate,
    administration: school.administration,
    supervisorName: school.supervisorName || '',
    stagesOffered: school.stagesOffered || [],
    registeredAt: school.registeredAt,
  });
}

export async function saveStudentToCloud(student: StudentProfile): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    handleFirestoreError(
      new Error('لا يوجد اتصال بالإنترنت حاليًا.'),
      OperationType.WRITE,
      `students/${student.id}`
    );
    return false;
  }
  const safeId = student.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const resolvedOwnerUid = auth.currentUser?.uid || student.ownerUid || safeId;
  const privatePayload: StudentProfile = cleanUndefined({
    ...student,
    id: safeId,
    ownerUid: resolvedOwnerUid,
  });
  const publicLeaderboardPayload = buildSanitizedLeaderboardStudent(
    privatePayload,
    safeId,
    resolvedOwnerUid
  );

  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'students', safeId), privatePayload);
    batch.set(doc(db, 'leaderboard_students', safeId), publicLeaderboardPayload);
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `students/${safeId}`);
    return false;
  }
}

export async function saveMultipleStudentsToCloud(studentsList: StudentProfile[]): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    handleFirestoreError(new Error('لا يوجد اتصال بالإنترنت حاليًا.'), OperationType.WRITE, 'students');
    return false;
  }
  try {
    const batch = writeBatch(db);
    studentsList.forEach((stu) => {
      const safeId = stu.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const resolvedOwnerUid = stu.ownerUid || auth.currentUser?.uid || safeId;
      const privatePayload = cleanUndefined({
        ...stu,
        id: safeId,
        ownerUid: resolvedOwnerUid,
      });
      const publicPayload = buildSanitizedLeaderboardStudent(
        privatePayload,
        safeId,
        resolvedOwnerUid
      );
      batch.set(doc(db, 'students', safeId), privatePayload);
      batch.set(doc(db, 'leaderboard_students', safeId), publicPayload);
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'students');
    return false;
  }
}

export async function deleteStudentFromCloud(studentId: string): Promise<boolean> {
  const safeId = studentId.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'students', safeId));
    batch.delete(doc(db, 'leaderboard_students', safeId));
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `students/${safeId}`);
    return false;
  }
}

export async function clearAllStudentsFromCloud(): Promise<void> {
  try {
    const [privSnap, pubSnap] = await Promise.all([
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'leaderboard_students')),
    ]);
    const batch = writeBatch(db);
    privSnap.docs.forEach((d) => batch.delete(d.ref));
    pubSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'students');
  }
}

export async function saveSchoolToCloud(school: RegisteredSchool): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  const safeId = school.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const resolvedOwnerUid = school.ownerUid || auth.currentUser?.uid || safeId;
  try {
    const batch = writeBatch(db);
    batch.set(
      doc(db, 'schools', safeId),
      cleanUndefined({
        ...school,
        id: safeId,
        ownerUid: resolvedOwnerUid,
      })
    );
    batch.set(doc(db, 'public_schools', safeId), buildSanitizedPublicSchool(school, safeId));
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `schools/${safeId}`);
    return false;
  }
}

export async function saveTeamToCloud(team: Team): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  const safeId = team.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const resolvedOwnerUid = team.ownerUid || auth.currentUser?.uid || safeId;
  const payload = cleanUndefined({
    ...team,
    id: safeId,
    ownerUid: resolvedOwnerUid,
  });
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'teams', safeId), payload);
    batch.set(doc(db, 'public_teams', safeId), payload);
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `teams/${safeId}`);
    return false;
  }
}

export async function saveMultipleTeamsToCloud(teamsList: Team[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    teamsList.forEach((team) => {
      const safeId = team.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const payload = cleanUndefined({
        ...team,
        id: safeId,
        ownerUid: team.ownerUid || auth.currentUser?.uid || safeId,
      });
      batch.set(doc(db, 'teams', safeId), payload);
      batch.set(doc(db, 'public_teams', safeId), payload);
    });
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'teams');
    return false;
  }
}

export async function deleteTeamFromCloud(teamId: string): Promise<boolean> {
  const safeId = teamId.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'teams', safeId));
    batch.delete(doc(db, 'public_teams', safeId));
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `teams/${safeId}`);
    return false;
  }
}

export async function clearAllTeamsFromCloud(): Promise<void> {
  try {
    const [privSnap, pubSnap] = await Promise.all([
      getDocs(collection(db, 'teams')),
      getDocs(collection(db, 'public_teams')),
    ]);
    const batch = writeBatch(db);
    privSnap.docs.forEach((d) => batch.delete(d.ref));
    pubSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'teams');
  }
}

export async function clearAllSchoolsFromCloud(): Promise<void> {
  try {
    const [privSnap, pubSnap] = await Promise.all([
      getDocs(collection(db, 'schools')),
      getDocs(collection(db, 'public_schools')),
    ]);
    const batch = writeBatch(db);
    privSnap.docs.forEach((d) => batch.delete(d.ref));
    pubSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'schools');
  }
}

export async function saveSettingsToCloud(settings: CompetitionSettings): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'platform', 'settings'), cleanUndefined({ id: 'settings', ...settings }));
    batch.set(
      doc(db, 'public_platform', 'settings'),
      cleanUndefined({ id: 'settings', ...settings })
    );
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform/settings');
    return false;
  }
}

/**
 * Projects a full `QualifierQuestion` from the Admin Question Bank (`platform/custom_questions`)
 * into a strictly sanitized `PublicExamQuestion` for `public_platform/custom_questions`.
 *
 * SECURITY GUARANTEE:
 * - NEVER includes `correctIndex`
 * - NEVER includes `explanation`
 * - NEVER includes `reviewStatus`, `published`, `createdBy`, `createdAt`, `updatedAt`, or `optionOriginalIndices`
 */
export function buildSanitizedPublicQuestion(q: QualifierQuestion): PublicExamQuestion {
  const sanitized: PublicExamQuestion = {
    id: q.id,
    seasonId: q.seasonId || 'season_1',
    phaseId: q.phaseId || 'stage_1_qualifiers',
    grade: q.grade || 'all',
    stage: q.stage || 'primary_upper',
    domain: q.domain,
    difficulty: q.difficulty,
    question: q.question,
    options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
    points: typeof q.points === 'number' ? q.points : 1,
    timeSeconds: typeof q.timeSeconds === 'number' ? q.timeSeconds : 45,
    version: typeof q.version === 'number' && q.version > 0 ? q.version : 1,
  };
  if (q.contextPassage && q.contextPassage.trim()) {
    sanitized.contextPassage = q.contextPassage.trim();
  }
  if (Array.isArray(q.visualGrid) && q.visualGrid.length > 0) {
    sanitized.visualGrid = q.visualGrid;
  }
  return cleanUndefined(sanitized);
}

/**
 * Calls the Trusted Express Backend (`POST /api/exam/start`) to verify student eligibility,
 * select 30 unique questions matching the Season 1 Blueprint from `platform/custom_questions`,
 * randomize question and option orders on the server, and return ONLY the 30 sanitized
 * attempt questions (without `correctIndex`, `explanation`, or unselected questions).
 */
export async function startOfficialExamAttemptOnServer(
  studentId: string,
  participationCode: string,
  studentSnapshot?: StudentProfile
): Promise<{ attempt?: OfficialExamAttempt; error?: string }> {
  try {
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const res = await fetch('/api/exam/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ studentId, participationCode, studentSnapshot }),
    });
    const data = (await res.json()) as { attempt?: OfficialExamAttempt; error?: string };
    if (!res.ok || !data.attempt) {
      return { error: data.error || 'تعذر بدء المحاولة الرسمية من الخادم الموثوق.' };
    }
    return { attempt: data.attempt };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `تعذر الاتصال بالخادم الموثوق لبدء الاختبار: ${msg}` };
  }
}

/**
 * Calls the Trusted Express Backend (`POST /api/exam/submit`) to grade the student's attempt
 * against the protected server-only Answer Key, lock the attempt,
 * and return the verified result. NEVER exposes `correctIndex` or the Answer Key to the client!
 */
export async function submitOfficialExamAttemptOnServer(
  attemptId: string,
  studentId: string,
  answers: Record<string, number>,
  autoSubmittedOnTimeout: boolean,
  studentSnapshot?: StudentProfile
): Promise<{
  gradedStudent?: StudentProfile;
  attempt?: OfficialExamAttempt;
  error?: string;
}> {
  try {
    const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : '';
    const res = await fetch('/api/exam/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({
        attemptId,
        studentId,
        answers,
        autoSubmittedOnTimeout,
        studentSnapshot,
      }),
    });
    const data = (await res.json()) as {
      gradedStudent?: StudentProfile;
      attempt?: OfficialExamAttempt;
      error?: string;
    };
    if (!res.ok || !data.gradedStudent) {
      return { error: data.error || 'تعذر تصحيح وتسليم المحاولة الرسمية عبر الخادم الموثوق.' };
    }
    return {
      gradedStudent: data.gradedStudent,
      attempt: data.attempt,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: `تعذر الاتصال بالخادم الموثوق لتسليم الاختبار: ${msg}` };
  }
}

export async function syncQuestionBankToTrustedServer(
  questions?: QualifierQuestion[],
  seasonOne?: SeasonOneConfig
): Promise<void> {
  try {
    if (!auth.currentUser) return;
    const idToken = await auth.currentUser.getIdToken();
    await fetch('/api/admin/sync-question-bank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ questions, seasonOne }),
    });
  } catch {}
}

export async function saveCustomQuestionsToCloud(questions: QualifierQuestion[]): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    handleFirestoreError(
      new Error('لا يوجد اتصال بالإنترنت حاليًا.'),
      OperationType.WRITE,
      'platform/custom_questions'
    );
    return false;
  }

  // Ensure the Trusted Backend UID is registered in `/admins/{serverUid}` whenever the Supervisor saves questions
  await authorizeTrustedServerBackendUid();

  const nowIso = new Date().toISOString();
  const normalizedFullQuestions: QualifierQuestion[] = questions.map((q) => ({
    ...q,
    version: typeof q.version === 'number' && q.version > 0 ? q.version : 1,
  }));

  // Compute ONLY the aggregate Blueprint Readiness Summary for `public_platform/custom_questions`
  // so students can NEVER download the question bank (`items` array is strictly omitted!).
  const readiness = evaluateSeasonOneQuestionBankReadiness(normalizedFullQuestions);
  const publicReadinessSummary: PublicQuestionBankReadinessSummary = cleanUndefined({
    id: 'custom_questions',
    updatedAt: nowIso,
    isReady: readiness.isReady,
    totalRequired: readiness.totalRequired,
    totalAvailable: readiness.totalAvailable,
    totalInBank: readiness.totalInBank,
    draftCount: readiness.draftCount,
    archivedCount: readiness.archivedCount,
    fulfilledCount: readiness.fulfilledCount,
    missingTotal: readiness.missingTotal,
    domainStatus: readiness.domainStatus,
    missingDomains: readiness.missingDomains,
  });

  try {
    const batch = writeBatch(db);
    // 1. Primary Authoritative Question Bank (Admin/Server Read & Write Only — includes full questions & answer keys)
    batch.set(
      doc(db, 'platform', 'custom_questions'),
      cleanUndefined({
        id: 'custom_questions',
        updatedAt: nowIso,
        items: normalizedFullQuestions,
      })
    );
    // 2. Public Readiness Summary ONLY (Public Read, Admin Write Only — NO `items`, NO questions, NO options, NO answer keys!)
    batch.set(
      doc(db, 'public_platform', 'custom_questions'),
      publicReadinessSummary
    );

    // 3. Synchronize Private Answer Key Store (`question_answer_keys/{questionId}_opt_{0..3}`) — Admin/Server Only
    normalizedFullQuestions.forEach((q) => {
      const safeQId = q.id.replace(/[^a-zA-Z0-9_-]/g, '_');
      const status = q.reviewStatus || 'approved';
      const isPub = q.published !== undefined ? q.published : status === 'approved';
      const isActiveApproved = status === 'approved' && isPub === true;

      for (let optIdx = 0; optIdx < 4; optIdx++) {
        const keyDocRef = doc(db, 'question_answer_keys', `${safeQId}_opt_${optIdx}`);
        if (isActiveApproved && q.correctIndex === optIdx) {
          const keyPayload: PrivateQuestionAnswerKeyDoc = cleanUndefined({
            questionId: q.id,
            optionIndex: optIdx,
            isCorrect: true,
            domain: q.domain,
            version: typeof q.version === 'number' && q.version > 0 ? q.version : 1,
            seasonId: q.seasonId || 'season_1',
            phaseId: q.phaseId || 'stage_1_qualifiers',
            updatedAt: nowIso,
          });
          batch.set(keyDocRef, keyPayload);
        } else {
          batch.delete(keyDocRef);
        }
      }
    });

    await batch.commit();
    await syncQuestionBankToTrustedServer(normalizedFullQuestions);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform/custom_questions');
    return false;
  }
}

export async function saveAwardsToCloud(awards: CompetitionAward[]): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'platform', 'awards'), cleanUndefined({ id: 'awards', items: awards }));
    batch.set(
      doc(db, 'public_platform', 'awards'),
      cleanUndefined({ id: 'awards', items: awards })
    );
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform/awards');
    return false;
  }
}

export async function saveSeasonsArchiveToCloud(
  seasonsArchive: SeasonArchiveItem[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);
    batch.set(
      doc(db, 'platform', 'seasons_archive'),
      cleanUndefined({ id: 'seasons_archive', items: seasonsArchive })
    );
    batch.set(
      doc(db, 'public_platform', 'seasons_archive'),
      cleanUndefined({ id: 'seasons_archive', items: seasonsArchive })
    );
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform/seasons_archive');
    return false;
  }
}

import {
  SEASON_ONE_OFFICIAL_PHASES,
  SEASON_ONE_QUALIFIER_BLUEPRINT,
} from '../data/challengesData';

export const INITIAL_SEASON_ONE_CONFIG: SeasonOneConfig = {
  id: 'season_1',
  seasonId: 'season_1',
  name: 'الموسم الأول — دماغ عالية',
  status: 'draft',
  registrationStart: '',
  registrationEnd: '',
  competitionStart: '',
  competitionEnd: '',
  eligibleGrades: ['4', '5', '6'],
  stages: ['primary_upper'],
  officialPhases: SEASON_ONE_OFFICIAL_PHASES,
  qualifierBlueprint: { ...SEASON_ONE_QUALIFIER_BLUEPRINT },
  examSettings: {
    questionsCount: 30,
    durationMinutes: 30,
    allowedAttempts: 1,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowBackNavigation: true,
  },
  scoringSettings: {
    scoringMethod: 'standard_points',
    enableTieBreaker: true,
    enableRiskPenalty: false,
  },
  awards: [],
  publicVisibility: false,
  createdAt: '',
  updatedAt: '',
};

function normalizeSeasonBrandName(rawName?: string): string {
  const trimmed = (rawName || '').trim();
  if (!trimmed || trimmed === 'الموسم الأول — عباقرة عيون مصر' || trimmed === 'عباقرة عيون مصر') {
    return 'الموسم الأول — دماغ عالية';
  }
  return trimmed.replace(/عباقرة عيون مصر/g, 'دماغ عالية');
}

/**
 * Pure deterministic projection from the Single Source of Truth (`platform/season_1`)
 * onto `CompetitionSettings` so competition logic never diverges from Season 1 config.
 */
export function applySeasonOneToSettings(
  baseSettings: CompetitionSettings,
  season: SeasonOneConfig
): CompetitionSettings {
  const mappedLifecycleStatus: CompetitionSettings['seasonStatus'] =
    season.status === 'active'
      ? 'qualifiers_running'
      : season.status === 'ended'
      ? 'season_closed'
      : 'registration_open';

  return {
    ...baseSettings,
    currentSeasonId: season.seasonId || 'season_1',
    seasonName: normalizeSeasonBrandName(season.name),
    seasonStatus: mappedLifecycleStatus,
    registrationStartDate: season.registrationStart ?? '',
    registrationEndDate: season.registrationEnd ?? '',
    startDate: season.competitionStart ?? '',
    endDate: season.competitionEnd ?? '',
    participatingStages:
      Array.isArray(season.stages) && season.stages.length > 0
        ? season.stages
        : ['primary_upper'],
    participatingGrades:
      Array.isArray(season.eligibleGrades) && season.eligibleGrades.length > 0
        ? season.eligibleGrades
        : ['4', '5', '6'],
    officialPhases:
      Array.isArray(season.officialPhases) && season.officialPhases.length > 0
        ? season.officialPhases
        : SEASON_ONE_OFFICIAL_PHASES,
    qualifierBlueprint: season.qualifierBlueprint || { ...SEASON_ONE_QUALIFIER_BLUEPRINT },
    questionsCountPerExam:
      season.examSettings?.questionsCount != null
        ? season.examSettings.questionsCount
        : 30,
    qualifierDurationMinutes:
      season.examSettings?.durationMinutes != null
        ? season.examSettings.durationMinutes
        : 30,
    allowedAttemptsPerStudent:
      season.examSettings?.allowedAttempts != null
        ? season.examSettings.allowedAttempts
        : 1,
    randomizeQuestionsOrder:
      season.examSettings?.randomizeQuestions ?? true,
    randomizeOptionsOrder:
      season.examSettings?.randomizeOptions ?? true,
    allowBackNavigationInQualifier:
      season.examSettings?.allowBackNavigation ?? true,
    scoringMethod:
      season.scoringSettings?.scoringMethod
        ? season.scoringSettings.scoringMethod
        : 'standard_points',
    enableElectronicTieBreaker:
      season.scoringSettings?.enableTieBreaker ?? true,
    enableRiskPenalty:
      season.scoringSettings?.enableRiskPenalty ?? false,
  };
}

/**
 * Builds a sanitized public-only projection of `SeasonOneConfig` for `public_platform/season_1`.
 * Strips internal administrative/anti-cheat/scoring mechanics and internal audit metadata:
 * - OMITTED: `scoringSettings` (scoringMethod, enableTieBreaker, enableRiskPenalty)
 * - OMITTED: `examSettings.randomizeQuestions`, `examSettings.randomizeOptions`, `examSettings.allowBackNavigation`
 * - OMITTED: `createdAt`
 * Also gates detailed public fields when `publicVisibility === false` and `status === 'draft'`.
 */
export function buildPublicSeasonMirror(season: SeasonOneConfig): Record<string, unknown> {
  const isDraftHidden = !season.publicVisibility && season.status === 'draft';
  return cleanUndefined({
    id: 'season_1',
    seasonId: season.seasonId || 'season_1',
    name: normalizeSeasonBrandName(season.name),
    status: season.status || 'draft',
    publicVisibility: Boolean(season.publicVisibility),
    registrationStart: isDraftHidden ? '' : season.registrationStart || '',
    registrationEnd: isDraftHidden ? '' : season.registrationEnd || '',
    competitionStart: isDraftHidden ? '' : season.competitionStart || '',
    competitionEnd: isDraftHidden ? '' : season.competitionEnd || '',
    eligibleGrades: isDraftHidden
      ? []
      : Array.isArray(season.eligibleGrades) && season.eligibleGrades.length > 0
      ? season.eligibleGrades
      : ['4', '5', '6'],
    stages: isDraftHidden
      ? []
      : Array.isArray(season.stages) && season.stages.length > 0
      ? season.stages
      : ['primary_upper'],
    officialPhases: isDraftHidden
      ? []
      : Array.isArray(season.officialPhases) && season.officialPhases.length > 0
      ? season.officialPhases
      : SEASON_ONE_OFFICIAL_PHASES,
    qualifierBlueprint: isDraftHidden
      ? undefined
      : season.qualifierBlueprint || { ...SEASON_ONE_QUALIFIER_BLUEPRINT },
    examSettings: {
      questionsCount: isDraftHidden ? null : season.examSettings?.questionsCount ?? 30,
      durationMinutes: isDraftHidden ? null : season.examSettings?.durationMinutes ?? 30,
      allowedAttempts: isDraftHidden ? null : season.examSettings?.allowedAttempts ?? 1,
    },
    awards: isDraftHidden ? [] : Array.isArray(season.awards) ? season.awards : [],
    updatedAt: season.updatedAt || new Date().toISOString(),
  });
}

/**
 * Saves Season 1 exclusively to the Primary Administrative Source (`platform/season_1`)
 * and atomically writes a SANITIZED Read-Only Public Mirror (`public_platform/season_1`).
 * Never writes to legacy `platform/seasons` or `public_platform/seasons`.
 */
export async function saveSeasonConfigToCloud(seasonConfig: SeasonOneConfig): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    handleFirestoreError(
      new Error('لا يوجد اتصال بالإنترنت حاليًا.'),
      OperationType.WRITE,
      'platform/season_1'
    );
    return false;
  }
  const nowIso = new Date().toISOString();
  const authoritativePayload: SeasonOneConfig = cleanUndefined({
    ...seasonConfig,
    id: 'season_1',
    seasonId: 'season_1',
    name: normalizeSeasonBrandName(seasonConfig.name),
    status: seasonConfig.status || 'draft',
    createdAt: seasonConfig.createdAt || nowIso,
    updatedAt: nowIso,
  });

  const sanitizedPublicMirror = buildPublicSeasonMirror(authoritativePayload);

  try {
    const batch = writeBatch(db);
    // 1. Primary Source of Truth (Full Administrative Document — Admin Read/Write Only)
    batch.set(doc(db, 'platform', 'season_1'), authoritativePayload);
    // 2. Sanitized Public Read-Only Mirror (Public Read, Admin Write Only — No internal admin/scoring/anti-cheat fields)
    batch.set(doc(db, 'public_platform', 'season_1'), sanitizedPublicMirror);
    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'platform/season_1');
    return false;
  }
}

export async function saveProjectToCloud(project: RealPortfolioProject): Promise<boolean> {
  const safeId = project.id.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    await setDoc(doc(db, 'projects', safeId), cleanUndefined({ ...project, id: safeId }));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${safeId}`);
    return false;
  }
}

export async function deleteProjectFromCloud(projectId: string): Promise<boolean> {
  const safeId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
  try {
    await deleteDoc(doc(db, 'projects', safeId));
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `projects/${safeId}`);
    return false;
  }
}

export { onSnapshot, collection, doc, query, where, onAuthStateChanged };
export type { User };
