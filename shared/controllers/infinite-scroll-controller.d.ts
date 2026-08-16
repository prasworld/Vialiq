import { ReactiveController, ReactiveControllerHost } from 'lit';
export interface InfiniteScrollControllerOptions {
    enabled?: () => boolean;
    listbox: () => HTMLElement | null;
    sentinelTop: () => HTMLElement | null;
    sentinelBottom: () => HTMLElement | null;
    rootMargin?: string;
}
export declare class InfiniteScrollController implements ReactiveController {
    private host;
    private options;
    private _observer;
    constructor(host: ReactiveControllerHost & HTMLElement, options: InfiniteScrollControllerOptions);
    hostUpdated(): void;
    hostDisconnected(): void;
    private _connectObserver;
    private _disconnectObserver;
}
//# sourceMappingURL=infinite-scroll-controller.d.ts.map