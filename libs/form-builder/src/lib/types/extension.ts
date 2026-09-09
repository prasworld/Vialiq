import { Observable } from 'rxjs';

export type ExtensionFieldType = 'text' | 'textarea' | 'select' | 'boolean';

export interface ExtensionFieldDefinition {
  /** The key where this value will be saved (stored inside schema.metadata) */
  key: string;
  /** UI Label for the properties panel */
  label: string;
  /** The type of UI control to render */
  type: ExtensionFieldType;
  /** Options if type is 'select' */
  options?: { label: string; value: string }[];
  /** Optional description/help text */
  description?: string;
  /** Component types this applies to (if empty, applies to all) */
  appliesTo?: string[];
  
  // --- Placement Controls ---
  /** 
   * Which section to place this field in. 
   * E.g., 'general', 'validation', 'advanced', or a custom new section like 'CDISC Data'.
   */
  section: string;           
  /** Sort order within the section (lower renders first) */
  weight?: number;           
}

export interface ExtensionProvider {
  /**
   * Returns extension fields applicable for the given context.
   * Can be synchronous, a Promise, or an Observable.
   */
  getExtensions(contextId: string): 
    | ExtensionFieldDefinition[] 
    | Promise<ExtensionFieldDefinition[]> 
    | Observable<ExtensionFieldDefinition[]>;
}
