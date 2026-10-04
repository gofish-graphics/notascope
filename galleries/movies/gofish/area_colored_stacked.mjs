import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const year = (r) => r["Release Date"].getUTCFullYear();
const total = d3.rollup(
  movies,
  (v) => d3.sum(v, (r) => r["Worldwide Gross"]),
  year
);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.derive((d) =>
      d.map((r) => ({
        ...r,
        Year: year(r),
        Share: r["Worldwide Gross"] / total.get(year(r)),
      }))
    ),
    gf.scatter({ by: gf.field("Year").sort(), x: "Year" }),
    gf.stack({ by: gf.field("MPAA Rating").dropNulls().sort(), dir: "y" })
  )
  .mark(gf.ribbon({ h: "Share", fill: "MPAA Rating" }));
