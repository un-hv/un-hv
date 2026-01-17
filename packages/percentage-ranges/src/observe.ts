import { initEquip } from './equip';

export const popup = document.getElementById('popup_box');
export const equipInfo = document.getElementById('equipinfo');

const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.type === 'childList') {
      for (const node of m.addedNodes) {
        if (!(node instanceof HTMLElement)) return;
        if (!node.classList.contains('showequip')) return;
        initEquip(node);
      }
    } else if (m.type === 'attributes' && m.attributeName === 'style') {
      const target = m.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.style.visibility === 'visible') {
        initEquip(target);
      }
    }
  }
});

if (popup) {
  observer.observe(popup, { attributes: true });
}

if (equipInfo) {
  observer.observe(equipInfo, { childList: true });
}
