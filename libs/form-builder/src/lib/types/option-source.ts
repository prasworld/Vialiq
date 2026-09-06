/**
 * Option sources for select/dropdown/combobox/radio-group/checkbox-group fields.
 * Framework-agnostic — no Angular imports.
 *
 * ⚠️  CODELIST GATE: CodelistOptionSource MUST NOT be implemented in the renderer
 * until both multilingual/i18n and platform-wide versioning designs are finalized.
 */

export interface CodelistItem {
  /** Stored in DB and included in submission payload (CDISC Submission Value) */
  key: string;
  /** Displayed to the data-entry operator — locale-aware (pending i18n design) */
  value: string;
  /** Extra metadata accessible in option templates only — never stored */
  data?: Record<string, unknown>;
}

// ─── Static Options ───────────────────────────────────────────────────────────

export interface StaticOptionSource {
  kind: 'static';
  items: CodelistItem[];
}

// ─── Codelist Options (blocked until i18n + versioning designs finalized) ──────

export interface CodelistOptionSource {
  kind: 'codelist';
  /** The codelist name — resolved at runtime via CODELIST_SERVICE */
  name: string;
  /**
   * Reserved for future versioning — DO NOT USE in v1.
   * @see Codelist Implementation Gate in architecture docs
   */
  version?: string;
}

// ─── Union ────────────────────────────────────────────────────────────────────

export type OptionSource = StaticOptionSource | CodelistOptionSource;
