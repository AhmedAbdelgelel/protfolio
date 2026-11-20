/**
 * One dictionary per language. Add a language by adding an entry here, a content
 * file (about.<lang>.md) and letting the routes pick it up.
 */
export const locales = ['en', 'ar'] as const;
export type Lang = (typeof locales)[number];
export const defaultLang: Lang = 'en';

export const localesInfo = {
  en: { label: 'English', htmlLang: 'en', dir: 'ltr' as const },
  ar: { label: 'العربية', htmlLang: 'ar', dir: 'rtl' as const }
} satisfies Record<Lang, { label: string; htmlLang: string; dir: 'ltr' | 'rtl' }>;

const en = {
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
  homeTitle: 'Ahmed Abdelgelel — Backend engineer',
  homeDescription:
    'Backend engineer in Cairo. Node.js and TypeScript backends, LLM gateways, and agentic systems that hold up in production.',
  homeIntro:
    'Backend engineer in Cairo. I join a team, own the backend from the first sketch to production, and stay until it runs without me.',
  homeMore: 'More about me',
  aboutHeading: 'About',
  aboutTitle: 'Ahmed Abdelgelel',
  aboutDescription:
    'Backend engineer in Cairo, forward deployed on client teams: Node.js and TypeScript backends, LLM gateways, and agentic systems that hold up in production.',
  workTitle: 'Ahmed Abdelgelel — Work',
  onThisPage: 'On this page',
  contact: 'Contact',
  email: 'Email',
  resume: 'Résumé',
  caseStudyLanguageNote: '',
  repository: 'Repository'
} as const;

const ar = {
  navWork: 'الأعمال',
  navAbout: 'نبذة',
  navContact: 'تواصل',
  navGithub: 'GitHub',
  otherLanguage: 'English',
  otherLanguageShort: 'EN',
  themeLabel: 'المظهر',
  themeSystem: 'حسب النظام',
  themeLight: 'فاتح',
  themeDark: 'غامق',
  homeTitle: 'أحمد عبد الجليل — مهندس باك إند',
  homeDescription:
    'مهندس باك إند في القاهرة. أبني أنظمة خلفية بـ Node.js وTypeScript، وبوابات لمناذج اللغة، وأنظمة وكلاء تعمل في الإنتاج.',
  homeIntro:
    'مهندس باك إند في القاهرة. أنضم إلى الفريق، وأتولى الـ backend من أول رسم إلى الإنتاج، وأبقى حتى يعمل من دوني.',
  homeMore: 'المزيد عني',
  aboutHeading: 'نبذة',
  aboutTitle: 'أحمد عبد الجليل',
  aboutDescription:
    'مهندس باك إند في القاهرة، أعمل داخل فرق العملاء: أنظمة خلفية بـ Node.js وTypeScript، وبوابات لمناذج اللغة، وأنظمة وكلاء تعمل في الإنتاج.',
  workTitle: 'أحمد عبد الجليل — الأعمال',
  onThisPage: 'في هذه الصفحة',
  contact: 'تواصل',
  email: 'البريد',
  resume: 'السيرة الذاتية',
  caseStudyLanguageNote: 'دراسة الحالة مكتوبة بالإنجليزية.',
  repository: 'المستودع'
} as const;

export type Dict = typeof en;
export const ui = { en, ar } as Record<Lang, Dict>;
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