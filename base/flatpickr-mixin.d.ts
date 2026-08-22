import { LitElement } from 'lit';
import { Instance } from 'flatpickr/dist/types/instance';
import { Options } from 'flatpickr/dist/types/options';
import { DatePickerMode, DatePickerPluginInput } from '../date-picker/types.js';
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
    protected _initFlatpickr(config: Partial<Options>, mode?: DatePickerMode, resolvedLocale?: string): Promise<void>;
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
export declare function FlatpickrMixin<T extends Constructor<LitElement>>(Base: T): Constructor<FlatpickrMixinInterface> & T;
export {};
//# sourceMappingURL=flatpickr-mixin.d.ts.map