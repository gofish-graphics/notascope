## NotaScope

NotaScope is open-source software, created to support the research to be presented at [VIS 2023](https://ieeevis.org/year/2023/welcome) in the paper entitled [Metrics-Based Evaluation and Comparison of Visualization Notations](https://arxiv.org/abs/2308.16353) by [Nicolas Kruchten](https://nicolas.kruchten.com/), [Andrew M. McNutt](https://www.mcnutt.in/) and [Michael J. McGuffin](https://www.michaelmcguffin.com/).

The NotaScope [source code is on Github](https://github.com/notascope) and a [running demo is available](https://app.notascope.io/). A [walkthrough video of the user interface is on YouTube](https://www.youtube.com/watch?v=PXwVhaU-8b4).

### GoFish and Flint fork (branch `gofish-flint`)

This fork adds two notations to the `movies` gallery and a metrics pipeline for it. It was made for the [GoFish](https://github.com/gofish-graphics/gofish-graphics) LLM authoring benchmark (see gofish-graphics issues #955 and #956).

- `galleries/movies/gofish/`: all 40 charts in GoFish, written against gofish-graphics main at `4e271a1fb`. Review notes and renders: `review/gofish/` (`NOTES.md` lists every workaround and gap).
- `galleries/movies/flint/`: 29 of the 40 charts in [Flint](https://github.com/microsoft/flint-chart) 0.5.1. The other 11 cannot be expressed. Notes: `review/flint/NOTES.md`.
- `reference/movies/`: the Vega-Lite renders used to check both.
- `analysis/`: `run_movies.sh` reruns preprocessing, tokens and distances for every notation in the gallery, then `movies_metrics.py` computes the paper's metrics (median length, vocabulary, sprawl, bootstrap intervals) plus a chart-expression-only view. Results: `analysis/out/movies_metrics.md` and the plots beside it. Vocabulary counts match the paper's Fig. 5 exactly.

Run the metrics:

```bash
uv venv .venv --python 3.12 && uv pip install --python .venv/bin/python black==22.10.0 isort==5.12.0 pandas pyarrow matplotlib
uv venv .venv-ts --python 3.10 && uv pip install --python .venv-ts/bin/python tree_sitter==0.20.1 pandas pyarrow lz4 textdistance==4.5.0
# also needed: jq, R with formatR, node (npx uglifyjs, prettier)
analysis/run_movies.sh --force
```

Render the new notations (only needed to check the pictures):

```bash
(cd notations/savers/flint && npm install)
notations/savers/flint.sh galleries/movies/flint/scatter.json out/scatter
GOFISH_DIR=/path/to/gofish-graphics notations/savers/gofish.sh galleries/movies/gofish/scatter.mjs out/scatter
```

`GOFISH_DIR` is a gofish-graphics checkout with a built dist (`pnpm install && pnpm --filter gofish-graphics build`). The GoFish saver uses esbuild and Playwright Chromium from this repo's `package.json`. `yarn.lock` was not updated for them.

### Local Setup

To get started you'll need [`git`](https://git-scm.com/), [`conda`](https://docs.conda.io/) and [Firefox](https://firefox.com/) installed.

```bash
$ git clone git@github.com:nicolaskruchten/notascope.git
$ cd notascope
$ git submodule init
$ git submodule update
$ conda env create -f environment.yml
$ conda activate env
$ yarn install
$ make app.py
$ python app.py
```
