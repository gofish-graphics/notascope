import * as d3 from "d3";
import * as gf from "gofish-graphics";

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

export const chart = gf
  .chart(movies, { axes: true })
  .flow(gf.spread({ by: "Major Genre", dir: "x" }))
  .mark(
    gf
      .layer([
        gf
          .chart()
          .flow(
            gf.derive(box),
            gf.scatter({
              yMin: gf.field("min", "Production Budget"),
              yMax: gf.field("max", "Production Budget"),
            })
          )
          .mark(gf.rect({ w: 1 }))
          .name("whisker"),
        gf
          .chart()
          .flow(
            gf.derive(box),
            gf.scatter({
              yMin: gf.field("q1", "Production Budget"),
              yMax: gf.field("q3", "Production Budget"),
            })
          )
          .mark(gf.rect({ w: 14 }))
          .name("box"),
        gf
          .chart()
          .flow(
            gf.derive(box),
            gf.scatter({ y: gf.field("median", "Production Budget") })
          )
          .mark(gf.rect({ w: 14, h: 1, fill: "white" }))
          .name("median"),
        gf
          .chart()
          .flow(gf.derive(outliers), gf.scatter({ y: "Production Budget" }))
          .mark(gf.circle({ r: 2 }))
          .name("outliers"),
      ])
      .relate(({ whisker, box, median, outliers }) => [
        gf.Constraint.align({ x: "middle" }, [whisker, box, median, outliers]),
      ])
  );
