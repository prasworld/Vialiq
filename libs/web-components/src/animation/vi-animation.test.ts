import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import './vi-animation.js';
import type { ViAnimation } from './vi-animation.js';

describe('vi-animation', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('renders wrapper element and slot', async () => {
    render(
      html`
        <vi-animation name="fade-in">
          <div class="target">Animated Content</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('vi-animation');
    await expect(wrapper).toExist();

    const target = await $('div.target');
    await expect(target).toExist();
  });

  it('initializes with correct default property values', async () => {
    render(
      html`
        <vi-animation id="test-anim-1">
          <div>Content</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-anim-1');
    const anim = (await wrapper) as unknown as ViAnimation;

    expect(await browser.execute((el: ViAnimation) => el.name, anim)).toBe('fade-in');
    expect(await browser.execute((el: ViAnimation) => el.duration, anim)).toBe(300);
    expect(await browser.execute((el: ViAnimation) => el.delay, anim)).toBe(0);
    expect(await browser.execute((el: ViAnimation) => el.open, anim)).toBe(true);
    expect(await browser.execute((el: ViAnimation) => el.cascade, anim)).toBe(false);
  });

  it('dispatches vi-animation-start and vi-animation-end custom events on play()', async () => {
    render(
      html`
        <vi-animation id="test-anim-2" name="fade-in" .duration=${50} .autoPlay=${false}>
          <div>Event Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-anim-2');
    const anim = (await wrapper) as unknown as ViAnimation;

    const eventResult = await browser.execute(async (el: ViAnimation) => {
      let startFired = false;
      let endFired = false;
      let startDetail: any = null;
      let endDetail: any = null;

      el.addEventListener('vi-animation-start', (e: Event) => {
        startFired = true;
        startDetail = (e as CustomEvent).detail;
      });

      el.addEventListener('vi-animation-end', (e: Event) => {
        endFired = true;
        endDetail = (e as CustomEvent).detail;
      });

      await el.play();

      return { startFired, endFired, startDetail, endDetail };
    }, anim);

    expect(eventResult.startFired).toBe(true);
    expect(eventResult.endFired).toBe(true);
    expect(eventResult.startDetail.name).toBe('fade-in');
    expect(eventResult.endDetail.completed).toBe(true);
  });

  it('handles show() and hide() imperative calls and toggles hidden state', async () => {
    render(
      html`
        <vi-animation id="test-anim-3" name="fade-in" .duration=${50} .autoPlay=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-anim-3');
    const anim = (await wrapper) as unknown as ViAnimation;

    await browser.execute(async (el: ViAnimation) => {
      await el.hide();
    }, anim);

    expect(await browser.execute((el: ViAnimation) => el.open, anim)).toBe(false);
    expect(await browser.execute((el: ViAnimation) => el.hidden, anim)).toBe(true);

    await browser.execute(async (el: ViAnimation) => {
      await el.show();
    }, anim);

    expect(await browser.execute((el: ViAnimation) => el.open, anim)).toBe(true);
    expect(await browser.execute((el: ViAnimation) => el.hidden, anim)).toBe(false);
  });

  it('supports cascading staggering across child elements', async () => {
    render(
      html`
        <vi-animation id="test-stagger" name="fade-in-up" cascade .stagger=${30} .duration=${50} .autoPlay=${false}>
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <div class="item">Item 3</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-stagger');
    const anim = (await wrapper) as unknown as ViAnimation;

    const result = await browser.execute(async (el: ViAnimation) => {
      let endFired = false;
      el.addEventListener('vi-animation-end', () => {
        endFired = true;
      });

      await el.play();
      return { endFired };
    }, anim);

    expect(result.endFired).toBe(true);
  });

  it('respects reducedMotion="fade-only" mode', async () => {
    render(
      html`
        <vi-animation id="test-reduced" name="bounce-in" reduced-motion="fade-only" .duration=${50} .autoPlay=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-reduced');
    const anim = (await wrapper) as unknown as ViAnimation;

    const result = await browser.execute(async (el: ViAnimation) => {
      let startDetail: any = null;
      el.addEventListener('vi-animation-start', (e: Event) => {
        startDetail = (e as CustomEvent).detail;
      });

      await el.play();
      return { startDetail };
    }, anim);

    expect(result.startDetail).not.toBeNull();
  });

  it('handles slide-in-right and slide-out-right side panel sequence', async () => {
    render(
      html`
        <vi-animation
          id="test-slide-panel"
          enter="slide-in-right"
          exit="slide-out-right"
          .duration=${50}
          .open=${false}
        >
          <div>Sliding Side Panel</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-slide-panel');
    const anim = (await wrapper) as unknown as ViAnimation;

    expect(await browser.execute((el: ViAnimation) => el.hidden, anim)).toBe(true);

    await browser.execute(async (el: ViAnimation) => {
      await el.show();
    }, anim);

    expect(await browser.execute((el: ViAnimation) => el.open, anim)).toBe(true);
    expect(await browser.execute((el: ViAnimation) => el.hidden, anim)).toBe(false);

    await browser.execute(async (el: ViAnimation) => {
      await el.hide();
    }, anim);

    expect(await browser.execute((el: ViAnimation) => el.open, anim)).toBe(false);
    expect(await browser.execute((el: ViAnimation) => el.hidden, anim)).toBe(true);
  });
});
