import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { EXTENSION_PROVIDERS } from '@vialiq/form-builder';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(appRoutes),
    {
      provide: EXTENSION_PROVIDERS,
      multi: true,
      useValue: {
        getExtensions: async (contextId: string) => {
          // Simulate an API delay
          await new Promise(r => setTimeout(r, 500));
          
          if (contextId === 'default-context') {
            return [
              {
                key: 'cdiscOid',
                label: 'CDISC OID',
                type: 'text',
                section: 'CDISC Metadata',
                weight: 10,
                description: 'Unique identifier for CDISC ODM exports.'
              },
              {
                key: 'sdtmDomain',
                label: 'SDTM Domain',
                type: 'select',
                section: 'CDISC Metadata',
                weight: 20,
                options: [
                  { label: 'Demographics (DM)', value: 'DM' },
                  { label: 'Vital Signs (VS)', value: 'VS' },
                  { label: 'Adverse Events (AE)', value: 'AE' }
                ]
              },
              {
                key: 'isEpro',
                label: 'ePRO Field',
                type: 'boolean',
                section: 'Patient Settings',
                weight: 5
              }
            ];
          }
          return [];
        }
      }
    }
  ],
};
