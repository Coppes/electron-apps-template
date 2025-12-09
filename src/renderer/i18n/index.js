import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import enSettings from './locales/en/settings.json';
import enErrors from './locales/en/errors.json';
import enOnboarding from './locales/en/onboarding.json';

import ptCommon from './locales/pt-BR/common.json';
import ptSettings from './locales/pt-BR/settings.json';
import ptErrors from './locales/pt-BR/errors.json';
import ptOnboarding from './locales/pt-BR/onboarding.json';

// Configuration for i18next
const resources = {
  en: {
    common: enCommon,
    settings: enSettings,
    errors: enErrors,
    onboarding: enOnboarding,
  },
  'pt-BR': {
    common: ptCommon,
    settings: ptSettings,
    errors: ptErrors,
    onboarding: ptOnboarding,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    ns: ['common', 'settings', 'errors', 'onboarding'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Avoid suspense for now
    },
  });

export default i18n;
