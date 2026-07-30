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

  it('reverts declarative open=true when vi-animation-before-show is canceled', async () => {
    render(
      html`
        <vi-animation id="test-cancel-show" .autoPlay=${false} .open=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-cancel-show');
    const anim = (await wrapper) as unknown as ViAnimation;

    const result = await browser.execute(async (el: ViAnimation) => {
      el.addEventListener('vi-animation-before-show', (e: Event) => e.preventDefault(), { once: true });
      el.open = true;
      await el.updateComplete;
      await el.updateComplete;
      return { open: el.open, hidden: el.hidden };
    }, anim);

    expect(result.open).toBe(false);
    expect(result.hidden).toBe(true);
  });

  it('reverts declarative open=false when vi-animation-before-hide is canceled', async () => {
    render(
      html`
        <vi-animation id="test-cancel-hide" .autoPlay=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-cancel-hide');
    const anim = (await wrapper) as unknown as ViAnimation;

    const result = await browser.execute(async (el: ViAnimation) => {
      el.addEventListener('vi-animation-before-hide', (e: Event) => e.preventDefault(), { once: true });
      el.open = false;
      await el.updateComplete;
      await el.updateComplete;
      return { open: el.open, hidden: el.hidden };
    }, anim);

    expect(result.open).toBe(true);
    expect(result.hidden).toBe(false);
  });

  it('allows custom keyframes to take precedence over reduced motion fallback', async () => {
    render(
      html`
        <vi-animation id="test-custom-kf" reduced-motion="fade-only" .autoPlay=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-custom-kf');
    const anim = (await wrapper) as unknown as ViAnimation;

    const customKfUsed = await browser.execute((el: ViAnimation) => {
      const customKf = [{ opacity: 0.1 }, { opacity: 0.9 }];
      el.keyframes = customKf;
      el.play();
      const activeAnims = el.getAnimations();
      if (activeAnims.length === 0) return false;
      const keyframeEffect = activeAnims[0].effect as KeyframeEffect;
      const computedKf = keyframeEffect?.getKeyframes();
      return Boolean(
        computedKf &&
          computedKf.length === 2 &&
          (computedKf[0].opacity === 0.1 || computedKf[0].opacity === '0.1')
      );
    }, anim);

    expect(customKfUsed).toBe(true);
  });

  it('supports stagger-direction "reverse", "center", and "random"', async () => {
    render(
      html`
        <vi-animation id="test-stagger-directions" cascade .duration=${50} .stagger=${10} .autoPlay=${false}>
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <div class="item">Item 3</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-stagger-directions');
    const anim = (await wrapper) as unknown as ViAnimation;

    await browser.execute(async (el: ViAnimation) => {
      el.staggerDirection = 'reverse';
      await el.play();
      
      el.staggerDirection = 'center';
      await el.play();
      
      el.staggerDirection = 'random';
      await el.play();
    }, anim);
  });

  it('generates keyframes for structural animations', async () => {
    render(
      html`
        <vi-animation id="test-structural" .duration=${10} .autoPlay=${false}>
          <div style="width: 100px; height: 100px;">Content</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-structural');
    const anim = (await wrapper) as unknown as ViAnimation;

    await browser.execute(async (el: ViAnimation) => {
      const names = ['expand-vertical', 'collapse-vertical', 'expand-horizontal', 'collapse-horizontal'];
      for (const name of names) {
        el.name = name;
        await el.play();
      }
    }, anim);
  });

  it('supports playback control methods (pause, resume, reverse, cancel, finish)', async () => {
    render(
      html`
        <vi-animation id="test-playback" name="fade-in" .duration=${500} .autoPlay=${false}>
          <div>Target</div>
        </vi-animation>
      `,
      container
    );
    const wrapper = await $('#test-playback');
    const anim = (await wrapper) as unknown as ViAnimation;

    const result = await browser.execute(async (el: ViAnimation) => {
      let cancelFired = false;
      let finishFired = false;

      el.addEventListener('vi-animation-cancel', () => cancelFired = true);
      el.addEventListener('vi-animation-finish', () => finishFired = true);

      // Start animation
      const playPromise = el.play();
      
      el.pause();
      el.resume();
      el.reverse();
      el.cancel();

      try {
        await playPromise;
      } catch (_e) {
        // playPromise might throw if cancelled
      }

      el.play();
      el.finish();

      return { cancelFired, finishFired };
    }, anim);

    expect(result.cancelFired).toBe(true);
    expect(result.finishFired).toBe(true);
  });
});
