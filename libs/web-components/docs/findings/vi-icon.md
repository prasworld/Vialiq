# Pending Edge Cases & Findings: `vi-icon`

This document details the discovered edge cases, browser quirks, and potential future improvements for the `<vi-icon>` web component.

---

## 1. Icon Pre-registration vs Lazy Loading
* **Finding**: The current icon registry pattern requires calling `registerIcons()` at application bootstrap. If a developer uses a `<vi-icon>` with a name before it is registered, the component renders empty.
* **Impact**: Silent empty rendering during developer mistakes.
* **Workaround / Resolution**: Development mode warning logs are generated when an unregistered icon name is requested.

---

## 2. SVG Color Custom Property Propagation
* **Finding**: Svg icon files from Lucide set `stroke="currentColor"`. When styling `<vi-icon>`, CSS selectors setting `color` on the parent container successfully flow into the SVGs via shadow inheritance.
* **Impact**: Clean styling, but styling directly from host custom properties requires inheritance configuration in SVGs.
* **Workaround / Resolution**: Standardized styling cascade is defined in `vi-icon.scss`.
