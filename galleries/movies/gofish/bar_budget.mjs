import * as d3 from "d3";
import { chart, rect, spread } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(spread({ by: "Major Genre", dir: "x" }))
  .mark(rect({ h: "Production Budget" }));
