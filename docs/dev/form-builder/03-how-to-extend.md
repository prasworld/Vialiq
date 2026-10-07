# Form Builder: How to Extend

The `form-builder` is designed to be easily extensible. If you need to add new capabilities to the property panel or new types of layout configuration, follow these guidelines.

## Adding a New Settings Field Type

Sometimes a standard text input or checkbox isn't enough for configuring a component in the property panel. For example, the `tabs` component required an `item-list` editor so users could dynamically add, remove, and rename tabs.

To add a new editor type to the property panel:

1. **Update the types**: Add your new type string to `SettingsField.type` in `libs/form-builder/src/lib/types/component-descriptor.ts`.
2. **Update the schema interfaces (Optional)**: If your new field modifies a specific complex data structure, ensure the `ComponentSchema` interface allows that shape.
3. **Build the UI block**: Open `libs/form-builder/src/lib/properties/settings-field.component.html`. This component uses an `@switch (field().type)` block to render the correct UI.
4. **Wire the value**: Add a new `@case ('your-type')` block. Bind the HTML control to `value()` and ensure it calls `onValueChange($event)` whenever the user interacts with it. 

Example:
```html
@case ('color-picker') {
  <div class="field-container">
    <label class="field-label">{{ field().label }}</label>
    <input 
      type="color" 
      [value]="value() || '#ffffff'" 
      (input)="onValueChange($event.target.value)">
    @if (field().hint) {
      <div class="field-hint">{{ field().hint }}</div>
    }
  </div>
}
```

## Adding Global Settings Tabs

If you want to add a new category of configuration to *all* inputs (for example, an "Analytics" tab or "Accessibility" tab), you don't need to rewrite every descriptor!

1. Open `libs/form-builder/src/lib/built-in-components/settings-helpers.ts`.
2. Create a new exported function that returns a `SettingsTab`, similar to `displayTab()` or `dataTab()`.
3. In `standardSettings()`, push your new tab into the array.
4. Because almost all built-in inputs use `standardSettings()` or compose `displayTab()` and `dataTab()`, your new settings tab will automatically appear across the builder.

## Extending the Canvas Capabilities

If you are building a new type of Layout Container that behaves significantly differently than Tabs or Columns, you may need to update the Canvas.

1. Open `libs/form-builder/src/lib/canvas/canvas-node.component.html`.
2. Add a new `@else if (node().type === 'your-custom-layout')` branch.
3. Define the specific DOM structure needed to render drop zones for your layout.
4. If your layout requires passing metadata to the drop zone (like `tabId` or `columnIndex`), add the corresponding inputs to `CanvasDropZoneComponent`.
5. Finally, update `form-schema.service.ts`'s `addComponent` and `moveComponent` functions to handle your new metadata and assign the dropped components into your layout's `layoutConfig`.
