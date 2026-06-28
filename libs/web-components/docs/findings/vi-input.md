# Pending Edge Cases & Findings: `vi-input`

This document details the discovered edge cases, browser quirks, and potential future improvements for the `<vi-input>` web component.

---

## 1. Value Parsing & Constraints (`type="number"`)
* **Finding**: The native `<input type="number">` returns `""` (empty string) from its `value` property if the user types an invalid numeric sequence (e.g., `12.3.4` or `++5`). This makes it difficult for the custom element to distinguish between an empty field and a bad numeric input via `this.value`.
* **Impact**: Parent forms checking `this.value` directly will see an empty string instead of the raw invalid text.
* **Workaround / Resolution**: Standard constraint validation flags (specifically `badInput` and `stepMismatch` inside `ValidityState`) are correctly captured and surfaced by `ValidityMixin` during `_testValidity()`. 

---

## 2. Password Managers & Autofill in Shadow Roots
* **Finding**: While modern browsers (Chrome 120+, Safari 17+, Firefox) natively support autofilling inputs inside Shadow Roots using FACE (`ElementInternals`), some legacy password managers or browser extensions (e.g., older versions of 1Password, LastPass) rely on traversing the light DOM to find input fields.
* **Impact**: Legacy extensions may fail to automatically overlay credentials on `<vi-input>` inside a Shadow Root.
* **Workaround / Resolution**: Ensure parent wrappers include standard forms with correct `name` and `autocomplete` attributes. If legacy support is critical, expose light DOM target hooks.

---

## 3. Keyboard Focus & Modals (Focus-Traps)
* **Finding**: When `<vi-input>` is placed inside a modal that implements focus-trapping (e.g., `<vi-modal>`), the focus trap logic must query shadow roots or use activeElement traversals to correctly identify that the focus is currently inside the input field.
* **Impact**: Standard focus trap libraries that only query `document.activeElement` will get the `<vi-input>` host element rather than the inner focused `<input>`, causing focus to be stolen back to the modal start.
* **Workaround / Resolution**: Custom focus traps must be configured to check `activeElement.shadowRoot.activeElement` recursively to determine if the cursor is in the input.
