import * as d3 from "d3";
import { chart, circle, derive, field, line, scatter } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    scatter({
      by: field("Year").sort(),
      x: field("Production Budget").sum(),
      y: field("Worldwide Gross").sum(),
    })
  )
  .mark(circle({ r: 3 }))
  .layer(chart().mark(line()));
