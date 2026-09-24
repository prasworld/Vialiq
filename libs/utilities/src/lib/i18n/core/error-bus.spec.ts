import { GlobalErrorBus } from './error-bus';
import { vi } from 'vitest';

describe('GlobalErrorBus', () => {
  let errorBus: GlobalErrorBus;

  beforeEach(() => {
    errorBus = new GlobalErrorBus();
    // Clean up DOM between tests
    const container = document.getElementById('vi18n-fallback-toast-container');
    if (container) {
      container.remove();
    }
  });

  it('should notify subscribers on emit', () => {
    const handler = vi.fn();
    errorBus.onError(handler);
    
    errorBus.emit(new Error('Test error'), 'Test context');
    
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(Error), 'Test context');
  });

  it('should allow unsubscribing', () => {
    const handler = vi.fn();
    const unsubscribe = errorBus.onError(handler);
    
    unsubscribe();
    errorBus.emit(new Error('Test error'), 'Test context');
    
    expect(handler).not.toHaveBeenCalled();
  });

  it('should show fallback toast if no subscribers', () => {
    errorBus.emit(new Error('Toast error'), 'Toast context');
    
    const container = document.getElementById('vi18n-fallback-toast-container');
    expect(container).toBeTruthy();
    expect(container?.innerHTML).toContain('Toast context');
    expect(container?.innerHTML).toContain('Toast error');
  });

  it('should NOT show fallback toast if there are subscribers', () => {
    errorBus.onError(vi.fn());
    errorBus.emit(new Error('Hidden error'), 'Hidden context');
    
    const container = document.getElementById('vi18n-fallback-toast-container');
    expect(container).toBeFalsy();
  });
});
