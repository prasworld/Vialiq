# `vi-partial-date` — SUPERSEDED

> **This component is no longer a separate element.**
>
> Partial date support is implemented as a **configuration of `vi-date-picker`** via the `partial`
> attribute. See [`vi-date-picker.md`](./vi-date-picker.md#partial-date-mode) for the full spec.

## Migration

```html
<!-- Before (never shipped — spec only) -->
<vi-partial-date name="dob" mode="full"></vi-partial-date>

<!-- After — use vi-date-picker with partial=true -->
<vi-date-picker name="dob" partial mode="full"></vi-date-picker>
```

All types (`PartialDateValue`, `PartialDateChangeDetail`) are exported from
`@vialiq/web-components/date-picker`.
