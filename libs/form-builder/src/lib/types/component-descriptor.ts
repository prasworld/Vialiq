import type { Type } from '@angular/core';
import type { ComponentSchema } from './component-schemas';

// ─── Settings Field Types ─────────────────────────────────────────────────────

export type SettingsFieldType =
  | 'text'
  | 'number'
  | 'boolean'
  | 'select'
  | 'code'       // JSON/expression editor
  | 'key'        // special: shows auto-generated key + uniqueness validation
  | 'label'      // special: links to canvas label debounced update
  // TODO(Phase X): The following field renderers are currently unimplemented in settings-field.component.html
  | 'multiselect'
  | 'color'
  | 'icon'
  | 'custom'     // falls back to settingsComponent
  | 'item-list'; // lists like tabs or views

export interface SettingsSelectOption {
  label: string;
  value: string | number | boolean;
}

export interface SettingsField {
  /** Property path on ComponentSchema (e.g. 'label', 'placeholder', 'validation') */
  key: string;
  label: string;
  type: SettingsFieldType;
  options?: SettingsSelectOption[];   // for 'select' and 'multiselect'
  placeholder?: string;
  hint?: string;
  /** Whether this field is required in the settings panel */
  required?: boolean;
  /** If provided, this field is only shown when the condition returns true */
  showWhen?: (schema: ComponentSchema) => boolean;
  defaultValue?: unknown;
}

export interface SettingsTab {
  id: string;
  label: string;
  fields: SettingsField[];
}

export interface SettingsSchema {
  tabs: SettingsTab[];
}

export interface ComponentTraits {
  /** True if this control captures user data (e.g. text input, select) */
  isInput?: boolean;
  /** True if this control can contain other components */
  isContainer?: boolean;
  /** True if this control is purely visual/structural (e.g. separator) */
  isDisplayOnly?: boolean;
}

// ─── Component Descriptor ─────────────────────────────────────────────────────

/**
 * Describes a component type that can be added to the form canvas.
 * Both built-in and custom components use this interface.
 */
export interface ComponentDescriptor {
  /** Unique type identifier — must match ComponentSchema.type */
  type: string;
  /** Display name in the palette */
  label: string;
  /** High-level category (e.g. 'basic', 'advanced') */
  category: 'basic' | 'advanced' | 'layout';
  /** The subheading group in the palette (e.g., 'BASIC INFO', 'TEXT INPUTS') */
  group: string;
  /** Icon name from @vialiq/icons */
  icon: string;
  /** High-level behavioral traits of the component */
  traits?: ComponentTraits;
  /** Lower weight = higher position in palette category (default: 100) */
  weight?: number;
  /** Default schema values when a new instance is added to the canvas */
  defaultSchema: Partial<ComponentSchema>;
  /** Settings panel configuration (uses built-in field renderers) */
  settingsSchema?: SettingsSchema;
  /** Optional custom settings component (lazy-loaded via dynamic import) */
  settingsComponent?: () => Promise<Type<unknown>>;
  /** The custom element tag to render on the canvas (e.g. 'vi-input') */
  canvasElement: string;
  /**
   * Maps the ComponentSchema to DOM attributes/properties for canvas rendering.
   * Pure function — no side effects.
   */
  canvasProps: (schema: ComponentSchema) => Record<string, unknown>;
  /** Whether this component supports field-level repeating (isRepeating: true) */
  supportsRepeating?: boolean;
  /** The vi-renderer-* component name used in form-renderer */
  rendererRef?: string;
  /** Optional array of component types that are explicitly ALLOWED as children. If defined, all other types are rejected. */
  allowedChildren?: string[];
  /** Optional array of component types that are explicitly REJECTED as children. */
  disallowedChildren?: string[];
}

// ─── Typed Descriptor Factory ──────────────────────────────────────────────────

/**
 * Type-safe factory for defining a ComponentDescriptor.
 *
 * Allows `canvasProps` to receive the specific ComponentSchema subtype `T`
 * without requiring `as SomeSchema` casts inside the descriptor file.
 *
 * @example
 * export const TEXT_INPUT_DESCRIPTOR = defineDescriptor<InputComponentSchema>({
 *   type: 'text-input',
 *   canvasElement: 'vi-input',
 *   canvasProps: (schema) => ({ label: schema.label }), // schema is InputComponentSchema
 *   ...
 * });
 */
export function defineDescriptor<T extends ComponentSchema>(
  descriptor: Omit<ComponentDescriptor, 'canvasProps'> & {
    canvasProps: (schema: T) => Record<string, unknown>;
  }
): ComponentDescriptor {
  return {
    ...descriptor,
    canvasProps: descriptor.canvasProps as ComponentDescriptor['canvasProps'],
  };
}
