# Charts & Data Visualisation — Architecture Plan

**Package:** `@vialiq/web-components/charts`  
**Namespace:** `vi-*-chart`, `vi-sparkline`  
**Status:** 🔲 Planned — Phase 4  
**Rendering engine:** [D3.js v7](https://d3js.org/) (MIT, TypeScript-native)  
**Flux UI base:** `libs/flux-ui/components/_chart-base.scss`

---

## Why D3?

| Criterion | D3 v7 | Chart.js v4 | Vega-Lite |
|-----------|-------|------------|-----------|
| SVG output (CSS parts) | ✅ Full control | ❌ Canvas | ✅ |
| Custom clinical charts | ✅ Any shape possible | ⚠️ Limited | ⚠️ Hard to customise |
| TypeScript-native | ✅ v7+ | ✅ | ⚠️ JSON schema |
| Tree-shaking | ✅ Per-module | ❌ Monolithic | ❌ Monolithic |
| Bundle impact | ~15 KB (only used modules) | ~200 KB | ~400 KB |
| Lit integration | ✅ Ref → SVG selection | ✅ | ⚠️ Custom element wrapper |
| Accessibility (SVG) | ✅ native `<title>`, `<desc>` | ❌ Canvas ARIA | ✅ |

---

## Base Architecture

### `ViChartElement` (abstract base class)

All chart components extend this class:

```typescript
// libs/web-components/src/charts/base/vi-chart-element.ts
export abstract class ViChartElement<TDatum = unknown> extends ViElement {

  // Public API (all charts inherit)
  @property() accessor data: TDatum[] = [];
  @property({ type: Number }) accessor width: number | undefined;
  @property({ type: Number }) accessor height = 320;
  @property({ type: Object }) accessor margin: Partial<ChartMargin> = {};
  @property({ type: Array }) accessor colors: string[] = [];
  @property({ type: Boolean }) accessor animate = true;
  @property({ type: Boolean }) accessor loading = false;
  @property({ type: Boolean }) accessor empty = false;
  @property() accessor emptyMessage = 'No data available';
  @property({ type: Boolean }) accessor accessible = false;

  // Internal state
  @state() private accessor _computedWidth = 0;
  @state() private accessor _computedHeight = 0;

  // D3 selection of root SVG — set in firstUpdated
  protected _svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  protected _g!: d3.Selection<SVGGElement, unknown, null, undefined>;  // inner group

  protected _resizeObserver!: ResizeObserver;
  protected _margin: Required<ChartMargin> = { top: 16, right: 16, bottom: 40, left: 48 };

  override firstUpdated() {
    this._svg = d3.select(this.shadowRoot!.querySelector('svg')!);
    this._g = this._svg.append('g').attr('transform', `translate(${this._margin.left},${this._margin.top})`);
    this._resizeObserver = new ResizeObserver(([entry]) => {
      this._computedWidth = entry.contentRect.width;
      this._renderChart();
    });
    this._resizeObserver.observe(this);
    this._renderChart();
  }

  override updated(changed: Map<string, unknown>) {
    if (changed.has('data') || changed.has('colors') || changed.has('animate')) {
      this._renderChart();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver.disconnect();
  }

  // Subclasses implement full D3 draw logic
  protected abstract _renderChart(): void;

  // Shared helpers
  protected _getColor(index: number): string {
    const defaults = this._getCSSVars();
    return this.colors[index] ?? defaults[index] ?? '#999';
  }

  protected _getCSSVars(): string[] {
    const style = getComputedStyle(this);
    return Array.from({ length: 8 }, (_, i) =>
      style.getPropertyValue(`--vi-chart-series-${i + 1}`).trim()
    ).filter(Boolean);
  }

  // Export helpers
  toSVGString(): string { /* serialise shadow SVG */ }
  async toPNG(scale = 2): Promise<Blob> { /* canvas rasterise */ }
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
```

---

## Shared CSS Tokens

All charts share these CSS custom properties, defined once in `_chart-base.scss`:

```css
:host {
  /* Canvas */
  --vi-chart-bg: transparent;
  --vi-chart-border-radius: 0;

  /* Axis */
  --vi-chart-axis-color: var(--vi-color-grey-400);
  --vi-chart-axis-stroke-width: 1px;
  --vi-chart-grid-color: var(--vi-color-grey-100);
  --vi-chart-grid-dash: 4 4;

  /* Typography */
  --vi-chart-tick-font-size: var(--vi-font-size-xs);
  --vi-chart-tick-color: var(--vi-color-grey-500);
  --vi-chart-label-font-size: var(--vi-font-size-sm);
  --vi-chart-label-color: var(--vi-color-grey-700);
  --vi-chart-title-font-size: var(--vi-font-size-base);
  --vi-chart-title-color: var(--vi-color-grey-900);

  /* Series colours (WCAG-AA contrast, colour-blind safe) */
  --vi-chart-series-1: var(--vi-color-primary, #3676d0);    /* blue */
  --vi-chart-series-2: var(--vi-color-success, #16a34a);    /* green */
  --vi-chart-series-3: var(--vi-color-warning, #d97706);    /* amber */
  --vi-chart-series-4: var(--vi-color-error, #dc2626);      /* red */
  --vi-chart-series-5: #7c3aed;                              /* purple */
  --vi-chart-series-6: #0891b2;                              /* cyan */
  --vi-chart-series-7: #db2777;                              /* pink */
  --vi-chart-series-8: #65a30d;                              /* lime */

  /* Tooltip */
  --vi-chart-tooltip-bg: var(--vi-color-grey-900);
  --vi-chart-tooltip-color: white;
  --vi-chart-tooltip-border-radius: 4px;
  --vi-chart-tooltip-padding: 6px 10px;
  --vi-chart-tooltip-font-size: var(--vi-font-size-xs);

  /* Animation */
  --vi-chart-animation-duration: 500ms;
  --vi-chart-animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Chart Component Specifications

### `vi-bar-chart`

```
Clinical use: AE frequency by term, AE grade distribution, enrolled vs screened
D3 modules: d3-scale, d3-axis, d3-shape, d3-selection, d3-transition
```

**Props:**
- `data: BarDatum[]` — `{ label: string; values: Record<string, number> }`
- `keys: string[]` — series keys (maps to stacked or grouped bars)
- `orientation: 'vertical' | 'horizontal'` — default `'vertical'`
- `stacked: boolean` — default `false` (grouped)
- `showValues: boolean` — show value labels on bars
- `showLegend: boolean` — show legend below/right

**Features:**
- Grouped and stacked bar modes
- Horizontal orientation for long category labels (AE term names)
- Colour-by-series; WCAG contrast checked at build time
- `d3.transition()` enter animations (bars grow from baseline)
- Null/zero values shown as empty bars (not hidden)

---

### `vi-line-chart`

```
Clinical use: Lab value over time, vital signs trend, body weight change
D3 modules: d3-scale, d3-axis, d3-line, d3-shape, d3-selection, d3-transition
```

**Props:**
- `data: LineSeries[]` — `{ id: string; label: string; data: {x: Date|number; y: number}[] }[]`
- `xType: 'time' | 'linear' | 'ordinal'` — x-axis scale type
- `showDots: boolean` — data point markers
- `dotRadius: number` — dot size (default 4)
- `smooth: boolean` — use `d3.curveCatmullRom` (default: straight lines)
- `showArea: boolean` — fill area under line (gradient, 20% opacity)
- `referenceLines: ReferenceLine[]` — horizontal thresholds (normal range)
- `nullStrategy: 'skip' | 'connect' | 'gap'` — how to handle missing data

**Features:**
- Multi-series; up to 8 series (limited by colour palette)
- Normal range bands (min/max reference lines with fill)
- Zoom: optional `d3-zoom` brush for time range selection
- Click/hover on dots: `vialiq-datum-hover` event with datum + position

---

### `vi-scatter-chart`

```
Clinical use: PK/PD correlation, outlier detection, covariate analysis
D3 modules: d3-scale, d3-axis, d3-selection
```

**Props:**
- `data: ScatterDatum[]` — `{ x: number; y: number; label?: string; group?: string; size?: number }`
- `xLabel: string`, `yLabel: string`
- `sizeBy: string` — optional field for bubble size
- `colorBy: string` — optional field for point colour
- `showRegressionLine: boolean` — Pearson linear regression overlay
- `quadrants: boolean` — cross-hair median lines dividing into quadrants

---

### `vi-waterfall-chart`

```
Clinical use: RECIST tumour response — % change from baseline per subject
D3 modules: d3-scale, d3-axis, d3-selection
```

**Props:**
- `data: WaterfallDatum[]` — `{ subjectId: string; change: number; response?: string }`
- `sortOrder: 'ascending' | 'descending' | 'none'`
- `thresholds: { pr: number; pd: number }` — RECIST cut lines (default -30/+20)
- `showThresholdLabels: boolean`

**Features:**
- Bars coloured by response category (PR/SD/PD) using RECIST colour convention
- Threshold lines at -30% (PR) and +20% (PD) with labels
- Subject ID labels on x-axis (rotated 45°)
- Hover tooltip: subject ID, % change, response category

---

### `vi-km-chart`

```
Clinical use: Kaplan-Meier overall survival (OS), progression-free survival (PFS)
D3 modules: d3-scale, d3-axis, d3-line, d3-selection
```

**Props:**
- `data: KMSeries[]` — `{ id: string; label: string; data: {time: number; survival: number; censored?: boolean}[] }[]`
- `showConfidenceInterval: boolean` — 95% CI bands
- `showCensorTicks: boolean` — vertical tick marks at censored events
- `showAtRiskTable: boolean` — subjects-at-risk table below chart
- `xLabel: string` — axis label (default "Time (months)")
- `yLabel: string` — axis label (default "Survival probability")

**Features:**
- Step function (no smoothing — survival probability is a step curve)
- Censored events shown as `+` tick marks on the curve
- At-risk count table below chart (aligned to x-axis ticks)
- Log-rank p-value annotation (input as prop; not calculated client-side)

---

### `vi-heatmap-chart`

```
Clinical use: AE incidence by term × grade, covariate matrix
D3 modules: d3-scale, d3-scale-chromatic, d3-axis, d3-selection
```

**Props:**
- `data: HeatmapDatum[]` — `{ x: string; y: string; value: number }`
- `colorScheme: 'sequential' | 'diverging'`
- `colorRange: [string, string]` — custom low/high colours
- `showValues: boolean` — show value text in cells
- `cellPadding: number` — gap between cells

---

### `vi-swimmer-chart`

```
Clinical use: Subject treatment duration, on/off study events timeline
D3 modules: d3-scale-band, d3-axis-top, d3-selection, d3-shape
```

**Props:**
- `data: SwimmerSeries[]` — per-subject: start/end time + event markers
- `events: SwimmerEvent[]` — `{ subjectId: string; time: number; type: string; icon?: string }`
- `sortBy: 'duration' | 'start' | 'id'`
- `showEventLegend: boolean`

---

### `vi-sparkline`

```
Clinical use: Inline lab trend in data grids, subject listing value indicators
D3 modules: d3-line, d3-scale (minimal)
```

Designed to be embedded inside table cells or list items:

```html
<td>
  <vi-sparkline
    [data]="subject.weightTrend"
    style="width: 80px; height: 24px"
    variant="line"
  ></vi-sparkline>
</td>
```

**Props:**
- `data: number[]`
- `variant: 'line' | 'bar' | 'area'`
- `color: string` — single colour
- `strokeWidth: number`

---

## Shared `vi-chart-tooltip`

An internal shared tooltip component (not intended for direct use):

```
vi-chart-tooltip (absolute positioned in chart shadow DOM)
├── div.chart-tooltip
│   ├── span.tooltip-title
│   └── div.tooltip-rows
│       └── div.tooltip-row × N
│           ├── span.tooltip-swatch (colour)
│           └── span.tooltip-value
```

Shown by charts on `mousemove`; positioned via `transform: translate(x, y)` relative to SVG bounds.

---

## Accessibility

Every chart component supports:

1. **`<title>` and `<desc>`** in SVG root:
   ```html
   <svg>
     <title>AE Grade Distribution — TRIAL-PRIME, Visit 1</title>
     <desc>Bar chart showing adverse event grades 1 through 5. Grade 2 is most common with 34 events.</desc>
   </svg>
   ```

2. **`accessible` prop** — when true, renders a companion `<table>` (visually hidden by default):
   ```html
   <table class="sr-only" aria-label="Chart data: AE Grade Distribution">
     <thead><tr><th>Grade</th><th>Count</th></tr></thead>
     <tbody>
       <tr><td>Grade 1</td><td>12</td></tr>
       ...
     </tbody>
   </table>
   ```
   A "View data table" toggle button shows/hides the table visually.

3. **Colour-blind safe palette** — series colours tested against deuteranopia and protanopia simulation. Pattern fills available as an opt-in alternative (`usePatterns: true`).

4. **`prefers-reduced-motion`** — all `d3.transition()` durations set to `0ms` when reduced motion is preferred.

5. **`role="img"`** on root `<svg>` when not interactive; `role="group"` when interactive (hoverable data points).

---

## Bundle Strategy

Charts are a **separate entry point** — not included in the main `@vialiq/web-components` barrel:

```typescript
// Consumer imports only what they use
import '@vialiq/web-components/charts/vi-bar-chart';
import '@vialiq/web-components/charts/vi-line-chart';

// Or import the full charts bundle
import '@vialiq/web-components/charts';
```

D3 modules are shared (peer dependency or bundled once) — tree-shaken per component.

---

## Testing Strategy

- **Unit:** D3 render output tested via `jsdom` + `d3` in Node (SVG DOM); snapshots in vitest
- **Visual:** Storybook stories with realistic mock EDC datasets; Chromatic snapshot on each PR
- **Interaction:** `@testing-library/dom` for tooltip hover, click events
- **Accessibility:** `axe-core` run on each story in CI

---

## Development Roadmap

| Phase | Components | Target |
|-------|-----------|--------|
| 4.1 | `vi-bar-chart`, `vi-line-chart`, `vi-sparkline` | Highest utility; core EDC reporting |
| 4.2 | `vi-scatter-chart`, `vi-heatmap-chart` | Safety review dashboards |
| 4.3 | `vi-waterfall-chart`, `vi-km-chart` | Oncology-specific; requires trial data |
| 4.4 | `vi-swimmer-chart` | Complex; timeline specialist |

---

## Related Docs

- [PHASE-PLAN.md](../PHASE-PLAN.md) — master phase plan with architecture rules
- [`vi-skeleton`](./components/vi-skeleton.md) — loading placeholder for charts (`variant="rect"`)
- [`vi-spinner`](./components/vi-spinner.md) — per-chart loading spinner
- [`vi-tooltip`](./components/vi-tooltip.md) — host-level tooltip (different from internal chart tooltip)
