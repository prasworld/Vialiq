import {
  Component,
  Input,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  output,
} from '@angular/core';

import { SettingsField } from '../types';

@Component({
  selector: 'vi-settings-field',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './settings-field.component.html',
  styleUrl: './settings-field.component.scss',
})
export class SettingsFieldComponent {
  @Input({ required: true }) field!: SettingsField;
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  onValueChange(event: unknown): void {
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

    // Convert to number if field type is number
    if (this.field.type === 'number' && typeof val === 'string') {
      const num = Number(val);
      if (!isNaN(num)) val = num;
    }

    this.valueChange.emit(val);
  }
}
