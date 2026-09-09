import { Component, CUSTOM_ELEMENTS_SCHEMA, output } from '@angular/core';


@Component({
  selector: 'vi-palette-search',
  standalone: true,
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './palette-search.component.html',
  styleUrl: './palette-search.component.scss',})
export class PaletteSearchComponent {
  readonly search = output<string>();

  onInput(event: Event) {
    const value = event instanceof CustomEvent ? event.detail?.value ?? event.detail : (event.target as HTMLInputElement)?.value;
    this.search.emit(value);
  }
}
