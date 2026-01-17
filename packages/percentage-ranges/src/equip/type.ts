export interface Stat {
  title: string;
  val: number;
  valStr: string;
  base: number | null;
  rate: 1 | 2;
  prefix: string | null;
  suffix: string | null;
  typeText: string | null;
  _el: HTMLElement;
  _preNode: Node | null;
  _sufNode: Node | null;
}

interface EquipBase {
  title: string;
  quality: Quality;
  range: [number, number];
  forge_max: number;
  type: 'Soulbound' | 'Tradeable';
  stats: Stat[];
  _eq: HTMLElement;
  _avg: HTMLElement;
}

interface SoulboundItem extends EquipBase {
  type: 'Soulbound';
  tier_up: number;
  tier_iw: number;
  tier_max: number;
  _eqt: Element;
}

interface TradeableItem extends EquipBase {
  type: 'Tradeable';
  level: number;
}

export type EquipData = SoulboundItem | TradeableItem;
