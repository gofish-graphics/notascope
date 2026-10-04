"""Per-notation metrics for the movies gallery, following Kruchten, McNutt & McGuffin,
"Metrics-Based Evaluation and Comparison of Visualization Notations" (VIS 2023, Sec. 4).

Inputs (produced by analysis/run_movies.sh, i.e. the Makefile's [preproc]/[dist] steps):
  results/movies/<notation>/preproc/*        normalized specs
  results/movies/<notation>/distances.pqt    pairwise distances (cd, ncd, ...)
  results/movies/<notation>/tokens.pqt       tree-sitter tokens per spec

Definitions (paper Sec. 4):
  spec length    bytes of the (preprocessed) spec; per notation we report the median.
  vocabulary     number of unique tokens across all of the notation's specs.
  distance       compression distance CD(A,B) = C(AB) - min(C(A),C(B)) with lz4 (the paper's
                 choice; batch_distances_tokens.py averages both concatenation orders).
                 NCD = 1000*CD/max(C(A),C(B)) is reported as a secondary column.
  sprawl         median distance over all unordered pairs of distinct specs.
  token usage    Fig. 5: for each unique token, the number of specs it appears in; we report
                 the share of vocabulary used in exactly one spec and in every spec.

Bootstrap: 1,000 resamples (seed 42) of specs with replacement. Within a resample, sprawl is
the median over pairs of draws that are different specs (a spec is not paired with itself or
its own duplicate draw). Note: NotaScope's notebooks/bootstrap.ipynb instead takes the median
of the full k x k matrix including zero diagonal/duplicate entries, which pulls its bootstrap
sprawl (and length) slightly down; our point estimates do not depend on this choice.

Two variants:
  all     each notation resampled over its own specs (independent).
  paired  only charts that every included notation has; one chart resample is shared by all
          notations per iteration (as in the original notebook), so differences are paired.

Usage: python analysis/movies_metrics.py [--notations a,b,c] [--exclude x,y] [--n-boot 1000]
"""

import argparse
import itertools
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
GALLERY = "movies"
RESULTS = ROOT / "results" / GALLERY
OUT = ROOT / "analysis" / "out"

# Paper values for the 9 notations it studied: Fig. 5 (vocabulary, tokens used 1x / 40x)
# and approximate centers of the Fig. 3 bootstrap regions (median length, sprawl in CD).
PAPER = {
    "altair": dict(vocab=65, once=12, all=17, length=185, sprawl=75),
    "ggplot2": dict(vocab=79, once=23, all=12, length=155, sprawl=90),
    "matplotlib": dict(vocab=190, once=45, all=18, length=360, sprawl=185),
    "pandas": dict(vocab=183, once=47, all=12, length=190, sprawl=215),
    "plotly_express": dict(vocab=97, once=41, all=16, length=170, sprawl=95),
    "plotly_go": dict(vocab=169, once=46, all=15, length=265, sprawl=165),
    "seaborn": dict(vocab=92, once=24, all=12, length=180, sprawl=90),
    "seaborn_obj": dict(vocab=95, once=33, all=12, length=200, sprawl=95),
    "vega-lite": dict(vocab=63, once=9, all=12, length=225, sprawl=80),
}


def load(notations=None, exclude=()):
    data = {}
    for d in sorted(p for p in RESULTS.iterdir() if p.is_dir()):
        n = d.name
        if notations and n not in notations or n in exclude:
            continue
        if not (d / "distances.pqt").exists() or not (d / "tokens.pqt").exists():
            print(f"[metrics] skipping {n}: no distances.pqt/tokens.pqt")
            continue
        lengths = {
            ".".join(p.name.split(".")[:-1]): p.stat().st_size
            for p in (d / "preproc").glob("*.*")
        }
        if len(lengths) < 2:
            print(f"[metrics] skipping {n}: fewer than 2 specs")
            continue
        specs = sorted(lengths)
        idx = {s: i for i, s in enumerate(specs)}
        dist = pd.read_parquet(d / "distances.pqt")
        mats = {}
        for col in ["cd", "ncd"]:
            m = np.full((len(specs), len(specs)), np.nan)
            m[dist.from_spec.map(idx), dist.to_spec.map(idx)] = dist[col]
            mats[col] = m
        tok = pd.read_parquet(d / "tokens.pqt")
        spec_tokens = {s: set(g.token) for s, g in tok.groupby("spec")}
        for s in specs:  # a spec with no tokens still counts as a spec
            spec_tokens.setdefault(s, set())
        data[n] = dict(
            specs=specs,
            idx=idx,
            length=np.array([lengths[s] for s in specs], dtype=float),
            cd=mats["cd"],
            ncd=mats["ncd"],
            tokens=spec_tokens,
        )
    return data


def pair_median(mat, ix):
    """Median of mat[i, j] over draw pairs a < b whose specs differ."""
    ix = np.asarray(ix)
    a, b = np.triu_indices(len(ix), k=1)
    a, b = ix[a], ix[b]
    keep = a != b
    return float(np.median(mat[a[keep], b[keep]]))


def vocab_size(nd, specs):
    return len(set().union(*(nd["tokens"][s] for s in specs)))


def point_metrics(nd, specs):
    ix = [nd["idx"][s] for s in specs]
    counts = pd.Series(
        [t for s in specs for t in nd["tokens"][s]], dtype=object
    ).value_counts()  # token -> number of specs using it
    vocab = len(counts)
    return dict(
        n_specs=len(specs),
        median_length=float(np.median(nd["length"][ix])),
        vocab=vocab,
        sprawl_cd=pair_median(nd["cd"], ix),
        sprawl_ncd=pair_median(nd["ncd"], ix),
        tokens_once=int((counts == 1).sum()),
        tokens_all=int((counts == len(specs)).sum()),
        share_once=float((counts == 1).sum() / vocab),
        share_all=float((counts == len(specs)).sum() / vocab),
    )


def boot_one(nd, sample):
    ix = [nd["idx"][s] for s in sample]
    return (
        float(np.median(nd["length"][ix])),
        pair_median(nd["cd"], ix),
        vocab_size(nd, set(sample)),
    )


def bootstrap(data, chart_sets, n_boot, paired, seed=42):
    rng = np.random.default_rng(seed)
    rows = []
    if paired:
        common = chart_sets
        for it in range(n_boot):
            sample = list(rng.choice(common, size=len(common), replace=True))
            for n, nd in data.items():
                rows.append((n, it, *boot_one(nd, sample)))
    else:
        for n, nd in data.items():
            specs = chart_sets[n]
            for it in range(n_boot):
                sample = list(rng.choice(specs, size=len(specs), replace=True))
                rows.append((n, it, *boot_one(nd, sample)))
    return pd.DataFrame(rows, columns=["notation", "it", "length", "sprawl", "vocab"])


def summarize(data, chart_sets, boot, variant):
    rows = []
    for n, nd in data.items():
        specs = chart_sets if isinstance(chart_sets, list) else chart_sets[n]
        r = dict(variant=variant, notation=n, **point_metrics(nd, specs))
        b = boot[boot.notation == n]
        for col, key in [("length", "median_length"), ("sprawl", "sprawl_cd"), ("vocab", "vocab")]:
            lo, hi = np.percentile(b[col], [2.5, 97.5])
            r[f"{key}_lo"], r[f"{key}_hi"] = float(lo), float(hi)
        rows.append(r)
    return pd.DataFrame(rows)


def kde_contour(ax, x, y, color, mass=0.75):
    """Draw the region containing `mass` of a Gaussian KDE (paper Fig. 3 style)."""
    x, y = np.asarray(x, float), np.asarray(y, float)
    if np.std(x) == 0 or np.std(y) == 0:
        return
    pts = np.vstack([x, y])
    cov = np.cov(pts) * len(x) ** (-2 / 6)  # Scott's rule, 2-D
    inv, det = np.linalg.inv(cov), np.linalg.det(cov)
    pad = 3 * np.sqrt(np.diag(cov))
    gx = np.linspace(x.min() - pad[0], x.max() + pad[0], 120)
    gy = np.linspace(y.min() - pad[1], y.max() + pad[1], 120)
    X, Y = np.meshgrid(gx, gy)
    grid = np.stack([X.ravel(), Y.ravel()])
    dens = np.zeros(grid.shape[1])
    for c in np.unique(pts, axis=1).T:  # bootstrap values repeat; weight by multiplicity
        w = np.sum(np.all(pts.T == c, axis=1))
        dd = grid - c[:, None]
        dens += w * np.exp(-0.5 * np.einsum("ij,ik,kj->j", dd, inv, dd))
    dens /= len(x) * 2 * np.pi * np.sqrt(det)
    z = np.sort(dens)[::-1]
    cell = (gx[1] - gx[0]) * (gy[1] - gy[0])
    cum = np.cumsum(z) * cell
    level = z[min(np.searchsorted(cum, mass * cum[-1]), len(z) - 1)]
    D = dens.reshape(X.shape)
    ax.contourf(X, Y, D, levels=[level, D.max() + 1], colors=[color], alpha=0.18)
    ax.contour(X, Y, D, levels=[level], colors=[color], linewidths=1.2)


def place_labels(ax, fig, pts, names):
    """Label each point at the first nearby offset that overlaps no earlier label; points in a
    crowded cluster that find no free spot stay unlabeled (the legend identifies them)."""
    fig.canvas.draw()
    renderer = fig.canvas.get_renderer()
    boxes = []
    for (x, y), name in zip(pts, names):
        for dx, dy, ha in [(7, 6, "left"), (7, -8, "left"), (-7, 6, "right"), (-7, -8, "right")]:
            t = ax.annotate(name, (x, y), xytext=(dx, dy), textcoords="offset points",
                            fontsize=9, ha=ha, va="center")
            bb = t.get_window_extent(renderer)
            if not any(bb.overlaps(o) for o in boxes):
                boxes.append(bb)
                break
            t.remove()


def plot(summary, boot, xkey, ykey, xlabel, ylabel, title, path):
    """One labeled point per notation at its full-gallery value, with 95% bootstrap bars.
    Vocabulary is not resample-stable (a resample holds ~63% of the distinct specs, so its
    vocabulary is biased low), so it gets no bar and no region; other pairs also get the
    paper's Fig. 3 style 75%-mass KDE region of the bootstrap distribution."""
    cmap = plt.get_cmap("tab10" if len(summary) <= 10 else "tab20")
    fig, ax = plt.subplots(figsize=(8, 6.4), dpi=150)
    has_vocab = "vocab" in (xkey[0], ykey[0])
    pts = []
    for i, r in enumerate(summary.itertuples()):
        color = cmap(i % cmap.N)
        if not has_vocab:
            b = boot[boot.notation == r.notation]
            kde_contour(ax, b[xkey[1]], b[ykey[1]], color)
        x, y = getattr(r, xkey[0]), getattr(r, ykey[0])

        def err(key, v):
            if key == "vocab":
                return None
            return [[v - getattr(r, key + "_lo")], [getattr(r, key + "_hi") - v]]

        ax.errorbar(x, y, xerr=err(xkey[0], x), yerr=err(ykey[0], y),
                    fmt="o", color=color, ms=6, lw=1, capsize=2.5, label=r.notation)
        pts.append((x, y))
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    ax.set_title(title, fontsize=12)
    ax.grid(alpha=0.3)
    ax.set_xlim(left=0)
    ax.set_ylim(bottom=0)
    note = "Points: full-gallery values. Bars: 95% intervals over 1,000 bootstrap resamples of specs."
    if not has_vocab:
        note += "\nShaded regions: 75% of KDE mass of the bootstrap distribution (paper Fig. 3 style)."
    fig.text(0.01, 0.01, note, fontsize=7.5, color="0.35", va="bottom")
    ax.legend(loc="upper left", fontsize=8, frameon=False, ncol=2)
    fig.tight_layout(rect=(0, 0.05, 1, 1))
    place_labels(ax, fig, pts, list(summary.notation))
    fig.savefig(path)
    plt.close(fig)


def fmt_ci(r, key, nd=0):
    f = f"{{:.{nd}f}}"
    return f"{f.format(getattr(r, key))} [{f.format(getattr(r, key + '_lo'))}, {f.format(getattr(r, key + '_hi'))}]"


def markdown(all_df, paired_df, common, n_boot):
    lines = [
        "# Movies gallery metrics",
        "",
        "Definitions follow Kruchten et al. (VIS 2023), Sec. 4. Length = bytes of the preprocessed spec. "
        "Sprawl = median pairwise compression distance (CD, lz4). Brackets are 95% intervals over "
        f"{n_boot:,} bootstrap resamples of specs. Vocabulary intervals are bootstrap vocabulary sizes, "
        "which are smaller than the full-gallery value because a resample contains about 63% of the distinct specs.",
        "",
    ]
    for title, df in [("All specs per notation", all_df), (f"Paired: {len(common)} charts every notation has", paired_df)]:
        lines += [f"## {title}", "",
                  "| notation | specs | median length (B) | vocabulary | sprawl (CD) | sprawl (NCD) | used in 1 spec | used in all specs |",
                  "|---|---:|---:|---:|---:|---:|---:|---:|"]
        for r in df.itertuples():
            lines.append(
                f"| {r.notation} | {r.n_specs} | {fmt_ci(r, 'median_length')} | {r.vocab} "
                f"(boot {r.vocab_lo:.0f}-{r.vocab_hi:.0f}) | {fmt_ci(r, 'sprawl_cd', 1)} | {r.sprawl_ncd:.0f} | "
                f"{r.tokens_once} ({r.share_once:.0%}) | {r.tokens_all} ({r.share_all:.0%}) |")
        lines.append("")
    lines += ["## Paper reference values (9 notations)", "",
              "Vocabulary and tokens used once / in all 40 specs are read from Fig. 5. Length and sprawl are "
              "approximate centers of the Fig. 3 bootstrap regions (read off the plot, about +-15).", "",
              "| notation | vocab (ours / paper) | used 1x (ours / paper) | used 40x (ours / paper) | median length (ours / ~paper) | sprawl CD (ours / ~paper) |",
              "|---|---:|---:|---:|---:|---:|"]
    for r in all_df.itertuples():
        p = PAPER.get(r.notation)
        if p:
            lines.append(f"| {r.notation} | {r.vocab} / {p['vocab']} | {r.tokens_once} / {p['once']} | "
                         f"{r.tokens_all} / {p['all']} | {r.median_length:.0f} / {p['length']} | {r.sprawl_cd:.0f} / {p['sprawl']} |")
    lines.append("")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--notations", help="comma-separated subset to include")
    ap.add_argument("--exclude", default="", help="comma-separated notations to drop")
    ap.add_argument("--n-boot", type=int, default=1000)
    args = ap.parse_args()
    data = load(args.notations.split(",") if args.notations else None,
                [x for x in args.exclude.split(",") if x])
    if not data:
        raise SystemExit("no notation results found under " + str(RESULTS))
    OUT.mkdir(parents=True, exist_ok=True)

    own = {n: nd["specs"] for n, nd in data.items()}
    common = sorted(set.intersection(*(set(s) for s in own.values())))
    for n, s in own.items():
        missing = sorted(set().union(*own.values()) - set(s))
        if missing:
            print(f"[metrics] {n}: {len(s)} specs, missing {len(missing)}: {', '.join(missing[:8])}"
                  + (" ..." if len(missing) > 8 else ""))
    print(f"[metrics] {len(data)} notations, {len(common)} charts shared by all")

    boot_all = bootstrap(data, own, args.n_boot, paired=False)
    all_df = summarize(data, own, boot_all, "all")
    frames = [all_df]
    paired_df = pd.DataFrame(columns=all_df.columns)
    if len(common) >= 2:
        boot_p = bootstrap(data, common, args.n_boot, paired=True)
        paired_df = summarize(data, common, boot_p, "paired")
        frames.append(paired_df)
    pd.concat(frames).to_csv(OUT / "movies_metrics.csv", index=False, float_format="%.4g")
    (OUT / "movies_metrics.md").write_text(markdown(all_df, paired_df, common, args.n_boot))

    plot(all_df, boot_all, ("median_length", "length"), ("vocab", "vocab"),
         "Median specification length (bytes)", "Vocabulary size (unique tokens)",
         "Movies gallery: length vs vocabulary", OUT / "length_vs_vocab.png")
    plot(all_df, boot_all, ("median_length", "length"), ("sprawl_cd", "sprawl"),
         "Median specification length (bytes)", "Sprawl (median pairwise compression distance)",
         "Movies gallery: length vs sprawl", OUT / "length_vs_sprawl.png")
    plot(all_df, boot_all, ("sprawl_cd", "sprawl"), ("vocab", "vocab"),
         "Sprawl (median pairwise compression distance)", "Vocabulary size (unique tokens)",
         "Movies gallery: sprawl vs vocabulary", OUT / "sprawl_vs_vocab.png")
    with pd.option_context("display.width", 200, "display.max_columns", 30):
        print(all_df[["notation", "n_specs", "median_length", "vocab", "sprawl_cd", "sprawl_ncd",
                      "share_once", "share_all"]].round(3).to_string(index=False))
    print(f"[metrics] wrote {OUT}/movies_metrics.{{csv,md}} and plots")


if __name__ == "__main__":
    main()
