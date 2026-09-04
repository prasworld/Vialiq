import { A, b } from './iframe-9yd_z6c6.js';
import { c as checkIcon } from './check-D9SDO18H.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import './vi-icon-C_atHq7t.js';
import './vi-button-D54BGZG7.js';
import './vi-input-znutdRU4.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D7bP2wsn.js';
import './state-FW5tp7Om.js';
import './directive-BKuZRRPO.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-BGbFxpv9.js';
import './if-non-empty-BGlyk1yZ.js';
import './if-defined-CYaYkB02.js';

// Register icons once at module load time.
registerIcons([
    checkIcon
]);
const meta = {
    title: 'Components/Button',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'primary',
                'secondary',
                'danger',
                'success',
                'info',
                'ghost'
            ]
        },
        size: {
            control: 'select',
            options: [
                'xs',
                'sm',
                'md',
                'lg'
            ]
        },
        iconPlacement: {
            name: 'icon-placement',
            control: 'select',
            options: [
                'none',
                'start',
                'end'
            ],
            description: 'Slot an icon at the start or end of the label'
        },
        disabled: {
            control: 'boolean'
        },
        iconOnly: {
            name: 'icon-only',
            control: 'boolean'
        },
        fullWidth: {
            control: 'boolean'
        },
        label: {
            control: 'text'
        }
    }
};
const Button = {
    args: {
        variant: 'primary',
        size: 'md',
        iconPlacement: 'none',
        disabled: false,
        iconOnly: false,
        fullWidth: false,
        label: 'Action'
    },
    render: (args)=>{
        const placement = args['icon-placement'] ?? args.iconPlacement;
        const showIcon = placement !== 'none' || args.iconOnly;
        return b`
      <vi-button
        variant=${args.variant}
        size=${args.size}
        icon-placement=${placement === 'none' ? 'start' : placement}
        ?disabled=${args.disabled}
        ?icon-only=${args.iconOnly}
        ?full-width=${args.fullWidth}
      >
        ${showIcon ? b`<vi-icon slot="icon" name="check"></vi-icon>` : A}
        ${args.label}
      </vi-button>
    `;
    }
};
const IconOnly = {
    name: 'Icon Only',
    args: {
        variant: 'primary',
        size: 'md',
        disabled: false,
        label: 'Confirm' // used as aria-label on the host
    },
    argTypes: {
        // Hide irrelevant knobs for this story
        iconPlacement: {
            table: {
                disable: true
            }
        },
        fullWidth: {
            table: {
                disable: true
            }
        },
        iconOnly: {
            table: {
                disable: true
            }
        },
        label: {
            description: 'Provides the accessible label (aria-label) for screen readers'
        }
    },
    render: (args)=>b`
    <vi-button
      variant=${args.variant}
      size=${args.size}
      icon-only
      aria-label=${args.label}
      ?disabled=${args.disabled}
    >
      <vi-icon slot="icon" name="check"></vi-icon>
    </vi-button>
  `
};
const TabNavigation = {
    name: 'Tab Navigation (Custom Order)',
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates that mixed interactive components respect custom `tabindex` values explicitly applied to their host elements, navigating out of DOM order.'
            }
        }
    },
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem; width: 320px; padding: 1.5rem; border: 1px dashed #ccc; border-radius: 4px;">
      <p style="margin: 0; font-size: 0.875rem; color: #666; font-family: sans-serif;">
        Press <strong>Tab</strong> to cycle focus. Order: First → Second → Third → Fourth.
      </p>
      <vi-input tabindex="3" placeholder="Third (tabindex=3)"></vi-input>
      <vi-button tabindex="1">First (tabindex=1)</vi-button>
      <vi-input tabindex="4" placeholder="Fourth (tabindex=4)"></vi-input>
      <vi-button tabindex="2" variant="secondary">Second (tabindex=2)</vi-button>
      <vi-button disabled tabindex="5">Disabled (skipped)</vi-button>
    </div>
  `
};
Button.parameters = {
    ...Button.parameters,
    docs: {
        ...Button.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'primary',\n    size: 'md',\n    iconPlacement: 'none',\n    disabled: false,\n    iconOnly: false,\n    fullWidth: false,\n    label: 'Action'\n  },\n  render: args => {\n    const placement = args['icon-placement'] ?? args.iconPlacement;\n    const showIcon = placement !== 'none' || args.iconOnly;\n    return html`\n      <vi-button\n        variant=${args.variant}\n        size=${args.size}\n        icon-placement=${placement === 'none' ? 'start' : placement}\n        ?disabled=${args.disabled}\n        ?icon-only=${args.iconOnly}\n        ?full-width=${args.fullWidth}\n      >\n        ${showIcon ? html`<vi-icon slot=\"icon\" name=\"check\"></vi-icon>` : nothing}\n        ${args.label}\n      </vi-button>\n    `;\n  }\n}",
            ...Button.parameters?.docs?.source
        }
    }
};
IconOnly.parameters = {
    ...IconOnly.parameters,
    docs: {
        ...IconOnly.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Icon Only',\n  args: {\n    variant: 'primary',\n    size: 'md',\n    disabled: false,\n    label: 'Confirm' // used as aria-label on the host\n  },\n  argTypes: {\n    // Hide irrelevant knobs for this story\n    iconPlacement: {\n      table: {\n        disable: true\n      }\n    },\n    fullWidth: {\n      table: {\n        disable: true\n      }\n    },\n    iconOnly: {\n      table: {\n        disable: true\n      }\n    },\n    label: {\n      description: 'Provides the accessible label (aria-label) for screen readers'\n    }\n  },\n  render: args => html`\n    <vi-button\n      variant=${args.variant}\n      size=${args.size}\n      icon-only\n      aria-label=${args.label}\n      ?disabled=${args.disabled}\n    >\n      <vi-icon slot=\"icon\" name=\"check\"></vi-icon>\n    </vi-button>\n  `\n}",
            ...IconOnly.parameters?.docs?.source
        }
    }
};
TabNavigation.parameters = {
    ...TabNavigation.parameters,
    docs: {
        ...TabNavigation.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Tab Navigation (Custom Order)',\n  parameters: {\n    docs: {\n      description: {\n        story: 'Demonstrates that mixed interactive components respect custom `tabindex` values explicitly applied to their host elements, navigating out of DOM order.'\n      }\n    }\n  },\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem; width: 320px; padding: 1.5rem; border: 1px dashed #ccc; border-radius: 4px;\">\n      <p style=\"margin: 0; font-size: 0.875rem; color: #666; font-family: sans-serif;\">\n        Press <strong>Tab</strong> to cycle focus. Order: First \u2192 Second \u2192 Third \u2192 Fourth.\n      </p>\n      <vi-input tabindex=\"3\" placeholder=\"Third (tabindex=3)\"></vi-input>\n      <vi-button tabindex=\"1\">First (tabindex=1)</vi-button>\n      <vi-input tabindex=\"4\" placeholder=\"Fourth (tabindex=4)\"></vi-input>\n      <vi-button tabindex=\"2\" variant=\"secondary\">Second (tabindex=2)</vi-button>\n      <vi-button disabled tabindex=\"5\">Disabled (skipped)</vi-button>\n    </div>\n  `\n}",
            ...TabNavigation.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Button","IconOnly","TabNavigation"];

export { Button, IconOnly, TabNavigation, __namedExportsOrder, meta as default };
