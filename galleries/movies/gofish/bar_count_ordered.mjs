import * as d3 from "d3";
import { chart, field, rect, spread } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const counts = d3.rollups(
  movies,
  (v) => v.length,
  (d) => d["Major Genre"]
);

export default chart(
  counts.map(([genre, count]) => ({ "Major Genre": genre, count })),
  { axes: true }
)
  .flow(spread({ by: field("Major Genre").sort("count", "desc"), dir: "x" }))
  .mark(rect({ h: "count" }));
