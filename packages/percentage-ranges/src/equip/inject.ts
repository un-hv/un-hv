import { isMobile } from 'common/mobile';

import { equipInfo } from '../observe';
import { quality_configs } from './config';
import { createForgeButton, createPercentButton } from '../mobile';
import { renderEquip } from './render';

const excludeRegex = new RegExp(
  ['?s=Character&ss=eq', '?s=Battle&ss=iw', '?s=Bazaar&ss=am&screen=modify&']
    .map((p) => p.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
    .join('|'),
);

export function injectCompare(container: HTMLElement, quality: Quality) {
  const showCompare =
    /^(?:\/isekai)?\/equip/.test(location.pathname)
    || (!!equipInfo?.contains(container)
      && location.search !== ''
      && !excludeRegex.test(location.search));

  // inject compare select
  if (showCompare) {
    const compare = div(
      {
        style: 'padding: 6px; border-top: 1px solid #A47C78;',
      },
      b('Compare: '),
      select(
        {
          id: 'hv-quality-compare',
          onchange: (e: Event) => {
            renderEquip(container, (e.target as HTMLSelectElement).value as Quality);
          },
        },
        Object.keys(quality_configs).map((k) => option({ value: k, selected: k === quality }, k)),
      ),
      isMobile ? [createPercentButton(), createForgeButton()] : [],
    );

    container.append(compare);
  }
}
