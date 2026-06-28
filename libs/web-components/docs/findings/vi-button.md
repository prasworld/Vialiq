# Pending Edge Cases & Findings: `vi-button`

This document details the discovered edge cases, browser quirks, and potential future improvements for the `<vi-button>` web component.

---

## 1. Dynamic Slotted Content Layout Shift
* **Finding**: When a label text or icon is dynamically updated inside a slotted container, the button's size recalculation in a flex layout might cause subtle visual shifts.
* **Impact**: Potential layout shifts if parent components use tight static dimensions.
* **Workaround / Resolution**: Flux UI styles apply standard min-width attributes to ensure buttons retain stable dimensions during minor text variations.

---

## 2. Form Submission Behavior
* **Finding**: When placed inside a `<form>`, `vi-button` defaults to `type="button"`. This prevents accidental form submissions but differs from native `<button>` which defaults to `type="submit"`.
* **Impact**: Consumers must explicitly add `type="submit"` if they expect form submission on click.
* **Workaround / Resolution**: This is standard for modern component libraries (like Shoelace) to avoid unintended submission events.
