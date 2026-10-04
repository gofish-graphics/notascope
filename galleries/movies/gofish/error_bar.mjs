import * as d3 from "d3";
import {
  Constraint,
  chart,
  circle,
  derive,
  field,
  layer,
  rect,
  scatter,
  spread,
} from "gofish-graphics";

const movies = await d3.csv("data/movies.csv", d3.autoType);

const x = (r) => r["Production Budget"];
const stderr = (rows) => {
  const mean = d3.mean(rows, x),
    se = d3.deviation(rows, x) / Math.sqrt(rows.length);
  return [
    { "Major Genre": rows[0]["Major Genre"], lo: mean - se, hi: mean + se },
  ];
};

export default chart(movies, { axes: true })
  .flow(spread({ by: "Major Genre", dir: "y" }))
  .mark(
    layer([
      chart()
        .flow(scatter({ by: "Major Genre", x: "Production Budget" }))
        .mark(circle({ r: 3 }))
        .name("point"),
      chart()
        .flow(
          derive(stderr),
          scatter({
            by: "Major Genre",
            xMin: field("lo", "Production Budget"),
            xMax: field("hi", "Production Budget"),
          })
        )
        .mark(rect({ h: 1 }))
        .name("bar"),
    ]).relate(({ point, bar }) => [
      Constraint.align({ y: "middle" }, [point, bar]),
    ])
  );
