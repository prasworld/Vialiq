import { InjectionToken } from '@angular/core';
import type { ComponentDescriptor } from '../types/component-descriptor';

/**
 * Multi-token for registering component descriptors.
 * Use provide() with multi: true in your Angular providers.
 *
 * @example
 * // In a feature module or application providers:
 * providers: [
 *   { provide: BUILDER_COMPONENTS, useValue: MY_CUSTOM_DESCRIPTOR, multi: true },
 * ]
 */
export const BUILDER_COMPONENTS = new InjectionToken<ComponentDescriptor[]>(
  'BUILDER_COMPONENTS'
);
