/**
 * FormPermission bitmask enum.
 * Used by FormRendererComponent to control field interactivity.
 *
 * @example
 * // Read-only rendering
 * const permissions = FormPermission.READ;
 *
 * // Full data-entry access
 * const permissions = FormPermission.READ | FormPermission.WRITE;
 */
export const enum FormPermission {
  READ     = 0b00001,
  WRITE    = 0b00010,
  VALIDATE = 0b00100,
  SIGN     = 0b01000,
  LOCK     = 0b10000,
}
