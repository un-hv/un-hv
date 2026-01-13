import { CONFIGS } from './config';
import { initForums } from './forums';
import { initHv } from './hv';

initHv();

if (CONFIGS.enable_on_forums && !location.hostname.includes('hentaiverse.org')) {
  initForums();
}
