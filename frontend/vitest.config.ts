import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['vitest.setup.ts'],
    environment: 'jsdom',
  },
  resolve: {
    alias: [
      { find: 'boot', replacement: resolve(__dirname, 'src/boot') },
      { find: 'stores', replacement: resolve(__dirname, 'src/stores') },
      { find: 'i18n', replacement: resolve(__dirname, 'src/i18n') },
      { find: 'ui', replacement: resolve(__dirname, 'src/ui') },
      { find: 'assets', replacement: resolve(__dirname, 'src/assets') },
      { find: 'presenters', replacement: resolve(__dirname, 'src/presenters') },
      { find: 'test', replacement: resolve(__dirname, 'src/test') },
      { find: 'public', replacement: resolve(__dirname, 'src/public') },
    ],
  },
});
