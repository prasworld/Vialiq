import 'reflect-metadata';
import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import sinon from 'sinon';
import { container } from 'tsyringe';
import './vi-toast.js';
import './vi-toast-container.js';
import type { ViToast } from './vi-toast.js';
import { ViToastService } from './vi-toast-service.js';

describe('vi-toast (Component)', () => {
  let wrapper: HTMLElement;

  beforeEach(() => {
    wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    wrapper.remove();
  });

  it('should render the message and title', async () => {
    render(html`
      <vi-toast title="Test Title" message="Test Message"></vi-toast>
    `, wrapper);
    
    const host = await $('vi-toast');
    await expect(host).toExist();

    const title = await host.shadow$('.toast-title');
    await expect(title).toExist();
    await expect(title).toHaveText('Test Title');

    const messageSlot = await host.shadow$('.toast-message slot');
    await expect(messageSlot).toHaveText('Test Message');
  });

  it('should render actions and emit event on click', async () => {
    render(html`
      <vi-toast .actions=${[{ label: 'Undo', action: 'undo' }]}></vi-toast>
    `, wrapper);
    
    const host = await $('vi-toast');
    const actionBtn = await host.shadow$('vi-button');
    await expect(actionBtn).toExist();
    await expect(actionBtn).toHaveText('Undo');

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vialiq-action', spy);

    await actionBtn.click();
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.action).toBe('undo');
  });

  it('should dispatch vialiq-close when close button is clicked', async () => {
    render(html`<vi-toast closable></vi-toast>`, wrapper);
    
    const host = await $('vi-toast');
    const closeBtn = await host.shadow$('vi-button[part="close-btn"]');
    await expect(closeBtn).toExist();

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vialiq-close', spy);

    await closeBtn.click();
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('user');
  });

  it('should auto-dismiss after duration', async () => {
    const clock = sinon.useFakeTimers();
    render(html`<vi-toast duration="1000"></vi-toast>`, wrapper);
    
    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vialiq-close', spy);

    clock.tick(1001);
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('auto');
    
    clock.restore();
  });
});

describe('ViToastService', () => {
  let toastService: ViToastService;

  beforeEach(() => {
    container.clearInstances();
    toastService = container.resolve(ViToastService);
    // Cleanup DOM between tests
    document.querySelectorAll('vi-toast-container').forEach(c => c.remove());
  });

  it('should show a toast in the default container', () => {
    toastService.show({ message: 'Hello Service', variant: 'success' });
    const host = document.querySelector('vi-toast-container[position="top-right"]');
    expect(host).not.toBeNull();
    
    const toast = host!.querySelector('vi-toast') as ViToast;
    expect(toast).not.toBeNull();
    expect(toast.message).toBe('Hello Service');
    expect(toast.variant).toBe('success');
  });

  it('should place toasts in different positional containers', () => {
    toastService.show({ message: 'Top Left', variant: 'info', position: 'top-left' });
    toastService.show({ message: 'Bottom Right', variant: 'info', position: 'bottom-right' });
    
    const topLeftContainer = document.querySelector('vi-toast-container[position="top-left"]');
    const bottomRightContainer = document.querySelector('vi-toast-container[position="bottom-right"]');
    
    expect(topLeftContainer).not.toBeNull();
    expect(bottomRightContainer).not.toBeNull();
    expect(topLeftContainer!.querySelector('vi-toast')).not.toBeNull();
    expect(bottomRightContainer!.querySelector('vi-toast')).not.toBeNull();
  });

  it('should enforce maxVisible limit per container', () => {
    toastService.configure({ maxVisible: 2 });
    
    toastService.show({ message: 'Toast 1', variant: 'info' });
    toastService.show({ message: 'Toast 2', variant: 'info' });
    toastService.show({ message: 'Toast 3', variant: 'info' }); 
    
    const domContainer = document.querySelector('vi-toast-container')!;
    const toasts = domContainer.querySelectorAll('vi-toast');
    
    expect(toasts.length).toBe(3); 
    expect(toasts[0].classList.contains('exiting')).toBe(true); 
    expect(toasts[1].classList.contains('exiting')).toBe(false);
    expect(toasts[2].classList.contains('exiting')).toBe(false);
  });

  it('should handle dismissAll', () => {
    toastService.show({ message: 'Toast 1', variant: 'info' });
    toastService.show({ message: 'Toast 2', variant: 'info' });
    
    toastService.dismissAll();
    
    const domContainer = document.querySelector('vi-toast-container')!;
    const toasts = domContainer.querySelectorAll('vi-toast');
    
    toasts.forEach(toast => {
      expect(toast.classList.contains('exiting')).toBe(true);
    });
  });
});
