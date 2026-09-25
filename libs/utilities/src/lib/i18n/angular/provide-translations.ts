import { APP_INITIALIZER, ENVIRONMENT_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { TranslationManifest } from '../core/translation-loader';

export function provideTranslations(manifest: TranslationManifest & { eager?: boolean }): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        inject(TranslationService).registerNamespace(manifest);
      }
    },
    manifest.eager !== false
      ? {
          provide: APP_INITIALIZER,
          useFactory: () => {
            const ts = inject(TranslationService);
            return () => ts.loadInitial();
          },
          multi: true,
        }
      : []
  ]);
}
