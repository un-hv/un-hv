import { REGEX_TARGET } from '../shared';
import { renderTip, tip } from './tip';

let longPressTimer: number | null = null;
let isLongPressTriggered = false;

const clearLongPressTimer = () => {
  if (longPressTimer) {
    clearTimeout(longPressTimer);
    longPressTimer = null;
  }
};

export function initMobileEvents() {
  document.addEventListener(
    'touchstart',
    (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      clearLongPressTimer();
      isLongPressTriggered = false;

      if (!link) {
        if (tip && tip.style.display !== 'none' && !tip.contains(target)) {
          tip.style.display = 'none';
        }
        return;
      }

      longPressTimer = setTimeout(() => {
        isLongPressTriggered = true;
        renderTip(link);
      }, 500);
    },
    { passive: true },
  );

  document.addEventListener('touchmove', clearLongPressTimer, { passive: true });
  document.addEventListener('touchend', clearLongPressTimer);

  document.addEventListener('contextmenu', (e) => {
    console.log('contextmenu', isLongPressTriggered);
    if (!isLongPressTriggered) return;

    const target = e.target as HTMLElement;
    const link = target.closest('a');
    if ((link && REGEX_TARGET.test(link.href)) || tip?.contains(target)) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

export function getMobileTooltipPosition(
  targetRect: DOMRect,
  tipRect: DOMRect,
): { top: number; left: number } {
  const { innerWidth, innerHeight } = globalThis;

  let top = targetRect.top - tipRect.height - 20;
  let left = (innerWidth - tipRect.width) / 2;

  if (left + tipRect.width > innerWidth) {
    left = targetRect.left - tipRect.width - 10;
    if (left < 0) left = 5;
  }

  if (top + tipRect.height > innerHeight) {
    top = top < 0 ? targetRect.bottom + 10 : innerHeight - tipRect.height - 10;
  }

  return {
    top: Math.max(5, top),
    left: Math.max(5, left),
  };
}
