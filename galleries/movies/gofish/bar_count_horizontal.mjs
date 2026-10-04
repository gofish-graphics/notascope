import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(gf.spread({ by: "Major Genre", dir: "y" }))
  .mark(gf.rect({ w: gf.field("Title").count() }));
