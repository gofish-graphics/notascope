import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const counts = d3.rollups(
  movies,
  (v) => v.length,
  (d) => d["Major Genre"]
);

export const chart = gf
  .chart(
    counts.map(([genre, count]) => ({ "Major Genre": genre, count })),
    { axes: true }
  )
  .flow(
    gf.spread({ by: gf.field("Major Genre").sort("count", "desc"), dir: "x" })
  )
  .mark(gf.rect({ h: "count" }));
