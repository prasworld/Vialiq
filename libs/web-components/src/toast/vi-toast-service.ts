import 'reflect-metadata';
import { singleton } from 'tsyringe';
import './vi-toast.js';
import './vi-toast-container.js';
import { ViToast, type ToastVariant, type ToastAction } from './vi-toast.js';
import { type ToastPosition } from './vi-toast-container.js';

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

@singleton()
export class ViToastService {
  private _containers = new Map<ToastPosition, HTMLElement>();
  
  private _config: ToastServiceConfig = {
    position: 'top-right',
    maxVisible: 5,
    defaultDuration: 4000,
    animationDuration: 250,
  };

  /**
   * Configure global defaults for the toast service.
   * Call this once at app bootstrap.
   */
  public configure(config: Partial<ToastServiceConfig>) {
    this._config = { ...this._config, ...config };
    // Update existing containers with new maxVisible
    this._containers.forEach(container => {
      container.setAttribute('maxVisible', this._config.maxVisible.toString());
    });
  }

  private _ensureContainer(position: ToastPosition) {
    if (!this._containers.has(position)) {
      const container = document.createElement('vi-toast-container');
      container.setAttribute('position', position);
      container.setAttribute('maxVisible', this._config.maxVisible.toString());
      document.body.appendChild(container);
      this._containers.set(position, container);
    }
    return this._containers.get(position) as HTMLElement;
  }

  /**
   * Show a toast notification.
   */
  public show(options: ToastOptions): string {
    const position = options.position || this._config.position;
    const container = this._ensureContainer(position);
    const toastId = options.id || crypto.randomUUID();

    // Check if maxVisible is exceeded in this specific container
    const currentToasts = Array.from(container.querySelectorAll('vi-toast'));
    if (currentToasts.length >= this._config.maxVisible) {
      const excess = currentToasts.length - this._config.maxVisible + 1;
      for (let i = 0; i < excess; i++) {
        this.dismissElement(currentToasts[i] as ViToast);
      }
    }

    const toast = document.createElement('vi-toast') as ViToast;
    toast.id = toastId;
    toast.variant = options.variant;
    
    if (options.title) toast.title = options.title;
    if (options.message) toast.message = options.message;
    if (options.content) toast.appendChild(options.content);
    if (options.closeIcon) toast.closeIcon = options.closeIcon;
    if (options.className) toast.className = options.className;
    if (options.style) toast.setAttribute('style', options.style);
    
    toast.duration = options.duration ?? this._config.defaultDuration;
    if (options.closable !== undefined) toast.closable = options.closable;
    if (options.showProgress !== undefined) toast.showProgress = options.showProgress;
    if (options.actions) toast.actions = options.actions;

    // Listeners
    toast.addEventListener('vialiq-close', (e: Event) => {
      const customEvent = e as CustomEvent<{reason: 'auto' | 'user'}>;
      if (options.onClose) {
        options.onClose(customEvent.detail.reason);
      }
      this.dismissElement(toast);
    });

    toast.addEventListener('vialiq-action', (e: Event) => {
      const customEvent = e as CustomEvent<{action: string}>;
      if (options.onAction) {
        options.onAction(customEvent.detail.action);
      }
    });
    
    if (options.onClick) {
      toast.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        // Do not trigger onClick if clicking a button inside the toast
        if (!target.closest('vi-button')) {
          options.onClick?.();
        }
      });
    }

    // Animation entry
    toast.classList.add('entering');
    container.appendChild(toast);
    
    // Trigger reflow to ensure animation plays
    toast.getBoundingClientRect();
    
    requestAnimationFrame(() => {
      toast.classList.remove('entering');
    });

    return toastId;
  }

  /**
   * Dismiss a specific toast by its ID.
   */
  public dismiss(id: string) {
    this._containers.forEach(container => {
      const toast = container.querySelector(`vi-toast[id="${id}"]`) as ViToast;
      if (toast) {
        this.dismissElement(toast);
      }
    });
  }

  /**
   * Dismiss all visible toasts across all containers.
   */
  public dismissAll() {
    this._containers.forEach(container => {
      const toasts = container.querySelectorAll('vi-toast');
      toasts.forEach(toast => this.dismissElement(toast as ViToast));
    });
  }

  private dismissElement(toast: ViToast) {
    if (toast.classList.contains('exiting')) return;
    toast.classList.add('exiting');
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, this._config.animationDuration);
  }
}
