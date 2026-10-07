import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Siren,
  Volume2,
  VolumeX,
  Camera,
  Upload,
  Share2,
  Download,
  Copy,
  Smartphone,
  ExternalLink,
  FileSpreadsheet,
  Database,
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
  RegisteredSchool,
  SeasonArchiveItem,
  EducationalStage,
  RealPortfolioProject,
  SeasonOneConfig,
  PublicQuestionBankReadinessSummary,
} from './types/competition';
import {
  INITIAL_DEMO_STUDENTS,
  INITIAL_DEMO_TEAMS,
  INITIAL_SETTINGS,
  INITIAL_MATCHES,
  GENIUS_ALARM_QUESTIONS,
  OFFICIAL_AWARDS,
  JOURNEY_NODES,
  APP_PROFILE_PRESETS,
  OFFICIAL_HERO_BANNER,
  INITIAL_REGISTERED_SCHOOLS,
  INITIAL_SEASONS_ARCHIVE,
  DEFAULT_ANNUAL_PHASES,
  INITIAL_REAL_PROJECTS,
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
import { NationalPlatformHub } from './components/NationalPlatformHub';
import { RealProjectsAndCMS } from './components/RealProjectsAndCMS';
import {
  STAGE_METADATA,
  SEASON_STATUS_META,
  runAutomatedRankingAndQualification,
  computeAggregatedRankings,
} from './services/qualificationEngine';
import {
  db,
  auth,
  onSnapshot,
  onAuthStateChanged,
  signInSupervisorWithGoogle,
  signOutFirebaseUser,
  verifyUserIsAdmin,
  ensureParticipantAuth,
  User,
  collection,
  doc,
  query,
  where,
  saveStudentToCloud,
  saveMultipleStudentsToCloud,
  deleteStudentFromCloud,
  clearAllStudentsFromCloud,
  saveSchoolToCloud,
  saveTeamToCloud,
  saveMultipleTeamsToCloud,
  deleteTeamFromCloud,
  clearAllTeamsFromCloud,
  clearAllSchoolsFromCloud,
  saveSettingsToCloud,
  saveCustomQuestionsToCloud,
  saveAwardsToCloud,
  saveSeasonsArchiveToCloud,
  INITIAL_SEASON_ONE_CONFIG,
  applySeasonOneToSettings,
  saveSeasonConfigToCloud,
  saveProjectToCloud,
  deleteProjectFromCloud,
} from './services/firebaseCloudSync';
import { soundEngine } from './utils/sound';

const STORAGE_STUDENTS = 'om_geniuses_students_real_v10';
const STORAGE_TEAMS = 'om_geniuses_teams_real_v10';
const STORAGE_SETTINGS = 'om_geniuses_settings_real_v10';
const STORAGE_CUSTOM_QS = 'om_geniuses_custom_qs_real_v10';
const STORAGE_AWARDS = 'om_geniuses_awards_real_v10';
const STORAGE_SCHOOLS = 'om_geniuses_schools_real_v10';
const STORAGE_ARCHIVE = 'om_geniuses_archive_real_v10';
const STORAGE_PROJECTS = 'om_geniuses_real_projects_v10';

const SUB_NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'home', label: '🏠 الرئيسية' },
  { id: 'real_projects', label: '🌟 المشروعات الحقيقية (نسمة حياة · دماغ عالية)' },
  { id: 'content_management', label: '⚙️ إدارة المحتوى' },
  { id: 'annual_roadmap', label: '📅 مراحل وتصفيات السنة (٦ مراحل)' },
  { id: 'qualifiers', label: '📝 التسجيل والتصفيات' },
  { id: 'practice', label: '🧠 جرّب المسابقة مع بلية (نسخة اختبار)' },
  { id: 'national_rankings', label: '🇪🇬 الترتيب العام للجمهورية' },
  { id: 'schools_hub', label: '🏫 المدارس المشاركة' },
  { id: 'egypt_map', label: '🗺️ محافظات مصر (٢٧)' },
  { id: 'games_hub', label: '📺 استوديو وألعاب دماغ عالية' },
  { id: 'teams', label: '🧩 الفرق (4 أو 5 لاعبين)' },
  { id: 'genius_card', label: '🪪 بطاقة المتسابق' },
  { id: 'certificates', label: '📜 الشهادات الرقمية' },
  { id: 'awards', label: '🏅 الأوسمة والجوائز' },
  { id: 'journey', label: '🧭 خريطة الرحلة' },
  { id: 'tournament', label: '🏆 البطولة النهائية' },
  { id: 'leaderboard', label: '📊 إحصائيات الفرق' },
  { id: 'seasons_archive', label: '🏛️ المواسم والأرشيف' },
  { id: 'about_privacy', label: '🛡️ عن المسابقة والخصوصية' },
  { id: 'admin', label: '👩‍💼 لوحة المشرفة العامة' },
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
  const [adminInitialSection, setAdminInitialSection] = useState<AdminSection>('overview');
  const [unlockedJourneyIdx, setUnlockedJourneyIdx] = useState<number>(2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // Real Cloud-Synced State (Zero fake students by default — only real registered students in Firestore)
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [cloudConnected, setCloudConnected] = useState<boolean>(false);

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
  const [publicReadinessSummary, setPublicReadinessSummary] =
    useState<PublicQuestionBankReadinessSummary | null>(null);

  const [awards, setAwards] = useState<CompetitionAward[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_AWARDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return OFFICIAL_AWARDS;
  });

  const [registeredSchools, setRegisteredSchools] = useState<RegisteredSchool[]>([]);

  const [seasonsArchive, setSeasonsArchive] = useState<SeasonArchiveItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ARCHIVE);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SEASONS_ARCHIVE;
  });

  const [matches, setMatches] = useState<MatchItem[]>(INITIAL_MATCHES);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(null);

  const [realProjects, setRealProjects] = useState<RealPortfolioProject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_REAL_PROJECTS;
  });

  // 🏆 Season 1 Official Configuration Document (Synced with Firestore platform/seasons & public_platform/seasons)
  const [seasonOneConfig, setSeasonOneConfig] = useState<SeasonOneConfig>(INITIAL_SEASON_ONE_CONFIG);

  // 🔐 Real Firebase Authentication & Firestore Admin Role State (Zero hardcoded PINs or sessionStorage bypass)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAdminVerified, setIsAdminVerified] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && !user.isAnonymous) {
        const adminStatus = await verifyUserIsAdmin(user);
        setIsAdminVerified(adminStatus);
      } else {
        setIsAdminVerified(false);
        if (!user) {
          ensureParticipantAuth();
        }
      }
      setAuthChecking(false);
    });
    return () => unsubAuth();
  }, []);

  // ☁️ 1. Public Sanitized Real-Time Listeners (Safe for all visitors — never touches private /students, /schools, /teams, or /platform)
  useEffect(() => {
    if (isAdminVerified) return;

    const unsubPublicLeaderboard = onSnapshot(
      collection(db, 'leaderboard_students'),
      (snap) => {
        setCloudConnected(true);
        const pubStudents: StudentProfile[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as StudentProfile;
          if (data && data.name) {
            pubStudents.push(data);
          }
        });
        const { rankedStudents } = runAutomatedRankingAndQualification(
          pubStudents,
          settings
        );
        setStudents(rankedStudents);
        setActiveStudent((prevActive) => {
          if (prevActive) {
            const updatedActive = rankedStudents.find((s) => s.id === prevActive.id);
            if (updatedActive) return updatedActive;
          }
          return rankedStudents[0] || null;
        });
      },
      (err) => {
        console.error('Public leaderboard listener error:', err);
      }
    );

    const unsubPublicSchools = onSnapshot(
      collection(db, 'public_schools'),
      (snap) => {
        const pubSchools: RegisteredSchool[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as RegisteredSchool;
          if (data && data.name) pubSchools.push(data);
        });
        setRegisteredSchools(pubSchools);
      },
      (err) => {
        console.error('Public schools listener error:', err);
      }
    );

    const unsubPublicTeams = onSnapshot(
      collection(db, 'public_teams'),
      (snap) => {
        const pubTeams: Team[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as Team;
          if (data && data.name) pubTeams.push(data);
        });
        setTeams(pubTeams);
      },
      (err) => {
        console.error('Public teams listener error:', err);
      }
    );

    const unsubPublicAwards = onSnapshot(
      doc(db, 'public_platform', 'awards'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.items) && data.items.length > 0) {
            setAwards(data.items);
          }
        }
      },
      (err) => {
        console.error('Public awards listener error:', err);
      }
    );

    const unsubPublicSettings = onSnapshot(
      doc(db, 'public_platform', 'settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudSet = docSnap.data() as CompetitionSettings;
          setSettings((prev) => ({ ...prev, ...cloudSet }));
        }
      },
      (err) => {
        console.error('Public settings listener error:', err);
      }
    );

    const unsubPublicArchive = onSnapshot(
      doc(db, 'public_platform', 'seasons_archive'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.items)) {
            setSeasonsArchive(data.items);
          }
        }
      },
      (err) => {
        console.error('Public seasons archive listener error:', err);
      }
    );

    const unsubPublicQuestions = onSnapshot(
      doc(db, 'public_platform', 'custom_questions'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<PublicQuestionBankReadinessSummary>;
          if (data && Array.isArray(data.domainStatus)) {
            setPublicReadinessSummary(data as PublicQuestionBankReadinessSummary);
          }
        }
      },
      (err) => {
        console.error('Public questions readiness listener error:', err);
      }
    );

    // Public read-only mirror for Season 1 (`public_platform/season_1`).
    // Disabled when Admin is verified so Admin reads exclusively from the Primary Source (`platform/season_1`).
    const unsubPublicSeasonOne = !isAdminVerified
      ? onSnapshot(
          doc(db, 'public_platform', 'season_1'),
          (docSnap) => {
            if (docSnap.exists()) {
              const raw = docSnap.data() as Partial<SeasonOneConfig>;
              if (raw && raw.name) {
                setSeasonOneConfig({
                  ...INITIAL_SEASON_ONE_CONFIG,
                  ...raw,
                  examSettings: {
                    ...INITIAL_SEASON_ONE_CONFIG.examSettings,
                    ...(raw.examSettings || {}),
                  },
                  scoringSettings: {
                    ...INITIAL_SEASON_ONE_CONFIG.scoringSettings,
                    ...(raw.scoringSettings || {}),
                  },
                });
              }
            }
          },
          (err) => {
            console.error('Public season 1 listener error:', err);
          }
        )
      : () => {};

    const unsubPublishedProjects = onSnapshot(
      query(
        collection(db, 'projects'),
        where('status', 'in', ['published', 'coming_soon'])
      ),
      (snap) => {
        const cloudProjs: RealPortfolioProject[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as RealPortfolioProject;
          if (data && data.name) cloudProjs.push(data);
        });
        if (cloudProjs.length > 0) {
          setRealProjects((prev) => {
            const mergedMap = new Map<string, RealPortfolioProject>();
            INITIAL_REAL_PROJECTS.forEach((p) => mergedMap.set(p.id, p));
            prev.forEach((p) => mergedMap.set(p.id, p));
            cloudProjs.forEach((p) => mergedMap.set(p.id, p));
            return Array.from(mergedMap.values());
          });
        }
      },
      (err) => {
        console.error('Published projects listener error:', err);
      }
    );

    return () => {
      unsubPublicLeaderboard();
      unsubPublicSchools();
      unsubPublicTeams();
      unsubPublicAwards();
      unsubPublicSettings();
      unsubPublicArchive();
      unsubPublicQuestions();
      unsubPublicSeasonOne();
      unsubPublishedProjects();
    };
  }, [isAdminVerified]);

  // 🔐 2. Authenticated Student Own-Document Listener (Allows a signed-in student to read ONLY their own private /students/{id} record)
  useEffect(() => {
    if (!firebaseUser || isAdminVerified || !activeStudent?.id) return;
    if (activeStudent.ownerUid && activeStudent.ownerUid !== firebaseUser.uid) return;

    const safeStuId = activeStudent.id.replace(/[^a-zA-Z0-9_-]/g, '_');
    const unsubOwnStudent = onSnapshot(
      doc(db, 'students', safeStuId),
      (docSnap) => {
        if (docSnap.exists()) {
          const ownData = docSnap.data() as StudentProfile;
          setActiveStudent((prev) => (prev ? { ...prev, ...ownData } : ownData));
        }
      },
      () => {
        // Ignore if student document hasn't been created yet or belongs to another UID
      }
    );
    return () => unsubOwnStudent();
  }, [firebaseUser?.uid, isAdminVerified, activeStudent?.id]);

  // 👩‍💼 3. Admin-Only Private Collection Listeners (Strictly activated ONLY after real Firebase Auth + Firestore Admin verification)
  useEffect(() => {
    if (!isAdminVerified) return;

    const unsubAdminStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        setCloudConnected(true);
        const cloudStudents: StudentProfile[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as StudentProfile;
          if (data && data.name) {
            cloudStudents.push(data);
          }
        });
        const { rankedStudents } = runAutomatedRankingAndQualification(
          cloudStudents,
          settings
        );
        setStudents(rankedStudents);
        setActiveStudent((prevActive) => {
          if (prevActive) {
            const updatedActive = rankedStudents.find((s) => s.id === prevActive.id);
            if (updatedActive) return updatedActive;
          }
          return rankedStudents[0] || null;
        });
      },
      (err) => {
        console.error('Admin students listener error:', err);
      }
    );

    const unsubAdminSchools = onSnapshot(
      collection(db, 'schools'),
      (snap) => {
        const cloudSchools: RegisteredSchool[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as RegisteredSchool;
          if (data && data.name) cloudSchools.push(data);
        });
        setRegisteredSchools(cloudSchools);
      },
      (err) => {
        console.error('Admin schools listener error:', err);
      }
    );

    const unsubAdminTeams = onSnapshot(
      collection(db, 'teams'),
      (snap) => {
        const cloudTeams: Team[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as Team;
          if (data && data.name) cloudTeams.push(data);
        });
        setTeams(cloudTeams);
      },
      (err) => {
        console.error('Admin teams listener error:', err);
      }
    );

    const unsubAdminAwards = onSnapshot(
      doc(db, 'platform', 'awards'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.items) && data.items.length > 0) {
            setAwards(data.items);
          }
        }
      },
      (err) => {
        console.error('Admin awards listener error:', err);
      }
    );

    const unsubAdminSettings = onSnapshot(
      doc(db, 'platform', 'settings'),
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudSet = docSnap.data() as CompetitionSettings;
          setSettings((prev) => ({ ...prev, ...cloudSet }));
        }
      },
      (err) => {
        console.error('Admin settings listener error:', err);
      }
    );

    const unsubAdminQuestions = onSnapshot(
      doc(db, 'platform', 'custom_questions'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.items)) {
            setCustomQuestions(data.items);
          }
        }
      },
      (err) => {
        console.error('Admin questions listener error:', err);
      }
    );

    const unsubAdminArchive = onSnapshot(
      doc(db, 'platform', 'seasons_archive'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (Array.isArray(data?.items)) {
            setSeasonsArchive(data.items);
          }
        }
      },
      (err) => {
        console.error('Admin seasons archive listener error:', err);
      }
    );

    // Primary Administrative Source of Truth for Season 1 (`platform/season_1`)
    const unsubAdminSeasonOne = onSnapshot(
      doc(db, 'platform', 'season_1'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SeasonOneConfig;
          if (data && data.name) {
            setSeasonOneConfig(data);
          }
        }
      },
      (err) => {
        console.error('Admin season 1 listener error:', err);
      }
    );

    const unsubAdminProjects = onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        const cloudProjs: RealPortfolioProject[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as RealPortfolioProject;
          if (data && data.name) cloudProjs.push(data);
        });
        if (cloudProjs.length > 0) {
          setRealProjects((prev) => {
            const mergedMap = new Map<string, RealPortfolioProject>();
            INITIAL_REAL_PROJECTS.forEach((p) => mergedMap.set(p.id, p));
            prev.forEach((p) => mergedMap.set(p.id, p));
            cloudProjs.forEach((p) => mergedMap.set(p.id, p));
            return Array.from(mergedMap.values());
          });
        }
      },
      (err) => {
        console.error('Admin projects listener error:', err);
      }
    );

    return () => {
      unsubAdminStudents();
      unsubAdminSchools();
      unsubAdminTeams();
      unsubAdminAwards();
      unsubAdminSettings();
      unsubAdminQuestions();
      unsubAdminArchive();
      unsubAdminSeasonOne();
      unsubAdminProjects();
    };
  }, [isAdminVerified]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(realProjects));
    } catch {}
  }, [realProjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SCHOOLS, JSON.stringify(registeredSchools));
    } catch {}
  }, [registeredSchools]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ARCHIVE, JSON.stringify(seasonsArchive));
    } catch {}
  }, [seasonsArchive]);

  // Deterministic projection: Competition logic always reads Season 1 fields from the Single Source of Truth (`seasonOneConfig`)
  const effectiveSettings = React.useMemo(
    () => applySeasonOneToSettings(settings, seasonOneConfig),
    [settings, seasonOneConfig]
  );

  const nationalAggregated = React.useMemo(
    () => computeAggregatedRankings(students, effectiveSettings.schoolScoringFormula),
    [students, effectiveSettings.schoolScoringFormula]
  );

  const liveStats = React.useMemo(() => {
    const schoolNames = new Set(
      [
        ...students.map((s) => (s.schoolName || '').trim()),
        ...registeredSchools.map((r) => (r.name || '').trim()),
      ].filter(Boolean)
    );
    const adminNames = new Set(
      [
        ...students.map((s) => (s.administration || '').trim()),
        ...registeredSchools.map((r) => (r.administration || '').trim()),
      ].filter(Boolean)
    );
    const govNames = new Set(
      [
        ...students.map((s) => (s.governorate || s.region || '').trim()),
        ...registeredSchools.map((r) => (r.governorate || '').trim()),
      ].filter(Boolean)
    );
    return {
      studentsCount: students.length,
      schoolsCount: schoolNames.size,
      administrationsCount: adminNames.size,
      governoratesCount: govNames.size,
    };
  }, [students, registeredSchools]);

  // 🚨 Genius Alarm Modal State
  const [alarmOpen, setAlarmOpen] = useState(false);
  const [alarmIdx, setAlarmIdx] = useState(0);
  const [alarmSelectedOpt, setAlarmSelectedOpt] = useState<number | null>(null);
  const [alarmWinnerTeamId, setAlarmWinnerTeamId] = useState<string>(teams[0]?.id || 'team-nile');

  // 🖼️ App Profile Image Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [shareDownloadModalOpen, setShareDownloadModalOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const currentAppAvatar = settings.appProfileImage || APP_PROFILE_PRESETS[0].url;

  const [customPublishedUrl, setCustomPublishedUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('om_geniuses_custom_url_v1') || '';
    } catch {
      return '';
    }
  });

  const OFFICIAL_PUBLIC_URL =
    customPublishedUrl.trim() ||
    'https://ais-pre-kkbaktoxcuf6bb5pz4xdgg-933531693732.europe-west2.run.app';

  const handleDownloadStandalonePlayableQuizHTML = () => {
    soundEngine.playFanfare();
    const standaloneHTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>🧠 دماغ عالية — مسابقة المعرفة والذكاء والتفكير</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; font-family: 'Cairo', Tahoma, sans-serif; }
    body { margin: 0; background: #0f0f12; color: #f2efeb; min-height: 100vh; padding: 20px; }
    .container { max-width: 820px; margin: 0 auto; background: #141A29; border: 2px solid #d4af37; border-radius: 24px; padding: 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); }
    .badge { display: inline-block; background: rgba(212,175,55,0.18); color: #d4af37; border: 1px solid #d4af37; padding: 4px 14px; border-radius: 999px; font-size: 13px; font-weight: 800; }
    h1 { margin: 10px 0 4px; color: #d4af37; font-size: 30px; }
    .sub { color: #10b981; font-weight: 700; font-size: 14px; margin-bottom: 20px; }
    label { display: block; font-size: 13px; color: #cbd5e1; margin-bottom: 6px; font-weight: 700; }
    input, select { width: 100%; padding: 11px 14px; border-radius: 12px; border: 1px solid #334155; background: #0f172a; color: #fff; font-size: 14px; margin-bottom: 14px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .btn { background: #d4af37; color: #0f0f12; border: none; padding: 13px 24px; border-radius: 14px; font-weight: 800; font-size: 15px; cursor: pointer; width: 100%; transition: 0.2s; }
    .btn:hover { background: #fbbf24; }
    .q-card { background: #0f172a; border: 1px solid #334155; border-radius: 18px; padding: 20px; margin-top: 16px; }
    .opt { display: block; width: 100%; text-align: right; padding: 12px 16px; margin-top: 10px; border-radius: 12px; border: 1px solid #334155; background: #1e293b; color: #f8fafc; font-weight: 700; cursor: pointer; font-size: 14px; }
    .opt:hover { border-color: #d4af37; }
    .hidden { display: none; }
    .cert { border: 3px double #d4af37; padding: 24px; border-radius: 20px; text-align: center; background: linear-gradient(135deg, #18294D, #0f172a); margin-top: 18px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align:center;">
      <span class="badge">👦 بلية ودماغه عالية! · مسابقة المعرفة والذكاء والتفكير</span>
      <h1>🧠 دماغ عالية</h1>
      <div class="sub">مسابقة المعرفة والذكاء والتفكير — النسخة التفاعلية المحمولة</div>
    </div>

    <div id="step-reg">
      <div class="grid">
        <div>
          <label>👨‍🎓 اسم الطالب ثلاثي:</label>
          <input id="st-name" placeholder="مثال: أحمد محمد علي" />
        </div>
        <div>
          <label>🎓 الصف والمرحلة التعليمية:</label>
          <select id="st-stage">
            <option value="primary_lower">🟢 المرحلة الابتدائية الصغرى (الأول - الثالث الابتدائي)</option>
            <option value="primary_upper" selected>🔵 المرحلة الابتدائية الكبرى (الرابع - السادس الابتدائي)</option>
            <option value="preparatory">🟣 المرحلة الإعدادية (الأول - الثالث الإعدادي)</option>
            <option value="secondary">🟠 المرحلة الثانوية (الأول - الثالث الثانوي)</option>
          </select>
        </div>
        <div>
          <label>🗺️ المحافظة:</label>
          <select id="st-gov">
            <option>القاهرة</option><option>الجيزة</option><option>الإسكندرية</option><option>الدقهلية</option><option>الشرقية</option><option>القليوبية</option><option>الغربية</option><option>المنوفية</option><option>البحيرة</option><option>كفر الشيخ</option><option>دمياط</option><option>بورسعيد</option><option>الإسماعيلية</option><option>السويس</option><option>الفيوم</option><option>بني سويف</option><option>المنيا</option><option>أسيوط</option><option>سوهاج</option><option>قنا</option><option>الأقصر</option><option>أسوان</option><option>البحر الأحمر</option><option>الوادي الجديد</option><option>مطروح</option><option>شمال سيناء</option><option>جنوب سيناء</option>
          </select>
        </div>
        <div>
          <label>🏛️ الإدارة التعليمية:</label>
          <input id="st-admin" placeholder="مثال: إدارة شرق التعليمية" />
        </div>
        <div>
          <label>🏫 اسم المدرسة:</label>
          <input id="st-school" placeholder="اكتب اسم مدرستك" />
        </div>
      </div>
      <button class="btn" onclick="startExam()">🚀 تسجيل وبدء التصفية الإلكترونية الآن</button>
    </div>

    <div id="step-quiz" class="hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#fbbf24;font-weight:800;">
        <span id="student-banner"></span>
        <span id="q-counter"></span>
      </div>
      <div class="q-card">
        <h3 id="q-text" style="margin-top:0;font-size:18px;color:#fff;"></h3>
        <div id="q-options"></div>
      </div>
    </div>

    <div id="step-result" class="hidden">
      <div class="cert">
        <span class="badge">📜 شهادة اجتياز التصفية الإلكترونية</span>
        <h2 id="res-name" style="color:#d4af37;margin:12px 0 4px;"></h2>
        <p id="res-meta" style="color:#cbd5e1;font-size:14px;margin:4px 0 14px;"></p>
        <div id="res-score" style="font-size:28px;font-weight:800;color:#10b981;margin:12px 0;"></div>
        <div id="res-code" style="font-size:14px;color:#fbbf24;font-weight:700;"></div>
      </div>
      <button class="btn" style="margin-top:14px;" onclick="window.print()">🖨️ طباعة بطاقة وشهادة النتيجة</button>
    </div>
  </div>

  <script>
    const BANKS = {
      primary_lower: [
        { q: 'كم عدد أيام الأسبوع؟', o: ['5 أيام', '7 أيام', '10 أيام', '6 أيام'], c: 1 },
        { q: 'ما هو الكوكب الذي نعيش عليه؟', o: ['المريخ', 'الأرض', 'عطارد', 'زحل'], c: 1 },
        { q: 'ما عاصمة جمهورية مصر العربية؟', o: ['الإسكندرية', 'القاهرة', 'أسوان', 'طنطا'], c: 1 },
        { q: 'أي مما يلي من الكائنات الحية؟', o: ['الكرسي', 'الشجرة', 'الحجر', 'القلم'], c: 1 },
        { q: 'ما ناتج جمع 8 + 7 ؟', o: ['13', '14', '15', '16'], c: 2 }
      ],
      primary_upper: [
        { q: 'ما أطول نهر في العالم ويمر في مصر؟', o: ['نهر الأمازون', 'نهر النيل', 'نهر الفرات', 'نهر الدانوب'], c: 1 },
        { q: 'أي كوكب يُعرف بالكوكب الأحمر؟', o: ['الزهرة', 'المريخ', 'المشتري', 'نبتون'], c: 1 },
        { q: 'ما الغاز الذي يمتصه النبات في عملية البناء الضوئي؟', o: ['الأكسجين', 'ثاني أكسيد الكربون', 'النيتروجين', 'الهيدروجين'], c: 1 },
        { q: 'أكمل النمط العددي: 3 ، 6 ، 12 ، 24 ، ...', o: ['36', '48', '30', '60'], c: 1 },
        { q: 'ما إعراب كلمة (المجتهدُ) في جملة: الطالبُ المجتهدُ متفوقٌ؟', o: ['خبر', 'نعت مرفوع', 'مفعول به', 'مضاف إليه'], c: 1 }
      ],
      preparatory: [
        { q: 'ما العنصر الكيميائي الذي رمزه Fe؟', o: ['الفضة', 'الحديد', 'الفلور', 'الفسفور'], c: 1 },
        { q: 'في أي عام تم افتتاح قناة السويس للملاحة العالمية؟', o: ['1859', '1869', '1956', '1882'], c: 1 },
        { q: 'إذا كان 3س + 5 = 20، فما قيمة س؟', o: ['3', '5', '15', '4'], c: 1 },
        { q: 'ما الوحدة الأساسية لقياس شدة التيار الكهربي؟', o: ['الفولت', 'الأمبير', 'الأوم', 'الجول'], c: 1 },
        { q: 'من هو مؤسس علم الجبر؟', o: ['ابن الهيثم', 'الخوارزمي', 'ابن سينا', 'البيروني'], c: 1 }
      ],
      secondary: [
        { q: 'ما اسم العملية الحيوية التي يتم فيها بناء البروتين من شريط mRNA؟', o: ['التضاعف', 'الترجمة', 'النسخ العكسي', 'التحلل المائي'], c: 1 },
        { q: 'أي المعاهدات الآتية وقعت عام 1936 في تاريخ مصر الحديث؟', o: ['معاهدة لندن', 'معاهدة الصداقة والتحالف المصرية البريطانية', 'اتفاقية الجلاء', 'صلح كوتاهية'], c: 1 },
        { q: 'ما مشتقة الدالة د(س) = س³ + 4س عند س = 2 ؟', o: ['12', '16', '10', '8'], c: 1 },
        { q: 'أي طبقات الغلاف الجوي تحتوي على طبقة الأوزون؟', o: ['التروبوسفير', 'الستراتوسفير', 'الميزوسفير', 'الثرموسفير'], c: 1 },
        { q: 'ما نوع المحسن البديعي بين كلمتي (الليل والنهار)؟', o: ['جناس', 'طباق إيجاب', 'تورية', 'سجع'], c: 1 }
      ]
    };

    let currentQs = [];
    let qIdx = 0;
    let score = 0;
    let studentInfo = {};

    function startExam() {
      const name = document.getElementById('st-name').value.trim() || 'طالب عبقري';
      const stage = document.getElementById('st-stage').value;
      const gov = document.getElementById('st-gov').value;
      const admin = document.getElementById('st-admin').value.trim() || 'إدارة تعليمية';
      const school = document.getElementById('st-school').value.trim() || 'مدرسة مشاركة';
      studentInfo = { name, stage, gov, admin, school, code: 'OM-' + Math.floor(1000 + Math.random() * 9000) };
      currentQs = BANKS[stage] || BANKS.primary_upper;
      qIdx = 0;
      score = 0;
      document.getElementById('step-reg').classList.add('hidden');
      document.getElementById('step-quiz').classList.remove('hidden');
      renderQ();
    }

    function renderQ() {
      const item = currentQs[qIdx];
      document.getElementById('student-banner').textContent = studentInfo.name + ' — ' + studentInfo.school + ' (' + studentInfo.gov + ')';
      document.getElementById('q-counter').textContent = 'السؤال ' + (qIdx + 1) + ' من ' + currentQs.length;
      document.getElementById('q-text').textContent = item.q;
      const box = document.getElementById('q-options');
      box.innerHTML = '';
      item.o.forEach((optText, i) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.textContent = optText;
        b.onclick = () => {
          if (i === item.c) score += 20;
          qIdx++;
          if (qIdx < currentQs.length) renderQ();
          else finishExam();
        };
        box.appendChild(b);
      });
    }

    function finishExam() {
      document.getElementById('step-quiz').classList.add('hidden');
      document.getElementById('step-result').classList.remove('hidden');
      document.getElementById('res-name').textContent = 'الطالب/ة: ' + studentInfo.name;
      document.getElementById('res-meta').textContent = studentInfo.school + ' • ' + studentInfo.admin + ' • محافظة ' + studentInfo.gov;
      document.getElementById('res-score').textContent = 'النتيجة: ' + score + ' / 100 نقطة (' + (score >= 60 ? '🟢 مؤهل للمرحلة التالية' : '🟡 مشارك متميز') + ')';
      document.getElementById('res-code').textContent = '🎫 كود المتسابق الرسمي: ' + studentInfo.code;
    }
  </script>
</body>
</html>`;
    const blob = new Blob([standaloneHTML], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'مسابقة_دماغ_عالية_تفاعلية_للطلاب.html';
    a.click();
    setToast('🎁 تم تحميل ملف المسابقة التفاعلي المستقل! يعمل فوراً بدون استوديو على أي موبايل أو كمبيوتر.');
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleDownloadFullBackupJSON = () => {
    soundEngine.playFanfare();
    const payload = {
      exportedAt: new Date().toISOString(),
      competitionName: 'دماغ عالية — مسابقة المعرفة والذكاء والتفكير',
      settings,
      students,
      teams,
      registeredSchools,
      customQuestions,
      awards,
      seasonsArchive,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demagh_alya_full_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setToast('📥 تم تحميل النسخة الاحتياطية الكاملة للمسابقة (JSON) بنجاح!');
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadStudentsCSV = () => {
    soundEngine.playSelectTile();
    const header =
      'الاسم,الصف,المرحلة,اسم المدرسة,الإدارة التعليمية,المحافظة,كود المشاركة,النقاط الكلية,الترتيب بالمدرسة,الترتيب بالمحافظة,الترتيب بالجمهورية,تأهل للنهائيات\n';
    const rows = students
      .map(
        (s) =>
          `"${s.name}",${s.grade},"${s.stage || ''}","${s.schoolName || ''}","${s.administration || ''}","${s.governorate || s.region || ''}",${s.participationCode},${s.scores.total},${s.schoolRank || '-'},${s.governorateRank || '-'},${s.republicStageRank || s.republicRank || '-'},${
            s.qualifiedForFinals ? 'نعم' : 'لا'
          }`
      )
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'demagh_alya_republic_results.csv';
    a.click();
    setToast('📊 تم تحميل جدول نتائج وترتيب طلاب الجمهورية (Excel / CSV)!');
    setTimeout(() => setToast(null), 3500);
  };

  const handleDownloadDesktopShortcut = () => {
    soundEngine.playFanfare();
    const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=${OFFICIAL_PUBLIC_URL}" />
  <title>🧠 دماغ عالية — مسابقة المعرفة والذكاء والتفكير</title>
  <style>
    body { background: #0f0f12; color: #f2efeb; font-family: Tahoma, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .box { border: 2px solid #d4af37; border-radius: 20px; padding: 32px; max-width: 520px; background: #141A29; }
    a { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #d4af37; color: #0f0f12; text-decoration: none; font-weight: bold; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="box">
    <h1>🧠 دماغ عالية</h1>
    <p>جاري تحويلك إلى منصة مسابقة المعرفة والذكاء والتفكير (بلية ودماغه عالية!)...</p>
    <a href="${OFFICIAL_PUBLIC_URL}">🚀 اضغط هنا للدخول المباشر إلى المسابقة</a>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'دماغ_عالية_رابط_سريع.html';
    a.click();
    setToast('💻 تم تحميل أيقونة الدخول السريع على جهازك!');
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    // Dynamically update browser tab favicon when app profile image changes
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link && currentAppAvatar) {
      link.href = currentAppAvatar;
    }
  }, [currentAppAvatar]);

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
    if (!isAdminVerified) {
      setToast('🔒 تنبيه أمني: منح نقاط رسمية للفرق في قاعدة البيانات مسموح فقط للمشرفة العامة الموثقة.');
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setTeams((prev) => {
      const next = prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              points: Math.max(0, t.points + delta),
              wins: delta > 0 ? t.wins + 1 : t.wins,
            }
          : t
      );
      const updatedTeam = next.find((t) => t.id === teamId);
      if (updatedTeam) saveTeamToCloud(updatedTeam);
      return next;
    });
  };

  const handleAwardStudentPoints = (studentId: string, delta: number) => {
    if (!isAdminVerified) {
      setToast('🔒 تنبيه أمني: تعديل نقاط الطلاب الرسمية مسموح فقط للمشرفة العامة الموثقة.');
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setStudents((prev) => {
      const next = prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              scores: {
                ...s.scores,
                total: Math.max(0, s.scores.total + delta),
              },
            }
          : s
      );
      const updatedStu = next.find((s) => s.id === studentId);
      if (updatedStu) saveStudentToCloud(updatedStu);
      return next;
    });
  };

  const handleUseTeamCard = (
    teamId: string,
    cardKey: 'challengeCard' | 'swapQuestionCard' | 'doublePointsCard'
  ) => {
    setTeams((prev) => {
      const next = prev.map((t) =>
        t.id === teamId ? { ...t, cards: { ...t.cards, [cardKey]: false } } : t
      );
      const updatedTeam = next.find((t) => t.id === teamId);
      if (updatedTeam && isAdminVerified) saveTeamToCloud(updatedTeam);
      return next;
    });
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
      <header className="px-6 sm:px-12 py-5 flex justify-between items-center border-b-[1.5px] border-[#f2efeb] no-print">
        <div className="flex items-center gap-3.5">
          {/* App Profile Avatar with Quick Change Button */}
          <div
            onClick={() => setProfileModalOpen(true)}
            title="اضغط لتغيير صورة بروفيل التطبيق"
            className="relative group w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4af37] shadow-lg cursor-pointer shrink-0 bg-[#141418]"
          >
            <img
              src={currentAppAvatar}
              alt="صورة بروفيل تطبيق دماغ عالية"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-4 h-4 text-[#d4af37]" />
            </div>
          </div>

          <div
            onClick={() => setCurrentView('home')}
            className="cursor-pointer"
          >
            <div className="font-syne text-xl sm:text-2xl font-extrabold tracking-[-0.04em] text-[#d4af37] leading-none flex items-center gap-2">
              <span>🧠 دماغ عالية</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold">
                👦 بلية ودماغه عالية!
              </span>
            </div>
            <div className="text-[11px] text-[rgba(242,239,235,0.8)] font-bold mt-0.5">
              مسابقة المعرفة والذكاء والتفكير · لجميع مدارس ومحافظات مصر 🇪🇬
            </div>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-5">
          {(
            [
              { id: 'home', label: 'الرئيسية' },
              { id: 'real_projects', label: '🌟 المشروعات الحقيقية' },
              { id: 'content_management', label: '⚙️ إدارة المحتوى' },
              { id: 'qualifiers', label: 'التسجيل والتصفيات' },
              { id: 'practice', label: 'نسخة اختبار' },
              { id: 'national_rankings', label: 'ترتيب الجمهورية' },
              { id: 'schools_hub', label: 'المدارس' },
              { id: 'games_hub', label: 'الألعاب' },
              { id: 'admin', label: 'المشرف' },
            ] as { id: AppView; label: string }[]
          ).map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => {
                if (navItem.id === 'admin') setAdminInitialSection('overview');
                setCurrentView(navItem.id);
              }}
              className={`bg-transparent border-none text-[0.8rem] font-bold cursor-pointer transition-colors ${
                currentView === navItem.id
                  ? 'text-[#d4af37]'
                  : 'text-[rgba(242,239,235,0.65)] hover:text-[#f2efeb]'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <span
            title={
              cloudConnected
                ? 'متصل بقاعدة البيانات السحابية الحقيقية (Firestore Real-Time)'
                : 'جاري الاتصال بالسحابة...'
            }
            className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold border flex items-center gap-1.5 ${
              cloudConnected
                ? 'bg-emerald-500/15 border-emerald-400/60 text-emerald-300'
                : 'bg-amber-500/15 border-amber-400/60 text-amber-300'
            }`}
          >
            <span>{cloudConnected ? '🟢 متصل بالسحابة' : '⏳ سحابة...'}</span>
            <span className="font-mono-num">({students.length} طالب)</span>
          </span>
          <button
            onClick={() => {
              soundEngine.playSelectTile();
              setShareDownloadModalOpen(true);
            }}
            title="رابط المسابقة والتحميل المباشر"
            className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-400 hover:text-[#0f0f12] transition-colors cursor-pointer text-xs font-extrabold flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>📲 رابط التحميل والمشاركة</span>
          </button>
          <button
            onClick={() => setProfileModalOpen(true)}
            title="تغيير صورة بروفيل التطبيق"
            className="px-3 py-1.5 rounded-full border border-[rgba(242,239,235,0.25)] text-[rgba(242,239,235,0.85)] hover:text-[#d4af37] hover:border-[#d4af37] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="hidden sm:inline">صورة التطبيق</span>
          </button>
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
            <span>🧠 دماغ عالية</span>
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
                if (item.id === 'admin') setAdminInitialSection('overview');
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
            <div className="flex items-center gap-4 mb-5">
              <div
                onClick={() => setProfileModalOpen(true)}
                className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-2xl cursor-pointer shrink-0 bg-[#141418]"
              >
                <img
                  src={currentAppAvatar}
                  alt="شعار وبروفيل تطبيق دماغ عالية"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] font-bold text-[#d4af37] gap-1">
                  <Camera className="w-4 h-4" />
                  <span>تغيير الصورة</span>
                </div>
              </div>
              <div>
                <span className="label block mb-1">
                  DEMAGH ALYA COMPETITION · Belya & His High Brain
                </span>
                <div className="text-xs font-extrabold text-emerald-400 mb-1">
                  🧠 مسابقة المعرفة والذكاء والتفكير — مفتوحة لطلاب المدارس في جميع محافظات مصر 🇪🇬
                </div>
                <button
                  onClick={() => setProfileModalOpen(true)}
                  className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>تغيير صورة بروفيل التطبيق</span>
                </button>
              </div>
            </div>
            <h1
              className="font-syne font-extrabold text-[#f2efeb] mb-1.5"
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 5rem)',
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
              }}
            >
              🧠 دماغ عالية
            </h1>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-400 mb-2">
              مسابقة المعرفة والذكاء والتفكير
            </div>
            <div className="text-sm sm:text-base font-extrabold text-[#d4af37] mb-3 flex flex-wrap items-center gap-2">
              <span>{seasonOneConfig.name || 'الموسم الأول — دماغ عالية'}</span>
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 text-xs font-extrabold">
                👦 بلية ودماغه عالية!
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  seasonOneConfig.status === 'active'
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : seasonOneConfig.status === 'registration_open'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : seasonOneConfig.status === 'ended'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                }`}
              >
                {seasonOneConfig.status === 'active'
                  ? '🔵 الموسم نشط (المسابقة جارية)'
                  : seasonOneConfig.status === 'registration_open'
                  ? '🟢 التسجيل مفتوح الآن في الموسم الأول'
                  : seasonOneConfig.status === 'ended'
                  ? '🔴 انتهى الموسم الأول'
                  : '🟡 الموسم الأول — مسودة قيد التجهيز (draft)'}
              </span>
              {(seasonOneConfig.registrationStart || seasonOneConfig.competitionStart) && (
                <span className="text-xs text-slate-300 font-mono">
                  {seasonOneConfig.registrationStart
                    ? `التسجيل: ${seasonOneConfig.registrationStart}`
                    : ''}{' '}
                  {seasonOneConfig.competitionStart
                    ? `· انطلاق المسابقة: ${seasonOneConfig.competitionStart}`
                    : ''}
                </span>
              )}
            </div>
            <p className="hero-tagline mb-4">
              «بلية ودماغه عالية! فكّر أسرع… اعرف أكثر… وشغّل دماغك!»
            </p>

            {/* 👦 Official Competition Mascot Card: بلية (بلية ودماغه عالية!) */}
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-l from-amber-500/15 via-[#141A29] to-emerald-500/10 border-2 border-[#d4af37]/80 max-w-[600px] flex items-center gap-3.5 shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-2xl shrink-0">
                👦
              </div>
              <div className="space-y-1">
                <div className="text-xs sm:text-sm font-extrabold text-[#d4af37] flex items-center gap-2">
                  <span>شخصية المسابقة الرسمية: بلية</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[10px]">
                    بلية ودماغه عالية!
                  </span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  أهلاً بيك يا بطل في <strong className="text-amber-300">دماغ عالية</strong>! جهّز تركيزك في أسئلة اللغة العربية، الحساب الذهني، العلوم، مصر والعالم، الإنجليزي، الثقافة العامة، والذكاء والمنطق!
                </p>
              </div>
            </div>

            {/* Live National Statistics Strip (#24: إحصائيات مباشرة في الصفحة الرئيسية) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 max-w-[600px]">
              <div
                onClick={() => setCurrentView('national_rankings')}
                className="p-3 rounded-xl bg-[#141A29] border border-emerald-400/40 hover:border-emerald-400 cursor-pointer text-center transition-all"
              >
                <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-emerald-400">
                  {liveStats.studentsCount}
                </div>
                <div className="text-[11px] text-slate-300 font-bold">👨‍🎓 طالب مشارك</div>
              </div>
              <div
                onClick={() => setCurrentView('schools_hub')}
                className="p-3 rounded-xl bg-[#141A29] border border-amber-400/40 hover:border-amber-400 cursor-pointer text-center transition-all"
              >
                <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-amber-400">
                  {liveStats.schoolsCount}
                </div>
                <div className="text-[11px] text-slate-300 font-bold">🏫 مدرسة مشاركة</div>
              </div>
              <div
                onClick={() => setCurrentView('national_rankings')}
                className="p-3 rounded-xl bg-[#141A29] border border-sky-400/40 hover:border-sky-400 cursor-pointer text-center transition-all"
              >
                <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-sky-400">
                  {liveStats.administrationsCount}
                </div>
                <div className="text-[11px] text-slate-300 font-bold">🏛️ إدارة تعليمية</div>
              </div>
              <div
                onClick={() => setCurrentView('egypt_map')}
                className="p-3 rounded-xl bg-[#141A29] border border-purple-400/40 hover:border-purple-400 cursor-pointer text-center transition-all"
              >
                <div className="text-xl sm:text-2xl font-extrabold font-mono-num text-purple-400">
                  {liveStats.governoratesCount} / 27
                </div>
                <div className="text-[11px] text-slate-300 font-bold">🗺️ محافظة مصرية</div>
              </div>
            </div>

            {/* Official Artwork Banner Showcase */}
            <div
              onClick={() => setProfileModalOpen(true)}
              className="relative group mb-5 rounded-2xl overflow-hidden border-2 border-[#d4af37]/80 shadow-2xl max-w-[600px] cursor-pointer"
            >
              <img
                src={OFFICIAL_HERO_BANNER}
                alt="دماغ عالية - مسابقة المعرفة والذكاء والتفكير"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover"
              />
            </div>

            <p className="max-w-[580px] leading-[1.7] text-[rgba(242,239,235,0.75)] mb-4 text-sm">
              «دماغ عالية» هي مسابقة المعرفة والذكاء والتفكير بصحبة شخصية «بلية — بلية ودماغه عالية!» المفتوحة لطلاب المدارس الحكومية والرسمية للغات والخاصة والأزهرية والدولية في جميع محافظات جمهورية مصر العربية، ببنك أسئلة معتمد وتصفيات إلكترونية ذاتية عادلة.
            </p>

            {/* 🌟 Real Projects & Authentic Content Highlight Strip (نسمة حياة + دماغ عالية + إدارة المحتوى) */}
            <div className="mb-5 p-4 rounded-2xl bg-[#141A29] border-2 border-emerald-400/60 max-w-[600px] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-300">
                  🌟 المشروعات الحقيقية المعتمدة (بدون أي بيانات وهمية أو مختلقة):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelectTile();
                    setCurrentView('content_management');
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-[#d4af37] text-[#0f0f12] font-extrabold cursor-pointer hover:bg-amber-300"
                >
                  ⚙️ إدارة المحتوى + إضافة مشروع حقيقي
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {realProjects.slice(0, 4).map((rp) => (
                  <div
                    key={rp.id}
                    onClick={() => {
                      soundEngine.playSelectTile();
                      setCurrentView('real_projects');
                    }}
                    className="p-3 rounded-xl bg-[#0f0f12]/90 border border-slate-800 hover:border-[#d4af37] cursor-pointer transition-all space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-extrabold text-[#d4af37]">{rp.name}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          rp.status === 'published'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {rp.status === 'published' ? 'منشور' : 'قريبًا'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300 line-clamp-2">
                      {rp.description || 'سيتم إضافة المحتوى قريبًا'}
                    </div>
                    <div className="text-[10px] text-amber-300/90 pt-0.5">
                      {rp.isInternalPlatform
                        ? '🔗 المنصة الحالية المباشرة'
                        : rp.realUrl
                        ? '🔗 رابط رسمي متاح'
                        : '🔒 الرابط سيتم إضافته لاحقًا'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📅 Year-Round 6-Phase Qualifiers Strip on Home Page */}
            <div className="mb-5 p-4 rounded-2xl bg-gradient-to-l from-[#18294D] to-[#141A29] border-2 border-[#d4af37]/70 max-w-[600px] space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#d4af37]">
                  📅 المسابقة على مدار السنة (٦ مراحل تصفيات متدرجة — سبتمبر إلى أغسطس):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelectTile();
                    setCurrentView('annual_roadmap');
                  }}
                  className="text-[11px] font-extrabold text-emerald-400 hover:underline cursor-pointer"
                >
                  عرض خريطة السنة الكاملة ←
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(settings.annualPhases && settings.annualPhases.length > 0
                  ? settings.annualPhases
                  : DEFAULT_ANNUAL_PHASES
                ).map((ph) => {
                  const isCurr =
                    (settings.activeAnnualPhaseId || 'phase_2_administration') === ph.id;
                  return (
                    <div
                      key={ph.id}
                      onClick={() => {
                        soundEngine.playSelectTile();
                        setCurrentView('annual_roadmap');
                      }}
                      className={`p-2 rounded-xl border text-[11px] cursor-pointer transition-all ${
                        isCurr
                          ? 'bg-[#d4af37] text-[#0f0f12] border-white font-extrabold shadow'
                          : ph.status === 'completed'
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-[#0f0f12]/80 border-slate-800 text-slate-300 hover:border-[#d4af37]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] opacity-85">
                        <span>{ph.monthsLabel}</span>
                        <span>{isCurr ? '🟢 الآن' : ph.status === 'completed' ? '✓' : '⏳'}</span>
                      </div>
                      <div className="font-bold truncate mt-0.5">
                        {ph.icon} {ph.shortTitle}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Educational Stages Interactive Grid (#2: المراحل الأربع ببنوك أسئلة مستقلة) */}
            <div className="mb-5 max-w-[600px] space-y-2">
              <div className="text-xs font-extrabold text-[#d4af37] flex items-center justify-between">
                <span>🎓 المراحل التعليمية الأربع (بنك أسئلة وزمن ومستوى صعوبة مستقل لكل مرحلة):</span>
                <span className="text-[10px] text-emerald-400">ابتدائي صغير ≠ كبير ≠ إعدادي ≠ ثانوي</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(
                  [
                    {
                      stage: 'primary_lower' as EducationalStage,
                      title: '🟢 ابتدائي صغير',
                      grades: 'الأول · الثاني · الثالث',
                      desc: 'أسئلة مصورة مبسطة · 45ث',
                    },
                    {
                      stage: 'primary_upper' as EducationalStage,
                      title: '🔵 ابتدائي كبير',
                      grades: 'الرابع · الخامس · السادس',
                      desc: 'ألغاز وتفكير منطقي · 35ث',
                    },
                    {
                      stage: 'preparatory' as EducationalStage,
                      title: '🟣 المرحلة الإعدادية',
                      grades: 'الأول · الثاني · الثالث',
                      desc: 'تحليل وعلوم وتاريخ · 30ث',
                    },
                    {
                      stage: 'secondary' as EducationalStage,
                      title: '🟠 المرحلة الثانوية',
                      grades: 'الأول · الثاني · الثالث',
                      desc: 'استنتاج متقدم وتفكير نقدي · 25ث',
                    },
                  ]
                ).map((item) => {
                  const meta = STAGE_METADATA[item.stage];
                  const stgCount = nationalAggregated.stageBreakdown[item.stage]?.total || 0;
                  return (
                    <div
                      key={item.stage}
                      onClick={() => {
                        soundEngine.playSelectTile();
                        setCurrentView('qualifiers');
                      }}
                      className="p-3 rounded-xl bg-[#141A29] border hover:scale-[1.02] transition-all cursor-pointer space-y-1"
                      style={{ borderColor: `${meta.badgeColor}66` }}
                    >
                      <div className="text-xs font-extrabold" style={{ color: meta.badgeColor }}>
                        {item.title}
                      </div>
                      <div className="text-[10px] text-white font-bold">{item.grades}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                      <div className="text-[10px] text-amber-300 font-mono-num pt-0.5">
                        👥 {stgCount} متسابق
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dual Competition Mode Highlight: Individual + Team System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 max-w-[600px]">
              <div
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('qualifiers');
                }}
                className="p-4 rounded-xl bg-[#141A29] border border-emerald-400/50 hover:border-emerald-400 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-emerald-400">👤 النظام الفردي والتصفيات</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">طالب مستقل</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يسجل الطالب مدرسته وإدارته ومحافظته وصفه، ويحصل على كود مشاركة 🎫 ويخوض اختبار مرحلته الآلي.
                </p>
              </div>

              <div
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('teams');
                }}
                className="p-4 rounded-xl bg-[#141A29] border border-amber-400/50 hover:border-amber-400 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-amber-400">👥 نظام الفرق والتصويت اللحظي</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">4 أو 5 لاعبين</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  تكوين فريق للمدرسة (٤ أو ٥ لاعبين) مع ميزة التصويت اللحظي وإجماع الفريق في استوديو دماغ عالية!
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('qualifiers');
                }}
                className="btn btn-primary"
              >
                📝 التسجيل وبدء المسابقة
              </button>
              <button
                onClick={() => {
                  soundEngine.playSelectTile();
                  setCurrentView('practice');
                }}
                className="btn btn-secondary"
              >
                👦 جرّب مع بلية (١٠ أسئلة)
              </button>
              <button
                onClick={() => {
                  soundEngine.playBuzzer();
                  setSelectedGameTab('classic_board');
                  setCurrentView('games_hub');
                }}
                className="btn btn-secondary"
              >
                📺 استوديو وألعاب دماغ عالية (١٠ ألعاب)
              </button>
              <button
                onClick={() => setCurrentView('national_rankings')}
                className="btn btn-secondary"
              >
                🇪🇬 الترتيب العام للجمهورية
              </button>
              <button
                onClick={() => setCurrentView('schools_hub')}
                className="btn btn-secondary"
              >
                🏫 المدارس المشاركة
              </button>
              <button
                onClick={() => setCurrentView('egypt_map')}
                className="btn btn-secondary"
              >
                🗺️ محافظات مصر (٢٧)
              </button>
              <button
                onClick={() => setCurrentView('certificates')}
                className="btn btn-secondary"
              >
                📜 الشهادات الرقمية
              </button>
              <button
                onClick={() => {
                  soundEngine.playFanfare();
                  setShareDownloadModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#0f0f12' }}
              >
                📲 رابط المسابقة والتحميل
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
          {currentView === 'real_projects' && (
            <RealProjectsAndCMS
              mode="real_projects"
              projects={realProjects}
              onSaveProject={async (proj) => {
                if (!isAdminVerified) return;
                const ok = await saveProjectToCloud(proj);
                if (ok) {
                  setRealProjects((prev) => {
                    const exists = prev.some((p) => p.id === proj.id);
                    return exists
                      ? prev.map((p) => (p.id === proj.id ? proj : p))
                      : [proj, ...prev];
                  });
                  setToast(`☁️ تم حفظ المشروع الحقيقي «${proj.name}» في قاعدة البيانات السحابية!`);
                } else {
                  setToast('🔒 رفض Firestore العملية: يتطلب تعديل المشروعات صلاحية المشرفة العامة (Admin).');
                }
                setTimeout(() => setToast(null), 3500);
              }}
              onDeleteProject={async (projId) => {
                if (!isAdminVerified) return;
                const ok = await deleteProjectFromCloud(projId);
                if (ok) {
                  setRealProjects((prev) => prev.filter((p) => p.id !== projId));
                  setToast('🗑️ تم حذف المشروع من البوابة بنجاح.');
                } else {
                  setToast('🔒 رفض Firestore العملية: الحذف مسموح للمشرفة العامة فقط.');
                }
                setTimeout(() => setToast(null), 3500);
              }}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'content_management' && (
            !isAdminVerified ? (
              <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#131F38] border-2 border-amber-400/60 text-center space-y-5 shadow-2xl">
                <div className="text-4xl">🛡️</div>
                <div>
                  <span className="text-xs font-extrabold text-amber-400">
                    Firebase Authentication + Firestore RBAC
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    إدارة المحتوى للمشرفة المصرح لها فقط
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    تخضع مجموعة المشروعات (`projects`) في Firestore لقواعد أمان صارمة (`isAdmin()`) تمنع أي مستخدم غير مصرح له من الإضافة أو التعديل أو الحذف.
                  </p>
                </div>

                {authErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold">
                    {authErrorMessage}
                  </div>
                )}

                <button
                  type="button"
                  disabled={authChecking}
                  onClick={async () => {
                    setAuthErrorMessage(null);
                    const res = await signInSupervisorWithGoogle();
                    if (res.isAdmin) {
                      setIsAdminVerified(true);
                      soundEngine.playCorrect();
                    } else {
                      soundEngine.playWrong();
                      setAuthErrorMessage(res.error || 'غير مصرح لهذا الحساب بالدخول.');
                    }
                  }}
                  className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                >
                  🔐 تسجيل الدخول بحساب المشرفة العامة (Google Auth)
                </button>
              </div>
            ) : (
              <RealProjectsAndCMS
                mode="content_management"
                projects={realProjects}
                seasonOneConfig={seasonOneConfig}
                customQuestions={customQuestions}
                onSaveSeasonOneConfig={async (newSeasonCfg) => {
                  if (!isAdminVerified) {
                    setToast('🔒 رفض العملية: تعديل إعدادات الموسم الأول مسموح للمشرفة العامة الموثقة فقط.');
                    setTimeout(() => setToast(null), 3500);
                    return false;
                  }
                  const ok = await saveSeasonConfigToCloud(newSeasonCfg);
                  if (ok) {
                    setSeasonOneConfig(newSeasonCfg);
                    setToast(`☁️ تم حفظ واعتماد إعدادات «${newSeasonCfg.name}» في المصدر الأساسي (platform/season_1) ومزامنة النسخة العامة!`);
                  } else {
                    setToast('🔒 تعذر حفظ وثيقة الموسم في Firestore.');
                  }
                  setTimeout(() => setToast(null), 3500);
                  return ok;
                }}
                onSaveProject={async (proj) => {
                  const ok = await saveProjectToCloud(proj);
                  if (ok) {
                    setRealProjects((prev) => {
                      const exists = prev.some((p) => p.id === proj.id);
                      return exists
                        ? prev.map((p) => (p.id === proj.id ? proj : p))
                        : [proj, ...prev];
                    });
                    setToast(`☁️ تم حفظ المشروع الحقيقي «${proj.name}» في قاعدة البيانات السحابية!`);
                  } else {
                    setToast('🔒 رفض Firestore العملية: يتطلب تعديل المشروعات صلاحية المشرفة العامة (Admin).');
                  }
                  setTimeout(() => setToast(null), 3500);
                }}
                onDeleteProject={async (projId) => {
                  const ok = await deleteProjectFromCloud(projId);
                  if (ok) {
                    setRealProjects((prev) => prev.filter((p) => p.id !== projId));
                    setToast('🗑️ تم حذف المشروع من البوابة بنجاح.');
                  } else {
                    setToast('🔒 رفض Firestore العملية: الحذف مسموح للمشرفة العامة فقط.');
                  }
                  setTimeout(() => setToast(null), 3500);
                }}
                onNavigate={(v) => setCurrentView(v)}
              />
            )
          )}

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
              settings={effectiveSettings}
              students={students}
              onRegisterStudent={async (newStu) => {
                const cleanInitialStudent: StudentProfile = {
                  ...newStu,
                  ownerUid: auth.currentUser?.uid || newStu.ownerUid,
                  completedQualifier: false,
                  attemptsUsed: 0,
                  xp: 0,
                  achievementsCount: 0,
                  badges: [],
                  qualifiedForFinals: false,
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
                };
                setStudents((prev) => {
                  if (
                    prev.some(
                      (s) =>
                        s.id === cleanInitialStudent.id ||
                        s.participationCode.toUpperCase() === cleanInitialStudent.participationCode.toUpperCase()
                    )
                  ) {
                    return prev;
                  }
                  const { rankedStudents } = runAutomatedRankingAndQualification(
                    [cleanInitialStudent, ...prev],
                    effectiveSettings
                  );
                  return rankedStudents;
                });
                const ok = await saveStudentToCloud(cleanInitialStudent);
                if (ok) {
                  setToast(`☁️ تم تسجيل الطالب/ة «${newStu.name}» وحفظه مباشرة في قاعدة البيانات السحابية!`);
                } else {
                  setToast(`⚠️ تعذر الحفظ السحابي. يرجى التحقق من الاتصال والصلاحيات.`);
                }
                setTimeout(() => setToast(null), 4000);
              }}
              onCompleteQualifier={async (stuId, updated) => {
                // Result is already verified, graded, and persisted to Firestore by the Trusted Backend (`/api/exam/submit`).
                // Update local state immediately and show confirmation toast.
                const prevStudent = students.find((s) => s.id === stuId);
                const prevScore = prevStudent?.scores.total || 0;
                const scoreDelta = Math.max(0, updated.scores.total - prevScore);

                const authoritativeStudentPayload: StudentProfile = {
                  ...updated,
                  ownerUid: prevStudent?.ownerUid || auth.currentUser?.uid || updated.ownerUid,
                };

                setStudents((prev) => {
                  const replaced = prev.map((s) => (s.id === stuId ? authoritativeStudentPayload : s));
                  const { rankedStudents } = runAutomatedRankingAndQualification(
                    replaced,
                    effectiveSettings
                  );
                  const newlyRanked = rankedStudents.find((r) => r.id === stuId) || authoritativeStudentPayload;
                  setActiveStudent(newlyRanked);
                  return rankedStudents;
                });

                if (scoreDelta > 0 && isAdminVerified) {
                  setTeams((prevTeams) => {
                    let teamUpdated: Team | null = null;
                    const nextTeams = prevTeams.map((t) => {
                      const isMember =
                        t.id === updated.teamId ||
                        t.members.some((m) => m.name.trim() === updated.name.trim());
                      if (isMember) {
                        teamUpdated = {
                          ...t,
                          points: t.points + scoreDelta,
                        };
                        return teamUpdated;
                      }
                      return t;
                    });
                    if (teamUpdated) {
                      saveTeamToCloud(teamUpdated);
                    }
                    return nextTeams;
                  });
                }

                setUnlockedJourneyIdx((prev) => Math.max(prev, 5));
                setToast(`☁️ تم تصحيح واعتماد وحفظ نتيجة الطالب/ة «${updated.name}» (${updated.scores.total} نقطة) عبر الخادم الموثوق فوراً!`);
                setTimeout(() => setToast(null), 4000);
              }}
              onNavigateView={(v) => setCurrentView(v)}
              activeStudent={activeStudent}
              setActiveStudent={setActiveStudent}
              customQuestions={customQuestions}
              publicReadinessSummary={publicReadinessSummary}
            />
          )}

          {currentView === 'genius_card' && (
            activeStudent ? (
              <GeniusCardView
                student={activeStudent}
                allStudents={students}
                onSelectStudent={(s) => setActiveStudent(s)}
              />
            ) : (
              <div className="max-w-xl mx-auto p-8 rounded-3xl bg-[#131F38] border border-amber-400/40 text-center space-y-4">
                <div className="text-3xl">🪪</div>
                <h3 className="text-xl font-bold text-white">لا يوجد طلاب مسجلون بعد</h3>
                <p className="text-xs text-slate-300">
                  سجّل كطالب جديد في صفحة «التسجيل والتصفيات» لتصدر لك بطاقة العبقري الرسمية فوراً.
                </p>
                <button
                  onClick={() => setCurrentView('qualifiers')}
                  className="btn btn-primary"
                >
                  📝 انتقل إلى صفحة التسجيل الآن
                </button>
              </div>
            )
          )}

          {currentView === 'games_hub' && (
            <GamesArenaHub
              initialGameTab={selectedGameTab}
              teams={teams}
              students={students}
              onAwardTeamPoints={handleAwardTeamPoints}
              onAwardStudentPoints={handleAwardStudentPoints}
              onUseTeamCard={handleUseTeamCard}
              settings={effectiveSettings}
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
              settings={effectiveSettings}
              awards={awards}
              onStartGameArena={() => {
                setSelectedGameTab('classic_board');
                setCurrentView('games_hub');
              }}
              onOpenAwardsPage={() => setCurrentView('awards')}
              onCreateTeam={async (newTeam) => {
                let duplicate = false;
                setTeams((prev) => {
                  if (prev.some((t) => t.name.trim() === newTeam.name.trim())) {
                    duplicate = true;
                    return prev;
                  }
                  return [newTeam, ...prev];
                });
                if (duplicate) return;
                const ok = await saveTeamToCloud(newTeam);
                if (ok) {
                  setToast(`☁️ تم إنشاء وحفظ ${newTeam.name} (${newTeam.members.length} لاعبين) في قاعدة البيانات السحابية!`);
                } else {
                  setToast(`⚠️ تعذر حفظ الفريق في قاعدة البيانات السحابية بسبب انقطاع الإنترنت.`);
                }
                setTimeout(() => setToast(null), 3500);
              }}
            />
          )}

          {(currentView === 'annual_roadmap' ||
            currentView === 'national_rankings' ||
            currentView === 'schools_hub' ||
            currentView === 'egypt_map' ||
            currentView === 'seasons_archive' ||
            currentView === 'certificates' ||
            currentView === 'about_privacy') && (
            <NationalPlatformHub
              mode={currentView}
              students={students}
              settings={effectiveSettings}
              onUpdateSettings={async (updater) => {
                if (!isAdminVerified) {
                  setToast('🔒 تعديل إعدادات المنصة مسموح فقط للمشرفة العامة الموثقة عبر Firebase Auth.');
                  setTimeout(() => setToast(null), 3500);
                  return;
                }
                setSettings((prev) => {
                  const base = applySeasonOneToSettings(prev, seasonOneConfig);
                  const next = typeof updater === 'function' ? updater(base) : updater;
                  saveSettingsToCloud(next);
                  return next;
                });
              }}
              registeredSchools={registeredSchools}
              onRegisterSchool={async (newSch) => {
                let duplicate = false;
                setRegisteredSchools((prev) => {
                  if (prev.some((s) => s.name.trim() === newSch.name.trim() && s.governorate === newSch.governorate)) {
                    duplicate = true;
                    return prev;
                  }
                  return [newSch, ...prev];
                });
                if (duplicate) return;
                const ok = await saveSchoolToCloud(newSch);
                if (ok) {
                  setToast(`☁️ تم تسجيل ${newSch.name} (${newSch.governorate}) في قاعدة البيانات السحابية بنجاح!`);
                } else {
                  setToast(`⚠️ تعذر تسجيل المدرسة في السحابة بسبب انقطاع الإنترنت.`);
                }
                setTimeout(() => setToast(null), 3500);
              }}
              seasonsArchive={seasonsArchive}
              activeStudent={activeStudent}
              onSelectStudent={(s) => setActiveStudent(s)}
              onNavigate={(v) => setCurrentView(v)}
            />
          )}

          {currentView === 'admin' && (
            !isAdminVerified ? (
              <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#131F38] border-2 border-amber-400/60 text-center space-y-5 shadow-2xl">
                <div className="text-4xl">🔐</div>
                <div>
                  <span className="text-xs font-extrabold text-amber-400">
                    Firebase Authentication + Firestore Security Rules
                  </span>
                  <h2 className="text-2xl font-bold text-white font-display mt-1">
                    بوابة التحقق السحابي للمشرفة العامة
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    جميع عمليات الإدارة (الطلاب، الجوائز، المواسم، الأسئلة، المشروعات، والإعدادات) محمية مباشرة داخل قواعد أمان <strong>Firebase Firestore</strong> ولا تُنفذ إلا لحساب المشرفة العامة الموثق عبر Google Authentication.
                  </p>
                </div>

                {firebaseUser && !firebaseUser.isAnonymous && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    الحساب المسجل حالياً: <strong className="text-amber-300">{firebaseUser.email}</strong>
                  </div>
                )}

                {authErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-400 text-rose-200 text-xs font-bold">
                    {authErrorMessage}
                  </div>
                )}

                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={authChecking}
                    onClick={async () => {
                      setAuthErrorMessage(null);
                      const res = await signInSupervisorWithGoogle();
                      if (res.isAdmin) {
                        setIsAdminVerified(true);
                        soundEngine.playCorrect();
                      } else {
                        soundEngine.playWrong();
                        setAuthErrorMessage(
                          res.error ||
                            '❌ هذا الحساب لا يملك صلاحية المشرفة العامة (Admin/Supervisor) في Firestore.'
                        );
                      }
                    }}
                    className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs cursor-pointer"
                  >
                    🔓 تسجيل الدخول بحساب المشرفة العامة (Google Auth)
                  </button>

                  {firebaseUser && !firebaseUser.isAnonymous && (
                    <button
                      type="button"
                      onClick={async () => {
                        await signOutFirebaseUser();
                        setAuthErrorMessage(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer"
                    >
                      تسجيل الخروج وتبديل الحساب
                    </button>
                  )}
                </div>
              </div>
            ) : (
            <AdminDashboard
              students={students}
              setStudents={(updater) => {
                setStudents((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  saveMultipleStudentsToCloud(next);
                  return next;
                });
              }}
              teams={teams}
              setTeams={(updater) => {
                setTeams((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  saveMultipleTeamsToCloud(next);
                  return next;
                });
              }}
              customQuestions={customQuestions}
              setCustomQuestions={(updater) => {
                setCustomQuestions((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  saveCustomQuestionsToCloud(next);
                  return next;
                });
              }}
              settings={effectiveSettings}
              setSettings={(updater) => {
                setSettings((prev) => {
                  const base = applySeasonOneToSettings(prev, seasonOneConfig);
                  const next = typeof updater === 'function' ? updater(base) : updater;
                  saveSettingsToCloud(next);

                  // If Admin modified any season-level field via AdminDashboard, write directly to Single Source of Truth (`platform/season_1`)
                  const nextSeasonStatus =
                    next.seasonStatus !== base.seasonStatus
                      ? next.seasonStatus === 'qualifiers_running'
                        ? 'active'
                        : next.seasonStatus === 'registration_open'
                        ? 'registration_open'
                        : next.seasonStatus === 'season_closed'
                        ? 'ended'
                        : seasonOneConfig.status
                      : seasonOneConfig.status;

                  if (
                    (next.seasonName && next.seasonName !== seasonOneConfig.name) ||
                    nextSeasonStatus !== seasonOneConfig.status ||
                    next.startDate !== seasonOneConfig.competitionStart ||
                    next.endDate !== seasonOneConfig.competitionEnd
                  ) {
                    const syncedSeason: SeasonOneConfig = {
                      ...seasonOneConfig,
                      id: 'season_1',
                      seasonId: 'season_1',
                      name: next.seasonName || seasonOneConfig.name,
                      status: nextSeasonStatus,
                      competitionStart: next.startDate ?? seasonOneConfig.competitionStart,
                      competitionEnd: next.endDate ?? seasonOneConfig.competitionEnd,
                      updatedAt: new Date().toISOString(),
                    };
                    setSeasonOneConfig(syncedSeason);
                    saveSeasonConfigToCloud(syncedSeason);
                  }
                  return next;
                });
              }}
              matches={matches}
              setMatches={setMatches}
              awards={awards}
              setAwards={(updater) => {
                setAwards((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  saveAwardsToCloud(next);
                  return next;
                });
              }}
              seasonsArchive={seasonsArchive}
              setSeasonsArchive={(updater) => {
                setSeasonsArchive((prev) => {
                  const next = typeof updater === 'function' ? updater(prev) : updater;
                  saveSeasonsArchiveToCloud(next);
                  return next;
                });
              }}
              initialSection={adminInitialSection}
              onTriggerGeniusAlarm={handleTriggerAlarm}
            />
            )
          )}
        </main>
      )}

      {/* ==================== ROW 4: LUXURY FOOTER (Variation 2) ==================== */}
      <footer className="border-t border-[rgba(242,239,235,0.1)] px-6 sm:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-2 no-print">
        <div className="label">© 2026 DEMAGH ALYA COMPETITION — دماغ عالية (مسابقة المعرفة والذكاء والتفكير)</div>
        <div className="label">👦 بلية ودماغه عالية!</div>
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

      {/* ==================== 🖼️ APP PROFILE IMAGE CUSTOMIZATION MODAL ==================== */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-[#0f0f12] border-2 border-[#d4af37] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[rgba(242,239,235,0.1)] pb-4">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-lg font-bold text-[#f2efeb] font-display">
                  تغيير صورة بروفيل التطبيق (شعار دماغ عالية)
                </h3>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-xs text-[rgba(242,239,235,0.6)] hover:text-white cursor-pointer"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Current Profile Image Preview */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#141418] border border-[rgba(242,239,235,0.12)]">
              <img
                src={currentAppAvatar}
                alt="صورة بروفيل التطبيق الحالية"
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[#d4af37] shrink-0"
              />
              <div className="space-y-1.5">
                <div className="text-xs text-[#d4af37] font-bold">الصورة المعتمدة حالياً</div>
                <p className="text-xs text-[rgba(242,239,235,0.65)] leading-relaxed">
                  تظهر هذه الصورة في الهيدر العلوي، الصفحة الرئيسية، أيقونة المتصفح (Favicon)، وبطاقات التتويج.
                </p>
              </div>
            </div>

            {/* Option 1: Choose from 4 Official Generated Presets */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#f2efeb]">
                ١. اختر من الشعارات الرسمية الجاهزة لمسابقة «دماغ عالية»:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {APP_PROFILE_PRESETS.map((preset) => {
                  const isSelected = currentAppAvatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        soundEngine.playSelectTile();
                        setSettings((prev) => ({ ...prev, appProfileImage: preset.url }));
                        setToast(`تم تحديث صورة بروفيل التطبيق إلى: ${preset.name}`);
                        setTimeout(() => setToast(null), 3000);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
                          : 'bg-[#141418] border-[rgba(242,239,235,0.12)] text-[#f2efeb] hover:border-[#d4af37]/50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover border border-[rgba(242,239,235,0.2)]"
                      />
                      <span className="text-[11px] font-bold leading-tight">{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 2: Upload Custom Image from User's Device */}
            <div className="space-y-2.5 pt-2 border-t border-[rgba(242,239,235,0.1)]">
              <div className="text-xs font-bold text-[#f2efeb]">
                ٢. أو ارفع صورة خاصة من جهازك (شعار المدرسة أو صورة مخصصة):
              </div>
              <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#141418] border border-dashed border-[#d4af37]/60 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors cursor-pointer text-xs font-bold">
                <Upload className="w-4 h-4" />
                <span>اختر ملف صورة من جهازك (PNG / JPG)...</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        soundEngine.playFanfare();
                        setSettings((prev) => ({
                          ...prev,
                          appProfileImage: reader.result as string,
                        }));
                        setToast('تم رفع واعتماد صورة بروفيل التطبيق الجديدة بنجاح!');
                        setTimeout(() => setToast(null), 3500);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="btn btn-primary"
                style={{ padding: '0.6rem 1.6rem' }}
              >
                ✓ تم الحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 📲 DIRECT SHARE LINK & DOWNLOAD HUB MODAL ==================== */}
      {shareDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#0f0f12] border-2 border-[#d4af37] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-[rgba(242,239,235,0.12)] pb-4">
              <div className="flex items-center gap-2.5">
                <Download className="w-6 h-6 text-[#d4af37]" />
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#f2efeb] font-display">
                    📲 رابط المسابقة المباشر ومركز التحميل
                  </h3>
                  <p className="text-xs text-slate-400">
                    دماغ عالية — مسابقة المعرفة والذكاء والتفكير (👦 بلية ودماغه عالية!)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShareDownloadModalOpen(false)}
                className="text-xs text-[rgba(242,239,235,0.6)] hover:text-white cursor-pointer px-3 py-1 rounded-lg bg-slate-900"
              >
                إغلاق ✕
              </button>
            </div>

            {/* 0. Important Guide: Why "Share" shares the Studio vs "Deploy to Cloud Run" for standalone website */}
            <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400 space-y-3">
              <div className="text-xs sm:text-sm font-extrabold text-amber-300 flex items-center gap-2">
                <span>💡 لماذا زر «Share» يشارك الاستوديو؟ وكيف تحصلين على موقع مستقل للطلاب فقط؟</span>
              </div>
              <div className="text-xs text-slate-200 space-y-2 leading-relaxed">
                <p>
                  • زر <strong>«Share»</strong> العادي في المنصة يشارك <strong>مشروع الاستوديو بالكامل (مع الكود والشات)</strong> وليس الموقع وحده.
                </p>
                <p>
                  • <strong className="text-emerald-300">الحل ١ (رابط ويب مستقل بدون استوديو):</strong> من أعلى يمين شاشة Google AI Studio اضغطي على أيقونة <strong className="text-amber-300">«Deploy to Cloud Run 🚀» (أو أيقونة الصاروخ / الفتح في نافذة مستقلة ↗)</strong>، سيمنحكِ رابط موقع مستقل تماماً يفتح المسابقة وحدها بكامل الشاشة بدون أي أثر للاستوديو!
                </p>
                <p>
                  • <strong className="text-sky-300">الحل ٢ (فوري الآن بضغطة زر):</strong> حمّلي <strong>«ملف المسابقة التفاعلي المستقل (.HTML)»</strong> من الزر الأخضر بالأسفل وأرسليه مباشرة على واتساب أو تليجرام؛ يفتح المسابقة والاختبار والشهادة على أي موبايل أو كمبيوتر فوراً بدون إنترنت وبدون استوديو!
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleDownloadStandalonePlayableQuizHTML}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>🎁 تحميل ملف المسابقة التفاعلي المستقل للطلاب (يعمل فوراً بدون استوديو!)</span>
                </button>
              </div>
            </div>

            {/* 1. Direct Online Web App Link for Students & Schools */}
            <div className="p-4 rounded-2xl bg-[#141A29] border border-emerald-400/50 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4" />
                  <span>١. رابط الويب للمسابقة (أو الصقي رابط Cloud Run المستقل هنا لتوليد الدعوة):</span>
                </span>
                <a
                  href={OFFICIAL_PUBLIC_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold flex items-center gap-1 hover:bg-amber-300"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>فتح المسابقة في نافذة مستقلة بدون استوديو ↗</span>
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  dir="ltr"
                  value={customPublishedUrl || OFFICIAL_PUBLIC_URL}
                  onChange={(e) => {
                    setCustomPublishedUrl(e.target.value);
                    try {
                      localStorage.setItem('om_geniuses_custom_url_v1', e.target.value);
                    } catch {}
                  }}
                  placeholder="https://..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(OFFICIAL_PUBLIC_URL);
                    soundEngine.playFanfare();
                    setToast('✅ تم نسخ رابط الويب الرسمي للمسابقة! جاهز للنشر الآن.');
                    setTimeout(() => setToast(null), 3500);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#d4af37] text-[#0f0f12] font-extrabold text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-amber-300"
                >
                  <Copy className="w-4 h-4" />
                  <span>نسخ رابط الويب</span>
                </button>
              </div>

              {/* Ready-to-Publish Promotional Post for WhatsApp / Facebook / Telegram */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">
                    📣 رسالة دعوة رسمية جاهزة للنشر مع الرابط (واتساب / فيسبوك / جروبات المدارس):
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const inviteText = `🧠 مسابقة «دماغ عالية» — مسابقة المعرفة والذكاء والتفكير 🇪🇬\n👦 بلية ودماغه عالية!\n\n✨ المسابقة مفتوحة أونلاين لطلاب المدارس في جميع المحافظات!\n📝 سجّل اسمك ومدرستك ومحافظتك واحصل على كود المشاركة وابدأ التصفية الإلكترونية عبر الرابط الرسمي:\n${OFFICIAL_PUBLIC_URL}`;
                      navigator.clipboard?.writeText(inviteText);
                      soundEngine.playFanfare();
                      setToast('✅ تم نسخ رسالة الدعوة الرسمية مع رابط الويب جاهزة للنشر!');
                      setTimeout(() => setToast(null), 3500);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold cursor-pointer hover:bg-emerald-400"
                  >
                    📋 نسخ الدعوة + الرابط للنشر
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/90 p-2.5 rounded-lg border border-slate-800">
                  {`🧠 مسابقة «دماغ عالية» — مسابقة المعرفة والذكاء والتفكير (👦 بلية ودماغه عالية!) 🇪🇬\n✨ مفتوحة لجميع طلاب المدارس في الـ ٢٧ محافظة!\n🔗 ادخل وسجّل وابدأ المسابقة مباشرة من المتصفح:\n${OFFICIAL_PUBLIC_URL}`}
                </p>
              </div>
            </div>

            {/* 2. Download Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Install as Web App / Shortcut */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-amber-400/40 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-[#d4af37] flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" />
                    <span>٢. تحميل أيقونة المسابقة على الجهاز</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    ثبّت المسابقة كأيقونة مباشرة على سطح المكتب أو شاشة الهاتف للوصول السريع بضغطة واحدة.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {deferredInstallPrompt && (
                    <button
                      type="button"
                      onClick={async () => {
                        deferredInstallPrompt.prompt();
                        await deferredInstallPrompt.userChoice;
                        setDeferredInstallPrompt(null);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-400 text-slate-950 font-extrabold text-xs cursor-pointer"
                    >
                      📲 تثبيت التطبيق الآن
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadDesktopShortcut}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-400/20 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-extrabold text-xs cursor-pointer transition-colors"
                  >
                    💻 تحميل ملف الدخول السريع (.HTML)
                  </button>
                </div>
              </div>

              {/* Download Results CSV */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-sky-400/40 space-y-2.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-sky-400 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>٣. تحميل كشوف النتائج والترتيب (Excel / CSV)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    تحميل جدول كامل بأسماء الطلاب والمدارس والمحافظات والنقاط والمتأهلين بصيغة CSV تدعم اللغة العربية.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadStudentsCSV}
                  className="w-full py-2 px-3 rounded-xl bg-sky-400/20 border border-sky-400 text-sky-300 hover:bg-sky-400 hover:text-slate-950 font-extrabold text-xs cursor-pointer transition-colors"
                >
                  📊 تحميل ملف النتائج (CSV)
                </button>
              </div>

              {/* Download Full Database Backup JSON */}
              <div className="p-4 rounded-2xl bg-[#141418] border border-purple-400/40 space-y-2.5 flex flex-col justify-between sm:col-span-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                      <Database className="w-4 h-4" />
                      <span>٤. تحميل النسخة الاحتياطية الشاملة لبيانات المسابقة وبنك الأسئلة (JSON)</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      يشمل جميع إعدادات الموسم، مراحل السنة الـ٦، بيانات الطلاب، المدارس، الفرق، والأوسمة لحفظها على جهازك.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadFullBackupJSON}
                    className="shrink-0 py-2.5 px-4 rounded-xl bg-purple-400/20 border border-purple-400 text-purple-200 hover:bg-purple-400 hover:text-slate-950 font-extrabold text-xs cursor-pointer transition-colors"
                  >
                    📥 تحميل النسخة الكاملة (JSON)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
