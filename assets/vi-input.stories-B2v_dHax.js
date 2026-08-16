import { b } from './iframe-DnETEnWs.js';
import './vi-input-CCgh49Ll.js';
import './vi-button-CfSvKrzB.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-BZnLtp_v.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-DhtnJ9lw.js';
import './if-non-empty-Bj_AeigV.js';
import './if-defined-XVQ-mXGT.js';
import './state-gKBTU9MN.js';

const meta = {
    title: 'Components/Input',
    tags: [
        'autodocs'
    ],
    argTypes: {
        type: {
            control: 'select',
            options: [
                'text',
                'email',
                'password',
                'search',
                'tel',
                'url',
                'number'
            ],
            description: 'Input type attribute'
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text'
        },
        value: {
            control: 'text',
            description: 'Current input value'
        },
        disabled: {
            control: 'boolean',
            description: 'Disables the input'
        },
        required: {
            control: 'boolean',
            description: 'Marks input as required'
        },
        status: {
            control: 'select',
            options: [
                'default',
                'valid',
                'invalid'
            ],
            description: "Visual state: 'default' (neutral), 'valid' (green), 'invalid' (red)"
        },
        validityMessage: {
            control: 'text',
            description: 'Validation message — colour is derived from status'
        },
        name: {
            control: 'text',
            description: 'Input name attribute'
        },
        size: {
            control: 'select',
            options: [
                'xs',
                'sm',
                'md',
                'lg'
            ],
            description: 'Size scale of the input'
        }
    }
};
const renderInput = ({ type, placeholder, value, disabled, required, status, validityMessage, name, size })=>b`
  <vi-input
    type=${type}
    placeholder=${placeholder}
    .value=${value}
    ?disabled=${disabled}
    ?required=${required}
    status=${status}
    .validityMessage=${validityMessage}
    name=${name}
    size=${size}
  ></vi-input>
`;
const Text = {
    name: 'Text Input',
    args: {
        type: 'text',
        placeholder: 'Enter text…',
        value: '',
        disabled: false,
        required: false,
        status: 'default',
        validityMessage: '',
        name: 'text',
        size: 'md'
    },
    render: renderInput
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
const Email = {
    name: 'Email Input',
    args: {
        type: 'email',
        placeholder: 'your.email@example.com',
        value: '',
        disabled: false,
        required: true,
        status: 'default',
        validityMessage: '',
        name: 'email'
    },
    render: renderInput
};
const Password = {
    name: 'Password Input',
    args: {
        type: 'password',
        placeholder: 'Enter password…',
        value: '',
        disabled: false,
        required: true,
        status: 'default',
        validityMessage: '',
        name: 'password'
    },
    render: renderInput
};
const WithHelper = {
    name: 'With Helper Text',
    args: {
        type: 'text',
        placeholder: 'Enter username…',
        value: '',
        disabled: false,
        required: true,
        status: 'default',
        validityMessage: '',
        name: 'username'
    },
    render: ({ type, placeholder, value, disabled, required, status, validityMessage, name })=>b`
    <vi-input
      type=${type}
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <span slot="helper">Must be 3–20 characters</span>
    </vi-input>
  `
};
const Invalid = {
    name: 'Invalid State',
    args: {
        type: 'email',
        placeholder: 'your.email@example.com',
        value: 'not-an-email',
        disabled: false,
        required: true,
        status: 'invalid',
        validityMessage: 'Please enter a valid email address',
        name: 'email'
    },
    render: renderInput
};
const Valid = {
    name: 'Valid State',
    args: {
        type: 'email',
        placeholder: 'your.email@example.com',
        value: 'user@example.com',
        disabled: false,
        required: true,
        status: 'valid',
        validityMessage: 'Looks good!',
        name: 'email'
    },
    render: renderInput
};
const Disabled = {
    name: 'Disabled Input',
    args: {
        type: 'text',
        placeholder: 'Cannot edit',
        value: 'Preset value',
        disabled: true,
        required: false,
        status: 'default',
        validityMessage: '',
        name: 'disabled'
    },
    render: renderInput
};
const Number = {
    name: 'Number Input',
    args: {
        type: 'number',
        placeholder: '0',
        value: '',
        disabled: false,
        required: true,
        status: 'default',
        validityMessage: '',
        name: 'quantity'
    },
    render: renderInput
};
const Search = {
    name: 'Search Input',
    args: {
        type: 'search',
        placeholder: 'Search…',
        value: '',
        disabled: false,
        required: false,
        status: 'default',
        validityMessage: '',
        name: 'search',
        size: 'md'
    },
    render: renderInput
};
const Sizes = {
    name: 'Input Sizes',
    render: ()=>b`
    <div style="display: flex; flex-direction: column; gap: 16px; width: 300px;">
      <vi-input size="xs" placeholder="Extra Small (xs)"></vi-input>
      <vi-input size="sm" placeholder="Small (sm)"></vi-input>
      <vi-input size="md" placeholder="Medium (md - default)"></vi-input>
      <vi-input size="lg" placeholder="Large (lg)"></vi-input>
    </div>
  `
};
Text.parameters = {
    ...Text.parameters,
    docs: {
        ...Text.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Text Input',\n  args: {\n    type: 'text',\n    placeholder: 'Enter text\u2026',\n    value: '',\n    disabled: false,\n    required: false,\n    status: 'default',\n    validityMessage: '',\n    name: 'text',\n    size: 'md'\n  },\n  render: renderInput\n}",
            ...Text.parameters?.docs?.source
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
Email.parameters = {
    ...Email.parameters,
    docs: {
        ...Email.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Email Input',\n  args: {\n    type: 'email',\n    placeholder: 'your.email@example.com',\n    value: '',\n    disabled: false,\n    required: true,\n    status: 'default',\n    validityMessage: '',\n    name: 'email'\n  },\n  render: renderInput\n}",
            ...Email.parameters?.docs?.source
        }
    }
};
Password.parameters = {
    ...Password.parameters,
    docs: {
        ...Password.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Password Input',\n  args: {\n    type: 'password',\n    placeholder: 'Enter password\u2026',\n    value: '',\n    disabled: false,\n    required: true,\n    status: 'default',\n    validityMessage: '',\n    name: 'password'\n  },\n  render: renderInput\n}",
            ...Password.parameters?.docs?.source
        }
    }
};
WithHelper.parameters = {
    ...WithHelper.parameters,
    docs: {
        ...WithHelper.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With Helper Text',\n  args: {\n    type: 'text',\n    placeholder: 'Enter username\u2026',\n    value: '',\n    disabled: false,\n    required: true,\n    status: 'default',\n    validityMessage: '',\n    name: 'username'\n  },\n  render: ({\n    type,\n    placeholder,\n    value,\n    disabled,\n    required,\n    status,\n    validityMessage,\n    name\n  }: InputArgs) => html`\n    <vi-input\n      type=${type}\n      placeholder=${placeholder}\n      .value=${value}\n      ?disabled=${disabled}\n      ?required=${required}\n      status=${status}\n      .validityMessage=${validityMessage}\n      name=${name}\n    >\n      <span slot=\"helper\">Must be 3\u201320 characters</span>\n    </vi-input>\n  `\n}",
            ...WithHelper.parameters?.docs?.source
        }
    }
};
Invalid.parameters = {
    ...Invalid.parameters,
    docs: {
        ...Invalid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Invalid State',\n  args: {\n    type: 'email',\n    placeholder: 'your.email@example.com',\n    value: 'not-an-email',\n    disabled: false,\n    required: true,\n    status: 'invalid',\n    validityMessage: 'Please enter a valid email address',\n    name: 'email'\n  },\n  render: renderInput\n}",
            ...Invalid.parameters?.docs?.source
        }
    }
};
Valid.parameters = {
    ...Valid.parameters,
    docs: {
        ...Valid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Valid State',\n  args: {\n    type: 'email',\n    placeholder: 'your.email@example.com',\n    value: 'user@example.com',\n    disabled: false,\n    required: true,\n    status: 'valid',\n    validityMessage: 'Looks good!',\n    name: 'email'\n  },\n  render: renderInput\n}",
            ...Valid.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled Input',\n  args: {\n    type: 'text',\n    placeholder: 'Cannot edit',\n    value: 'Preset value',\n    disabled: true,\n    required: false,\n    status: 'default',\n    validityMessage: '',\n    name: 'disabled'\n  },\n  render: renderInput\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
Number.parameters = {
    ...Number.parameters,
    docs: {
        ...Number.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Number Input',\n  args: {\n    type: 'number',\n    placeholder: '0',\n    value: '',\n    disabled: false,\n    required: true,\n    status: 'default',\n    validityMessage: '',\n    name: 'quantity'\n  },\n  render: renderInput\n}",
            ...Number.parameters?.docs?.source
        }
    }
};
Search.parameters = {
    ...Search.parameters,
    docs: {
        ...Search.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Search Input',\n  args: {\n    type: 'search',\n    placeholder: 'Search\u2026',\n    value: '',\n    disabled: false,\n    required: false,\n    status: 'default',\n    validityMessage: '',\n    name: 'search',\n    size: 'md'\n  },\n  render: renderInput\n}",
            ...Search.parameters?.docs?.source
        }
    }
};
Sizes.parameters = {
    ...Sizes.parameters,
    docs: {
        ...Sizes.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Input Sizes',\n  render: () => html`\n    <div style=\"display: flex; flex-direction: column; gap: 16px; width: 300px;\">\n      <vi-input size=\"xs\" placeholder=\"Extra Small (xs)\"></vi-input>\n      <vi-input size=\"sm\" placeholder=\"Small (sm)\"></vi-input>\n      <vi-input size=\"md\" placeholder=\"Medium (md - default)\"></vi-input>\n      <vi-input size=\"lg\" placeholder=\"Large (lg)\"></vi-input>\n    </div>\n  `\n}",
            ...Sizes.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Text","TabNavigation","Email","Password","WithHelper","Invalid","Valid","Disabled","Number","Search","Sizes"];

export { Disabled, Email, Invalid, Number, Password, Search, Sizes, TabNavigation, Text, Valid, WithHelper, __namedExportsOrder, meta as default };
