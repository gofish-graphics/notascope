import * as d3 from "d3";
import { chart, field, rect, spread, stack } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    spread({ by: "Major Genre", dir: "x" }),
    stack({ by: "MPAA Rating", dir: "x" })
  )
  .mark(rect({ h: field("Production Budget").mean(), fill: "MPAA Rating" }));
