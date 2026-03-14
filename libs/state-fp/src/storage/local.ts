/**
 * LocalAdapter — `window.localStorage` backed storage.
 * Data survives browser restarts. Capacity ~5–10 MB per origin.
 * TTL enforced via StorageEntry.x on read.
 */

import { WebStorageAdapter } from './base-web.js';

export class LocalAdapter extends WebStorageAdapter {
  readonly name = 'local';

  protected get storage(): Storage {
    if (typeof localStorage === 'undefined') {
      throw new Error('LocalAdapter: localStorage is not available in this environment.');
    }
    return localStorage;
  }
}
