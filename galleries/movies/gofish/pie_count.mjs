import * as d3 from "d3";
import { chart, clock, field, rect, stack } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { coord: clock(), axes: true })
  .flow(stack({ by: "MPAA Rating", dir: "x" }))
  .mark(rect({ w: field("Title").count(), fill: "MPAA Rating" }));
