import { Component, input, output } from '@angular/core';

@Component({
  selector: 'vi-canvas-form-title',
  standalone: true,
  templateUrl: './canvas-form-title.component.html',
  styleUrl: './canvas-form-title.component.scss',})
export class CanvasFormTitleComponent {
  readonly title = input.required<string>();
  readonly titleChange = output<string>();

  onTitleChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.titleChange.emit(input.value);
  }
}
