import { LitElement } from 'lit';

/**
 * Shared base class for Vi web components.
 * Keep this thin — behaviour is added via mixins (FocusableMixin, FocusTrapMixin).
 */
export class ViElement extends LitElement {}

/** Component size scale */
export type ViSize = 'sm' | 'md' | 'lg';

/** Semantic status — maps to colour tokens (success, warning, danger, info, neutral) */
export type ViStatus = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
