import { b } from './iframe-Dou6M6kd.js';
import './vi-switch-BI_GuE3k.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D24a-rkj.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-UqeDKzZ9.js';
import './class-map-Bh9vJUzA.js';
import './directive-BKuZRRPO.js';

const meta = {
    title: 'Components/Switch',
    component: 'vi-switch',
    argTypes: {
        checked: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ]
        },
        labelPlacement: {
            control: 'select',
            options: [
                'start',
                'end'
            ]
        }
    }
};
const Default = {
    args: {
        checked: false,
        disabled: false,
        size: 'md',
        labelPlacement: 'end'
    },
    render: (args)=>b`
    <vi-switch
      ?checked=${args.checked}
      ?disabled=${args.disabled}
      size=${args.size}
      label-placement=${args.labelPlacement}
    >
      Enable email notifications
    </vi-switch>
  `
};
const Sizes = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch size="sm">Small (sm)</vi-switch>
      <vi-switch size="md">Medium (md)</vi-switch>
      <vi-switch size="lg">Large (lg)</vi-switch>
    </div>
  `
};
const Disabled = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch disabled>Disabled unchecked</vi-switch>
      <vi-switch disabled checked>Disabled checked</vi-switch>
    </div>
  `
};
const Placement = {
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <vi-switch label-placement="end">Label at end (default)</vi-switch>
      <vi-switch label-placement="start">Label at start</vi-switch>
    </div>
  `
};
const WithLabels = {
    render: ()=>b`
    <vi-switch size="lg">
      <span slot="on-label">ON</span>
      <span slot="off-label">OFF</span>
      Dual Data Entry Required
    </vi-switch>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    checked: false,\n    disabled: false,\n    size: 'md',\n    labelPlacement: 'end'\n  },\n  render: args => html`\n    <vi-switch\n      ?checked=${args.checked}\n      ?disabled=${args.disabled}\n      size=${args.size}\n      label-placement=${args.labelPlacement}\n    >\n      Enable email notifications\n    </vi-switch>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch size=\"sm\">Small (sm)</vi-switch>\n      <vi-switch size=\"md\">Medium (md)</vi-switch>\n      <vi-switch size=\"lg\">Large (lg)</vi-switch>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch disabled>Disabled unchecked</vi-switch>\n      <vi-switch disabled checked>Disabled checked</vi-switch>\n    </div>\n  `\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
Placement.parameters = {
    ...Placement.parameters,
    docs: {
        ...Placement.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 1rem;\">\n      <vi-switch label-placement=\"end\">Label at end (default)</vi-switch>\n      <vi-switch label-placement=\"start\">Label at start</vi-switch>\n    </div>\n  `\n}",
            ...Placement.parameters?.docs?.source
        }
    }
};
WithLabels.parameters = {
    ...WithLabels.parameters,
    docs: {
        ...WithLabels.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-switch size=\"lg\">\n      <span slot=\"on-label\">ON</span>\n      <span slot=\"off-label\">OFF</span>\n      Dual Data Entry Required\n    </vi-switch>\n  `\n}",
            ...WithLabels.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Sizes","Disabled","Placement","WithLabels"];

export { Default, Disabled, Placement, Sizes, WithLabels, __namedExportsOrder, meta as default };
