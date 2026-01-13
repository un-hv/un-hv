import { createMonkeyConfig } from '../../build';

export default createMonkeyConfig({
  entry: 'src/main.ts',
  name: 'Percentage Ranges',
  version: '1.1.9',
  description: 'Stats to %',
  match: [
    '*://hentaiverse.org/isekai/*',
    '*://alt.hentaiverse.org/isekai/*',
    'https://forums.e-hentai.org/*',
  ],
  connect: ['hentaiverse.org', 'alt.hentaiverse.org'],
});
