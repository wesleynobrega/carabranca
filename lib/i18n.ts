import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const ptBR = require('../app/locales/pt-BR.json');
const en = require('../app/locales/en.json');
const es = require('../app/locales/es.json');

// Instancia a biblioteca
const i18n = new I18n({
  'pt-BR': ptBR, // Português
  'en': en,      // Inglês
  'es': es,      // Espanhol
});

// Pega o idioma principal do dispositivo do usuário
const userLocale = Localization.getLocales()[0]?.locale;

// Define o idioma no app
i18n.locale = userLocale || 'pt-BR';
i18n.enableFallback = true; // Permite usar 'pt' se 'pt-BR' não for encontrado
i18n.defaultLocale = 'pt-BR'; // Define o idioma padrão caso tudo falhe

// Isso permite que você faça: import { t } from '@/lib/i18n';
export const t = i18n.t.bind(i18n);
export default i18n;