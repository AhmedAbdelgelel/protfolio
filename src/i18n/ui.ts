/**
 * One dictionary per language. Add a language by adding an entry here, a content
 * file (about.<lang>.md, work/<lang>/<slug>.md) and letting the routes pick it up.
 *
 * The Arabic here is written as Arabic, not as English in Arabic letters: same
 * meaning, same dry voice, natural sentence order.
 */
export const locales = ['en', 'ar'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

export const localesInfo = {
  en: { label: 'English', htmlLang: 'en', dir: 'ltr' as const },
  ar: { label: 'العربية', htmlLang: 'ar', dir: 'rtl' as const }
} satisfies Record<Lang, { label: string; htmlLang: string; dir: 'ltr' | 'rtl' }>;

const en = {
  personName: 'Ahmed Abdelgelel',
  jobTitle: 'Forward-Deployed Software Engineer — Agentic AI & Backend Systems',
  navWork: 'Work',
  navAbout: 'About',
  navContact: 'Contact',
  navGithub: 'GitHub',
  otherLanguage: 'العربية',
  otherLanguageShort: 'AR',
  themeLabel: 'Colour theme',
  themeSystem: 'Follow the system',
  themeLight: 'Light',
  themeDark: 'Dark',
  homeTitle: 'Ahmed Abdelgelel — Forward-Deployed & Agentic Systems Engineer',
  homeDescription:
    'Software engineer in Cairo owning the whole problem from discovery through deployment — building production backends, MCP servers, tool-calling agents, evals, and policy-gated LLM gateways.',
  homeIntro:
    'Software engineer in Cairo who owns the whole problem, not just the ticket — entering client workflows, building production backends and agentic AI systems, and staying until they run without me.',
  homeMore: 'More about me',
  aboutHeading: 'About',
  aboutTitle: 'Ahmed Abdelgelel',
  aboutDescription:
    'Software engineer in Cairo who turns real workflows into simple, reliable products, with clear communication and ownership from discovery through deployment.',
  onThisPage: 'On this page',
  playFlow: 'Play the flow',
  pauseFlow: 'Pause',
  contact: 'Contact',
  email: 'Email',
  resume: 'Résumé'
} as const;

const ar = {
  personName: 'أحمد عبد الجليل',
  jobTitle: 'مهندس برمجيات وهندسة ميدانية — أنظمة الوكلاء والباك إند',
  navWork: 'أعمالي',
  navAbout: 'عني',
  navContact: 'تواصل',
  navGithub: 'GitHub',
  otherLanguage: 'English',
  otherLanguageShort: 'EN',
  themeLabel: 'المظهر',
  themeSystem: 'حسب النظام',
  themeLight: 'فاتح',
  themeDark: 'غامق',
  homeTitle: 'أحمد عبد الجليل — مهندس أنظمة وكلاء ذكاء اصطناعي وهندسة ميدانية',
  homeDescription:
    'مهندس برمجيات في القاهرة أتولى المشكلة كاملة من الفهم حتى النشر — أبني أنظمة باك إند، وخوادم MCP، ووكلاء استدعاء الأدوات، والتقييمات، وبوابات النماذج المحكومة بالسياسات.',
  homeIntro:
    'مهندس برمجيات في القاهرة أتولى المشكلة كاملة لا المهمة المكتوبة في التذكرة فقط — أدخل سير عمل العميل، أبني أنظمة الباك إند ووكلاء الذكاء الاصطناعي للإنتاج، وأبقى معها إلى أن تعمل من دوني.',
  homeMore: 'المزيد عني',
  aboutHeading: 'نبذة عني',
  aboutTitle: 'أحمد عبد الجليل',
  aboutDescription:
    'مهندس برمجيات في القاهرة أحوّل سير العمل الحقيقي إلى منتجات بسيطة وموثوقة، بتواصل واضح ومسؤولية من الاكتشاف حتى النشر.',
  onThisPage: 'في هذه الصفحة',
  playFlow: 'شغّل المسار',
  pauseFlow: 'إيقاف',
  contact: 'تواصل',
  email: 'البريد',
  resume: 'السيرة الذاتية'
} as const;

/** The shape of a dictionary, widened so every language can hold its own words. */
export type Dict = { readonly [K in keyof typeof en]: string };
export const ui: Record<Lang, Dict> = { en, ar };
export const dict = (lang: Lang): Dict => ui[lang] ?? ui[defaultLang];

export const isLang = (value: string): value is Lang => (locales as readonly string[]).includes(value);

/** '/' for the default language, '/<lang>/x/' for the others. */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : '/' + path;
  return lang === defaultLang ? clean : '/' + lang + clean;
}

/** Drop a leading /<lang> so paths can be mapped between locales. */
export function stripLocale(pathname: string): string {
  const match = pathname.match(new RegExp('^/(' + locales.join('|') + ')(/.*)?$'));
  if (!match) return pathname === '' ? '/' : pathname;
  return match[2] || '/';
}

/** Which locale a path belongs to. */
export function localeFromPath(pathname: string): Lang {
  const match = pathname.match(new RegExp('^/(' + locales.join('|') + ')(/|$)'));
  const found = match?.[1];
  return found && isLang(found) ? found : defaultLang;
}
