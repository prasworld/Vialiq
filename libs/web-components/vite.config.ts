import { defineConfig } from 'vite';
import path from 'path';
import { pathToFileURL } from 'url';
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
  css: {
    preprocessorOptions: {
      scss: {
        // Redirect @vialiq/<lib>/... SCSS @use imports to the workspace source.
        // This decouples the SCSS build from the installed npm package version:
        // a new component SCSS partial is immediately available here without
        // publishing the lib first. The published package continues to include
        // the same file, so consumer builds are unaffected.
        importers: [
          {
            findFileUrl(url: string): URL | null {
              const match = url.match(/^@vialiq\/([^/]+)\/(.+)$/);
              if (!match) return null;
              const [, libName, subpath] = match;
              return pathToFileURL(
                path.resolve(workspaceRoot, 'libs', libName, subpath),
              );
            },
          },
        ],
      },
    },
  },
  build: {
    outDir: path.resolve(workspaceRoot, 'dist/libs/web-components'),
    emptyOutDir: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'button/vi-button': path.resolve(__dirname, 'src/button/vi-button.ts'),
        'input/vi-input': path.resolve(__dirname, 'src/input/vi-input.ts'),
        'icons/vi-icon': path.resolve(__dirname, 'src/icons/vi-icon.ts'),
        'icons/registry': path.resolve(__dirname, 'src/icons/registry.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'lit', 
        /^lit\//, 
        /^@lit\//,
        /^@vialiq\// // Ensures other workspace libraries are treated as external dependencies
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
});
