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
    let current: any = this.schema();
    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }
    return current;
  }

  onValueChange(key: string, value: unknown): void {
    const patch: any = {};
    const parts = key.split('.');
    
    let current = patch;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;

    this.schemaChange.emit(patch);
  }
}
