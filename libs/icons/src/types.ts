/**
 * SvgIconDef — the shape of every icon in the @vialiq/icons library.
 * An icon is a plain data object: a stable name and the raw SVG string.
 */
export interface SvgIconDef {
  /** Unique identifier used as the `name` attribute on <vi-icon>. */
  name: string;
  /** Raw SVG markup string — no width/height attributes, uses currentColor. */
  data: string;
}
