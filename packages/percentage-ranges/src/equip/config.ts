export interface QualityConfig {
  range: [number, number];
  cap: number;
}

export const quality_configs = {
  Peerless: { range: [200, 200], cap: 50 },
  Legendary: { range: [170, 200], cap: 40 },
  Magnificent: { range: [150, 180], cap: 30 },
  Exquisite: { range: [120, 160], cap: 20 },
  Superior: { range: [90, 130], cap: 20 },
  Average: { range: [60, 100], cap: 20 },
  Fair: { range: [30, 70], cap: 20 },
  Crude: { range: [0, 40], cap: 20 },
} satisfies Record<Quality, QualityConfig>;
