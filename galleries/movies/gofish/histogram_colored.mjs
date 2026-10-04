import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.spread({ by: gf.field("Production Budget").bin(), dir: "x" }),
    gf.stack({ by: "MPAA Rating", dir: "y" })
  )
  .mark(gf.rect({ h: gf.field("Title").count(), fill: "MPAA Rating" }));
