import { isMobile } from 'common/mobile';

import { initEquip } from '../equip';
import { createForgeButton, createPercentButton } from '../mobile';
import { getCache } from './cache';

let zIndex = 20_000;

export function createPin(tip: HTMLElement, url: string) {
  const existingWin = document.querySelector(`.hv-pin-box[data-url="${url}"]`);
  if (existingWin) return;

  const content = div({
    class: 'overflow-auto max-h-80vh',
    innerHTML: getCache(url) ?? tip.innerHTML,
  });

  const eq = content.firstElementChild as HTMLElement | null;
  if (!eq) return;

  initEquip(eq);

  if (isMobile) {
    content.append(createPercentButton(), createForgeButton());
  }

  const handleDrag = (e: PointerEvent) => {
    if (e.button !== 0 || !e.isPrimary) return;
    e.preventDefault();

    pinWin.style.zIndex = String(++zIndex);

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
  };

  // TODO: remove hv-tip-persistent
  const pinWin = div(
    {
      class: `hv-pin-box pt-0! flex-col border:(solid #5c0d11) shadow hv-tip${url.includes('/isekai/') ? '' : ' hv-tip-persistent'}`,
      'data-url': url,
      style: `top: ${tip.style.top}; left: ${tip.style.left}; z-index:${++zIndex};`,
    },
    div(
      {
        class:
          'flex-between py-3px px-6px font-bold bg-#5c0d11 text-#edebdf cursor-move select-none touch-none',
        onpointerdown: handleDrag,
      },
      span('Pinned'),
      span({
        textContent: '[X]',
        class: 'hover:text-red cursor-pointer font-mono ml-2',
        onclick: () => {
          pinWin.remove();
        },
        onpointerdown: (e: PointerEvent) => {
          e.stopPropagation();
        },
      }),
    ),
    content,
  );

  document.body.append(pinWin);
}
