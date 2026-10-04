# Movies gallery metrics

Definitions follow Kruchten et al. (VIS 2023), Sec. 4. Length = bytes of the preprocessed spec. Sprawl = median pairwise compression distance (CD, lz4). Brackets are 95% intervals over 1,000 bootstrap resamples of specs. Vocabulary intervals are bootstrap vocabulary sizes, which are smaller than the full-gallery value because a resample contains about 63% of the distinct specs.

## All specs per notation

| notation | specs | median length (B) | vocabulary | sprawl (CD) | sprawl (NCD) | used in 1 spec | used in all specs |
|---|---:|---:|---:|---:|---:|---:|---:|
| altair | 40 | 185 [168, 192] | 65 (boot 51-64) | 68.5 [61.0, 77.0] | 319 | 12 (18%) | 17 (26%) |
| bokeh | 40 | 441 [366, 504] | 242 (boot 171-236) | 276.0 [235.0, 325.5] | 644 | 76 (31%) | 19 (8%) |
| flint | 29 | 251 [232, 289] | 49 (boot 39-48) | 93.2 [84.5, 103.0] | 384 | 11 (22%) | 12 (24%) |
| ggplot2 | 40 | 158 [141, 177] | 79 (boot 56-76) | 85.0 [76.0, 95.0] | 417 | 23 (29%) | 12 (15%) |
| gofish | 40 | 322 [293, 348] | 185 (boot 136-183) | 191.8 [132.5, 292.0] | 484 | 30 (16%) | 29 (16%) |
| matplotlib | 40 | 376 [320, 398] | 190 (boot 142-184) | 194.0 [169.0, 252.0] | 557 | 45 (24%) | 18 (9%) |
| pandas | 40 | 204 [156, 341] | 183 (boot 135-177) | 211.8 [155.0, 252.8] | 662 | 47 (26%) | 12 (7%) |
| plotly_express | 40 | 184 [164, 208] | 97 (boot 64-92) | 92.0 [76.0, 118.2] | 419 | 41 (42%) | 16 (16%) |
| plotly_go | 40 | 282 [229, 337] | 169 (boot 115-164) | 174.0 [147.0, 241.0] | 545 | 46 (27%) | 15 (9%) |
| seaborn | 40 | 184 [167, 190] | 92 (boot 69-90) | 86.2 [75.5, 106.5] | 404 | 24 (26%) | 12 (13%) |
| seaborn_obj | 40 | 199 [178, 211] | 95 (boot 68-91) | 93.5 [78.0, 107.0] | 408 | 33 (35%) | 12 (13%) |
| vega-lite | 40 | 230 [212, 264] | 63 (boot 52-62) | 84.0 [75.5, 94.5] | 334 | 9 (14%) | 12 (19%) |

## Paired: 29 charts every notation has

| notation | specs | median length (B) | vocabulary | sprawl (CD) | sprawl (NCD) | used in 1 spec | used in all specs |
|---|---:|---:|---:|---:|---:|---:|---:|
| altair | 29 | 185 [166, 205] | 56 (boot 44-55) | 65.5 [58.5, 75.5] | 303 | 11 (20%) | 17 (30%) |
| bokeh | 29 | 494 [306, 587] | 206 (boot 147-203) | 301.2 [234.5, 343.0] | 636 | 53 (26%) | 19 (9%) |
| flint | 29 | 251 [232, 289] | 49 (boot 39-48) | 93.2 [84.5, 103.0] | 384 | 11 (22%) | 12 (24%) |
| ggplot2 | 29 | 154 [131, 176] | 64 (boot 45-62) | 76.0 [65.5, 85.0] | 388 | 23 (36%) | 12 (19%) |
| gofish | 29 | 313 [289, 332] | 163 (boot 114-163) | 139.0 [114.0, 338.5] | 424 | 18 (11%) | 29 (18%) |
| matplotlib | 29 | 358 [241, 416] | 161 (boot 106-158) | 200.8 [169.0, 297.5] | 561 | 31 (19%) | 18 (11%) |
| pandas | 29 | 187 [140, 401] | 157 (boot 96-154) | 233.2 [108.2, 333.0] | 668 | 34 (22%) | 12 (8%) |
| plotly_express | 29 | 171 [152, 189] | 73 (boot 49-71) | 76.5 [62.5, 86.5] | 363 | 29 (40%) | 16 (22%) |
| plotly_go | 29 | 259 [193, 324] | 145 (boot 92-142) | 160.5 [129.0, 305.0] | 519 | 41 (28%) | 15 (10%) |
| seaborn | 29 | 177 [160, 185] | 68 (boot 54-66) | 73.8 [64.5, 82.0] | 355 | 16 (24%) | 12 (18%) |
| seaborn_obj | 29 | 181 [171, 203] | 73 (boot 53-71) | 77.5 [66.0, 89.0] | 360 | 23 (32%) | 12 (16%) |
| vega-lite | 29 | 233 [207, 268] | 56 (boot 43-55) | 77.8 [65.5, 90.5] | 311 | 9 (16%) | 12 (21%) |

## Chart expression only: all specs per notation

Chart-expression tokens are the tokens.pqt tokens of a spec minus: (1) import statements (Python `import`/`from`, JS `import`) and R `library(...)` calls; (2) the whole top-level statement that contains the token `"data/movies.csv"` (the data load); (3) the result binding: GoFish `export default`, and in Python the `<var> =` prefix of any top-level statement whose sole target is the variable the notation's saver reads (altair `chart`, bokeh `p`, matplotlib/pandas/seaborn `ax`, plotly `fig`, seaborn_obj `p`; a tuple target such as `fig, ax = plt.subplots()` is kept); (4) in Vega-Lite and Flint JSON, the top-level `"$schema"` and `"data"` members with their separating comma. Top-level statements are found from the preprocessed source: column-0 lines for Python and R, top-level `;` for the minified JS. Everything else stays, including helper functions and data-wrangling statements outside the load statement. Caveat: in the few specs whose load statement also wrangles (`df2 = pd.read_csv(...).groupby(...)`, `read_csv(...) |> group_by(...)`), that wrangling is dropped with the load.

Token counts count every token occurrence; vocabulary counts unique tokens.

| notation | specs | median tokens (all) | median tokens (chart expression) | chart-expression vocabulary | used in 1 spec |
|---|---:|---:|---:|---:|---:|
| altair | 40 | 43 | 25 | 58 | 12 (21%) |
| bokeh | 40 | 115 | 81 | 228 | 75 (33%) |
| flint | 29 | 57 | 49 | 46 | 11 (24%) |
| ggplot2 | 40 | 36 | 26 | 62 | 17 (27%) |
| gofish | 40 | 104 | 65 | 174 | 30 (17%) |
| matplotlib | 40 | 91 | 68 | 179 | 44 (25%) |
| pandas | 40 | 56 | 39 | 173 | 47 (27%) |
| plotly_express | 40 | 42 | 22 | 85 | 41 (48%) |
| plotly_go | 40 | 70 | 50 | 156 | 46 (29%) |
| seaborn | 40 | 44 | 24 | 84 | 25 (30%) |
| seaborn_obj | 40 | 54 | 34 | 86 | 34 (40%) |
| vega-lite | 40 | 49 | 37 | 58 | 9 (16%) |

## Chart expression only: paired, 29 charts

Chart-expression tokens are the tokens.pqt tokens of a spec minus: (1) import statements (Python `import`/`from`, JS `import`) and R `library(...)` calls; (2) the whole top-level statement that contains the token `"data/movies.csv"` (the data load); (3) the result binding: GoFish `export default`, and in Python the `<var> =` prefix of any top-level statement whose sole target is the variable the notation's saver reads (altair `chart`, bokeh `p`, matplotlib/pandas/seaborn `ax`, plotly `fig`, seaborn_obj `p`; a tuple target such as `fig, ax = plt.subplots()` is kept); (4) in Vega-Lite and Flint JSON, the top-level `"$schema"` and `"data"` members with their separating comma. Top-level statements are found from the preprocessed source: column-0 lines for Python and R, top-level `;` for the minified JS. Everything else stays, including helper functions and data-wrangling statements outside the load statement. Caveat: in the few specs whose load statement also wrangles (`df2 = pd.read_csv(...).groupby(...)`, `read_csv(...) |> group_by(...)`), that wrangling is dropped with the load.

Token counts count every token occurrence; vocabulary counts unique tokens.

| notation | specs | median tokens (all) | median tokens (chart expression) | chart-expression vocabulary | used in 1 spec |
|---|---:|---:|---:|---:|---:|
| altair | 29 | 43 | 25 | 49 | 11 (22%) |
| bokeh | 29 | 120 | 94 | 194 | 53 (27%) |
| flint | 29 | 57 | 49 | 46 | 11 (24%) |
| ggplot2 | 29 | 32 | 22 | 51 | 15 (29%) |
| gofish | 29 | 102 | 63 | 152 | 18 (12%) |
| matplotlib | 29 | 90 | 72 | 152 | 31 (20%) |
| pandas | 29 | 45 | 31 | 148 | 34 (23%) |
| plotly_express | 29 | 38 | 18 | 61 | 27 (44%) |
| plotly_go | 29 | 66 | 46 | 133 | 41 (31%) |
| seaborn | 29 | 40 | 22 | 60 | 16 (27%) |
| seaborn_obj | 29 | 50 | 30 | 64 | 23 (36%) |
| vega-lite | 29 | 49 | 37 | 51 | 9 (18%) |

## Paper reference values (9 notations)

Vocabulary and tokens used once / in all 40 specs are read from Fig. 5. Length and sprawl are approximate centers of the Fig. 3 bootstrap regions (read off the plot, about +-15).

| notation | vocab (ours / paper) | used 1x (ours / paper) | used 40x (ours / paper) | median length (ours / ~paper) | sprawl CD (ours / ~paper) |
|---|---:|---:|---:|---:|---:|
| altair | 65 / 65 | 12 / 12 | 17 / 17 | 185 / 185 | 68 / 75 |
| ggplot2 | 79 / 79 | 23 / 23 | 12 / 12 | 158 / 155 | 85 / 90 |
| matplotlib | 190 / 190 | 45 / 45 | 18 / 18 | 376 / 360 | 194 / 185 |
| pandas | 183 / 183 | 47 / 47 | 12 / 12 | 204 / 190 | 212 / 215 |
| plotly_express | 97 / 97 | 41 / 41 | 16 / 16 | 184 / 170 | 92 / 95 |
| plotly_go | 169 / 169 | 46 / 46 | 15 / 15 | 282 / 265 | 174 / 165 |
| seaborn | 92 / 92 | 24 / 24 | 12 / 12 | 184 / 180 | 86 / 90 |
| seaborn_obj | 95 / 95 | 33 / 33 | 12 / 12 | 199 / 200 | 94 / 95 |
| vega-lite | 63 / 63 | 9 / 9 | 12 / 12 | 230 / 225 | 84 / 80 |
