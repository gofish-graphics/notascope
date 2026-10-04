import * as d3 from "d3";
import { chart, derive, rect, scatter } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    scatter({ by: "Year", x: "Year" })
  )
  .mark(rect({ w: 2, h: "Worldwide Gross" }));
