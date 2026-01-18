import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from '../translations/en.json';
import fr from '../translations/fr.json';

// Create new i18n instance
const i18n = new I18n({
  en: en,
  fr: fr,
});

// Set the locale once at the beginning of your app
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';

// When a value is missing from a language it'll fallback to another language with the key present
i18n.enableFallback = true;

// Set default locale
i18n.defaultLocale = 'en';

export default i18n;

