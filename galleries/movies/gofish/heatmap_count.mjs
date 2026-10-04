import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { color: gf.gradient("blues"), axes: true })
  .flow(gf.table({ by: { x: "Major Genre", y: "MPAA Rating" } }))
  .mark((d) => gf.rect({ fill: gf.v(d.length) }));
