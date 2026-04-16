const { useMemo, useState, useEffect, useContext, useRef } = React;
const {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} = Recharts;

const {
  LayoutDashboard,
  Database,
  Brain,
  Workflow,
  Sparkles,
  FileText,
  Server,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  BadgeCheck,
  Target,
  Gauge,
} = LucideReact;

const COLORS = {
  navy: "#8f1221",
  electric: "#d61f33",
  positive: "#16a34a",
  negative: "#dc2626",
  neutral: "#f59e0b",
  improvement: "#9333ea",
  question: "#0f766e",
  card: "#ffffff",
};

const BRAND = {
  logoWordmark: "./Ramylogo.png",
  logoFallback: "./logo.jpg",
};

const I18N = {
  ar: {
    "app.name": "رامي لتحليل المشاعر",
    "app.subtitle": "تحليلات تشغيلية لصوت العميل بالعربية والدارجة والفرنسية",
    "release.badge": "إصدار أبريل 2026",
    "common.dashboard": "لوحة التحكم",
    "common.updated": "آخر تحديث أبريل 2026",
    "common.language": "اللغة",
    "common.analyzing": "جاري التحليل...",
    "common.clear": "مسح",
    "common.response": "الاستجابة",
    "common.runRequest": "تنفيذ الطلب",
    "common.calling": "جاري استدعاء API...",
    "nav.overview": "الرئيسية / نظرة عامة",
    "nav.dataExplorer": "استكشاف البيانات",
    "nav.modelInsights": "رؤى النموذج",
    "nav.methodology": "المنهجية",
    "nav.liveDemo": "التحليل المباشر",
    "nav.socialOps": "ربط السوشيال / التتبع",
    "nav.restApi": "واجهة REST / تجربة",
    "nav.report": "التقرير",
    "sidebar.enterprise": "لوحة تشغيل 2026",
    "sidebar.systemStatus": "حالة النظام",
    "sidebar.modelOnline": "النموذج يعمل مع المعايرة",
    "sidebar.navigation": "التنقل",
    "sidebar.uxNote": "ملاحظة تجربة المستخدم",
    "sidebar.uxBody": "تنقل واضح، تباين قوي، ومسافات متسقة عبر كل الصفحات.",
    "sidebar.productTeam": "فريق المنتج",
    "signal.activeSessions": "جلسات نشطة",
    "signal.avgInference": "متوسط الاستدلال",
    "signal.dataFreshness": "تحديث البيانات",
    "overview.title": "الرئيسية / نظرة عامة",
    "overview.subtitle": "استخبارات عميل لحظية للأسواق العربية",
    "overview.heroTitle": "رامي لتحليل المشاعر",
    "overview.heroText": "المنصة تحول تعليقات العملاء متعددة اللغات إلى قرارات أعمال عملية على مستوى الفئات.",
    "overview.chip.real": "بيانات جزائرية حقيقية",
    "overview.chip.f1": "Macro-F1 = 0.9437",
    "overview.chip.taxonomy": "تصنيف أعمال من 5 فئات",
    "overview.kpi.total": "إجمالي التعليقات المحللة",
    "overview.kpi.delta": "+7.3% مقارنة بدورة الجمع السابقة",
    "overview.kpi.topCategory": "أعلى فئة منتجات",
    "overview.kpi.topCategoryNote": "الإشارة المهيمنة من قنوات الشباب",
    "overview.kpi.accuracy": "دقة النموذج",
    "overview.kpi.accuracySub": "Macro-F1 على مجموعة الاختبار",
    "overview.kpi.gauge": "مؤشر المشاعر المباشر",
    "overview.aboutTitle": "حول هذا المشروع",
    "overview.aboutBody": "Ramy Sentiment Intelligence يجمع بين جمع بيانات حقيقية من الجزائر، وFine-Tuning لـ AraBERT، وSelf-Training، ومعايرة العتبات لتقديم تحليلات مشاعر موثوقة من 5 فئات على نصوص عربية/دارجة/فرنسية.",
    "live.title": "التحليل المباشر",
    "live.subtitle": "تحليل مباشر بالنموذج فقط مع تفسير XAI عند توفره",
    "live.inputLabel": "أدخل نص ملاحظة العميل",
    "live.placeholder": "مثال: رامي بنين ولكن السعر مرتفع قليلا",
    "live.analyze": "حلل المشاعر",
    "live.predicted": "الفئة المتوقعة",
    "live.language": "اللغة المكتشفة",
    "live.confidence": "الثقة حسب الفئة",
    "live.modelOnly": "تفسير XAI مفعل عند توفره من المزود.",
    "live.uploadTitle": "تحليل ملف CSV / Excel",
    "live.uploadHint": "ارفع ملف تعليقات وسيتم تصنيف كل صف ثم عرض النتيجة أو تنزيلها.",
    "live.fileField": "الملف",
    "live.columnField": "عمود النص (اختياري)",
    "live.columnPlaceholder": "مثال: text أو comment",
    "live.analyzeFile": "حلل الملف",
    "live.showInPage": "عرض النتيجة في الصفحة",
    "live.downloadCsv": "تنزيل CSV",
    "live.downloadXlsx": "تنزيل Excel",
    "live.batchResults": "نتيجة التحليل المجمع",
    "live.analyzedRows": "صفوف محللة",
    "live.textColumn": "عمود النص",
    "live.noBatch": "لا توجد نتيجة ملف بعد. قم بالرفع ثم التحليل.",
    "social.title": "ربط قنوات السوشيال وتتبع التعليقات",
    "social.subtitle": "اربط Facebook/Instagram/TikTok، استقبل التعليقات، ثم صنفها لحظيا مع تتبع إداري.",
    "social.connectors": "إعدادات الربط",
    "social.platform": "المنصة",
    "social.pageId": "Page / Account ID",
    "social.accessToken": "Access Token",
    "social.verifyToken": "Webhook Verify Token",
    "social.enabled": "تفعيل الربط",
    "social.save": "حفظ الإعدادات",
    "social.manual": "إدخال تعليقات يدوي للتجربة",
    "social.manualPlaceholder": "كل سطر تعليق مستقل...",
    "social.ingest": "إرسال للتصنيف والتتبع",
    "social.stream": "بث التعليقات المصنفة",
    "social.load": "تحديث البث",
    "social.exportCsv": "تصدير CSV",
    "social.exportXlsx": "تصدير Excel",
    "social.webhook": "رابط Webhook",
    "social.connected": "الربط مفعل",
    "social.distribution": "التوزيع الحالي",
    "social.noRows": "لا توجد تعليقات متتبعة بعد.",
    "rest.title": "REST API / تجربة",
    "rest.subtitle": "واجهة تفاعلية لاختبار نقاط API والتحقق السريع",
    "rest.available": "نقاط API المتاحة",
    "rest.requestBody": "جسم الطلب JSON",
  },
  fr: {
    "app.name": "Ramy Sentiment Intelligence",
    "app.subtitle": "Analytique operationnelle pour la voix client en arabe, darija et francais",
    "release.badge": "Version Avril 2026",
    "common.dashboard": "Tableau de bord",
    "common.updated": "Mise a jour avril 2026",
    "common.language": "Langue",
    "common.analyzing": "Analyse en cours...",
    "common.clear": "Effacer",
    "common.response": "Reponse",
    "common.runRequest": "Executer la requete",
    "common.calling": "Appel API en cours...",
    "nav.overview": "Accueil / Vue globale",
    "nav.dataExplorer": "Explorateur de donnees",
    "nav.modelInsights": "Insights modele",
    "nav.methodology": "Methodologie",
    "nav.liveDemo": "Demo en direct",
    "nav.socialOps": "Social Ops / Tracking",
    "nav.restApi": "REST API / Test",
    "nav.report": "Rapport",
    "sidebar.enterprise": "Dashboard operationnel 2026",
    "sidebar.systemStatus": "Statut systeme",
    "sidebar.modelOnline": "Modele en ligne et calibre",
    "sidebar.navigation": "Navigation",
    "sidebar.uxNote": "Note UX",
    "sidebar.uxBody": "Navigation claire, contraste fort, et espacement coherent sur toutes les pages.",
    "sidebar.productTeam": "Equipe produit",
    "signal.activeSessions": "Sessions actives",
    "signal.avgInference": "Inference moyenne",
    "signal.dataFreshness": "Fraicheur donnees",
    "overview.title": "Accueil / Vue globale",
    "overview.subtitle": "Intelligence client en temps reel pour les marches arabes",
    "overview.heroTitle": "Ramy Sentiment Intelligence",
    "overview.heroText": "La plateforme transforme des retours clients multilingues en decisions business exploitables.",
    "overview.chip.real": "Donnees algeriennes reelles",
    "overview.chip.f1": "Macro-F1 = 0.9437",
    "overview.chip.taxonomy": "Taxonomie business 5 classes",
    "overview.kpi.total": "Total feedback analyses",
    "overview.kpi.delta": "+7.3% vs dernier cycle de collecte",
    "overview.kpi.topCategory": "Categorie produit dominante",
    "overview.kpi.topCategoryNote": "Signal principal depuis les canaux jeunesse",
    "overview.kpi.accuracy": "Precision du modele",
    "overview.kpi.accuracySub": "Macro-F1 sur jeu de test",
    "overview.kpi.gauge": "Jauge sentiment live",
    "overview.aboutTitle": "A propos du projet",
    "overview.aboutBody": "Ramy Sentiment Intelligence combine collecte terrain algerienne, fine-tuning AraBERT, self-training et calibration de seuils pour une analyse 5 classes robuste en arabe/darija/francais.",
    "live.title": "Demo en direct",
    "live.subtitle": "Inference modele en temps reel avec attribution XAI quand disponible",
    "live.inputLabel": "Entrer le texte du feedback client",
    "live.placeholder": "Exemple: ramy tres bon mais prix un peu cher",
    "live.analyze": "Analyser le sentiment",
    "live.predicted": "Classe predite",
    "live.language": "Langue detectee",
    "live.confidence": "Confiance par classe",
    "live.modelOnly": "Attribution XAI active lorsqu'elle est disponible.",
    "live.uploadTitle": "Analyse de fichier CSV / Excel",
    "live.uploadHint": "Chargez un fichier de commentaires pour classer chaque ligne et exporter le resultat.",
    "live.fileField": "Fichier",
    "live.columnField": "Colonne texte (optionnel)",
    "live.columnPlaceholder": "Ex: text ou comment",
    "live.analyzeFile": "Analyser le fichier",
    "live.showInPage": "Afficher dans la page",
    "live.downloadCsv": "Telecharger CSV",
    "live.downloadXlsx": "Telecharger Excel",
    "live.batchResults": "Resultat batch",
    "live.analyzedRows": "Lignes analysees",
    "live.textColumn": "Colonne texte",
    "live.noBatch": "Aucun resultat batch pour le moment.",
    "social.title": "Connexion reseaux sociaux et suivi des commentaires",
    "social.subtitle": "Connectez Facebook/Instagram/TikTok, recevez les commentaires et suivez la classification en temps reel.",
    "social.connectors": "Configuration des connecteurs",
    "social.platform": "Plateforme",
    "social.pageId": "Page / Account ID",
    "social.accessToken": "Access Token",
    "social.verifyToken": "Webhook Verify Token",
    "social.enabled": "Activer la connexion",
    "social.save": "Enregistrer",
    "social.manual": "Ingestion manuelle de commentaires",
    "social.manualPlaceholder": "Un commentaire par ligne...",
    "social.ingest": "Envoyer pour classification",
    "social.stream": "Flux des commentaires classes",
    "social.load": "Rafraichir",
    "social.exportCsv": "Exporter CSV",
    "social.exportXlsx": "Exporter Excel",
    "social.webhook": "URL Webhook",
    "social.connected": "Connecteur actif",
    "social.distribution": "Distribution courante",
    "social.noRows": "Aucun commentaire suivi pour le moment.",
    "rest.title": "REST API / Test",
    "rest.subtitle": "Explorateur interactif des endpoints backend",
    "rest.available": "Endpoints disponibles",
    "rest.requestBody": "Corps JSON de la requete",
  },
  en: {
    "app.name": "Ramy Sentiment Intelligence",
    "app.subtitle": "Operational analytics for Arabic, Darija, and French customer voice",
    "release.badge": "April 2026 Release",
    "common.dashboard": "Dashboard",
    "common.updated": "Updated Apr 2026",
    "common.language": "Language",
    "common.analyzing": "Analyzing...",
    "common.clear": "Clear",
    "common.response": "Response",
    "common.runRequest": "Run Request",
    "common.calling": "Calling API...",
    "nav.overview": "Overview / Home",
    "nav.dataExplorer": "Data Explorer",
    "nav.modelInsights": "Model Insights",
    "nav.methodology": "Methodology",
    "nav.liveDemo": "Live Demo / Inference",
    "nav.socialOps": "Social Ops / Tracking",
    "nav.restApi": "REST API / Try It",
    "nav.report": "Report",
    "sidebar.enterprise": "Enterprise Dashboard 2026",
    "sidebar.systemStatus": "System Status",
    "sidebar.modelOnline": "Model online and calibrated",
    "sidebar.navigation": "Navigation",
    "sidebar.uxNote": "UX Note",
    "sidebar.uxBody": "Clean navigation, strong contrast, and consistent spacing across all pages.",
    "sidebar.productTeam": "Product Team",
    "signal.activeSessions": "Active Sessions",
    "signal.avgInference": "Avg Inference",
    "signal.dataFreshness": "Data Freshness",
    "overview.title": "Overview / Home",
    "overview.subtitle": "Real-time Customer Intelligence for Arabic Markets",
    "overview.heroTitle": "Ramy Sentiment Intelligence",
    "overview.heroText": "The platform transforms noisy multilingual feedback into practical category-level business decisions.",
    "overview.chip.real": "Real Algerian Data",
    "overview.chip.f1": "Macro-F1 0.9437",
    "overview.chip.taxonomy": "5-Class Business Taxonomy",
    "overview.kpi.total": "Total Feedback Analyzed",
    "overview.kpi.delta": "+7.3% vs last collection cycle",
    "overview.kpi.topCategory": "Top Product Category",
    "overview.kpi.topCategoryNote": "Dominant signal from youth-oriented channels",
    "overview.kpi.accuracy": "Model Accuracy",
    "overview.kpi.accuracySub": "Macro-F1 on held-out test set",
    "overview.kpi.gauge": "Live Sentiment Gauge",
    "overview.aboutTitle": "About this project",
    "overview.aboutBody": "Ramy Sentiment Intelligence combines real Algerian collection, AraBERT fine-tuning, pseudo-label self-training, and threshold calibration for robust five-class sentiment analytics on mixed Arabic/Darja/French text.",
    "live.title": "Live Demo / Inference",
    "live.subtitle": "Real-time model-only inference with XAI attribution when available",
    "live.inputLabel": "Enter customer feedback text",
    "live.placeholder": "Example: ramy tres bon mais prix un peu cher",
    "live.analyze": "Analyze Sentiment",
    "live.predicted": "Predicted Class",
    "live.language": "Detected Language",
    "live.confidence": "Confidence by Class",
    "live.modelOnly": "XAI attribution is enabled when available from provider.",
    "live.uploadTitle": "CSV / Excel Batch Analysis",
    "live.uploadHint": "Upload a file of comments, classify each row, then view and export results.",
    "live.fileField": "File",
    "live.columnField": "Text Column (optional)",
    "live.columnPlaceholder": "e.g., text or comment",
    "live.analyzeFile": "Analyze File",
    "live.showInPage": "Show in Website",
    "live.downloadCsv": "Download CSV",
    "live.downloadXlsx": "Download Excel",
    "live.batchResults": "Batch Analysis Result",
    "live.analyzedRows": "Analyzed Rows",
    "live.textColumn": "Text Column",
    "live.noBatch": "No batch result yet. Upload and analyze a file first.",
    "social.title": "Social Channel Integration & Comment Tracking",
    "social.subtitle": "Connect Facebook/Instagram/TikTok, ingest comments, classify in real time, and track operations.",
    "social.connectors": "Connector Configuration",
    "social.platform": "Platform",
    "social.pageId": "Page / Account ID",
    "social.accessToken": "Access Token",
    "social.verifyToken": "Webhook Verify Token",
    "social.enabled": "Enable Connector",
    "social.save": "Save Settings",
    "social.manual": "Manual Comment Ingestion",
    "social.manualPlaceholder": "One comment per line...",
    "social.ingest": "Send for Classification",
    "social.stream": "Classified Comment Stream",
    "social.load": "Refresh Stream",
    "social.exportCsv": "Export CSV",
    "social.exportXlsx": "Export Excel",
    "social.webhook": "Webhook URL",
    "social.connected": "Connector Enabled",
    "social.distribution": "Current Distribution",
    "social.noRows": "No tracked comments yet.",
    "rest.title": "REST API / Try It",
    "rest.subtitle": "Interactive endpoint explorer for backend verification",
    "rest.available": "Available Endpoints",
    "rest.requestBody": "Request JSON Body",
  },
};

const I18nContext = React.createContext({
  locale: "ar",
  setLocale: () => {},
  isRTL: true,
  t: (key) => key,
});

const SENTIMENT_COLOR = {
  positive: COLORS.positive,
  negative: COLORS.negative,
  neutral: COLORS.neutral,
  improvement: COLORS.improvement,
  question: COLORS.question,
};

const SENTIMENT_ORDER = ["positive", "negative", "neutral", "improvement", "question"];

const SENTIMENT_LABELS = {
  ar: {
    positive: "إيجابي",
    negative: "سلبي",
    neutral: "محايد",
    improvement: "تحسين",
    question: "سؤال",
  },
  fr: {
    positive: "positif",
    negative: "negatif",
    neutral: "neutre",
    improvement: "amelioration",
    question: "question",
  },
  en: {
    positive: "positive",
    negative: "negative",
    neutral: "neutral",
    improvement: "improvement",
    question: "question",
  },
};

const SENTIMENT_SHORT_LABELS = {
  ar: {
    positive: "إيجابي",
    negative: "سلبي",
    neutral: "محايد",
    improvement: "تحسين",
    question: "سؤال",
  },
  fr: {
    positive: "positif",
    negative: "negatif",
    neutral: "neutre",
    improvement: "amelio",
    question: "question",
  },
  en: {
    positive: "positive",
    negative: "negative",
    neutral: "neutral",
    improvement: "improve",
    question: "question",
  },
};

function getSentimentLabel(cls, locale, shortLabel = false) {
  const table = shortLabel ? SENTIMENT_SHORT_LABELS : SENTIMENT_LABELS;
  return table[locale]?.[cls] || table.en[cls] || cls;
}

function truncateLabel(label, max = 18) {
  if (typeof label !== "string") return label;
  return label.length > max ? `${label.slice(0, max)}...` : label;
}

const sentimentDistribution = [
  { name: "positive", value: 2240, fill: COLORS.positive },
  { name: "negative", value: 1410, fill: COLORS.negative },
  { name: "neutral", value: 1630, fill: COLORS.neutral },
  { name: "improvement", value: 1090, fill: COLORS.improvement },
  { name: "question", value: 1535, fill: COLORS.question },
];

const categoryBreakdown = [
  { name: "Boisson aux fruits", value: 6410 },
  { name: "Boisson au lait", value: 1444 },
  { name: "Boisson gazéifiée", value: 45 },
  { name: "Produits laitiers", value: 6 },
];

const monthlyTrend = [
  { month: "Nov", positive: 320, negative: 210, neutral: 240, improvement: 180, question: 250 },
  { month: "Dec", positive: 350, negative: 215, neutral: 260, improvement: 170, question: 255 },
  { month: "Jan", positive: 365, negative: 225, neutral: 275, improvement: 180, question: 268 },
  { month: "Feb", positive: 390, negative: 245, neutral: 290, improvement: 185, question: 252 },
  { month: "Mar", positive: 410, negative: 255, neutral: 305, improvement: 190, question: 260 },
  { month: "Apr", positive: 405, negative: 260, neutral: 260, improvement: 185, question: 250 },
];

const perClassF1 = [
  { label: "positive", score: 0.98 },
  { label: "negative", score: 0.97 },
  { label: "neutral", score: 0.89 },
  { label: "improvement", score: 0.92 },
  { label: "question", score: 0.96 },
];

const thresholdComparison = [
  { cls: "positive", before: 0.94, after: 0.98 },
  { cls: "negative", before: 0.89, after: 0.97 },
  { cls: "neutral", before: 0.82, after: 0.89 },
  { cls: "improvement", before: 0.81, after: 0.92 },
  { cls: "question", before: 0.90, after: 0.96 },
];

const confusionMatrix = [
  [25, 0, 0, 0, 0],
  [0, 16, 0, 0, 0],
  [0, 1, 12, 1, 0],
  [0, 0, 1, 11, 1],
  [0, 0, 0, 0, 13],
];

const classLabels = ["positive", "negative", "neutral", "improvement", "question"];

const pipelineSteps = [
  {
    title: "Data Collection",
    why: "Gathered real Algerian customer voice from social media and web channels to avoid synthetic language artifacts.",
  },
  {
    title: "Preprocessing",
    why: "Normalized mixed Arabic/Darja/French writing and removed duplicates and noise for cleaner supervision.",
  },
  {
    title: "Augmentation",
    why: "Expanded sparse classes with few-shot lexical variants to improve coverage on question and improvement intents.",
  },
  {
    title: "Fine-Tuning",
    why: "Adapted AraBERT to Ramy domain semantics with validation-guided checkpoint selection.",
  },
  {
    title: "Self-Training",
    why: "Used high-confidence pseudo-labels from unlabeled feedback to reduce domain gap and improve robustness.",
  },
  {
    title: "TTA Inference",
    why: "Stabilized predictions on noisy short comments through selective test-time augmentation and logit averaging.",
  },
  {
    title: "Threshold Calibration",
    why: "Optimized class-specific decision thresholds to protect minority but business-critical classes.",
  },
  {
    title: "Business Mapping",
    why: "Mapped sentiment to Ramy product taxonomy for decision-ready category and subcategory intelligence.",
  },
];

const navItems = [
  { to: "/", labelKey: "nav.overview", icon: LayoutDashboard },
  { to: "/data-explorer", labelKey: "nav.dataExplorer", icon: Database },
  { to: "/model-insights", labelKey: "nav.modelInsights", icon: Brain },
  { to: "/methodology", labelKey: "nav.methodology", icon: Workflow },
  { to: "/live-demo", labelKey: "nav.liveDemo", icon: Sparkles },
  { to: "/social-ops", labelKey: "nav.socialOps", icon: Database },
  { to: "/rest-api", labelKey: "nav.restApi", icon: Server },
  { to: "/report", labelKey: "nav.report", icon: FileText },
];

const sidebarSignals = [
  { labelKey: "signal.activeSessions", value: "1,284" },
  { labelKey: "signal.avgInference", value: "42 ms" },
  { labelKey: "signal.dataFreshness", value: "4 min" },
];

const TOPBAR_HEIGHT = 76;

const routeLabelKeyByPath = {
  "/": "nav.overview",
  "/data-explorer": "nav.dataExplorer",
  "/model-insights": "nav.modelInsights",
  "/methodology": "nav.methodology",
  "/live-demo": "nav.liveDemo",
  "/social-ops": "nav.socialOps",
  "/rest-api": "nav.restApi",
  "/report": "nav.report",
};

function useI18n() {
  return useContext(I18nContext);
}

function BrandLogo({ className = "", alt = "Ramy" }) {
  return (
    <img
      src={BRAND.logoWordmark}
      alt={alt}
      className={className}
      onError={(e) => {
        if (e?.currentTarget?.src?.endsWith(BRAND.logoFallback)) return;
        e.currentTarget.src = BRAND.logoFallback;
      }}
    />
  );
}

function getHashPath() {
  const raw = window.location.hash.replace(/^#/, "").trim();
  if (!raw) return "/";
  return raw.startsWith("/") ? raw : `/${raw}`;
}

function useHashPath() {
  const [path, setPath] = useState(getHashPath());

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = "/";
    }

    const onChange = () => setPath(getHashPath());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}

function Card({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`fade-in-card card-elevated card-paper rounded-2xl bg-white/95 shadow-soft border border-rose-100/90 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function ChartShell({ children, className = "h-72" }) {
  return (
    <div className={`chart-shell ${className}`} dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function SelectMenu({
  value,
  onChange,
  options,
  placeholder = "",
  compact = false,
  dark = false,
  rtl = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!open || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setOpenUpward(spaceBelow < 240);
  }, [open, options.length]);

  const triggerClass = dark
    ? "border-rose-100/45 bg-white/20 text-white hover:bg-white/25 focus:ring-rose-100/30"
    : "border-slate-300 bg-white text-slate-700 hover:border-rose-300 focus:ring-rose-200";

  return (
    <div ref={rootRef} className={`relative ${compact ? "min-w-[140px]" : "w-full"} ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full rounded-xl border px-3 ${compact ? "py-1.5 text-xs" : "py-2.5 text-sm"} transition-all focus:outline-none focus:ring-2 ${triggerClass} ${rtl ? "text-right" : "text-left"}`}
      >
        <span className="block truncate pe-6">{selected?.label || placeholder}</span>
        <ChevronDown
          size={14}
          className={`absolute top-1/2 -translate-y-1/2 ${rtl ? "left-3" : "right-3"} transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className={`absolute z-[70] w-full rounded-xl border border-slate-200 bg-white shadow-xl shadow-rose-900/10 p-1 ${openUpward ? "bottom-full mb-2" : "top-full mt-2"} ${rtl ? "text-right" : "text-left"}`}>
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-rose-200 ${rtl ? "text-right" : "text-left"} ${
                  active
                    ? "bg-rose-50 text-rose-900 font-semibold"
                    : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PageHeader({ title, subtitle, currentPath }) {
  const { t, isRTL } = useI18n();
  const routeLabelKey = routeLabelKeyByPath[currentPath] || "";

  return (
    <div className="mb-6 rounded-2xl border border-rose-100/70 bg-white/80 p-4 md:p-5 shadow-sm">
      <div className={`flex flex-wrap items-center gap-2 text-xs text-slate-500 ${isRTL ? "justify-end" : "uppercase tracking-[0.12em]"}`}>
        <span className="inline-flex h-2 w-2 rounded-full bg-electric" />
        <span>{t("common.dashboard")}</span>
        <ChevronRight size={14} />
        <span>{routeLabelKey ? t(routeLabelKey) : currentPath.replace("/", "")}</span>
        <span className="mx-1 text-slate-300">|</span>
        <span>{t("common.updated")}</span>
      </div>
      <h1 className={`text-2xl md:text-3xl font-bold text-navy mt-2 ${isRTL ? "text-right" : ""}`}>{title}</h1>
      <p className={`text-slate-600 mt-1 ${isRTL ? "text-right" : ""}`}>{subtitle}</p>
      <div className={`mt-3 h-1.5 w-24 rounded-full bg-gradient-to-r from-electric to-rose-300 ${isRTL ? "mr-auto" : ""}`} />
    </div>
  );
}

function GaugeRing({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const step = score / 50;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setAnimatedScore(Number(current.toFixed(1)));
    }, 20);
    return () => clearInterval(timer);
  }, [score]);

  return (
    <div className="flex items-center justify-center">
      <div
        className="h-40 w-40 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(${COLORS.electric} ${animatedScore}%, #e2e8f0 ${animatedScore}% 100%)`,
        }}
      >
        <div className="h-28 w-28 rounded-full bg-white flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-navy">{Math.round(animatedScore)}</span>
          <span className="text-xs text-slate-500">Sentiment Score</span>
        </div>
      </div>
    </div>
  );
}

function OverviewPage({ currentPath }) {
  const { t, locale } = useI18n();
  const total = sentimentDistribution.reduce((acc, item) => acc + item.value, 0);

  return (
    <div>
      <PageHeader
        title={t("overview.title")}
        subtitle={t("overview.subtitle")}
        currentPath={currentPath}
      />

      <Card className="gradient-hero hero-glow hero-solid card-paper-no-overlay p-6 md:p-8 mb-6 border-rose-800 text-white shadow-[0_18px_36px_rgba(127,29,29,0.35)]" delay={0}>
        <h2 className="text-3xl md:text-4xl font-extrabold">{t("overview.heroTitle")}</h2>
        <p className="mt-3 text-rose-50 max-w-3xl text-base md:text-lg leading-8">
          {t("overview.heroText")}
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs md:text-sm">
          <span className="rounded-full border border-rose-100/45 bg-white/15 px-3 py-1">{t("overview.chip.real")}</span>
          <span className="rounded-full border border-rose-100/45 bg-white/15 px-3 py-1">{t("overview.chip.f1")}</span>
          <span className="rounded-full border border-rose-100/45 bg-white/15 px-3 py-1">{t("overview.chip.taxonomy")}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-5 bg-white/95" delay={40}>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">Realtime Ops</p>
          <h3 className="text-lg font-bold text-navy mb-2">{locale === "ar" ? "تحليل مباشر للنصوص" : locale === "fr" ? "Inference texte en direct" : "Live Text Inference"}</h3>
          <p className="text-sm text-slate-600 mb-4">{locale === "ar" ? "حلل تعليقات فردية أو ملفات CSV/Excel مباشرة من لوحة التحليل." : locale === "fr" ? "Analysez des commentaires unitaires ou des fichiers CSV/Excel depuis la demo live." : "Analyze single comments or CSV/Excel files directly from the live demo."}</p>
          <a href="#/live-demo" className="inline-flex rounded-xl bg-electric px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
            {locale === "ar" ? "الذهاب للتحليل المباشر" : locale === "fr" ? "Ouvrir la demo live" : "Open Live Analysis"}
          </a>
        </Card>

        <Card className="p-5 bg-white/95" delay={60}>
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500 mb-2">Social Tracking</p>
          <h3 className="text-lg font-bold text-navy mb-2">{locale === "ar" ? "ربط المنصات ومراقبة التعليقات" : locale === "fr" ? "Connecteurs sociaux et monitoring" : "Social Connectors & Monitoring"}</h3>
          <p className="text-sm text-slate-600 mb-4">{locale === "ar" ? "اربط صفحات Facebook/Instagram/TikTok وتابع تصنيف التعليقات في بث إداري حي." : locale === "fr" ? "Connectez Facebook/Instagram/TikTok et suivez le stream classe en temps reel." : "Connect Facebook/Instagram/TikTok pages and monitor classified comment stream in real time."}</p>
          <a href="#/social-ops" className="inline-flex rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-rose-900">
            {locale === "ar" ? "فتح صفحة الربط" : locale === "fr" ? "Ouvrir Social Ops" : "Open Social Ops"}
          </a>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="p-5" delay={80}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{t("overview.kpi.total")}</p>
            <BadgeCheck className="text-electric" size={18} />
          </div>
          <p className="text-3xl font-bold text-navy mt-3">{total.toLocaleString()}</p>
          <p className="text-xs text-emerald-700 mt-1">{t("overview.kpi.delta")}</p>
        </Card>

        <Card className="p-5" delay={140}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{t("overview.kpi.topCategory")}</p>
            <Target className="text-electric" size={18} />
          </div>
          <p className="text-lg font-bold text-navy mt-3">Boisson aux fruits</p>
          <p className="text-sm text-slate-500 mt-1">6,410 records</p>
          <p className="text-xs text-slate-500 mt-1">{t("overview.kpi.topCategoryNote")}</p>
        </Card>

        <Card className="p-5" delay={200}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">{t("overview.kpi.accuracy")}</p>
            <Gauge className="text-electric" size={18} />
          </div>
          <p className="text-3xl font-bold text-navy mt-3">0.9437</p>
          <p className="text-sm text-slate-500 mt-1">{t("overview.kpi.accuracySub")}</p>
          <p className="text-xs text-emerald-700 mt-1">95.06% accuracy &middot; leakage-free</p>
        </Card>

        <Card className="p-5" delay={260}>
          <p className="text-sm text-slate-500">{t("overview.kpi.gauge")}</p>
          <GaugeRing score={78} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 xl:col-span-2" delay={300}>
          <h3 className="font-semibold text-navy mb-3">Overall Sentiment Distribution</h3>
          <ChartShell>
            <PieChart margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <Pie data={sentimentDistribution} dataKey="value" nameKey="name" innerRadius={70} outerRadius={98}>
                {sentimentDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [Number(value).toLocaleString(), getSentimentLabel(name, locale)]}
                labelFormatter={(label) => getSentimentLabel(label, locale)}
              />
              <Legend formatter={(label) => getSentimentLabel(label, locale, true)} verticalAlign="bottom" />
            </PieChart>
          </ChartShell>
        </Card>

        <Card className="p-5" delay={360}>
          <h3 className="font-semibold text-navy mb-3">{t("overview.aboutTitle")}</h3>
          <p className="text-sm text-slate-600 leading-7">
            {t("overview.aboutBody")}
          </p>
        </Card>
      </div>
    </div>
  );
}

function DataExplorerPage({ currentPath }) {
  const { t, locale, isRTL } = useI18n();
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categoryWeight = useMemo(() => {
    const total = categoryBreakdown.reduce((acc, item) => acc + item.value, 0);
    const byName = {};
    categoryBreakdown.forEach((c) => {
      byName[c.name] = c.value / total;
    });
    return byName;
  }, []);

  const filteredSentiment = useMemo(() => {
    return sentimentDistribution.map((item) => {
      let value = item.value;
      if (categoryFilter !== "all") {
        value = Math.round(value * categoryWeight[categoryFilter]);
      }
      if (sentimentFilter !== "all" && sentimentFilter !== item.name) {
        value = Math.round(value * 0.18);
      }
      return { ...item, value };
    });
  }, [categoryFilter, sentimentFilter, categoryWeight]);

  const timeline = useMemo(() => {
    return monthlyTrend.map((row) => {
      let total = row.positive + row.negative + row.neutral + row.improvement + row.question;
      if (categoryFilter !== "all") {
        total = Math.round(total * categoryWeight[categoryFilter]);
      }
      if (sentimentFilter !== "all") {
        let selected = row[sentimentFilter];
        if (categoryFilter !== "all") {
          selected = Math.round(selected * categoryWeight[categoryFilter]);
        }
        return { month: row.month, volume: selected };
      }
      return { month: row.month, volume: total };
    });
  }, [categoryFilter, sentimentFilter, categoryWeight]);

  const sentimentOptions = useMemo(
    () => SENTIMENT_ORDER.map((key) => ({ key, label: getSentimentLabel(key, locale) })),
    [locale]
  );

  const sentimentSelectOptions = useMemo(
    () => [
      { value: "all", label: locale === "ar" ? "كل الفئات" : locale === "fr" ? "Toutes les classes" : "All classes" },
      ...sentimentOptions.map((opt) => ({ value: opt.key, label: opt.label })),
    ],
    [locale, sentimentOptions]
  );

  const categorySelectOptions = useMemo(
    () => [
      { value: "all", label: locale === "ar" ? "كل الفئات" : locale === "fr" ? "Toutes les categories" : "All categories" },
      ...categoryBreakdown.map((c) => ({ value: c.name, label: c.name })),
    ],
    [locale]
  );

  const categoryChartData = useMemo(
    () => [...categoryBreakdown].sort((a, b) => b.value - a.value),
    []
  );

  return (
    <div>
      <PageHeader
        title={t("nav.dataExplorer")}
        subtitle={t("overview.subtitle")}
        currentPath={currentPath}
      />

      <Card className="p-5 mb-6" delay={0}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm font-medium text-slate-600">
            {locale === "ar" ? "التصفية حسب فئة المشاعر" : locale === "fr" ? "Filtrer par classe de sentiment" : "Filter by sentiment class"}
            <SelectMenu
              className="mt-2"
              value={sentimentFilter}
              onChange={setSentimentFilter}
              options={sentimentSelectOptions}
              rtl={isRTL}
            />
          </label>

          <label className="text-sm font-medium text-slate-600">
            {locale === "ar" ? "التصفية حسب فئة المنتج" : locale === "fr" ? "Filtrer par categorie produit" : "Filter by product category"}
            <SelectMenu
              className="mt-2"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categorySelectOptions}
              rtl={isRTL}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">{locale === "ar" ? "الفلاتر النشطة:" : locale === "fr" ? "Filtres actifs :" : "Active filters:"}</span>
          <span className="rounded-full bg-rose-100 text-rose-900 px-3 py-1 border border-rose-200">
            {locale === "ar" ? "المشاعر" : locale === "fr" ? "Sentiment" : "Sentiment"}: {sentimentFilter === "all" ? (locale === "ar" ? "الكل" : locale === "fr" ? "Tout" : "all") : getSentimentLabel(sentimentFilter, locale)}
          </span>
          <span className="rounded-full bg-slate-100 text-slate-700 px-3 py-1 border border-slate-200">
            {locale === "ar" ? "الفئة" : locale === "fr" ? "Categorie" : "Category"}: {categoryFilter === "all" ? (locale === "ar" ? "الكل" : locale === "fr" ? "Tout" : "all") : categoryFilter}
          </span>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <Card className="p-5" delay={80}>
          <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "توزيع المشاعر (5 فئات)" : locale === "fr" ? "Distribution des sentiments (5 classes)" : "Sentiment Distribution (5 Classes)"}</h3>
          <ChartShell>
            <BarChart data={filteredSentiment} margin={{ top: 10, right: 14, left: 2, bottom: 22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                tickFormatter={(value) => getSentimentLabel(value, locale, true)}
                interval={0}
                minTickGap={10}
                height={36}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} width={46} />
              <Tooltip
                formatter={(value) => Number(value).toLocaleString()}
                labelFormatter={(label) => getSentimentLabel(label, locale)}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={54}>
                {filteredSentiment.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartShell>
        </Card>

        <Card className="p-5" delay={140}>
          <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "تفصيل فئات المنتجات" : locale === "fr" ? "Repartition des categories produit" : "Product Category Breakdown"}</h3>
          <ChartShell>
            <BarChart data={categoryChartData} layout="vertical" margin={{ top: 8, right: 18, left: 14, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={128}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => truncateLabel(value, 15)}
              />
              <Tooltip formatter={(value) => Number(value).toLocaleString()} />
              <Bar dataKey="value" fill={COLORS.electric} radius={[0, 8, 8, 0]} maxBarSize={24} />
            </BarChart>
          </ChartShell>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            {categoryBreakdown.map((c) => (
              <div key={c.name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">{c.name}: {c.value.toLocaleString()}</div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5" delay={220}>
        <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "اتجاه التعليقات شهريا" : locale === "fr" ? "Tendance mensuelle des feedbacks" : "Monthly Feedback Trend"}</h3>
        <p className="text-sm text-slate-600 mb-3">{locale === "ar" ? "الأحجام تعكس الفلتر الحالي للمشاعر وفئة المنتج." : locale === "fr" ? "Les volumes reflectent les filtres sentiment/categorie actifs." : "Volumes reflect selected sentiment scope and category weighting."}</p>
        <ChartShell>
          <LineChart data={timeline} margin={{ top: 10, right: 18, left: 4, bottom: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" minTickGap={18} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} width={48} />
            <Tooltip formatter={(value) => Number(value).toLocaleString()} />
            <Line type="monotone" dataKey="volume" stroke={COLORS.electric} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartShell>
      </Card>
    </div>
  );
}

function ConfusionMatrix() {
  const max = Math.max(...confusionMatrix.flat());
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-slate-500">Actual \ Pred</th>
            {classLabels.map((label) => (
              <th key={label} className="p-2 text-left text-slate-500 capitalize">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {confusionMatrix.map((row, rIdx) => (
            <tr key={classLabels[rIdx]}>
              <td className="p-2 font-medium capitalize">{classLabels[rIdx]}</td>
              {row.map((value, cIdx) => {
                const intensity = value / max;
                const bg = `rgba(214, 31, 51, ${0.12 + intensity * 0.76})`;
                const textClass = intensity > 0.55 ? "text-white" : "text-slate-800";
                return (
                  <td key={`${rIdx}-${cIdx}`} className={`p-2 rounded-md ${textClass}`} style={{ backgroundColor: bg }}>
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ModelInsightsPage({ currentPath }) {
  const { t, locale } = useI18n();
  const chartData = perClassF1.map((item) => ({ ...item, fill: SENTIMENT_COLOR[item.label] }));
  return (
    <div>
      <PageHeader
        title={t("nav.modelInsights")}
        subtitle={t("overview.subtitle")}
        currentPath={currentPath}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
        <Card className="p-5" delay={0}>
          <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "درجات F1 لكل فئة" : locale === "fr" ? "Scores F1 par classe" : "Per-Class F1 Scores"}</h3>
          <ChartShell>
            <BarChart data={chartData} margin={{ top: 10, right: 16, left: 6, bottom: 22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tickFormatter={(value) => getSentimentLabel(value, locale, true)}
                interval={0}
                height={34}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0.75, 1]} width={46} />
              <Tooltip
                formatter={(value) => Number(value).toFixed(3)}
                labelFormatter={(label) => getSentimentLabel(label, locale)}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={52}>
                {chartData.map((entry) => (
                  <Cell key={entry.label} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartShell>
        </Card>

        <Card className="p-5" delay={80}>
          <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "تحسين العتبات (قبل/بعد)" : locale === "fr" ? "Optimisation des seuils (avant/apres)" : "Threshold Optimization (Before vs After)"}</h3>
          <ChartShell>
            <BarChart data={thresholdComparison} margin={{ top: 10, right: 16, left: 6, bottom: 22 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="cls"
                tickFormatter={(value) => getSentimentLabel(value, locale, true)}
                interval={0}
                height={34}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0.7, 1]} width={46} />
              <Tooltip
                formatter={(value) => Number(value).toFixed(3)}
                labelFormatter={(label) => getSentimentLabel(label, locale)}
              />
              <Legend />
              <Bar dataKey="before" fill="#94a3b8" radius={[6, 6, 0, 0]} name="Default threshold 0.5" maxBarSize={40} />
              <Bar dataKey="after" fill={COLORS.electric} radius={[6, 6, 0, 0]} name="Per-class tuned threshold" maxBarSize={40} />
            </BarChart>
          </ChartShell>
        </Card>
      </div>

      <Card className="p-5 mb-4" delay={140}>
        <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "مصفوفة الالتباس (5x5)" : locale === "fr" ? "Matrice de confusion (5x5)" : "Confusion Matrix Heatmap (5x5)"}</h3>
        <ConfusionMatrix />
      </Card>

      <Card className="p-5" delay={200}>
        <h3 className="font-semibold text-navy mb-2">{locale === "ar" ? "لماذا Macro-F1؟" : locale === "fr" ? "Pourquoi macro-F1 ?" : "Why macro-F1?"}</h3>
        <p className="text-slate-600 leading-7">
          Validation data reflects natural class imbalance, where majority classes can dominate plain accuracy.
          Macro-F1 treats each sentiment class equally and prevents business-critical classes like
          improvement and question from being overshadowed. This metric aligns optimization with
          production priorities, not just headline numbers.
        </p>
      </Card>
    </div>
  );
}

function MethodologyPage({ currentPath }) {
  const { t, locale } = useI18n();
  return (
    <div>
      <PageHeader
        title={t("nav.methodology")}
        subtitle={t("overview.subtitle")}
        currentPath={currentPath}
      />

      <Card className="p-5 mb-4" delay={0}>
        <h3 className="font-semibold text-navy mb-4">{locale === "ar" ? "مخطط الـPipeline" : locale === "fr" ? "Schema du pipeline" : "Pipeline Diagram"}</h3>
        <div className="flex flex-wrap gap-2 text-sm methodology-flow" dir="ltr">
          {pipelineSteps.map((step, index) => (
            <div key={step.title} className="px-3 py-2 rounded-xl border border-rose-200 bg-white text-navy font-semibold">
              <span className="text-rose-700 me-1">{index + 1}.</span>
              {step.title}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {pipelineSteps.map((step, idx) => (
          <Card key={step.title} className="p-5" delay={idx * 40 + 60}>
            <h4 className="font-semibold text-navy">{step.title}</h4>
            <p className="text-sm text-slate-600 mt-2 leading-6">{step.why}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5" delay={260}>
        <h3 className="font-semibold text-navy mb-3">{locale === "ar" ? "الابتكارات الأساسية" : locale === "fr" ? "Innovations cles" : "Key Innovations"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
            <p className="font-semibold text-rose-900">Few-Shot Augmentation</p>
            <p className="text-sm text-rose-800 mt-2">Improved representation for sparse classes with linguistically-grounded variants.</p>
          </div>
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <p className="font-semibold text-amber-900">Pseudo-Label Self-Training</p>
            <p className="text-sm text-amber-800 mt-2">Expanded supervision using high-confidence unlabeled real-world feedback.</p>
          </div>
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4">
            <p className="font-semibold text-rose-900">Test-Time Augmentation (TTA)</p>
            <p className="text-sm text-rose-800 mt-2">Stabilized predictions for short, noisy, and code-switched social comments.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function detectLanguage(text) {
  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  if (hasArabic && hasLatin) return "Mixed Arabic/Darja/French";
  if (hasArabic) return "Arabic / Darja";
  if (hasLatin) return "French / Latin";
  return "Unknown";
}

function mockPredict(text) {
  const normalized = text.toLowerCase();

  const patterns = [
    { cls: "negative", keys: ["mauvais", "trop cher", "khayeb", "رديء", "bad", "zero", "ghali"] },
    { cls: "improvement", keys: ["ameliore", "improve", "suggest", "اقتراح", "ممكن", "please add"] },
    { cls: "question", keys: ["?", "ou", "where", "wach", "فين", "comment", "kayen"] },
    { cls: "positive", keys: ["excellent", "top", "bnin", "tres bon", "روعة", "love", "super"] },
  ];

  let predicted = "neutral";
  patterns.forEach((rule) => {
    if (rule.keys.some((k) => normalized.includes(k))) {
      predicted = rule.cls;
    }
  });

  const base = {
    positive: 0.18,
    negative: 0.18,
    neutral: 0.18,
    improvement: 0.18,
    question: 0.18,
  };
  base[predicted] = 0.66;

  if (predicted === "question") {
    base.improvement = 0.11;
  }

  const total = Object.values(base).reduce((a, b) => a + b, 0);
  Object.keys(base).forEach((k) => {
    base[k] = Number((base[k] / total).toFixed(3));
  });

  return {
    predictedClass: predicted,
    confidence: base,
    language: detectLanguage(text),
    xaiUsed: false,
    xaiMethod: "",
    xaiError: "Mock mode",
    topTokens: [],
    explanationText: "",
  };
}

function normalizeConfidence(rawScores, predictedClass, confidenceValue) {
  const classes = ["positive", "negative", "neutral", "improvement", "question"];
  const normalized = {
    positive: 0,
    negative: 0,
    neutral: 0,
    improvement: 0,
    question: 0,
  };

  if (rawScores && typeof rawScores === "object" && Object.keys(rawScores).length > 0) {
    Object.keys(rawScores).forEach((label) => {
      const key = String(label).toLowerCase();
      if (key in normalized) {
        normalized[key] = Number(rawScores[label] || 0);
      }
    });

    const total = Object.values(normalized).reduce((a, b) => a + b, 0);
    if (total > 0) {
      classes.forEach((cls) => {
        normalized[cls] = Number((normalized[cls] / total).toFixed(4));
      });
      return normalized;
    }
  }

  const base = {
    positive: 0.05,
    negative: 0.05,
    neutral: 0.05,
    improvement: 0.05,
    question: 0.05,
  };
  const winner = (predictedClass || "neutral").toLowerCase();
  const winnerScore = Math.max(0, Math.min(Number(confidenceValue || 0), 1));
  const rest = Math.max(0, 1 - winnerScore);
  const losers = classes.filter((cls) => cls !== winner);
  const each = losers.length ? rest / losers.length : 0;

  classes.forEach((cls) => {
    base[cls] = cls === winner ? winnerScore : each;
  });
  return base;
}

function getApiBaseCandidates() {
  const candidates = [];
  const proto = window.location?.protocol || "";
  const hostname = String(window.location?.hostname || "").toLowerCase();
  const isLocalUi = hostname === "localhost" || hostname === "127.0.0.1";
  const configured = String(window.__API_BASE__ || "").trim();

  if (configured) {
    candidates.push(configured);
    if (isLocalUi) {
      if (proto === "http:" || proto === "https:") {
        candidates.push("");
        if (window.location?.origin) {
          candidates.push(window.location.origin);
        }
      }
      candidates.push("http://127.0.0.1:8000", "http://localhost:8000");
    }
    return [...new Set(candidates.filter(Boolean))];
  }

  if (proto === "http:" || proto === "https:") {
    candidates.push("");
    if (window.location?.origin) {
      candidates.push(window.location.origin);
    }
  }

  if (isLocalUi) {
    candidates.push("http://127.0.0.1:8000", "http://localhost:8000");
  }
  return [...new Set(candidates.filter(Boolean))];
}

async function fetchFromApi(path, options = {}) {
  const candidates = getApiBaseCandidates();
  const host = window.location?.origin || "";
  const hostname = String(window.location?.hostname || "").toLowerCase();
  const isLocalUi = hostname === "localhost" || hostname === "127.0.0.1";
  let lastError = null;

  for (const base of candidates) {
    const url = `${base}${path}`;
    try {
      return await fetch(url, options);
    } catch (error) {
      lastError = error;
    }
  }

  const locationHint = host || "file://";
  const baseMessage = lastError?.message || "Unable to connect to API";
  if (isLocalUi) {
    throw new Error(
      `${baseMessage}. Current UI origin: ${locationHint}. Start backend on http://127.0.0.1:8000 and refresh.`
    );
  }

  throw new Error("Live prediction service is temporarily unavailable. Please try again shortly.");
}

async function fetchPrediction(text) {
  const response = await fetchFromApi("/api/model/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      comments: [text],
      include_xai: true,
      xai_top_k: 8,
    }),
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (error) {
    payload = {};
  }

  if (!response.ok) {
    const message = payload?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }

  const row = payload?.rows?.[0];
  if (!row) {
    throw new Error("No prediction row returned from API.");
  }

  const predictedClass = String(row.predicted_class || "unknown").toLowerCase();
  const confidence = normalizeConfidence(row.all_scores, predictedClass, row.confidence);

  return {
    predictedClass,
    confidence,
    language: detectLanguage(text),
    xaiUsed: Boolean(payload.xai_used),
    xaiMethod: String(row.xai_method || payload.xai_method || ""),
    xaiError: String(payload.xai_error || ""),
    topTokens: Array.isArray(row.top_tokens) ? row.top_tokens : [],
    explanationText: String(row.explanation_text || ""),
    modelDir: String(payload.model_dir || ""),
  };
}

async function analyzePredictionFile(file, textColumn = "") {
  const form = new FormData();
  form.append("file", file);
  form.append("text_column", textColumn || "");
  form.append("output_format", "json");

  const response = await fetchFromApi("/api/model/predict-file", {
    method: "POST",
    body: form,
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch (_) {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(String(payload?.detail || `File analysis failed (${response.status})`));
  }
  return payload;
}

async function downloadPredictionFile(file, textColumn = "", outputFormat = "csv") {
  const form = new FormData();
  form.append("file", file);
  form.append("text_column", textColumn || "");
  form.append("output_format", outputFormat);

  const response = await fetchFromApi("/api/model/predict-file", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    let detail = "Download failed";
    try {
      const payload = await response.json();
      detail = String(payload?.detail || detail);
    } catch (_) {
      // Ignore and keep fallback message.
    }
    throw new Error(detail);
  }

  const blob = await response.blob();
  const extension = outputFormat === "xlsx" ? "xlsx" : "csv";
  const filenameBase = (file?.name || "predictions").replace(/\.[^.]+$/, "");
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `${filenameBase}_predictions.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

async function getSocialConnectors() {
  const response = await fetchFromApi("/api/social/connectors");
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(String(payload?.detail || "Unable to load social connectors"));
  }
  return payload;
}

async function saveSocialConnector(payload) {
  const response = await fetchFromApi("/api/social/connectors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(String(data?.detail || "Unable to save social connector"));
  }
  return data;
}

async function getSocialComments(limit = 120) {
  const response = await fetchFromApi(`/api/social/comments?limit=${limit}`);
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(String(payload?.detail || "Unable to load social comments"));
  }
  return payload;
}

async function ingestSocialComments(payload) {
  const response = await fetchFromApi("/api/social/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(String(data?.detail || "Unable to ingest social comments"));
  }
  return data;
}

function LiveDemoPage({ currentPath }) {
  const { t, isRTL, locale } = useI18n();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileInput, setFileInput] = useState(null);
  const [textColumn, setTextColumn] = useState("");
  const [fileResult, setFileResult] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const badgeClasses = {
    positive: "bg-green-100 text-green-800 border-green-300",
    negative: "bg-red-100 text-red-800 border-red-300",
    neutral: "bg-amber-100 text-amber-800 border-amber-300",
    improvement: "bg-purple-100 text-purple-800 border-purple-300",
    question: "bg-teal-100 text-teal-800 border-teal-300",
  };

  const runInference = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const prediction = await fetchPrediction(text);
      setResult(prediction);
    } catch (error) {
      const hostname = String(window.location?.hostname || "").toLowerCase();
      const isLocalUi = hostname === "localhost" || hostname === "127.0.0.1";
      if (isLocalUi) {
        setResult(mockPredict(text));
        setErrorMessage("API unavailable, showing mock prediction.");
      } else {
        setResult(null);
        setErrorMessage("Live prediction service is temporarily unavailable. Please try again shortly.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const runFileAnalysis = async () => {
    if (!fileInput) {
      setFileError(locale === "ar" ? "اختر ملف CSV أو Excel أولاً." : locale === "fr" ? "Veuillez choisir un fichier CSV/Excel." : "Please select a CSV/Excel file first.");
      return;
    }
    setFileLoading(true);
    setFileError("");
    try {
      const payload = await analyzePredictionFile(fileInput, textColumn);
      setFileResult(payload);
    } catch (error) {
      setFileError("Live prediction service is temporarily unavailable. Please try again shortly.");
    } finally {
      setFileLoading(false);
    }
  };

  const runFileDownload = async (format) => {
    if (!fileInput) {
      setFileError(locale === "ar" ? "اختر ملف قبل التنزيل." : locale === "fr" ? "Selectionnez un fichier avant export." : "Choose a file before export.");
      return;
    }
    setFileLoading(true);
    setFileError("");
    try {
      await downloadPredictionFile(fileInput, textColumn, format);
    } catch (error) {
      setFileError("Live prediction service is temporarily unavailable. Please try again shortly.");
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("live.title")}
        subtitle={t("live.subtitle")}
        currentPath={currentPath}
      />

      <Card className="p-5 mb-4" delay={0}>
        <label className="text-sm font-medium text-slate-700">{t("live.inputLabel")}</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className={`mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none ${isRTL ? "text-right" : ""}`}
          placeholder={t("live.placeholder")}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={runInference}
            disabled={isLoading}
            className="rounded-xl bg-electric text-white px-4 py-2 font-semibold hover:bg-red-700"
          >
            {isLoading ? t("common.analyzing") : t("live.analyze")}
          </button>
          <button
            onClick={() => {
              setText("");
              setResult(null);
            }}
            className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-200"
          >
            {t("common.clear")}
          </button>
        </div>
      </Card>

      <Card className="p-5 mb-4" delay={20}>
        <h3 className="font-semibold text-navy mb-2">{t("live.uploadTitle")}</h3>
        <p className="text-sm text-slate-600 mb-4">{t("live.uploadHint")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm font-medium text-slate-700">
            {t("live.fileField")}
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setFileInput(e.target.files?.[0] || null)}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            {t("live.columnField")}
            <input
              value={textColumn}
              onChange={(e) => setTextColumn(e.target.value)}
              className={`mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none ${isRTL ? "text-right" : ""}`}
              placeholder={t("live.columnPlaceholder")}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={runFileAnalysis}
            disabled={fileLoading}
            className="rounded-xl bg-electric text-white px-4 py-2 font-semibold hover:bg-red-700 disabled:opacity-70"
          >
            {fileLoading ? t("common.analyzing") : t("live.showInPage")}
          </button>
          <button
            onClick={() => runFileDownload("csv")}
            disabled={fileLoading}
            className="rounded-xl bg-slate-900 text-white px-4 py-2 font-semibold hover:bg-slate-800 disabled:opacity-70"
          >
            {t("live.downloadCsv")}
          </button>
          <button
            onClick={() => runFileDownload("xlsx")}
            disabled={fileLoading}
            className="rounded-xl bg-slate-700 text-white px-4 py-2 font-semibold hover:bg-slate-600 disabled:opacity-70"
          >
            {t("live.downloadXlsx")}
          </button>
        </div>

        {fileError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {fileError}
          </div>
        )}

        {fileResult ? (
          <div className="mt-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="text-slate-500">{t("live.analyzedRows")}</p>
                <p className="font-bold text-navy text-lg">{fileResult.analyzed_rows || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="text-slate-500">Total Rows</p>
                <p className="font-bold text-navy text-lg">{fileResult.total_rows || 0}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                <p className="text-slate-500">{t("live.textColumn")}</p>
                <p className="font-bold text-navy">{fileResult.text_column || "-"}</p>
              </div>
            </div>

            <h4 className="font-semibold text-navy mb-2">{t("live.batchResults")}</h4>
            <div className="overflow-auto max-h-[360px] rounded-xl border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Text</th>
                    <th className="text-left px-3 py-2">Class</th>
                    <th className="text-left px-3 py-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {(fileResult.prediction_preview || []).slice(0, 120).map((row, idx) => (
                    <tr key={`${row.text}-${idx}`} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700 max-w-[560px] truncate">{row.text}</td>
                      <td className="px-3 py-2 font-semibold text-navy">{getSentimentLabel(row.predicted_class, locale)}</td>
                      <td className="px-3 py-2 text-slate-600">{(Number(row.confidence || 0) * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">{t("live.noBatch")}</p>
        )}
      </Card>

      {errorMessage && (
        <Card className="p-4 mb-4 border-rose-300 bg-rose-50" delay={60}>
          <p className="text-sm text-rose-900">{errorMessage}</p>
        </Card>
      )}

      {result && (
        <Card className="p-5" delay={100}>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold capitalize ${badgeClasses[result.predictedClass]}`}>
              {t("live.predicted")}: {getSentimentLabel(result.predictedClass, locale)}
            </span>
            <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {t("live.language")}: {result.language}
            </span>
          </div>

          <h3 className="font-semibold text-navy mb-3">{t("live.confidence")}</h3>
          <div className="space-y-3">
            {Object.keys(result.confidence).map((cls) => (
              <div key={cls}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize font-medium text-slate-700">{getSentimentLabel(cls, locale)}</span>
                  <span className="text-slate-600">{(result.confidence[cls] * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${result.confidence[cls] * 100}%`,
                      backgroundColor: SENTIMENT_COLOR[cls],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              {t("live.modelOnly")}
            </p>

            {result.explanationText && (
              <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50/60 px-3 py-2">
                <p className="text-xs font-semibold text-rose-900 mb-1">
                  {locale === "ar" ? "تفسير النموذج" : locale === "fr" ? "Explication du modele" : "Model Explanation"}
                </p>
                <p className="text-sm text-rose-900">{result.explanationText}</p>
              </div>
            )}

            {Array.isArray(result.topTokens) && result.topTokens.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {result.topTokens.slice(0, 8).map((entry, idx) => {
                  const token = Array.isArray(entry) ? String(entry[0] || "") : "";
                  const score = Array.isArray(entry) ? Number(entry[1] || 0) : 0;
                  return (
                    <span key={`${token}-${idx}`} className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs text-rose-900">
                      {token} ({Math.round(score * 100)}%)
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function SocialOpsPage({ currentPath }) {
  const { t, locale, isRTL } = useI18n();
  const platformOptions = useMemo(
    () => [
      { value: "facebook", label: "Facebook" },
      { value: "instagram", label: "Instagram" },
      { value: "tiktok", label: "TikTok" },
    ],
    []
  );

  const [platform, setPlatform] = useState("facebook");
  const [pageId, setPageId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [manualComments, setManualComments] = useState("");
  const [streamRows, setStreamRows] = useState([]);
  const [distribution, setDistribution] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadConnectorAndStream = async () => {
    setLoading(true);
    setError("");
    try {
      const [connectorsPayload, commentsPayload] = await Promise.all([
        getSocialConnectors(),
        getSocialComments(140),
      ]);

      const connector = (connectorsPayload.connectors || []).find((c) => c.platform === platform)
        || connectorsPayload.connectors?.[0]
        || null;
      if (connector) {
        setEnabled(Boolean(connector.enabled));
        setPageId(String(connector.page_id || ""));
      }

      setStreamRows(Array.isArray(commentsPayload.rows) ? commentsPayload.rows : []);
      setDistribution(commentsPayload.distribution || {});
    } catch (err) {
      setError(String(err?.message || "Unable to load social data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnectorAndStream();
  }, [platform]);

  const saveConnector = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = await saveSocialConnector({
        platform,
        page_id: pageId,
        access_token: accessToken,
        verify_token: verifyToken,
        enabled,
      });
      setSuccess(locale === "ar" ? "تم حفظ إعدادات الربط." : locale === "fr" ? "Configuration enregistree." : "Connector settings saved.");
      if (payload?.connector?.webhook_url) {
        // Keep the workflow smooth by clearing secrets after save.
        setAccessToken("");
        setVerifyToken("");
      }
    } catch (err) {
      setError(String(err?.message || "Unable to save connector"));
    } finally {
      setSaving(false);
    }
  };

  const ingestManual = async () => {
    const lines = manualComments
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (!lines.length) {
      setError(locale === "ar" ? "أدخل تعليقًا واحدًا على الأقل." : locale === "fr" ? "Ajoutez au moins un commentaire." : "Add at least one comment.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await ingestSocialComments({
        platform,
        page_id: pageId,
        source: "dashboard_manual",
        comments: lines.map((text) => ({ text })),
      });
      setManualComments("");
      await loadConnectorAndStream();
      setSuccess(locale === "ar" ? "تم إدخال التعليقات وتصنيفها." : locale === "fr" ? "Commentaires ingestes et classes." : "Comments ingested and classified.");
    } catch (err) {
      setError(String(err?.message || "Unable to ingest comments"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title={t("social.title")} subtitle={t("social.subtitle")} currentPath={currentPath} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <Card className="p-5 xl:col-span-2" delay={0}>
          <h3 className="font-semibold text-navy mb-3">{t("social.connectors")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">
              {t("social.platform")}
              <SelectMenu className="mt-2" value={platform} onChange={setPlatform} options={platformOptions} rtl={isRTL} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {t("social.pageId")}
              <input
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className={`mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none ${isRTL ? "text-right" : ""}`}
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {t("social.accessToken")}
              <input
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              {t("social.verifyToken")}
              <input
                value={verifyToken}
                onChange={(e) => setVerifyToken(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              {t("social.enabled")}
            </label>
            <button
              onClick={saveConnector}
              disabled={saving}
              className="rounded-xl bg-electric text-white px-4 py-2 font-semibold hover:bg-red-700 disabled:opacity-70"
            >
              {t("social.save")}
            </button>
            <span className="text-xs text-slate-500">{t("social.webhook")}: /api/social/webhook/{platform}</span>
          </div>
        </Card>

        <Card className="p-5" delay={60}>
          <h3 className="font-semibold text-navy mb-3">{t("social.distribution")}</h3>
          <div className="space-y-2">
            {SENTIMENT_ORDER.map((cls) => (
              <div key={cls} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{getSentimentLabel(cls, locale)}</span>
                <span className="font-semibold text-navy">{Number(distribution?.[cls] || 0)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <a href="/api/social/export.csv" className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">{t("social.exportCsv")}</a>
            <a href="/api/social/export.xlsx" className="rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">{t("social.exportXlsx")}</a>
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-4" delay={90}>
        <h3 className="font-semibold text-navy mb-2">{t("social.manual")}</h3>
        <textarea
          value={manualComments}
          onChange={(e) => setManualComments(e.target.value)}
          rows={4}
          className={`mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white focus:ring-2 focus:ring-red-200 focus:outline-none ${isRTL ? "text-right" : ""}`}
          placeholder={t("social.manualPlaceholder")}
        />
        <div className="mt-3 flex gap-2">
          <button onClick={ingestManual} disabled={saving} className="rounded-xl bg-navy text-white px-4 py-2 font-semibold hover:bg-rose-900 disabled:opacity-70">
            {t("social.ingest")}
          </button>
          <button onClick={loadConnectorAndStream} disabled={loading} className="rounded-xl bg-slate-100 text-slate-700 px-4 py-2 font-semibold hover:bg-slate-200 disabled:opacity-70">
            {t("social.load")}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}
        {success && <p className="mt-3 text-sm text-emerald-700">{success}</p>}
      </Card>

      <Card className="p-5" delay={120}>
        <h3 className="font-semibold text-navy mb-3">{t("social.stream")}</h3>
        {streamRows.length ? (
          <div className="overflow-auto max-h-[420px] rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Platform</th>
                  <th className="text-left px-3 py-2">Comment</th>
                  <th className="text-left px-3 py-2">Class</th>
                  <th className="text-left px-3 py-2">Confidence</th>
                  <th className="text-left px-3 py-2">Ingested</th>
                </tr>
              </thead>
              <tbody>
                {streamRows.slice(0, 200).map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 capitalize">{row.platform}</td>
                    <td className="px-3 py-2 max-w-[520px] truncate text-slate-700">{row.text}</td>
                    <td className="px-3 py-2 font-semibold text-navy">{getSentimentLabel(row.predicted_class, locale)}</td>
                    <td className="px-3 py-2 text-slate-600">{(Number(row.confidence || 0) * 100).toFixed(1)}%</td>
                    <td className="px-3 py-2 text-slate-500">{row.ingested_at || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t("social.noRows")}</p>
        )}
      </Card>
    </div>
  );
}

function RestApiPage({ currentPath }) {
  const { t } = useI18n();
  const endpointDefs = [
    {
      id: "health-get",
      method: "GET",
      path: "/api/health",
      summary: "Service heartbeat and dataset path",
      sampleBody: "",
    },
    {
      id: "status-get",
      method: "GET",
      path: "/api/model/status",
      summary: "Model readiness and active artifact path",
      sampleBody: "",
    },
    {
      id: "predict-post",
      method: "POST",
      path: "/api/model/predict",
      summary: "Batch sentiment prediction",
      sampleBody: JSON.stringify(
        {
          comments: ["ramy bnin bzf", "ramy machi bnin ?"],
          include_xai: false,
        },
        null,
        2
      ),
    },
    {
      id: "predict-file-post",
      method: "POST",
      path: "/api/model/predict-file",
      summary: "CSV/Excel batch sentiment (multipart/form-data)",
      sampleBody: JSON.stringify(
        {
          file: "<binary>",
          text_column: "text",
          output_format: "json",
        },
        null,
        2
      ),
    },
    {
      id: "social-ingest-post",
      method: "POST",
      path: "/api/social/ingest",
      summary: "Ingest social comments and classify in real time",
      sampleBody: JSON.stringify(
        {
          platform: "facebook",
          page_id: "123456",
          source: "manual_test",
          comments: [
            { text: "ramy bnin bzf" },
            { text: "machi bnin" },
          ],
        },
        null,
        2
      ),
    },
    {
      id: "social-comments-get",
      method: "GET",
      path: "/api/social/comments?limit=20",
      summary: "Read tracked classified social stream",
      sampleBody: "",
    },
    {
      id: "overview-get",
      method: "GET",
      path: "/api/overview",
      summary: "Aggregated KPI distribution",
      sampleBody: "",
    },
    {
      id: "reviews-get",
      method: "GET",
      path: "/api/reviews?page=1&page_size=10",
      summary: "Paginated raw review rows",
      sampleBody: "",
    },
  ];

  const [selectedId, setSelectedId] = useState(endpointDefs[0].id);
  const [requestBody, setRequestBody] = useState(endpointDefs[0].sampleBody);
  const [responseStatus, setResponseStatus] = useState("");
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedEndpoint = useMemo(
    () => endpointDefs.find((e) => e.id === selectedId) || endpointDefs[0],
    [selectedId]
  );

  useEffect(() => {
    setRequestBody(selectedEndpoint.sampleBody || "");
    setResponseStatus("");
    setResponseText("");
    setErrorMessage("");
  }, [selectedEndpoint]);

  const runRequest = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      if (selectedEndpoint.path === "/api/model/predict-file") {
        throw new Error("Use Live Demo file uploader for /api/model/predict-file because it requires multipart/form-data.");
      }

      const options = { method: selectedEndpoint.method };
      if (selectedEndpoint.method !== "GET") {
        let parsedBody = {};
        if (requestBody.trim()) {
          try {
            parsedBody = JSON.parse(requestBody);
          } catch (error) {
            throw new Error(`Invalid JSON body: ${error.message}`);
          }
        }
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(parsedBody);
      }

      const response = await fetchFromApi(selectedEndpoint.path, options);
      const text = await response.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch (_) {
        // Keep text response as-is if not JSON.
      }

      setResponseStatus(`${response.status} ${response.statusText}`);
      setResponseText(pretty);
      if (!response.ok) {
        setErrorMessage("Request returned an error status. Check response details below.");
      }
    } catch (error) {
      setResponseStatus("Request failed");
      setResponseText("");
      setErrorMessage(error.message || "Unknown request failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t("rest.title")}
        subtitle={t("rest.subtitle")}
        currentPath={currentPath}
      />

      <Card className="p-5 mb-4" delay={0}>
        <h3 className="font-semibold text-navy mb-3">{t("rest.available")}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {endpointDefs.map((ep) => {
            const active = ep.id === selectedId;
            return (
              <button
                key={ep.id}
                onClick={() => setSelectedId(ep.id)}
                className={`text-left rounded-xl border px-4 py-3 transition-all ${
                  active
                    ? "border-red-300 bg-red-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-800">{ep.path}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      ep.method === "GET"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ep.method}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{ep.summary}</p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5" delay={80}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700">
            {selectedEndpoint.method}
          </span>
          <code className="text-sm text-navy bg-red-50 border border-red-100 px-3 py-1 rounded-lg">
            {selectedEndpoint.path}
          </code>
        </div>

        {selectedEndpoint.method !== "GET" && (
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700">{t("rest.requestBody")}</label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={8}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 bg-white font-mono text-sm focus:ring-2 focus:ring-red-200 focus:outline-none"
            />
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={runRequest}
            disabled={loading}
            className="rounded-xl bg-electric text-white px-4 py-2 font-semibold hover:bg-red-700 disabled:opacity-70"
          >
            {loading ? t("common.calling") : t("common.runRequest")}
          </button>
          {responseStatus && (
            <span className="text-sm rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-slate-700">
              {responseStatus}
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        )}

        <label className="text-sm font-medium text-slate-700">{t("common.response")}</label>
        <pre className="mt-2 rounded-xl border border-slate-200 bg-slate-950 text-slate-100 p-4 overflow-auto text-xs leading-6 min-h-[200px]">
{responseText || "Run a request to view response payload here."}
        </pre>
      </Card>
    </div>
  );
}

function ReportPage({ currentPath }) {
  return (
    <div className="print-report">
      <PageHeader
        title="Report"
        subtitle="Ramy Sentiment Intelligence — Technical Report"
        currentPath={currentPath}
      />

      <div className="no-print mb-4">
        <button
          onClick={() => window.print()}
          className="rounded-xl bg-electric text-white px-4 py-2 font-semibold hover:bg-red-700"
        >
          Export as PDF
        </button>
      </div>

      <Card className="p-6 md:p-8 space-y-8" delay={0}>
        <header>
          <h2 className="text-3xl font-extrabold text-navy">Ramy Sentiment Intelligence — Technical Report</h2>
          <p className="text-slate-600 mt-2">AI EXPO 2026 | Industry Track | April 2026</p>
        </header>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">Abstract</h3>
          <p className="text-slate-700 leading-8">
            This report presents an end-to-end sentiment intelligence system designed for Ramy, an Algerian beverage
            brand operating in a linguistically complex digital environment. The proposed pipeline addresses highly
            code-switched feedback streams that combine Darja, Arabic, and French in short, noisy user-generated text.
            Unlike benchmark-centered submissions, this work prioritizes deployment realism through real data sourcing,
            robust preprocessing, semi-supervised adaptation, calibrated decision logic, and product-taxonomy-aligned
            business reporting.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            On a strictly held-out test set (leakage-free evaluation), the system achieves 95.06% accuracy and
            macro-F1 = 0.9437 with stable per-class behavior across positive, negative, neutral, improvement, and
            question classes. An Attention-based XAI module provides token-level attribution for transparent predictions.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">Keywords</h3>
          <p className="text-slate-700 leading-8">
            Arabic NLP, Darja sentiment analysis, code-switching, AraBERT, semi-supervised learning, pseudo-labeling,
            test-time augmentation, threshold calibration, macro-F1, customer intelligence.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">1. Problem Statement</h3>
          <p className="text-slate-700 leading-8">
            Ramy, one of Algeria's leading beverage manufacturers, receives thousands of customer touchpoints monthly
            across social media, review platforms, and direct feedback channels. These messages are written in a highly
            complex linguistic environment: a spontaneous mix of Algerian Darja (dialect), Modern Standard Arabic,
            and French, often within a single sentence. Traditional rule-based or lexicon approaches completely fail
            in this setting.
          </p>
          <p className="text-slate-700 leading-8 mt-3">
            The core challenge: extract actionable, class-balanced sentiment signals at scale, reliably, across five
            business-relevant categories, without falling into the common trap of building a system that works in the
            lab but collapses on real-world noisy text.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">2. Data Collection — Real, Not Synthetic</h3>
          <p className="text-slate-700 leading-8">
            All data used in this project is real. It was collected through two complementary channels.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            1) Manual Collection and Labeling: A team manually gathered customer feedback from public Algerian social
            media pages, comment sections, and consumer review threads related to Ramy products. Each example was
            human-labeled by native Darja/Arabic/French speakers to ensure cultural and linguistic accuracy. This is
            critical because automated translation tools cannot handle Algerian Darja reliably, so human judgment was
            non-negotiable at this stage.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            2) Web Scraping Pipeline: A custom scraping pipeline was developed to systematically extract publicly
            available consumer feedback at scale. The pipeline included deduplication, language detection filtering,
            and noise removal to ensure only relevant, high-quality samples entered the labeling queue.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Why this matters: many competition projects use translated or synthetic datasets. Our data reflects the
            actual linguistic reality of Algerian consumers, including code-switching, slang, abbreviations, and
            emoji-mixed text, making this system genuinely deployable in production.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Final dataset: 7,500 training samples, fully balanced across 5 classes (1,500 per class), and 405 real
            validation samples with naturally mildly imbalanced distribution matching production class frequencies.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">2.1 Data Governance and Label Quality Protocol</h3>
          <p className="text-slate-700 leading-8">
            To ensure labeling reliability, we applied a protocol with three controls: (1) source-level traceability,
            (2) annotation consistency checks on ambiguous expressions, and (3) periodic spot-review for guideline
            drift. Cases involving sarcasm, mixed sentiment, or dialect-specific idioms were escalated to joint review
            before final class assignment. This reduced annotation noise in classes with subtle intent boundaries,
            especially neutral versus improvement.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Privacy handling remained restricted to publicly available text, with no attempt to infer sensitive user
            identity attributes. The resulting dataset is suitable for sentiment modeling while preserving responsible
            data-use boundaries.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">3. Methodology — Why Every Choice Was Deliberate</h3>
          <p className="text-slate-700 leading-8">
            3.1 Backbone Model: AraBERT (aubmindlab/bert-base-arabertv02). We chose AraBERT specifically because it
            is pre-trained on large Arabic corpora including dialectal text. Unlike multilingual BERT, AraBERT has
            deeper morphological understanding of Arabic root-pattern structures, which is a stronger starting point
            for mixed-language Algerian text.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            3.2 Few-Shot Style Lexical Augmentation. Because classes like question and improvement are naturally rare,
            we implemented few-shot-inspired augmentation with synonym substitution, back-translation anchoring, and
            template-guided paraphrasing from manually verified seed examples. Unlike naive oversampling, this creates
            diverse surface forms while preserving semantic intent.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            3.3 Self-Training with Pseudo-Label Inference (Self-Inference Loop). After initial fine-tuning on labeled
            data, we ran the model over a large unlabeled pool from real Ramy feedback. High-confidence predictions
            above calibrated confidence thresholds were converted into pseudo-labels and added to training. The model
            was then retrained on this expanded set.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Why this works here: the unlabeled pool was drawn from the same real-world distribution as validation,
            so the self-training loop effectively closes train-to-deployment domain gap while scaling learning without
            proportional manual labeling cost.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            3.4 Test-Time Augmentation (TTA) for Inference Stability. At inference time, each input is passed through
            multiple slight augmentation variants and logits are averaged. This reduces variance on noisy short texts,
            especially one-line reactions and emoji-heavy comments.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Why TTA is underused and why we used it: many NLP pipelines skip TTA due to latency cost. We apply it
            selectively on low-confidence samples, improving stability without harming throughput.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            3.5 Per-Class Threshold Optimization. Standard classifiers use a 0.5 threshold for all classes. We treated
            each class threshold as a hyperparameter and optimized on validation to maximize per-class F1, especially
            for high-value lower-frequency classes like improvement.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            3.6 Macro-F1 as the North Star Metric. We deliberately rejected raw accuracy as primary metric because
            validation imbalance can hide poor minority-class performance. Macro-F1 gives each class equal weight,
            directly aligning model optimization with business relevance.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">3.7 Implementation Details</h3>
          <p className="text-slate-700 leading-8">
            The training stack uses transformer fine-tuning with validation-driven checkpointing and calibrated
            post-processing. Data ingestion supports semicolon-structured files and mixed-language normalization.
            Inference is served through an API-compatible backend and connected to a multi-page analytical frontend for
            operational visibility. The serving design supports batch comment scoring and aggregate class distribution
            reporting in near-real-time scenarios.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Runtime controls include truncation-safe tokenization and deterministic output formatting for downstream
            dashboard components. This allows stable integration between experimentation artifacts and production UI.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">4. Results</h3>
          <p className="text-slate-700 leading-8">
            The fine-tuned pipeline achieves macro-F1 of 0.924 on the validation set, with consistent per-class F1
            performance across all five categories. This is not a single lucky run; it reflects the stability gained
            by combining self-training, TTA, and threshold calibration.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Beyond core classification metrics, the system maps predictions to Ramy product taxonomy. This enables
            category-level business insight generation, including identifying Boisson aux fruits as highest feedback
            volume and surfacing subcategory coverage gaps for targeted future collection.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">4.1 Error Pattern Analysis</h3>
          <p className="text-slate-700 leading-8">
            The residual confusion is concentrated around semantically adjacent classes, particularly neutral versus
            improvement, where pragmatic intent can be weakly expressed in short texts. Question detection remains
            comparatively robust due strong interrogative cues in both Arabic and Latin script forms. Misclassifications
            increase when comments combine colloquial abbreviations with implicit sentiment and no explicit product
            context.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            These findings justify continued emphasis on context-preserving augmentation and targeted threshold tuning
            rather than sole reliance on larger model size.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">4.2 Business Impact Interpretation</h3>
          <p className="text-slate-700 leading-8">
            From a commercial perspective, calibrated sentiment detection supports prioritization workflows: negative
            clusters can trigger quality escalation, improvement comments can feed product roadmap loops, and question
            intents can inform support-content optimization. Category-level taxonomy mapping provides operational
            granularity, enabling managers to localize issues by product line rather than relying on aggregate brand
            sentiment alone.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">5. Why This Approach Stands Out</h3>
          <ul className="text-slate-700 leading-8 list-disc pl-5 space-y-1">
            <li>Data is real, not benchmark, and reflects authentic Algerian consumer language.</li>
            <li>Domain gap is closed through self-training on unlabeled real-world feedback.</li>
            <li>Low-data classes are improved with principled augmentation, not random oversampling.</li>
            <li>TTA is used to stabilize noisy short social-media text predictions.</li>
            <li>Thresholds are optimized per-class to align behavior with business priorities.</li>
            <li>Model outputs are connected to Ramy product taxonomy for actionable reporting.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">6. Operational Deployment Notes</h3>
          <p className="text-slate-700 leading-8">
            The solution is delivered as an integrated application with a model-serving backend and a professional
            multi-page frontend. This architecture allows technical and business stakeholders to share a single source
            of truth: engineers can inspect model behavior and data slices, while business users consume KPI-level
            insight and export-ready reporting views.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Practical deployment readiness is reinforced by structured APIs, robust error signaling, and report export
            support. The in-app report allows reproducible communication of methodology and outcomes for governance and
            executive decision review.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">7. Limitations and Future Work</h3>
          <p className="text-slate-700 leading-8">
            Current limitations include sensitivity to very short context-poor comments and residual ambiguity in
            nuanced intent boundaries. Future iterations should incorporate temporal drift monitoring, active-learning
            loops for difficult examples, and periodic re-calibration under campaign-specific language shifts.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            Additional gains are expected from richer multilingual normalization dictionaries and weakly supervised
            topic-sentiment coupling to better separate product suggestions from neutral informational remarks.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-navy mb-3">8. Conclusion</h3>
          <p className="text-slate-700 leading-8">
            Ramy Sentiment Intelligence demonstrates that responsible real-world AI deployment requires thinking beyond
            benchmark accuracy. By combining rigorous data collection, linguistically-aware modeling, semi-supervised
            self-training, and business-layer integration, this project delivers a pipeline Ramy can use today to
            turn customer voice into strategic decisions.
          </p>
          <p className="text-slate-700 leading-8 mt-2">
            The resulting system is not only technically competitive but also organizationally useful: it translates
            customer language complexity into measurable and actionable intelligence for product, marketing, and
            quality teams in a real Algerian market context.
          </p>
        </section>
      </Card>
    </div>
  );
}

function Sidebar({ open, setOpen, currentPath, isRTL, topbarHeight }) {
  const { t } = useI18n();
  const motionClass = isRTL
    ? (open ? "translate-x-0" : "translate-x-full lg:translate-x-0")
    : (open ? "translate-x-0" : "-translate-x-full lg:translate-x-0");

  return (
    <aside
      className={`no-print sidebar-shell fixed ${isRTL ? "right-0" : "left-0"} z-40 w-72 text-slate-100 p-4 transform transition-transform duration-300 ${motionClass}`}
      style={{ top: `${topbarHeight}px`, height: `calc(100vh - ${topbarHeight}px)` }}
    >
      <div className={`flex items-center gap-3 border-b border-rose-100/30 pb-4 mb-4 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
        <BrandLogo className="h-12 w-24 rounded-xl object-contain border border-white/70 bg-white px-1.5 shadow-lg shadow-rose-950/25" alt="Ramy Logo" />
        <div>
          <p className="font-bold text-sm">{t("app.name")}</p>
          <p className="text-xs text-rose-100">{t("sidebar.enterprise")}</p>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-rose-100/35 bg-rose-950/25 px-3 py-3">
        <p className={`text-[11px] uppercase tracking-[0.14em] text-rose-100 ${isRTL ? "text-right" : ""}`}>{t("sidebar.systemStatus")}</p>
        <div className={`mt-1 flex items-center gap-2 text-sm text-rose-50 ${isRTL ? "flex-row-reverse justify-end" : ""}`}>
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>{t("sidebar.modelOnline")}</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {sidebarSignals.map((signal) => (
            <div key={signal.labelKey} className="rounded-xl border border-rose-100/25 bg-white/5 px-2 py-2">
              <p className="text-[10px] text-rose-100/85 leading-tight">{t(signal.labelKey)}</p>
              <p className="text-xs font-semibold text-white mt-1">{signal.value}</p>
            </div>
          ))}
        </div>
      </div>

      <p className={`text-[11px] uppercase tracking-[0.14em] text-rose-100 mb-2 ${isRTL ? "text-right" : ""}`}>{t("sidebar.navigation")}</p>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.to;
          return (
            <a
              key={item.to}
              href={`#${item.to}`}
              onClick={() => setOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${isRTL ? "flex-row-reverse text-right" : ""} ${
                isActive
                  ? "bg-white text-[#9f1626] shadow-lg shadow-rose-950/35 ring-1 ring-rose-100/40"
                  : "text-rose-100 hover:bg-rose-900/35 hover:text-white hover:translate-x-0.5"
              }`}
            >
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-white/15" : "bg-white/5 group-hover:bg-white/10"}`}>
                <Icon size={16} />
              </span>
              <span className="flex-1">{t(item.labelKey)}</span>
              <span className={`h-2 w-2 rounded-full transition-opacity ${isActive ? "bg-[#9f1626] opacity-100" : "bg-rose-100/70 opacity-0 group-hover:opacity-100"}`} />
            </a>
          );
        })}
      </nav>

      <div className={`mt-4 rounded-2xl border border-rose-100/25 bg-white/5 p-3 ${isRTL ? "text-right" : ""}`}>
        <p className="text-xs text-rose-100/90">{t("sidebar.uxNote")}</p>
        <p className="text-xs text-rose-50 mt-1 leading-5">
          {t("sidebar.uxBody")}
        </p>
      </div>

      <div className={`mt-4 rounded-2xl border border-rose-100/30 bg-gradient-to-r from-white/10 to-white/5 px-3 py-2 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
        <div>
          <p className="text-xs text-rose-100/90">{t("sidebar.productTeam")}</p>
          <p className="text-sm font-semibold text-white">Ramy Intelligence Lab</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold">ON</span>
      </div>
    </aside>
  );
}

function AppLayout() {
  const [locale, setLocale] = useState(() => window.localStorage.getItem("ramy-locale") || "ar");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const path = useHashPath();
  const validPaths = useMemo(() => new Set(navItems.map((i) => i.to)), []);
  const currentPath = validPaths.has(path) ? path : "/";
  const isRTL = locale === "ar";

  const t = useMemo(() => {
    return (key) => I18N[locale]?.[key] || I18N.en[key] || key;
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    window.localStorage.setItem("ramy-locale", locale);
  }, [locale, isRTL]);

  const currentPage = useMemo(() => {
    if (currentPath === "/data-explorer") return <DataExplorerPage currentPath={currentPath} />;
    if (currentPath === "/model-insights") return <ModelInsightsPage currentPath={currentPath} />;
    if (currentPath === "/methodology") return <MethodologyPage currentPath={currentPath} />;
    if (currentPath === "/live-demo") return <LiveDemoPage currentPath={currentPath} />;
    if (currentPath === "/social-ops") return <SocialOpsPage currentPath={currentPath} />;
    if (currentPath === "/rest-api") return <RestApiPage currentPath={currentPath} />;
    if (currentPath === "/report") return <ReportPage currentPath={currentPath} />;
    return <OverviewPage currentPath={currentPath} />;
  }, [currentPath]);

  const i18nValue = useMemo(
    () => ({ locale, setLocale, isRTL, t }),
    [locale, isRTL, t]
  );

  const localeOptions = useMemo(
    () => [
      { value: "ar", label: "العربية" },
      { value: "fr", label: "Francais" },
      { value: "en", label: "English" },
    ],
    []
  );

  return (
    <I18nContext.Provider value={i18nValue}>
    <div className={`min-h-screen bg-rose-50 overflow-x-hidden ${isRTL ? "rtl-ui" : ""}`}>
      <div className="no-print topbar-shell fixed inset-x-0 top-0 z-30 h-[76px] w-full overflow-visible border-b border-rose-200/40 px-4 flex items-center justify-between">
        <button className="lg:hidden text-white" onClick={() => setSidebarOpen((v) => !v)}>
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`flex items-center gap-3 min-w-0 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
          <BrandLogo alt="Ramy" className="hidden sm:block h-9 w-24 rounded-lg border border-white/70 bg-white px-1.5 object-contain" />
          <div className="min-w-0">
          <p className="text-sm md:text-base font-semibold text-white tracking-tight">{t("app.name")}</p>
          <p className="text-xs text-rose-100/90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[60vw] md:max-w-none">{t("app.subtitle")}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <label className="text-xs text-rose-100/90 hidden sm:inline">{t("common.language")}</label>
          <SelectMenu
            compact
            dark
            rtl={isRTL}
            value={locale}
            onChange={setLocale}
            options={localeOptions}
          />
          <span className="hidden md:inline-flex rounded-full border border-rose-100/30 bg-white/15 px-3 py-1 text-xs font-semibold text-white">
            {t("release.badge")}
          </span>
        </div>
      </div>

      <div className="flex" style={{ paddingTop: `${TOPBAR_HEIGHT}px` }}>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} currentPath={currentPath} isRTL={isRTL} topbarHeight={TOPBAR_HEIGHT} />
        <main className={`app-main-shell flex-1 p-4 md:p-6 lg:pl-8 lg:pr-8 ${isRTL ? "lg:mr-72" : "lg:ml-72"}`}>
          <div className="page-frame w-full">{currentPage}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div className="no-print fixed inset-0 bg-slate-950/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
    </I18nContext.Provider>
  );
}

function App() {
  return <AppLayout />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
