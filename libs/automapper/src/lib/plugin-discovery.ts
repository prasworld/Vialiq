import { PluginMetadata } from './plugin';

/**
 * A factory function that creates a MapperPlugin instance.
 * Stored alongside plugin metadata so consumers can instantiate
 * and install the plugin via `mapper.use(factory())`.
 */
export type PluginFactory = () => import('./plugin').MapperPlugin;

/**
 * Entry stored in the discovery registry — metadata plus a factory
 * function that creates a fresh plugin instance.
 */
export interface DiscoveryEntry {
  metadata: PluginMetadata;
  factory: PluginFactory;
}

/**
 * Global singleton plugin discovery registry.
 *
 * Plugins follow the naming convention `@vi/automapper-plugin-<name>` (npm)
 * and self-register on import by calling `PluginDiscoveryRegistry.register()`.
 * Consumers can then call `PluginDiscoveryRegistry.discover()` to list
 * all available plugins without manually knowing each plugin's import path.
 *
 * @example
 * // In a plugin package's entry point:
 * PluginDiscoveryRegistry.register(loggingPluginMetadata, () => new LoggingPlugin());
 *
 * // In consumer code:
 * const entries = PluginDiscoveryRegistry.discover();
 * entries.forEach(e => mapper.use(e.factory()));
 */
export class PluginDiscoveryRegistry {
  private static readonly entries = new Map<string, DiscoveryEntry>();

  /**
   * Register a plugin with the discovery registry.
   * Calling this multiple times with the same `metadata.id` is idempotent —
   * the last registration wins (allows re-registration during hot module
   * replacement or test resets).
   */
  static register(metadata: PluginMetadata, factory: PluginFactory): void {
    PluginDiscoveryRegistry.entries.set(metadata.id, { metadata, factory });
  }

  /**
   * Return all registered plugin entries in registration order.
   */
  static discover(): DiscoveryEntry[] {
    return [...PluginDiscoveryRegistry.entries.values()];
  }

  /**
   * Look up a registered entry by plugin id.
   * Returns `undefined` if the plugin is not registered.
   */
  static find(id: string): DiscoveryEntry | undefined {
    return PluginDiscoveryRegistry.entries.get(id);
  }

  /**
   * Check whether a plugin is already registered.
   */
  static has(id: string): boolean {
    return PluginDiscoveryRegistry.entries.has(id);
  }

  /**
   * Remove a plugin from the registry.
   * Useful for test teardown and hot-reload scenarios.
   */
  static unregister(id: string): void {
    PluginDiscoveryRegistry.entries.delete(id);
  }

  /**
   * Clear all registered plugins.
   * Intended for test isolation — not for production use.
   */
  static clear(): void {
    PluginDiscoveryRegistry.entries.clear();
  }
}
