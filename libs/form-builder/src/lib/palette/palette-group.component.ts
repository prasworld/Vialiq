import { Component, signal, OnInit, input } from '@angular/core';

import { ComponentDescriptor } from '../types';
import { PaletteItemComponent } from './palette-item.component';

@Component({
  selector: 'vi-palette-group',
  standalone: true,
  imports: [PaletteItemComponent],
  templateUrl: './palette-group.component.html',
  styleUrl: './palette-group.component.scss',})
export class PaletteGroupComponent {
  readonly title = input.required<string>();
  readonly items = input.required<ComponentDescriptor[]>();
}
