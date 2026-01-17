import '../style/forums.css';
import '../style/forums-persistent.css';
import { isValidKey } from 'common/keyboard';
import { isMobile } from 'common/mobile';

import { keyboard_configs } from '../shared';
import { initMobileEvents } from './mobile';
import { actionPinWindow, initTipEvents } from './tip';

export function initForums() {
  initTipEvents();
  if (isMobile) {
    initMobileEvents();
  }
  document.addEventListener('keydown', (e) => {
    if (!isValidKey(e)) return;

    const key = e.key.toLowerCase();

    if (key === keyboard_configs.key_pin) {
      actionPinWindow();
    } else if (key === keyboard_configs.key_delete) {
      for (const w of document.querySelectorAll<HTMLElement>('.hv-pin-box:hover')) {
        w.remove();
      }
    }
  });
}
