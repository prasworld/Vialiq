import { b } from './iframe-Dou6M6kd.js';
import './vi-popover-CxzGse8v.js';
import './vi-button-CmhZ2JyL.js';
import './vi-switch-BI_GuE3k.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D24a-rkj.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './state-CeBMAm36.js';
import './focusable-mixin-CmxOyPX5.js';
import './validity-mixin-UqeDKzZ9.js';
import './class-map-Bh9vJUzA.js';
import './directive-BKuZRRPO.js';

const meta = {
    title: 'Feedback/Popover',
    component: 'vi-popover',
    argTypes: {
        placement: {
            control: 'select',
            options: [
                'top',
                'bottom',
                'left',
                'right'
            ]
        },
        trigger: {
            control: 'select',
            options: [
                'click',
                'hover',
                'focus'
            ]
        },
        title: {
            control: 'text'
        },
        content: {
            control: 'text'
        },
        open: {
            control: 'boolean'
        }
    },
    parameters: {
        layout: 'centered'
    }
};
const Default = {
    args: {
        placement: 'bottom',
        trigger: 'click',
        title: 'Settings'
    },
    render: (args)=>b`
    <vi-popover
      placement=${args.placement}
      trigger=${args.trigger}
      title=${args.title}
      ?open=${args.open}
    >
      <vi-button>Click Me</vi-button>
      <div slot="content" style="display: flex; flex-direction: column; gap: 8px;">
        <vi-switch label="Enable notifications"></vi-switch>
        <vi-switch label="Dark mode"></vi-switch>
      </div>
    </vi-popover>
  `
};
const HoverTrigger = {
    args: {
        placement: 'right',
        trigger: 'hover',
        title: 'Hover Info',
        content: 'This popover opens on hover instead of click.'
    },
    render: (args)=>b`
    <vi-popover
      placement=${args.placement}
      trigger=${args.trigger}
      title=${args.title}
      content=${args.content}
    >
      <vi-button variant="secondary">Hover Me</vi-button>
    </vi-popover>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    placement: 'bottom',\n    trigger: 'click',\n    title: 'Settings'\n  },\n  render: args => html`\n    <vi-popover\n      placement=${args.placement}\n      trigger=${args.trigger}\n      title=${args.title}\n      ?open=${args.open}\n    >\n      <vi-button>Click Me</vi-button>\n      <div slot=\"content\" style=\"display: flex; flex-direction: column; gap: 8px;\">\n        <vi-switch label=\"Enable notifications\"></vi-switch>\n        <vi-switch label=\"Dark mode\"></vi-switch>\n      </div>\n    </vi-popover>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
HoverTrigger.parameters = {
    ...HoverTrigger.parameters,
    docs: {
        ...HoverTrigger.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    placement: 'right',\n    trigger: 'hover',\n    title: 'Hover Info',\n    content: 'This popover opens on hover instead of click.'\n  },\n  render: args => html`\n    <vi-popover\n      placement=${args.placement}\n      trigger=${args.trigger}\n      title=${args.title}\n      content=${args.content}\n    >\n      <vi-button variant=\"secondary\">Hover Me</vi-button>\n    </vi-popover>\n  `\n}",
            ...HoverTrigger.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default","HoverTrigger"];

export { Default, HoverTrigger, __namedExportsOrder, meta as default };
