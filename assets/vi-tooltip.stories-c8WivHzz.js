import { b } from './iframe-HYUOBlkX.js';
import './vi-tooltip-Dv2NV8T1.js';
import './vi-button-CPKznN1p.js';
import './vi-icon-Cnd4Jh50.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-CfjAgxlD.js';
import './state-B9TAfF5K.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './overlay-manager-DiQwTjfQ.js';
import './focusable-mixin-DkKvOjpm.js';
import './directive-BKuZRRPO.js';
import './registry-CeXOZkT9.js';

const meta = {
    title: 'Components/Tooltip',
    tags: [
        'autodocs'
    ],
    argTypes: {
        content: {
            control: 'text',
            description: 'Tooltip text (alternative to content slot)'
        },
        placement: {
            control: 'select',
            options: [
                'top',
                'top-start',
                'top-end',
                'bottom',
                'bottom-start',
                'bottom-end',
                'left',
                'right'
            ],
            description: 'Preferred position of the tooltip relative to its trigger'
        },
        trigger: {
            control: 'select',
            options: [
                'hover focus',
                'hover',
                'focus',
                'click'
            ],
            description: 'Events that show the tooltip'
        },
        delay: {
            control: 'number',
            description: 'Show delay in milliseconds'
        },
        hideDelay: {
            control: 'number',
            name: 'hide-delay',
            description: 'Hide delay in milliseconds'
        },
        maxWidth: {
            control: 'number',
            name: 'max-width',
            description: 'Max width of the tooltip in pixels'
        },
        disabled: {
            control: 'boolean',
            description: 'Suppresses display of the tooltip'
        }
    },
    args: {
        content: 'Informed Consent Form — signed before first visit.',
        placement: 'top',
        trigger: 'hover focus',
        delay: 300,
        hideDelay: 100,
        maxWidth: 240,
        disabled: false
    },
    render: (args)=>{
        return b`
      <div
        style="padding: 100px; display: flex; justify-content: center; align-items: center;"
      >
        <vi-tooltip
          .content=${args.content}
          .placement=${args.placement}
          .trigger=${args.trigger}
          .delay=${args.delay}
          .hideDelay=${args.hideDelay}
          .maxWidth=${args.maxWidth}
          ?disabled=${args.disabled}
        >
          <vi-button>Hover or Focus Me</vi-button>
        </vi-tooltip>
      </div>
    `;
    }
};
const Default = {};
const RichContent = {
    render: (args)=>b`
    <div
      style="padding: 100px; display: flex; justify-content: center; align-items: center;"
    >
      <vi-tooltip
        .placement=${args.placement}
        .trigger=${args.trigger}
        .delay=${args.delay}
        .hideDelay=${args.hideDelay}
        .maxWidth=${args.maxWidth}
        ?disabled=${args.disabled}
      >
        <vi-button variant="ghost" size="sm"> Grade Info </vi-button>
        <div slot="content">
          Grade per NCI CTCAE v5.0.
          <a
            href="https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm"
            target="_blank"
            style="color: #64b5f6; text-decoration: underline;"
          >
            View criteria
          </a>
        </div>
      </vi-tooltip>
    </div>
  `
};
const Placements = {
    render: (args)=>b`
    <div
      style="padding: 120px; display: grid; grid-template-columns: repeat(3, 160px); gap: 40px; justify-content: center; justify-items: center; align-items: center;"
    >
      <div></div>
      <vi-tooltip content="Top placement" placement="top" .delay=${args.delay}>
        <vi-button size="sm">Top</vi-button>
      </vi-tooltip>
      <div></div>

      <vi-tooltip
        content="Left placement"
        placement="left"
        .delay=${args.delay}
      >
        <vi-button size="sm">Left</vi-button>
      </vi-tooltip>
      <div style="font-size: 11px; color: #888; text-align: center;">
        Placements Grid
      </div>
      <vi-tooltip
        content="Right placement"
        placement="right"
        .delay=${args.delay}
      >
        <vi-button size="sm">Right</vi-button>
      </vi-tooltip>

      <div></div>
      <vi-tooltip
        content="Bottom placement"
        placement="bottom"
        .delay=${args.delay}
      >
        <vi-button size="sm">Bottom</vi-button>
      </vi-tooltip>
      <div></div>
    </div>
  `
};
const ClickTrigger = {
    args: {
        trigger: 'click',
        content: 'This tooltip is shown only when you click the button.'
    }
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{}",
            ...Default.parameters?.docs?.source
        }
    }
};
RichContent.parameters = {
    ...RichContent.parameters,
    docs: {
        ...RichContent.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"padding: 100px; display: flex; justify-content: center; align-items: center;\"\n    >\n      <vi-tooltip\n        .placement=${args.placement}\n        .trigger=${args.trigger}\n        .delay=${args.delay}\n        .hideDelay=${args.hideDelay}\n        .maxWidth=${args.maxWidth}\n        ?disabled=${args.disabled}\n      >\n        <vi-button variant=\"ghost\" size=\"sm\"> Grade Info </vi-button>\n        <div slot=\"content\">\n          Grade per NCI CTCAE v5.0.\n          <a\n            href=\"https://ctep.cancer.gov/protocoldevelopment/electronic_applications/ctc.htm\"\n            target=\"_blank\"\n            style=\"color: #64b5f6; text-decoration: underline;\"\n          >\n            View criteria\n          </a>\n        </div>\n      </vi-tooltip>\n    </div>\n  `\n}",
            ...RichContent.parameters?.docs?.source
        }
    }
};
Placements.parameters = {
    ...Placements.parameters,
    docs: {
        ...Placements.parameters?.docs,
        source: {
            originalSource: "{\n  render: args => html`\n    <div\n      style=\"padding: 120px; display: grid; grid-template-columns: repeat(3, 160px); gap: 40px; justify-content: center; justify-items: center; align-items: center;\"\n    >\n      <div></div>\n      <vi-tooltip content=\"Top placement\" placement=\"top\" .delay=${args.delay}>\n        <vi-button size=\"sm\">Top</vi-button>\n      </vi-tooltip>\n      <div></div>\n\n      <vi-tooltip\n        content=\"Left placement\"\n        placement=\"left\"\n        .delay=${args.delay}\n      >\n        <vi-button size=\"sm\">Left</vi-button>\n      </vi-tooltip>\n      <div style=\"font-size: 11px; color: #888; text-align: center;\">\n        Placements Grid\n      </div>\n      <vi-tooltip\n        content=\"Right placement\"\n        placement=\"right\"\n        .delay=${args.delay}\n      >\n        <vi-button size=\"sm\">Right</vi-button>\n      </vi-tooltip>\n\n      <div></div>\n      <vi-tooltip\n        content=\"Bottom placement\"\n        placement=\"bottom\"\n        .delay=${args.delay}\n      >\n        <vi-button size=\"sm\">Bottom</vi-button>\n      </vi-tooltip>\n      <div></div>\n    </div>\n  `\n}",
            ...Placements.parameters?.docs?.source
        }
    }
};
ClickTrigger.parameters = {
    ...ClickTrigger.parameters,
    docs: {
        ...ClickTrigger.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    trigger: 'click',\n    content: 'This tooltip is shown only when you click the button.'\n  }\n}",
            ...ClickTrigger.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","RichContent","Placements","ClickTrigger"];

export { ClickTrigger, Default, Placements, RichContent, __namedExportsOrder, meta as default };
