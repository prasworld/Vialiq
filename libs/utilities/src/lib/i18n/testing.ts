import { Pipe, PipeTransform, Provider } from '@angular/core';
import { TranslationService } from './angular/translation.service';
import { signal } from '@angular/core';

/**
 * A mock TranslatePipe that simply echoes the key for unit tests.
 */
@Pipe({
  name: 'translate',
  standalone: true,
  pure: true
})
export class MockTranslatePipe implements PipeTransform {
  transform(key: string): string {
    return key;
  }
}

/**
 * Provides a mocked TranslationService that simply echoes keys.
 * Use this in unit tests to avoid actual HTTP calls or complex setups.
 */
export function provideMockTranslations(): Provider[] {
  return [
    {
      provide: TranslationService,
      useValue: {
        translations: signal(null),
        locale: signal('en'),
        isLoading: signal(false),
        instant: (key: string) => key,
        get: (key: string) => Promise.resolve(key),
        loadInitial: () => Promise.resolve(),
        registerNamespace: () => { /* no-op */ },
        setLocale: () => { /* no-op */ }
      }
    }
  ];
}
