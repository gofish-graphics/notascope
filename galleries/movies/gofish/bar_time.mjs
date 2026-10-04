import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    gf.scatter({ by: "Year", x: "Year" })
  )
  .mark(gf.rect({ w: 2, h: "Worldwide Gross" }));
