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
  });

  it('should render the message content', async () => {
    render(html`
      <vi-message content="Test Message Content"></vi-message>
    `, wrapper);
    
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
    el.addEventListener('vialiq-close', spy);

    clock.tick(1001);
    expect(spy.calledOnce).toBe(true);
    expect(spy.firstCall.args[0].detail.reason).toBe('auto');
    
    clock.restore();
  });
});

describe('ViMessageService', () => {
  let messageService: ViMessageService;

  beforeEach(() => {
    container.clearInstances();
    messageService = container.resolve(ViMessageService);
    // Cleanup DOM between tests
    document.querySelectorAll('vi-message-container').forEach(c => c.remove());
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
    
    messages.forEach(message => {
      expect(message.classList.contains('exiting')).toBe(true);
    });
  });
});
