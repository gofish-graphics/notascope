import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { coord: gf.clock(), axes: true })
  .flow(gf.stack({ by: "MPAA Rating", dir: "x" }))
  .mark(gf.rect({ w: gf.field("Title").count(), fill: "MPAA Rating" }));
