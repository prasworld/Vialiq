import 'reflect-metadata';
import { singleton } from 'tsyringe';
import './vi-message.js';
import './vi-message-container.js';
import { ViMessage, type MessageVariant } from './vi-message.js';

export interface MessageOptions {
  variant?: MessageVariant;
  content: string;
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

@singleton()
export class ViMessageService {
  private _container: HTMLElement | null = null;
  
  private _config: MessageServiceConfig = {
    maxVisible: 5,
    defaultDuration: 3000,
    animationDuration: 300,
  };

  /**
   * Configure global defaults for the message service.
   */
  public configure(config: Partial<MessageServiceConfig>) {
    this._config = { ...this._config, ...config };
    if (this._container) {
      this._container.setAttribute('maxVisible', this._config.maxVisible.toString());
    }
  }

  private _ensureContainer() {
    if (!this._container) {
      this._container = document.createElement('vi-message-container');
      this._container.setAttribute('maxVisible', this._config.maxVisible.toString());
      document.body.appendChild(this._container);
    }
    return this._container;
  }

  /**
   * Show a message notification.
   */
  public show(options: MessageOptions): string {
    const container = this._ensureContainer();
    const messageId = options.id || crypto.randomUUID();

    // Check if maxVisible is exceeded
    const currentMessages = Array.from(container.querySelectorAll('vi-message'));
    if (currentMessages.length >= this._config.maxVisible) {
      const excess = currentMessages.length - this._config.maxVisible + 1;
      for (let i = 0; i < excess; i++) {
        this.dismissElement(currentMessages[i] as ViMessage);
      }
    }

    const message = document.createElement('vi-message') as ViMessage;
    message.id = messageId;
    message.variant = options.variant || 'info';
    message.content = options.content;
    
    if (options.icon) message.icon = options.icon;
    if (options.className) message.className = options.className;
    if (options.style) message.setAttribute('style', options.style);
    
    message.duration = options.duration !== undefined ? options.duration : this._config.defaultDuration;

    // Listeners
    message.addEventListener('vialiq-close', (e: Event) => {
      const customEvent = e as CustomEvent<{reason: 'auto' | 'user'}>;
      if (options.onClose) {
        options.onClose(customEvent.detail.reason);
      }
      this.dismissElement(message);
    });

    // Animation entry
    message.classList.add('entering');
    container.appendChild(message);
    
    // Trigger reflow to ensure animation plays
    message.getBoundingClientRect();
    
    requestAnimationFrame(() => {
      message.classList.remove('entering');
    });

    return messageId;
  }

  public info(content: string, duration?: number): string {
    return this.show({ variant: 'info', content, duration });
  }

  public success(content: string, duration?: number): string {
    return this.show({ variant: 'success', content, duration });
  }

  public error(content: string, duration?: number): string {
    return this.show({ variant: 'error', content, duration });
  }

  public warning(content: string, duration?: number): string {
    return this.show({ variant: 'warning', content, duration });
  }

  public loading(content: string, duration = 0): string {
    return this.show({ variant: 'loading', content, duration });
  }

  /**
   * Dismiss a specific message by its ID.
   */
  public dismiss(id: string) {
    if (!this._container) return;
    const message = this._container.querySelector(`vi-message[id="${id}"]`) as ViMessage;
    if (message) {
      this.dismissElement(message);
    }
  }

  /**
   * Dismiss all visible messages.
   */
  public dismissAll() {
    if (!this._container) return;
    const messages = this._container.querySelectorAll('vi-message');
    messages.forEach(msg => this.dismissElement(msg as ViMessage));
  }

  private dismissElement(message: ViMessage) {
    if (message.classList.contains('exiting')) return;
    message.classList.add('exiting');
    
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, this._config.animationDuration);
  }
}
