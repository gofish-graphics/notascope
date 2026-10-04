import * as d3 from "d3";
import { chart, circle, field, scatter, spread } from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export default chart(movies, { axes: true })
  .flow(
    spread({ by: "Major Genre", dir: "y" }),
    scatter({ by: "Major Genre", x: field("Title").count() })
  )
  .mark(circle({ r: 3 }));
