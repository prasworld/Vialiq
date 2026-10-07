import { Component, input, output } from '@angular/core';

import type { SettingsTab, ComponentSchema } from '../types';
import { SettingsFieldComponent } from './settings-field.component';

@Component({
  selector: 'vi-settings-tab',
  standalone: true,
  imports: [SettingsFieldComponent],
  templateUrl: './settings-tab.component.html',
  styleUrl: './settings-tab.component.scss',
})
export class SettingsTabComponent {
  readonly tab = input.required<SettingsTab>();
  readonly schema = input.required<ComponentSchema>();
  readonly schemaChange = output<Partial<ComponentSchema>>();

  /**
   * Reads a property from the schema by key (supports dot-notation paths like 'layoutConfig.columns').
   */
  getFieldValue(key: string): unknown {
    const parts = key.split('.');
    let current: unknown = this.schema();
    for (const part of parts) {
      if (current === undefined || current === null || typeof current !== 'object') return undefined;
      current = (current as Record<string, unknown>)[part];
    }
    return current;
  }

  onValueChange(key: string, value: unknown): void {
    const patch: Record<string, unknown> = {};
    const parts = key.split('.');
    
    // Check if we are modifying tabs or views to handle cleanup of deleted items
    if (key === 'layoutConfig.tabs' || key === 'layoutConfig.views') {
      const currentItems = this.getFieldValue(key) as { id: string }[] | undefined;
      const newItems = value as { id: string }[];
      
      if (currentItems && newItems && currentItems.length > newItems.length) {
        // An item was deleted. Find which one.
        const newIds = new Set(newItems.map(i => i.id));
        const deletedItem = currentItems.find(i => !newIds.has(i.id));
        
        if (deletedItem) {
          const assignKey = key === 'layoutConfig.tabs' ? 'tabAssignments' : 'viewAssignments';
          const currentAssignments = this.getFieldValue(`layoutConfig.${assignKey}`) as Record<string, string> | undefined;
          const fallbackId = newItems.length > 0 ? newItems[0].id : undefined;
          
          if (currentAssignments) {
            const newAssignments = { ...currentAssignments };
            let assignmentsChanged = false;
            
            for (const [childId, assignedTabId] of Object.entries(newAssignments)) {
              if (assignedTabId === deletedItem.id) {
                if (fallbackId) {
                  newAssignments[childId] = fallbackId;
                } else {
                  delete newAssignments[childId];
                }
                assignmentsChanged = true;
              }
            }
            
            if (assignmentsChanged) {
              if (!patch['layoutConfig']) patch['layoutConfig'] = {};
              (patch['layoutConfig'] as Record<string, unknown>)[assignKey] = newAssignments;
            }
          }
        }
      }
    }

    let current = patch;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;

    this.schemaChange.emit(patch);
  }
}
