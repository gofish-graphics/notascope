import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { color: gf.gradient("blues"), axes: true })
  .flow(
    gf.derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    gf.spread({ by: gf.field("Year").sort(), dir: "x", spacing: 0 })
  )
  .mark((d) =>
    gf.rect({ h: 400, fill: gf.v(d3.sum(d, (r) => r["Worldwide Gross"])) })
  );
