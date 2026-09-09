import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'vi-form-builder',
  imports: [],
  templateUrl: './form-builder.html',
  styleUrl: './form-builder.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilder {}
