// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  // Schema
  FormSchema,
  FormSettings,
  // Component schemas
  ComponentSchema,
  BaseComponentSchema,
  FieldEncryptionConfig,
  LayoutType,
  FieldType,
  InputComponentSchema,
  NumberComponentSchema,
  TextareaComponentSchema,
  DateComponentSchema,
  SelectComponentSchema,
  ComboboxComponentSchema,
  CheckboxGroupComponentSchema,
  RadioGroupComponentSchema,
  CheckboxComponentSchema,
  RadioComponentSchema,
  HiddenComponentSchema,
  ContentComponentSchema,
  DividerComponentSchema,
  ButtonComponentSchema,
  LayoutComponentSchema,
  // Layout configs
  LayoutConfig,
  PanelConfig,
  ColumnsConfig,
  TabsConfig,
  FieldsetConfig,
  RepeaterConfig,
  // Option sources
  OptionSource,
  StaticOptionSource,
  CodelistOptionSource,
  CodelistItem,
  // Descriptors
  ComponentDescriptor,
  SettingsSchema,
  SettingsTab,
  SettingsField,
  SettingsFieldType,
  SettingsSelectOption,
  // Validation
  ValidationRule,
  ValidationResult,
  RuleDescriptor,
  ServerValidationError,
  ValidatorFn,
  ValidatorContext,
  CustomValidatorRegistry,
  // Conditionals
  ConditionalRule,
  SimpleConditional,
  JsonLogicConditional,
  SimpleConditionalOperator,
  // Errors
  SchemaValidationError,
  // Extensions
  ExtensionFieldDefinition,
  ExtensionProvider,
} from './lib/types';

export {
  EMPTY_FORM_SCHEMA,
  pass,
  fail,
  SchemaErrorCode,
  FormPermission,
} from './lib/types';

export { defineDescriptor } from './lib/types/component-descriptor';

// ─── Tokens ───────────────────────────────────────────────────────────────────
export { BUILDER_COMPONENTS, BUILDER_CONFIG, DEFAULT_BUILDER_CONFIG, type BuilderConfig, EXTENSION_PROVIDERS } from './lib/tokens';

// ─── Registry ─────────────────────────────────────────────────────────────────
export { BuilderRegistryService } from './lib/registry/builder-registry.service';

// ─── State Management & Core Services ─────────────────────────────────────────
export { KeyGeneratorService } from './lib/services/key-generator.service';
export { FormSchemaService } from './lib/services/form-schema.service';
export { BuilderStateService } from './lib/services/builder-state.service';
export { HistoryService } from './lib/services/history.service';
export { DndService } from './lib/services/dnd.service';

// ─── Validation Engine (pure functions — framework-agnostic) ──────────────────
export { evaluate, CustomJsDisabledError } from './lib/validation/rule-engine';
export { evaluateConditional } from './lib/validation/conditional-evaluator';

// ─── Builder Host Component ───────────────────────────────────────────────────
export { FormBuilderComponent } from './lib/builder/form-builder.component';

export * from './lib/built-in-components';

// ─── Web Components Registration ──────────────────────────────────────────────
// Moved to form-builder.component.ts to prevent tree-shaking and guarantee
// registration when the builder is rendered.
