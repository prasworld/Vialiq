import { b } from './iframe-Dou6M6kd.js';
import './vi-menu-item-CVjinAvC.js';
import { r as registerIcons } from './registry-CeXOZkT9.js';
import { h as homeIcon } from './home-CGGIxxxt.js';
import { h as hospitalIcon, t as trashIcon } from './trash-B1F8tHcr.js';
import { u as userIcon } from './user-ClgjB9Gx.js';
import { x as xIcon } from './x-3JmBhc9n.js';
import './preload-helper-D5QYaGzd.js';
import './vi-element-D24a-rkj.js';
import './class-map-Bh9vJUzA.js';
import './directive-BKuZRRPO.js';

registerIcons([
    userIcon,
    homeIcon,
    hospitalIcon,
    trashIcon,
    xIcon
]);
const meta = {
    title: 'Components/Menu',
    component: 'vi-menu',
    parameters: {
        layout: 'centered'
    }
};
const Default = {
    render: ()=>b`
    <vi-menu style="width: 256px;">
      <div class="vi-menu-group-title">Account</div>
      <vi-menu-item value="profile">
        <vi-icon name="user" slot=""></vi-icon>
        Profile
      </vi-menu-item>
      <vi-menu-item value="home">
        <vi-icon name="home" slot=""></vi-icon>
        Dashboard
      </vi-menu-item>
      <vi-menu-item value="hospital">
        <vi-icon name="hospital" slot=""></vi-icon>
        Medical Records
      </vi-menu-item>
      
      <div class="vi-menu-divider"></div>
      
      <div class="vi-menu-group-title">Danger Zone</div>
      <vi-menu-item value="delete" disabled>
        <vi-icon name="trash" slot=""></vi-icon>
        Delete Account
      </vi-menu-item>
      <vi-menu-item value="logout" danger>
        <vi-icon name="x" slot=""></vi-icon>
        Logout
      </vi-menu-item>
    </vi-menu>
  `
};
Default.parameters = {
    ...Default.parameters,
    docs: {
        ...Default.parameters?.docs,
        source: {
            originalSource: "{\n  render: () => html`\n    <vi-menu style=\"width: 256px;\">\n      <div class=\"vi-menu-group-title\">Account</div>\n      <vi-menu-item value=\"profile\">\n        <vi-icon name=\"user\" slot=\"\"></vi-icon>\n        Profile\n      </vi-menu-item>\n      <vi-menu-item value=\"home\">\n        <vi-icon name=\"home\" slot=\"\"></vi-icon>\n        Dashboard\n      </vi-menu-item>\n      <vi-menu-item value=\"hospital\">\n        <vi-icon name=\"hospital\" slot=\"\"></vi-icon>\n        Medical Records\n      </vi-menu-item>\n      \n      <div class=\"vi-menu-divider\"></div>\n      \n      <div class=\"vi-menu-group-title\">Danger Zone</div>\n      <vi-menu-item value=\"delete\" disabled>\n        <vi-icon name=\"trash\" slot=\"\"></vi-icon>\n        Delete Account\n      </vi-menu-item>\n      <vi-menu-item value=\"logout\" danger>\n        <vi-icon name=\"x\" slot=\"\"></vi-icon>\n        Logout\n      </vi-menu-item>\n    </vi-menu>\n  `\n}",
            ...Default.parameters?.docs?.source
        }
    }
};
const __namedExportsOrder = ["Default"];

export { Default, __namedExportsOrder, meta as default };
