# Form Builder: How to Add a New Control

Adding a new form control to the Vialiq form builder is straightforward. Because the builder is data-driven, you almost never have to touch the builder's UI code (`html` or `scss`). You only need to define the schema and the descriptor.

Follow this step-by-step guide to add a new control.

## Step 1: Define the Schema Type

First, define the typescript interface for the component schema so that the application maintains strict type safety.

1. Open `libs/form-builder/src/lib/types/component-schemas.ts`.
2. Add your component interface extending `BaseComponentSchema`.
3. Add your component type string to the discriminator unions (e.g., `InputType` or `LayoutType`).
4. Add your interface to the `InputComponentSchema` union or `LayoutComponentSchema` union.

```typescript
// Example: Adding a Rating control
export interface RatingComponentSchema extends BaseComponentSchema {
  type: 'rating';
  maxStars?: number;
  allowHalf?: boolean;
}

export type InputType = 
  | 'text-input' 
  // ...
  | 'rating'; // <--- Add here

export type InputComponentSchema = 
  | TextInputComponentSchema 
  // ...
  | RatingComponentSchema; // <--- Add here
```

## Step 2: Create the Component Descriptor

The `ComponentDescriptor` bridges your schema to the builder's visual interface.

1. Open (or create) the relevant descriptor file (e.g., `libs/form-builder/src/lib/built-in-components/inputs.descriptor.ts`).
2. Export a new `ComponentDescriptor`.

```typescript
import type { ComponentDescriptor } from '../types/component-descriptor';
import { standardSettings } from './settings-helpers';

export const RATING_DESCRIPTOR: ComponentDescriptor = {
  type: 'rating',
  label: 'Star Rating',
  category: 'input',
  group: 'Inputs',
  icon: 'star',
  traits: {},
  weight: 60,
  
  // This tells the canvas what web component to render
  canvasElement: 'vi-rating',
  
  // This maps the schema state to DOM properties on the canvas web component
  canvasProps: (s) => ({
    max: s.maxStars ?? 5,
    half: s.allowHalf ?? false
  }),
  
  // This defines what happens when the user drops the component onto the canvas
  defaultSchema: {
    type: 'rating',
    label: 'Rating',
    maxStars: 5,
    allowHalf: false
  },
  
  // This defines the fields that show up in the right-hand Settings Panel
  settingsSchema: standardSettings([
    // These extra fields will be appended to the standard Display tab
    { key: 'maxStars', label: 'Maximum Stars', type: 'number', defaultValue: 5 },
    { key: 'allowHalf', label: 'Allow half stars', type: 'boolean' }
  ]),
  
  // This tells the Form Renderer which Angular component handles this type
  rendererRef: 'vi-renderer-rating', 
};
```

## Step 3: Register the Descriptor

The builder won't know about your descriptor until it is registered into the registry. There are two ways to do this, depending on whether you are adding a core control to the library or a custom control from a host application.

### Option A: Adding to the Built-in Library

If you are contributing a standard control to `@vialiq/form-builder`:

1. Open `libs/form-builder/src/lib/built-in-components/index.ts`.
2. Add your descriptor to the array of default descriptors.

```typescript
import { RATING_DESCRIPTOR } from './inputs.descriptor';

export const BUILT_IN_BUILDER_COMPONENTS = [
  TEXT_INPUT_DESCRIPTOR,
  // ...
  RATING_DESCRIPTOR
];
```

### Option B: Injecting from a Host Application

If you are a consumer of the `@vialiq/form-builder` library and want to add a proprietary, domain-specific control to your specific app, use the `BUILDER_COMPONENTS` injection token in your app's providers:

```typescript
import { provideFormBuilder, BUILDER_COMPONENTS } from '@vialiq/form-builder';
import { MY_CUSTOM_RATING_DESCRIPTOR } from './my-rating.descriptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormBuilder(),
    {
      provide: BUILDER_COMPONENTS,
      useValue: [MY_CUSTOM_RATING_DESCRIPTOR],
      multi: true // Essential! Allows multiple arrays to be merged.
    }
  ]
};
```

The `BuilderRegistryService` automatically flattens all `BUILDER_COMPONENTS` injections and merges them with the built-in components. Custom components take precedence over built-ins if there is a `type` collision.

The moment you register it, your new control will automatically appear in the component palette, can be dragged onto the canvas, will render as `<vi-rating>`, and will generate a fully functioning properties panel!

## Step 4: Update the Form Renderer

The builder now knows how to generate JSON schema for your control. Now you must teach the renderer how to turn that JSON schema back into a live Angular form field.

### Option A: Adding to the Built-in Library

1. Open `libs/form-renderer/src/lib/field-renderer.component.ts`.
2. Add a new `@case ('rating')` block to the switch statement.
3. Wire the schema properties to the live web component, and bind `[formControlName]`.

```html
@case ('rating') {
  <vi-rating
    [formControlName]="schema().key"
    [max]="schema().maxStars"
    [half]="schema().allowHalf">
  </vi-rating>
}
```

> **CRITICAL WARNING:** Angular Reactive Forms (`[formControlName]`) do not magically know how to talk to custom web components. If your custom component (e.g., `<vi-rating>`) does not fire native DOM `input` events, Angular will throw a "No value accessor for form control" error. 
> You **must** either ensure your web component emits standard HTML5 form events, or you must build a custom `ControlValueAccessor` directive for it (just like we did for `ViMaskedInputCvaDirective`).

### Option B: Injecting from a Host Application

If you added your control via `BUILDER_COMPONENTS`, you cannot edit the `@switch` block inside the pre-compiled `form-renderer` library. Instead, provide a custom standalone component via the `RENDERER_COMPONENTS` token:

```typescript
@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Cast to your specific schema type -->
    <vi-rating
      [formControlName]="schema().key"
      [max]="ratingSchema().maxStars"
      [half]="ratingSchema().allowHalf">
    </vi-rating>
  `
})
export class MyCustomRatingRendererComponent {
  schema = input.required<ComponentSchema>();
  formGroup = input.required<FormGroup>();
  
  ratingSchema = computed(() => this.schema() as RatingComponentSchema);
}
```

Then register it in your app providers, just like you did for the builder:

```typescript
import { provideFormRenderer, RENDERER_COMPONENTS } from '@vialiq/form-renderer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFormRenderer(),
    {
      provide: RENDERER_COMPONENTS,
      useValue: [{ type: 'rating', component: MyCustomRatingRendererComponent }],
      multi: true
    }
  ]
};
```

That's it! You've successfully added a new dynamic form control across the entire ecosystem.
