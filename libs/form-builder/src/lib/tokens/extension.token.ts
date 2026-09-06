import { InjectionToken } from '@angular/core';
import type { ExtensionProvider } from '../types/extension';

/**
 * Multi-provider token allowing host applications to inject custom extension fields 
 * into the form builder's properties panel.
 */
export const EXTENSION_PROVIDERS = new InjectionToken<ExtensionProvider[]>('EXTENSION_PROVIDERS');
