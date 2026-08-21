import { LitElement } from 'lit';
import type { Instance, FlatpickrFn } from 'flatpickr/dist/types/instance';
import type { Options } from 'flatpickr/dist/types/options';
import type {
  DatePickerMode,
  DatePickerPluginInput,
} from '../date-picker/types.js';
import { loadLocale } from '../date-picker/locale-registry.js';
import { loadModePlugin } from '../date-picker/plugin-registry.js';
import { mergePlugins } from '../date-picker/plugin-utils.js';
import { resolveLocale } from '../date-picker/i18n.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Type-only declaration of the members FlatpickrMixin adds to a class.
 * `declare class` emits no runtime code — it is a TS-only contract.
 */
export declare class FlatpickrMixinInterface {
  /** The live flatpickr instance, or null if not yet initialised. */
  protected _fp: Instance | null;

  /** Consumer-provided additional plugins. */
  plugins: DatePickerPluginInput[];

  /** Returns the hidden <input> element flatpickr should bind to. Override in subclass. */
  protected _getHiddenInput(): HTMLInputElement | null;

  /**
   * Initialises flatpickr. Loads locale, mode plugin, and the flatpickr module
   * in parallel, then mounts it on the hidden input.
   */
  protected _initFlatpickr(
    config: Partial<Options>,
    mode?: DatePickerMode,
    resolvedLocale?: string,
  ): Promise<void>;

  /** Destroys the current flatpickr instance cleanly. */
  protected _destroyFlatpickr(): void;
}

/**
 * FlatpickrMixin — abstract base mixin that manages a flatpickr lifecycle.
 *
 * Usage:
 *   class MyPicker extends FlatpickrMixin(ViElement) { ... }
 *
 * The subclass must:
 *  1. Call `_initFlatpickr(config, mode, resolvedLocale)` in `firstUpdated()`.
 *  2. Override `_getHiddenInput()` to return the `<input type="hidden">` element
 *     flatpickr should attach to.
 */
export function FlatpickrMixin<T extends Constructor<LitElement>>(Base: T) {
  abstract class FlatpickrMixinClass extends Base {
    /** Live flatpickr instance — null before init or after destroy. */
    protected _fp: Instance | null = null;

    /**
     * Consumer-provided plugins (in addition to the mode plugin).
     * Not reflected as an attribute — set via JS property only.
     */
    plugins: DatePickerPluginInput[] = [];

    /**
     * Returns the hidden input flatpickr should mount on.
     * Subclasses override this with `@query('#fp-input')`.
     */
    protected _getHiddenInput(): HTMLInputElement | null {
      return null;
    }

    /**
     * Initialises flatpickr with the given config and optional mode.
     * Loads the flatpickr module, locale, and mode plugin in parallel.
     */
    protected async _initFlatpickr(
      config: Partial<Options>,
      mode: DatePickerMode = 'date',
      resolvedLocale: string = resolveLocale(null),
    ): Promise<void> {
      // Destroy any previous instance first (e.g. locale change triggers re-init)
      this._destroyFlatpickr();

      const input = this._getHiddenInput();
      if (!input) return;

      // Load flatpickr module, locale, and mode plugin in parallel
      const [{ default: flatpickr }, locale, modePlugin] = await Promise.all([
        import('flatpickr') as Promise<{ default: FlatpickrFn }>,
        loadLocale(resolvedLocale),
        loadModePlugin(mode),
      ]);

      // Resolve raw Plugin[] from ViDatePickerPlugin wrappers + consumer plugins + internal config plugins
      const modePluginFactory = modePlugin ? modePlugin.factory : null;
      const mergedPlugins = mergePlugins(modePluginFactory, this.plugins);
      const allPlugins = [...(config.plugins || []), ...mergedPlugins];

      const fpConfig: Partial<Options> = {
        appendTo: document.body,
        disableMobile: true,
        static: false,
        ...config,
        plugins: allPlugins,
        ...(locale ? { locale } : {}),
      };

      this._fp = flatpickr(input, fpConfig as Options);
    }

    /** Destroys the current flatpickr instance and clears the reference. */
    protected _destroyFlatpickr(): void {
      if (this._fp) {
        this._fp.destroy();
        this._fp = null;
      }
    }

    override disconnectedCallback(): void {
      super.disconnectedCallback();
      this._destroyFlatpickr();
    }
  }

  return FlatpickrMixinClass as unknown as Constructor<FlatpickrMixinInterface> & T;
}
