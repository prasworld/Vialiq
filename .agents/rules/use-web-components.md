---
description: Prefer web components (vi-*) over native HTML elements in templates.
---

# Use Web Components

When modifying or generating HTML templates in this repository, **ALWAYS prefer `vi-` web components** over native HTML elements where a web component exists.

- Use `<vi-label>` instead of `<label>`
- Use `<vi-input>` instead of `<input type="text">`
- Use `<vi-textarea>` instead of `<textarea>`
- Use `<vi-select>` instead of `<select>`
- Use `<vi-switch>` instead of `<input type="checkbox">`
- Use `<vi-button>` instead of `<button>`

### Label Associations
When using `<vi-label>`, ensure that:
1. You bind the `for` attribute using `[attr.for]="'id'"` rather than `[for]="'id'"` to ensure Angular correctly sets the attribute on the custom element (since Angular natively maps `for` to `htmlFor`).
2. The corresponding input component (e.g. `<vi-input>`) has a matching `id="..."` or `[id]="..."`.
