import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom, isObservable } from 'rxjs';
import { BuilderStateService } from './builder-state.service';
import { EXTENSION_PROVIDERS } from '../tokens/extension.token';
import type { ExtensionFieldDefinition } from '../types/extension';

@Injectable({ providedIn: null })
export class ExtensionRegistryService {
  private state = inject(BuilderStateService);
  private providers = inject(EXTENSION_PROVIDERS, { optional: true }) || [];

  /**
   * Signal-native resource that automatically re-fetches and collates extensions
   * whenever the contextId signal changes. 
   * A resource handles async loading states natively without effects or RxJS chains.
   */
  readonly extensions = resource({
    params: () => this.state.contextId(),
    loader: async ({ params: contextId }): Promise<ExtensionFieldDefinition[]> => {
      if (!contextId || this.providers.length === 0) return [];

      // Convert all provider outputs to Promises (whether they return Array, Promise, or Observable)
      const promises = this.providers.map(async (provider) => {
        try {
          const result = provider.getExtensions(contextId);
          if (isObservable(result)) {
            return await firstValueFrom(result);
          }
          return await result;
        } catch (err) {
          console.error(`[ExtensionRegistry] Provider failed for context ${contextId}:`, err);
          return []; // Fail gracefully for individual providers
        }
      });

      // Await all providers
      const results = await Promise.all(promises);
      
      // Flatten the array of arrays
      const flattened = results.flat();
      
      // Sort by weight (undefined weight defaults to 0)
      return flattened.sort((a, b) => (a.weight || 0) - (b.weight || 0));
    }
  });
}
