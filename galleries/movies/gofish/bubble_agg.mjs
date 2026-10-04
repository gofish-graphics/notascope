import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { axes: true })
  .flow(
    gf.scatter({
      by: "MPAA Rating",
      x: "Production Budget",
      y: "Worldwide Gross",
    })
  )
  .mark((d) =>
    gf.circle({
      r: d3.mean(d, (r) => r["IMDB Rating"]),
      fill: gf.v(d[0]["MPAA Rating"]),
    })
  );
