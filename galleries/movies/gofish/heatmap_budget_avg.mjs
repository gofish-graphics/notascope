import * as d3 from "d3";
import { chart, gradient, rect, table, v } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { color: gradient("blues"), axes: true })
  .flow(table({ by: { x: "Major Genre", y: "MPAA Rating" } }))
  .mark((d) => rect({ fill: v(d3.mean(d, (r) => r["Production Budget"])) }));
