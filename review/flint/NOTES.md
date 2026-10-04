# Flint (flint-chart) movies gallery notes

- Version: flint-chart 0.5.1 (latest on npm, same as `packages/flint-js` in the clone at 683d5de).
  Rendered with flint-chart-mcp 0.5.1's public `flint-chart-mcp/render` API (Flint's own host renderer: Vega-Lite backend, resvg PNG).
- Saver: `notations/savers/flint.sh <spec> <out>` runs `node notations/savers/flint/render.mjs <spec> <out>.png`
  (deps pinned in `notations/savers/flint/package.json`; run `npm install` there once). It sets `chart_spec.baseSize` to 400x400 if the spec has none.
  Set `FLINT_DUMP_VL=<path>` to also write the compiled Vega-Lite.
- Data: specs use `"data": {"url": "data/movies.csv"}`, the binding Flint documents for local files. The host
  (flint-chart-mcp `resolveDataSource`) reads the CSV into rows, relative to the cwd (notascope root). Nothing is injected or precomputed.
  The preprocessor strips only inline `data.values`, so the url stays, same as Vega-Lite.
- Style: object-form encodings (`{"field": ...}`), plus a `semantic_types` entry for every encoded field, as in the agent skill's worked examples and checklist.
  No titles, themes, or styling. Aggregation uses the `aggregate` key on encodings (count/sum/mean).
- `vl_reference/`: Vega-Lite renders of `galleries/movies/vega-lite/*.vl`, regenerated because `reference/movies/*.png` are blank
  (the CSV did not load when they were rendered).

| name | template | status | note |
|---|---|---|---|
| area_colored | - | missing | needs year bucketing of Release Date (no timeUnit in Flint; skill says do time buckets before Flint) |
| area_colored_stacked | - | missing | same (year bucketing) |
| bar_budget | Bar Chart | ok | |
| bar_budget_avg | Bar Chart | ok | |
| bar_budget_avg_colored | Grouped Bar Chart | ok | rating on `group` channel |
| bar_count | Bar Chart | ok | |
| bar_count_100 | Stacked Bar Chart | ok | `stackMode: normalize`. Flint bug: null ratings are left out of the color domain but still counted, so bars stop short of 100% |
| bar_count_colored | Stacked Bar Chart | ok | same null-rating issue: null segments are not drawn |
| bar_count_horizontal | Bar Chart | ok | |
| bar_count_ordered | Bar Chart | ok | `sortBy: y, sortOrder: descending` |
| bar_count_single | - | missing | single stacked bar needs a category axis; Bar/Stacked Bar require `y`, and Flint has no constant field |
| bar_time | - | missing | year bucketing |
| box | Boxplot | ok | Flint picks a log y scale on its own |
| box_colored | Boxplot | ok | color dodges within each genre |
| box_faceted | Boxplot | ok | `column` + `chartProperties.facetColumns: 5` (VL `columns: 5`) |
| bubble | Scatter Plot | ok | Flint picks log x/y |
| bubble_agg | Scatter Plot | ok | mean on x, y, size; grouped by color |
| dotplot | Scatter Plot | ok | count on x, genre on y |
| dotplot_avg | Scatter Plot | ok | |
| error_bar | - | missing | no error-bar/stderr template; Ranged Dot Plot needs precomputed bounds |
| heatmap_budget_avg | Heatmap | ok | |
| heatmap_count | Heatmap | ok | |
| histogram | Histogram | ok | compiles to VL `bin` |
| histogram_colored | Histogram | ok | |
| histogram_faceted | Histogram | ok | `facetColumns: 5`; without it Flint drops 5 of 13 genres to fit the canvas |
| histogram_line | - | missing | only Histogram bins; Line Chart has no binning |
| histogram_mean | - | missing | Histogram counts only; does not accept a `y` measure |
| line | - | missing | year bucketing |
| line_colored | - | missing | year bucketing |
| ols_separate | Regression | approx | per-rating fits, but the template always draws the scatter points too |
| pie_count | Pie Chart | ok | count on `size` |
| scatter | Scatter Plot | ok | log x/y chosen by Flint |
| scatter_colored | Scatter Plot | ok | |
| scatter_colored_continuous | Scatter Plot | ok | |
| scatter_colored_symbol | Scatter Plot | ok | `shape` channel (listed in reference-vegalite.md, not in the skill's table) |
| scatter_connected | - | missing | needs yearly sums ordered by year (year bucketing) |
| scatter_ols_global | Regression | approx | a color field always splits the fit, so the global fit is drawn with uncolored points |
| scatter_ols_separate | Regression | ok | linear fits drawn on Flint's auto log axes |
| slope | Line Chart | ok | nominal x, mean y, color |
| stripes | - | missing | year bucketing |

Totals: 27 ok, 2 approx, 11 missing (29 specs). Templates used: 10 (Bar, Stacked Bar, Grouped Bar, Boxplot, Scatter Plot, Heatmap, Histogram, Regression, Pie, Line).

## What Flint can't express
- Time bucketing (timeUnit year): 7 charts. Flint aggregates on the raw date, and the skill tells users to bucket time before Flint.
- Binning anywhere except the Histogram template, and any binned measure other than count (histogram_line, histogram_mean).
- Error bars and statistical intervals (error_bar).
- Constant or absent category axes (bar_count_single).
- Regression decoupled from the color channel or the points layer (only approx versions).
- Other differences: Flint chooses log or symlog scales for skewed Amount fields on its own, keeps categories in data order instead of sorting them alphabetically, and has a null-category bug in color-stacked bars.
