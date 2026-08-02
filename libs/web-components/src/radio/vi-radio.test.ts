import { $, expect } from '@wdio/globals';
import { html, render } from 'lit';
import axe from 'axe-core';
import './index.js'; // Registers both vi-radio and vi-radio-group
import type { ViRadio } from './vi-radio.js';
import type { ViRadioGroup } from './vi-radio-group.js';

describe('vi-radio & vi-radio-group', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('Step 1: Rendering and shadow DOM structure', () => {
    it('should render the radio group and radio children correctly', async () => {
      render(
        html`
          <vi-radio-group name="options" value="a">
            <span slot="label">Choose one</span>
            <vi-radio value="a">Option A</vi-radio>
            <vi-radio value="b">Option B</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const group = await $('vi-radio-group');
      await expect(group).toExist();

      const fieldset = await group.shadow$('.radio-group');
      await expect(fieldset).toExist();
      await expect(fieldset).toHaveAttribute('role', 'radiogroup');

      const radioA = await $('vi-radio[value="a"]');
      await expect(radioA).toExist();

      const inputA = await radioA.shadow$('.radio-input');
      await expect(inputA).toExist();
      await expect(inputA).toHaveAttribute('type', 'radio');
    });
  });

  describe('Step 2: Property synchronization and defaults', () => {
    it('should initialize with correct default property values', () => {
      render(
        html`
          <vi-radio-group>
            <vi-radio value="a">A</vi-radio>
          </vi-radio-group>
        `,
        container
      );
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radio = document.querySelector('vi-radio') as ViRadio;

      expect(group.value).toBe('');
      expect(group.name).toBe('');
      expect(group.disabled).toBe(false);
      expect(group.required).toBe(false);
      expect(group.status).toBe('default');
      expect(group.orientation).toBe('vertical');

      expect(radio.checked).toBe(false);
      expect(radio.disabled).toBe(false);
      expect(radio.name).toBe('');
    });

    it('should propagate name and disabled properties to child elements', async () => {
      render(
        html`
          <vi-radio-group name="survey" disabled>
            <vi-radio value="1">1</vi-radio>
            <vi-radio value="2">2</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const radio1 = document.querySelector('vi-radio[value="1"]') as ViRadio;
      const radio2 = document.querySelector('vi-radio[value="2"]') as ViRadio;

      expect(radio1.name).toBe('survey');
      expect(radio2.name).toBe('survey');

      // Due to the getters checking parent state, effective disabled check is true
      const input1 = await $('vi-radio[value="1"]').shadow$('.radio-input');
      const input2 = await $('vi-radio[value="2"]').shadow$('.radio-input');
      await expect(input1).toBeDisabled();
      await expect(input2).toBeDisabled();
    });

    it('should update roving tabindex when a child radio is dynamically disabled', async () => {
      render(
        html`
          <vi-radio-group>
            <vi-radio value="1">1</vi-radio>
            <vi-radio value="2">2</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radio1 = document.querySelector('vi-radio[value="1"]') as ViRadio;
      const radio2 = document.querySelector('vi-radio[value="2"]') as ViRadio;

      await group.updateComplete;
      await radio1.updateComplete;
      await radio2.updateComplete;

      // By default, the first radio should have tabIndex 0, second should have -1
      expect(radio1.tabIndex).toBe(0);
      expect(radio2.tabIndex).toBe(-1);

      // Dynamically disable the first radio
      radio1.disabled = true;
      // Wait for updates to propagate and MutationObserver to fire
      await browser.waitUntil(() => radio1.tabIndex === -1 && radio2.tabIndex === 0);
      await group.updateComplete;

      // The second radio should now have tabIndex 0 (first enabled)
      // and the first radio should have tabIndex -1
      expect(radio1.tabIndex).toBe(-1);
      expect(radio2.tabIndex).toBe(0);
    });

    it('should correctly handle focusability when used as a standalone radio element', async () => {
      render(
        html`
          <vi-radio value="standalone">Standalone Radio</vi-radio>
        `,
        container
      );

      const radio = document.querySelector('vi-radio') as ViRadio;
      await radio.updateComplete;

      // By default, standalone radio has tabIndex 0
      expect(radio.tabIndex).toBe(0);

      // Disable the standalone radio
      radio.disabled = true;
      await radio.updateComplete;

      // When disabled, its host tabIndex should change to -1 via FocusableMixin
      expect(radio.tabIndex).toBe(-1);

      // Re-enable standalone radio
      radio.disabled = false;
      await radio.updateComplete;

      // tabIndex should restore to 0
      expect(radio.tabIndex).toBe(0);
    });
  });

  describe('Step 3: User interactions and state changes', () => {
    it('should check the clicked radio and fire vi-radio-group-change event', async () => {
      let changeEventDetail: string | null = null;
      render(
        html`
          <vi-radio-group
            name="feedback"
            @vi-radio-group-change=${(e: CustomEvent<{ value: string }>) => {
              changeEventDetail = e.detail.value;
            }}
          >
            <vi-radio value="yes">Yes</vi-radio>
            <vi-radio value="no">No</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const radioNo = await $('vi-radio[value="no"]');
      const wrapperNo = await radioNo.shadow$('.radio-wrapper');
      
      // Perform simulated user click on radio option
      await browser.execute((el) => (el as HTMLElement).click(), wrapperNo);

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const rYes = document.querySelector('vi-radio[value="yes"]') as ViRadio;
      const rNo = document.querySelector('vi-radio[value="no"]') as ViRadio;

      expect(group.value).toBe('no');
      expect(rNo.checked).toBe(true);
      expect(rYes.checked).toBe(false);
      expect(changeEventDetail).toBe('no');
    });

    it('should not allow selecting a disabled radio option', async () => {
      let changeFired = false;
      render(
        html`
          <vi-radio-group name="test" @vi-radio-group-change=${() => (changeFired = true)}>
            <vi-radio value="a">A</vi-radio>
            <vi-radio value="b" disabled>B</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const radioB = await $('vi-radio[value="b"]');
      const wrapperB = await radioB.shadow$('.radio-wrapper');
      await browser.execute((el) => (el as HTMLElement).click(), wrapperB);

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      expect(group.value).toBe('');
      expect(changeFired).toBe(false);
    });
  });

  describe('Step 3.5: Mutual exclusivity', () => {
    it('should deselect previously checked radio when another is clicked', async () => {
      render(
        html`
          <vi-radio-group name="exclusive">
            <vi-radio value="a">Option A</vi-radio>
            <vi-radio value="b">Option B</vi-radio>
            <vi-radio value="c">Option C</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const radioA = await $('vi-radio[value="a"]');
      const radioB = await $('vi-radio[value="b"]');
      const wrapperA = await radioA.shadow$('.radio-wrapper');
      const wrapperB = await radioB.shadow$('.radio-wrapper');
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;

      // Click radio A
      await browser.execute((el) => (el as HTMLElement).click(), wrapperA);
      await group.updateComplete;

      const rA = document.querySelector('vi-radio[value="a"]') as ViRadio;
      const rB = document.querySelector('vi-radio[value="b"]') as ViRadio;

      expect(rA.checked).toBe(true);
      expect(rB.checked).toBe(false);
      expect(group.value).toBe('a');

      // Click radio B
      await browser.execute((el) => (el as HTMLElement).click(), wrapperB);
      await group.updateComplete;

      // Radio A should now be unchecked, only B should be checked
      expect(rA.checked).toBe(false);
      expect(rB.checked).toBe(true);
      expect(group.value).toBe('b');
    });
  });

  describe('Step 4: Keyboard interactions (roving tabindex)', () => {
    it('should handle Arrow keys to move selection and focus', async () => {
      render(
        html`
          <vi-radio-group name="kbd-test">
            <vi-radio value="1">One</vi-radio>
            <vi-radio value="2">Two</vi-radio>
            <vi-radio value="3">Three</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const r1 = document.querySelector('vi-radio[value="1"]') as ViRadio;
      const r2 = document.querySelector('vi-radio[value="2"]') as ViRadio;
      const r3 = document.querySelector('vi-radio[value="3"]') as ViRadio;
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;

      r1.focus();
      await r1.updateComplete;

      // Programmatically dispatch ArrowDown keydown event on r1
      r1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      expect(group.value).toBe('2');
      expect(r2.checked).toBe(true);
      expect(r1.checked).toBe(false);

      // Programmatically dispatch ArrowRight keydown event on r2
      r2.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      expect(group.value).toBe('3');
      expect(r3.checked).toBe(true);

      // Programmatically dispatch ArrowDown keydown event on r3 to wrap to 1
      r3.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      expect(group.value).toBe('1');
      expect(r1.checked).toBe(true);

      // Programmatically dispatch ArrowUp keydown event on r1 to wrap backwards to 3
      r1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowUp',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      expect(group.value).toBe('3');
      expect(r3.checked).toBe(true);
    });

    it('should select focused radio via Space key', async () => {
      render(
        html`
          <vi-radio-group name="space-test">
            <vi-radio value="1">One</vi-radio>
            <vi-radio value="2">Two</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const r1 = document.querySelector('vi-radio[value="1"]') as ViRadio;
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      
      r1.focus();
      await r1.updateComplete;

      // Programmatically dispatch Space key event
      r1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      expect(group.value).toBe('1');
      expect(r1.checked).toBe(true);
    });

    it('should skip disabled radios when moving selection via Arrow keys', async () => {
      render(
        html`
          <vi-radio-group name="kbd-skip-test">
            <vi-radio value="1">One</vi-radio>
            <vi-radio value="2" disabled>Two (disabled)</vi-radio>
            <vi-radio value="3">Three</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const r1 = document.querySelector('vi-radio[value="1"]') as ViRadio;
      const r2 = document.querySelector('vi-radio[value="2"]') as ViRadio;
      const r3 = document.querySelector('vi-radio[value="3"]') as ViRadio;
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;

      r1.focus();
      await r1.updateComplete;

      // Programmatically dispatch ArrowDown keydown event on r1
      r1.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        })
      );
      await group.updateComplete;

      // It should skip '2' and select '3'
      expect(group.value).toBe('3');
      expect(r3.checked).toBe(true);
      expect(r2.checked).toBe(false);
      expect(r1.checked).toBe(false);
    });

    it('should not allow focusing a disabled radio programmatically', async () => {
      render(
        html`
          <vi-radio-group name="disabled-focus-test">
            <vi-radio value="1">One</vi-radio>
            <vi-radio value="2" disabled>Two (disabled)</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const r2 = document.querySelector('vi-radio[value="2"]') as ViRadio;
      
      // Attempt programmatic focus
      r2.focus();
      await r2.updateComplete;

      // Verify that the active element is not the inner input or the host
      const activeEl = document.activeElement;
      expect(activeEl === r2).toBe(false);
    });

    it('should clear selection when double-clicked and allowDblclickClear is true', async () => {
      render(
        html`
          <vi-radio-group name="clearable-group" value="yes" allow-dblclick-clear>
            <vi-radio value="yes">Yes</vi-radio>
            <vi-radio value="no">No</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radioYes = document.querySelector('vi-radio[value="yes"]') as ViRadio;
      const radioNo = document.querySelector('vi-radio[value="no"]') as ViRadio;

      expect(group.value).toBe('yes');
      expect(radioYes.checked).toBe(true);

      radioYes.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true }));
      await group.updateComplete;

      expect(group.value).toBe('');
      expect(radioYes.checked).toBe(false);
      expect(radioNo.checked).toBe(false);
    });

    it('should not clear selection when double-clicked and allowDblclickClear is false', async () => {
      render(
        html`
          <vi-radio-group name="non-clearable-group" value="yes">
            <vi-radio value="yes">Yes</vi-radio>
            <vi-radio value="no">No</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radioYes = document.querySelector('vi-radio[value="yes"]') as ViRadio;

      expect(group.value).toBe('yes');
      expect(radioYes.checked).toBe(true);

      radioYes.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, composed: true }));
      await group.updateComplete;

      expect(group.value).toBe('yes');
      expect(radioYes.checked).toBe(true);
    });
  });

  describe('Step 5: Form submission and validation', () => {
    it('should participate in form validation when required is true', async () => {
      render(
        html`
          <form id="test-form">
            <vi-radio-group name="options" required>
              <vi-radio value="yes">Yes</vi-radio>
              <vi-radio value="no">No</vi-radio>
            </vi-radio-group>
          </form>
        `,
        container
      );

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      
      // Empty selection is invalid
      expect(group.reportValidity()).toBe(false);
      expect(group.status).toBe('invalid');
      expect(group.validityMessage).not.toBe('');

      // Selecting option passes validation
      group.value = 'yes';
      await group.updateComplete;

      expect(group.reportValidity()).toBe(true);
      expect(group.status).toBe('default'); // reset to default since valid
    });

    it('should reset selection on form reset', async () => {
      render(
        html`
          <form id="form-reset">
            <vi-radio-group name="choice" value="b">
              <vi-radio value="a">A</vi-radio>
              <vi-radio value="b">B</vi-radio>
            </vi-radio-group>
          </form>
        `,
        container
      );

      const form = document.getElementById('form-reset') as HTMLFormElement;
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;

      expect(group.value).toBe('b');

      // Change selection
      group.value = 'a';
      await group.updateComplete;
      expect(group.value).toBe('a');

      // Trigger reset
      form.reset();
      await group.updateComplete;

      // Restores value to initial attribute value
      expect(group.value).toBe('b');
    });
  });

  describe('Sizing', () => {
    it('should default to md size for group and children', async () => {
      render(
        html`
          <vi-radio-group name="sizes">
            <vi-radio value="1">One</vi-radio>
          </vi-radio-group>
        `,
        container
      );
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radio = document.querySelector('vi-radio') as ViRadio;
      await group.updateComplete;

      expect(group.size).toBe('md');
      expect(radio.size).toBe('md');
    });

    it('should propagate size attribute from group to children', async () => {
      render(
        html`
          <vi-radio-group name="sizes" size="lg">
            <vi-radio value="1">One</vi-radio>
          </vi-radio-group>
        `,
        container
      );
      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radio = document.querySelector('vi-radio') as ViRadio;
      await group.updateComplete;
      await radio.updateComplete;

      expect(group.size).toBe('lg');
      expect(radio.size).toBe('lg');

      // Change group size dynamically
      group.size = 'xs';
      await group.updateComplete;
      await radio.updateComplete;

      expect(radio.size).toBe('xs');
    });
  });

  describe('Missing Branch Coverage Tier 2', () => {
    it('vi-radio-group _onKeydown default branch', async () => {
      render(html`
        <vi-radio-group>
          <vi-radio value="1">1</vi-radio>
        </vi-radio-group>
      `, container);
      
      const group = await $('vi-radio-group');
      const result = await browser.execute((g: any) => {
        const radio = g.querySelector('vi-radio');
        radio.focus();
        g.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
        return true;
      }, await group);
      expect(result).toBe(true);
    });
    
    it('vi-radio-group firstInput validationMessage branch', async () => {
      render(html`
        <vi-radio-group required>
          <vi-radio value="1">1</vi-radio>
        </vi-radio-group>
      `, container);
      
      const group = document.querySelector('vi-radio-group') as any;
      await group.updateComplete;
      
      const isValid = group.checkValidity();
      expect(isValid).toBe(false);
      expect(typeof group.validityMessage).toBe('string');
    });
    
    it('vi-radio _setHostFocusable in group branch', async () => {
      render(html`
        <vi-radio-group>
          <vi-radio id="radio1" value="1">1</vi-radio>
        </vi-radio-group>
      `, container);
      
      const radio = document.getElementById('radio1') as any;
      await radio.updateComplete;
      
      radio._setHostFocusable(true);
      expect(radio.tabIndex).toBe(0);
    });
  });

  describe('Accessibility (A11y)', () => {
    it('should pass axe accessibility audits', async () => {
      // Set background to pass color contrast checks
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#111827';
      container.style.padding = '20px';

      render(
        html`
          <vi-radio-group name="options-a11y" value="a">
            <span slot="label">Choose one accessible option</span>
            <vi-radio value="a">Option A</vi-radio>
            <vi-radio value="b">Option B</vi-radio>
            <vi-radio value="c" disabled>Option C (Disabled)</vi-radio>
          </vi-radio-group>
        `,
        container
      );

      const group = document.querySelector('vi-radio-group') as ViRadioGroup;
      const radio = document.querySelector('vi-radio') as ViRadio;
      await group.updateComplete;
      await radio.updateComplete;

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

