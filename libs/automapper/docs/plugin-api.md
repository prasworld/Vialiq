# Plugin API — automapper

This document describes the runtime plugin contract and examples for
creating and installing plugins into the `automapper` registry.

## Plugin metadata

Every plugin exports a `metadata` object with these fields:

- `id` (string): unique plugin identifier
- `name` (string)
- `version` (string)
- `apiVersion` (string): the plugin API version the plugin targets. The
  runtime exposes `PLUGIN_API_VERSION` for reference.

Example metadata:

```ts
const metadata = {
  id: 'example.logging',
  name: 'Logging',
  version: '1.0.0',
  apiVersion: PLUGIN_API_VERSION,
  description: 'Simple console logging plugin',
};
```

## Lifecycle hooks

- `onInstall(registry: PluginAwareRegistry)?: void` — called when the plugin
  is installed via `mapper.use(plugin)`. If this throws, installation is
  rolled back and the plugin is not registered.
- `onProfileAdded?(profileKey: string, config: any): void` — called when a
  mapping profile is added.
- `onMapStart?(src: unknown, destType: unknown): void` — invoked before each
  mapping operation. Errors thrown by this hook are swallowed to avoid
  breaking mapping.
- `onMapEnd?(src: unknown, result: unknown, durationMs: number): void` —
  invoked after successful mapping. Hook errors are swallowed.
- `onMapError?(src: unknown, destType: unknown, err: Error): void` — invoked
  when mapping fails; hook errors are swallowed.

## Strategy

A plugin must provide a `strategy` implementing the `MappingStrategy`
interface. The registry inserts the plugin's strategy at the front of the
pipeline so it may choose to handle or delegate mapping.

## Best practices

- Set `apiVersion` to `PLUGIN_API_VERSION` when targeting the current runtime
  API.
- Keep lifecycle hooks resilient — avoid long-running synchronous work in
  `onInstall` if possible. If `onInstall` must perform risky work, ensure it
  leaves the registry in a consistent state or let the runtime rollback the
  install by throwing.

## Example: simple logging plugin

```ts
import { PLUGIN_API_VERSION, MapperPlugin } from '@vi/automapper';

export const LoggingPlugin = (logger = console): MapperPlugin => ({
  metadata: {
    id: 'logging',
    name: 'Logging',
    version: '1.0.0',
    apiVersion: PLUGIN_API_VERSION,
    description: 'Logs mapping start/end',
  },
  strategy: {
    canHandle: () => false, // not a mapping strategy itself
    map: () => { throw new Error('not used'); },
  },
  onMapStart: (src, dest) => logger.debug('map start', src, dest),
  onMapEnd: (src, res, d) => logger.debug('map end', res, `${d}ms`),
});
```

Install with:

```ts
const m = createMapper();
m.use(LoggingPlugin(console));
```
