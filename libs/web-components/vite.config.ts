import { defineConfig } from 'vite';
import path from 'path';
import swc from 'unplugin-swc';

const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  // root must be set explicitly so the @nx/vite:build executor resolves the
  // relative outDir it computes (../../dist/libs/web-components) from this
  // project dir rather than from process.cwd() (workspace root), which would
  // place output two levels above the workspace root.
  root: __dirname,
  esbuild: false,
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorVersion: '2022-03' },
      },
      module: { type: 'es6' },
    }),
  ],
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
