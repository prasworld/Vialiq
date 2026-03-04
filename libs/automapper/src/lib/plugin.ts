import type { MappingStrategy } from './strategy';
import type { MapperRegistry as BaseMapperRegistry } from './core';

/** Semver string of the plugin API this plugin targets. */
export const PLUGIN_API_VERSION = '1.0.0';

/**
 * Metadata attached to every plugin. Used by the registry for logging,
 * validation, and version compatibility checks.
 */
export interface PluginMetadata {
  /** Unique reverse-domain identifier: e.g. "com.vi.logging" */
  id: string;
  /** Human-readable name */
  name: string;
  /** Semver version of the plugin itself */
  version: string;
  /** Plugin API version it was compiled against */
  apiVersion: string;
  /** Optional description */
  description?: string;
}

/**
 * Lifecycle interface that plugins may implement.  Each method is optional;
 * the registry calls them when the corresponding event occurs.
 */
export interface PluginLifecycle {
  onInstall?(registry: PluginAwareRegistry): void;
  onProfileAdded?(key: string, config: unknown): void;
  onMapStart?(src: unknown, destType: unknown): void;
  onMapEnd?(src: unknown, dest: unknown, durationMs: number): void;
  onMapError?(src: unknown, destType: unknown, error: Error): void;
}

/**
 * Full plugin contract. A plugin must provide metadata and implement
 * MappingStrategy.  PluginLifecycle is optional.
 */
export interface MapperPlugin extends Partial<PluginLifecycle> {
  readonly metadata: PluginMetadata;
  readonly strategy: MappingStrategy;
}

/**
 * Extended registry interface exposed to plugins.
 */
export interface PluginAwareRegistry extends BaseMapperRegistry {
  use(plugin: MapperPlugin): void;
  installedPlugins(): PluginMetadata[];
  hasPlugin(id: string): boolean;
}
