import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'remote1',
    loadChildren: () => import('remote1/Routes').then((m) => m.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
