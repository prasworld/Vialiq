import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TranslationService } from './translation.service';

/**
 * A Route Resolver that blocks the activation of a lazy-loaded route until the specified
 * translation namespace has been fully loaded.
 * 
 * This guarantees zero-flicker translations for lazy-loaded Micro-Frontends.
 * 
 * @param namespace The unique namespace of the lazy-loaded MFE or feature.
 */
export const resolveTranslation = (namespace: string): ResolveFn<boolean> => () => {
  const ts = inject(TranslationService);
  return ts.loadNamespace(namespace).then(() => true);
};
