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
   * Reads a top-level property from the schema by key.
   * SettingsField.key is always a top-level ComponentSchema property path.
   */
  getFieldValue(key: string): unknown {
    return (this.schema() as unknown as Record<string, unknown>)[key];
  }

  onValueChange(key: string, value: unknown): void {
    this.schemaChange.emit({ [key]: value } as Partial<ComponentSchema>);
  }
}
