import { isMobile } from 'common/mobile';
import { GM_Request } from 'common/request';

import { initEquip } from '../equip';
import { t } from '../main';
import { createForgeButton, createPercentButton, createPinButton } from '../mobile';
import { REGEX_TARGET } from '../shared';
import { getCache, setCache } from './cache';
import { getMobileTooltipPosition } from './mobile';
import { parseRawHtml } from './parse';
import { createPin } from './pin';

export let tip: HTMLDivElement | null = null;
let curLink: HTMLAnchorElement | null = null;

let showTimer: number | null = null;
let hideTimer: number | null = null;

const clearShowTimer = () => {
  if (showTimer) {
    globalThis.clearTimeout(showTimer);
    showTimer = null;
  }
};

const clearHideTimer = () => {
  if (hideTimer) {
    globalThis.clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const hideTip = () => {
  if (tip) tip.style.display = 'none';
};

let abortCtrl: AbortController | null = null;

const clearAbortCtrl = () => {
  if (abortCtrl) {
    abortCtrl.abort();
    abortCtrl = null;
  }
};

const renderContent = (link: HTMLAnchorElement, html: string) => {
  if (!tip || link !== curLink) return;

  tip.innerHTML = html;

  const eq = tip.firstElementChild as HTMLElement | null;
  if (eq) {
    initEquip(eq);
    if (isMobile) {
      tip.append(createPercentButton(), createForgeButton(), createPinButton());
    }
  }

  tip.style.display = 'block';

  const rect = link.getBoundingClientRect();
  const tRect = tip.getBoundingClientRect();

  let pos: { top: number; left: number };
  if (isMobile) {
    pos = getMobileTooltipPosition(rect, tRect);
  } else {
    let top = rect.top + 10;
    let left = rect.right + 10;

    if (left + tRect.width > globalThis.innerWidth) {
      left = rect.left - tRect.width - 10;
      if (left < 0) {
        left = 5;
      }
    }
    if (top + tRect.height > globalThis.innerHeight) {
      top = top < 0 ? rect.bottom + 10 : globalThis.innerHeight - tRect.height - 10;
    }

    pos = { left, top };
  }

  tip.style.top = `${pos.top}px`;
  tip.style.left = `${pos.left}px`;
};

export const renderTip = (link: HTMLAnchorElement) => {
  // exclude tip/pin <a>
  if (tip?.contains(link) || link.closest('.hv-pin-box')) return;

  const url = link.href.replace(/^http:/, 'https:');
  if (!REGEX_TARGET.test(url)) return;

  clearAbortCtrl();
  clearShowTimer();
  clearHideTimer();

  curLink = link;

  // TODO: remove hv-tip-persistent
  if (!tip) {
    tip = div({
      style: 'display: none;',
      class: `hv-tip z-10000 ${url.includes('/isekai/') ? '' : ' hv-tip-persistent'}`,
    });
    document.body.append(tip);
  }

  const cached = getCache(url);
  if (cached) {
    renderContent(link, cached);
  } else {
    showTimer = setTimeout(async () => {
      if (!tip) return;

      abortCtrl = new AbortController();
      try {
        const { responseText } = await GM_Request({ url }, abortCtrl.signal);

        if (curLink !== link) return;

        const html = parseRawHtml(responseText, url);
        setCache(url, html);
        renderContent(link, html);
      } catch (error) {
        if (curLink !== link || (error instanceof Error && error.message === 'Aborted')) return;
        tip.innerHTML = `<div class="p-10px color-red font-bold"> ${error instanceof Error ? error.message : t.unknownError()}</div>`;
      }
    }, 200);
  }
};

export const initTipEvents = () => {
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;

    const target = e.target as HTMLElement;

    if (tip?.contains(target)) {
      clearHideTimer();
      return;
    }

    const link = target.closest('a');
    if (!link) return;

    if (link === curLink) {
      clearHideTimer();
      return;
    }

    renderTip(link);
  });

  document.addEventListener('pointerout', (e) => {
    if (!curLink || !tip) return;
    if (e.pointerType === 'touch') return;

    const target = e.target as Node;
    if (!tip.contains(target) && !curLink.contains(target)) return;

    const related = e.relatedTarget as Node | null;
    if (tip.contains(related) || curLink.contains(related)) return;

    clearAbortCtrl();
    clearShowTimer();
    clearHideTimer();
    hideTimer = setTimeout(() => {
      curLink = null;
      hideTip();
    }, 200);
  });
};

export function actionPinWindow() {
  if (!tip || tip.style.display === 'none' || !curLink) return;

  createPin(tip, curLink.href);

  hideTip();
}
