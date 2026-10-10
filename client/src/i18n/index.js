import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import enPages from './locales/en.pages.json';
import enCatalog from './locales/en.catalog.json';
import enStudent from './locales/en.student.json';
import enAccount from './locales/en.account.json';
import enReader from './locales/en.reader.json';
import enPanels from './locales/en.panels.json';
import enTeacher from './locales/en.teacher.json';
import enTeacher2 from './locales/en.teacher2.json';
import enShared from './locales/en.shared.json';
import enAdmin from './locales/en.admin.json';
import enAdminCourses from './locales/en.adminCourses.json';
import bn from './locales/bn.json';
import bnPages from './locales/bn.pages.json';
import bnCatalog from './locales/bn.catalog.json';
import bnStudent from './locales/bn.student.json';
import bnAccount from './locales/bn.account.json';
import bnReader from './locales/bn.reader.json';
import bnPanels from './locales/bn.panels.json';
import bnTeacher from './locales/bn.teacher.json';
import bnTeacher2 from './locales/bn.teacher2.json';
import bnShared from './locales/bn.shared.json';
import bnAdmin from './locales/bn.admin.json';
import bnAdminCourses from './locales/bn.adminCourses.json';
import ja from './locales/ja.json';
import jaPages from './locales/ja.pages.json';
import jaCatalog from './locales/ja.catalog.json';
import jaStudent from './locales/ja.student.json';
import jaAccount from './locales/ja.account.json';
import jaReader from './locales/ja.reader.json';
import jaPanels from './locales/ja.panels.json';
import jaTeacher from './locales/ja.teacher.json';
import jaTeacher2 from './locales/ja.teacher2.json';
import jaShared from './locales/ja.shared.json';
import jaAdmin from './locales/ja.admin.json';
import jaAdminCourses from './locales/ja.adminCourses.json';
import zh from './locales/zh.json';
import zhPages from './locales/zh.pages.json';
import zhCatalog from './locales/zh.catalog.json';
import zhStudent from './locales/zh.student.json';
import zhAccount from './locales/zh.account.json';
import zhReader from './locales/zh.reader.json';
import zhPanels from './locales/zh.panels.json';
import zhTeacher from './locales/zh.teacher.json';
import zhTeacher2 from './locales/zh.teacher2.json';
import zhShared from './locales/zh.shared.json';
import zhAdmin from './locales/zh.admin.json';
import zhAdminCourses from './locales/zh.adminCourses.json';
import ar from './locales/ar.json';
import arPages from './locales/ar.pages.json';
import arCatalog from './locales/ar.catalog.json';
import arStudent from './locales/ar.student.json';
import arAccount from './locales/ar.account.json';
import arReader from './locales/ar.reader.json';
import arPanels from './locales/ar.panels.json';
import arTeacher from './locales/ar.teacher.json';
import arTeacher2 from './locales/ar.teacher2.json';
import arShared from './locales/ar.shared.json';
import arAdmin from './locales/ar.admin.json';
import arAdminCourses from './locales/ar.adminCourses.json';
import hi from './locales/hi.json';
import hiPages from './locales/hi.pages.json';
import hiCatalog from './locales/hi.catalog.json';
import hiStudent from './locales/hi.student.json';
import hiAccount from './locales/hi.account.json';
import hiReader from './locales/hi.reader.json';
import hiPanels from './locales/hi.panels.json';
import hiTeacher from './locales/hi.teacher.json';
import hiTeacher2 from './locales/hi.teacher2.json';
import hiShared from './locales/hi.shared.json';
import hiAdmin from './locales/hi.admin.json';
import hiAdminCourses from './locales/hi.adminCourses.json';
import ur from './locales/ur.json';
import urPages from './locales/ur.pages.json';
import urCatalog from './locales/ur.catalog.json';
import urStudent from './locales/ur.student.json';
import urAccount from './locales/ur.account.json';
import urReader from './locales/ur.reader.json';
import urPanels from './locales/ur.panels.json';
import urTeacher from './locales/ur.teacher.json';
import urTeacher2 from './locales/ur.teacher2.json';
import urShared from './locales/ur.shared.json';
import urAdmin from './locales/ur.admin.json';
import urAdminCourses from './locales/ur.adminCourses.json';
import enCoursePrice from './locales/en.coursePrice.json';
import bnCoursePrice from './locales/bn.coursePrice.json';
import jaCoursePrice from './locales/ja.coursePrice.json';
import zhCoursePrice from './locales/zh.coursePrice.json';
import arCoursePrice from './locales/ar.coursePrice.json';
import hiCoursePrice from './locales/hi.coursePrice.json';
import urCoursePrice from './locales/ur.coursePrice.json';

// Languages shown in the switcher. dir = text direction (rtl for Arabic and Urdu).
export const LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'bn', label: 'বাংলা', dir: 'ltr' },
  { code: 'ja', label: '日本語', dir: 'ltr' },
  { code: 'zh', label: '中文', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'hi', label: 'हिन्दी', dir: 'ltr' },
  { code: 'ur', label: 'اردو', dir: 'rtl' },
];

// Each language = all its locale files (merged)
// Deep merge: two files can share a top-level key (e.g. "student"), and both must survive
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const deepMerge = (...sources) => {
  const out = {};
  for (const src of sources) {
    for (const [key, value] of Object.entries(src)) {
      out[key] = isObj(value) && isObj(out[key]) ? deepMerge(out[key], value) : value;
    }
  }
  return out;
};
const bundle = (...parts) => ({ translation: deepMerge(...parts) });

const STORAGE_KEY = 'deenlearn-lang';
const saved = localStorage.getItem(STORAGE_KEY);

i18n.use(initReactI18next).init({
  resources: {
    en: bundle(en, enPages, enCatalog, enStudent, enAccount, enReader, enPanels, enTeacher, enTeacher2, enShared, enAdmin, enAdminCourses, enCoursePrice),
    bn: bundle(bn, bnPages, bnCatalog, bnStudent, bnAccount, bnReader, bnPanels, bnTeacher, bnTeacher2, bnShared, bnAdmin, bnAdminCourses, bnCoursePrice),
    ja: bundle(ja, jaPages, jaCatalog, jaStudent, jaAccount, jaReader, jaPanels, jaTeacher, jaTeacher2, jaShared, jaAdmin, jaAdminCourses, jaCoursePrice),
    zh: bundle(zh, zhPages, zhCatalog, zhStudent, zhAccount, zhReader, zhPanels, zhTeacher, zhTeacher2, zhShared, zhAdmin, zhAdminCourses, zhCoursePrice),
    ar: bundle(ar, arPages, arCatalog, arStudent, arAccount, arReader, arPanels, arTeacher, arTeacher2, arShared, arAdmin, arAdminCourses, arCoursePrice),
    hi: bundle(hi, hiPages, hiCatalog, hiStudent, hiAccount, hiReader, hiPanels, hiTeacher, hiTeacher2, hiShared, hiAdmin, hiAdminCourses, hiCoursePrice),
    ur: bundle(ur, urPages, urCatalog, urStudent, urAccount, urReader, urPanels, urTeacher, urTeacher2, urShared, urAdmin, urAdminCourses, urCoursePrice),
  },
  lng: LANGUAGES.some((l) => l.code === saved) ? saved : 'en', // English by default
  fallbackLng: 'en', // a missing translation shows the English text
  interpolation: { escapeValue: false }, // React already escapes text
});

// Remember the choice, and set <html lang> and direction for the current language
function applyLanguage(lng) {
  const code = lng.split('-')[0];
  const info = LANGUAGES.find((l) => l.code === code);
  document.documentElement.lang = code;
  document.documentElement.dir = info?.dir ?? 'ltr';
  localStorage.setItem(STORAGE_KEY, code);
}
applyLanguage(i18n.language);
i18n.on('languageChanged', applyLanguage);

export default i18n;
