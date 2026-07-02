import React from 'react';
import { useLanguage } from '../../../i18n/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageSwitchProps {
  variant?: 'dark' | 'light'
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ variant = 'dark' }) => {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  const className = variant === 'light'
    ? 'flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-200'
    : 'flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/10 transition-colors text-white'

  return (
    <button
      onClick={toggleLanguage}
      className={className}
      aria-label="言語を切り替える / Switch language"
    >
      <Globe size={16} />
      <span className="text-sm font-medium tracking-wider">
        {language === 'ja' ? 'EN' : 'JA'}
      </span>
    </button>
  );
};

export default LanguageSwitch;
