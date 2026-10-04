import * as d3 from "d3";
import { chart, derive, field, group, line, scatter } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    group({ by: field("MPAA Rating").dropNulls() }),
    scatter({
      by: field("Year").sort(),
      x: "Year",
      y: field("Worldwide Gross").sum(),
    })
  )
  .mark(line({ stroke: "MPAA Rating" }));
