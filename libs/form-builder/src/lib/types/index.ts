// Schema
export type { FormSchema, FormSettings } from './schema';
export { EMPTY_FORM_SCHEMA } from './schema';

// Component schemas (discriminated union)
export type {
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
} from './component-schemas';

// Layout configs
export type {
  LayoutConfig,
  PanelConfig,
  ColumnsConfig,
  TabsConfig,
  FieldsetConfig,
  RepeaterConfig,
} from './layout-schemas';

// Option sources
export type {
  OptionSource,
  StaticOptionSource,
  CodelistOptionSource,
  CodelistItem,
} from './option-source';

// Component descriptor
export type {
  ComponentDescriptor,
  SettingsSchema,
  SettingsTab,
  SettingsField,
  SettingsFieldType,
  SettingsSelectOption,
} from './component-descriptor';

// Validation
export type {
  ValidationRule,
  ValidationResult,
  RuleDescriptor,
  ServerValidationError,
  ValidatorFn,
  ValidatorContext,
  CustomValidatorRegistry,
} from './validation';
export { pass, fail } from './validation';

// Conditionals
export type {
  ConditionalRule,
  SimpleConditional,
  JsonLogicConditional,
  SimpleConditionalOperator,
} from './conditional';

// Errors
export type { SchemaValidationError } from './errors';
export { SchemaErrorCode } from './errors';

// Permissions
export { FormPermission } from './permissions';

// Extensions
export type {
  ExtensionFieldType,
  ExtensionFieldDefinition,
  ExtensionProvider,
} from './extension';
