import { defineConfig, presetAttributify, presetWind3, transformerVariantGroup } from 'unocss';

export default defineConfig({
  presets: [
    presetWind3({
      preflight: false,
    }),
    presetAttributify(),
  ],
  transformers: [transformerVariantGroup()],
  content: {
    pipeline: {
      include: '**/packages/**/src/**/*.ts',
    },
  },
  shortcuts: {
    'flex-col': 'flex flex-col',
    'flex-row': 'flex flex-row',
    'flex-center': 'flex justify-center items-center',
    'flex-start': 'flex justify-start items-center',
    'flex-end': 'flex justify-end items-center',
    'flex-between': 'flex justify-between items-center',
    'flex-evenly': 'flex justify-evenly items-center',
    'flex-around': 'flex justify-around items-center',
    'flex-wrap': 'flex flex-wrap',
  },
});
