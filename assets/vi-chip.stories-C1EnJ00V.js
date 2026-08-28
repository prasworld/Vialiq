import { b } from './iframe-D1QzB0mn.js';
import { o } from './if-defined-BuiTVVkk.js';
import './vi-chip-C9dJi6YJ.js';
import './vi-chip-group-DpZ5kPxH.js';
import './vi-button-C7_ixw8d.js';
import './vi-icon-C4QGt-z3.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-C6aRBN2A.js';
import './state-CiJj2b7P.js';
import './focusable-mixin-CmxOyPX5.js';
import './query-assigned-elements-BJaGSqM0.js';
import './base-Cl6v8-BZ.js';
import './validity-mixin-BUuZWHUr.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';

const meta = {
    title: 'Components/Chip',
    component: 'vi-chip',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'neutral',
                'primary',
                'success',
                'warning',
                'danger',
                'info'
            ]
        },
        size: {
            control: 'select',
            options: [
                'sm',
                'md',
                'lg'
            ]
        },
        selected: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        },
        removable: {
            control: 'boolean'
        }
    }
};
const Default = {
    render: (args)=>b`
    <vi-chip
      variant=${o(args.variant)}
      size=${o(args.size)}
      ?selected=${args.selected}
      ?disabled=${args.disabled}
      ?removable=${args.removable}
    >
      Status Chip
    </vi-chip>
  `,
    args: {
        variant: 'neutral',
        size: 'md',
        selected: false,
        disabled: false,
        removable: false
    }
};
const GroupMulti = {
    render: ()=>b`
    <vi-chip-group multi>
      <vi-chip value="grade-1">Grade 1</vi-chip>
      <vi-chip value="grade-2">Grade 2</vi-chip>
      <vi-chip value="grade-3" variant="warning">Grade 3</vi-chip>
      <vi-chip value="grade-4" variant="danger">Grade 4</vi-chip>
      <vi-chip value="grade-5" variant="danger">Grade 5</vi-chip>
    </vi-chip-group>
  `
};
const GroupSingle = {
    render: ()=>b`
    <vi-chip-group .multi=${false}>
      <vi-chip value="1" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 1
      </vi-chip>
      <vi-chip value="2" variant="primary">
        <vi-icon slot="icon" name="calendar" size="12"></vi-icon>
        Visit 2
      </vi-chip>
    </vi-chip-group>
  `
};
const WithAvatar = {
    render: ()=>b`
    <vi-chip removable>
      <img slot="avatar" src="https://i.pravatar.cc/150?u=1" alt="Avatar">
      John Doe
    </vi-chip>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <vi-chip\n      variant=${ifDefined(args.variant)}\n      size=${ifDefined(args.size)}\n      ?selected=${args.selected}\n      ?disabled=${args.disabled}\n      ?removable=${args.removable}\n    >\n      Status Chip\n    </vi-chip>\n  `,\n  args: {\n    variant: 'neutral',\n    size: 'md',\n    selected: false,\n    disabled: false,\n    removable: false\n  }\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
GroupMulti.parameters = {
    ...GroupMulti.parameters,
    docs: {
        ...GroupMulti.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-chip-group multi>\n      <vi-chip value=\"grade-1\">Grade 1</vi-chip>\n      <vi-chip value=\"grade-2\">Grade 2</vi-chip>\n      <vi-chip value=\"grade-3\" variant=\"warning\">Grade 3</vi-chip>\n      <vi-chip value=\"grade-4\" variant=\"danger\">Grade 4</vi-chip>\n      <vi-chip value=\"grade-5\" variant=\"danger\">Grade 5</vi-chip>\n    </vi-chip-group>\n  `\n}",
            ...GroupMulti.parameters?.docs?.source
        }
    }
};
GroupSingle.parameters = {
    ...GroupSingle.parameters,
    docs: {
        ...GroupSingle.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-chip-group .multi=${false}>\n      <vi-chip value=\"1\" variant=\"primary\">\n        <vi-icon slot=\"icon\" name=\"calendar\" size=\"12\"></vi-icon>\n        Visit 1\n      </vi-chip>\n      <vi-chip value=\"2\" variant=\"primary\">\n        <vi-icon slot=\"icon\" name=\"calendar\" size=\"12\"></vi-icon>\n        Visit 2\n      </vi-chip>\n    </vi-chip-group>\n  `\n}",
            ...GroupSingle.parameters?.docs?.source
        }
    }
};
WithAvatar.parameters = {
    ...WithAvatar.parameters,
    docs: {
        ...WithAvatar.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-chip removable>\n      <img slot=\"avatar\" src=\"https://i.pravatar.cc/150?u=1\" alt=\"Avatar\">\n      John Doe\n    </vi-chip>\n  `\n}",
            ...WithAvatar.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","GroupMulti","GroupSingle","WithAvatar"];

export { Default, GroupMulti, GroupSingle, WithAvatar, __namedExportsOrder, meta as default };
