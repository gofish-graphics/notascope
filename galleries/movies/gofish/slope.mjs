import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.spread({ by: "Major Genre", dir: "x", spacing: 30 }),
    gf.scatter({
      by: gf.field("MPAA Rating").dropNulls(),
      y: "Production Budget",
    })
  )
  .mark(gf.line({ stroke: "MPAA Rating" }));
