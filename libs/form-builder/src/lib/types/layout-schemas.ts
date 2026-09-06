/**
 * Layout component configuration types.
 * Framework-agnostic — no Angular imports.
 */

// ─── Panel ────────────────────────────────────────────────────────────────────

export interface PanelConfig {
  /** Optional title shown in the panel header */
  title?: string;
  /** Whether the panel is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state */
  collapsed?: boolean;
}

// ─── Columns ─────────────────────────────────────────────────────────────────

export interface ColumnsConfig {
  /** Number of columns (default: 2) */
  columns: number;
  /** CSS widths per column e.g. ['30%', '70%']. Defaults to equal widths. */
  columnWidths?: string[];
  /** Maps nodeId → columnIndex (0-based) */
  columnAssignments: Record<string, number>;
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export interface TabsConfig {
  tabs: { id: string; label: string }[];
  /** Maps nodeId → tabId */
  tabAssignments: Record<string, string>;
}

// ─── Fieldset ─────────────────────────────────────────────────────────────────

export interface FieldsetConfig {
  /** The <legend> text */
  legend?: string;
}

// ─── Repeater ─────────────────────────────────────────────────────────────────

/**
 * Repeater is a fixed-structure repeating group (distinct from isRepeating flag
 * on individual fields). Use isRepeating: true on a field for field-level repeating.
 */
export interface RepeaterConfig {
  minRows?: number;
  maxRows?: number;
  addLabel?: string;
  removeLabel?: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type LayoutConfig =
  | PanelConfig
  | ColumnsConfig
  | TabsConfig
  | FieldsetConfig
  | RepeaterConfig;
