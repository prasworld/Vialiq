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
    sinon.restore();
  });

  it('should render the message and title', async () => {
    render(
      html` <vi-toast title="Test Title" message="Test Message"></vi-toast> `,
      wrapper,
    );

    const host = await $('vi-toast');
    await expect(host).toExist();

    const title = await host.shadow$('.toast-title');
    await expect(title).toExist();
    await expect(title).toHaveText('Test Title');

    const messageSlot = await host.shadow$('.toast-message slot');
    await expect(messageSlot).toHaveText('Test Message');
  });

  it('should render actions and emit event on click', async () => {
    render(
      html`
        <vi-toast .actions=${[{ label: 'Undo', action: 'undo' }]}></vi-toast>
      `,
      wrapper,
    );

    const host = await $('vi-toast');
    const actionBtn = await host.shadow$('vi-button');
    await expect(actionBtn).toExist();
    await expect(actionBtn).toHaveText('Undo');

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vi-toast-action', spy);

    await actionBtn.click();
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.action).toBe('undo');
  });

  it('should dispatch vi-toast-close when close button is clicked', async () => {
    render(html`<vi-toast closable></vi-toast>`, wrapper);

    const host = await $('vi-toast');
    const closeBtn = await host.shadow$('vi-button[part="close-btn"]');
    await expect(closeBtn).toExist();

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vi-toast-close', spy);

    await closeBtn.click();
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('user');
  });

  it('should auto-dismiss after duration', async () => {
    const clock = sinon.useFakeTimers();
    render(html`<vi-toast duration="1000"></vi-toast>`, wrapper);

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vi-toast-close', spy);

    clock.tick(1001);
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('auto');
  });

  it('should pause and resume timer on paused property change', async () => {
    const clock = sinon.useFakeTimers();
    render(html`<vi-toast duration="1000"></vi-toast>`, wrapper);

    const el = document.querySelector('vi-toast') as ViToast;
    const spy = sinon.spy();
    el.addEventListener('vi-toast-close', spy);

    clock.tick(500); // Wait half time
    el.paused = true;
    await el.updateComplete;
    clock.tick(1000); // This shouldn't dismiss since paused
    expect(spy.called).toBe(false);

    el.paused = false;
    await el.updateComplete;
    clock.tick(501); // Remaining time
    expect(spy.calledOnce).toBe(true);
  });

  it('should return correct default icon based on variant', async () => {
    render(html`<vi-toast variant="warning"></vi-toast>`, wrapper);
    const el = document.querySelector('vi-toast') as ViToast;
    expect(el['defaultIcon']).toBe('triangle-warning');

    el.variant = 'danger';
    expect(el['defaultIcon']).toBe('circle-x');

    el.variant = 'success';
    expect(el['defaultIcon']).toBe('check-circle');
  });

  it('should clear timer on disconnect', async () => {
    sinon.useFakeTimers();
    render(html`<vi-toast duration="1000"></vi-toast>`, wrapper);
    const el = document.querySelector('vi-toast') as ViToast;

    expect(el['_timer']).not.toBeNull();
    el.remove(); // trigger disconnectedCallback
    expect(el['_timer']).toBeNull();
  });
});

describe('ViToastService', () => {
  let toastService: ViToastService;

  beforeEach(() => {
    container.clearInstances();
    toastService = container.resolve(ViToastService);
    // Cleanup DOM between tests
    document.querySelectorAll('vi-toast-container').forEach((c) => c.remove());
  });

  it('should show a toast in the default container', () => {
    toastService.show({ message: 'Hello Service', variant: 'success' });
    const host = document.querySelector(
      'vi-toast-container[position="top-right"]',
    );
    expect(host).not.toBeNull();

    const toast = host!.querySelector('vi-toast') as ViToast;
    expect(toast).not.toBeNull();
    expect(toast.message).toBe('Hello Service');
    expect(toast.variant).toBe('success');
  });

  it('should place toasts in different positional containers', () => {
    toastService.show({
      message: 'Top Left',
      variant: 'info',
      position: 'top-left',
    });
    toastService.show({
      message: 'Bottom Right',
      variant: 'info',
      position: 'bottom-right',
    });

    const topLeftContainer = document.querySelector(
      'vi-toast-container[position="top-left"]',
    );
    const bottomRightContainer = document.querySelector(
      'vi-toast-container[position="bottom-right"]',
    );

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

    toasts.forEach((toast) => {
      expect(toast.classList.contains('exiting')).toBe(true);
    });
  });

  it('should ignore maxVisible when configured to 0', () => {
    toastService.configure({ maxVisible: 0 });
    const id = toastService.show({ message: 'Toast 1', variant: 'info' });
    expect(id).toBeDefined();
    const domContainer = document.querySelector('vi-toast-container')!;
    expect(domContainer.querySelectorAll('vi-toast').length).toBe(0);
  });

  it('should dismiss element even if onClose callback throws', () => {
    const consoleStub = sinon.stub(console, 'error');
    const id = toastService.show({
      message: 'Toast 1',
      variant: 'info',
      onClose: () => {
        throw new Error('Test error');
      },
    });

    const domContainer = document.querySelector('vi-toast-container')!;
    const toast = domContainer.querySelector('vi-toast') as ViToast;

    toast.dispatchEvent(
      new CustomEvent('vi-toast-close', { detail: { reason: 'user', id } }),
    );

    expect(toast.classList.contains('exiting')).toBe(true);
    consoleStub.restore();
  });

  it('should dismiss toast correctly using CSS-unsafe IDs', () => {
    const id = 'unsafe[id="test"]';
    toastService.show({ id, message: 'Toast 1', variant: 'info' });
    toastService.dismiss(id);

    const domContainer = document.querySelector('vi-toast-container')!;
    const toast = domContainer.querySelector('vi-toast') as ViToast;
    expect(toast.classList.contains('exiting')).toBe(true);
  });

  it('should recreate container if it was disconnected from DOM', () => {
    toastService.show({ message: 'Toast 1', variant: 'info' });
    const domContainer1 = document.querySelector('vi-toast-container')!;
    domContainer1.remove();

    toastService.show({ message: 'Toast 2', variant: 'info' });
    const domContainers = document.querySelectorAll('vi-toast-container');
    expect(domContainers.length).toBe(1);
    expect(domContainers[0]).not.toBe(domContainer1);
  });

  it('should trigger onAction callback', () => {
    const spy = sinon.spy();
    const id = toastService.show({
      message: 'Toast 1',
      variant: 'info',
      actions: [{ label: 'Action 1', action: 'action1' }],
      onAction: spy,
    });

    const domContainer = document.querySelector('vi-toast-container')!;
    const toast = domContainer.querySelector('vi-toast') as ViToast;

    toast.dispatchEvent(
      new CustomEvent('vi-toast-action', { detail: { action: 'action1', id } }),
    );
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0]).toBe('action1');
  });

  it('should trigger onClick callback when not clicking an action button', () => {
    const spy = sinon.spy();
    toastService.show({ message: 'Toast 1', variant: 'info', onClick: spy });

    const domContainer = document.querySelector('vi-toast-container')!;
    const toast = domContainer.querySelector('vi-toast') as ViToast;

    // Simulate click on toast body
    toast.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(spy.calledOnce).toBe(true);
  });
});
