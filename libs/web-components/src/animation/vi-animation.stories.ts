import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './vi-animation.js';
import '../button/vi-button.js';
import '../alert/vi-alert.js';
import '../chip/vi-chip.js';
import '../chip/vi-chip-group.js';
import '../badge/vi-badge.js';
import '../input/vi-input.js';
import '../checkbox/vi-checkbox.js';
import type { ViAnimation } from './vi-animation.js';

const meta: Meta = {
  title: 'Components/Animation',
  component: 'vi-animation',
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'fade-in',
        'fade-out',
        'fade-in-up',
        'fade-in-down',
        'fade-in-left',
        'fade-in-right',
        'zoom-in',
        'zoom-out',
        'scale-up',
        'scale-down',
        'bounce-in',
        'bounce-out',
        'pop-in',
        'pop-out',
        'slide-in-top',
        'slide-in-bottom',
        'slide-in-left',
        'slide-in-right',
        'flip-x',
        'flip-y',
        'perspective-pop',
        'expand-vertical',
        'collapse-vertical',
        'pulse',
        'bounce',
        'shake',
        'wobble',
        'heartbeat',
        'shimmer',
      ],
    },
    duration: { control: 'number' },
    delay: { control: 'number' },
    easing: { control: 'text' },
    cascade: { control: 'boolean' },
    stagger: { control: 'number' },
    staggerDirection: {
      control: 'select',
      options: ['normal', 'reverse', 'center', 'random'],
    },
    reducedMotion: {
      control: 'select',
      options: ['auto', 'disable', 'fade-only'],
    },
  },
};
export default meta;

/**
 * 1. Default Interactive Preset Controls
 */
export const Default: StoryObj = {
  render: (args) => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; align-items: flex-start; max-width: 480px;"
    >
      <vi-button
        variant="primary"
        @click=${(e: Event) => {
          const btn = e.currentTarget as HTMLElement;
          const anim = btn.nextElementSibling as ViAnimation;
          anim.play();
        }}
      >
        Replay Animation
      </vi-button>

      <vi-animation
        .name=${args.name}
        .duration=${args.duration}
        .delay=${args.delay}
        .easing=${args.easing}
        .reducedMotion=${args.reducedMotion}
      >
        <div
          style="padding: 1.5rem; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); width: 100%;"
        >
          <div
            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;"
          >
            <h3 style="margin: 0; font-size: 1.1rem; color: #1a202c;">
              Clinical Subject Record
            </h3>
            <vi-badge variant="info" size="sm">Active</vi-badge>
          </div>
          <p
            style="margin: 0 0 1rem 0; color: #4a5568; font-size: 0.9rem; line-height: 1.5;"
          >
            Animation preset <code>${args.name}</code> running at
            hardware-accelerated 60/120fps.
          </p>
          <vi-alert variant="info" title="Protocol Status">
            Subject SUBJ-804 has completed Visit 3 screening.
          </vi-alert>
        </div>
      </vi-animation>
    </div>
  `,
  args: {
    name: 'fade-in-up',
    duration: 400,
    delay: 0,
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    reducedMotion: 'auto',
  },
};

/**
 * 2. Preset Catalog Showcase
 */
export const PresetCatalogGallery: StoryObj = {
  render: () => {
    const presets = [
      {
        category: 'Fade & Slide',
        items: [
          'fade-in-up',
          'fade-in-down',
          'slide-in-bottom',
          'slide-in-right',
        ],
      },
      {
        category: 'Scale & Zoom',
        items: ['zoom-in', 'scale-up', 'bounce-in', 'pop-in'],
      },
      {
        category: '3D & Motion',
        items: ['flip-x', 'flip-y', 'perspective-pop', 'expand-vertical'],
      },
      {
        category: 'Attention Seekers',
        items: ['pulse', 'bounce', 'shake', 'heartbeat'],
      },
    ];

    return html`
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        <div
          style="display: flex; justify-content: space-between; align-items: center;"
        >
          <h2 style="margin: 0; font-size: 1.25rem; font-family: sans-serif;">
            Hardware-Accelerated Animation Catalog
          </h2>
          <vi-button
            variant="secondary"
            size="sm"
            @click=${() => {
              const anims = document.querySelectorAll<ViAnimation>(
                'vi-animation.catalog-anim',
              );
              anims.forEach((a) => a.play());
            }}
          >
            Replay All Presets
          </vi-button>
        </div>

        ${presets.map(
          (group) => html`
            <div>
              <h3
                style="margin: 0 0 1rem 0; font-size: 1rem; color: #4a5568; font-family: sans-serif;"
              >
                ${group.category}
              </h3>
              <div
                style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;"
              >
                ${group.items.map(
                  (preset) => html`
                    <div
                      style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem;"
                    >
                      <div
                        style="display: flex; justify-content: space-between; align-items: center;"
                      >
                        <code
                          style="font-size: 0.8rem; font-weight: 600; color: #2b6cb0;"
                          >${preset}</code
                        >
                        <vi-button
                          variant="ghost"
                          size="xs"
                          @click=${(e: Event) => {
                            const card = (
                              e.currentTarget as HTMLElement
                            ).closest('div')?.parentElement;
                            const anim = card?.querySelector('vi-animation');
                            anim?.play();
                          }}
                        >
                          Play
                        </vi-button>
                      </div>
                      <vi-animation
                        class="catalog-anim"
                        name=${preset}
                        duration="1000"
                      >
                        <div
                          style="padding: 0.75rem; background: #ffffff; border: 1px solid #cbd5e0; border-radius: 6px; text-align: center; font-size: 0.85rem; font-weight: 500;"
                        >
                          ${preset}
                        </div>
                      </vi-animation>
                    </div>
                  `,
                )}
              </div>
            </div>
          `,
        )}
      </div>
    `;
  },
};

/**
 * 3. Enter & Exit Transitions (Modal / Panel Overlay)
 */
export const EnterExitTransitions: StoryObj = {
  render: () => {
    let isOpen = true;
    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;"
      >
        <vi-button
          variant="primary"
          @click=${(e: Event) => {
            const container = (e.currentTarget as HTMLElement).parentElement;
            const anim = container?.querySelector(
              '#drawer-anim',
            ) as ViAnimation;
            isOpen = !isOpen;
            if (isOpen) {
              anim.show();
            } else {
              anim.hide();
            }
          }}
        >
          Toggle Contextual Drawer (show / hide)
        </vi-button>

        <vi-animation
          id="drawer-anim"
          enter="fade-in-up"
          exit="fade-out-down"
          .duration=${350}
          .open=${isOpen}
        >
          <div
            style="padding: 1.5rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); width: 360px; display: flex; flex-direction: column; gap: 1rem;"
          >
            <div
              style="display: flex; justify-content: space-between; align-items: center;"
            >
              <h3 style="margin: 0; font-size: 1.1rem;">
                Protocol Deviation Form
              </h3>
              <vi-badge variant="warning" size="sm">Urgent</vi-badge>
            </div>
            <vi-input label="Subject Identifier" value="SUBJ-4092"></vi-input>
            <vi-input
              label="Deviation Description"
              placeholder="Enter clinical notes..."
            ></vi-input>
            <div
              style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 0.5rem;"
            >
              <vi-button variant="ghost" size="sm">Cancel</vi-button>
              <vi-button variant="primary" size="sm">Submit Report</vi-button>
            </div>
          </div>
        </vi-animation>
      </div>
    `;
  },
};

/**
 * 4. Cascading Staggered Grid & Table Rows
 */
export const CascadingStagger: StoryObj = {
  render: (args) => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px;"
    >
      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="primary"
          @click=${(e: Event) => {
            const wrapper = (e.currentTarget as HTMLElement).parentElement
              ?.nextElementSibling as ViAnimation;
            wrapper.play();
          }}
        >
          Replay Cascading Stagger
        </vi-button>
        <span style="font-size: 0.85rem; color: #64748b;"
          >Direction: <strong>${args.staggerDirection}</strong></span
        >
      </div>

      <!-- Cascading Chips -->
      <vi-animation
        cascade
        .stagger=${args.stagger}
        .staggerDirection=${args.staggerDirection}
        enter="zoom-in"
        duration="300"
      >
        <vi-chip-group multi name="filters">
          <vi-chip value="all" selected>All Subjects</vi-chip>
          <vi-chip value="enrolled">Enrolled (142)</vi-chip>
          <vi-chip value="screened">Screened (89)</vi-chip>
          <vi-chip value="completed">Completed (56)</vi-chip>
          <vi-chip value="discontinued">Discontinued (12)</vi-chip>
        </vi-chip-group>
      </vi-animation>

      <!-- Cascading Table Rows -->
      <vi-animation
        cascade
        stagger-selector="tr"
        .stagger=${args.stagger}
        .staggerDirection=${args.staggerDirection}
        enter="fade-in-up"
        duration="350"
      >
        <table
          style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;"
        >
          <thead>
            <tr
              style="background: #f8fafc; text-align: left; font-size: 0.85rem; color: #475569;"
            >
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Subject ID
              </th>
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Site
              </th>
              <th
                style="padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1001
              </td>
              <td style="padding: 0.75rem 1rem;">Site 01</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="success" size="sm">Enrolled</vi-badge>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1002
              </td>
              <td style="padding: 0.75rem 1rem;">Site 01</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="info" size="sm">Screened</vi-badge>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1003
              </td>
              <td style="padding: 0.75rem 1rem;">Site 02</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="success" size="sm">Completed</vi-badge>
              </td>
            </tr>
            <tr>
              <td style="padding: 0.75rem 1rem; font-weight: 500;">
                SUBJ-1004
              </td>
              <td style="padding: 0.75rem 1rem;">Site 03</td>
              <td style="padding: 0.75rem 1rem;">
                <vi-badge variant="danger" size="sm">Discontinued</vi-badge>
              </td>
            </tr>
          </tbody>
        </table>
      </vi-animation>
    </div>
  `,
  args: {
    stagger: 60,
    staggerDirection: 'normal',
  },
};

/**
 * 5. Attention-Seeking Motion Patterns
 */
export const AttentionSeekers: StoryObj = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 480px;"
    >
      <h3 style="margin: 0; font-size: 1.1rem; color: #1e293b;">
        Attention-Seeking UI Feedback
      </h3>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e: Event) => {
            const btn = e.currentTarget as HTMLElement;
            const anim = btn.nextElementSibling as ViAnimation;
            anim.play();
          }}
        >
          Trigger Validation Shake
        </vi-button>
        <vi-animation name="shake" duration="400" .autoPlay=${false}>
          <vi-input
            label="Required Field"
            value=""
            status="invalid"
            validity-message="Field cannot be empty"
          ></vi-input>
        </vi-animation>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e: Event) => {
            const btn = e.currentTarget as HTMLElement;
            const anim = btn.nextElementSibling as ViAnimation;
            anim.play();
          }}
        >
          Trigger Alert Pulse
        </vi-button>
        <vi-animation name="pulse" duration="500" .autoPlay=${false}>
          <vi-alert variant="warning" title="Critical Notice">
            Unsaved lab results will be lost.
          </vi-alert>
        </vi-animation>
      </div>

      <div style="display: flex; gap: 1rem; align-items: center;">
        <vi-button
          variant="secondary"
          size="sm"
          @click=${(e: Event) => {
            const btn = e.currentTarget as HTMLElement;
            const anim = btn.nextElementSibling as ViAnimation;
            anim.play();
          }}
        >
          Trigger Badge Heartbeat
        </vi-button>
        <vi-animation name="heartbeat" duration="600" .autoPlay=${false}>
          <vi-badge variant="danger" size="md">9 Unread Alerts</vi-badge>
        </vi-animation>
      </div>
    </div>
  `,
};

/**
 * 6. Skeleton Loader Shimmer to Content Cross-Fade
 */
export const SkeletonToContentTransition: StoryObj = {
  render: () => {
    let isLoading = true;

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 420px;"
      >
        <vi-button
          variant="primary"
          @click=${(e: Event) => {
            const container = (e.currentTarget as HTMLElement).parentElement;
            const skeletonAnim = container?.querySelector(
              '#skel-anim',
            ) as ViAnimation;
            const contentAnim = container?.querySelector(
              '#content-anim',
            ) as ViAnimation;
            isLoading = !isLoading;

            if (isLoading) {
              contentAnim.hide();
              skeletonAnim.show();
            } else {
              skeletonAnim.hide().then(() => {
                contentAnim.show();
              });
            }
          }}
        >
          Toggle Simulated Data Loading
        </vi-button>

        <div style="position: relative; width: 100%; min-height: 180px;">
          <!-- Skeleton Shimmer Placeholder -->
          <vi-animation
            id="skel-anim"
            name="shimmer"
            duration="1200"
            iterations="Infinity"
            exit="fade-out"
            .open=${isLoading}
          >
            <div
              style="padding: 1.5rem; background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%); background-size: 200% 100%; border-radius: 12px; height: 180px; display: flex; flex-direction: column; gap: 1rem;"
            >
              <div
                style="height: 20px; width: 60%; background: #cbd5e1; border-radius: 4px;"
              ></div>
              <div
                style="height: 14px; width: 90%; background: #cbd5e1; border-radius: 4px;"
              ></div>
              <div
                style="height: 14px; width: 75%; background: #cbd5e1; border-radius: 4px;"
              ></div>
            </div>
          </vi-animation>

          <!-- Live Content Card -->
          <vi-animation
            id="content-anim"
            enter="fade-in-up"
            exit="fade-out"
            duration="400"
            .open=${!isLoading}
          >
            <div
              style="padding: 1.5rem; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); height: 180px;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;"
              >
                <h3 style="margin: 0; font-size: 1.1rem; color: #0f172a;">
                  Live Trial Analytics
                </h3>
                <vi-badge variant="success">Synchronized</vi-badge>
              </div>
              <p style="margin: 0 0 1rem 0; color: #475569; font-size: 0.9rem;">
                Real-time patient telemetry data loaded successfully from EDC
                API endpoint.
              </p>
              <vi-button variant="secondary" size="sm"
                >View Telemetry Log</vi-button
              >
            </div>
          </vi-animation>
        </div>
      </div>
    `;
  },
};

/**
 * 7. Accordion / eCRF Section Expansion
 */
export const AccordionExpandCollapse: StoryObj = {
  render: () => {
    let expanded = true;

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1rem; max-width: 480px;"
      >
        <vi-button
          variant="secondary"
          @click=${(e: Event) => {
            const anim = (e.currentTarget as HTMLElement)
              .nextElementSibling as ViAnimation;
            expanded = !expanded;
            if (expanded) {
              anim.show();
            } else {
              anim.hide();
            }
          }}
        >
          Expand / Collapse Section
        </vi-button>

        <vi-animation
          enter="expand-vertical"
          exit="collapse-vertical"
          duration="350"
          .open=${expanded}
        >
          <div
            style="padding: 1.25rem; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; display: flex; flex-direction: column; gap: 1rem;"
          >
            <h4 style="margin: 0; color: #1e293b;">
              eCRF Medical History Section
            </h4>
            <vi-input
              label="Prior Surgeries"
              placeholder="List any relevant operations..."
            ></vi-input>
            <vi-checkbox
              >Subject consents to genetic sample extraction</vi-checkbox
            >
          </div>
        </vi-animation>
      </div>
    `;
  },
};

/**
 * 8. Custom Programmatic WAAPI Keyframe Sequences
 */
export const CustomKeyframeSequences: StoryObj = {
  render: () => html`
    <div
      style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start; max-width: 440px;"
    >
      <vi-button
        variant="primary"
        @click=${(e: Event) => {
          const btn = e.currentTarget as HTMLElement;
          const anim = btn.nextElementSibling as ViAnimation;
          anim.keyframes = [
            {
              transform: 'rotate(0deg) scale(1)',
              filter: 'blur(0px) hue-rotate(0deg)',
            },
            {
              transform: 'rotate(180deg) scale(1.15)',
              filter: 'blur(2px) hue-rotate(90deg)',
            },
            {
              transform: 'rotate(360deg) scale(1)',
              filter: 'blur(0px) hue-rotate(0deg)',
            },
          ];
          anim.duration = 800;
          anim.play();
        }}
      >
        Play Custom WAAPI Keyframes
      </vi-button>

      <vi-animation id="custom-keyframe-anim" duration="800" .autoPlay=${false}>
        <div
          style="padding: 1.5rem; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; border-radius: 12px; width: 300px; box-shadow: 0 8px 20px rgba(99,102,241,0.3);"
        >
          <h3 style="margin: 0 0 0.5rem 0; color: #ffffff;">
            Custom WAAPI Morph
          </h3>
          <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">
            Programmatically passing keyframes array with rotation, 3D scaling,
            and hue rotation filters.
          </p>
        </div>
      </vi-animation>
    </div>
  `,
};

/**
 * 9. Slide In/Out Right Side Panel
 * Demonstrates sliding in a panel from the right upon button click, and sliding it out to the right upon subsequent click.
 */
export const SlideRightSidePanel: StoryObj = {
  render: () => {
    let isOpen = false;

    return html`
      <div
        style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 640px;"
      >
        <div>
          <vi-button
            variant="primary"
            @click=${(e: Event) => {
              const root = (e.currentTarget as HTMLElement).closest(
                'div',
              )?.parentElement;
              const anim = root?.querySelector(
                '#side-panel-anim',
              ) as ViAnimation;
              isOpen = !isOpen;
              if (isOpen) {
                anim.show();
              } else {
                anim.hide();
              }
            }}
          >
            Toggle Right Side Panel (Slide In / Out Right)
          </vi-button>
        </div>

        <div
          style="position: relative; width: 100%; min-height: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; padding: 1.5rem;"
        >
          <h3 style="margin: 0 0 0.5rem 0; color: #1e293b;">
            Main Page Content Area
          </h3>
          <p style="margin: 0; color: #64748b; font-size: 0.9rem;">
            Click the button above to slide the details panel in from the right
            edge.
          </p>

          <!-- Sliding Side Panel Container -->
          <div
            style="position: absolute; top: 0; right: 0; bottom: 0; width: 320px; z-index: 10; pointer-events: none;"
          >
            <vi-animation
              id="side-panel-anim"
              enter="slide-in-right"
              exit="slide-out-right"
              .duration=${350}
              .open=${false}
            >
              <div
                style="pointer-events: auto; height: 100%; background: #ffffff; border-left: 1px solid #cbd5e1; box-shadow: -4px 0 15px rgba(0,0,0,0.08); padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-sizing: border-box;"
              >
                <div
                  style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem;"
                >
                  <h4 style="margin: 0; font-size: 1rem; color: #0f172a;">
                    Patient Subject Details
                  </h4>
                  <vi-badge variant="success" size="sm">Active</vi-badge>
                </div>
                <p
                  style="margin: 0; font-size: 0.85rem; color: #475569; line-height: 1.5;"
                >
                  Sliding panel containing detailed clinical observation notes,
                  lab values, and history.
                </p>
                <vi-input
                  label="Subject ID"
                  value="SUBJ-8091"
                  readonly
                ></vi-input>
                <vi-input
                  label="Clinical Site"
                  value="Site 04 - Oncology"
                  readonly
                ></vi-input>
                <div
                  style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: auto;"
                >
                  <vi-button
                    variant="ghost"
                    size="sm"
                    @click=${(e: Event) => {
                      const anim = (e.currentTarget as HTMLElement).closest(
                        '#side-panel-anim',
                      ) as ViAnimation;
                      isOpen = false;
                      anim.hide();
                    }}
                  >
                    Close Panel
                  </vi-button>
                </div>
              </div>
            </vi-animation>
          </div>
        </div>
      </div>
    `;
  },
};
