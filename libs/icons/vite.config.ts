import { defineConfig } from 'vite';
import path from 'path';
import { readdirSync } from 'fs';

// Each icon file becomes its own output module for per-icon tree shaking.
// types.ts and index.ts are excluded — they are not runnable modules.
const iconEntries = Object.fromEntries(
  readdirSync(path.resolve(__dirname, 'src'))
    .filter(
      (f) =>
        f.endsWith('.ts') &&
        f !== 'types.ts' &&
        f !== 'index.ts' &&
        !f.endsWith('.test.ts')
    )
    .map((f) => {
      const name = f.replace(/\.ts$/, '');
      return [name, path.resolve(__dirname, `src/${f}`)];
    })
);

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        ...iconEntries,
      },
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
});
