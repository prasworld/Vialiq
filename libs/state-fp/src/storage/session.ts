/**
 * SessionAdapter — `window.sessionStorage` backed storage.
 * Data survives page reloads within the same tab session.
 * Cleared when the tab is closed. Capacity ~5 MB per origin.
 */

import { WebStorageAdapter } from './base-web.js';

export class SessionAdapter extends WebStorageAdapter {
  readonly name = 'session';

  protected get storage(): Storage {
    if (typeof sessionStorage === 'undefined') {
      throw new Error('SessionAdapter: sessionStorage is not available in this environment.');
    }
    return sessionStorage;
  }
}
