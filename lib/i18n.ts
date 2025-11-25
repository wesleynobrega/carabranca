import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const ptBR = require('../app/locales/pt-BR.json');
const en = require('../app/locales/en.json');
const es = require('../app/locales/es.json');

// 1. Defina os idiomas suportados (para a tela de seleção)
export const supportedLocales = [
  { code: 'pt-BR', name: 'Português (Brasil)' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

const i18n = new I18n({
  'pt-BR': ptBR,
  'en': en,
  'es': es,
});

// Pega o idioma principal do dispositivo
const userLocale = Localization.getLocales()[0]?.languageTag;

// Define um padrão inicial
i18n.locale = userLocale || 'pt-BR';
i18n.enableFallback = true;
i18n.defaultLocale = 'pt-BR';

/**
 * Atualiza o idioma da aplicação em tempo real.
 * @param locale O código do idioma (ex: 'en', 'pt-BR')
 */
export const setAppLocale = (locale: string): string => {
  const isSupported = supportedLocales.some(l => l.code === locale);
  const newLocale = isSupported ? locale : i18n.defaultLocale;
  i18n.locale = newLocale;
  return newLocale;
};

export const t = i18n.t.bind(i18n);
// Attach a small helper `currentLocale()` for compatibility with existing callers
// Some files call `i18n.currentLocale()`; add it here to avoid runtime errors.
(i18n as any).currentLocale = () => i18n.locale;

export default i18n as any;