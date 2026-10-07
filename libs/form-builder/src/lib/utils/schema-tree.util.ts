import type { ComponentSchema, LayoutComponentSchema } from '../types';

export function findNode(components: ComponentSchema[], id: string): ComponentSchema | undefined {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if ('components' in comp && Array.isArray(comp.components)) {
      const found = findNode(comp.components, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function findNodeWithContext(
  components: ComponentSchema[],
  id: string
): { node?: ComponentSchema; parentArray?: ComponentSchema[]; index: number } {
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (comp.id === id) {
      return { node: comp, parentArray: components, index: i };
    }
    if ('components' in comp && Array.isArray(comp.components)) {
      const found = findNodeWithContext(comp.components, id);
      if (found.node) return found;
    }
  }
  return { index: -1 };
}

export function removeNode(components: ComponentSchema[], id: string): ComponentSchema | undefined {
  for (let i = 0; i < components.length; i++) {
    const comp = components[i];
    if (comp.id === id) {
      return components.splice(i, 1)[0];
    }
    if ('components' in comp && Array.isArray(comp.components)) {
      const found = removeNode(comp.components, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function isDescendant(components: ComponentSchema[], parentId: string, targetId: string): boolean {
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

export function checkKeyUnique(components: ComponentSchema[], key: string, excludeNodeId?: string): boolean {
  for (const comp of components) {
    if (comp.key === key && comp.id !== excludeNodeId) return false;
    if ('components' in comp && Array.isArray(comp.components)) {
      if (!checkKeyUnique(comp.components, key, excludeNodeId)) return false;
    }
  }
  return true;
}

export function getAllKeys(components: ComponentSchema[]): string[] {
  const keys: string[] = [];
  for (const comp of components) {
    if (comp.key) keys.push(comp.key);
    if ('components' in comp && Array.isArray(comp.components)) {
      keys.push(...getAllKeys(comp.components));
    }
  }
  return keys;
}

export function deepCloneAndResetIds(
  node: ComponentSchema,
  existingKeys: string[],
  idMap: Map<string, string>,
  deduplicateKeyFn: (baseKey: string, existingKeys: string[]) => string
): ComponentSchema {
  const clone = structuredClone(node);
  const oldId = clone.id;
  clone.id = crypto.randomUUID();
  idMap.set(oldId, clone.id);

  if (clone.key) {
    clone.key = deduplicateKeyFn(clone.key, existingKeys);
    existingKeys.push(clone.key);
  }

  if ('components' in clone && Array.isArray((clone as LayoutComponentSchema).components)) {
    (clone as LayoutComponentSchema).components = (clone as LayoutComponentSchema).components.map((c) =>
      deepCloneAndResetIds(c, existingKeys, idMap, deduplicateKeyFn)
    );
  }

  return clone;
}

export function remapLayoutConfigs(node: ComponentSchema, idMap: Map<string, string>): void {
  if ('layoutConfig' in node && node.layoutConfig) {
    const config = node.layoutConfig as Record<string, unknown>;

    if (config['columnAssignments']) {
      const oldAssignments = config['columnAssignments'] as Record<string, number>;
      const newAssignments: Record<string, number> = {};
      for (const [oldId, colIndex] of Object.entries(oldAssignments)) {
        const newId = idMap.get(oldId) || oldId;
        newAssignments[newId] = colIndex;
      }
      config['columnAssignments'] = newAssignments;
    }

    if (config['tabAssignments']) {
      const oldAssignments = config['tabAssignments'] as Record<string, string>;
      const newAssignments: Record<string, string> = {};
      for (const [oldId, tabId] of Object.entries(oldAssignments)) {
        const newId = idMap.get(oldId) || oldId;
        newAssignments[newId] = tabId;
      }
      config['tabAssignments'] = newAssignments;
    }

    if (config['viewAssignments']) {
      const oldAssignments = config['viewAssignments'] as Record<string, string>;
      const newAssignments: Record<string, string> = {};
      for (const [oldId, viewId] of Object.entries(oldAssignments)) {
        const newId = idMap.get(oldId) || oldId;
        newAssignments[newId] = viewId;
      }
      config['viewAssignments'] = newAssignments;
    }
  }

  if ('components' in node && Array.isArray((node as LayoutComponentSchema).components)) {
    (node as LayoutComponentSchema).components.forEach((c) => remapLayoutConfigs(c, idMap));
  }
}
