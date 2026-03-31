import { defineConfig } from 'vite';
import path from 'path';

const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  esbuild: {
    target: 'ES2022', // Required for modern decorators
  },
  build: {
    outDir: path.resolve(workspaceRoot, 'dist/libs/web-components'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'button/vi-button': path.resolve(__dirname, 'src/button/vi-button.ts'),
        'icons/vi-icon': path.resolve(__dirname, 'src/icons/vi-icon.ts'),
        'icons/registry': path.resolve(__dirname, 'src/icons/registry.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['lit', /^lit\//, /^@lit\//],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
});
