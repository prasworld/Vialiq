import { ReactiveController, ReactiveControllerHost } from 'lit';

export interface InfiniteScrollControllerOptions {
  listbox: () => HTMLElement | null;
  sentinelTop: () => HTMLElement | null;
  sentinelBottom: () => HTMLElement | null;
  rootMargin?: string;
}

export class InfiniteScrollController implements ReactiveController {
  private _observer: IntersectionObserver | null = null;

  constructor(
    private host: ReactiveControllerHost & HTMLElement,
    private options: InfiniteScrollControllerOptions
  ) {
    this.host.addController(this);
  }

  hostUpdated() {
    this._connectObserver();
  }

  hostDisconnected() {
    this._disconnectObserver();
  }

  private _connectObserver() {
    const listbox = this.options.listbox();
    const top = this.options.sentinelTop();
    const bottom = this.options.sentinelBottom();

    if ((top || bottom) && !this._observer) {
      this._observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              // Usually the sentinels might have a class to distinguish, but object identity works best
              const direction = entry.target === top ? 'up' : 'down';
              this.host.dispatchEvent(
                new CustomEvent('vi-load-more', {
                  bubbles: true,
                  composed: true,
                  detail: { id: this.host.id || '', direction },
                })
              );
            }
          }
        },
        {
          root: listbox,
          rootMargin: this.options.rootMargin ?? '100px',
          threshold: 0,
        }
      );

      if (top) this._observer.observe(top);
      if (bottom) this._observer.observe(bottom);
    }
  }

  private _disconnectObserver() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}
