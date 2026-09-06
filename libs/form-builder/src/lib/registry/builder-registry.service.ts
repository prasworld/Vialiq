import { inject, Injectable } from '@angular/core';
import type { ComponentDescriptor } from '../types/component-descriptor';
import { BUILDER_COMPONENTS } from '../tokens/builder-components.token';
import { BUILDER_CONFIG } from '../tokens/builder-config.token';

/**
 * Collects all registered ComponentDescriptors (built-in + custom),
 * deduplicates by type, groups by category, and sorts by weight.
 *
 * Inject this service to access the component palette data.
 */
@Injectable({ providedIn: null })
export class BuilderRegistryService {
  private readonly _descriptors: Map<string, ComponentDescriptor>;
  private readonly _groupOrder: string[];

  constructor() {
    const config = inject(BUILDER_CONFIG);
    this._groupOrder = config.groupOrder ?? ['Basic Info', 'Text Inputs', 'Layout', 'Utilities'];

    const allDescriptors = inject(BUILDER_COMPONENTS, { optional: true }) ?? [];

    // Flatten — multi-token returns ComponentDescriptor[][] when each provider uses useValue
    const flat: ComponentDescriptor[] = allDescriptors.flat();

    this._descriptors = new Map<string, ComponentDescriptor>();

    for (const descriptor of flat) {
      if (this._descriptors.has(descriptor.type)) {
        console.warn(
          `[BuilderRegistryService] Duplicate descriptor type "${descriptor.type}" detected. ` +
          `The later registration will be ignored. Check your BUILDER_COMPONENTS providers.`
        );
        continue;
      }
      this._descriptors.set(descriptor.type, descriptor);
    }
  }

  /**
   * Get a descriptor by its type identifier.
   * Returns undefined if not registered.
   */
  getByType(type: string): ComponentDescriptor | undefined {
    return this._descriptors.get(type);
  }

  /**
   * Get all descriptors grouped by their subheading group (e.g., 'BASIC INFO').
   */
  getGrouped(): Map<string, ComponentDescriptor[]> {
    const grouped = new Map<string, ComponentDescriptor[]>();

    for (const descriptor of this._descriptors.values()) {
      const groupName = descriptor.group || 'Other';
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      grouped.get(groupName)!.push(descriptor);
    }

    for (const items of grouped.values()) {
      items.sort((a, b) => (a.weight ?? 100) - (b.weight ?? 100));
    }

    // Sort groups using the configurable order from BUILDER_CONFIG.groupOrder
    const sortedGrouped = new Map<string, ComponentDescriptor[]>();
    for (const key of this._groupOrder) {
      if (grouped.has(key)) {
        sortedGrouped.set(key, grouped.get(key)!);
        grouped.delete(key);
      }
    }
    // Append any remaining custom groups in registration order
    for (const [key, items] of grouped) {
      sortedGrouped.set(key, items);
    }

    return sortedGrouped;
  }

  /**
   * Get all registered type identifiers.
   */
  getAllTypes(): string[] {
    return Array.from(this._descriptors.keys());
  }

  /**
   * Get all registered descriptors as a flat array, sorted by category then weight.
   */
  getAll(): ComponentDescriptor[] {
    const allItems: ComponentDescriptor[] = [];
    for (const items of this.getGrouped().values()) {
      allItems.push(...items);
    }
    return allItems;
  }
}
