import type { EquipData } from './type';

import { popup } from '../observe';
import { renderEquip } from './render';

export const equipMap = new WeakMap<HTMLElement, EquipData>();

const state = {
  showPercent: GM_getValue('showPercent', true),
  showMaxForge: false,
};

export const globalState = state as Readonly<typeof state>;

export function togglePercent() {
  // pressing toggle (f) should always exit MaxForge mode
  state.showMaxForge = false;
  state.showPercent = !state.showPercent;
  GM_setValue('showPercent', state.showPercent);
  renderAll();
}

export function toggleForge() {
  // pressing toggle (w) should always exit Percentage mode
  state.showPercent = false;
  state.showMaxForge = !state.showMaxForge;
  renderAll();
}

function renderAll() {
  if (popup?.style.visibility === 'visible') {
    renderEquip(popup);
  }
  for (const el of document.querySelectorAll<HTMLElement>('.showequip')) {
    const select = el.querySelector('select');
    renderEquip(el, select ? (select.value as Quality) : null);
  }
}
