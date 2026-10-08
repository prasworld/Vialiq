# Form Builder: Validation, Logic, & Advanced Features

This document outlines the architecture for advanced features and pending roadmap items, specifically focusing on how Validation and Conditional Logic bridge the gap between the Builder and the Renderer.

## 1. Validation Rules

The schema allows defining multiple validation rules per component. These rules are configured in the builder and executed in the renderer.

### Schema Representation
Every component schema has an optional `validation` array. Each rule is defined by a `ValidationRule` object:

```json
"validation": [
  { "descriptor": { "type": "required" } },
  { 
    "descriptor": { 
      "type": "min",
      "value": 18
    },
    "customMessage": "You must be at least 18 years old."
  }
]
```

### Builder Implementation (Pending)
The builder will feature a `ValidationRulesEditorComponent`. 
- This editor will allow users to add, remove, and configure rules.
- It will read from a `ValidationRegistryService` (similar to `BuilderRegistryService`) which defines the available rules (e.g., Required, Min, Max, Pattern, Custom Function).

### Renderer Implementation (Pending)
The `FormRendererComponent` must map these JSON rules into actual Angular `ValidatorFn` arrays during the `FormGroup` construction.

```typescript
// Proposed Renderer mapping logic
private _buildValidators(field: ComponentSchema): ValidatorFn[] {
  if (!field.validation) return [];
  
  return field.validation.map(rule => {
    switch(rule.descriptor.type) {
      case 'required': return Validators.required;
      case 'min': return Validators.min(rule.descriptor.value);
      case 'pattern': return Validators.pattern(rule.descriptor.value);
      // ...
    }
  });
}
```

## 2. Conditional Logic

Conditional logic dictates whether a field is visible, disabled, or required based on the values of *other* fields in the form.

### Schema Representation
The schema uses a JSON Logic-inspired structure to define conditional visibility rules.

```json
"conditionalLogic": {
  "action": "show",      // 'show' | 'hide' | 'disable' | 'enable'
  "operator": "AND",
  "conditions": [
    {
      "fieldKey": "hasDriverLicense",
      "operator": "equals",
      "value": true
    }
  ]
}
```

### Builder Implementation (Pending)
A `ConditionalEditorComponent` will provide a visual rule-builder UI. It will allow users to select other fields (by reading all available `key`s from the `FormSchemaService`) and define condition operators (equals, contains, greater than).

### Renderer Implementation (Pending)
In the renderer, conditional logic must be evaluated reactively. The `FormRendererComponent` will subscribe to `formGroup.valueChanges` and dynamically evaluate the JSON logic rules against the current form state to patch the visibility or disabled state of the controls.

## 3. Schema Validation & Integrity

As forms become highly complex, ensuring the schema remains internally consistent is critical.

### `SchemaValidatorService` (Pending)
This service will run in the background of the builder and perform integrity checks:
- **Duplicate Keys**: Ensures no two fields share the same `key`.
- **Orphaned Assignments**: If a column assignment references an ID that no longer exists, it cleans it up.
- **Cycle Detection**: Prevents recursive nesting structures that could crash the renderer.

### JSON View Overlay (Pending)
A developer-focused feature allowing advanced users to view and paste raw `FormSchema` JSON. When a user pastes JSON, the `SchemaValidatorService` will run a strict Zod or JSON Schema validation pass before allowing it to be loaded into the `FormSchemaService`, preventing corrupt state injections.

## 4. Canvas Enhancements (Pending)

To improve the designer experience, several visual overlays will be added to the Canvas:

- **Breadcrumbs**: A structural path (e.g., `Panel › Columns › Text Field`) to help navigate deeply nested layouts.
- **Indicators**: Visual badges on the canvas nodes to denote state without needing to open the settings panel (e.g., a `*` for required fields, a `[+]` for repeating groups, or an eye icon for fields with conditional logic).
