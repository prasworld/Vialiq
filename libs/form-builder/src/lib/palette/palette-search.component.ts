import { Component, output } from '@angular/core';


@Component({
  selector: 'vi-palette-search',
  standalone: true,
  imports: [],
  templateUrl: './palette-search.component.html',
  styleUrl: './palette-search.component.scss',})
export class PaletteSearchComponent {
  readonly search = output<string>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
  }
}
