import { LitElement } from 'lit';

/**
 * Shared base class for Vi web components.
 * Keep this thin and framework-agnostic.
 */
export class ViElement extends LitElement {}

export type ViVariant = 'primary' | 'secondary' | 'danger';
