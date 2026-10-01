import 'reflect-metadata';
import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import sinon from 'sinon';
import { container } from 'tsyringe';
import './vi-message.js';
import './vi-message-container.js';
import type { ViMessage } from './vi-message.js';
import { ViMessageService } from './vi-message-service.js';

describe('vi-message (Component)', () => {
  let wrapper: HTMLElement;

  beforeEach(() => {
    wrapper = document.createElement('div');
    document.body.appendChild(wrapper);
  });

  afterEach(() => {
    wrapper.remove();
    sinon.restore();
  });

  it('should render the message content', async () => {
    render(
      html` <vi-message content="Test Message Content"></vi-message> `,
      wrapper,
    );

    const host = await $('vi-message');
    await expect(host).toExist();

    const contentSlot = await host.shadow$('.message-content slot');
    await expect(contentSlot).toHaveText('Test Message Content');
  });

  it('should auto-dismiss after duration', async () => {
    const clock = sinon.useFakeTimers();
    render(html`<vi-message duration="1000"></vi-message>`, wrapper);

    const el = document.querySelector('vi-message') as ViMessage;
    const spy = sinon.spy();
    el.addEventListener('vi-message-close', spy);

    clock.tick(1001);
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('auto');
  });

  it('should pause and resume timer on paused property change', async () => {
    const clock = sinon.useFakeTimers();
    render(html`<vi-message duration="1000"></vi-message>`, wrapper);

    const el = document.querySelector('vi-message') as ViMessage;
    const spy = sinon.spy();
    el.addEventListener('vi-message-close', spy);

    clock.tick(500);
    el.paused = true;
    await el.updateComplete;
    clock.tick(1000);
    expect(spy.called).toBe(false);

    el.paused = false;
    await el.updateComplete;
    clock.tick(501);
    expect(spy.calledOnce).toBe(true);
  });

  it('should not auto-dismiss loading variant', async () => {
    const clock = sinon.useFakeTimers();
    render(
      html`<vi-message variant="loading" duration="1000"></vi-message>`,
      wrapper,
    );

    const el = document.querySelector('vi-message') as ViMessage;
    const spy = sinon.spy();
    el.addEventListener('vi-message-close', spy);

    clock.tick(2000);
    expect(spy.called).toBe(false);
  });

  it('should return correct default icon based on variant', async () => {
    render(html`<vi-message variant="warning"></vi-message>`, wrapper);
    const el = document.querySelector('vi-message') as ViMessage;
    expect(el['defaultIcon']).toBe('triangle-warning');

    el.variant = 'error';
    expect(el['defaultIcon']).toBe('circle-x');

    el.variant = 'success';
    expect(el['defaultIcon']).toBe('check-circle');

    el.variant = 'loading';
    expect(el['defaultIcon']).toBe('pending');
  });

  it('should use custom icon if provided', async () => {
    render(html`<vi-message icon="custom-icon"></vi-message>`, wrapper);
    const el = document.querySelector('vi-message') as ViMessage;
    expect(el['defaultIcon']).toBe('custom-icon');
  });

  it('should clear timer on disconnect', async () => {
    sinon.useFakeTimers();
    render(html`<vi-message duration="1000"></vi-message>`, wrapper);
    const el = document.querySelector('vi-message') as ViMessage;

    expect(el['_timer']).not.toBeNull();
    el.remove();
    expect(el['_timer']).toBeNull();
  });
});

describe('ViMessageService', () => {
  let messageService: ViMessageService;

  beforeEach(() => {
    container.clearInstances();
    messageService = container.resolve(ViMessageService);
    // Cleanup DOM between tests
    document
      .querySelectorAll('vi-message-container')
      .forEach((c) => c.remove());
  });

  it('should show a message', () => {
    messageService.show({ content: 'Hello Service', variant: 'success' });
    const host = document.querySelector('vi-message-container');
    expect(host).not.toBeNull();

    const message = host!.querySelector('vi-message') as ViMessage;
    expect(message).not.toBeNull();
    expect(message.content).toBe('Hello Service');
    expect(message.variant).toBe('success');
  });

  it('should provide helper methods', () => {
    messageService.info('Info message');
    messageService.success('Success message');

    const host = document.querySelector('vi-message-container');
    const messages = host!.querySelectorAll('vi-message');
    expect(messages.length).toBe(2);
    expect(messages[0].variant).toBe('info');
    expect(messages[1].variant).toBe('success');
  });

  it('should enforce maxVisible limit', () => {
    messageService.configure({ maxVisible: 2 });

    messageService.show({ content: 'Message 1' });
    messageService.show({ content: 'Message 2' });
    messageService.show({ content: 'Message 3' });

    const domContainer = document.querySelector('vi-message-container')!;
    const messages = domContainer.querySelectorAll('vi-message');

    expect(messages.length).toBe(3);
    expect(messages[0].classList.contains('exiting')).toBe(true);
    expect(messages[1].classList.contains('exiting')).toBe(false);
    expect(messages[2].classList.contains('exiting')).toBe(false);
  });

  it('should handle dismissAll', () => {
    messageService.show({ content: 'Message 1' });
    messageService.show({ content: 'Message 2' });

    messageService.dismissAll();

    const domContainer = document.querySelector('vi-message-container')!;
    const messages = domContainer.querySelectorAll('vi-message');

    messages.forEach((message) => {
      expect(message.classList.contains('exiting')).toBe(true);
    });
  });

  it('should ignore maxVisible when configured to 0', () => {
    messageService.configure({ maxVisible: 0 });
    const id = messageService.show({ content: 'Message 1' });
    expect(id).toBeDefined();
    const domContainer = document.querySelector('vi-message-container')!;
    expect(domContainer.querySelectorAll('vi-message').length).toBe(0);
  });

  it('should dismiss element even if onClose callback throws', () => {
    const consoleStub = sinon.stub(console, 'error');
    const id = messageService.show({
      content: 'Message 1',
      onClose: () => {
        throw new Error('Test error');
      },
    });

    const domContainer = document.querySelector('vi-message-container')!;
    const message = domContainer.querySelector('vi-message') as ViMessage;

    message.dispatchEvent(
      new CustomEvent('vi-message-close', { detail: { reason: 'user', id } }),
    );

    expect(message.classList.contains('exiting')).toBe(true);
    consoleStub.restore();
  });

  it('should dismiss message correctly using CSS-unsafe IDs', () => {
    const id = 'unsafe[id="test"]';
    messageService.show({ id, content: 'Message 1' });
    messageService.dismiss(id);

    const domContainer = document.querySelector('vi-message-container')!;
    const message = domContainer.querySelector('vi-message') as ViMessage;
    expect(message.classList.contains('exiting')).toBe(true);
  });

  it('should recreate container if it was disconnected from DOM', () => {
    messageService.show({ content: 'Message 1' });
    const domContainer1 = document.querySelector('vi-message-container')!;
    domContainer1.remove();

    messageService.show({ content: 'Message 2' });
    const domContainers = document.querySelectorAll('vi-message-container');
    expect(domContainers.length).toBe(1);
    expect(domContainers[0]).not.toBe(domContainer1);
  });

  it('should update container maxVisible on configure if container exists', () => {
    messageService.show({ content: 'Message 1' }); // Force container creation
    messageService.configure({ maxVisible: 3 });
    const domContainer = document.querySelector('vi-message-container')!;
    expect(domContainer.getAttribute('maxVisible')).toBe('3');
  });

  it('should safely ignore dismiss for unknown ID', () => {
    messageService.show({ content: 'Message 1' });
    expect(() => {
      messageService.dismiss('unknown-id');
    }).not.toThrow();
  });

  it('should accept a DOM node as content', async () => {
    const el = document.createElement('div');
    el.textContent = 'Custom node content';
    const id = messageService.show({ content: el });

    const domContainer = document.querySelector('vi-message-container')!;
    const message = domContainer.querySelector('vi-message') as ViMessage;

    expect(message.textContent).toContain('Custom node content');
    messageService.dismiss(id);
  });
});
