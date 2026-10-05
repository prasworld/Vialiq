import { Injectable, signal, inject } from '@angular/core';
import type { FormSchema, ComponentSchema, LayoutComponentSchema } from '../types';
import { EMPTY_FORM_SCHEMA } from '../types/schema';
import { KeyGeneratorService } from './key-generator.service';
import { deepMerge } from '../utils/object.util';
import {
  findNode,
  findNodeWithContext,
  removeNode,
  isDescendant,
  checkKeyUnique,
  getAllKeys,
  deepCloneAndResetIds,
  remapLayoutConfigs
} from '../utils/schema-tree.util';

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
    return findNode(this._schema().components, nodeId);
  }

  /** Checks if a field key is unique across the entire form */
  isKeyUnique(key: string, excludeNodeId?: string): boolean {
    if (!key) return true;
    return checkKeyUnique(this._schema().components, key, excludeNodeId);
  }

  /** Returns all field keys currently in the schema (flat + nested) */
  getAllKeys(): string[] {
    return getAllKeys(this._schema().components);
  }

  /** Adds a new component to the schema */
  addComponent(parentId: string | null, index: number, component: ComponentSchema, layoutMeta?: { columnIndex?: number; tabId?: string; viewId?: string }) {
    this._schema.update((s) => {
      if (parentId === null) {
        const components = [
          ...s.components.slice(0, index),
          component,
          ...s.components.slice(index),
        ];
        return { ...s, components };
      }
      
      const newSchema = structuredClone(s);
      const parent = findNode(newSchema.components, parentId) as LayoutComponentSchema;
      if (parent && 'components' in parent) {
        parent.components.splice(index, 0, component);
        
        // Handle column assignment if dropping into a columns layout
        if (parent.type === 'columns' && layoutMeta?.columnIndex !== undefined) {
          if (!parent.layoutConfig) parent.layoutConfig = { columns: 2, columnAssignments: {} };
          const layoutConfig = parent.layoutConfig as Record<string, unknown>;
          if (!layoutConfig['columnAssignments']) layoutConfig['columnAssignments'] = {};
          (layoutConfig['columnAssignments'] as Record<string, number>)[component.id] = layoutMeta.columnIndex;
        } else if (parent.type === 'tabs' && layoutMeta?.tabId !== undefined) {
          if (!parent.layoutConfig) parent.layoutConfig = { tabs: [], tabAssignments: {} };
          const layoutConfig = parent.layoutConfig as Record<string, unknown>;
          if (!layoutConfig['tabAssignments']) layoutConfig['tabAssignments'] = {};
          (layoutConfig['tabAssignments'] as Record<string, string>)[component.id] = layoutMeta.tabId;
        } else if (parent.type === 'content-switcher' && layoutMeta?.viewId !== undefined) {
          if (!parent.layoutConfig) parent.layoutConfig = { views: [], viewAssignments: {} };
          const layoutConfig = parent.layoutConfig as Record<string, unknown>;
          if (!layoutConfig['viewAssignments']) layoutConfig['viewAssignments'] = {};
          (layoutConfig['viewAssignments'] as Record<string, string>)[component.id] = layoutMeta.viewId;
        }
      }
      return newSchema;
    });
  }

  /** Removes a component from the schema */
  removeComponent(nodeId: string) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      removeNode(newSchema.components, nodeId);
      return newSchema;
    });
  }

  /** Moves a component to a new location in the tree */
  moveComponent(nodeId: string, targetParentId: string | null, targetIndex: number, layoutMeta?: { columnIndex?: number; tabId?: string; viewId?: string }) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      
      if (targetParentId && (nodeId === targetParentId || isDescendant(newSchema.components, nodeId, targetParentId))) {
        console.warn('Cannot move a component into itself or its descendant');
        return s; // No change
      }

      const sourceContext = findNodeWithContext(newSchema.components, nodeId);
      if (!sourceContext.node || !sourceContext.parentArray || sourceContext.index === -1) {
        return s; // Node not found
      }

      let targetArray: ComponentSchema[];
      if (targetParentId === null) {
        targetArray = newSchema.components;
      } else {
        const parent = findNode(newSchema.components, targetParentId) as LayoutComponentSchema;
        if (parent && 'components' in parent) {
          targetArray = parent.components;
        } else {
          targetArray = newSchema.components; // fallback
        }
      }

      let adjustedTargetIndex = targetIndex;
      if (sourceContext.parentArray === targetArray && sourceContext.index < targetIndex) {
        adjustedTargetIndex--;
      }

      const nodeToMove = sourceContext.parentArray.splice(sourceContext.index, 1)[0];
      targetArray.splice(adjustedTargetIndex, 0, nodeToMove);

      // Handle column assignment
      if (targetParentId !== null) {
        const parent = findNode(newSchema.components, targetParentId) as LayoutComponentSchema;
        if (parent && parent.type === 'columns') {
           if (layoutMeta?.columnIndex !== undefined) {
             if (!parent.layoutConfig) parent.layoutConfig = { columns: 2, columnAssignments: {} };
             const layoutConfig = parent.layoutConfig as Record<string, unknown>;
             if (!layoutConfig['columnAssignments']) layoutConfig['columnAssignments'] = {};
             (layoutConfig['columnAssignments'] as Record<string, number>)[nodeToMove.id] = layoutMeta.columnIndex;
           }
        } else if (parent && parent.type === 'tabs') {
           if (layoutMeta?.tabId !== undefined) {
             if (!parent.layoutConfig) parent.layoutConfig = { tabs: [], tabAssignments: {} };
             const layoutConfig = parent.layoutConfig as Record<string, unknown>;
             if (!layoutConfig['tabAssignments']) layoutConfig['tabAssignments'] = {};
             (layoutConfig['tabAssignments'] as Record<string, string>)[nodeToMove.id] = layoutMeta.tabId;
           }
        } else if (parent && parent.type === 'content-switcher') {
           if (layoutMeta?.viewId !== undefined) {
             if (!parent.layoutConfig) parent.layoutConfig = { views: [], viewAssignments: {} };
             const layoutConfig = parent.layoutConfig as Record<string, unknown>;
             if (!layoutConfig['viewAssignments']) layoutConfig['viewAssignments'] = {};
             (layoutConfig['viewAssignments'] as Record<string, string>)[nodeToMove.id] = layoutMeta.viewId;
           }
        }
      }

      return newSchema;
    });
  }

  /** Updates specific properties on a component */
  patchComponent(nodeId: string, patch: Partial<ComponentSchema>) {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      const node = findNode(newSchema.components, nodeId);
      if (node) {
        deepMerge(node as unknown as Record<string, unknown>, patch as Record<string, unknown>);
      }
      return newSchema;
    });
  }

  /** Duplicates a component, assigning new IDs and deduplicated keys */
  duplicateComponent(nodeId: string): void {
    this._schema.update((s) => {
      const newSchema = structuredClone(s);
      const { node, parentArray, index } = findNodeWithContext(newSchema.components, nodeId);

      if (node && parentArray && index !== -1) {
        const existingKeys = getAllKeys(newSchema.components);
        const idMap = new Map<string, string>();
        const duplicate = deepCloneAndResetIds(node, existingKeys, idMap, (baseKey, existing) => this._keyGen.deduplicateKey(baseKey, existing));
        remapLayoutConfigs(duplicate, idMap);
        parentArray.splice(index + 1, 0, duplicate);
      }

      return newSchema;
    });
  }

  /** Checks if targetId is a descendant of nodeId */
  isDescendant(nodeId: string, targetId: string): boolean {
    const node = this.getNode(nodeId);
    if (!node || !('components' in node)) return false;
    return isDescendant([node], nodeId, targetId);
  }
}

