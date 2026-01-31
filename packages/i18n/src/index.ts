import { navigatorDetector } from 'typesafe-i18n/detectors';

import type { Locales } from './i18n/i18n-types';

import { detectLocale, i18nObject } from './i18n/i18n-util';
import { loadLocale } from './i18n/i18n-util.sync';

export type { Locales, TranslationFunctions } from './i18n/i18n-types';
export { baseLocale, locales, isLocale } from './i18n/i18n-util';
export { loadLocale, loadAllLocales } from './i18n/i18n-util.sync';

export function initI18n() {
  const locale: Locales = detectLocale(navigatorDetector);
  loadLocale(locale);
  return i18nObject(locale);
}
