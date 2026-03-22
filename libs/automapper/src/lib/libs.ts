/**
 * Entry-point barrel file re-exporting all public symbols from the
 * various modules.  Consumers may import from `automapper` directly.
 */
export * from './options';
export * from './naming';
export * from './converters';
export * from './builder';
export * from './core';
export * from './async';
export * from './profiling';
export * from './plugins/logging';
export * from './resolver-helpers';
export { DefaultStrategy } from './strategy';
export type { MappingStrategy } from './strategy';
export * from './plugin';
export * from './context';
export * from './plugin-discovery';
