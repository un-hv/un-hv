import { createBtn } from './utils';

export const equipMap = new WeakMap<HTMLElement, EquipData>();

export const globalState = {
  showPercent: GM_getValue('showPercent', true),
  showMaxForge: false,
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ),
};

export const UI_BUTTONS = {
  get PERCENT() {
    return createBtn({
      text: '%',
      onclick: togglePercent,
      style: 'font-weight: bold;',
    });
  },
  get FORGE() {
    return createBtn({
      text: '🔨',
      onclick: toggleForge,
    });
  },
};

export function togglePercent() {
  // pressing toggle (f) should always exit MaxForge mode
  if (globalState.showMaxForge) globalState.showMaxForge = false;

  globalState.showPercent = !globalState.showPercent;
  GM_setValue('showPercent', globalState.showPercent);

  globalThis.dispatchEvent(new CustomEvent('hv-state-change'));
}

export function toggleForge() {
  // toggle max forge mode; when enabling it, exit percentage mode
  globalState.showMaxForge = !globalState.showMaxForge;
  if (globalState.showMaxForge) globalState.showPercent = false;

  globalThis.dispatchEvent(new CustomEvent('hv-state-change'));
}

globalThis.addEventListener('hv-toggle-percent', () => {
  togglePercent();
});

globalThis.addEventListener('hv-toggle-forge', () => {
  toggleForge();
});
