import * as d3 from "d3";
import { chart, field, line, scatter, spread } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    spread({ by: "Major Genre", dir: "x", spacing: 30 }),
    scatter({
      by: field("MPAA Rating").dropNulls(),
      y: "Production Budget",
    })
  )
  .mark(line({ stroke: "MPAA Rating" }));
