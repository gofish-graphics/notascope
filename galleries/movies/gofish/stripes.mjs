import * as d3 from "d3";
import {
  chart,
  derive,
  field,
  gradient,
  rect,
  spread,
  v,
} from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { color: gradient("blues"), axes: true })
  .flow(
    derive((d) =>
      d.map((r) => ({ ...r, Year: r["Release Date"].getUTCFullYear() }))
    ),
    spread({ by: field("Year").sort(), dir: "x", spacing: 0 })
  )
  .mark((d) =>
    rect({ h: 400, fill: v(d3.sum(d, (r) => r["Worldwide Gross"])) })
  );
