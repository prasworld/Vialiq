import { InjectionToken } from '@angular/core';

/**
 * Configuration for the form builder.
 * Provide via BUILDER_CONFIG token in your Angular providers.
 */
export interface BuilderConfig {
  /** How long (ms) to wait before creating a history snapshot after rapid changes. Default: 500 */
  historyDebounceMs: number;
  /** Maximum number of undo/redo snapshots to keep. Default: 100 */
  maxHistorySize: number;
  /**
   * Allow custom-js validation rules.
   * ⚠️  Disabled by default — requires explicit opt-in. Enabling allows eval()-like behaviour.
   * Requires a suitable Content Security Policy.
   */
  allowCustomJs: boolean;
  /** Restrict palette to specific categories. Omit to show all. */
  enabledCategories?: Array<'basic' | 'advanced' | 'layout'>;
  /**
   * Controls the display order of groups in the component palette.
   * Groups not listed here will appear after the listed groups, in registration order.
   * @example ['Basic Info', 'Text Inputs', 'Layout', 'Utilities']
   */
  groupOrder?: string[];
}

/** Default configuration */
export const DEFAULT_BUILDER_CONFIG: BuilderConfig = {
  historyDebounceMs: 500,
  maxHistorySize: 100,
  allowCustomJs: false,
};

/**
 * InjectionToken for BuilderConfig.
 * Falls back to DEFAULT_BUILDER_CONFIG if not provided.
 *
 * @example
 * providers: [
 *   {
 *     provide: BUILDER_CONFIG,
 *     useValue: { historyDebounceMs: 300, maxHistorySize: 50, allowCustomJs: false }
 *   }
 * ]
 */
export const BUILDER_CONFIG = new InjectionToken<BuilderConfig>('BUILDER_CONFIG', {
  providedIn: null,
  factory: () => DEFAULT_BUILDER_CONFIG,
});
