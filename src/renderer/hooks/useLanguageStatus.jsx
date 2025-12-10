import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStatusBar } from './useStatusBar';
import { Globe } from '@phosphor-icons/react';

/**
 * Updates the status bar with the current language.
 */
export function useLanguageStatus() {
  const { i18n } = useTranslation();
  const [currentLang, setCurrentLang] = React.useState(i18n.language);

  React.useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(lng);
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  const languageItem = React.useMemo(() => ({
    id: 'language',
    content: (
      <div className="flex items-center gap-1.5" title="Current Language">
        <Globe className="w-3 h-3" />
        <span>{currentLang?.startsWith('pt') ? 'PT-BR' : 'EN'}</span>
      </div>
    ),
    position: 'right',
    priority: 20 // Higher priority than Tabs (10) so it's to the right of tabs? Or left?
    // Standard priority logic: Higher usually means further right or left?
    // Looking at StatusBar.jsx might clarify. Usually Right side items sort by priority.
    // Let's assume lower priority = closer to edge or vice versa. 
    // Tabs is 10. Let's try 20 to see where it lands.
  }), [currentLang]);

  useStatusBar(languageItem);
}
