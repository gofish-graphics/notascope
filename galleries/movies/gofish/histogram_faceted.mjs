import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const genres = [...new Set(movies.map((r) => r["Major Genre"]))];

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.derive((d) =>
      d.map((r) => ({
        ...r,
        Row: Math.floor(genres.indexOf(r["Major Genre"]) / 5),
      }))
    ),
    gf.spread({ by: "Row", dir: "y", sharedScale: true }),
    gf.spread({ by: "Major Genre", dir: "x", sharedScale: true }),
    gf.spread({
      by: gf
        .field("Production Budget")
        .bin({ thresholds: d3.range(0, 3.5e8, 5e7) }),
      dir: "x",
    }),
    gf.stack({ by: "MPAA Rating", dir: "y" })
  )
  .mark(gf.rect({ h: gf.field("Title").count(), fill: "MPAA Rating" }));
