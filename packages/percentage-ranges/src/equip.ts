import { CONFIGS, QUALITY_CONFIG } from './config';
import { equipMap, globalState, UI_BUTTONS } from './state';
import { $, el } from './utils';

const REGEX_VAL = /^(\d+(?:\.\d+)?)(?:\s+(\S.*))?$/;
const REGEX_BASE = /Base:\s*([+-]?[\d.]+)/i;
const REGEX_TIER = /Tier\s+(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/i;
const REGEX_DAMAGE = /^(?:Magic|Attack|Void|Crushing|Piercing|Slashing) Damage/;

export function parseEquip(container: HTMLElement) {
  if ($(container, '.hv-lpr-avg')) return;
  const eq = $(container, '.eq');
  const eqt = $(container, '.eqt');
  if (!eq || !eqt) return;

  const title = container.firstElementChild?.textContent.trim();
  if (!title) return;

  const found = Object.entries(QUALITY_CONFIG).find(([key]) => title.startsWith(key));
  if (!found) return;

  const [quality, { range, cap }] = found as [Quality, { range: [number, number]; cap: number }];

  const stats: Stat[] = [];

  const rows = [
    ...eq.querySelectorAll('.ex > div, .ep > div'),
    ...Array.from(eq.querySelectorAll('[title^="Base: "]')).filter((el) => !el.closest('.ex, .ep')),
  ];

  for (const row of rows) {
    const span = row.querySelector('span');
    if (!span) continue;

    // 810 Slashing Damage, 34.24
    const match = REGEX_VAL.exec(span.textContent.trim());
    if (!match) continue;

    const [_, valStr, typeText] = match;
    if (!valStr) continue;
    const name = typeText ?? row.firstElementChild?.textContent.trim();
    if (!name) continue;

    const baseMatch = row.getAttribute('title')?.match(REGEX_BASE);
    const prefixNode = span.previousSibling;
    const suffixNode = span.parentNode?.nextSibling ?? null;

    stats.push({
      title: name,
      val: Number.parseFloat(valStr),
      valStr,
      base: baseMatch ? Number.parseFloat(baseMatch[1]!) : null,
      rate: REGEX_DAMAGE.test(name) ? 2 : 1,
      prefix: prefixNode?.nodeType === 3 ? prefixNode.textContent : '',
      suffix: suffixNode?.textContent ?? null,
      typeText: typeText ?? null,
      _el: span,
      _preNode: prefixNode,
      _sufNode: suffixNode,
    });
  }

  // create avg node
  const avg = el('div', {
    class: 'hv-lpr-avg',
    style:
      container.closest('#popup_box') ?
        'position: absolute; bottom: 4px; left: 0; right: 0; text-align :center;'
      : undefined,
  });
  container.append(avg);

  // Tier X / Y / Z
  const tierMatch = REGEX_TIER.exec(eqt.textContent);

  const equip: EquipData = {
    title,
    quality,
    range,
    stats,
    _eq: eq,
    _avg: avg,
    ...(tierMatch ?
      {
        type: 'Soulbound',
        tier_up: +tierMatch[1]!,
        tier_iw: +tierMatch[2]!,
        tier_max: +tierMatch[3]!,
        forge_max: +tierMatch[3]! * 2,
        _eqt: eqt,
      }
    : {
        type: 'Tradeable',
        level: +(/Level (\d+)/i.exec(eqt.textContent)?.[1] ?? 0),
        forge_max: cap,
      }),
  };

  equipMap.set(container, equip);

  const excludePatterns = [
    '?s=Character&ss=eq',
    '?s=Battle&ss=iw',
    '?s=Bazaar&ss=am&screen=modify&',
  ];

  const showCompare =
    /^(?:\/isekai)?\/equip/.test(location.pathname)
    || (document.getElementById('equipinfo')?.contains(container)
      && location.search !== ''
      && excludePatterns.every((pattern) => !location.search.includes(pattern)));

  let compareQuality = null;

  // inject compare select
  if (showCompare) {
    const initQuality = CONFIGS.default_quality === 'current' ? quality : CONFIGS.default_quality;

    if (initQuality !== quality) {
      compareQuality = initQuality;
    }

    const select = el(
      'select',
      {
        id: 'hv-quality-compare',
        onchange: () => {
          renderEquip(container, select.value as Quality);
        },
      },
      Object.keys(QUALITY_CONFIG).map((k) =>
        el('option', { value: k, selected: k === initQuality }, [k]),
      ),
    );

    container.append(
      el('div', { style: 'padding: 6px; border-top: 1px solid #A47C78;' }, [
        el('b', {}, ['Compare: ']),
        select,
        ...(globalState.isMobile ? [UI_BUTTONS.PERCENT, UI_BUTTONS.FORGE] : []),
      ]),
    );
  }

  renderEquip(container, compareQuality);
}

const charmExclusiveBonus = new Set(['HP Bonus', 'MP Bonus', 'Counter-parry']);

export function renderEquip(container: HTMLElement, compareQuality: Quality | null = null) {
  const equip = equipMap.get(container);
  if (!equip) return;

  const { showPercent, showMaxForge } = globalState;

  if (equip.type === 'Soulbound') {
    const { tier_up: up, tier_iw: iw, tier_max: max } = equip;

    // Tier X / Y / Z -> X(+A) | Y(+B) / Z
    if (showMaxForge && (max - up > 0 || max - iw > 0)) {
      const diffX = max - up > 0 ? `${up}<span class="hv-txt-green">+${max - up}</span>` : max;
      const diffY = max - iw > 0 ? `${iw}<span class="hv-txt-green">+${max - iw}</span>` : max;
      equip._eqt.innerHTML = `Tier ${diffX} / ${diffY} / ${max}`;
    } else {
      equip._eqt.textContent = `Tier ${up} / ${iw} / ${max}`;
    }
  }

  let totalPercent = 0;
  let statCount = 0;
  const [min, max] = compareQuality ? QUALITY_CONFIG[compareQuality].range : equip.range;
  const forge_current = equip.type === 'Soulbound' ? equip.tier_up + equip.tier_iw : 0;

  const getColor = (percent: number, max = 70, min = 30) =>
    percent >= max ? 'hv-txt-green'
    : percent <= min ? 'hv-txt-red'
    : 'hv-txt-mid';

  for (const stat of equip.stats) {
    const el = stat._el;
    el.classList.remove('hv-txt-red', 'hv-txt-green', 'hv-txt-mid');

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
      const maxVal =
        (stat.val * (1 + (equip.forge_max * stat.rate) / 100))
        / (1 + (forge_current * stat.rate) / 100);
      const gainText = Math.round((maxVal - stat.val) * 100) / 100;
      el.innerHTML = `${stat.valStr}<span class="hv-txt-green">+${gainText}</span>${typeText}`;
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
      showMaxForge ? 'Max Forged'
      : showPercent ? 'Percentage'
      : 'Value';
    equip._avg.innerHTML =
      `<div class="${getColor(avg, 60, 40)}">Avg: ${avg}%</div>`
      + `<div style="font-size: 10px;" title="Hotkeys: f, w">Mode: ${mode}</div>`;
  } else {
    equip._avg.textContent = '';
  }
}
