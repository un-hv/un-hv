// eslint-disable-next-line import-x/no-unresolved
import 'virtual:uno.css';

import { initForums } from './forums';
import { initHv } from './hv';

initHv();

if (location.hostname.includes('forums.e-hentai.org')) {
  initForums();
}
