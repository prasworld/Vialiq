import {
  Component,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
} from '@angular/core';

import type { FormSchema, FormSettings } from '../types';
import { FormSchemaService } from '../services/form-schema.service';

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
    const currentSettings: Partial<FormSettings> = this.schema().settings ?? {};
    this.schemaService.patchFormSchema({
      settings: { ...currentSettings, validateOn: val } as FormSettings,
    });
  }
}
