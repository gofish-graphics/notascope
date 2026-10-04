import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const ols = (rows) => {
  rows = rows.filter(
    (r) => r["Production Budget"] != null && r["Worldwide Gross"] != null
  );
  const x = (r) => r["Production Budget"],
    y = (r) => r["Worldwide Gross"];
  const mx = d3.mean(rows, x),
    my = d3.mean(rows, y);
  const slope =
    d3.sum(rows, (r) => (x(r) - mx) * (y(r) - my)) /
    d3.sum(rows, (r) => (x(r) - mx) ** 2);
  return [0, 3e8].map((b) => ({
    ...rows[0],
    "Production Budget": b,
    "Worldwide Gross": my + slope * (b - mx),
  }));
};

export const chart = gf.chart(movies, { axes: true }).mark(
  gf.layer([
    gf
      .chart(movies)
      .flow(gf.scatter({ x: "Production Budget", y: "Worldwide Gross" }))
      .mark(gf.circle({ r: 3, fill: "MPAA Rating" })),
    gf
      .chart(movies)
      .flow(
        gf.group({ by: gf.field("MPAA Rating").dropNulls() }),
        gf.derive(ols),
        gf.scatter({
          by: "Production Budget",
          x: "Production Budget",
          y: "Worldwide Gross",
        })
      )
      .mark(gf.line({ stroke: "MPAA Rating" })),
  ])
);
