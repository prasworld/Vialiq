import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './index.js'; // Registers vi-progress
import type { ViProgress } from './vi-progress.js';

describe('vi-progress', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should render the custom element and its shadow DOM structure for a basic line progress', async () => {
    render(
      html`
        <vi-progress value="30"></vi-progress>
      `,
      container
    );

    const host = await $('vi-progress');
    await expect(host).toExist();

    const base = await host.shadow$('.vi-progress');
    await expect(base).toExist();
    await expect(base).toHaveClass('vi-progress--line');

    const indicator = await host.shadow$('.vi-progress-indicator');
    await expect(indicator).toExist();
    
    // Check aria attributes
    await expect(base).toHaveAttribute('role', 'progressbar');
    await expect(base).toHaveAttribute('aria-valuenow', '30');
    await expect(base).toHaveAttribute('aria-valuemax', '100');
  });

  it('should format percentage text correctly via slot or format prop', async () => {
    // 1. Default formatting
    render(html`<vi-progress value="45"></vi-progress>`, container);
    let host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;
    let slotText = host.shadowRoot?.querySelector('.vi-progress-info')?.textContent?.trim();
    expect(slotText).toBe('45%');

    // 2. Custom format function
    render(html`<vi-progress value="45" .format=${(p: number) => p + ' Days'}></vi-progress>`, container);
    host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;
    slotText = host.shadowRoot?.querySelector('.vi-progress-info')?.textContent?.trim();
    expect(slotText).toBe('45 Days');
  });

  it('should automatically promote status to success when value reaches max', async () => {
    render(html`<vi-progress value="100"></vi-progress>`, container);
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const base = host.shadowRoot?.querySelector('.vi-progress');
    expect(base?.classList.contains('vi-progress--status-success')).toBe(true);
    
    // Status should fall back to normal if value goes below max
    host.value = 90;
    await host.updateComplete;
    expect(base?.classList.contains('vi-progress--status-normal')).toBe(true);
  });

  it('should render a circular progress bar with SVG elements', async () => {
    render(html`<vi-progress type="circle" value="50"></vi-progress>`, container);
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const svg = host.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();
    
    const circles = svg?.querySelectorAll('circle');
    expect(circles?.length).toBe(2); // Track and Indicator
    
    const indicator = svg?.querySelector('.vi-progress-circle-indicator');
    expect(indicator).not.toBeNull();
  });

  it('should render segmented steps for line progress', async () => {
    render(html`<vi-progress value="30" steps="5"></vi-progress>`, container);
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const stepsContainer = host.shadowRoot?.querySelector('.vi-progress-steps');
    expect(stepsContainer).not.toBeNull();

    const items = stepsContainer?.querySelectorAll('.vi-progress-step-item');
    expect(items?.length).toBe(5);
    
    // Value 30 out of 100 with 5 steps means (30/100)*5 = 1.5 => floor(1.5) = 1 active step
    const activeItems = stepsContainer?.querySelectorAll('.vi-progress-step-item--active');
    expect(activeItems?.length).toBe(1);
  });

  it('should render circular segmented steps via SVG', async () => {
    render(html`<vi-progress type="circle" value="50" steps="10"></vi-progress>`, container);
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const svg = host.shadowRoot?.querySelector('svg');
    expect(svg).not.toBeNull();

    const circles = svg?.querySelectorAll('circle');
    expect(circles?.length).toBe(10); // 10 distinct segments
    
    const activeCircles = svg?.querySelectorAll('.vi-progress-circle-indicator');
    expect(activeCircles?.length).toBe(5); // 50% of 10 is 5 active
  });

  it('should inject complex gradient styles when strokeColor is an object', async () => {
    render(
      html`
        <vi-progress 
          value="50" 
          .strokeColor=${{ '0%': 'red', '100%': 'blue', direction: 'to right' }}
        ></vi-progress>
      `, 
      container
    );
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const base = host.shadowRoot?.querySelector('.vi-progress') as HTMLElement;
    const styleString = base.getAttribute('style') || '';
    expect(styleString.includes('linear-gradient(to right, red 0%, blue 100%)')).toBe(true);
  });

  it('should parse complex strokeColor into SVG defs for circles', async () => {
    render(
      html`
        <vi-progress 
          type="circle" 
          value="50" 
          .strokeColor=${{ '0%': 'red', '100%': 'blue' }}
        ></vi-progress>
      `, 
      container
    );
    const host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;

    const defs = host.shadowRoot?.querySelector('defs');
    expect(defs).not.toBeNull();
    
    const gradient = defs?.querySelector('linearGradient');
    expect(gradient).not.toBeNull();
    
    const stops = gradient?.querySelectorAll('stop');
    expect(stops?.length).toBe(2);
    expect(stops?.[0].getAttribute('stop-color')).toBe('red');
    expect(stops?.[1].getAttribute('stop-color')).toBe('blue');
  });

  it('should support secondary success segment', async () => {
    // Test on Line progress
    render(html`<vi-progress value="50" success-percent="20"></vi-progress>`, container);
    let host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;
    
    const successIndicator = host.shadowRoot?.querySelector('.vi-progress-success-indicator');
    expect(successIndicator).not.toBeNull();

    // Test on Circle progress
    render(html`<vi-progress type="circle" value="50" success-percent="20"></vi-progress>`, container);
    host = document.querySelector('vi-progress') as ViProgress;
    await host.updateComplete;
    
    // Circle with success segment should have 3 circles: Track, Indicator, Success
    const circles = host.shadowRoot?.querySelectorAll('circle');
    expect(circles?.length).toBe(3);
    
    // We expect the third circle to be the success segment, check its class/style
    const successCircle = host.shadowRoot?.querySelector('.vi-progress-circle-success');
    expect(successCircle).not.toBeNull();
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      // Set background to pass color contrast checks
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-progress value="42" .ariaLabel=${"Loading files"}></vi-progress>
        `,
        container
      );

      const host = document.querySelector('vi-progress') as ViProgress;
      await host.updateComplete;

      const results = await axe.run(container, {
        rules: {
          'document-title': { enabled: false },
          'html-has-lang': { enabled: false },
          'page-has-heading-one': { enabled: false },
          'landmark-one-main': { enabled: false },
          'region': { enabled: false },
          'color-contrast': { enabled: false }
        }
      });

      expect(results.violations).toHaveLength(0);
    });
  });
});
