import * as d3 from "d3";
import { chart, circle, scatter } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(scatter({ x: "Production Budget", y: "Worldwide Gross" }))
  .mark(circle({ r: 3, fill: "MPAA Rating" }));
