// Render a Flint ChartAssemblyInput (JSON) to PNG via Flint's own host renderer.
// Usage: node flint_render.mjs <spec.json> <out.png>
// `data.url` is resolved by flint-chart-mcp's resolveDataSource (relative to cwd,
// i.e. the notascope root), then compiled with flint-chart to Vega-Lite and rasterized.
import { readFileSync, writeFileSync } from 'node:fs';
import { renderChart, assembleForBackend } from 'flint-chart-mcp/render';

const [specPath, outPath] = process.argv.slice(2);
const input = JSON.parse(readFileSync(specPath, 'utf8'));
input.chart_spec.baseSize ??= { width: 400, height: 400 };

if (process.env.FLINT_DUMP_VL) {
  writeFileSync(process.env.FLINT_DUMP_VL, JSON.stringify(assembleForBackend('vegalite', input).spec, null, 1));
}
const result = await renderChart(input, 'vegalite', { format: 'png' });
for (const w of result.warnings ?? []) console.error(`[flint] ${specPath}: ${w.message ?? JSON.stringify(w)}`);
writeFileSync(outPath, result.buffer);
