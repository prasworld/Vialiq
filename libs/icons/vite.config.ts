import { defineConfig } from 'vite';
import path from 'path';
import { readdirSync } from 'fs';
import dts from 'vite-plugin-dts';

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
  // root must be set explicitly so the @nx/vite:build executor resolves the
  // relative outDir it computes (../../dist/libs/icons) from this project dir
  // rather than from process.cwd() (workspace root), which would place output
  // two levels above the workspace root.
  root: __dirname,
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
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
