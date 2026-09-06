import { Injectable, signal, inject } from '@angular/core';
import type { FormSchema, ComponentSchema, LayoutComponentSchema } from '../types';
import { EMPTY_FORM_SCHEMA } from '../types/schema';
import { KeyGeneratorService } from './key-generator.service';

@Injectable({ providedIn: null })
export class FormSchemaService {
  private readonly _keyGen = inject(KeyGeneratorService);
  private readonly _schema = signal<FormSchema>(EMPTY_FORM_SCHEMA());

  /** The current form schema state */
  readonly schema = this._schema.asReadonly();

  /** Load an existing schema (replaces entire state — use for import/init only) */
  load(schema: FormSchema): void {
    this._schema.set(structuredClone(schema));
  }

  /**
   * Patches top-level FormSchema properties (title, display, settings, etc.).
   * Prefer this over load() for partial root updates — avoids a full history reset.
   */
  patchFormSchema(patch: Partial<Omit<FormSchema, 'components' | 'id' | 'schemaVersion'>>): void {
    this._schema.update(s => ({ ...s, ...patch }));
  }

  /** Gets a node by ID anywhere in the tree */
  getNode(nodeId: string): ComponentSchema | undefined {
    return this._findNode(this._schema().components, nodeId);
  }

  /** Checks if a field key is unique across the entire form */
  isKeyUnique(key: string, excludeNodeId?: string): boolean {
    if (!key) return true;
    return this._checkKeyUnique(this._schema().components, key, excludeNodeId);
  }

  /** Returns all field keys currently in the schema (flat + nested) */
  getAllKeys(): string[] {
    return this._getAllKeys(this._schema().components);
  }

  /** Adds a new component to the schema */
  addComponent(parentId: string | null, index: number, component: ComponentSchema) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      
      if (parentId === null) {
        // Add to root
        newSchema.components.splice(index, 0, component);
      } else {
        const parent = this._findNode(newSchema.components, parentId) as LayoutComponentSchema;
        if (parent && 'components' in parent) {
          parent.components.splice(index, 0, component);
        }
      }
      
      return newSchema;
    });
  }

  /** Removes a component from the schema */
  removeComponent(nodeId: string) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      this._removeNode(newSchema.components, nodeId);
      return newSchema;
    });
  }

  /** Moves a component to a new location in the tree */
  moveComponent(nodeId: string, targetParentId: string | null, targetIndex: number) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      
      // Prevent cycles
      if (targetParentId && (nodeId === targetParentId || this._isDescendant(newSchema.components, nodeId, targetParentId))) {
        console.warn('Cannot move a component into itself or its descendant');
        return s; // No change
      }

      // Find and remove the node from its current location
      const nodeToMove = this._removeNode(newSchema.components, nodeId);
      if (!nodeToMove) return s; // Node not found

      // Add to new location
      if (targetParentId === null) {
        newSchema.components.splice(targetIndex, 0, nodeToMove);
      } else {
        const parent = this._findNode(newSchema.components, targetParentId) as LayoutComponentSchema;
        if (parent && 'components' in parent) {
          parent.components.splice(targetIndex, 0, nodeToMove);
        } else {
          // If parent is not found or not a layout component, restore the node to root (fallback)
           newSchema.components.push(nodeToMove);
        }
      }

      return newSchema;
    });
  }

  /** Updates specific properties on a component */
  patchComponent(nodeId: string, patch: Partial<ComponentSchema>) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      const node = this._findNode(newSchema.components, nodeId);
      if (node) {
        Object.assign(node, patch);
      }
      return newSchema;
    });
  }

  /** Duplicates a component, assigning new IDs and deduplicated keys */
  duplicateComponent(nodeId: string): void {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      const { node, parentArray, index } = this._findNodeWithContext(newSchema.components, nodeId);

      if (node && parentArray && index !== -1) {
        const existingKeys = this._getAllKeys(newSchema.components);
        const duplicate = this._deepCloneAndResetIds(node, existingKeys);
        parentArray.splice(index + 1, 0, duplicate);
      }

      return newSchema;
    });
  }

  /** Checks if targetId is a descendant of nodeId */
  isDescendant(nodeId: string, targetId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node || !('components' in node)) return false;
    return this._isDescendant([node], nodeId, targetId);
  }

  // ─── Internal Helpers ─────────────────────────────────────────────────────────

  private _findNode(components: ComponentSchema[], id: string): ComponentSchema | undefined {
    for (const comp of components) {
      if (comp.id === id) return comp;
      if ('components' in comp && Array.isArray(comp.components)) {
        const found = this._findNode(comp.components, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private _findNodeWithContext(components: ComponentSchema[], id: string): { node?: ComponentSchema, parentArray?: ComponentSchema[], index: number } {
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (comp.id === id) {
        return { node: comp, parentArray: components, index: i };
      }
      if ('components' in comp && Array.isArray(comp.components)) {
        const found = this._findNodeWithContext(comp.components, id);
        if (found.node) return found;
      }
    }
    return { index: -1 };
  }

  private _removeNode(components: ComponentSchema[], id: string): ComponentSchema | undefined {
    for (let i = 0; i < components.length; i++) {
      const comp = components[i];
      if (comp.id === id) {
        return components.splice(i, 1)[0];
      }
      if ('components' in comp && Array.isArray(comp.components)) {
        const found = this._removeNode(comp.components, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private _isDescendant(components: ComponentSchema[], parentId: string, targetId: string): boolean {
    let inDescendantTree = false;

    const check = (comps: ComponentSchema[], inTargetTree: boolean): boolean => {
      for (const comp of comps) {
        if (comp.id === targetId && inTargetTree) return true;
        if ('components' in comp && Array.isArray(comp.components)) {
          if (check(comp.components, inTargetTree || comp.id === parentId)) return true;
        }
      }
      return false;
    };

    return check(components, false);
  }

  private _checkKeyUnique(components: ComponentSchema[], key: string, excludeNodeId?: string): boolean {
    for (const comp of components) {
      if (comp.key === key && comp.id !== excludeNodeId) return false;
      if ('components' in comp && Array.isArray(comp.components)) {
        if (!this._checkKeyUnique(comp.components, key, excludeNodeId)) return false;
      }
    }
    return true;
  }

  private _getAllKeys(components: ComponentSchema[]): string[] {
    const keys: string[] = [];
    for (const comp of components) {
      if (comp.key) keys.push(comp.key);
      if ('components' in comp && Array.isArray(comp.components)) {
        keys.push(...this._getAllKeys(comp.components));
      }
    }
    return keys;
  }

  private _deepCloneAndResetIds(
    node: ComponentSchema,
    existingKeys: string[]
  ): ComponentSchema {
    const clone = structuredClone(node);
    clone.id = crypto.randomUUID();

    if (clone.key) {
      clone.key = this._keyGen.deduplicateKey(clone.key, existingKeys);
      existingKeys.push(clone.key);
    }

    if ('components' in clone && Array.isArray((clone as LayoutComponentSchema).components)) {
      (clone as LayoutComponentSchema).components = (clone as LayoutComponentSchema).components
        .map(c => this._deepCloneAndResetIds(c, existingKeys));
    }

    return clone;
  }
}
