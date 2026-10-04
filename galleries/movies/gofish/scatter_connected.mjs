import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    gf.scatter({
      by: gf.field("Year").sort(),
      x: gf.field("Production Budget").sum(),
      y: gf.field("Worldwide Gross").sum(),
    })
  )
  .mark(gf.circle({ r: 3 }))
  .layer(gf.chart().mark(gf.line()));
