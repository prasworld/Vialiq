# Form Builder: Implementation Details

The `@vialiq/form-builder` library is designed to be highly modular and data-driven. At its core, the entire builder UI (the canvas, the property panel, the palette) is generated dynamically based on **Component Descriptors**.

## The Registry & Component Descriptors

To decouple the UI from hardcoded lists of elements, the builder uses a `BuilderRegistryService`. This registry is populated at startup with `ComponentDescriptor` objects.

A `ComponentDescriptor` defines everything the builder needs to know about a specific form control or layout:

```typescript
export interface ComponentDescriptor {
  type: string;                  // e.g., 'text-input'
  label: string;                 // e.g., 'Text Input'
  category: 'input' | 'layout' | 'display';
  
  // Defines what to render on the canvas mock
  canvasElement: string;         // e.g., 'vi-input'
  canvasProps: (schema: ComponentSchema) => Record<string, unknown>;
  
  // Defines the starting schema when dropped from the palette
  defaultSchema: Partial<ComponentSchema>;
  
  // Drives the properties panel UI dynamically
  settingsSchema: SettingsSchema; 
}
```

## The Canvas Rendering (`viDynamicElement`)

When a user drags an element onto the canvas, the `CanvasNodeComponent` receives the schema node. Rather than using an enormous `@switch` statement to render every possible web component, the builder uses the `viDynamicElement` directive.

This directive:
1. Looks up the element tag in the registry (`descriptor.canvasElement`).
2. Creates the DOM node directly using Angular's `Renderer2`.
3. Evaluates `descriptor.canvasProps(node)` and applies the resulting properties directly to the DOM element.
4. Listens to specific interactive events (like tab clicks) if the element is an interactive layout container.

This data-driven approach means the canvas doesn't need to be updated when a new component is added to the system; you just register a new descriptor!

## The Settings Panel

When you select a node on the canvas, the `SettingsPanelComponent` reads the `settingsSchema` from that node's descriptor.

The settings schema defines "tabs" and "fields":

```typescript
export const TEXT_INPUT_DESCRIPTOR = {
  // ...
  settingsSchema: {
    tabs: [
      {
        id: 'display',
        label: 'Display',
        fields: [
          { key: 'label', label: 'Label', type: 'text' },
          { key: 'placeholder', label: 'Placeholder', type: 'text' }
        ]
      }
    ]
  }
}
```

The settings panel iterates over these fields and dynamically renders the appropriate UI control (`SettingsFieldComponent`), which binds directly to the schema node using the `FormSchemaService.patchComponent()` method.

## State Management (`FormSchemaService`)

The central nervous system of the builder is the `FormSchemaService`. 
It holds the single source of truth: the `FormSchema` object inside an Angular Signal (`signal<FormSchema>`).

All modifications to the form design flow through this service:
- `addComponent(parentId, index, component, layoutMeta)`
- `moveComponent(nodeId, parentId, index, layoutMeta)`
- `patchComponent(nodeId, patch)`
- `removeComponent(nodeId)`

Because the state is held in a Signal and updated immutably, Angular's change detection is extremely efficient, and implementing features like Undo/Redo becomes trivial in the future.

## Drag and Drop (`DndService`)

The builder uses Atlassian's `@atlaskit/pragmatic-drag-and-drop` engine.
The `DndService` coordinates drops between:
1. **The Palette** (source) -> **CanvasDropZone** (target): Instantiates a new component from `defaultSchema`.
2. **Canvas Node** (source) -> **CanvasDropZone** (target): Moves an existing component.

Layout containers (like Columns and Tabs) pass extra contextual data (`layoutMeta` like `columnIndex` or `tabId`) to the drop zones so the schema service knows exactly how to map the dropped child into the layout configuration.

## Host App Integration

To use the builder in a host Angular application, the host must:
1. Provide the builder dependencies (`provideFormBuilder()`).
2. **Register the Web Components**: The builder canvas generates actual DOM nodes (e.g., `<vi-input>`). The host app *must* import `@vialiq/web-components` or register custom web components before the builder renders. If a web component isn't registered in the browser window, it will silently fall back to rendering as an empty inline `HTMLElement`.
3. Load and Save the Schema: The host uses the `FormSchemaService` API to bridge data to their backend:

```typescript
@Component({ ... })
export class MyBuilderPage {
  private schemaService = inject(FormSchemaService);
  
  ngOnInit() {
    // Load from backend
    this.api.getForm(id).subscribe(schema => {
      this.schemaService.load(schema);
    });
  }
  
  save() {
    // Read the current state
    const currentSchema = this.schemaService.schema();
    this.api.saveForm(currentSchema).subscribe(...);
  }
}
```
