import { Component } from '@angular/core';
import { FormBuilderComponent, TEXT_INPUT_DESCRIPTOR, BUILDER_COMPONENTS } from '@vialiq/form-builder';

@Component({
  standalone: true,
  imports: [FormBuilderComponent],
  providers: [
    { provide: BUILDER_COMPONENTS, useValue: [TEXT_INPUT_DESCRIPTOR], multi: true }
  ],
  selector: 'app-remote1-entry',
  template: `<div style="height: 100vh; width: 100vw;"><vi-form-builder></vi-form-builder></div>`,
})
export class RemoteEntry {}
