import {
  Component,
  Type,
  OnInit,
  input,
  output,
  computed,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';

import { ComponentSchema, ComponentDescriptor } from '../types';
import { DynamicComponentDirective } from './dynamic-component.directive';
import { SettingsTabComponent } from './settings-tab.component';
import { ExtensionRegistryService } from '../services/extension-registry.service';
import type { ExtensionFieldDefinition } from '../types/extension';

@Component({
  selector: 'vi-settings-host',
  standalone: true,
  imports: [DynamicComponentDirective, SettingsTabComponent],
  templateUrl: './settings-host.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsHostComponent implements OnInit {
  readonly schema = input.required<ComponentSchema>();
  readonly descriptor = input.required<ComponentDescriptor>();
  readonly schemaChange = output<Partial<ComponentSchema>>();

  customComponentType: Type<unknown> | null = null;
  isLoaded = false;

  extensionRegistry = inject(ExtensionRegistryService);

  readonly groupedExtensions = computed(() => {
    const fields = this.extensionRegistry.extensions.value() || [];
    const schema = this.schema();

    // Filter fields that apply to this component type
    const applicableFields = fields.filter(
      (f: ExtensionFieldDefinition) =>
        !f.appliesTo ||
        f.appliesTo.length === 0 ||
        f.appliesTo.includes(schema.type),
    );

    // Group by section
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

  // Arrow function bound to [outputs] — must accept unknown since dynamic component outputs are untyped at the host boundary.
  // We narrow the type inside before emitting.
  readonly onChange = (event: unknown): void => {
    this.schemaChange.emit(event as Partial<ComponentSchema>);
  };

  onMetadataChange(key: string, event: unknown): void {
    let val: unknown;
    if (event instanceof CustomEvent) {
      if (event.detail && typeof event.detail === 'object') {
        if ('value' in event.detail) val = event.detail.value;
        else if ('checked' in event.detail) val = event.detail.checked;
        else val = event.detail;
      } else {
        val = event.detail;
      }
    } else if (
      event instanceof Event &&
      event.target instanceof HTMLInputElement
    ) {
      val =
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;
    } else {
      val = event;
    }

    const currentMetadata = this.schema().metadata || {};
    this.schemaChange.emit({
      metadata: { ...currentMetadata, [key]: val },
    });
  }

  async ngOnInit() {
    const descriptor = this.descriptor();
    if (descriptor.settingsComponent) {
      try {
        // settingsComponent is typed as Promise<Type<unknown>> — safe cast
        this.customComponentType = await descriptor.settingsComponent();
      } catch (err) {
        console.error('Failed to load custom settings component', err);
      }
    }
    this.isLoaded = true;
  }
}
