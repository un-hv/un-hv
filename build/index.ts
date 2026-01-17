import Unocss from 'unocss/vite';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig, type UserConfig } from 'vite';
import monkey, { type MonkeyUserScript, util } from 'vite-plugin-monkey';

interface DefineMonkeyConfigOptions {
  entry?: string;
  name: string;
  version: string;
  description: string;
  match: string[];
  exclude?: string[];
  connect?: string[];
  icon?: string;
  runAt?: 'document-start' | 'document-end' | 'document-idle';
  tag?: string[];
  noframes?: boolean;
  userscriptOverrides?: MonkeyUserScript;
  viteOverrides?: UserConfig;
}

export function createMonkeyConfig({
  entry = 'src/main.ts',
  name,
  version,
  description,
  match,
  exclude = [],
  connect = [],
  icon = 'https://e-hentai.org/favicon.ico',
  runAt = 'document-idle',
  tag = [],
  noframes = false,
  userscriptOverrides = {},
  viteOverrides = {},
}: DefineMonkeyConfigOptions) {
  const fileName = `${name.toLowerCase().replaceAll(/\s+/g, '-')}.user.js`;
  const distUrl = `https://cdn.jsdelivr.net/gh/un-hv/un-hv@release/${fileName}`;

  return defineConfig({
    build: {
      target: 'es2018',
      minify: 'terser',
      terserOptions: {
        compress: false,
        mangle: false,
        format: {
          beautify: true,
          comments: 'all',
          preserve_annotations: true,
          indent_level: 2,
          quote_style: 1,
        },
      },
      outDir: 'dist',
      emptyOutDir: true,
      ...viteOverrides.build,
    },
    plugins: [
      Unocss(),
      AutoImport({
        imports: [util.unimportPreset],
        dirs: ['../../build/vanjs.ts'],
        dts: '../../build/auto-import.d.ts',
      }),
      monkey({
        entry,
        userscript: {
          name,
          version,
          description,
          namespace: 'https://github.com/un-hv',
          author: 'un-hv community',
          copyright: `${new Date().getFullYear()}, un-hv`,
          icon,
          match,
          exclude,
          connect,
          'run-at': runAt,
          tag,
          noframes,
          homepage: 'https://github.com/un-hv/un-hv',
          supportURL: 'https://forums.e-hentai.org/index.php?showtopic=290597',
          downloadURL: distUrl,
          updateURL: distUrl,
          ...userscriptOverrides,
        },
        build: {
          fileName,
        },
      }),
    ],
    ...viteOverrides,
  });
}
