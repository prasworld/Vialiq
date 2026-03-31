import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { checkIcon } from '@vialiq/icons/check';
import { xIcon } from '@vialiq/icons/x';
import '@vialiq/web-components/button';
import '@vialiq/web-components/icons/vi-icon';
import { registerIcons } from '@vialiq/web-components/icons/registry';

// Register icons from @vialiq/icons before app bootstrap
registerIcons([checkIcon, xIcon]);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
