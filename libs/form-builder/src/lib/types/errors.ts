/**
 * Schema validation error codes.
 * Returned by SchemaValidatorService.validateSchema().
 */
export const enum SchemaErrorCode {
  DUPLICATE_KEY          = 'DUPLICATE_KEY',
  DUPLICATE_ID           = 'DUPLICATE_ID',
  EMPTY_KEY              = 'EMPTY_KEY',
  INVALID_KEY_FORMAT     = 'INVALID_KEY_FORMAT',
  UNKNOWN_TYPE           = 'UNKNOWN_TYPE',
  ORPHANED_CONDITIONAL   = 'ORPHANED_CONDITIONAL',
  ORPHANED_TAB_ASSIGNMENT   = 'ORPHANED_TAB_ASSIGNMENT',
  ORPHANED_COL_ASSIGNMENT   = 'ORPHANED_COL_ASSIGNMENT',
  INVALID_COLUMN_INDEX   = 'INVALID_COLUMN_INDEX',
}

export interface SchemaValidationError {
  code: SchemaErrorCode;
  /** Human-readable message */
  message: string;
  /** The node ID (if applicable) */
  nodeId?: string;
  /** The key that caused the error (if applicable) */
  key?: string;
}
