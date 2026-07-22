import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle language"
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium uppercase">{i18n.language === 'ar' ? 'EN' : 'AR'}</span>
    </button>
  );
};
