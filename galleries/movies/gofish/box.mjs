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

const y = (r) => r["Production Budget"];
const box = (rows) => {
  const v = rows
    .map(y)
    .filter((x) => x != null)
    .sort(d3.ascending);
  const q1 = d3.quantile(v, 0.25),
    q3 = d3.quantile(v, 0.75);
  const lo = q1 - 1.5 * (q3 - q1),
    hi = q3 + 1.5 * (q3 - q1);
  return [
    {
      q1,
      median: d3.median(v),
      q3,
      min: d3.min(v.filter((x) => x >= lo)),
      max: d3.max(v.filter((x) => x <= hi)),
    },
  ];
};
const outliers = (rows) => {
  const [{ min, max }] = box(rows);
  return rows.filter((r) => y(r) < min || y(r) > max);
};

export default chart(movies, { axes: true })
  .flow(spread({ by: "Major Genre", dir: "x" }))
  .mark(
    layer([
      chart()
        .flow(
          derive(box),
          scatter({
            yMin: field("min", "Production Budget"),
            yMax: field("max", "Production Budget"),
          })
        )
        .mark(rect({ w: 1 }))
        .name("whisker"),
      chart()
        .flow(
          derive(box),
          scatter({
            yMin: field("q1", "Production Budget"),
            yMax: field("q3", "Production Budget"),
          })
        )
        .mark(rect({ w: 14 }))
        .name("box"),
      chart()
        .flow(derive(box), scatter({ y: field("median", "Production Budget") }))
        .mark(rect({ w: 14, h: 1, fill: "white" }))
        .name("median"),
      chart()
        .flow(derive(outliers), scatter({ y: "Production Budget" }))
        .mark(circle({ r: 2 }))
        .name("outliers"),
    ]).relate(({ whisker, box, median, outliers }) => [
      Constraint.align({ x: "middle" }, [whisker, box, median, outliers]),
    ])
  );
