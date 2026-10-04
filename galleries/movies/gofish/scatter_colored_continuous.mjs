import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

export const chart = gf
  .chart(movies, { color: gf.gradient("blues"), axes: true })
  .flow(gf.scatter({ x: "Production Budget", y: "Worldwide Gross" }))
  .mark(gf.circle({ r: 3, fill: "IMDB Rating" }));
