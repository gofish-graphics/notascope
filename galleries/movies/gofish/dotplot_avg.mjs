import * as d3 from "d3";
import { chart, circle, scatter, spread } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    spread({ by: "Major Genre", dir: "y" }),
    scatter({ by: "Major Genre", x: "Production Budget" })
  )
  .mark(circle({ r: 3 }));
