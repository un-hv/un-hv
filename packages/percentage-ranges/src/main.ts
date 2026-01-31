// eslint-disable-next-line import-x/no-unresolved
import 'virtual:uno.css';
import { initI18n } from 'i18n';

import { initForums } from './forums';
import { initHv } from './hv';

export const t = initI18n();

initHv();

if (location.hostname.includes('forums.e-hentai.org')) {
  initForums();
}
