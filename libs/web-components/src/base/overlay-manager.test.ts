import { expect } from '@wdio/globals';
import { OverlayManager } from './overlay-manager.js';

describe('OverlayManager', () => {
  let el1: HTMLElement;
  let el2: HTMLElement;
  let el3: HTMLElement;

  beforeEach(() => {
    // Clear out any registered overlays in the singleton before each test
    // To do this properly without exposing private methods, we just unregister what we create
    el1 = document.createElement('div');
    el2 = document.createElement('div');
    el3 = document.createElement('div');
    document.body.appendChild(el1);
    document.body.appendChild(el2);
    document.body.appendChild(el3);
  });

  afterEach(() => {
    OverlayManager.unregister(el1);
    OverlayManager.unregister(el2);
    OverlayManager.unregister(el3);
    el1.remove();
    el2.remove();
    el3.remove();
    // Ensure body scroll lock is cleared
    document.body.classList.remove('vi-scroll-locked');
    document.body.style.removeProperty('overflow');
  });

  it('registers elements and assigns escalating z-indices', () => {
    const z1 = OverlayManager.register(el1, 'dropdown');
    const z2 = OverlayManager.register(el2, 'tooltip');

    // The base z-index is typically 1040, so z1 should be 1050, z2 should be 1060
    expect(z1).toBeGreaterThanOrEqual(1040);
    expect(z2).toBe(z1 + 10);
  });

  it('prevents duplicate registrations from increasing z-index', () => {
    const z1 = OverlayManager.register(el1, 'dropdown');
    const z2 = OverlayManager.register(el1, 'dropdown'); // Re-register same element

    expect(z1).toBe(z2);
  });

  it('can unregister an element', () => {
    const z1 = OverlayManager.register(el1, 'dropdown');
    expect(OverlayManager.getZIndex(el1)).toBe(z1);

    OverlayManager.unregister(el1);
    expect(OverlayManager.getZIndex(el1)).toBeNull();
  });

  it('correctly identifies the top overlay', () => {
    OverlayManager.register(el1, 'dropdown');
    OverlayManager.register(el2, 'modal');

    expect(OverlayManager.isTopOverlay(el1)).toBe(false);
    expect(OverlayManager.isTopOverlay(el2)).toBe(true);
    expect(OverlayManager.isTopOverlay(el3)).toBe(false); // Never registered
  });

  it('locks body scroll when a modal is registered, and restores it when unregistered', () => {
    expect(document.body.classList.contains('vi-scroll-locked')).toBe(false);

    // Non-modal shouldn't lock scroll
    OverlayManager.register(el1, 'dropdown');
    expect(document.body.classList.contains('vi-scroll-locked')).toBe(false);

    // Modal should lock scroll
    OverlayManager.register(el2, 'modal');
    expect(document.body.classList.contains('vi-scroll-locked')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    // Unregistering modal should unlock scroll
    OverlayManager.unregister(el2);
    expect(document.body.classList.contains('vi-scroll-locked')).toBe(false);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('dynamically reads base z-index from css variables on each registration', () => {
    // Set a custom css variable on the element to simulate a theme change or scoped theme
    el1.style.setProperty('--vi-modal-z-index', '5000');
    const z1 = OverlayManager.register(el1, 'modal');
    // parsed is 5000, subtract 10 for base = 4990, add 10 for first overlay = 5000
    expect(z1).toBe(5000);

    // Another element with a different scope
    el2.style.setProperty('--vi-modal-z-index', '8000');
    const z2 = OverlayManager.register(el2, 'modal');
    // base is 8000-10 = 7990. Current max overlay is 5000.
    // highestZIndex becomes max(5000, 7990) = 7990. Add 10 = 8000.
    expect(z2).toBe(8000);
  });
});
