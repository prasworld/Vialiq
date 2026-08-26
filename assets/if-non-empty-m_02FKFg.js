import { o } from './if-defined-Biv9U5FK.js';

/**
 * ifNonEmpty — conditional attribute directive
 *
 * A wrapper around Lit's `ifDefined` that additionally removes the attribute
 * when the value is an empty string. Use this for every optional string
 * attribute on inner native elements where `""` and "absent" have different
 * meaning for browsers and screen readers.
 *
 * Problem with raw `ifDefined`:
 *   - `ifDefined(undefined)` → removes the attribute          ✅
 *   - `ifDefined(null)`      → removes the attribute          ✅
 *   - `ifDefined('')`        → sets attribute to ""            ❌
 *
 * With `ifNonEmpty`:
 *   - `ifNonEmpty(undefined)` → removes the attribute         ✅
 *   - `ifNonEmpty(null)`      → removes the attribute         ✅
 *   - `ifNonEmpty('')`        → removes the attribute         ✅
 *   - `ifNonEmpty('hello')`   → sets attribute to "hello"     ✅
 *
 * Why it matters — real screen reader / browser bugs caused by `=""`:
 *   - `placeholder=""`   → JAWS/NVDA still announce it as an empty placeholder
 *   - `aria-label=""`    → NVDA reads "blank" instead of deriving the name elsewhere
 *   - `aria-describedby=""`→ browsers may still look for id="" element
 *   - `title=""`         → browsers show an empty tooltip on hover in some engines
 *
 * ---
 *
 * USAGE
 *
 * Import in any shadow template that has optional string attributes:
 *
 *   import { ifNonEmpty } from '../base/if-non-empty.js';
 *
 * In the template:
 *
 *   // ✅ Use ifNonEmpty for optional string attributes on inner native elements
 *   <input
 *     placeholder=${ifNonEmpty(this.placeholder)}
 *     aria-label=${ifNonEmpty(this.label)}
 *     aria-describedby=${ifNonEmpty(this._descriptionId)}
 *   />
 *
 *   // ❌ Do NOT use for boolean attributes — Lit has ?attr=${bool} for that
 *   // ❌ Do NOT use for property bindings — Lit has .prop=${val} for that
 *   // ❌ Do NOT use for event bindings — Lit has @event=${handler} for that
 *
 * ---
 *
 * WHEN TO USE vs NOT USE
 *
 *   Use ifNonEmpty when:
 *     - The attribute is optional (component has a prop that defaults to '')
 *     - The inner native element is a standard HTML element (input, button, a, etc.)
 *     - The attribute has accessibility or UI meaning when absent vs present
 *
 *   Skip ifNonEmpty when:
 *     - The attribute is always required (e.g. type="button" is never absent)
 *     - You need the attribute to literally be "" (rare, document when intentional)
 *     - The binding is to a custom element property — use .prop=${val} instead
 */ const ifNonEmpty = (value)=>o(value === '' ? undefined : value ?? undefined);

export { ifNonEmpty as i };
