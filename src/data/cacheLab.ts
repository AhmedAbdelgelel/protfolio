import type { Lang } from '../i18n/ui';

/**
 * Every word the cache lab says, in one place. The component renders the labels
 * with this on the server and hands the same object to the script, so the log
 * lines speak the page's language too. Placeholders are filled with \{name\}.
 */
export interface CacheLabCopy {
  title: string;
  hint: string;
  mapTitle: string;
  lruTitle: string;
  inputLabel: string;
  placeholder: string;
  run: string;
  empty: string;
  noTtl: string;
  ttlShort: string;
  seed: string;
  setEvicted: string;
  setStored: string;
  getMiss: string;
  getExpired: string;
  getHit: string;
  ttlMissing: string;
  ttlSet: string;
  delMissing: string;
  delRemoved: string;
  sweepRemoved: string;
  sweepNothing: string;
  reset: string;
  unknown: string;
  missingKey: string;
  badSeconds: string;
  expired: string;
}

const en: CacheLabCopy = {
  title: 'Try the operations',
  hint: 'set · get · ttl · del · sweep',
  mapTitle: 'hash map',
  lruTitle: 'lru order · head to tail',
  inputLabel: 'Cache command',
  placeholder: 'set d · get a · ttl b 3 · sweep',
  run: 'run',
  empty: 'empty',
  noTtl: 'no ttl',
  ttlShort: 'ttl {seconds}s',
  seed: 'the cache is seeded with a, b, c',
  setEvicted: 'set {key}: memory full, evicted {victim} from the tail, {key} is at the head',
  setStored: 'set {key}: stored in the map and moved to the head of the list',
  getMiss: 'get {key}: miss, nothing to promote',
  getExpired: 'get {key}: expired, removed lazily on read, miss',
  getHit: 'get {key}: hit, node moved to the head',
  ttlMissing: 'ttl {key}: no such key',
  ttlSet: 'ttl {key}: expires in {seconds}s, reads will treat it as a miss',
  delMissing: 'del {key}: no such key',
  delRemoved: 'del {key}: unlinked from the list and removed from the map',
  sweepRemoved: 'sweep: removed {keys} in the background',
  sweepNothing: 'sweep: nothing expired to collect',
  reset: 'reset: back to a, b, c',
  unknown: 'commands: set <key>, get <key>, ttl <key> <seconds>, del <key>, sweep, reset',
  missingKey: 'that command needs a key — try: set d',
  badSeconds: 'ttl {key}: the seconds must be a number between 1 and 9',
  expired: '{key} reached its ttl. it is still in memory until a read or a sweep'
};

const ar: CacheLabCopy = {
  title: 'جرّب العمليات',
  hint: 'set · get · ttl · del · sweep',
  mapTitle: 'جدول التجزئة',
  lruTitle: 'ترتيب LRU · من المقدمة إلى الذيل',
  inputLabel: 'أمر على الكاش',
  placeholder: 'set d · get a · ttl b 3 · sweep',
  run: 'نفّذ',
  empty: 'فارغ',
  noTtl: 'بلا TTL',
  ttlShort: 'TTL {seconds} ث',
  seed: 'بدأ الكاش بـ a وb وc',
  setEvicted: 'set {key}: الذاكرة ممتلئة، استُبعد {victim} من الذيل و{key} صار في المقدمة',
  setStored: 'set {key}: خُزّن في الجدول ونُقل إلى مقدمة القائمة',
  getMiss: 'get {key}: فوات، لا شيء يُرقّى',
  getExpired: 'get {key}: انتهى، فحُذف بتكاسل عند القراءة، فوات',
  getHit: 'get {key}: إصابة، نُقلت العقدة إلى المقدمة',
  ttlMissing: 'ttl {key}: لا مفتاح بهذا الاسم',
  ttlSet: 'ttl {key}: ينتهي بعد {seconds} ث، والقراءة ستعدّه فواتًا',
  delMissing: 'del {key}: لا مفتاح بهذا الاسم',
  delRemoved: 'del {key}: فُصل من القائمة وحُذف من الجدول',
  sweepRemoved: 'sweep: أُزيل {keys} في الخلفية',
  sweepNothing: 'sweep: لا شيء منتهٍ ليُجمع',
  reset: 'reset: العودة إلى a وb وc',
  unknown: 'set <key> · get <key> · ttl <key> <seconds> · del <key> · sweep · reset — الأوامر المتاحة',
  missingKey: 'هذا الأمر يحتاج مفتاحًا — جرّب: set d',
  badSeconds: 'ttl {key}: المدة يجب أن تكون رقمًا بين 1 و9',
  expired: '{key} بلغ نهاية TTL. ما زال في الذاكرة إلى أن تقرأه قراءة أو يجمعه مسح'
};

export const cacheLabCopy: Record<Lang, CacheLabCopy> = { en, ar };
