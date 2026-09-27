import { MessageVariant } from './vi-message.js';
export interface MessageOptions {
    variant?: MessageVariant;
    content: string | Node;
    duration?: number;
    icon?: string;
    className?: string;
    style?: string;
    onClose?: (reason: 'auto' | 'user') => void;
    id?: string;
}
export interface MessageServiceConfig {
    maxVisible: number;
    defaultDuration: number;
    animationDuration: number;
}
export declare class ViMessageService {
    private _container;
    private _config;
    /**
     * Configure global defaults for the message service.
     */
    configure(config: Partial<MessageServiceConfig>): void;
    private _ensureContainer;
    /**
     * Show a message notification.
     */
    show(options: MessageOptions): string;
    info(content: string | Node, duration?: number): string;
    success(content: string | Node, duration?: number): string;
    error(content: string | Node, duration?: number): string;
    warning(content: string | Node, duration?: number): string;
    loading(content: string | Node, duration?: number): string;
    /**
     * Dismiss a specific message by its ID.
     */
    dismiss(id: string): void;
    /**
     * Dismiss all visible messages.
     */
    dismissAll(): void;
    private dismissElement;
}
//# sourceMappingURL=vi-message-service.d.ts.map