import type { EquipData, Stat } from './type';

import { quality_configs, type QualityConfig } from './config';

const REGEX_VAL = /^(\d+(?:\.\d+)?)(?:\s+(\S.*))?$/;
const REGEX_BASE = /Base:\s*([+-]?[\d.]+)/i;
const REGEX_TIER = /Tier\s+(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/i;
const REGEX_DAMAGE = /^(?:Magic|Attack|Void|Crushing|Piercing|Slashing) Damage/;

export function parseEquip(container: HTMLElement): EquipData | undefined {
  if (container.querySelector('.hv-lpr-avg')) return;

  const eq = container.querySelector<HTMLElement>('.eq');
  const eqt = container.querySelector<HTMLElement>('.eqt');
  if (!eq || !eqt) return;

  const title = container.firstElementChild?.textContent.trim();
  if (!title) return;

  const found = Object.entries(quality_configs).find(([key]) => title.startsWith(key));
  if (!found) return;

  const [quality, { range, cap }] = found as [Quality, QualityConfig];

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
  const avg = div({
    class: `hv-lpr-avg p-2px text-12px font-bold ${container.closest('#popup_box') ? ' absolute bottom-1 inset-x-0 text-center' : ''}`,
  });
  container.append(avg);

  // Tier X / Y / Z
  const tierMatch = REGEX_TIER.exec(eqt.textContent);

  return {
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
}
