import * as i18next from 'i18next';
import * as i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';
import * as path from 'path';

export const locales = ['en', 'de', 'ar', 'fr', 'es'];

i18next
  .use(Backend as any)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    debug: false,
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['hotel', '404', 'server', 'room', 'restaurant', 'time', 'language', 'admin_login', 'confirm', 'admin_page', 'admin_hotels_page'],
    detection: {
      order: ['localStorage'], 
      caches: [],
      lookupFromPathIndex: 0,  
    },
  });

export default i18next;