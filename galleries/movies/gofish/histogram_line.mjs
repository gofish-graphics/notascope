import * as d3 from "d3";
import { bin, chart, derive, line, scatter } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    derive(bin("Production Budget")),
    scatter({ xMin: "start", xMax: "end", y: "count" })
  )
  .mark(line());
