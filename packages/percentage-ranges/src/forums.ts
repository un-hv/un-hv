import './style/forums.css';
import './style/forums-persistent.css';
import { CONFIGS } from './config';
import { parseEquip } from './equip';
import { REGEX_TARGET } from './hv';
import { globalState, UI_BUTTONS } from './state';
import { $$, el } from './utils';

const CACHE_PREFIX = 'HvPerc_';

const getCache = (url: string) => sessionStorage.getItem(CACHE_PREFIX + url);

const setCache = (url: string, data: string) => {
  const save = () => {
    sessionStorage.setItem(CACHE_PREFIX + url, data);
  };
  try {
    save();
  } catch {
    console.warn('SessionStorage is full, cache failed');
    for (const k of Object.keys(sessionStorage)) {
      if (k.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    }
    console.info('Cleared cache, retrying...');
    try {
      save();
    } catch (err) {
      console.error('Retry failed', err);
    }
  }
};

let curLink: HTMLAnchorElement | null = null;

const fetchData = (url: string) =>
  GM_xmlhttpRequest({
    method: 'GET',
    url: url.replace(/^http:/, 'https:'),
    headers: { Origin: 'https://hentaiverse.org' },
    onload: (res) => {
      try {
        const doc = new DOMParser().parseFromString(res.responseText, 'text/html');
        // Remove dropped by
        doc.querySelector('div[style*="border-top"] p')?.remove();

        // TODO: remove #showequip
        const content = doc.querySelector<HTMLElement>('.showequip, #showequip');
        if (!content) {
          renderTooltip({ err: doc.body.textContent || '' }, url);
          return;
        }

        const titleDiv = content.firstElementChild as HTMLElement | null;
        if (titleDiv && !titleDiv.querySelector('a')) {
          const link = el(
            'a',
            {
              href: url,
              target: '_blank',
              style: 'color: inherit; text-decoration: none; cursor: pointer',
            },
            [],
          );
          link.append(...titleDiv.childNodes);
          titleDiv.replaceChildren(link);
        }

        setCache(url, content.outerHTML);

        if (curLink?.href === url) {
          renderTooltip({ html: content.outerHTML }, url);
        }
      } catch (err) {
        console.error('Failed to parse tooltip response', err);
        renderTooltip({ err: 'Parse Error' }, url);
      }
    },
    onerror: () => {
      renderTooltip({ err: 'Network Error' }, url);
    },
  });

let tip: HTMLDivElement | null = null;
let hoverTimer: ReturnType<typeof globalThis.setTimeout> | null = null;
let hideTimer: ReturnType<typeof globalThis.setTimeout> | null = null;

let isTouch = false;

const clearHoverTimer = () => {
  if (hoverTimer) {
    globalThis.clearTimeout(hoverTimer);
    hoverTimer = null;
  }
};

const cleanHideTimer = () => {
  if (hideTimer) {
    globalThis.clearTimeout(hideTimer);
    hideTimer = null;
  }
};

const hideTip = () => {
  if (tip) tip.style.display = 'none';
};

type TooltipData = { html: string } | { err: string };

/**
 * TODO: remove param _url
 * @param {{ html: string } | { err: string }} data
 * @param {string} [_url]
 */
const renderTooltip = (data: TooltipData, _url = '') => {
  if (!tip) {
    tip = el('div', {
      style: 'display: none; z-index: 10000;',
      class: _url.includes('/isekai/') ? 'hv-tip' : 'hv-tip hv-tip-persistent',
      onmouseenter: () => {
        cleanHideTimer();
      },
      onmouseleave: () => {
        hideTimer = globalThis.setTimeout(() => {
          curLink = null;
          hideTip();
        }, 200);
      },
    });

    document.body.append(tip);
  }

  if ('err' in data) {
    tip.innerHTML = `<div class="hv-err">${data.err}</div>`;
  } else {
    tip.innerHTML = data.html;

    const eq = tip.firstElementChild as HTMLElement | null;
    if (!eq) return;

    if (_url.includes('/isekai/')) {
      parseEquip(eq);

      if (globalState.isMobile) {
        const pinBtn = el(
          'button',
          {
            type: 'button',
            style:
              'margin-left: 5px; cursor: pointer !important; border: none; background: transparent;',
            onclick: () => {
              actionPinWindow();
            },
          },
          ['📌'],
        );
        eq.append(UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE, pinBtn);
      }
    }
  }

  if (!curLink) return;
  tip.style.display = 'block';

  const rect = curLink.getBoundingClientRect();
  const tRect = tip.getBoundingClientRect();

  let top: number;
  let left: number;

  if (isTouch) {
    top = rect.top - tRect.height - 20;
    left = (globalThis.innerWidth - tRect.width) / 2;
  } else {
    top = rect.top + 10;
    left = rect.right + 10;
  }

  if (left + tRect.width > globalThis.innerWidth) {
    left = rect.left - tRect.width - 10;
    if (left < 0) {
      left = 5;
    }
  }
  if (top + tRect.height > globalThis.innerHeight) {
    top = top < 0 ? rect.bottom + 10 : globalThis.innerHeight - tRect.height - 10;
  }

  tip.style.top = `${Math.max(5, top)}px`;
  tip.style.left = `${Math.max(5, left)}px`;
};

let zIndex = 10_002;

function isValidKey(e: KeyboardEvent) {
  if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return false;

  const target = e.target as HTMLElement | null;
  if (!target) return false;

  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return false;

  return true;
}

function actionPinWindow() {
  if (!tip || tip.style.display === 'none' || !curLink) return;

  const url = curLink.href;
  if (document.querySelector(`.hv-pin-box[data-url="${url}"]`)) return;

  hideTip();

  // TODO: remove hv-tip-persistent
  const pinWin = el('div', {
    class: `hv-pin-box hv-tip${url.includes('/isekai/') ? '' : ' hv-tip-persistent'}`,
    dataset: { url },
    style: `position:fixed;
            top: ${tip.style.top}; left: ${tip.style.left};
            z-index:${++zIndex};`,
    onmousedown: () => {
      pinWin.style.zIndex = String(++zIndex);
    },
    ontouchstart: () => {
      pinWin.style.zIndex = String(++zIndex);
    },
  });

  const closeBtn = el(
    'span',
    {
      class: 'hv-pin-close',
      style: 'cursor: pointer; font-family: monospace;',
      onclick: () => {
        pinWin.remove();
      },
      onpointerdown: (e: PointerEvent) => {
        e.stopPropagation();
      },
    },
    ['[X]'],
  );

  const header = el(
    'div',
    {
      class: 'hv-pin-header',
      style: 'touch-action: none; user-select: none;',
      onpointerdown: (e: PointerEvent) => {
        if (e.button !== 0 || !e.isPrimary) return;
        e.preventDefault();

        const target = e.currentTarget as HTMLElement;

        target.setPointerCapture(e.pointerId);

        const startX = e.clientX;
        const startY = e.clientY;
        const { left, top } = pinWin.getBoundingClientRect();

        const onMove = (ev: PointerEvent) => {
          pinWin.style.left = `${left + (ev.clientX - startX)}px`;
          pinWin.style.top = `${top + (ev.clientY - startY)}px`;
        };

        const onUp = (ev: PointerEvent) => {
          target.removeEventListener('pointermove', onMove);
          target.removeEventListener('pointerup', onUp);
          target.releasePointerCapture(ev.pointerId);
        };

        target.addEventListener('pointermove', onMove);
        target.addEventListener('pointerup', onUp);
      },
    },
    [el('span', {}, ['Pinned']), closeBtn],
  );

  const content = el(
    'div',
    {
      class: 'hv-pin-body',
      innerHTML: getCache(url) ?? tip.innerHTML,
    },
    [],
  );

  const eq = content.firstElementChild as HTMLElement | null;
  if (!eq) return;

  parseEquip(eq);

  if (globalState.isMobile) {
    content.append(UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE);
  }

  pinWin.append(header, content);
  document.body.append(pinWin);
}

export function initForums() {
  if (!CONFIGS.enable_on_forums) return;

  document.addEventListener('mouseover', (e) => {
    if (isTouch) return;

    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if (!link) return;

    if (
      link.closest('.hv-tip')
      || link.closest('.hv-pin-box')
      || link.closest('.hv-tip-persistent')
    ) {
      return;
    }

    const url = link.href.replace(/^http:/, 'https:');
    if (!REGEX_TARGET.test(url)) return;

    cleanHideTimer();
    clearHoverTimer();
    hideTip();

    curLink = link;

    const cached = getCache(url);
    if (cached) {
      renderTooltip({ html: cached }, url);
    } else {
      hoverTimer = globalThis.setTimeout(() => {
        fetchData(url);
      }, 200);
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (!curLink || isTouch) return;

    const related = e.relatedTarget as Node | null;
    if (related && (curLink.contains(related) || tip?.contains(related))) return;

    const link = (e.target as Element).closest('a');
    if (link === curLink) {
      clearHoverTimer();
      hideTimer = globalThis.setTimeout(() => {
        curLink = null;
        hideTip();
      }, 200);
    }
  });

  document.addEventListener(
    'touchstart',
    (e) => {
      isTouch = true;
      const target = e.target as HTMLElement;

      if (tip && tip.style.display !== 'none' && !tip.contains(target)) {
        hideTip();
      }

      const link = target.closest('a');
      if (!link) return;

      const url = link.href.replace(/^http:/, 'https:');
      if (!REGEX_TARGET.test(url)) return;

      curLink = link;
      if (hoverTimer) globalThis.clearTimeout(hoverTimer);

      hoverTimer = globalThis.setTimeout(() => {
        const cached = getCache(url);
        if (cached) {
          renderTooltip({ html: cached }, url);
        } else {
          fetchData(url);
        }
      }, 500);
    },
    { passive: true },
  );

  document.addEventListener('touchend', clearHoverTimer);
  document.addEventListener('touchmove', clearHoverTimer);

  document.addEventListener('contextmenu', (e) => {
    if (isTouch) {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && REGEX_TARGET.test(link.href.replace(/^http:/, 'https:'))) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!isValidKey(e)) return;

    const key = e.key.toLowerCase();

    if (key === CONFIGS.key_pin) {
      actionPinWindow();
    } else if (key === CONFIGS.key_delete) {
      for (const w of $$('.hv-pin-box:hover')) {
        w.remove();
      }
    }
  });
}
