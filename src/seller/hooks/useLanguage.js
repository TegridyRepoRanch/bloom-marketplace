import { useState } from 'react';
import { translations } from '../lib/translations';

// =============================================
// LANGUAGE HOOK
// =============================================
export const useLanguage = () => {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('siamclones_lang') || 'en'; } catch { return 'en'; }
  });
  const t = (key, vars) => {
    let str = translations[lang]?.[key] || translations.en[key] || key;
    if (vars) Object.keys(vars).forEach(k => { str = str.replace(`{${k}}`, vars[k]); });
    return str;
  };
  const toggleLang = () => {
    const next = lang === 'en' ? 'th' : 'en';
    setLang(next);
    try { localStorage.setItem('siamclones_lang', next); } catch {}
  };
  return { lang, t, toggleLang };
};
