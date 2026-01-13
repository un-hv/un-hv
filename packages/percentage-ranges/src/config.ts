// Configuration, use false replace true to disable some features
export const CONFIGS = {
  default_quality: 'current' as 'current' | Quality,
  key_toggle: 'f',
  key_pin: 'q',
  key_forge: 'w',
  key_delete: 'delete',
  key_link: 'l',
  enable_on_forums: true,
};

export const QUALITY_CONFIG = {
  Peerless: { range: [200, 200], cap: 50 },
  Legendary: { range: [170, 200], cap: 40 },
  Magnificent: { range: [150, 180], cap: 30 },
  Exquisite: { range: [120, 160], cap: 20 },
  Superior: { range: [90, 130], cap: 20 },
  Average: { range: [60, 100], cap: 20 },
  Fair: { range: [30, 70], cap: 20 },
  Crude: { range: [0, 40], cap: 20 },
} satisfies Record<Quality, { range: [number, number]; cap: number }>;
