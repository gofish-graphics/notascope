#!/bin/bash
# Run NotaScope's [preproc] -> [dist]/[tokens] steps for the movies gallery only,
# for every notation directory under galleries/movies/, then compute metrics.
# Mirrors the Makefile rules (same preprocessors, same batch_distances_tokens.py).
#
# Environment:
#   .venv     python 3.12: black==22.10.0, isort==5.12.0, pandas, matplotlib (metrics)
#   .venv-ts  python 3.10: tree_sitter==0.20.1 (needs stdlib distutils), pandas, pyarrow, lz4, textdistance
#   R + formatR (ggplot2/base_r), jq (vega-lite), npx uglifyjs (d3/observable)
# Usage: analysis/run_movies.sh [--force] [metrics args, e.g. --exclude flint]
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
GALLERY=movies
FORCE=""
if [[ "${1:-}" == "--force" ]]; then FORCE=--force; shift; fi
export PATH="$ROOT/.venv/bin:$PATH"   # black/isort used by the python preprocessors

for ndir in galleries/$GALLERY/*/; do
  notation=$(basename "$ndir")
  pre="notations/preprocessors/$notation.sh"
  if [[ ! -x "$pre" ]]; then
    echo "[skip]     $GALLERY/$notation: no executable $pre" >&2
    continue
  fi
  out="results/$GALLERY/$notation"
  [[ "$FORCE" == "--force" ]] && rm -rf "$out"
  mkdir -p "$out/preproc"
  changed=0
  # same selection as the Makefile: top-level, regular, non-empty files
  while IFS= read -r spec; do
    src="$ndir$spec"; dst="$out/preproc/$spec"
    if [[ ! -e "$dst" || "$src" -nt "$dst" ]]; then
      echo "[preproc]  $GALLERY/$notation: $spec"
      "$pre" "$src" "$dst"
      touch "$dst"
      changed=1
    fi
  done < <(find "$ndir" -maxdepth 1 -type f ! -size 0 | sed -e 's,^.*/,,' | sort)
  # drop preproc outputs whose source spec was removed
  for dst in "$out"/preproc/*; do
    [[ -e "$dst" ]] || continue
    if [[ ! -s "$ndir$(basename "$dst")" ]]; then rm -f "$dst"; changed=1; fi
  done
  if [[ $changed == 1 || ! -e "$out/distances.pqt" ]]; then
    echo "[dist]     $GALLERY/$notation"
    .venv-ts/bin/python batch_distances_tokens.py "results/$GALLERY/$notation/preproc"
  fi
done

.venv/bin/python analysis/movies_metrics.py "$@"
