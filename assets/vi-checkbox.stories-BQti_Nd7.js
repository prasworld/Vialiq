import { b } from './iframe-DPjVeIYZ.js';
import './vi-checkbox-DNQJLfKS.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-CFl5z9YB.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-CVzyI8PI.js';
import './class-map-LM2mFU0t.js';
import './directive-BKuZRRPO.js';

const meta = {
    title: 'Components/Checkbox',
    tags: [
        'autodocs'
    ],
    argTypes: {
        checked: {
            control: 'boolean',
            description: 'Checked state of the checkbox'
        },
        indeterminate: {
            control: 'boolean',
            description: 'Indeterminate (partial) state of the checkbox'
        },
        value: {
            control: 'text',
            description: 'Form submission value when checked'
        },
        name: {
            control: 'text',
            description: 'Form field name'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the checkbox'
        },
        required: {
            control: 'boolean',
            description: 'Marks the field as required'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: 'Validation state'
        },
        size: {
            control: 'select',
            options: [
                'xs',
                'sm',
                'md',
                'lg'
            ],
            description: 'Size scale of the checkbox'
        },
        label: {
            control: 'text',
            description: 'Label text content'
        }
    },
    args: {
        checked: false,
        indeterminate: false,
        value: 'on',
        name: 'checkbox-field',
        disabled: false,
        required: false,
        status: 'default',
        size: 'md',
        label: 'I confirm the subject has provided written informed consent.'
    },
    render: (args)=>{
        return b`
      <vi-checkbox
        ?checked=${args.checked}
        ?indeterminate=${args.indeterminate}
        .value=${args.value}
        .name=${args.name}
        ?disabled=${args.disabled}
        ?required=${args.required}
        status=${args.status}
        size=${args.size}
      >
        ${args.label}
      </vi-checkbox>
    `;
    }
};
const Default = {
    name: 'Standard Checkbox'
};
const Checked = {
    name: 'Checked State',
    args: {
        checked: true
    }
};
const Indeterminate = {
    name: 'Indeterminate State',
    args: {
        indeterminate: true
    }
};
const Disabled = {
    name: 'Disabled State',
    args: {
        disabled: true
    }
};
const RequiredAndInvalid = {
    name: 'Required (Invalid State)',
    args: {
        required: true,
        status: 'invalid'
    }
};
const Sizes = {
    name: 'Checkbox Sizes',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <vi-checkbox size="xs">Extra Small (xs)</vi-checkbox>
      <vi-checkbox size="sm">Small (sm)</vi-checkbox>
      <vi-checkbox size="md">Medium (md - default)</vi-checkbox>
      <vi-checkbox size="lg">Large (lg)</vi-checkbox>
    </div>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Standard Checkbox'\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Checked.parameters = {
    ...Checked.parameters,
    docs: {
        ...Checked.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Checked State',\n  args: {\n    checked: true\n  }\n}",
            ...Checked.parameters?.docs?.source
        }
    }
};
Indeterminate.parameters = {
    ...Indeterminate.parameters,
    docs: {
        ...Indeterminate.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Indeterminate State',\n  args: {\n    indeterminate: true\n  }\n}",
            ...Indeterminate.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled State',\n  args: {\n    disabled: true\n  }\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
RequiredAndInvalid.parameters = {
    ...RequiredAndInvalid.parameters,
    docs: {
        ...RequiredAndInvalid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Required (Invalid State)',\n  args: {\n    required: true,\n    status: 'invalid'\n  }\n}",
            ...RequiredAndInvalid.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Checkbox Sizes',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px;\">\n      <vi-checkbox size=\"xs\">Extra Small (xs)</vi-checkbox>\n      <vi-checkbox size=\"sm\">Small (sm)</vi-checkbox>\n      <vi-checkbox size=\"md\">Medium (md - default)</vi-checkbox>\n      <vi-checkbox size=\"lg\">Large (lg)</vi-checkbox>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Checked","Indeterminate","Disabled","RequiredAndInvalid","Sizes"];

export { Checked, Default, Disabled, Indeterminate, RequiredAndInvalid, Sizes, __namedExportsOrder, meta as default };
