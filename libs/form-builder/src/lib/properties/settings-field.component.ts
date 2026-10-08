import {
  Component,
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
  readonly field = input.required<SettingsField>();
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
    if (this.field().type === 'number' && typeof val === 'string') {
      const num = Number(val);
      if (!isNaN(num)) val = num;
    }

    this.valueChange.emit(val);
  }

  // ─── Item List Helpers (Tabs/Views) ──────────────────────────────────────────

  getItemListValue(): { id: string; label: string }[] {
    const val = this.value();
    if (Array.isArray(val)) {
      return val as { id: string; label: string }[];
    }
    return [{ id: 'item1', label: 'Item 1' }];
  }

  updateItemLabel(index: number, event: unknown): void {
    const customEventDetailValue = (event as CustomEvent)?.detail?.value;
    const targetValue = (event as Event & { target: { value?: string } })?.target?.value;
    const val = customEventDetailValue ?? targetValue ?? String(event);
    const list = [...this.getItemListValue()];
    if (list[index]) {
      list[index] = { ...list[index], label: val };
      this.valueChange.emit(list);
    }
  }

  addItem(afterIndex: number): void {
    const list = [...this.getItemListValue()];
    const nextIdNumber = list.length + 1; // Simplified ID generation
    list.splice(afterIndex + 1, 0, { id: `item${nextIdNumber}-${Date.now()}`, label: `View ${nextIdNumber}` });
    this.valueChange.emit(list);
  }

  removeItem(index: number): void {
    const list = [...this.getItemListValue()];
    if (list.length > 1) {
      list.splice(index, 1);
      this.valueChange.emit(list);
    }
  }
}
