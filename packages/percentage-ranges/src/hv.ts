import './style/hv.css';
import { CONFIGS } from './config';
import { parseEquip, renderEquip } from './equip';
import { equipMap } from './state';
import { $$ } from './utils';

export const REGEX_TARGET = /^https?:\/\/(alt\.)?hentaiverse\.org\/((isekai\/)?equip|r\/)/;

function isValidKey(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;

  const target = e.target as HTMLElement | null;
  if (!target) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;

  return true;
}

let popup: HTMLElement | null = null;

function renderAll() {
  if (popup?.style.visibility === 'visible') {
    renderEquip(popup);
  }

  for (const el of $$('.showequip')) {
    const select = el.querySelector<HTMLSelectElement>('select');
    renderEquip(el, select ? (select.value as Quality) : null);
  }
}

export function initHv() {
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'childList') {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof HTMLElement)) continue;
          if (!node.classList.contains('showequip')) continue;
          parseEquip(node);
        }
      } else if (m.type === 'attributes' && m.attributeName === 'style') {
        const target = m.target;
        if (!(target instanceof HTMLElement)) continue;
        if (target.style.visibility === 'visible') {
          parseEquip(target);
        }
      }
    }
  });

  popup = document.getElementById('popup_box');
  if (popup) observer.observe(popup, { attributes: true });

  const equipInfo = document.getElementById('equipinfo');
  if (equipInfo) observer.observe(equipInfo, { childList: true });

  for (const el of $$('.showequip')) {
    parseEquip(el);
  }

  globalThis.addEventListener('hv-state-change', () => {
    renderAll();
  });

  document.addEventListener(
    'keydown',
    (e) => {
      if (!isValidKey(e)) return;

      const key = e.key.toLowerCase();

      switch (key) {
        case CONFIGS.key_toggle:
          e.preventDefault();
          globalThis.dispatchEvent(new CustomEvent('hv-toggle-percent'));
          break;
        case CONFIGS.key_forge:
          e.preventDefault();
          globalThis.dispatchEvent(new CustomEvent('hv-toggle-forge'));
          break;
        case CONFIGS.key_link:
          if (!REGEX_TARGET.test(location.href)) return;

          {
            const first = $$('.showequip')[0];
            if (!first) return;

            const equip = equipMap.get(first);
            if (!equip) return;

            globalThis.prompt('Forum Link:', `[url=${location.href}]${equip.title}[/url]`);
          }
          break;
      }
    },
    true,
  );
}
