import { b } from './iframe-9yd_z6c6.js';
import './vi-select-Cqrq5X_i.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D7bP2wsn.js';
import './state-FW5tp7Om.js';
import './overlay-manager-B43cq-OI.js';
import './base-Cl6v8-BZ.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-BGbFxpv9.js';
import './if-non-empty-BGlyk1yZ.js';
import './if-defined-CYaYkB02.js';
import './vi-icon-C_atHq7t.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';
import './chevron-down-BU8Kh4z3.js';
import './x-3JmBhc9n.js';
import './keyboard-controller-DbV1C_E6.js';
import './floating-ui.dom-DwUTpXgb.js';
import './check-D9SDO18H.js';

const meta = {
    title: 'Components/Select',
    tags: [
        'autodocs'
    ],
    argTypes: {
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
        clearable: {
            control: 'boolean',
            description: 'Shows a clear button when a value is selected'
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
        }
    }
};
const renderSelect = ({ placeholder, value, disabled, required, clearable, status, validityMessage, name })=>b`
  <vi-select
    placeholder=${placeholder}
    .value=${value}
    ?disabled=${disabled}
    ?required=${required}
    ?clearable=${clearable}
    status=${status}
    .validityMessage=${validityMessage}
    name=${name}
  >
    <vi-select-option value="M" label="Male"></vi-select-option>
    <vi-select-option value="F" label="Female"></vi-select-option>
    <vi-select-option value="I" label="Intersex"></vi-select-option>
    <vi-select-option value="UNK" label="Unknown / Not reported"></vi-select-option>
  </vi-select>
`;
const Default = {
    name: 'Default Select',
    args: {
        placeholder: 'Select sex...',
        value: '',
        disabled: false,
        required: false,
        clearable: false,
        status: 'default',
        validityMessage: '',
        name: 'sex'
    },
    render: renderSelect
};
const Grouped = {
    name: 'Grouped Options',
    args: {
        ...Default.args,
        placeholder: 'Select grade...',
        name: 'aeGrade'
    },
    render: ({ placeholder, disabled, required, clearable, status, validityMessage, name })=>b`
    <vi-select
      placeholder=${placeholder}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="1" label="Grade 1 — Mild" group="Non-serious"></vi-select-option>
      <vi-select-option value="2" label="Grade 2 — Moderate" group="Non-serious"></vi-select-option>
      <vi-select-option value="3" label="Grade 3 — Severe" group="Serious"></vi-select-option>
      <vi-select-option value="4" label="Grade 4 — Life-Threatening" group="Serious"></vi-select-option>
      <vi-select-option value="5" label="Grade 5 — Fatal" group="Serious"></vi-select-option>
    </vi-select>
  `
};
const Clearable = {
    name: 'Clearable',
    args: {
        ...Default.args,
        clearable: true,
        value: 'M'
    },
    render: renderSelect
};
const Disabled = {
    name: 'Disabled',
    args: {
        ...Default.args,
        disabled: true,
        value: 'F'
    },
    render: renderSelect
};
const Invalid = {
    name: 'Invalid State',
    args: {
        ...Default.args,
        status: 'invalid',
        validityMessage: 'This field is required',
        required: true
    },
    render: renderSelect
};
const Valid = {
    name: 'Valid State',
    args: {
        ...Default.args,
        status: 'valid',
        validityMessage: 'Looks good!',
        value: 'M'
    },
    render: renderSelect
};
const WithHelper = {
    name: 'With Helper Text',
    args: {
        ...Default.args
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name })=>b`
    <vi-select
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="1" label="Option 1"></vi-select-option>
      <vi-select-option value="2" label="Option 2"></vi-select-option>
      <span slot="helper">Please select one of the available options.</span>
    </vi-select>
  `
};
const WrappedText = {
    name: 'Wrapped Text',
    args: {
        ...Default.args,
        placeholder: 'Select a lengthy option...',
        // @ts-expect-error - wrapText is added dynamically to the args
        wrapText: true
    },
    argTypes: {
        // @ts-expect-error - wrapText is added dynamically to the argTypes
        wrapText: {
            control: 'boolean',
            description: 'Allows long text to wrap instead of truncating with an ellipsis'
        }
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name, wrapText })=>b`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
        ?wrap-text=${wrapText}
      >
        <vi-select-option value="1" label="A very short option"></vi-select-option>
        <vi-select-option value="2" label="This is an extremely long option that will definitely overflow the container and should wrap gracefully onto the next line if the wrap-text property is working properly."></vi-select-option>
        <vi-select-option value="3" label="Another normal option"></vi-select-option>
      </vi-select>
    </div>
  `
};
const CustomTemplates = {
    name: 'Custom Templates',
    args: {
        ...Default.args,
        placeholder: 'Select a user...'
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name })=>b`
    <style>
      .custom-option {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .custom-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: var(--vi-layer-03, #e5e7eb);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: var(--vi-text-secondary, #4b5563);
        flex-shrink: 0;
      }
      .custom-details {
        display: flex;
        flex-direction: column;
      }
      .custom-name {
        font-weight: 500;
      }
      .custom-role {
        font-size: 12px;
        color: var(--vi-text-secondary, #6b7280);
      }
    </style>
    <vi-select
      placeholder=${placeholder}
      .value=${value}
      ?disabled=${disabled}
      ?required=${required}
      ?clearable=${clearable}
      status=${status}
      .validityMessage=${validityMessage}
      name=${name}
    >
      <vi-select-option value="user1" label="Jane Doe">
        <div class="custom-option">
          <div class="custom-avatar">JD</div>
          <div class="custom-details">
            <span class="custom-name">Jane Doe</span>
            <span class="custom-role">Administrator</span>
          </div>
        </div>
      </vi-select-option>
      
      <vi-select-option value="user2" label="John Smith">
        <div class="custom-option">
          <div class="custom-avatar">JS</div>
          <div class="custom-details">
            <span class="custom-name">John Smith</span>
            <span class="custom-role">Developer</span>
          </div>
        </div>
      </vi-select-option>

      <vi-select-option value="user3" label="Alice Johnson" disabled>
        <div class="custom-option">
          <div class="custom-avatar">AJ</div>
          <div class="custom-details">
            <span class="custom-name">Alice Johnson</span>
            <span class="custom-role">Viewer (Deactivated)</span>
          </div>
        </div>
      </vi-select-option>
    </vi-select>
  `
};
const TypeAhead = {
    name: 'Keyboard Type-ahead',
    args: {
        ...Default.args,
        placeholder: 'Type to search states...'
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name })=>b`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
      >
        <vi-select-option value="al" label="Alabama"></vi-select-option>
        <vi-select-option value="ak" label="Alaska"></vi-select-option>
        <vi-select-option value="az" label="Arizona"></vi-select-option>
        <vi-select-option value="ar" label="Arkansas"></vi-select-option>
        <vi-select-option value="ca" label="California"></vi-select-option>
        <vi-select-option value="co" label="Colorado"></vi-select-option>
        <vi-select-option value="ct" label="Connecticut"></vi-select-option>
        <vi-select-option value="de" label="Delaware"></vi-select-option>
        <vi-select-option value="fl" label="Florida"></vi-select-option>
        <vi-select-option value="ga" label="Georgia"></vi-select-option>
        <vi-select-option value="hi" label="Hawaii"></vi-select-option>
        <vi-select-option value="id" label="Idaho"></vi-select-option>
        <vi-select-option value="il" label="Illinois"></vi-select-option>
        <vi-select-option value="in" label="Indiana"></vi-select-option>
        <vi-select-option value="ia" label="Iowa"></vi-select-option>
        <vi-select-option value="ks" label="Kansas"></vi-select-option>
        <vi-select-option value="ky" label="Kentucky"></vi-select-option>
        <vi-select-option value="la" label="Louisiana"></vi-select-option>
        <vi-select-option value="me" label="Maine"></vi-select-option>
        <vi-select-option value="md" label="Maryland"></vi-select-option>
        <vi-select-option value="ma" label="Massachusetts"></vi-select-option>
        <vi-select-option value="mi" label="Michigan"></vi-select-option>
        <vi-select-option value="mn" label="Minnesota"></vi-select-option>
        <vi-select-option value="ms" label="Mississippi"></vi-select-option>
        <vi-select-option value="mo" label="Missouri"></vi-select-option>
      </vi-select>
    </div>
  `
};
const OptionGroups = {
    name: 'Option Groups',
    args: {
        ...Default.args,
        placeholder: 'Select a fruit...'
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name })=>b`
    <div style="width: 250px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
      >
        <vi-select-group label="Citrus">
          <vi-select-option value="orange" label="Orange"></vi-select-option>
          <vi-select-option value="lemon" label="Lemon"></vi-select-option>
          <vi-select-option value="lime" label="Lime"></vi-select-option>
        </vi-select-group>
        <vi-select-group label="Berries">
          <vi-select-option value="strawberry" label="Strawberry"></vi-select-option>
          <vi-select-option value="blueberry" label="Blueberry"></vi-select-option>
          <vi-select-option value="raspberry" label="Raspberry"></vi-select-option>
        </vi-select-group>
        <vi-select-group label="Other">
          <vi-select-option value="apple" label="Apple"></vi-select-option>
          <vi-select-option value="banana" label="Banana"></vi-select-option>
          <vi-select-option value="grape" label="Grape"></vi-select-option>
        </vi-select-group>
      </vi-select>
    </div>
  `
};
const PlacementAndWidth = {
    name: 'Placement & Fit Width',
    args: {
        ...Default.args,
        placeholder: 'Select a user...',
        matchWidth: false,
        placement: 'top-start'
    },
    render: ({ placeholder, value, disabled, required, clearable, status, validityMessage, name, matchWidth, placement })=>b`
    <div style="width: 150px; margin-top: 150px;">
      <vi-select
        placeholder=${placeholder}
        .value=${value}
        ?disabled=${disabled}
        ?required=${required}
        ?clearable=${clearable}
        status=${status}
        .validityMessage=${validityMessage}
        name=${name}
        ?match-width=${matchWidth}
        placement=${placement}
      >
        <vi-select-option value="user1" label="Jane Doe">
          <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">JD</div>
            <div>
              <div style="font-weight: 500;">Jane Doe</div>
              <div style="font-size: 12px; color: #6b7280;">jane.doe@example.com - Senior Software Engineer</div>
            </div>
          </div>
        </vi-select-option>
        <vi-select-option value="user2" label="John Smith">
          <div style="display: flex; gap: 8px; align-items: center; white-space: nowrap;">
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">JS</div>
            <div>
              <div style="font-weight: 500;">John Smith</div>
              <div style="font-size: 12px; color: #6b7280;">john.smith@example.com - Product Manager</div>
            </div>
          </div>
        </vi-select-option>
      </vi-select>
    </div>
  `
};
const FormReset = {
    name: 'Form Reset',
    args: {
        ...Default.args,
        placeholder: 'Select an option...',
        value: 'option1'
    },
    render: ({ placeholder, disabled, required, clearable, status, validityMessage, name })=>b`
    <form @reset=${(_e)=>console.log('Form reset fired!')} @submit=${(_e)=>e.preventDefault()}>
      <div style="width: 250px; display: flex; flex-direction: column; gap: 16px;">
        <vi-select
          placeholder=${placeholder}
          value="option1"
          ?disabled=${disabled}
          ?required=${required}
          ?clearable=${clearable}
          status=${status}
          .validityMessage=${validityMessage}
          name=${name}
        >
          <vi-select-option value="option1" label="Option 1"></vi-select-option>
          <vi-select-option value="option2" label="Option 2"></vi-select-option>
          <vi-select-option value="option3" label="Option 3"></vi-select-option>
        </vi-select>
        <div style="display: flex; gap: 8px;">
          <vi-button type="reset" variant="neutral">Reset Form</vi-button>
          <vi-button type="submit" variant="primary">Submit</vi-button>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Change the select value and click Reset Form. It will revert to "Option 1".</p>
      </div>
    </form>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Default Select',\n  args: {\n    placeholder: 'Select sex...',\n    value: '',\n    disabled: false,\n    required: false,\n    clearable: false,\n    status: 'default',\n    validityMessage: '',\n    name: 'sex'\n  },\n  render: renderSelect\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
Grouped.parameters = {
    ...Grouped.parameters,
    docs: {
        ...Grouped.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Grouped Options',\n  args: {\n    ...Default.args,\n    placeholder: 'Select grade...',\n    name: 'aeGrade'\n  },\n  render: ({\n    placeholder,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <vi-select\n      placeholder=${placeholder}\n      ?disabled=${disabled}\n      ?required=${required}\n      ?clearable=${clearable}\n      status=${status}\n      .validityMessage=${validityMessage}\n      name=${name}\n    >\n      <vi-select-option value=\"1\" label=\"Grade 1 \u2014 Mild\" group=\"Non-serious\"></vi-select-option>\n      <vi-select-option value=\"2\" label=\"Grade 2 \u2014 Moderate\" group=\"Non-serious\"></vi-select-option>\n      <vi-select-option value=\"3\" label=\"Grade 3 \u2014 Severe\" group=\"Serious\"></vi-select-option>\n      <vi-select-option value=\"4\" label=\"Grade 4 \u2014 Life-Threatening\" group=\"Serious\"></vi-select-option>\n      <vi-select-option value=\"5\" label=\"Grade 5 \u2014 Fatal\" group=\"Serious\"></vi-select-option>\n    </vi-select>\n  `\n}",
            ...Grouped.parameters?.docs?.source
        }
    }
};
Clearable.parameters = {
    ...Clearable.parameters,
    docs: {
        ...Clearable.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Clearable',\n  args: {\n    ...Default.args,\n    clearable: true,\n    value: 'M'\n  },\n  render: renderSelect\n}",
            ...Clearable.parameters?.docs?.source
        }
    }
};
Disabled.parameters = {
    ...Disabled.parameters,
    docs: {
        ...Disabled.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Disabled',\n  args: {\n    ...Default.args,\n    disabled: true,\n    value: 'F'\n  },\n  render: renderSelect\n}",
            ...Disabled.parameters?.docs?.source
        }
    }
};
Invalid.parameters = {
    ...Invalid.parameters,
    docs: {
        ...Invalid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Invalid State',\n  args: {\n    ...Default.args,\n    status: 'invalid',\n    validityMessage: 'This field is required',\n    required: true\n  },\n  render: renderSelect\n}",
            ...Invalid.parameters?.docs?.source
        }
    }
};
Valid.parameters = {
    ...Valid.parameters,
    docs: {
        ...Valid.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Valid State',\n  args: {\n    ...Default.args,\n    status: 'valid',\n    validityMessage: 'Looks good!',\n    value: 'M'\n  },\n  render: renderSelect\n}",
            ...Valid.parameters?.docs?.source
        }
    }
};
WithHelper.parameters = {
    ...WithHelper.parameters,
    docs: {
        ...WithHelper.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'With Helper Text',\n  args: {\n    ...Default.args\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <vi-select\n      placeholder=${placeholder}\n      .value=${value}\n      ?disabled=${disabled}\n      ?required=${required}\n      ?clearable=${clearable}\n      status=${status}\n      .validityMessage=${validityMessage}\n      name=${name}\n    >\n      <vi-select-option value=\"1\" label=\"Option 1\"></vi-select-option>\n      <vi-select-option value=\"2\" label=\"Option 2\"></vi-select-option>\n      <span slot=\"helper\">Please select one of the available options.</span>\n    </vi-select>\n  `\n}",
            ...WithHelper.parameters?.docs?.source
        }
    }
};
WrappedText.parameters = {
    ...WrappedText.parameters,
    docs: {
        ...WrappedText.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Wrapped Text',\n  args: {\n    ...Default.args,\n    placeholder: 'Select a lengthy option...',\n    // @ts-expect-error - wrapText is added dynamically to the args\n    wrapText: true\n  },\n  argTypes: {\n    // @ts-expect-error - wrapText is added dynamically to the argTypes\n    wrapText: {\n      control: 'boolean',\n      description: 'Allows long text to wrap instead of truncating with an ellipsis'\n    }\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name,\n    wrapText\n  }: SelectArgs & {\n    wrapText?: boolean;\n  }) => html`\n    <div style=\"width: 250px;\">\n      <vi-select\n        placeholder=${placeholder}\n        .value=${value}\n        ?disabled=${disabled}\n        ?required=${required}\n        ?clearable=${clearable}\n        status=${status}\n        .validityMessage=${validityMessage}\n        name=${name}\n        ?wrap-text=${wrapText}\n      >\n        <vi-select-option value=\"1\" label=\"A very short option\"></vi-select-option>\n        <vi-select-option value=\"2\" label=\"This is an extremely long option that will definitely overflow the container and should wrap gracefully onto the next line if the wrap-text property is working properly.\"></vi-select-option>\n        <vi-select-option value=\"3\" label=\"Another normal option\"></vi-select-option>\n      </vi-select>\n    </div>\n  `\n}",
            ...WrappedText.parameters?.docs?.source
        }
    }
};
CustomTemplates.parameters = {
    ...CustomTemplates.parameters,
    docs: {
        ...CustomTemplates.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Custom Templates',\n  args: {\n    ...Default.args,\n    placeholder: 'Select a user...'\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <style>\n      .custom-option {\n        display: flex;\n        align-items: center;\n        gap: 12px;\n      }\n      .custom-avatar {\n        width: 32px;\n        height: 32px;\n        border-radius: 50%;\n        background-color: var(--vi-layer-03, #e5e7eb);\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-weight: bold;\n        color: var(--vi-text-secondary, #4b5563);\n        flex-shrink: 0;\n      }\n      .custom-details {\n        display: flex;\n        flex-direction: column;\n      }\n      .custom-name {\n        font-weight: 500;\n      }\n      .custom-role {\n        font-size: 12px;\n        color: var(--vi-text-secondary, #6b7280);\n      }\n    </style>\n    <vi-select\n      placeholder=${placeholder}\n      .value=${value}\n      ?disabled=${disabled}\n      ?required=${required}\n      ?clearable=${clearable}\n      status=${status}\n      .validityMessage=${validityMessage}\n      name=${name}\n    >\n      <vi-select-option value=\"user1\" label=\"Jane Doe\">\n        <div class=\"custom-option\">\n          <div class=\"custom-avatar\">JD</div>\n          <div class=\"custom-details\">\n            <span class=\"custom-name\">Jane Doe</span>\n            <span class=\"custom-role\">Administrator</span>\n          </div>\n        </div>\n      </vi-select-option>\n      \n      <vi-select-option value=\"user2\" label=\"John Smith\">\n        <div class=\"custom-option\">\n          <div class=\"custom-avatar\">JS</div>\n          <div class=\"custom-details\">\n            <span class=\"custom-name\">John Smith</span>\n            <span class=\"custom-role\">Developer</span>\n          </div>\n        </div>\n      </vi-select-option>\n\n      <vi-select-option value=\"user3\" label=\"Alice Johnson\" disabled>\n        <div class=\"custom-option\">\n          <div class=\"custom-avatar\">AJ</div>\n          <div class=\"custom-details\">\n            <span class=\"custom-name\">Alice Johnson</span>\n            <span class=\"custom-role\">Viewer (Deactivated)</span>\n          </div>\n        </div>\n      </vi-select-option>\n    </vi-select>\n  `\n}",
            ...CustomTemplates.parameters?.docs?.source
        }
    }
};
TypeAhead.parameters = {
    ...TypeAhead.parameters,
    docs: {
        ...TypeAhead.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Keyboard Type-ahead',\n  args: {\n    ...Default.args,\n    placeholder: 'Type to search states...'\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <div style=\"width: 250px;\">\n      <vi-select\n        placeholder=${placeholder}\n        .value=${value}\n        ?disabled=${disabled}\n        ?required=${required}\n        ?clearable=${clearable}\n        status=${status}\n        .validityMessage=${validityMessage}\n        name=${name}\n      >\n        <vi-select-option value=\"al\" label=\"Alabama\"></vi-select-option>\n        <vi-select-option value=\"ak\" label=\"Alaska\"></vi-select-option>\n        <vi-select-option value=\"az\" label=\"Arizona\"></vi-select-option>\n        <vi-select-option value=\"ar\" label=\"Arkansas\"></vi-select-option>\n        <vi-select-option value=\"ca\" label=\"California\"></vi-select-option>\n        <vi-select-option value=\"co\" label=\"Colorado\"></vi-select-option>\n        <vi-select-option value=\"ct\" label=\"Connecticut\"></vi-select-option>\n        <vi-select-option value=\"de\" label=\"Delaware\"></vi-select-option>\n        <vi-select-option value=\"fl\" label=\"Florida\"></vi-select-option>\n        <vi-select-option value=\"ga\" label=\"Georgia\"></vi-select-option>\n        <vi-select-option value=\"hi\" label=\"Hawaii\"></vi-select-option>\n        <vi-select-option value=\"id\" label=\"Idaho\"></vi-select-option>\n        <vi-select-option value=\"il\" label=\"Illinois\"></vi-select-option>\n        <vi-select-option value=\"in\" label=\"Indiana\"></vi-select-option>\n        <vi-select-option value=\"ia\" label=\"Iowa\"></vi-select-option>\n        <vi-select-option value=\"ks\" label=\"Kansas\"></vi-select-option>\n        <vi-select-option value=\"ky\" label=\"Kentucky\"></vi-select-option>\n        <vi-select-option value=\"la\" label=\"Louisiana\"></vi-select-option>\n        <vi-select-option value=\"me\" label=\"Maine\"></vi-select-option>\n        <vi-select-option value=\"md\" label=\"Maryland\"></vi-select-option>\n        <vi-select-option value=\"ma\" label=\"Massachusetts\"></vi-select-option>\n        <vi-select-option value=\"mi\" label=\"Michigan\"></vi-select-option>\n        <vi-select-option value=\"mn\" label=\"Minnesota\"></vi-select-option>\n        <vi-select-option value=\"ms\" label=\"Mississippi\"></vi-select-option>\n        <vi-select-option value=\"mo\" label=\"Missouri\"></vi-select-option>\n      </vi-select>\n    </div>\n  `\n}",
            ...TypeAhead.parameters?.docs?.source
        }
    }
};
OptionGroups.parameters = {
    ...OptionGroups.parameters,
    docs: {
        ...OptionGroups.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Option Groups',\n  args: {\n    ...Default.args,\n    placeholder: 'Select a fruit...'\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <div style=\"width: 250px;\">\n      <vi-select\n        placeholder=${placeholder}\n        .value=${value}\n        ?disabled=${disabled}\n        ?required=${required}\n        ?clearable=${clearable}\n        status=${status}\n        .validityMessage=${validityMessage}\n        name=${name}\n      >\n        <vi-select-group label=\"Citrus\">\n          <vi-select-option value=\"orange\" label=\"Orange\"></vi-select-option>\n          <vi-select-option value=\"lemon\" label=\"Lemon\"></vi-select-option>\n          <vi-select-option value=\"lime\" label=\"Lime\"></vi-select-option>\n        </vi-select-group>\n        <vi-select-group label=\"Berries\">\n          <vi-select-option value=\"strawberry\" label=\"Strawberry\"></vi-select-option>\n          <vi-select-option value=\"blueberry\" label=\"Blueberry\"></vi-select-option>\n          <vi-select-option value=\"raspberry\" label=\"Raspberry\"></vi-select-option>\n        </vi-select-group>\n        <vi-select-group label=\"Other\">\n          <vi-select-option value=\"apple\" label=\"Apple\"></vi-select-option>\n          <vi-select-option value=\"banana\" label=\"Banana\"></vi-select-option>\n          <vi-select-option value=\"grape\" label=\"Grape\"></vi-select-option>\n        </vi-select-group>\n      </vi-select>\n    </div>\n  `\n}",
            ...OptionGroups.parameters?.docs?.source
        }
    }
};
PlacementAndWidth.parameters = {
    ...PlacementAndWidth.parameters,
    docs: {
        ...PlacementAndWidth.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Placement & Fit Width',\n  args: {\n    ...Default.args,\n    placeholder: 'Select a user...',\n    matchWidth: false,\n    placement: 'top-start'\n  },\n  render: ({\n    placeholder,\n    value,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name,\n    matchWidth,\n    placement\n  }: SelectArgs & {\n    matchWidth?: boolean;\n    placement?: string;\n  }) => html`\n    <div style=\"width: 150px; margin-top: 150px;\">\n      <vi-select\n        placeholder=${placeholder}\n        .value=${value}\n        ?disabled=${disabled}\n        ?required=${required}\n        ?clearable=${clearable}\n        status=${status}\n        .validityMessage=${validityMessage}\n        name=${name}\n        ?match-width=${matchWidth}\n        placement=${placement}\n      >\n        <vi-select-option value=\"user1\" label=\"Jane Doe\">\n          <div style=\"display: flex; gap: 8px; align-items: center; white-space: nowrap;\">\n            <div style=\"width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;\">JD</div>\n            <div>\n              <div style=\"font-weight: 500;\">Jane Doe</div>\n              <div style=\"font-size: 12px; color: #6b7280;\">jane.doe@example.com - Senior Software Engineer</div>\n            </div>\n          </div>\n        </vi-select-option>\n        <vi-select-option value=\"user2\" label=\"John Smith\">\n          <div style=\"display: flex; gap: 8px; align-items: center; white-space: nowrap;\">\n            <div style=\"width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;\">JS</div>\n            <div>\n              <div style=\"font-weight: 500;\">John Smith</div>\n              <div style=\"font-size: 12px; color: #6b7280;\">john.smith@example.com - Product Manager</div>\n            </div>\n          </div>\n        </vi-select-option>\n      </vi-select>\n    </div>\n  `\n}",
            ...PlacementAndWidth.parameters?.docs?.source
        }
    }
};
FormReset.parameters = {
    ...FormReset.parameters,
    docs: {
        ...FormReset.parameters?.docs,
        source: {
            originalSource: "{\n  name: 'Form Reset',\n  args: {\n    ...Default.args,\n    placeholder: 'Select an option...',\n    value: 'option1'\n  },\n  render: ({\n    placeholder,\n    disabled,\n    required,\n    clearable,\n    status,\n    validityMessage,\n    name\n  }: SelectArgs) => html`\n    <form @reset=${(_e: Event) => console.log('Form reset fired!')} @submit=${(_e: Event) => e.preventDefault()}>\n      <div style=\"width: 250px; display: flex; flex-direction: column; gap: 16px;\">\n        <vi-select\n          placeholder=${placeholder}\n          value=\"option1\"\n          ?disabled=${disabled}\n          ?required=${required}\n          ?clearable=${clearable}\n          status=${status}\n          .validityMessage=${validityMessage}\n          name=${name}\n        >\n          <vi-select-option value=\"option1\" label=\"Option 1\"></vi-select-option>\n          <vi-select-option value=\"option2\" label=\"Option 2\"></vi-select-option>\n          <vi-select-option value=\"option3\" label=\"Option 3\"></vi-select-option>\n        </vi-select>\n        <div style=\"display: flex; gap: 8px;\">\n          <vi-button type=\"reset\" variant=\"neutral\">Reset Form</vi-button>\n          <vi-button type=\"submit\" variant=\"primary\">Submit</vi-button>\n        </div>\n        <p style=\"font-size: 14px; color: #6b7280;\">Change the select value and click Reset Form. It will revert to \"Option 1\".</p>\n      </div>\n    </form>\n  `\n}",
            ...FormReset.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","Grouped","Clearable","Disabled","Invalid","Valid","WithHelper","WrappedText","CustomTemplates","TypeAhead","OptionGroups","PlacementAndWidth","FormReset"];

export { Clearable, CustomTemplates, Default, Disabled, FormReset, Grouped, Invalid, OptionGroups, PlacementAndWidth, TypeAhead, Valid, WithHelper, WrappedText, __namedExportsOrder, meta as default };
