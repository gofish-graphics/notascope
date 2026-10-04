# GoFish movies gallery: review notes

GoFish main at 4e271a1fb (dist from `/Users/jmp/gofish-20250316/.claude/worktrees/notascope-main`).
Every spec is an ES module that loads `data/movies.csv` with a top-level `await d3.csv(..., d3.autoType)` and exports the unrendered v3 builder as `export const chart = gf.chart(...).flow(...).mark(...)`. The saver (`notations/savers/gofish_render.mjs`) creates the container and calls `chart.render(root, { w: 400, h: 400 })`, as the Altair saver sets the size. The faceted specs used to render at 800x500 and now get the same 400x400 as the rest.
Renders: `review/gofish/<name>.png`, compared against `reference/movies/<name>.png`.

Some notes apply to every chart, so the table does not repeat them:
- Quantitative tick labels are raw numbers, not formatted (`20000000000`), and dense x ticks overlap.
- Category labels on the x axis are not rotated, so long genre names overlap.
- Categories appear in data order, not sorted. The null category is shown, as in Vega-Lite.

| name | status | workaround or gap |
|---|---|---|
| area_colored | approx | `Year` derived from Date in `derive`; null rating dropped (`dropNulls`) because connectors reject a null color key; `.sort()` needed so the stack order is the same every year; no zero-imputation, so G's 2010→2039 gap draws as a long band |
| area_colored_stacked | approx | as above, plus a hand-computed per-year `Share` column, because `stack({size: field().normalize()})` + `ribbon` throws |
| bar_budget | ok | |
| bar_budget_avg | ok | |
| bar_budget_avg_colored | ok | the inner `stack` dir x adds overlapping MPAA tick labels; empty slots are dropped, not left blank |
| bar_count | ok | count is `field("Title").count()`; there is no field-less count |
| bar_count_100 | ok | `size: field("Title").count().normalize()` works |
| bar_count_colored | ok | |
| bar_count_horizontal | ok | |
| bar_count_ordered | ok | counts pre-aggregated with `d3.rollups`, because `field().sort(by)` only sorts by the sum of a field, not by count |
| bar_count_single | ok | the bar fills the full height (no default band thickness) |
| bar_time | approx | `Year` derived; `scatter` + fixed `rect({w: 2})`; no y axis is drawn |
| box | ok | no box-plot mark: quartiles, whiskers and outliers computed in `derive`, drawn as 4 layered nested charts aligned with `Constraint.align`; stat columns need `field(name, "Production Budget")` measure tags |
| box_colored | ok | as box; outliers drawn as all rows with `opacity` 0/1, because a nested `scatter` over an empty group throws |
| box_faceted | approx (wrong scales) | no wrap facet: `Row` index derived, nested `spread`s. Each panel scales y on its own (`sharedScale` does not fix it), so boxes fill their panel height and there is no y axis. The render is misleading |
| bubble | approx | data-driven `r` uses the x/y position scale (radius ≈ 0px), so the size is set in pixels through a mark callback `(d) => circle({r: d["IMDB Rating"], fill: v(...)})`; no size scale or legend |
| bubble_agg | approx | as bubble; `scatter({by})` gives group means |
| dotplot | ok | `scatter` with a categorical `y` draws no y labels, so this uses `spread(dir y)` + `scatter({by, x})`; rows do not fill the height |
| dotplot_avg | ok | as dotplot |
| error_bar | ok | stderr computed in `derive`; point and bar are two nested charts per genre aligned with `Constraint.align` |
| heatmap_budget_avg | approx | `fill` ignores `field().mean()`, so a mark callback is used, `fill: v(d3.mean(...))`; numeric fill needs `color: gradient("blues")`; empty cells render black (undefined fill) |
| heatmap_count | ok | mark callback `fill: v(d.length)` + `gradient`; empty cells show as 0, not blank |
| histogram | ok | gallery idiom `derive(bin(...))` + `scatter({xMin, xMax})`; d3 default bins (20M), not VL's maxbins=10 (50M) |
| histogram_colored | ok | `spread({by: field().bin()})` + `stack`; ordinal bin axis (labels overlap) |
| histogram_faceted | approx (wrong scales) | wrap facet via derived `Row` + nested `spread`s with explicit thresholds; scales are shared within a row but not across rows; no count axis; first bin is labeled with the data minimum |
| histogram_line | ok | `derive(bin)` + `scatter({xMin, xMax, y})` + `line()`; default curve is monotone, not linear |
| histogram_mean | ok | `field().bin()` + `rect({h: field().mean()})`; ordinal bin axis |
| line | ok | `Year` derived; `scatter({by: field("Year").sort(), y: field().sum()})`; curve is monotone |
| line_colored | approx | null-rating series dropped (`dropNulls`), because connectors reject a null color key |
| ols_separate | ok | no regression transform: OLS done by hand in `derive`, evaluated at 0 and 3e8; null rating dropped, as in VL |
| pie_count | ok | `clock()` + `stack` dir x; `axes: true` (needed for the legend) also draws an angular count axis ring |
| scatter | ok | VL shows hollow points; GoFish draws filled circles |
| scatter_colored | ok | |
| scatter_colored_continuous | ok | needs explicit `color: gradient("blues")` (a numeric field is otherwise categorical); null ratings render black |
| scatter_colored_symbol | approx | there is no shape channel, so `Major Genre` is not encoded; color only |
| scatter_connected | ok | layered `circle` + `.layer(chart().mark(line()))`; curve is monotone |
| scatter_ols_global | ok | `layer([...])` of points + OLS line, wrapped as `gf.chart(movies, {axes: true}).mark(gf.layer([...]))`, because `layer({axes: true})` draws no axes |
| scatter_ols_separate | ok | as above, with per-rating OLS |
| slope | ok | `spread` + `scatter({by, y})` + `line`; needs explicit `spacing: 30` or the x extent collapses to ~0; null rating dropped |
| stripes | approx | `Year` derived; ordinal `spread` (no gaps for missing years); sum through a mark callback `fill: v(d3.sum(...))`; `rect({h: 400})` |

Totals: 40 specs, 29 ok, 11 approx (2 of them render misleadingly: box_faceted, histogram_faceted), 0 missing.

## GoFish gaps and bugs found on main

1. **Default categorical palette has 6 colors and wraps**, so in an 8-level `MPAA Rating`, R/G/NC-17 and null/Open share colors (bar_count_colored, scatter_colored, every chart colored by rating).
2. **A null category in a connector color key throws** ("not constant across the connected group") for `line({stroke})` / `ribbon({fill})`. `rect` fill handles null fine (line_colored, slope, area_*).
3. **`stack({size: field().normalize()})` + `ribbon({fill})` throws** with the same error, even without nulls (area_colored_stacked).
4. **Aggregate field expressions are ignored in `fill`**: `fill: field("x").count()/.mean()` colors by the raw field as a category (heatmap_*). Workaround: a mark callback with `v(...)`.
5. **Numeric fill is categorical unless `color: gradient(...)` is given** (scatter_colored_continuous, heatmaps, stripes). Undefined or null values render black.
6. **Data-driven `circle({r})` inside `scatter` is scaled by the position measure**, so radii are about 1e-6 px. A function accessor does the same, and `literal()` inside an accessor gives NaN. There is no independent size scale or legend (bubble*).
7. **There is no count without a field**: count is spelled `field("Title").count()`. `field().sort()` cannot sort by count (bar_count_ordered).
8. **`scatter` with a categorical axis draws no category labels** (dotplot first attempt).
9. **`spread` of zero-width children (scatter + line) collapses** unless `spacing` is given (slope). The `line({h})` blank-fusion in a `spread` also draws the line at the center of the blank, so at h/2 (histogram_line first attempt).
10. **No wrap facet.** Nested `spread`s scale each row (or each panel) on its own even with `sharedScale: true`, and `table` with derived row/col breaks rect heights (histogram_faceted, box_faceted).
11. **A nested `scatter` over an empty group throws** "Scatter operator expects at least one child" (box_colored outliers).
12. **Stacked areas do not impute zeros** for missing (x, series) pairs, and the stack order follows each group's row order unless `by` is sorted (area_*).
13. **`scatter` + `rect({h})` (bar_time) draws no y axis.**
14. **`layer({axes: true})` over plain charts draws no axes**; wrapping the layer as the mark of `chart(data, {axes: true})` does (scatter_ols_*).
15. **No number formatting on axes**, and dense ticks overlap. Category labels are not auto-rotated by default (`labelAngle: "auto"` exists but is opt-in). Seen on all charts.
16. **Missing statistical features**, all done by hand in plain JS: no temporal units, no regression, no box-plot statistics, no stderr.
