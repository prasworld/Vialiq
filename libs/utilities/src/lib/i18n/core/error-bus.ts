export type ErrorHandler = (error: unknown, context: string) => void;

export class GlobalErrorBus {
  private handlers = new Set<ErrorHandler>();

  /**
   * Subscribe to global translation/i18n errors.
   * Returns a cleanup function to unsubscribe.
   * Note: Subscribing disables the default fallback UI toast.
   */
  onError(handler: ErrorHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Emit an error to all subscribers, or show a fallback UI if no subscribers exist.
   */
  emit(error: unknown, context = 'Application Error'): void {
    if (this.handlers.size > 0) {
      this.handlers.forEach(h => h(error, context));
    } else {
      this.showFallbackToast(error, context);
    }
  }

  private showFallbackToast(error: unknown, context: string): void {
    if (typeof document === 'undefined') return;

    const toastId = 'vi18n-fallback-toast-container';
    let container = document.getElementById(toastId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = toastId;
      Object.assign(container.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: '9999',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    Object.assign(toast.style, {
      background: '#f44336',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '4px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      fontFamily: 'sans-serif',
      fontSize: '14px',
      maxWidth: '300px',
      wordBreak: 'break-word',
      opacity: '0',
      transform: 'translateY(10px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    });

    const message = error instanceof Error ? error.message : String(error);
    toast.innerHTML = `<strong>${context}</strong><br/>${message}`;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    // Auto-remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
}

export const errorBus = new GlobalErrorBus();
