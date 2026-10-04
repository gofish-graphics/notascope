import * as d3 from "d3";
import { chart, derive, field, ribbon, scatter, stack } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const year = (r) => r["Release Date"].getUTCFullYear();
const total = d3.rollup(
  movies,
  (v) => d3.sum(v, (r) => r["Worldwide Gross"]),
  year
);

export default chart(movies, { axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({
        ...r,
        Year: year(r),
        Share: r["Worldwide Gross"] / total.get(year(r)),
      }))
    ),
    scatter({ by: field("Year").sort(), x: "Year" }),
    stack({ by: field("MPAA Rating").dropNulls().sort(), dir: "y" })
  )
  .mark(ribbon({ h: "Share", fill: "MPAA Rating" }));
