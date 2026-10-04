import * as d3 from "d3";
import * as gf from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const x = (r) => r["Production Budget"];
const stderr = (rows) => {
  const mean = d3.mean(rows, x),
    se = d3.deviation(rows, x) / Math.sqrt(rows.length);
  return [
    { "Major Genre": rows[0]["Major Genre"], lo: mean - se, hi: mean + se },
  ];
};

export const chart = gf
  .chart(movies, { axes: true })
  .flow(gf.spread({ by: "Major Genre", dir: "y" }))
  .mark(
    gf
      .layer([
        gf
          .chart()
          .flow(gf.scatter({ by: "Major Genre", x: "Production Budget" }))
          .mark(gf.circle({ r: 3 }))
          .name("point"),
        gf
          .chart()
          .flow(
            gf.derive(stderr),
            gf.scatter({
              by: "Major Genre",
              xMin: gf.field("lo", "Production Budget"),
              xMax: gf.field("hi", "Production Budget"),
            })
          )
          .mark(gf.rect({ h: 1 }))
          .name("bar"),
      ])
      .relate(({ point, bar }) => [
        gf.Constraint.align({ y: "middle" }, [point, bar]),
      ])
  );
