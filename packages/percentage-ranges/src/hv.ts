import { isValidKey } from 'common/keyboard';

import { initEquip } from './equip';
import { equipMap, toggleForge, togglePercent } from './equip/state';
import { t } from './main';
import { keyboard_configs, REGEX_TARGET } from './shared';

export function initHv() {
  for (const el of document.querySelectorAll<HTMLElement>('.showequip')) {
    initEquip(el);
  }

  document.addEventListener(
    'keydown',
    (e) => {
      if (!isValidKey(e)) return;

      switch (e.key.toLowerCase()) {
        case keyboard_configs.key_toggle:
          e.preventDefault();
          togglePercent();
          break;
        case keyboard_configs.key_forge:
          e.preventDefault();
          toggleForge();
          break;
        case keyboard_configs.key_link:
          if (!REGEX_TARGET.test(location.href)) return;

          {
            const first = document.querySelectorAll<HTMLElement>('.showequip')[0];
            if (!first) return;

            const equip = equipMap.get(first);
            if (!equip) return;

            globalThis.prompt(t.forumLink(), `[url=${location.href}]${equip.title}[/url]`);
          }
          break;
      }
    },
    true,
  );
}
