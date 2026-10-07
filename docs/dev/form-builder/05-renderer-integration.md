# Form Renderer Integration Guide

While the `form-builder` library creates the `FormSchema` JSON, the `@vialiq/form-renderer` library consumes it to dynamically build live Angular forms.

## 1. `FieldValue` — The In-Memory Model

Dual-value controls (like `masked-input` or `date-picker`) store a **rich object** in their `FormControl`, not a plain string. This enables preserving raw structured data alongside localized strings.

```typescript
// libs/form-builder/src/lib/types/field-value.ts
interface FieldValue<TRaw = unknown> {
  value: string;        // canonical serializable string (e.g. ISO date)
  displayValue: string; // human-readable formatted string (e.g. 12/31/2025)
  rawValue: TRaw;       // structured model (e.g. Date components object)
}
```

## 2. CVA Directives

Two `ControlValueAccessor` directives bridge the custom web component events to Angular's `FormControl`:

- `libs/form-renderer/src/lib/cva/vi-masked-input.cva.ts`
- `libs/form-renderer/src/lib/cva/vi-date-picker.cva.ts`

These directives activate **automatically** via CSS-selector matching, so the renderer template stays clean:

```html
<vi-masked-input formControlName="phone" mask="(000) 000-0000"></vi-masked-input>
```

## 3. `FormRendererComponent`

This container component receives the `FormSchema` and dynamically builds a `FormGroup`.

```typescript
@Component({
  selector: 'vi-form-renderer',
  standalone: true,
  imports: [ReactiveFormsModule, ViMaskedInputCvaDirective, FieldRendererComponent],
  template: `
    <form [formGroup]="fg()" (ngSubmit)="onSubmit()">
      @for (field of schema().components; track field.id) {
        <vi-field-renderer [schema]="field" [formGroup]="fg()" />
      }
    </form>
  `
})
export class FormRendererComponent {
  schema = input.required<FormSchema>();

  // Derived Signal — rebuilt when schema changes
  fg = computed(() => this._buildFormGroup(this.schema()));

  private _buildFormGroup(schema: FormSchema): FormGroup {
    const controls: Record<string, FormControl> = {};
    for (const field of schema.components) {
      if (!('key' in field) || !field.key) continue;
      controls[field.key] = new FormControl(
        (field as any).defaultValue ?? null,
        this._buildValidators(field)
      );
    }
    return new FormGroup(controls);
  }
}
```

## 4. `FieldRendererComponent`

A dispatcher component that uses Angular's new `@switch` syntax to render the correct web component based on `schema.type`.

```typescript
@Component({
  selector: 'vi-field-renderer',
  standalone: true,
  template: `
    @switch (schema().type) {
      @case ('text-input') {
        <vi-input
          [formControlName]="schema().key"
          [label]="schema().label"
          [placeholder]="schema().placeholder">
        </vi-input>
      }
      @case ('masked-input') {
        <vi-masked-input
          [formControlName]="schema().key"
          [mask]="schema().mask"
          [type]="schema().inputType ?? 'text'"
          [placeholder]="schema().placeholder">
        </vi-masked-input>
      }
      // ... handle other cases and nested layout containers
      
      @default {
        <!-- Dynamic rendering fallback for custom components -->
        <ng-container *ngComponentOutlet="getCustomRenderer(schema().type); inputs: { schema: schema(), formGroup: formGroup() }" />
      }
    }
  `
})
export class FieldRendererComponent {
  schema = input.required<ComponentSchema>();
  formGroup = input.required<FormGroup>();
  
  // Custom renderers provided by host app via RENDERER_COMPONENTS token
  private customRenderers = inject(RENDERER_COMPONENTS, { optional: true });
  
  getCustomRenderer(type: string): Type<any> | null {
    return this.customRenderers?.find(r => r.type === type)?.component ?? null;
  }
}
```

> **Note on Extensibility:** The `@switch` block is highly performant for built-in controls. However, to support custom controls injected by the host app (via `BUILDER_COMPONENTS`), the renderer must provide a fallback `@default` block that dynamically instantiates a custom Angular component via `*ngComponentOutlet`. The host app provides these via a `RENDERER_COMPONENTS` injection token.

## 5. `serializePayload()`

A pure function that projects the rich `FormGroup` values into the exact shape the API expects, driven by the `valueMapping` option configured by the user in the builder.

```typescript
export function serializePayload(
  schema: FormSchema,
  rawValue: Record<string, unknown>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const field of schema.components) {
    if (!('key' in field) || !field.key) continue;

    const fv = rawValue[field.key];
    if (fv == null) continue;

    if (typeof fv !== 'object') {
      payload[field.key] = fv;
      continue;
    }

    const mapping: FieldValueMapping = (field as any).valueMapping ?? 'value';
    payload[field.key] = (fv as FieldValue)[mapping];
  }

  return payload;
}
```

## 6. `deserializePayload()` — Data Hydration

When a user edits an existing record, the API sends a flat JSON object (e.g., `{"phone": "1234567890"}`). However, the `FormGroup` needs the rich `FieldValue` object. The renderer must reverse the serialization process.

```typescript
export function deserializePayload(
  schema: FormSchema,
  apiData: Record<string, unknown>
): Record<string, unknown> {
  const formValue: Record<string, unknown> = {};

  for (const field of schema.components) {
    if (!('key' in field) || !field.key) continue;

    const rawData = apiData[field.key];
    if (rawData === undefined) continue;

    // Dual-value fields: reconstruct the FieldValue object
    if (field.type === 'masked-input') {
       // Reverse logic: Given raw "1234567890", apply mask to get "(123) 456-7890"
       formValue[field.key] = {
         value: applyMask(rawData as string, field.mask), 
         displayValue: applyMask(rawData as string, field.mask),
         rawValue: rawData
       };
       continue;
    }

    if (field.type === 'date') {
       // Reverse logic: Given ISO "2025-01-15", parse to DateComponents
       formValue[field.key] = {
         value: rawData as string,
         displayValue: formatLocale(rawData as string),
         rawValue: parseIsoToComponents(rawData as string)
       };
       continue;
    }

    // Plain string fields
    formValue[field.key] = rawData;
  }

  return formValue;
}
```

The host app calls this when loading data:
```typescript
this.api.getUser().subscribe(data => {
  const hydrated = deserializePayload(this.schema(), data);
  this.fg().patchValue(hydrated);
});
```

## End-to-End Example

**Schema (from builder):**
```json
{ "key": "phone", "type": "masked-input", "valueMapping": "rawValue" },
{ "key": "dob", "type": "date", "valueMapping": "value" }
```

**User Input:**
- `phone` → types `1234567890` → displayed as `(123) 456-7890`
- `dob` → selects `15 Jan 2025`

**`fg.getRawValue()`:**
```typescript
{
  phone: { value: "(123) 456-7890", displayValue: "(123) 456-7890", rawValue: "1234567890" },
  dob:   { value: "2025-01-15", displayValue: "15/01/2025", rawValue: { day: 15, month: 1, year: 2025 } }
}
```

**`serializePayload(schema, fg.getRawValue())` output to backend API:**
```json
{
  "phone": "1234567890",
  "dob": "2025-01-15"
}
```
