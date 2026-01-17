import { injectCompare } from './inject';
import { parseEquip } from './parse';
import { renderEquip } from './render';
import { equipMap } from './state';

export function initEquip(container: HTMLElement) {
  const equip = parseEquip(container);
  if (!equip) return;

  equipMap.set(container, equip);
  injectCompare(container, equip.quality);
  renderEquip(container);
}
