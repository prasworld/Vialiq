import { b } from './iframe-Dou6M6kd.js';
import './vi-dropdown-B-uUdhZc.js';
import './vi-menu-item-CVjinAvC.js';
import './vi-button-CmhZ2JyL.js';
import { h as homeIcon } from './home-CGGIxxxt.js';
import { u as userIcon } from './user-ClgjB9Gx.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D24a-rkj.js';
import './vi-popover-CxzGse8v.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './floating-ui.dom-Dsl7AwNm.js';
import './class-map-Bh9vJUzA.js';
import './directive-BKuZRRPO.js';
import './state-CeBMAm36.js';
import './focusable-mixin-CmxOyPX5.js';

registerIcons([
    userIcon,
    xIcon,
    homeIcon
]);
const meta = {
    title: 'Components/Dropdown',
    component: 'vi-dropdown',
    parameters: {
        layout: 'centered'
    },
    argTypes: {
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
            ]
        },
        trigger: {
            control: 'select',
            options: [
                'click',
                'hover',
                'focus'
            ]
        }
    }
};
const Default = {
    args: {
        placement: 'bottom-start',
        trigger: 'click'
    },
    render: (args)=>b`
    <vi-dropdown placement=${args.placement} trigger=${args.trigger}>
      <vi-button>Click Me</vi-button>
      
      <vi-menu slot="content" style="width: 200px;">
        <vi-menu-item value="profile">
          <vi-icon name="user" slot=""></vi-icon>
          Profile
        </vi-menu-item>
        <vi-menu-item value="dashboard">
          <vi-icon name="home" slot=""></vi-icon>
          Dashboard
        </vi-menu-item>
        <div class="vi-menu-divider"></div>
        <vi-menu-item value="logout" danger>
          <vi-icon name="x" slot=""></vi-icon>
          Logout
        </vi-menu-item>
      </vi-menu>
    </vi-dropdown>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  args: {\n    placement: 'bottom-start',\n    trigger: 'click'\n  },\n  render: args => html`\n    <vi-dropdown placement=${args.placement} trigger=${args.trigger}>\n      <vi-button>Click Me</vi-button>\n      \n      <vi-menu slot=\"content\" style=\"width: 200px;\">\n        <vi-menu-item value=\"profile\">\n          <vi-icon name=\"user\" slot=\"\"></vi-icon>\n          Profile\n        </vi-menu-item>\n        <vi-menu-item value=\"dashboard\">\n          <vi-icon name=\"home\" slot=\"\"></vi-icon>\n          Dashboard\n        </vi-menu-item>\n        <div class=\"vi-menu-divider\"></div>\n        <vi-menu-item value=\"logout\" danger>\n          <vi-icon name=\"x\" slot=\"\"></vi-icon>\n          Logout\n        </vi-menu-item>\n      </vi-menu>\n    </vi-dropdown>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default"];

export { Default, __namedExportsOrder, meta as default };
