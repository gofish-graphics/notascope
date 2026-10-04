import * as d3 from "d3";
import { chart, circle, scatter, v } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    scatter({
      by: "MPAA Rating",
      x: "Production Budget",
      y: "Worldwide Gross",
    })
  )
  .mark((d) =>
    circle({
      r: d3.mean(d, (r) => r["IMDB Rating"]),
      fill: v(d[0]["MPAA Rating"]),
    })
  );
