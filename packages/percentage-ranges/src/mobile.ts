import { toggleForge, togglePercent } from './equip/state';
import { actionPinWindow } from './forums/tip';

const defaultButtonClass = 'ml-5px cursor-pointer transition-color-200 border-none bg-transparent';

export const createPercentButton = () =>
  button({
    type: 'button',
    textContent: '%',
    style: 'font-weight: bold;',
    class: defaultButtonClass,
    onclick: togglePercent,
  });

export const createForgeButton = () =>
  button({
    type: 'button',
    textContent: '🔨',
    class: defaultButtonClass,
    onclick: toggleForge,
  });

export const createPinButton = () =>
  button({
    type: 'button',
    textContent: '📌',
    class: defaultButtonClass,
    onclick: actionPinWindow,
  });
