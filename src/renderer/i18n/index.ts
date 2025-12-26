import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import resourcesToBackend from 'i18next-resources-to-backend';

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) =>
      import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    fallbackLng: 'en',
    ns: ['common', 'settings', 'errors', 'onboarding', 'connectivity', 'ipc', 'data_management'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: true, // Enable suspense for lazy loading
    },
  });

// Add a helper to change language that also updates the store if needed
// This is used by the App component to sync with the main process
(i18n as any).changeLanguageInternal = i18n.changeLanguage;

export default i18n;
