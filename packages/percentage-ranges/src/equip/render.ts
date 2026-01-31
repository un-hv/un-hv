import { t } from '../main';
import { quality_configs } from './config';
import { equipMap, globalState } from './state';

const charmExclusiveBonus = new Set(['HP Bonus', 'MP Bonus', 'Counter-parry']);

const color = {
  green: 'text-#0ab844',
  red: 'text-#f03939',
  mid: 'text-#1d3271',
};
const colorClasses = Object.values(color);

const removeColor = (el: HTMLElement) => {
  el.classList.remove(...colorClasses);
};

export function renderEquip(container: HTMLElement, compareQuality: Quality | null = null) {
  const equip = equipMap.get(container);
  if (!equip) return;

  const { showPercent, showMaxForge } = globalState;

  if (equip.type === 'Soulbound') {
    const { tier_up: up, tier_iw: iw, tier_max: max } = equip;

    // Tier X / Y / Z -> X(+A) | Y(+B) / Z
    if (showMaxForge && (max - up > 0 || max - iw > 0)) {
      const diff = (cur: number) =>
        max - cur > 0 ? `${cur}<span class="${color.green}">+${max - cur}</span>` : max;
      equip._eqt.innerHTML = `Tier ${diff(up)} / ${diff(iw)} / ${max}`;
    } else {
      equip._eqt.textContent = `Tier ${up} / ${iw} / ${max}`;
    }
  }

  let totalPercent = 0;
  let statCount = 0;
  const [min, max] = compareQuality ? quality_configs[compareQuality].range : equip.range;
  const forge_current = equip.type === 'Soulbound' ? equip.tier_up + equip.tier_iw : 0;

  const getColor = (percent: number, max = 70, min = 30) =>
    percent >= max ? color.green
    : percent <= min ? color.red
    : color.mid;

  for (const stat of equip.stats) {
    const el = stat._el;
    removeColor(el);

    let percent = null;
    if (stat.base !== null) {
      const span = max - min || 30;
      percent = Number.parseFloat((((stat.base - (max - span)) / span) * 100).toFixed(1));
      totalPercent += percent;
      statCount++;
    }

    const isForgeMode =
      showMaxForge && equip.forge_max > forge_current && !charmExclusiveBonus.has(stat.title);
    const isPercentMode = showPercent && !isForgeMode && percent !== null;

    // remove/restore '+' 'x' '%'
    const hideSurrounding = isForgeMode || isPercentMode;
    if (stat._preNode) {
      stat._preNode.textContent = hideSurrounding ? '' : stat.prefix;
    }
    if (stat._sufNode && !stat.typeText) {
      stat._sufNode.textContent = hideSurrounding ? '' : stat.suffix;
    }

    const typeText = stat.typeText ? ` ${stat.typeText}` : '';

    if (isForgeMode) {
      const ratio = stat.rate / 100;
      const maxVal = (stat.val * (1 + equip.forge_max * ratio)) / (1 + forge_current * ratio);
      const gain = +(maxVal - stat.val).toFixed(2);
      el.innerHTML = `${stat.valStr}<span class="${color.green}">+${gain}</span>${typeText}`;
    } else if (isPercentMode && percent !== null) {
      el.textContent = `${percent}%${typeText}`;
      el.classList.add(getColor(percent));
    } else {
      el.textContent = `${stat.valStr}${typeText}`;
    }
  }

  if (statCount > 0) {
    const avg = Number.parseFloat((totalPercent / statCount).toFixed(1));
    const mode =
      showMaxForge ? t.modeMaxForged()
      : showPercent ? t.modePercentage()
      : t.modeValue();
    equip._avg.innerHTML =
      `<div class="${getColor(avg, 60, 40)}">${t.avgLabel()}: ${avg}%</div>`
      + `<div class="text-10px" title="${t.hotkeyHint()}">${t.modeLabel()}: ${mode}</div>`;
  } else {
    equip._avg.textContent = '';
  }
}
