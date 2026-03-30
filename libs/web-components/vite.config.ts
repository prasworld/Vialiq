import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  esbuild: {
    target: 'ES2022', // Required for modern decorators
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'vi-web-components',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit'],
      output: {
        globals: {
          lit: 'lit',
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
});
