import * as d3 from "d3";
import { chart, derive, field, rect, spread, stack } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const genres = [...new Set(movies.map((r) => r["Major Genre"]))];

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({
        ...r,
        Row: Math.floor(genres.indexOf(r["Major Genre"]) / 5),
      }))
    ),
    spread({ by: "Row", dir: "y", sharedScale: true }),
    spread({ by: "Major Genre", dir: "x", sharedScale: true }),
    spread({
      by: field("Production Budget").bin({
        thresholds: d3.range(0, 3.5e8, 5e7),
      }),
      dir: "x",
    }),
    stack({ by: "MPAA Rating", dir: "y" })
  )
  .mark(rect({ h: field("Title").count(), fill: "MPAA Rating" }));
