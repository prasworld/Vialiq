import { ToastVariant, ToastAction } from './vi-toast.js';
import { ToastPosition } from './vi-toast-container.js';
export interface ToastOptions {
    variant: ToastVariant;
    title?: string;
    message?: string;
    content?: Node;
    duration?: number;
    closable?: boolean;
    closeIcon?: string;
    showProgress?: boolean;
    actions?: ToastAction[];
    position?: ToastPosition;
    className?: string;
    style?: string;
    onClose?: (reason: 'auto' | 'user') => void;
    onAction?: (action: string) => void;
    onClick?: () => void;
    id?: string;
}
export interface ToastServiceConfig {
    position: ToastPosition;
    maxVisible: number;
    defaultDuration: number;
    animationDuration: number;
}
export declare class ViToastService {
    private _containers;
    private _config;
    /**
     * Configure global defaults for the toast service.
     * Call this once at app bootstrap.
     */
    configure(config: Partial<ToastServiceConfig>): void;
    private _ensureContainer;
    /**
     * Show a toast notification.
     */
    show(options: ToastOptions): string;
    /**
     * Dismiss a specific toast by its ID.
     */
    dismiss(id: string): void;
    /**
     * Dismiss all visible toasts across all containers.
     */
    dismissAll(): void;
    private dismissElement;
}
//# sourceMappingURL=vi-toast-service.d.ts.map