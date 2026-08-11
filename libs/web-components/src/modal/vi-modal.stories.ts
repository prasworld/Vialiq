import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-modal.js';
import '../button/vi-button.js';
import '../input/vi-input.js';

const meta: Meta = {
  title: 'Components/Modal',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'drawer', 'alert'],
      description: 'The layout variant of the modal.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full-width', 'fullscreen'],
      description: 'The size of the modal (for default variant).',
    },
    alertVariant: {
      name: 'alert-variant',
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Icon and color context for the alert variant.',
    },
    drawerPlacement: {
      name: 'drawer-placement',
      control: 'radio',
      options: ['right', 'left'],
      description: 'Side for the drawer to slide in from.',
    },
    open: {
      control: 'boolean',
      description: 'Controls the visibility of the modal.',
    },
    closable: {
      control: 'boolean',
      description: 'Show the × close button in the header.',
    },
    persistent: {
      control: 'boolean',
      description: 'Prevent closing on Escape key and backdrop clicks.',
    },
    maximizable: {
      control: 'boolean',
      description: 'Show maximize toggle in header.',
    },
    draggable: {
      control: 'boolean',
      description: 'Allow dragging modal by the header.',
    },
    position: {
      control: 'select',
      options: ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      description: 'Position of the modal on the screen.',
    },
    autofocus: {
      control: 'boolean',
      description: 'Focus first element on open.',
    },
    scrollable: {
      control: 'boolean',
      description: 'Allows the body to scroll while keeping the header/footer fixed.',
    },
  },
};

export default meta;
type Story = StoryObj;

import type { ViModal } from './vi-modal.js';

// Helper to open a modal by ID
const openModal = (id: string) => {
  const modal = document.getElementById(id) as ViModal | null;
  if (modal) modal.show();
};

// Helper to close a modal by ID
const closeModal = (id: string) => {
  const modal = document.getElementById(id) as ViModal | null;
  if (modal) modal.close();
};

export const Default: Story = {
  args: {
    variant: 'default',
    size: 'md',
    position: 'center',
    closable: true,
    persistent: false,
    maximizable: false,
    draggable: false,
    autofocus: true,
    scrollable: true,
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-default')}>Open Modal</vi-button>
    <vi-modal
      id="modal-default"
      variant=${args.variant}
      size=${args.size}
      position=${args.position}
      ?closable=${args.closable}
      ?persistent=${args.persistent}
      ?maximizable=${args.maximizable}
      ?draggable=${args.draggable}
      ?autofocus=${args.autofocus}
      ?scrollable=${args.scrollable}
    >
      <span slot="header">Default Modal</span>
      <p>This is the default modal content. It acts as a standard dialog for forms and general information.</p>
      <div slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-default')}>Cancel</vi-button>
        <vi-button variant="primary" @click=${() => closeModal('modal-default')}>Save</vi-button>
      </div>
    </vi-modal>
  `,
};

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      ${['xs', 'sm', 'md', 'lg', 'xl', 'full-width', 'fullscreen'].map(size => html`
        <vi-button @click=${() => openModal(`modal-size-${size}`)}>Size: ${size}</vi-button>
        <vi-modal id="modal-size-${size}" size=${size}>
          <span slot="header">Modal Size: ${size}</span>
          <p>This modal is rendered with size <strong>${size}</strong>.</p>
          <div slot="footer">
            <vi-button @click=${() => closeModal(`modal-size-${size}`)}>Close</vi-button>
          </div>
        </vi-modal>
      `)}
    </div>
  `,
};

export const Drawer: Story = {
  args: {
    drawerPlacement: 'right',
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-drawer')}>Open Drawer</vi-button>
    <vi-modal
      id="modal-drawer"
      variant="drawer"
      drawer-placement=${args.drawerPlacement}
    >
      <span slot="header">Drawer Variant</span>
      <p>Drawers slide in from the edge of the screen and take up the full viewport height.</p>
      <p>They are useful for detailed records, audit trails, and configuration settings.</p>
      <div slot="footer">
        <vi-button variant="primary" @click=${() => closeModal('modal-drawer')}>Submit</vi-button>
      </div>
    </vi-modal>
  `,
};

export const Alert: Story = {
  args: {
    alertVariant: 'danger',
    persistent: true,
  },
  render: (args) => html`
    <vi-button variant="danger" @click=${() => openModal('modal-alert')}>Lock Data</vi-button>
    <vi-modal
      id="modal-alert"
      variant="alert"
      alert-variant=${args.alertVariant}
      ?persistent=${args.persistent}
      size="sm"
    >
      <span slot="header">Lock Data</span>
      <p>This action is <strong>irreversible</strong>. All forms will be locked for editing.</p>
      <p>Are you sure you want to lock this subject's data?</p>
      <div slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-alert')}>Cancel</vi-button>
        <vi-button variant=${args.alertVariant === 'danger' ? 'danger' : 'primary'} @click=${() => closeModal('modal-alert')}>Confirm Lock</vi-button>
      </div>
    </vi-modal>
  `,
};

export const ScrollableContent: Story = {
  render: () => html`
    <vi-button @click=${() => openModal('modal-scroll')}>Open Scrollable Modal</vi-button>
    <vi-modal id="modal-scroll" size="md">
      <span slot="header">Terms and Conditions</span>
      <div style="height: 1200px; padding: 1rem; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fafafa 10px, #fafafa 20px);">
        <p>Tall content that requires scrolling...</p>
        <p style="margin-top: 1100px;">End of content.</p>
      </div>
      <div slot="footer">
        <vi-button variant="primary" @click=${() => closeModal('modal-scroll')}>I Agree</vi-button>
      </div>
    </vi-modal>
  `,
};

export const ProgrammaticGuard: Story = {
  name: 'Programmatic Guard (Prevent Close)',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates listening to `vi-modal-request-close` to prevent the modal from closing if there are unsaved changes. Cancel the event via `e.preventDefault()`.',
      },
    },
  },
  render: () => {
    const handleRequestClose = (e: Event) => {
      // Simulate form dirtiness
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmed) {
        e.preventDefault(); // Block the modal from closing
      }
    };
    
    return html`
      <vi-button @click=${() => openModal('modal-guard')}>Open Form Modal</vi-button>
      <vi-modal
        id="modal-guard"
        size="sm"
        @vi-modal-request-close=${handleRequestClose}
      >
        <span slot="header">Edit Record</span>
        <vi-input placeholder="Type something..."></vi-input>
        <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
          Try clicking outside or pressing Escape. A browser confirm dialog will guard the close action.
        </p>
        <div slot="footer">
          <vi-button variant="ghost" @click=${() => closeModal('modal-guard')}>Cancel</vi-button>
          <vi-button variant="primary" @click=${() => {
            // Force close without firing request-close (simulates successful save)
            const modal = document.getElementById('modal-guard') as ViModal | null;
            if (modal) {
              modal.open = false; // Programmatically resetting open property bypasses the guard check
            }
          }}>Save</vi-button>
        </div>
      </vi-modal>
    `;
  }
};

export const DraggableAndMaximizable: Story = {
  render: () => html`
    <vi-button @click=${() => openModal('modal-drag-max')}>Open Draggable Modal</vi-button>
    <vi-modal id="modal-drag-max" size="md" draggable maximizable>
      <span slot="header">Interactive Modal</span>
      <p>Drag me by the header, or click the maximize button!</p>
      <div style="margin-top: 1rem;">
        <vi-input placeholder="Try typing..."></vi-input>
      </div>
      <div slot="footer">
        <vi-button @click=${() => closeModal('modal-drag-max')}>Close</vi-button>
      </div>
    </vi-modal>
  `,
};

export const Positioning: Story = {
  render: () => html`
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
      ${['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'].map(pos => html`
        <vi-button @click=${() => openModal(`modal-pos-${pos}`)}>${pos}</vi-button>
        <vi-modal id="modal-pos-${pos}" position=${pos} size="sm">
          <span slot="header">Position: ${pos}</span>
          <p>This modal appears at ${pos}.</p>
          <div slot="footer">
            <vi-button @click=${() => closeModal(`modal-pos-${pos}`)}>Close</vi-button>
          </div>
        </vi-modal>
      `)}
    </div>
  `,
};

export const ZIndexStacking: Story = {
  render: () => {
    return html`
      <div style="padding: 24px; min-height: 400px;">
        <vi-button @click=${() => document.getElementById('stacking-modal-1')?.setAttribute('open', 'true')}>
          Open Stacking Modal 1
        </vi-button>

        <vi-modal id="stacking-modal-1" size="lg" closable>
          <span slot="header">Stacking Modal 1 (Base)</span>
          
          <div style="padding: 16px; min-height: 300px;">
            <p style="margin-bottom: 24px;">
              This modal tests the OverlayManager. Modals are now appended to body, 
              and their z-index is managed explicitly.
            </p>
            
            <div style="margin-bottom: 24px;">
              <vi-combobox 
                hoist
                placeholder="Select an option (Hoisted)" 
                .options=${[{value: '1', label: 'Option 1'}, {value: '2', label: 'Option 2'}]}>
              </vi-combobox>
              <p style="font-size: 12px; color: #666; margin-top: 8px;">
                The combobox listbox is also teleported to the body via hoist, and given a higher z-index than the modal.
              </p>
            </div>

            <vi-button @click=${() => document.getElementById('stacking-modal-2')?.setAttribute('open', 'true')}>
              Open Nested Modal 2
            </vi-button>
          </div>
        </vi-modal>

        <vi-modal id="stacking-modal-2" size="sm" closable>
          <span slot="header">Nested Modal 2</span>
          
          <div style="padding: 16px;">
            <p>
              This modal should appear <strong>above</strong> Modal 1 and its backdrop should cover Modal 1.
            </p>
            <vi-button @click=${() => document.getElementById('stacking-modal-2')?.removeAttribute('open')}>
              Close Me
            </vi-button>
          </div>
        </vi-modal>
      </div>
    `;
  },
};

export const PersistentWithShake: Story = {
  name: 'Persistent Modal (Shake on Dismiss)',
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the **shake animation** on a persistent modal.
When \`persistent\` is \`true\`, pressing **Escape** or clicking the **backdrop**
will not close the modal. Instead, the dialog shakes to signal "blocked" — 
matching the macOS alert dialog and MUI Dialog patterns.

The modal also dispatches a \`vi-modal-request-close\` event with \`detail.reason\`
so consumers can show a custom in-modal warning message instead.
        `,
      },
    },
  },
  render: () => {
    let _warningVisible = false;

    const handleRequestClose = (_e: Event) => {
      const modal = document.getElementById('modal-persistent-shake') as ViModal | null;
      const warning = modal?.querySelector<HTMLElement>('.shake-warning');
      if (!warning) return;

      // Show the warning message on first attempt, escalate on repeated attempts
      _warningVisible = true;
      warning.style.display = 'block';
      warning.animate(
        [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 200, fill: 'forwards' }
      );
    };

    return html`
      <vi-button variant="danger" @click=${() => openModal('modal-persistent-shake')}>
        Open Persistent Modal
      </vi-button>

      <vi-modal
        id="modal-persistent-shake"
        persistent
        closable=${false}
        size="sm"
        @vi-modal-request-close=${handleRequestClose}
      >
        <span slot="header">⚠️ Action Required</span>
        <div>
          <p>You <strong>must</strong> make a choice before dismissing this dialog.</p>
          <p style="color: #888; font-size: 0.875rem; margin-top: 0.5rem;">
            Try pressing <kbd style="background:#eee;padding:2px 6px;border-radius:4px;border:1px solid #ccc">Escape</kbd>
            or clicking the backdrop — the modal will shake instead of closing.
          </p>
          <p
            class="shake-warning"
            style="display: none; margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.875rem; color: #856404;"
          >
            ⚠️ Please select an option below before closing.
          </p>
        </div>
        <div slot="footer" style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          <vi-button variant="ghost" @click=${() => closeModal('modal-persistent-shake')}>
            Decline
          </vi-button>
          <vi-button variant="primary" @click=${() => closeModal('modal-persistent-shake')}>
            Accept & Continue
          </vi-button>
        </div>
      </vi-modal>
    `;
  },
};

export const CustomAnimations: Story = {
  name: 'Custom Animations',
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates how to customize the **enter** and **exit** animations using the \`enter-animation\` and \`exit-animation\` properties.
You can also adjust the animation duration with \`animation-duration\`.
        `,
      },
    },
  },
  args: {
    enterAnimation: 'pop-in',
    exitAnimation: 'pop-out',
    animationDuration: 400,
  },
  argTypes: {
    enterAnimation: {
      name: 'enter-animation',
      control: 'select',
      options: ['fade-in', 'fade-in-up', 'fade-in-down', 'zoom-in', 'scale-up', 'pop-in', 'slide-in-top', 'slide-in-bottom', 'slide-in-left', 'slide-in-right', 'none'],
    },
    exitAnimation: {
      name: 'exit-animation',
      control: 'select',
      options: ['fade-out', 'fade-out-down', 'fade-out-up', 'zoom-out', 'scale-down', 'pop-out', 'slide-out-top', 'slide-out-bottom', 'slide-out-left', 'slide-out-right', 'none'],
    },
    animationDuration: {
      name: 'animation-duration',
      control: { type: 'range', min: 100, max: 2000, step: 100 },
    },
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-custom-animation')}>
      Open Animated Modal
    </vi-button>

    <vi-modal
      id="modal-custom-animation"
      enter-animation=${args.enterAnimation}
      exit-animation=${args.exitAnimation}
      animation-duration=${args.animationDuration}
    >
      <span slot="header">Custom Animation</span>
      <div>
        <p>This modal is using custom enter and exit animations.</p>
        <ul style="margin-top: 1rem; margin-bottom: 1rem;">
          <li><strong>Enter:</strong> ${args.enterAnimation}</li>
          <li><strong>Exit:</strong> ${args.exitAnimation}</li>
          <li><strong>Duration:</strong> ${args.animationDuration}ms</li>
        </ul>
        <p>Try changing the controls below to see different effects!</p>
      </div>
      <div slot="footer">
        <vi-button @click=${() => closeModal('modal-custom-animation')}>
          Close
        </vi-button>
      </div>
    </vi-modal>
  `,
};

export const NoBackdrop: Story = {
  name: 'No Backdrop (Floating Tool Window)',
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a modeless floating tool window using `no-backdrop` and `draggable`. Background controls remain interactive.',
      },
    },
  },
  render: () => html`
    <div style="padding: 1rem;">
      <vi-button @click=${() => openModal('modal-no-backdrop')}>
        Open Floating Window
      </vi-button>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <vi-button variant="secondary">Background Interactive Button 1</vi-button>
        <vi-button variant="outline">Background Interactive Button 2</vi-button>
      </div>
    </div>

    <vi-modal
      id="modal-no-backdrop"
      size="sm"
      draggable
      no-backdrop
      position="top-right"
    >
      <span slot="header">Floating Inspector</span>
      <div>
        <p>This modal floats without a dark backdrop overlay.</p>
        <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
          You can drag this panel around and click background controls while it is open.
        </p>
      </div>
      <div slot="footer">
        <vi-button size="sm" @click=${() => closeModal('modal-no-backdrop')}>
          Close
        </vi-button>
      </div>
    </vi-modal>
  `,
};
