import { b } from './iframe-DLZvjPtb.js';
import { o } from './if-defined-B62nKUJ_.js';
import './vi-alert-CsU81fPo.js';
import './vi-button-Dv3pchRN.js';
import './vi-icon-LN-D11Ny.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-Dvl4DFHz.js';
import './state-DcQlrrrU.js';
import './registry-CeXOZkT9.js';
import './triangle-warning-BY6LbiCU.js';
import './lock-CCJyCMJ1.js';
import './x-3JmBhc9n.js';
import './focusable-mixin-CmxOyPX5.js';
import './directive-BKuZRRPO.js';

const meta = {
    title: 'Components/Alert',
    component: 'vi-alert',
    tags: [
        'autodocs'
    ],
    argTypes: {
        variant: {
            control: 'select',
            options: [
                'info',
                'success',
                'warning',
                'danger',
                'neutral'
            ]
        },
        title: {
            control: 'text'
        },
        open: {
            control: 'boolean'
        },
        floating: {
            control: 'boolean'
        },
        dismissible: {
            control: 'boolean'
        },
        icon: {
            control: 'text'
        },
        noIcon: {
            control: 'boolean'
        },
        autoHide: {
            control: 'boolean'
        },
        autoHideDuration: {
            control: 'number'
        }
    }
};
// Story mapping to usage examples in vi-alert.md
const FormValidationSummary = {
    args: {
        variant: 'danger',
        title: 'Please fix the following errors:',
        dismissible: true
    },
    render: (args)=>b`
    <vi-alert
      variant=${o(args.variant)}
      title=${o(args.title)}
      ?dismissible=${args.dismissible}
      icon=${o(args.icon)}
      ?no-icon=${args.noIcon}
    >
      <ul>
        <li>Date of Birth is required</li>
        <li>Weight must be a number between 0 and 700</li>
        <li>Ethnicity selection is required</li>
      </ul>
    </vi-alert>
  `
};
const QueryContextBanner = {
    args: {
        variant: 'warning',
        title: 'Open queries',
        noIcon: false,
        icon: '',
        dismissible: true
    },
    render: (args)=>b`
    <vi-alert
      variant=${o(args.variant)}
      title=${o(args.title)}
      ?dismissible=${args.dismissible}
      icon=${o(args.icon)}
      ?no-icon=${args.noIcon}
    >
      This form has 2 open queries. All queries must be resolved before data
      lock.
      <div slot="actions">
        <vi-button variant="ghost" size="sm">View Queries</vi-button>
      </div>
    </vi-alert>
  `
};
const DataLockIndicator = {
    args: {
        variant: 'info',
        noIcon: false
    },
    render: (args)=>b`
    <vi-alert
      variant=${o(args.variant)}
      title=${o(args.title)}
      ?dismissible=${args.dismissible}
      icon=${o(args.icon)}
      ?no-icon=${args.noIcon}
    >
      <vi-icon slot="icon" name="lock" size="16"></vi-icon>
      This record is <strong>locked</strong>. Contact your Data Manager to
      request an unlock.
    </vi-alert>
  `
};
const OfflineModeBanner = {
    args: {
        variant: 'warning'
    },
    render: (args)=>b`
    <vi-alert
      variant=${o(args.variant)}
      title=${o(args.title)}
      ?dismissible=${args.dismissible}
      icon=${o(args.icon)}
      ?no-icon=${args.noIcon}
      style="border-radius: 0; width: 100%;"
    >
      You are currently <strong>offline</strong>. Changes are saved locally and
      will sync automatically when your connection is restored.
    </vi-alert>
  `
};
const SuccessAutoHide = {
    args: {
        variant: 'success',
        dismissible: true,
        autoHide: true,
        autoHideDuration: 4000
    },
    render: (args)=>{
        return b`
      <div id="success-container">
        <vi-alert
          id="success-alert"
          variant=${o(args.variant)}
          title=${o(args.title)}
          ?dismissible=${args.dismissible}
          ?auto-hide=${args.autoHide}
          auto-hide-duration=${o(args.autoHideDuration)}
          icon=${o(args.icon)}
          ?no-icon=${args.noIcon}
          @vi-alert-close=${(e)=>{
            const alert = e.target;
            // The actual removal needs to be handled by the host to mimic angular/react host removing it.
            // Using a simple timeout to remove from DOM since standard alert handles its own opacity collapse.
            setTimeout(()=>{
                alert.remove();
            }, 0);
        }}
        >
          Form has been saved and submitted for review (Auto-hiding in 4s).
        </vi-alert>
      </div>
    `;
    }
};
const ExternalControl = {
    args: {
        variant: 'info',
        title: 'Controlled Alert',
        dismissible: true
    },
    render: (args)=>{
        return b`
      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;">
        <div style="display: flex; gap: 0.5rem;">
          <vi-button
            variant="primary"
            size="sm"
            @click=${()=>{
            const alert = document.querySelector('#controlled-alert');
            alert?.show();
        }}
          >
            Show Alert (imperative show())
          </vi-button>
          <vi-button
            variant="secondary"
            size="sm"
            @click=${()=>{
            const alert = document.querySelector('#controlled-alert');
            alert?.hide();
        }}
          >
            Hide Alert (imperative hide())
          </vi-button>
        </div>

        <vi-alert
          id="controlled-alert"
          variant=${o(args.variant)}
          title=${o(args.title)}
          ?dismissible=${args.dismissible}
          icon=${o(args.icon)}
          ?no-icon=${args.noIcon}
        >
          This alert can be opened and closed externally using methods or the <code>open</code> property.
        </vi-alert>
      </div>
    `;
    }
};
const FloatingContainerOverlay = {
    args: {
        variant: 'warning',
        title: 'Read-Only Mode',
        floating: true,
        dismissible: true
    },
    render: (args)=>{
        return b`
      <div
        style="position: relative; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 500px; background: #fafafa;"
      >
        <vi-alert
          variant=${o(args.variant)}
          title=${o(args.title)}
          ?floating=${args.floating}
          ?dismissible=${args.dismissible}
          icon=${o(args.icon)}
          ?no-icon=${args.noIcon}
          style="border-radius: 8px 8px 0 0;"
        >
          This card is currently locked for editing.
        </vi-alert>

        <h3 style="margin-top: ${args.floating ? '40px' : '0'};">Subject Form Record</h3>
        <p>Subject ID: SUBJ-10492</p>
        <p>Site: St. Jude Medical Center</p>
        <p>Status: Locked</p>
      </div>
    `;
    }
};
FormValidationSummary.parameters = {
    ...FormValidationSummary.parameters,
    docs: {
        ...FormValidationSummary.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'danger',\n    title: 'Please fix the following errors:',\n    dismissible: true\n  },\n  render: args => html`\n    <vi-alert\n      variant=${ifDefined(args.variant)}\n      title=${ifDefined(args.title)}\n      ?dismissible=${args.dismissible}\n      icon=${ifDefined(args.icon)}\n      ?no-icon=${args.noIcon}\n    >\n      <ul>\n        <li>Date of Birth is required</li>\n        <li>Weight must be a number between 0 and 700</li>\n        <li>Ethnicity selection is required</li>\n      </ul>\n    </vi-alert>\n  `\n}",
            ...FormValidationSummary.parameters?.docs?.source
        }
    }
};
QueryContextBanner.parameters = {
    ...QueryContextBanner.parameters,
    docs: {
        ...QueryContextBanner.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'warning',\n    title: 'Open queries',\n    noIcon: false,\n    icon: '',\n    dismissible: true\n  },\n  render: args => html`\n    <vi-alert\n      variant=${ifDefined(args.variant)}\n      title=${ifDefined(args.title)}\n      ?dismissible=${args.dismissible}\n      icon=${ifDefined(args.icon)}\n      ?no-icon=${args.noIcon}\n    >\n      This form has 2 open queries. All queries must be resolved before data\n      lock.\n      <div slot=\"actions\">\n        <vi-button variant=\"ghost\" size=\"sm\">View Queries</vi-button>\n      </div>\n    </vi-alert>\n  `\n}",
            ...QueryContextBanner.parameters?.docs?.source
        }
    }
};
DataLockIndicator.parameters = {
    ...DataLockIndicator.parameters,
    docs: {
        ...DataLockIndicator.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'info',\n    noIcon: false\n  },\n  render: args => html`\n    <vi-alert\n      variant=${ifDefined(args.variant)}\n      title=${ifDefined(args.title)}\n      ?dismissible=${args.dismissible}\n      icon=${ifDefined(args.icon)}\n      ?no-icon=${args.noIcon}\n    >\n      <vi-icon slot=\"icon\" name=\"lock\" size=\"16\"></vi-icon>\n      This record is <strong>locked</strong>. Contact your Data Manager to\n      request an unlock.\n    </vi-alert>\n  `\n}",
            ...DataLockIndicator.parameters?.docs?.source
        }
    }
};
OfflineModeBanner.parameters = {
    ...OfflineModeBanner.parameters,
    docs: {
        ...OfflineModeBanner.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'warning'\n  },\n  render: args => html`\n    <vi-alert\n      variant=${ifDefined(args.variant)}\n      title=${ifDefined(args.title)}\n      ?dismissible=${args.dismissible}\n      icon=${ifDefined(args.icon)}\n      ?no-icon=${args.noIcon}\n      style=\"border-radius: 0; width: 100%;\"\n    >\n      You are currently <strong>offline</strong>. Changes are saved locally and\n      will sync automatically when your connection is restored.\n    </vi-alert>\n  `\n}",
            ...OfflineModeBanner.parameters?.docs?.source
        }
    }
};
SuccessAutoHide.parameters = {
    ...SuccessAutoHide.parameters,
    docs: {
        ...SuccessAutoHide.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'success',\n    dismissible: true,\n    autoHide: true,\n    autoHideDuration: 4000\n  },\n  render: args => {\n    return html`\n      <div id=\"success-container\">\n        <vi-alert\n          id=\"success-alert\"\n          variant=${ifDefined(args.variant)}\n          title=${ifDefined(args.title)}\n          ?dismissible=${args.dismissible}\n          ?auto-hide=${args.autoHide}\n          auto-hide-duration=${ifDefined(args.autoHideDuration)}\n          icon=${ifDefined(args.icon)}\n          ?no-icon=${args.noIcon}\n          @vi-alert-close=${(e: CustomEvent<{\n      id: string;\n    }>) => {\n      const alert = e.target as HTMLElement;\n      // The actual removal needs to be handled by the host to mimic angular/react host removing it.\n      // Using a simple timeout to remove from DOM since standard alert handles its own opacity collapse.\n      setTimeout(() => {\n        alert.remove();\n      }, 0);\n    }}\n        >\n          Form has been saved and submitted for review (Auto-hiding in 4s).\n        </vi-alert>\n      </div>\n    `;\n  }\n}",
            ...SuccessAutoHide.parameters?.docs?.source
        }
    }
};
ExternalControl.parameters = {
    ...ExternalControl.parameters,
    docs: {
        ...ExternalControl.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'info',\n    title: 'Controlled Alert',\n    dismissible: true\n  },\n  render: args => {\n    return html`\n      <div style=\"display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;\">\n        <div style=\"display: flex; gap: 0.5rem;\">\n          <vi-button\n            variant=\"primary\"\n            size=\"sm\"\n            @click=${() => {\n      const alert = document.querySelector('#controlled-alert') as ViAlert | null;\n      alert?.show();\n    }}\n          >\n            Show Alert (imperative show())\n          </vi-button>\n          <vi-button\n            variant=\"secondary\"\n            size=\"sm\"\n            @click=${() => {\n      const alert = document.querySelector('#controlled-alert') as ViAlert | null;\n      alert?.hide();\n    }}\n          >\n            Hide Alert (imperative hide())\n          </vi-button>\n        </div>\n\n        <vi-alert\n          id=\"controlled-alert\"\n          variant=${ifDefined(args.variant)}\n          title=${ifDefined(args.title)}\n          ?dismissible=${args.dismissible}\n          icon=${ifDefined(args.icon)}\n          ?no-icon=${args.noIcon}\n        >\n          This alert can be opened and closed externally using methods or the <code>open</code> property.\n        </vi-alert>\n      </div>\n    `;\n  }\n}",
            ...ExternalControl.parameters?.docs?.source
        }
    }
};
FloatingContainerOverlay.parameters = {
    ...FloatingContainerOverlay.parameters,
    docs: {
        ...FloatingContainerOverlay.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    variant: 'warning',\n    title: 'Read-Only Mode',\n    floating: true,\n    dismissible: true\n  },\n  render: args => {\n    return html`\n      <div\n        style=\"position: relative; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; max-width: 500px; background: #fafafa;\"\n      >\n        <vi-alert\n          variant=${ifDefined(args.variant)}\n          title=${ifDefined(args.title)}\n          ?floating=${args.floating}\n          ?dismissible=${args.dismissible}\n          icon=${ifDefined(args.icon)}\n          ?no-icon=${args.noIcon}\n          style=\"border-radius: 8px 8px 0 0;\"\n        >\n          This card is currently locked for editing.\n        </vi-alert>\n\n        <h3 style=\"margin-top: ${args.floating ? '40px' : '0'};\">Subject Form Record</h3>\n        <p>Subject ID: SUBJ-10492</p>\n        <p>Site: St. Jude Medical Center</p>\n        <p>Status: Locked</p>\n      </div>\n    `;\n  }\n}",
            ...FloatingContainerOverlay.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["FormValidationSummary","QueryContextBanner","DataLockIndicator","OfflineModeBanner","SuccessAutoHide","ExternalControl","FloatingContainerOverlay"];

export { DataLockIndicator, ExternalControl, FloatingContainerOverlay, FormValidationSummary, OfflineModeBanner, QueryContextBanner, SuccessAutoHide, __namedExportsOrder, meta as default };
