import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
  FileText,
  Sparkles,
  Play,
  Lock,
} from 'lucide-react';
import {
  RealPortfolioProject,
  AppView,
  SeasonOneConfig,
  SeasonDocumentStatus,
  EducationalStage,
  GradeNumber,
  QualifierQuestion,
  QualifierDomain,
} from '../types/competition';
import {
  SEASON_ONE_OFFICIAL_PHASES,
  SEASON_ONE_QUALIFIER_BLUEPRINT,
} from '../data/challengesData';
import {
  ALL_STAGE_QUALIFIER_QUESTIONS,
  DOMAIN_META,
} from '../data/qualifierQuestions';
import { evaluateSeasonOneQuestionBankReadiness } from '../services/qualificationEngine';
import { soundEngine } from '../utils/sound';

interface RealProjectsAndCMSProps {
  mode: 'real_projects' | 'content_management';
  projects: RealPortfolioProject[];
  onSaveProject: (project: RealPortfolioProject) => void;
  onDeleteProject: (projectId: string) => void;
  seasonOneConfig?: SeasonOneConfig;
  onSaveSeasonOneConfig?: (config: SeasonOneConfig) => Promise<boolean> | void;
  customQuestions?: QualifierQuestion[];
  onNavigate: (view: AppView) => void;
}

const CATEGORY_LABELS: Record<RealPortfolioProject['category'], { label: string; icon: string }> = {
  competition: { label: 'مسابقة تعليمية', icon: '🏆' },
  project: { label: 'مشروع', icon: '🌟' },
  game: { label: 'لعبة تفاعلية', icon: '🎮' },
  app: { label: 'تطبيق', icon: '📱' },
  invention: { label: 'اختراع / ابتكار', icon: '💡' },
};

const STATUS_LABELS: Record<
  RealPortfolioProject['status'],
  { label: string; badgeClass: string }
> = {
  published: {
    label: '🟢 منشور (بيانات حقيقية مكتملة)',
    badgeClass: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300',
  },
  draft: {
    label: '🟡 مسودة (غير مكتمل - بانتظار البيانات الحقيقية)',
    badgeClass: 'bg-amber-500/20 border-amber-400/60 text-amber-300',
  },
  coming_soon: {
    label: '⏳ قريبًا (سيتم إضافة المحتوى قريبًا)',
    badgeClass: 'bg-sky-500/20 border-sky-400/60 text-sky-300',
  },
};

export const RealProjectsAndCMS: React.FC<RealProjectsAndCMSProps> = ({
  mode,
  projects,
  onSaveProject,
  onDeleteProject,
  seasonOneConfig,
  onSaveSeasonOneConfig,
  customQuestions = [],
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | RealPortfolioProject['category']
  >('ALL');

  // CMS Sub-Tab inside content_management: 'season_1' | 'projects'
  const [cmsActiveTab, setCmsActiveTab] = useState<'season_1' | 'projects'>('season_1');

  const readinessReport = React.useMemo(
    () => evaluateSeasonOneQuestionBankReadiness(customQuestions),
    [customQuestions]
  );

  // Season 1 Configuration State (Synced with Single Source of Truth: Firestore platform/season_1)
  const [seasonForm, setSeasonForm] = useState<SeasonOneConfig>(() => ({
    id: 'season_1',
    seasonId: seasonOneConfig?.seasonId || 'season_1',
    name:
      !seasonOneConfig?.name ||
      seasonOneConfig.name === 'الموسم الأول — عباقرة عيون مصر'
        ? 'الموسم الأول — دماغ عالية'
        : seasonOneConfig.name,
    status: seasonOneConfig?.status || 'draft',
    registrationStart: seasonOneConfig?.registrationStart || '',
    registrationEnd: seasonOneConfig?.registrationEnd || '',
    competitionStart: seasonOneConfig?.competitionStart || '',
    competitionEnd: seasonOneConfig?.competitionEnd || '',
    eligibleGrades:
      seasonOneConfig?.eligibleGrades && seasonOneConfig.eligibleGrades.length > 0
        ? seasonOneConfig.eligibleGrades
        : ['4', '5', '6'],
    stages:
      seasonOneConfig?.stages && seasonOneConfig.stages.length > 0
        ? seasonOneConfig.stages
        : ['primary_upper'],
    officialPhases:
      seasonOneConfig?.officialPhases && seasonOneConfig.officialPhases.length > 0
        ? seasonOneConfig.officialPhases
        : SEASON_ONE_OFFICIAL_PHASES,
    qualifierBlueprint: seasonOneConfig?.qualifierBlueprint || {
      ...SEASON_ONE_QUALIFIER_BLUEPRINT,
    },
    examSettings: {
      questionsCount: seasonOneConfig?.examSettings?.questionsCount ?? 30,
      durationMinutes: seasonOneConfig?.examSettings?.durationMinutes ?? 30,
      allowedAttempts: seasonOneConfig?.examSettings?.allowedAttempts ?? 1,
      randomizeQuestions: seasonOneConfig?.examSettings?.randomizeQuestions ?? true,
      randomizeOptions: seasonOneConfig?.examSettings?.randomizeOptions ?? true,
      allowBackNavigation: seasonOneConfig?.examSettings?.allowBackNavigation ?? true,
    },
    scoringSettings: {
      scoringMethod: seasonOneConfig?.scoringSettings?.scoringMethod || 'standard_points',
      enableTieBreaker: seasonOneConfig?.scoringSettings?.enableTieBreaker ?? true,
      enableRiskPenalty: seasonOneConfig?.scoringSettings?.enableRiskPenalty ?? false,
    },
    awards: seasonOneConfig?.awards || [],
    publicVisibility: seasonOneConfig?.publicVisibility ?? false,
    createdAt: seasonOneConfig?.createdAt || '',
    updatedAt: seasonOneConfig?.updatedAt || '',
  }));

  React.useEffect(() => {
    if (seasonOneConfig) {
      setSeasonForm({
        id: 'season_1',
        seasonId: seasonOneConfig.seasonId || 'season_1',
        name:
          !seasonOneConfig.name ||
          seasonOneConfig.name === 'الموسم الأول — عباقرة عيون مصر'
            ? 'الموسم الأول — دماغ عالية'
            : seasonOneConfig.name,
        status: seasonOneConfig.status || 'draft',
        registrationStart: seasonOneConfig.registrationStart || '',
        registrationEnd: seasonOneConfig.registrationEnd || '',
        competitionStart: seasonOneConfig.competitionStart || '',
        competitionEnd: seasonOneConfig.competitionEnd || '',
        eligibleGrades:
          Array.isArray(seasonOneConfig.eligibleGrades) && seasonOneConfig.eligibleGrades.length > 0
            ? seasonOneConfig.eligibleGrades
            : ['4', '5', '6'],
        stages:
          Array.isArray(seasonOneConfig.stages) && seasonOneConfig.stages.length > 0
            ? seasonOneConfig.stages
            : ['primary_upper'],
        officialPhases:
          Array.isArray(seasonOneConfig.officialPhases) && seasonOneConfig.officialPhases.length > 0
            ? seasonOneConfig.officialPhases
            : SEASON_ONE_OFFICIAL_PHASES,
        qualifierBlueprint: seasonOneConfig.qualifierBlueprint || {
          ...SEASON_ONE_QUALIFIER_BLUEPRINT,
        },
        examSettings: {
          questionsCount: seasonOneConfig.examSettings?.questionsCount ?? 30,
          durationMinutes: seasonOneConfig.examSettings?.durationMinutes ?? 30,
          allowedAttempts: seasonOneConfig.examSettings?.allowedAttempts ?? 1,
          randomizeQuestions: seasonOneConfig.examSettings?.randomizeQuestions ?? true,
          randomizeOptions: seasonOneConfig.examSettings?.randomizeOptions ?? true,
          allowBackNavigation: seasonOneConfig.examSettings?.allowBackNavigation ?? true,
        },
        scoringSettings: {
          scoringMethod: seasonOneConfig.scoringSettings?.scoringMethod || 'standard_points',
          enableTieBreaker: seasonOneConfig.scoringSettings?.enableTieBreaker ?? true,
          enableRiskPenalty: seasonOneConfig.scoringSettings?.enableRiskPenalty ?? false,
        },
        awards: Array.isArray(seasonOneConfig.awards) ? seasonOneConfig.awards : [],
        publicVisibility: Boolean(seasonOneConfig.publicVisibility),
        createdAt: seasonOneConfig.createdAt || '',
        updatedAt: seasonOneConfig.updatedAt || '',
      });
    }
  }, [seasonOneConfig]);

  const [newAwardTitle, setNewAwardTitle] = useState('');
  const [newAwardDesc, setNewAwardDesc] = useState('');
  const [newAwardCategory, setNewAwardCategory] = useState<'student' | 'team' | 'both'>('student');
  const [seasonSaveMsg, setSeasonSaveMsg] = useState<string | null>(null);
  const [savingSeason, setSavingSeason] = useState<boolean>(false);

  const handleSaveSeasonOne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveSeasonOneConfig) return;
    setSavingSeason(true);
    setSeasonSaveMsg(null);
    const nowIso = new Date().toISOString();
    const payloadToSave: SeasonOneConfig = {
      ...seasonForm,
      id: 'season_1',
      seasonId: 'season_1',
      name: seasonForm.name.trim() || 'الموسم الأول — دماغ عالية',
      createdAt: seasonForm.createdAt || nowIso,
      updatedAt: nowIso,
    };
    const res = await onSaveSeasonOneConfig(payloadToSave);
    setSavingSeason(false);
    if (res !== false) {
      soundEngine.playFanfare();
      setSeasonSaveMsg(
        `✅ تم حفظ وتوثيق إعدادات «${payloadToSave.name}» بنجاح في المصدر الأساسي الموحد (platform/season_1) ومزامنة النسخة العامة (public_platform/season_1)!`
      );
      setTimeout(() => setSeasonSaveMsg(null), 4500);
    }
  };

  // CMS Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RealPortfolioProject['category']>('project');
  const [status, setStatus] = useState<RealPortfolioProject['status']>('draft');
  const [image, setImage] = useState('');
  const [realUrl, setRealUrl] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [content, setContent] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);

  const handleStartEdit = (proj: RealPortfolioProject) => {
    soundEngine.playSelectTile();
    setEditingId(proj.id);
    setName(proj.name);
    setDescription(proj.description || '');
    setCategory(proj.category);
    setStatus(proj.status);
    setImage(proj.image || '');
    setRealUrl(proj.realUrl || '');
    setFeaturesText((proj.features || []).join('\n'));
    setContent(proj.content || '');
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setCategory('project');
    setStatus('draft');
    setImage('');
    setRealUrl('');
    setFeaturesText('');
    setContent('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Rule: Do not consider a project 'published' unless its real description/data is entered
    const hasRealDescription =
      description.trim().length > 0 &&
      !description.includes('سيتم إضافة المحتوى قريبًا');

    const finalStatus: RealPortfolioProject['status'] =
      status === 'published' && !hasRealDescription ? 'draft' : status;

    const featuresList = featuresText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const newProj: RealPortfolioProject = {
      id: editingId || `proj-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category,
      status: finalStatus,
      image: image.trim(),
      realUrl: realUrl.trim(),
      features: featuresList,
      content: content.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      isInternalPlatform: editingId === 'proj-oyoun-misr',
    };

    soundEngine.playFanfare();
    onSaveProject(newProj);

    if (status === 'published' && !hasRealDescription) {
      setFormMsg(
        '⚠️ تم حفظ المشروع كـ «مسودة / قريبًا» لأنه لا يُعتبر أي مشروع منشوراً إلا بعد إدخال بياناته ووصفه الحقيقي.'
      );
    } else {
      setFormMsg(`✅ تم حفظ بيانات المشروع الحقيقي «${newProj.name}» بنجاح!`);
    }
    setTimeout(() => setFormMsg(null), 4500);
    handleResetForm();
  };

  const filteredProjects =
    selectedCategory === 'ALL'
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  if (mode === 'real_projects') {
    return (
      <section className="max-w-6xl mx-auto space-y-8">
        {/* Authentic Data Guarantee Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-[#d4af37]/70 space-y-4 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4" />
                <span>بيانات ومشروعات حقيقية ١٠٠٪ — بدون أي محتوى مختلق أو روابط وهمية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                🌟 المشروعات والأعمال الحقيقية المعتمدة
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                تعرض هذه البوابة المشروعات الحقيقية فقط (<strong>نسمة حياة</strong>، <strong>دماغ عالية</strong>، وأي ألعاب أو تطبيقات أو اختراعات حقيقية تتم إضافتها من قسم إدارة المحتوى). الحقول أو الروابط غير المتوفرة بعد تُترك فارغة بأمان أو يُكتب عليها «قريبًا» دون أي تخمين.
              </p>
            </div>

            <button
              onClick={() => {
                soundEngine.playSelectTile();
                onNavigate('content_management');
              }}
              className="px-5 py-3 rounded-xl bg-[#d4af37] text-[#0f0f12] font-extrabold text-xs hover:bg-amber-300 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              <FolderKanban className="w-4 h-4" />
              <span>⚙️ إدارة المحتوى وإضافة مشروع حقيقي</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#d4af37] text-[#0f0f12]'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              جميع المشروعات الحقيقية ({projects.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as RealPortfolioProject['category'][]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#d4af37] text-[#0f0f12]'
                    : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {CATEGORY_LABELS[cat].icon} {CATEGORY_LABELS[cat].label}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Real Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project) => {
            const catMeta = CATEGORY_LABELS[project.category] || CATEGORY_LABELS.project;
            const statusMeta = STATUS_LABELS[project.status] || STATUS_LABELS.coming_soon;
            const hasRealImage = Boolean(project.image && project.image.trim().length > 0);
            const hasRealUrl = Boolean(project.realUrl && project.realUrl.trim().length > 0);
            const hasRealDescription = Boolean(
              project.description &&
                project.description.trim().length > 0 &&
                !project.description.includes('سيتم إضافة المحتوى قريبًا')
            );

            return (
              <div
                key={project.id}
                className="p-6 rounded-3xl bg-[#131F38] border-2 border-slate-800 hover:border-[#d4af37]/60 transition-all flex flex-col justify-between gap-5 shadow-xl"
              >
                <div className="space-y-4">
                  {/* Top Meta Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-700 text-xs font-bold text-[#d4af37]">
                      {catMeta.icon} {catMeta.label}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full border text-[11px] font-bold ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </div>

                  {/* Image or Clearly Labeled Design Icon Placeholder (Never fake stock photos) */}
                  {hasRealImage ? (
                    <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 max-h-56">
                      <img
                        src={project.image}
                        alt={`صورة المشروع الحقيقية: ${project.name}`}
                        className="w-full h-52 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-slate-950/80 border border-dashed border-slate-700 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#18294D] border border-[#d4af37]/40 flex items-center justify-center text-2xl shrink-0">
                          {catMeta.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-300">
                            أيقونة تصميم تعبيرية (ليست صورة فوتوغرافية للمشروع)
                          </div>
                          <div className="text-[11px] text-slate-400">
                            سيتم عرض الصورة الحقيقية للمشروع فور رفعها من «إدارة المحتوى»
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Title & ID */}
                  <div>
                    <div className="text-[11px] font-mono-num text-slate-400">
                      ID: {project.id} · تاريخ الإدراج: {project.createdAt || '—'}
                    </div>
                    <h3 className="text-2xl font-extrabold text-white font-display mt-0.5">
                      {project.name}
                    </h3>
                  </div>

                  {/* Real Description or Clean "Coming Soon" */}
                  {hasRealDescription ? (
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      {project.description}
                    </p>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-400/30 text-xs text-amber-300 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>سيتم إضافة المحتوى قريبًا</span>
                      </div>
                      <p className="text-slate-400">
                        هذا الحقل غير مكتمل حالياً لمنع عرض أي معلومات مختلقة. يمكنكِ تزويدنا بالوصف أو إضافته من قسم «إدارة المحتوى».
                      </p>
                    </div>
                  )}

                  {/* Real Features List */}
                  {project.features && project.features.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-[#d4af37]">خصائص ومكونات المشروع الحقيقية:</div>
                      <ul className="space-y-1 text-xs text-slate-300">
                        {project.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-emerald-400">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">
                      • التفاصيل والمميزات الإضافية: قريبًا
                    </div>
                  )}

                  {/* Real Content if available */}
                  {project.content && project.content.trim().length > 0 && (
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                      {project.content}
                    </div>
                  )}
                </div>

                {/* Action Footer: Real Link vs "الرابط سيتم إضافته لاحقًا" */}
                <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  {project.isInternalPlatform ? (
                    <button
                      onClick={() => {
                        soundEngine.playSelectTile();
                        onNavigate('qualifiers');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-400 text-slate-950 font-extrabold text-xs hover:bg-emerald-300 cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>فتح المسابقة والتسجيل الفعلي الآن</span>
                    </button>
                  ) : hasRealUrl ? (
                    <a
                      href={project.realUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-[#d4af37] text-[#0f0f12] font-extrabold text-xs hover:bg-amber-300 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>فتح الرابط الرسمي للمشروع ↗</span>
                    </a>
                  ) : (
                    <span className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 text-xs font-bold flex items-center gap-1.5 select-none">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>الرابط سيتم إضافته لاحقًا</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      handleStartEdit(project);
                      onNavigate('content_management');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 hover:border-amber-400 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تحديث البيانات الحقيقية</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // ==================== MODE 2: CONTENT MANAGEMENT (إدارة المحتوى) ====================
  const STAGE_OPTIONS: { id: EducationalStage; label: string; grades: GradeNumber[] }[] = [
    { id: 'primary_lower', label: '🟢 ابتدائي صغير (الصفوف ١ - ٣)', grades: ['1', '2', '3'] },
    { id: 'primary_upper', label: '🔵 ابتدائي كبير (الصفوف ٤ - ٦)', grades: ['4', '5', '6'] },
    { id: 'preparatory', label: '🟣 المرحلة الإعدادية (الصفوف ٧ - ٩)', grades: ['7', '8', '9'] },
    { id: 'secondary', label: '🟠 المرحلة الثانوية (الصفوف ١٠ - ١٢)', grades: ['10', '11', '12'] },
  ];

  const ALL_GRADES: { id: GradeNumber; label: string }[] = [
    { id: '1', label: '١ ابتدائي' },
    { id: '2', label: '٢ ابتدائي' },
    { id: '3', label: '٣ ابتدائي' },
    { id: '4', label: '٤ ابتدائي' },
    { id: '5', label: '٥ ابتدائي' },
    { id: '6', label: '٦ ابتدائي' },
    { id: '7', label: '١ إعدادي' },
    { id: '8', label: '٢ إعدادي' },
    { id: '9', label: '٣ إعدادي' },
    { id: '10', label: '١ ثانوي' },
    { id: '11', label: '٢ ثانوي' },
    { id: '12', label: '٣ ثانوي' },
  ];

  const SEASON_STATUS_META_MAP: Record<
    SeasonDocumentStatus,
    { label: string; badgeClass: string; desc: string }
  > = {
    draft: {
      label: '🟡 مسودة (draft — قيد التجهيز)',
      badgeClass: 'bg-amber-500/20 border-amber-400 text-amber-300',
      desc: 'الموسم في وضع التجهيز قبل الإطلاق العام أو قبل اكتمال الجدول الزمني.',
    },
    registration_open: {
      label: '🟢 التسجيل مفتوح (registration_open)',
      badgeClass: 'bg-emerald-500/20 border-emerald-400 text-emerald-300',
      desc: 'باب التسجيل مفتوح للطلاب والمدارس الحقيقية في الموسم الأول.',
    },
    active: {
      label: '🔵 الموسم نشط (active — المسابقة جارية)',
      badgeClass: 'bg-sky-500/20 border-sky-400 text-sky-300',
      desc: 'المسابقة والتصفيات الرسمية للموسم الأول جارية فعليًا.',
    },
    ended: {
      label: '🔴 انتهى الموسم (ended)',
      badgeClass: 'bg-rose-500/20 border-rose-400 text-rose-300',
      desc: 'أُغلق الموسم الأول وتم اعتماد نتائجه النهائية.',
    },
  };

  return (
    <section className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-l from-[#18294D] via-[#131F38] to-[#0D1527] border-2 border-[#d4af37]/70 space-y-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-extrabold text-[#d4af37]">
              ⚙️ قسم داخلي رسمي — إدارة المحتوى وإعدادات الموسم الأول (Firestore Direct)
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              لوحة إدارة المحتوى وتجهيز «الموسم الأول — دماغ عالية»
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl">
              تعتمد هذه اللوحة على <strong>Firestore</strong> كمصدر وحيد للبيانات (`platform/season_1` و `projects`). بدون أي بيانات Demo أو Mock أو أرقام افتراضية.
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playSelectTile();
              onNavigate('real_projects');
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0f0f12] font-extrabold text-xs cursor-pointer transition-all"
          >
            🌟 معاينة صفحة المشروعات الحقيقية ←
          </button>
        </div>

        {/* Sub-Tabs inside Content Management */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSelectTile();
              setCmsActiveTab('season_1');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-2 ${
              cmsActiveTab === 'season_1'
                ? 'bg-[#d4af37] text-[#0f0f12] shadow-lg'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <span>🏆 ١. إعدادات وثيقة الموسم الأول (`platform/season_1`)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSelectTile();
              setCmsActiveTab('projects');
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-2 ${
              cmsActiveTab === 'projects'
                ? 'bg-[#d4af37] text-[#0f0f12] shadow-lg'
                : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <span>🌟 ٢. إدارة وتوثيق المشروعات الحقيقية (`projects`)</span>
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: SEASON 1 CONFIGURATION (platform/season_1) ==================== */}
      {cmsActiveTab === 'season_1' && (
        <div className="space-y-6">
          {seasonSaveMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{seasonSaveMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Season 1 Form (8 cols) */}
            <form
              onSubmit={handleSaveSeasonOne}
              className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-[#131F38] border-2 border-amber-400/50 space-y-6 text-xs shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    PRIMARY SOURCE: platform/season_1 · PUBLIC MIRROR: public_platform/season_1
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white font-display mt-0.5">
                    🏆 إعدادات وثيقة الموسم الأول — {seasonForm.name}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full border text-xs font-extrabold ${
                    SEASON_STATUS_META_MAP[seasonForm.status].badgeClass
                  }`}
                >
                  {SEASON_STATUS_META_MAP[seasonForm.status].label}
                </span>
              </div>

              {/* القسم ١: المعلومات الأساسية */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-extrabold text-amber-300 text-sm">
                    ١. المعلومات الأساسية للموسم
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    seasonId: {seasonForm.seasonId}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">
                      اسم الموسم (`name`) *
                    </label>
                    <input
                      required
                      type="text"
                      value={seasonForm.name}
                      onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })}
                      placeholder="الموسم الأول — دماغ عالية"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Season ID (`seasonId`)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={seasonForm.seasonId}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-amber-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      الحالة (`status`) *
                    </label>
                    <select
                      value={seasonForm.status}
                      onChange={(e) =>
                        setSeasonForm({
                          ...seasonForm,
                          status: e.target.value as SeasonDocumentStatus,
                        })
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                    >
                      <option value="draft">🟡 draft (مسودة)</option>
                      <option value="registration_open">🟢 registration_open (التسجيل مفتوح)</option>
                      <option value="active">🔵 active (نشط)</option>
                      <option value="ended">🔴 ended (منتهي)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 text-amber-300 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={seasonForm.publicVisibility}
                      onChange={(e) =>
                        setSeasonForm({ ...seasonForm, publicVisibility: e.target.checked })
                      }
                      className="accent-amber-400 w-4 h-4"
                    />
                    <span>🌐 الظهور العام للموسم (`publicVisibility`)</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    {seasonForm.publicVisibility
                      ? '🟢 الموسم ظاهر للجمهور في الواجهة العامة'
                      : '🟡 الموسم في وضع المسودة/التجهيز الداخلي'}
                  </span>
                </div>
              </div>

              {/* القسم ٢ و ٣: التسجيل والمسابقة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-extrabold text-emerald-300 text-sm">
                      ٢. فترة التسجيل
                    </span>
                    <span className="text-[10px] text-slate-400">
                      تبقى فارغة إذا لم تُحدد بعد
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">
                        بداية التسجيل (`registrationStart`)
                      </label>
                      <input
                        type="date"
                        value={seasonForm.registrationStart}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, registrationStart: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">
                        نهاية التسجيل (`registrationEnd`)
                      </label>
                      <input
                        type="date"
                        value={seasonForm.registrationEnd}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, registrationEnd: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-extrabold text-sky-300 text-sm">
                      ٣. فترة المسابقة
                    </span>
                    <span className="text-[10px] text-slate-400">
                      تبقى فارغة إذا لم تُحدد بعد
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">
                        بداية المسابقة (`competitionStart`)
                      </label>
                      <input
                        type="date"
                        value={seasonForm.competitionStart}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, competitionStart: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1">
                        نهاية المسابقة (`competitionEnd`)
                      </label>
                      <input
                        type="date"
                        value={seasonForm.competitionEnd}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, competitionEnd: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Stages & Eligible Grades */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div>
                  <div className="font-bold text-amber-300 mb-2">
                    🎓 المراحل التعليمية المعتمدة في الموسم الأول (`stages`):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {STAGE_OPTIONS.map((st) => {
                      const isChecked = seasonForm.stages.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-amber-400/15 border-amber-400 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>{st.label}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextStages = e.target.checked
                                ? [...seasonForm.stages, st.id]
                                : seasonForm.stages.filter((x) => x !== st.id);
                              const nextGrades = e.target.checked
                                ? Array.from(new Set([...seasonForm.eligibleGrades, ...st.grades]))
                                : seasonForm.eligibleGrades.filter((g) => !st.grades.includes(g));
                              setSeasonForm({
                                ...seasonForm,
                                stages: nextStages,
                                eligibleGrades: nextGrades,
                              });
                            }}
                            className="accent-amber-400 w-4 h-4"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <div className="font-bold text-sky-300 mb-2">
                    📚 الصفوف الدراسية المؤهلة (`eligibleGrades`):
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {ALL_GRADES.map((gr) => {
                      const isChecked = seasonForm.eligibleGrades.includes(gr.id);
                      return (
                        <label
                          key={gr.id}
                          className={`px-2.5 py-2 rounded-lg border text-center cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const nextGrades = e.target.checked
                                ? [...seasonForm.eligibleGrades, gr.id]
                                : seasonForm.eligibleGrades.filter((x) => x !== gr.id);
                              setSeasonForm({ ...seasonForm, eligibleGrades: nextGrades });
                            }}
                            className="hidden"
                          />
                          <span>{gr.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Exam Settings & Scoring Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="font-bold text-amber-300">
                    📝 إعدادات الاختبار (`examSettings`):
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">عدد الأسئلة</label>
                      <input
                        type="number"
                        min={1}
                        value={seasonForm.examSettings.questionsCount ?? ''}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              questionsCount: e.target.value ? Number(e.target.value) : null,
                            },
                          })
                        }
                        placeholder="غير محدد"
                        className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">المدة (دقيقة)</label>
                      <input
                        type="number"
                        min={1}
                        value={seasonForm.examSettings.durationMinutes ?? ''}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              durationMinutes: e.target.value ? Number(e.target.value) : null,
                            },
                          })
                        }
                        placeholder="غير محدد"
                        className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">المحاولات</label>
                      <input
                        type="number"
                        min={1}
                        value={seasonForm.examSettings.allowedAttempts ?? ''}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              allowedAttempts: e.target.value ? Number(e.target.value) : null,
                            },
                          })
                        }
                        placeholder="غير محدد"
                        className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono-num"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span>ترتيب عشوائي للأسئلة</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.examSettings.randomizeQuestions}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              randomizeQuestions: e.target.checked,
                            },
                          })
                        }
                        className="accent-amber-400"
                      />
                    </label>
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span>ترتيب عشوائي للاختيارات</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.examSettings.randomizeOptions}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              randomizeOptions: e.target.checked,
                            },
                          })
                        }
                        className="accent-amber-400"
                      />
                    </label>
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span>السماح بالرجوع للسؤال السابق</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.examSettings.allowBackNavigation}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            examSettings: {
                              ...seasonForm.examSettings,
                              allowBackNavigation: e.target.checked,
                            },
                          })
                        }
                        className="accent-amber-400"
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="font-bold text-emerald-300">
                    ⚖️ إعدادات الاحتساب والنقاط (`scoringSettings`):
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">طريقة الاحتساب</label>
                    <select
                      value={seasonForm.scoringSettings.scoringMethod}
                      onChange={(e) =>
                        setSeasonForm({
                          ...seasonForm,
                          scoringSettings: {
                            ...seasonForm.scoringSettings,
                            scoringMethod: e.target.value as SeasonOneConfig['scoringSettings']['scoringMethod'],
                          },
                        })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                    >
                      <option value="">— لم يُحدد بعد —</option>
                      <option value="speed_weighted">النقاط الأساسية + مكافأة السرعة (speed_weighted)</option>
                      <option value="standard_points">النقاط القياسية الثابتة (standard_points)</option>
                      <option value="difficulty_weighted">موزونة حسب صعوبة السؤال (difficulty_weighted)</option>
                    </select>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span>حسم التعادل بالزمن الأسرع تلقائيًا</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.scoringSettings.enableTieBreaker}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            scoringSettings: {
                              ...seasonForm.scoringSettings,
                              enableTieBreaker: e.target.checked,
                            },
                          })
                        }
                        className="accent-emerald-400"
                      />
                    </label>
                    <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                      <span>تفعيل خصم المخاطرة</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.scoringSettings.enableRiskPenalty}
                        onChange={(e) =>
                          setSeasonForm({
                            ...seasonForm,
                            scoringSettings: {
                              ...seasonForm.scoringSettings,
                              enableRiskPenalty: e.target.checked,
                            },
                          })
                        }
                        className="accent-emerald-400"
                      />
                    </label>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <label className="flex items-center justify-between text-amber-300 font-bold cursor-pointer">
                      <span>🌐 إظهار الموسم الأول للجمهور (`publicVisibility`)</span>
                      <input
                        type="checkbox"
                        checked={seasonForm.publicVisibility}
                        onChange={(e) =>
                          setSeasonForm({ ...seasonForm, publicVisibility: e.target.checked })
                        }
                        className="accent-amber-400 w-4 h-4"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 4.B Official 3 Competition Phases & 30-Question Blueprint */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-amber-300">
                    🏛️ الهيكل الرسمي لمراحل الموسم الأول (3 مراحل رسمية):
                  </span>
                  <span className="text-[11px] text-emerald-300 font-bold">
                    الفئة المعتمدة: الصفوف الرابع + الخامس + السادس الابتدائي
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(seasonForm.officialPhases || SEASON_ONE_OFFICIAL_PHASES || []).map((ph) => {
                    const isStageOne = ph.phaseId === 'stage_1_qualifiers';
                    const stageReady = isStageOne && readinessReport.isReady;
                    return (
                      <div
                        key={ph.phaseId}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-white">{ph.title}</span>
                          {ph.questionsCount != null && ph.durationMinutes != null ? (
                            <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                              {ph.questionsCount} سؤال · {ph.durationMinutes} د
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                              🔒 مغلقة حاليًا
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{ph.description}</p>
                        <div className="text-[10px] text-emerald-300 font-semibold pt-1">
                          {isStageOne
                            ? stageReady
                              ? '🟢 READY: بنك الأسئلة مكتمل وجاهز للتشغيل'
                              : `🔒 NOT READY: مقفلة لحين استكمال الـ Blueprint (${readinessReport.fulfilledCount}/${readinessReport.totalRequired})`
                            : '🔒 مغلقة حتى اكتمال المرحلة السابقة واعتماد المتأهلين'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-sky-300">
                      📊 جاهزية وتوزيع أسئلة المرحلة الأولى: التأهيل (30 سؤالاً من 7 مجالات):
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                        readinessReport.isReady
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-400 text-rose-300'
                      }`}
                    >
                      {readinessReport.isReady
                        ? `🟢 READY (${readinessReport.fulfilledCount}/${readinessReport.totalRequired})`
                        : `🔒 NOT READY — المكتمل في التوزيع: ${readinessReport.fulfilledCount}/${readinessReport.totalRequired} (ينقص ${readinessReport.missingTotal})`}
                    </span>
                  </div>

                  {!readinessReport.isReady && readinessReport.missingDomains.length > 0 && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-400/50 text-rose-200 text-[11px]">
                      ⚠️ <strong>النقص الحالي للمشرفة:</strong>{' '}
                      {readinessReport.missingDomains
                        .map(
                          (d) =>
                            `${DOMAIN_META[d.domain].label}: متاح ${d.available}/${d.required} (نقص ${d.shortage})`
                        )
                        .join(' · ')}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center">
                    {(
                      [
                        'arabic',
                        'math',
                        'science',
                        'egypt_world',
                        'english',
                        'general_culture',
                        'logic',
                      ] as QualifierDomain[]
                    ).map((domKey) => {
                      const st = readinessReport.domainStatus.find((d) => d.domain === domKey);
                      const req = st?.required ?? DOMAIN_META[domKey].targetCount;
                      const avail = st?.available ?? 0;
                      const isOk = st?.isComplete ?? false;
                      return (
                        <div
                          key={domKey}
                          className={`p-2.5 rounded-xl bg-slate-900 border ${
                            isOk ? 'border-emerald-500/40' : 'border-rose-500/60'
                          }`}
                        >
                          <div className="text-[11px] text-slate-300 font-bold">
                            {DOMAIN_META[domKey].label}
                          </div>
                          <div className="text-sm font-extrabold font-mono-num text-amber-400 mt-0.5">
                            المطلوب: {req}
                          </div>
                          <div
                            className={`text-[10px] font-mono-num mt-0.5 font-bold ${
                              isOk ? 'text-emerald-300' : 'text-rose-300'
                            }`}
                          >
                            {isOk ? `✓ متاح: ${avail}` : `متاح: ${avail} (نقص ${st?.shortage})`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 5. Real Season Awards List (Without fake awards) */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300">
                    🏅 جوائز وأوسمة الموسم الأول الحقيقية (`awards` — {seasonForm.awards.length}):
                  </span>
                  <span className="text-[11px] text-slate-400">
                    أضيفي الجوائز المعتمدة فعليًا فقط
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    value={newAwardTitle}
                    onChange={(e) => setNewAwardTitle(e.target.value)}
                    placeholder="اسم الجائزة / الوسام الحقيقي..."
                    className="sm:col-span-4 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="text"
                    value={newAwardDesc}
                    onChange={(e) => setNewAwardDesc(e.target.value)}
                    placeholder="وصف الجائزة أو شروط استحقاقها..."
                    className="sm:col-span-5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  />
                  <select
                    value={newAwardCategory}
                    onChange={(e) =>
                      setNewAwardCategory(e.target.value as 'student' | 'team' | 'both')
                    }
                    className="sm:col-span-2 px-2 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="student">طالب</option>
                    <option value="team">فريق</option>
                    <option value="both">طالب/فريق</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newAwardTitle.trim()) return;
                      setSeasonForm({
                        ...seasonForm,
                        awards: [
                          ...seasonForm.awards,
                          {
                            id: `awd-${Date.now()}`,
                            title: newAwardTitle.trim(),
                            description: newAwardDesc.trim(),
                            categoryType: newAwardCategory,
                          },
                        ],
                      });
                      setNewAwardTitle('');
                      setNewAwardDesc('');
                    }}
                    className="sm:col-span-1 px-3 py-2 rounded-lg bg-amber-400 text-slate-950 font-extrabold cursor-pointer flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {seasonForm.awards.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {seasonForm.awards.map((aw) => (
                      <div
                        key={aw.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-white">{aw.title}</span>
                          {aw.description && (
                            <span className="text-slate-400 mr-2">— {aw.description}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setSeasonForm({
                              ...seasonForm,
                              awards: seasonForm.awards.filter((x) => x.id !== aw.id),
                            })
                          }
                          className="text-rose-400 hover:underline text-[11px] cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 italic">
                    لم تتم إضافة جوائز مخصصة بعد (الحقل فارغ بأمان دون جوائز افتراضية مختلقة).
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={savingSeason}
                className="w-full py-3.5 rounded-xl bg-[#d4af37] text-[#0f0f12] font-extrabold text-sm hover:bg-amber-300 cursor-pointer transition-all shadow-lg"
              >
                {savingSeason
                  ? '⏳ جاري الحفظ في المصدر الأساسي (platform/season_1)...'
                  : '💾 حفظ واعتماد وثيقة الموسم الأول في Firestore (platform/season_1)'}
              </button>
            </form>

            {/* Right 4 Cols: Live Firestore Document Summary */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-[#131F38] border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-extrabold text-white font-display">
                  📄 ملخص وثيقة الموسم الأول (`platform/season_1`)
                </h3>
                <span className="text-[11px] font-mono text-emerald-400">SSOT</span>
              </div>

              <div className="space-y-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">معرّف الموسم (`seasonId`):</span>
                  <span className="font-mono text-amber-300 font-bold">{seasonForm.seasonId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الاسم (`name`):</span>
                  <span className="text-white font-bold">{seasonForm.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الحالة (`status`):</span>
                  <span className="text-emerald-300 font-bold">{seasonForm.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الظهور العام (`publicVisibility`):</span>
                  <span className="text-sky-300 font-bold">
                    {seasonForm.publicVisibility ? 'مفعل (مرئي للجمهور)' : 'مخفي (قيد التجهيز)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">فترة التسجيل:</span>
                  <span className="text-slate-200 font-mono">
                    {seasonForm.registrationStart || 'غير محدد'} ←{' '}
                    {seasonForm.registrationEnd || 'غير محدد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">فترة المسابقة:</span>
                  <span className="text-slate-200 font-mono">
                    {seasonForm.competitionStart || 'غير محدد'} ←{' '}
                    {seasonForm.competitionEnd || 'غير محدد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">المراحل (`stages`):</span>
                  <span className="text-amber-300 font-bold">
                    {seasonForm.stages.length > 0
                      ? `${seasonForm.stages.length} مراحل`
                      : 'غير محدد بعد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الصفوف (`eligibleGrades`):</span>
                  <span className="text-sky-300 font-bold">
                    {seasonForm.eligibleGrades.length > 0
                      ? `${seasonForm.eligibleGrades.length} صفوف`
                      : 'غير محدد بعد ([])'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الاختبار (`examSettings`):</span>
                  <span className="text-slate-200 font-mono">
                    {seasonForm.examSettings.questionsCount ?? 'null'} سؤال ·{' '}
                    {seasonForm.examSettings.durationMinutes ?? 'null'} د ·{' '}
                    {seasonForm.examSettings.allowedAttempts ?? 'null'} محاولة
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الدرجات (`scoringMethod`):</span>
                  <span className="text-emerald-300 font-mono">
                    {seasonForm.scoringSettings.scoringMethod || 'غير محدد بعد'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الجوائز (`awards`):</span>
                  <span className="text-amber-300 font-bold">
                    {seasonForm.awards.length > 0
                      ? `${seasonForm.awards.length} جائزة`
                      : 'غير محدد بعد ([])'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">آخر تحديث (`updatedAt`):</span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {seasonForm.updatedAt ? seasonForm.updatedAt.slice(0, 19).replace('T', ' ') : 'لم يُحفظ بعد'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/30 text-[11px] text-slate-300 leading-relaxed space-y-1">
                <div className="font-bold text-amber-300">🔒 مصدر الحقيقة الوحيد (Single Source of Truth):</div>
                <p>
                  • المصدر الأساسي الرسمي للإدارة: `platform/season_1` (قراءة وكتابة حصرياً للمشرفة `isAdmin()`).
                </p>
                <p>
                  • النسخة العامة المنشورة للقراءة فقط: `public_platform/season_1` (تُحدَّث ذرياً باتجاه واحد عند الحفظ).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: REAL PROJECTS CMS ==================== */}
      {cmsActiveTab === 'projects' && (
        <>
          {formMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{formMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Right 7 Cols: Structured Data Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 p-6 rounded-3xl bg-[#131F38] border border-slate-800 space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-extrabold text-white font-display">
              {editingId ? `✏️ تعديل بيانات المشروع (${name})` : '➕ إضافة مشروع / لعبة / اختراع حقيقي جديد'}
            </h3>
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="text-xs text-rose-300 hover:underline cursor-pointer"
              >
                إلغاء التعديل + مشروع جديد
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                اسم المشروع الحقيقي (name) *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: نسمة حياة / دماغ عالية..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                التصنيف (category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RealPortfolioProject['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="project">🌟 مشروع (Project)</option>
                <option value="competition">🏆 مسابقة تعليمية (Competition)</option>
                <option value="game">🎮 لعبة تفاعلية (Game)</option>
                <option value="app">📱 تطبيق (App)</option>
                <option value="invention">💡 اختراع / ابتكار (Invention)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">
                حالة النشر (status) *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as RealPortfolioProject['status'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              >
                <option value="published">🟢 منشور (بيانات حقيقية مكتملة)</option>
                <option value="coming_soon">⏳ قريبًا (سيتم إضافة المحتوى قريبًا)</option>
                <option value="draft">🟡 مسودة غير مكتملة</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                الرابط الحقيقي للمشروع (realUrl) — اتركيه فارغاً إن لم يتوفر
              </label>
              <input
                type="url"
                dir="ltr"
                value={realUrl}
                onChange={(e) => setRealUrl(e.target.value)}
                placeholder="اتركيه فارغاً ليظهر: الرابط سيتم إضافته لاحقًا"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              وصف المشروع الحقيقي (description) — اتركيه فارغاً ليكتب النظام «سيتم إضافة المحتوى قريبًا»
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتبي الوصف الحقيقي للمشروع بناءً على معلوماتك فقط..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              مميزات المشروع الحقيقية (features — ميزة في كل سطر)
            </label>
            <textarea
              rows={3}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              placeholder="اكتبي كل ميزة حقيقية في سطر مستقل (اختياري)..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">
              تفاصيل ومحتوى إضافي (content — اختياري)
            </label>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="أي تفاصيل أو ملفات نصية حقيقية خاصة بالمشروع..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
            />
          </div>

          {/* Real Image Upload or URL */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>صورة المشروع الحقيقية (image) — لا تُستخدم أي صور وهمية أو Stock:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                dir="ltr"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="رابط صورة حقيقية أو ارفعي صورة من جهازك..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
              />
              <label className="px-4 py-2 rounded-xl bg-slate-800 border border-amber-400/50 text-amber-300 hover:bg-slate-700 font-bold cursor-pointer flex items-center justify-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>رفع صورة حقيقية من جهازك</span>
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
                        setImage(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {image && (
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold cursor-pointer"
                >
                  حذف الصورة
                </button>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#d4af37] text-[#0f0f12] font-extrabold text-sm hover:bg-amber-300 cursor-pointer transition-all"
          >
            {editingId ? '💾 حفظ التحديثات الحقيقية للمشروع' : '➕ حفظ وإدراج المشروع في البوابة'}
          </button>
        </form>

        {/* Right/Left 5 Cols: Current Real Projects List */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#131F38] border border-slate-800 space-y-4">
          <h3 className="text-base font-extrabold text-white font-display">
            📋 المشروعات المسجلة في بنية البيانات ({projects.length})
          </h3>
          <div className="space-y-3">
            {projects.map((p) => {
              const stMeta = STATUS_LABELS[p.status] || STATUS_LABELS.coming_soon;
              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${stMeta.badgeClass}`}>
                      {stMeta.label}
                    </span>
                  </div>
                  <div className="text-slate-400 line-clamp-2">
                    {p.description || 'سيتم إضافة المحتوى قريبًا'}
                  </div>
                  <div className="text-[11px] text-amber-300">
                    🔗 الرابط: {p.realUrl ? p.realUrl : 'الرابط سيتم إضافته لاحقًا'}
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(p)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400 text-amber-300 font-bold cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل وإكمال البيانات</span>
                    </button>
                    {!p.isInternalPlatform && (
                      <button
                        type="button"
                        onClick={() => onDeleteProject(p.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-400/50 text-rose-300 font-bold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}
    </section>
  );
};
