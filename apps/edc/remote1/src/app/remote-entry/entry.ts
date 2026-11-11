import { Component } from '@angular/core';
import { FormBuilderComponent, TEXT_INPUT_DESCRIPTOR, BUILDER_COMPONENTS, type ComponentDescriptor } from '@vialiq/form-builder';

/**
 * Exposed study descriptors manifest for host shell dynamic integration.
 */
export const STUDY_DESCRIPTORS: ComponentDescriptor[] = [
  TEXT_INPUT_DESCRIPTOR,
];

@Component({
  standalone: true,
  imports: [FormBuilderComponent],
  providers: [
    { provide: BUILDER_COMPONENTS, useValue: STUDY_DESCRIPTORS, multi: true }
  ],
  selector: 'app-remote1-entry',
  template: `<div style="height: 100vh; width: 100vw;"><vi-form-builder></vi-form-builder></div>`,
})
export class RemoteEntry {}
