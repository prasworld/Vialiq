import { defineConfig } from 'vite';
import path from 'path';
import { pathToFileURL } from 'url';
import fs from 'node:fs';
import dts from 'vite-plugin-dts';
import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

const workspaceRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  // root must be set explicitly so the @nx/vite:build executor resolves the
  // relative outDir it computes (../../dist/libs/web-components) from this
  // project dir rather than from process.cwd() (workspace root), which would
  // place output two levels above the workspace root.
  root: __dirname,
  esbuild: false,
  resolve: {
    alias: [
      { find: /^flatpickr\/l10n\/(.+)$/, replacement: 'flatpickr/dist/l10n/$1' },
      { find: /^flatpickr\/plugins\/(.+)$/, replacement: 'flatpickr/dist/plugins/$1' },
    ],
  },
  optimizeDeps: {
    exclude: ['@vialiq/icons'],
  },
  plugins: [
    swc.vite({
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { decoratorVersion: '2022-03' },
      },
      module: { type: 'es6' },
    }),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
      pathsToAliases: false,
    }),
    tsconfigPaths(),
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

              const basePath = path.resolve(
                workspaceRoot,
                'libs',
                libName,
                subpath,
              );
              const dir = path.dirname(basePath);
              const base = path.basename(basePath);
              const ext = path.extname(basePath);

              if (ext === '.scss' || ext === '.css') {
                if (fs.existsSync(basePath)) {
                  return pathToFileURL(basePath);
                }
                if (!base.startsWith('_')) {
                  const partial = path.join(dir, `_${base}`);
                  if (fs.existsSync(partial)) {
                    return pathToFileURL(partial);
                  }
                }
                return null;
              }

              const candidates = [
                path.join(dir, `_${base}.scss`),
                path.join(dir, `${base}.scss`),
                path.join(dir, `_${base}.css`),
                path.join(dir, `${base}.css`),
                path.join(basePath, `_index.scss`),
                path.join(basePath, `index.scss`),
                path.join(basePath, `_index.css`),
                path.join(basePath, `index.css`),
              ];

              for (const candidate of candidates) {
                if (fs.existsSync(candidate)) {
                  return pathToFileURL(candidate);
                }
              }

              return null;
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
        'button/index': path.resolve(__dirname, 'src/button/index.ts'),
        'input/vi-input': path.resolve(__dirname, 'src/input/vi-input.ts'),
        'input/index': path.resolve(__dirname, 'src/input/index.ts'),
        'icons/vi-icon': path.resolve(__dirname, 'src/icons/vi-icon.ts'),
        'icons/registry': path.resolve(__dirname, 'src/icons/registry.ts'),
        'radio/vi-radio': path.resolve(__dirname, 'src/radio/vi-radio.ts'),
        'radio/vi-radio-group': path.resolve(
          __dirname,
          'src/radio/vi-radio-group.ts',
        ),
        'radio/index': path.resolve(__dirname, 'src/radio/index.ts'),
        'checkbox/vi-checkbox': path.resolve(
          __dirname,
          'src/checkbox/vi-checkbox.ts',
        ),
        'checkbox/index': path.resolve(__dirname, 'src/checkbox/index.ts'),
        'tooltip/vi-tooltip': path.resolve(
          __dirname,
          'src/tooltip/vi-tooltip.ts',
        ),
        'tooltip/index': path.resolve(__dirname, 'src/tooltip/index.ts'),
        'textarea/vi-textarea': path.resolve(
          __dirname,
          'src/textarea/vi-textarea.ts',
        ),
        'textarea/index': path.resolve(__dirname, 'src/textarea/index.ts'),
        'accordion/vi-accordion': path.resolve(
          __dirname,
          'src/accordion/vi-accordion.ts',
        ),
        'accordion/vi-accordion-item': path.resolve(
          __dirname,
          'src/accordion/vi-accordion-item.ts',
        ),
        'accordion/index': path.resolve(__dirname, 'src/accordion/index.ts'),
        'alert/vi-alert': path.resolve(__dirname, 'src/alert/vi-alert.ts'),
        'badge/vi-badge': path.resolve(__dirname, 'src/badge/vi-badge.ts'),
        'badge/index': path.resolve(__dirname, 'src/badge/index.ts'),
        'chip/vi-chip': path.resolve(__dirname, 'src/chip/vi-chip.ts'),
        'chip/vi-chip-group': path.resolve(__dirname, 'src/chip/vi-chip-group.ts'),
        'chip/index': path.resolve(__dirname, 'src/chip/index.ts'),
        'animation/vi-animation': path.resolve(__dirname, 'src/animation/vi-animation.ts'),
        'combobox/vi-combobox': path.resolve(__dirname, 'src/combobox/vi-combobox.ts'),
        'combobox/vi-combobox-item': path.resolve(__dirname, 'src/combobox/vi-combobox-item.ts'),
        'combobox/index': path.resolve(__dirname, 'src/combobox/index.ts'),
        'modal/vi-modal': path.resolve(__dirname, 'src/modal/vi-modal.ts'),
        'modal/vi-modal-header': path.resolve(__dirname, 'src/modal/vi-modal-header.ts'),
        'modal/vi-modal-footer': path.resolve(__dirname, 'src/modal/vi-modal-footer.ts'),
        'tag/vi-tag': path.resolve(__dirname, 'src/tag/vi-tag.ts'),
        'tag/index': path.resolve(__dirname, 'src/tag/index.ts'),
        'switch/vi-switch': path.resolve(__dirname, 'src/switch/vi-switch.ts'),
        'switch/index': path.resolve(__dirname, 'src/switch/index.ts'),
        'select/vi-select': path.resolve(__dirname, 'src/select/vi-select.ts'),
        'select/vi-select-option': path.resolve(__dirname, 'src/select/vi-select-option.ts'),
        'select/vi-select-group': path.resolve(__dirname, 'src/select/vi-select-group.ts'),
        'select/index': path.resolve(__dirname, 'src/select/index.ts'),
        'date-picker/vi-date-picker': path.resolve(__dirname, 'src/date-picker/vi-date-picker.ts'),
        'date-picker/vi-date-picker-input': path.resolve(__dirname, 'src/date-picker/vi-date-picker-input.ts'),
        'date-picker/index': path.resolve(__dirname, 'src/date-picker/index.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'lit',
        /^lit\//,
        /^@lit\//,
        '@floating-ui/dom',
        /^@floating-ui\//,
        /^@vialiq\//, // Ensures other workspace libraries are treated as external dependencies
      ],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
});
