import {
  Component,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  computed,
} from '@angular/core';

import type { FormSchema, FormSettings } from '../types';
import { FormSchemaService } from '../services/form-schema.service';
import { ExtensionRegistryService } from '../services/extension-registry.service';
import type { ExtensionFieldDefinition } from '../types/extension';

@Component({
  selector: 'vi-form-settings-panel',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './form-settings-panel.component.html',
  styleUrl: './form-settings-panel.component.scss',
})
export class FormSettingsPanelComponent {
  readonly schema = input.required<FormSchema>();
  private schemaService = inject(FormSchemaService);
  extensionRegistry = inject(ExtensionRegistryService);

  readonly groupedExtensions = computed(() => {
    const fields = this.extensionRegistry.extensions.value() || [];
    
    // Form level extensions should be defined with appliesTo: ['form']
    // But to be flexible, we could show them if appliesTo is explicitly ['form']
    const applicableFields = fields.filter(
      (f: ExtensionFieldDefinition) =>
        f.appliesTo?.includes('form')
    );

    const grouped = applicableFields.reduce(
      (
        acc: Record<string, ExtensionFieldDefinition[]>,
        field: ExtensionFieldDefinition,
      ) => {
        const section = field.section || 'Advanced';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
      },
      {} as Record<string, ExtensionFieldDefinition[]>,
    );

    return Object.entries(grouped).map(([section, fields]) => ({
      section,
      fields,
    }));
  });

  /** Extracts the value from a CustomEvent or falls back to the raw value */
  private extractValue(event: unknown): unknown {
    if (event instanceof CustomEvent) {
      if (event.detail && typeof event.detail === 'object') {
        if ('value' in event.detail) return event.detail.value;
        if ('checked' in event.detail) return event.detail.checked;
      }
      return event.detail;
    }
    if (event instanceof Event && event.target instanceof HTMLInputElement) {
      return event.target.type === 'checkbox'
        ? event.target.checked
        : event.target.value;
    }
    return event;
  }

  updateTitle(event: unknown): void {
    const val = this.extractValue(event);
    if (typeof val === 'string') {
      this.schemaService.patchFormSchema({ title: val });
    }
  }

  updateDisplay(event: unknown): void {
    const val = this.extractValue(event);
    if (val === 'wizard' || val === 'form') {
      this.schemaService.patchFormSchema({ display: val });
    }
  }

  updateValidateOn(event: unknown): void {
    const val = this.extractValue(event);
    if (val === 'onChange' || val === 'onBlur' || val === 'onSubmit') {
      const currentSettings: Partial<FormSettings> = this.schema().settings ?? {};
      this.schemaService.patchFormSchema({
        settings: { ...currentSettings, validateOn: val } as FormSettings,
      });
    }
  }

  onMetadataChange(key: string, event: unknown): void {
    const val = this.extractValue(event);
    const currentMetadata = this.schema().metadata || {};
    this.schemaService.patchFormSchema({
      metadata: { ...currentMetadata, [key]: val },
    });
  }
}
