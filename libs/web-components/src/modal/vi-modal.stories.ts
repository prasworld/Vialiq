import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './vi-modal.js';
import './vi-modal-header.js';
import './vi-modal-footer.js';
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
      options: [
        'center',
        'top',
        'bottom',
        'left',
        'right',
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
      ],
      description: 'Position of the modal on the screen.',
    },
    autofocus: {
      control: 'boolean',
      description: 'Focus first element on open.',
    },
    scrollable: {
      name: 'scrollable',
      control: 'boolean',
      description:
        'Allows the body to scroll while keeping the header/footer fixed.',
    },
    scrollStrategy: {
      control: 'radio',
      options: ['block', 'noop'],
      description: 'Scroll strategy when the modal is open',
      table: {
        defaultValue: { summary: 'block' },
      },
    },
    dragContainment: {
      name: 'drag-containment',
      control: 'radio',
      options: ['none', 'viewport', 'parent'],
      description:
        'Clamp drag movement: `none` = unconstrained, `viewport` = stays in viewport, `parent` = stays in offset parent.',
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
      ?persistent=${args.persistent}
      ?draggable=${args.draggable}
      ?autofocus=${args.autofocus}
      ?scrollable=${args.scrollable}
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Default Modal</vi-modal-header>
      <p>
        This is the default modal content. It acts as a standard dialog for
        forms and general information.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-default')}
          >Cancel</vi-button
        >
        <vi-button variant="primary" @click=${() => closeModal('modal-default')}
          >Save</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const Sizes: Story = {
  render: (args) => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
      ${['xs', 'sm', 'md', 'lg', 'xl', 'full-width', 'fullscreen'].map(
        (size) => html`
          <vi-button @click=${() => openModal(`modal-size-${size}`)}
            >Size: ${size}</vi-button
          >
          <vi-modal id="modal-size-${size}" size=${size}>
            <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modal Size: ${size}</vi-modal-header>
            <p>This modal is rendered with size <strong>${size}</strong>.</p>
            <vi-modal-footer slot="footer">
              <vi-button @click=${() => closeModal(`modal-size-${size}`)}
                >Close</vi-button
              >
            </vi-modal-footer>
          </vi-modal>
        `,
      )}
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
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Drawer Variant</vi-modal-header>
      <p>
        Drawers slide in from the edge of the screen and take up the full
        viewport height.
      </p>
      <p>
        They are useful for detailed records, audit trails, and configuration
        settings.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="primary" @click=${() => closeModal('modal-drawer')}
          >Submit</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const Alert: Story = {
  args: {
    alertVariant: 'danger',
    persistent: true,
  },
  render: (args) => html`
    <vi-button variant="danger" @click=${() => openModal('modal-alert')}
      >Lock Data</vi-button
    >
    <vi-modal
      id="modal-alert"
      variant="alert"
      ?persistent=${args.persistent}
      size="sm"
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lock Data</vi-modal-header>
      <p>
        This action is <strong>irreversible</strong>. All forms will be locked
        for editing.
      </p>
      <p>Are you sure you want to lock this subject's data?</p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-alert')}
          >Cancel</vi-button
        >
        <vi-button
          variant=${args.alertVariant === 'danger' ? 'danger' : 'primary'}
          @click=${() => closeModal('modal-alert')}
          >Confirm Lock</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const ScrollableContent: Story = {
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-scroll')}
      >Open Scrollable Modal</vi-button
    >
    <vi-modal id="modal-scroll" size="md">
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Terms and Conditions</vi-modal-header>
      <div
        style="height: 1200px; padding: 1rem; background: repeating-linear-gradient(45deg, #f0f0f0, #f0f0f0 10px, #fafafa 10px, #fafafa 20px);"
      >
        <p>Tall content that requires scrolling...</p>
        <p style="margin-top: 1100px;">End of content.</p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button variant="primary" @click=${() => closeModal('modal-scroll')}
          >I Agree</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const ProgrammaticGuard: Story = {
  name: 'Programmatic Guard (Prevent Close)',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates listening to `vi-modal-request-close` to prevent the modal from closing if there are unsaved changes. Cancel the event via `e.preventDefault()`.',
      },
    },
  },
  render: (args) => {
    const handleRequestClose = (e: Event) => {
      // Simulate form dirtiness
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?',
      );
      if (!confirmed) {
        e.preventDefault(); // Block the modal from closing
      }
    };

    return html`
      <vi-button @click=${() => openModal('modal-guard')}
        >Open Form Modal</vi-button
      >
      <vi-modal
        id="modal-guard"
        size="sm"
        @vi-modal-request-close=${handleRequestClose}
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Edit Record</vi-modal-header>
        <vi-input placeholder="Type something..."></vi-input>
        <p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">
          Try clicking outside or pressing Escape. A browser confirm dialog will
          guard the close action.
        </p>
        <vi-modal-footer slot="footer">
          <vi-button variant="ghost" @click=${() => closeModal('modal-guard')}
            >Cancel</vi-button
          >
          <vi-button
            variant="primary"
            @click=${() => {
              // Force close without firing request-close (simulates successful save)
              const modal = document.getElementById(
                'modal-guard',
              ) as ViModal | null;
              if (modal) {
                modal.open = false; // Programmatically resetting open property bypasses the guard check
              }
            }}
            >Save</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    `;
  },
};

export const DraggableAndMaximizable: Story = {
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-drag-max')}
      >Open Draggable Modal</vi-button
    >
    <vi-modal id="modal-drag-max" size="md" draggable>
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Interactive Modal</vi-modal-header>
      <p>Drag me by the header, or click the maximize button!</p>
      <div style="margin-top: 1rem;">
        <vi-input placeholder="Try typing..."></vi-input>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button @click=${() => closeModal('modal-drag-max')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const Positioning: Story = {
  render: (args) => html`
    <div
      style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;"
    >
      ${[
        'top-left',
        'top',
        'top-right',
        'left',
        'center',
        'right',
        'bottom-left',
        'bottom',
        'bottom-right',
      ].map(
        (pos) => html`
          <vi-button @click=${() => openModal(`modal-pos-${pos}`)}
            >${pos}</vi-button
          >
          <vi-modal id="modal-pos-${pos}" position=${pos} size="sm">
            <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Position: ${pos}</vi-modal-header>
            <p>This modal appears at ${pos}.</p>
            <vi-modal-footer slot="footer">
              <vi-button @click=${() => closeModal(`modal-pos-${pos}`)}
                >Close</vi-button
              >
            </vi-modal-footer>
          </vi-modal>
        `,
      )}
    </div>
  `,
};

export const ZIndexStacking: Story = {
  render: (args) => {
    return html`
      <div style="padding: 24px; min-height: 400px;">
        <vi-button
          @click=${() =>
            document
              .getElementById('stacking-modal-1')
              ?.setAttribute('open', 'true')}
        >
          Open Stacking Modal 1
        </vi-button>

        <vi-modal id="stacking-modal-1" size="lg" closable>
          <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Stacking Modal 1 (Base)</vi-modal-header>

          <div style="padding: 16px; min-height: 300px;">
            <p style="margin-bottom: 24px;">
              This modal tests the OverlayManager. Modals are now appended to
              body, and their z-index is managed explicitly.
            </p>

            <div style="margin-bottom: 24px;">
              <vi-combobox
                hoist
                placeholder="Select an option (Hoisted)"
                .options=${[
                  { value: '1', label: 'Option 1' },
                  { value: '2', label: 'Option 2' },
                ]}
              >
              </vi-combobox>
              <p style="font-size: 12px; color: #666; margin-top: 8px;">
                The combobox listbox is also teleported to the body via hoist,
                and given a higher z-index than the modal.
              </p>
            </div>

            <vi-button
              @click=${() =>
                document
                  .getElementById('stacking-modal-2')
                  ?.setAttribute('open', 'true')}
            >
              Open Nested Modal 2
            </vi-button>
          </div>
        </vi-modal>

        <vi-modal id="stacking-modal-2" size="sm" closable>
          <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Nested Modal 2</vi-modal-header>

          <div style="padding: 16px;">
            <p>
              This modal should appear <strong>above</strong> Modal 1 and its
              backdrop should cover Modal 1.
            </p>
            <vi-button
              @click=${() =>
                document
                  .getElementById('stacking-modal-2')
                  ?.removeAttribute('open')}
            >
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
  render: (args) => {
    let _warningVisible = false;

    const handleRequestClose = (_e: Event) => {
      const modal = document.getElementById(
        'modal-persistent-shake',
      ) as ViModal | null;
      const warning = modal?.querySelector<HTMLElement>('.shake-warning');
      if (!warning) return;

      // Show the warning message on first attempt, escalate on repeated attempts
      _warningVisible = true;
      warning.style.display = 'block';
      warning.animate(
        [
          { opacity: 0, transform: 'translateY(-4px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 200, fill: 'forwards' },
      );
    };

    return html`
      <vi-button
        variant="danger"
        @click=${() => openModal('modal-persistent-shake')}
      >
        Open Persistent Modal
      </vi-button>

      <vi-modal
        id="modal-persistent-shake"
        persistent
        closable=${false}
        size="sm"
        @vi-modal-request-close=${handleRequestClose}
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>⚠️ Action Required</vi-modal-header>
        <div>
          <p>
            You <strong>must</strong> make a choice before dismissing this
            dialog.
          </p>
          <p style="color: #888; font-size: 0.875rem; margin-top: 0.5rem;">
            Try pressing
            <kbd
              style="background:#eee;padding:2px 6px;border-radius:4px;border:1px solid #ccc"
              >Escape</kbd
            >
            or clicking the backdrop — the modal will shake instead of closing.
          </p>
          <p
            class="shake-warning"
            style="display: none; margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.875rem; color: #856404;"
          >
            ⚠️ Please select an option below before closing.
          </p>
        </div>
        <div
          slot="footer"
          style="display: flex; gap: 0.5rem; justify-content: flex-end;"
        >
          <vi-button
            variant="ghost"
            @click=${() => closeModal('modal-persistent-shake')}
          >
            Decline
          </vi-button>
          <vi-button
            variant="primary"
            @click=${() => closeModal('modal-persistent-shake')}
          >
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
      options: [
        'fade-in',
        'fade-in-up',
        'fade-in-down',
        'zoom-in',
        'scale-up',
        'pop-in',
        'slide-in-top',
        'slide-in-bottom',
        'slide-in-left',
        'slide-in-right',
        'none',
      ],
    },
    exitAnimation: {
      name: 'exit-animation',
      control: 'select',
      options: [
        'fade-out',
        'fade-out-down',
        'fade-out-up',
        'zoom-out',
        'scale-down',
        'pop-out',
        'slide-out-top',
        'slide-out-bottom',
        'slide-out-left',
        'slide-out-right',
        'none',
      ],
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
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Custom Animation</vi-modal-header>
      <div>
        <p>This modal is using custom enter and exit animations.</p>
        <ul style="margin-top: 1rem; margin-bottom: 1rem;">
          <li><strong>Enter:</strong> ${args.enterAnimation}</li>
          <li><strong>Exit:</strong> ${args.exitAnimation}</li>
          <li><strong>Duration:</strong> ${args.animationDuration}ms</li>
        </ul>
        <p>Try changing the controls below to see different effects!</p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button @click=${() => closeModal('modal-custom-animation')}>
          Close
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const NoBackdrop: Story = {
  name: 'No Backdrop (Floating Tool Window)',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates a modeless floating tool window using `no-backdrop` and `draggable`. Background controls remain interactive.',
      },
    },
  },
  render: (args) => html`
    <div style="padding: 1rem;">
      <vi-button @click=${() => openModal('modal-no-backdrop')}>
        Open Floating Window
      </vi-button>
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <vi-button variant="secondary"
          >Background Interactive Button 1</vi-button
        >
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
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Floating Inspector</vi-modal-header>
      <div>
        <p>This modal floats without a dark backdrop overlay.</p>
        <p style="margin-top: 0.5rem; color: #666; font-size: 0.875rem;">
          You can drag this panel around and click background controls while it
          is open.
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button size="sm" @click=${() => closeModal('modal-no-backdrop')}>
          Close
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const MultipleFloatingWindows: Story = {
  name: 'Multiple Floating Modeless Modals',
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates multiple modeless floating panels (`no-backdrop` + `draggable`) open simultaneously. Each window can be dragged independently, layered on focus, and operated alongside background page controls.',
      },
    },
  },
  render: (args) => html`
    <div
      style="padding: 1.5rem; min-height: 450px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; position: relative;"
    >
      <div
        style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; background: #ffffff; padding: 1rem; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
      >
        <vi-button
          variant="primary"
          size="sm"
          @click=${() => openModal('modal-panel-1')}
        >
          Toggle Subject Inspector
        </vi-button>

        <vi-button
          variant="secondary"
          size="sm"
          @click=${() => openModal('modal-panel-2')}
        >
          Toggle Filter Palette
        </vi-button>

        <vi-button
          variant="info"
          size="sm"
          @click=${() => openModal('modal-panel-3')}
        >
          Toggle Live Metrics
        </vi-button>
      </div>

      <div
        style="background: #ffffff; padding: 1.25rem; border-radius: 6px; border: 1px solid #cbd5e1;"
      >
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem; color: #0f172a;">
          Background EDC Data Workspace
        </h4>
        <p style="margin: 0 0 1rem 0; color: #64748b; font-size: 0.875rem;">
          Click the buttons above to open multiple modeless windows. Drag each
          window by its header, interact with background inputs/buttons below,
          or layer windows on focus.
        </p>
        <div style="display: flex; gap: 1rem;">
          <vi-button variant="outline" size="sm"
            >Background Export CSV</vi-button
          >
          <vi-button variant="ghost" size="sm"
            >Background Refresh Data</vi-button
          >
        </div>
      </div>
    </div>

    <!-- Window 1: Subject Inspector -->
    <vi-modal
      id="modal-panel-1"
      open
      size="xs"
      draggable
      no-backdrop
      position="top-left"
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Subject Inspector</vi-modal-header>
      <div>
        <p style="margin: 0; font-size: 0.875rem; color: #334155;">
          <strong>Subject ID:</strong> SUBJ-0042
        </p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;">
          Status: Enrolled (Site 101)
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${() => closeModal('modal-panel-1')}
        >
          Close Inspector
        </vi-button>
      </vi-modal-footer>
    </vi-modal>

    <!-- Window 2: Filter Palette -->
    <vi-modal
      id="modal-panel-2"
      open
      size="xs"
      draggable
      no-backdrop
      position="center"
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Filter Palette</vi-modal-header>
      <div>
        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #334155;">
          Active Filter Options:
        </p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <vi-tag size="xs" selectable selected variant="primary"
            >Screened</vi-tag
          >
          <vi-tag size="xs" selectable variant="warning">Pending</vi-tag>
          <vi-tag size="xs" selectable variant="success">Completed</vi-tag>
        </div>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${() => closeModal('modal-panel-2')}
        >
          Close Palette
        </vi-button>
      </vi-modal-footer>
    </vi-modal>

    <!-- Window 3: Live Metrics -->
    <vi-modal
      id="modal-panel-3"
      open
      size="xs"
      draggable
      no-backdrop
      position="top-right"
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Live Metrics</vi-modal-header>
      <div>
        <p style="margin: 0; font-size: 0.875rem; color: #334155;">
          <strong>Sync Latency:</strong> 12ms
        </p>
        <p style="margin: 0.5rem 0 0 0; font-size: 0.875rem; color: #64748b;">
          Queries Pending: 3
        </p>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button
          size="xs"
          variant="ghost"
          @click=${() => closeModal('modal-panel-3')}
        >
          Close Metrics
        </vi-button>
      </vi-modal-footer>
    </vi-modal>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// Resizable & Draggable
// ─────────────────────────────────────────────────────────────────────────────

export const ResizableModal: Story = {
  name: 'Resizable & Draggable',
  parameters: {
    docs: {
      description: {
        story:
          'Combine `draggable`, `resizable`, and `maximizable` for a fully window-like experience. ' +
          'Resize from any of the 8 edge/corner handles. Handles automatically hide when maximized.',
      },
    },
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-resizable')}
      >Open Resizable Modal</vi-button
    >
    <vi-modal id="modal-resizable" size="md" draggable resizable>
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} maximizable>Window Panel</vi-modal-header>
      <p>
        This modal can be dragged by its header and resized from any of its 8
        edges and corners.
      </p>
      <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
        Try dragging the bottom-right corner to resize, then click maximize —
        resize handles will automatically hide.
      </p>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-resizable')}
          >Cancel</vi-button
        >
        <vi-button
          variant="primary"
          @click=${() => closeModal('modal-resizable')}
          >Save</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// Drag Containment — viewport clamping
// ─────────────────────────────────────────────────────────────────────────────

export const ContainedDrag: Story = {
  name: 'Drag Containment (Viewport)',
  parameters: {
    docs: {
      description: {
        story:
          'Use `drag-containment="viewport"` to prevent the modal from being dragged off-screen. ' +
          'The modal will be clamped to the viewport boundary on all sides.',
      },
    },
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-contained')}
      >Open Contained Draggable</vi-button
    >
    <vi-modal
      id="modal-contained"
      size="sm"
      draggable
      drag-containment="viewport"
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Contained Draggable</vi-modal-header>
      <p>
        Try dragging this modal to the edge of the viewport — it will stop at
        the boundary and cannot go off-screen.
      </p>
      <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
        <code>drag-containment="viewport"</code>
      </p>
      <vi-modal-footer slot="footer">
        <vi-button @click=${() => closeModal('modal-contained')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom append-to container
// ─────────────────────────────────────────────────────────────────────────────

export const CustomAppendTo: Story = {
  name: 'Custom append-to Container',
  parameters: {
    docs: {
      description: {
        story:
          'Use the `append-to` attribute to teleport the modal into a specific container element ' +
          'instead of `document.body`. Useful for scoped stacking contexts (e.g., a full-screen app shell). ' +
          'Inspect the DOM after opening — the modal will be inside `#custom-portal`, not `body`.',
      },
    },
  },
  render: (args) => html`
    <div
      id="custom-portal"
      style="
        position: relative;
        min-height: 400px;
        background: #f8fafc;
        border: 2px dashed #94a3b8;
        border-radius: 8px;
        padding: 1.5rem;
        overflow: hidden;
      "
    >
      <p style="color: #64748b; font-size: 0.875rem; margin-bottom: 1rem;">
        This <code>#custom-portal</code> div is the teleport target. Open the
        modal and inspect the DOM — <code>vi-modal</code> will be appended here,
        not to <code>body</code>.
      </p>

      <vi-button @click=${() => openModal('modal-append-to')}
        >Open Modal (append-to #custom-portal)</vi-button
      >

      <vi-modal
        id="modal-append-to"
        size="sm"
        append-to="#custom-portal"
        no-backdrop
        draggable
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scoped Modal</vi-modal-header>
        <p>
          This modal was teleported into
          <code>#custom-portal</code>, not <code>body</code>.
        </p>
        <p style="color: #64748b; font-size: 0.875rem; margin-top: 0.5rem;">
          Useful for scoped stacking contexts or micro-frontend shells.
        </p>
        <vi-modal-footer slot="footer">
          <vi-button @click=${() => closeModal('modal-append-to')}>Close</vi-button>
        </vi-modal-footer>
      </vi-modal>
    </div>
  `,
};

// ─────────────────────────────────────────────────────────────────────────────
// Drag Containment
// ─────────────────────────────────────────────────────────────────────────────

export const DragContainmentDemo: Story = {
  name: 'Drag Containment',
  parameters: {
    docs: {
      description: {
        story:
          'Modals with `draggable` can be clamped to boundaries using `drag-containment`.<br/>' +
          'Options are: `none` (default), `viewport` (cannot be dragged off-screen), and `parent` (stays within its offset parent).',
      },
    },
  },
  render: (args) => html`
    <div style="display: flex; gap: 1rem; margin-bottom: 2rem;">
      <vi-button @click=${() => openModal('modal-drag-viewport')}
        >Open (Viewport Bound)</vi-button
      >
      <vi-button
        variant="secondary"
        @click=${() => openModal('modal-drag-parent')}
        >Open (Parent Bound)</vi-button
      >
    </div>

    <!-- Parent container to demonstrate "parent" containment -->
    <div
      id="drag-parent-container"
      style="
        position: relative;
        width: 100%;
        max-width: 600px;
        height: 400px;
        background: #f8fafc;
        border: 2px dashed #94a3b8;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      "
    >
      <p style="color: #64748b; font-size: 0.875rem;">
        The "Parent Bound" modal is appended here and cannot be dragged outside
        this dashed box.
      </p>

      <vi-modal
        id="modal-drag-parent"
        size="xs"
        draggable
        drag-containment="parent"
        append-to="#drag-parent-container"
        no-backdrop
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Parent</vi-modal-header>
        <p>I cannot be dragged outside the dashed box.</p>
        <vi-modal-footer slot="footer">
          <vi-button size="sm" @click=${() => closeModal('modal-drag-parent')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>

    <!-- Viewport bounded modal (appended to body by default) -->
    <vi-modal
      id="modal-drag-viewport"
      size="xs"
      draggable
      drag-containment="viewport"
      no-backdrop
    >
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Bound to Viewport</vi-modal-header>
      <p>I cannot be dragged off the screen. Try throwing me off the edge!</p>
      <vi-modal-footer slot="footer">
        <vi-button size="sm" @click=${() => closeModal('modal-drag-viewport')}
          >Close</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};

export const ModelessScroll: Story = {
  render: (args) => html`
    <div
      style="height: 150vh; padding: 2rem; border: 2px dashed #ccc; background: linear-gradient(to bottom, #f9f9f9, #eaeaea);"
    >
      <h2>Scroll Strategy Demonstration</h2>
      <p>This page has a lot of content to make it scrollable.</p>
      <vi-button @click=${() => openModal('modal-modeless-scroll')}
        >Open Modeless Panel</vi-button
      >

      <div style="margin-top: 100vh;">
        <p>Bottom of the page!</p>
      </div>

      <vi-modal
        id="modal-modeless-scroll"
        size="xs"
        draggable
        no-backdrop
        scroll-strategy="noop"
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Modeless Palette</vi-modal-header>
        <p>
          Because <code>scroll-strategy="noop"</code> is set and there's no
          backdrop, you can still scroll the background document while this is
          open!
        </p>
        <vi-modal-footer slot="footer">
          <vi-button @click=${() => closeModal('modal-modeless-scroll')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>
  `,
};

export const NestedScrolling: Story = {
  render: (args) => html`
    <div
      style="height: 200vh; padding: 2rem; border: 2px dashed #999; background: linear-gradient(to bottom, #e3f2fd, #bbdefb);"
    >
      <h2>Nested Scrolling Demonstration</h2>
      <p>Scroll down to open the modal.</p>
      <div style="margin-top: 50vh;">
        <vi-button @click=${() => openModal('modal-nested-scroll')}
          >Open Modal with Scrollable Content</vi-button
        >
      </div>

      <div style="margin-top: 100vh;">
        <p>Bottom of the background page!</p>
      </div>

      <vi-modal
        id="modal-nested-scroll"
        size="sm"
        scroll-strategy="noop"
        no-backdrop
        draggable
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Scrollable Modal</vi-modal-header>
        <div style="padding-right: 1rem;">
          <p>This modal has a lot of content, so it will scroll internally.</p>
          ${Array.from({ length: 20 }).map(
            (_, i) => html`<p>Modal content line ${i + 1}</p>`,
          )}
          <p>
            Try scrolling here. If <code>scroll-strategy="block"</code>, the
            background will <strong>not</strong> scroll when you reach the
            bottom of this modal. If you change it to <code>noop</code>, the
            background <em>will</em> scroll when the modal reaches its scroll
            bounds (or if you scroll outside the modal).
          </p>
        </div>
        <vi-modal-footer slot="footer">
          <vi-button @click=${() => closeModal('modal-nested-scroll')}
            >Close</vi-button
          >
        </vi-modal-footer>
      </vi-modal>
    </div>
  `,
};

export const EventLifecycle: Story = {
  render: (args) => {
    let preventClose = false;
    let logCount = 0;

    const logEvent = (name: string, detail?: unknown) => {
      const logger = document.getElementById('event-logger');
      if (logger) {
        logCount++;
        const detailString = detail ? ` - ${JSON.stringify(detail)}` : '';
        const div = document.createElement('div');
        div.textContent = `[${logCount}] `;
        const strong = document.createElement('strong');
        strong.textContent = name;
        div.appendChild(strong);
        if (detailString) {
          const span = document.createElement('span');
          span.textContent = detailString;
          div.appendChild(span);
        }
        logger.insertBefore(div, logger.firstChild);
      }
    };

    const handleBeforeOpen = (e: Event) => {
      logEvent('vi-modal-before-open');
    };

    const handleOpen = (e: Event) => {
      logEvent('vi-modal-open');
    };

    const handleAfterOpen = (e: Event) => {
      logEvent('vi-modal-after-open');
    };

    const handleBeforeClose = (e: Event) => {
      logEvent('vi-modal-before-close');
      if (preventClose) {
        e.preventDefault();
        logEvent('❌ Close prevented by vi-modal-before-close!');
      }
    };

    const handleRequestClose = (e: CustomEvent) => {
      logEvent('vi-modal-request-close', e.detail);
    };

    const handleClose = (e: CustomEvent) => {
      logEvent('vi-modal-close', e.detail);
    };

    const handleAfterClose = (e: CustomEvent) => {
      logEvent('vi-modal-after-close', e.detail);
    };

    return html`
      <div style="display: flex; gap: 2rem; align-items: flex-start;">
        <div>
          <vi-button @click=${() => openModal('modal-events')}>Open Event Modal</vi-button>
          
          <div style="margin-top: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-family: sans-serif;">
              <input type="checkbox" @change=${(e: Event) => { preventClose = (e.target as HTMLInputElement).checked; }}>
              Prevent Closing (tests before-close cancellation)
            </label>
          </div>
        </div>

        <div style="flex: 1; min-width: 300px; max-width: 400px;">
          <h3 style="margin-top: 0; font-family: sans-serif;">Event Log</h3>
          <div 
            id="event-logger" 
            style="height: 300px; overflow-y: auto; background: #1e293b; color: #a5b4fc; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 13px;"
          >
            <em>Waiting for events...</em>
          </div>
          <vi-button variant="ghost" size="sm" style="margin-top: 0.5rem;" @click=${() => {
            const logger = document.getElementById('event-logger');
            if (logger) {
              logger.innerHTML = '<em>Waiting for events...</em>';
              logCount = 0;
            }
          }}>Clear Log</vi-button>
        </div>
      </div>

      <vi-modal
        id="modal-events"
        size="sm"
        @vi-modal-before-open=${handleBeforeOpen}
        @vi-modal-open=${handleOpen}
        @vi-modal-after-open=${handleAfterOpen}
        @vi-modal-request-close=${handleRequestClose}
        @vi-modal-before-close=${handleBeforeClose}
        @vi-modal-close=${handleClose}
        @vi-modal-after-close=${handleAfterClose}
      >
        <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Lifecycle Events</vi-modal-header>
        <p>Watch the event log to the right.</p>
        <p>This modal fires events in the following order when opening:</p>
        <ol style="font-family: sans-serif;">
          <li><code>vi-modal-before-open</code> (cancelable)</li>
          <li><code>vi-modal-open</code></li>
          <li><code>vi-modal-after-open</code> (post-animation)</li>
        </ol>
        <p>And when closing:</p>
        <ol style="font-family: sans-serif;">
          <li><code>vi-modal-request-close</code> (cancelable, provides reason)</li>
          <li><code>vi-modal-before-close</code> (cancelable)</li>
          <li><code>vi-modal-close</code></li>
          <li><code>vi-modal-after-close</code> (post-animation)</li>
        </ol>
        <vi-modal-footer slot="footer">
          <vi-button variant="ghost" @click=${() => closeModal('modal-events')}>Close Programmatically</vi-button>
        </vi-modal-footer>
      </vi-modal>
    `;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Responsive (Mobile View)
// ─────────────────────────────────────────────────────────────────────────────

export const ResponsiveMobile: Story = {
  name: 'Responsive (Mobile)',
  parameters: {
    docs: {
      description: {
        story:
          'On screens narrower than 640px (mobile), modals automatically snap to full screen. ' +
          'Margins and border radius are removed, and padding is optimized for small screens. ' +
          'Resize your browser window or use the Storybook viewport tool to test this behavior.',
      },
    },
    // If the viewport addon is installed, this forces it to mobile by default in the canvas
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: (args) => html`
    <vi-button @click=${() => openModal('modal-responsive')}
      >Open Responsive Modal</vi-button
    >
    <vi-modal id="modal-responsive" size="md">
      <vi-modal-header slot="header" alert-variant=${ifDefined(args?.alertVariant)} ?closable=${args?.closable ?? true} ?maximizable=${args?.maximizable ?? false}>Mobile Optimized View</vi-modal-header>
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        <p>
          This modal is designed to automatically adapt to small screens. When the 
          viewport width drops below 640px, it expands to 100vw and 100vh.
        </p>
        <div style="padding: 1rem; background-color: var(--vi-color-grey-100); border-radius: 4px;">
          <h4 style="margin-top: 0;">Try it out:</h4>
          <ol style="margin-bottom: 0;">
            <li>Open this modal on a desktop screen.</li>
            <li>Slowly shrink your browser window width.</li>
            <li>Watch it snap to full screen!</li>
          </ol>
        </div>
        <p>
          Also notice that if the content becomes too long, the body scrolls smoothly 
          while the header and footer remain pinned to the top and bottom of your screen, 
          ensuring action buttons are always reachable.
        </p>
        <!-- Adding some dummy height to prove scrolling works -->
        <div style="height: 400px; border: 1px dashed var(--vi-color-grey-300); display: flex; align-items: center; justify-content: center; color: var(--vi-color-grey-500);">
          Scrollable Content Area
        </div>
      </div>
      <vi-modal-footer slot="footer">
        <vi-button variant="ghost" @click=${() => closeModal('modal-responsive')}
          >Cancel</vi-button
        >
        <vi-button
          variant="primary"
          @click=${() => closeModal('modal-responsive')}
          >Confirm</vi-button
        >
      </vi-modal-footer>
    </vi-modal>
  `,
};
