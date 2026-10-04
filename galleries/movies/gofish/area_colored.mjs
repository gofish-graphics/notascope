import * as d3 from "d3";
import { chart, derive, field, ribbon, scatter, stack } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    scatter({ by: field("Year").sort(), x: "Year" }),
    stack({ by: field("MPAA Rating").dropNulls().sort(), dir: "y" })
  )
  .mark(ribbon({ h: "Worldwide Gross", fill: "MPAA Rating" }));
