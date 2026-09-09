import { Component, CUSTOM_ELEMENTS_SCHEMA, input, output } from '@angular/core';

@Component({
  selector: 'vi-canvas-form-title',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './canvas-form-title.component.html',
  styleUrl: './canvas-form-title.component.scss',})
export class CanvasFormTitleComponent {
  readonly title = input.required<string>();
  readonly titleChange = output<string>();

  onTitleChange(event: Event) {
    const value = event instanceof CustomEvent ? event.detail?.value ?? event.detail : (event.target as HTMLInputElement)?.value;
    this.titleChange.emit(value);
  }
}
