// Render a GoFish spec to PNG. A spec is an ES module (top-level await allowed)
// whose default export is an unrendered GoFish builder; this saver supplies the
// container and the 400x400 size, as the Altair saver does.
//
// usage: node notations/savers/gofish_render.mjs <spec.mjs> <out.png>
//
// GoFish measures text with the browser, so the spec is bundled with esbuild and
// run in headless Chromium (Playwright). `gofish-graphics` resolves to the built
// dist of the GoFish checkout in $GOFISH_DIR. Relative fetches (e.g.
// "data/movies.csv") resolve against the spec's own directory, as for the other
// notations.
import * as path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import * as esbuild from "esbuild";
import { chromium } from "playwright";

const [, , input, output] = process.argv;
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "../..");
if (!process.env.GOFISH_DIR) {
  console.error(
    "Set GOFISH_DIR to a gofish-graphics checkout with a built dist (pnpm --filter gofish-graphics build)."
  );
  process.exit(1);
}
const gofishDir = path.resolve(process.env.GOFISH_DIR);
const gofishDist = path.join(gofishDir, "packages/gofish-graphics/dist/index.js");

const specPath = path.resolve(input);
const specDir = path.dirname(specPath);

const bundle = await esbuild.build({
  stdin: {
    contents: `import chart from ${JSON.stringify(specPath)};
const root = document.createElement("div");
await chart.render(root, { w: 400, h: 400 });
window.__chart = root;`,
    resolveDir: specDir,
    loader: "js",
  },
  bundle: true,
  write: false,
  format: "esm",
  platform: "browser",
  alias: { "gofish-graphics": gofishDist },
  nodePaths: [path.join(repo, "node_modules")],
  logLevel: "error",
});
const js = bundle.outputFiles[0].text;

const ORIGIN = "http://notascope.local";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 800, height: 800 },
    deviceScaleFactor: 1,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.route(`${ORIGIN}/**`, async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/index.html") {
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html><meta charset="utf-8"><body style="margin:0;background:white"><script type="module">${js.replace(
          /<\/script/g,
          "<\\/script"
        )}</script></body>`,
      });
    }
    try {
      const body = await fs.readFile(
        path.join(specDir, decodeURIComponent(url.pathname))
      );
      return route.fulfill({ body });
    } catch {
      return route.fulfill({ status: 404, body: "not found" });
    }
  });
  await page.goto(`${ORIGIN}/index.html`);
  // The spec module runs (and top-level awaits) asynchronously after load;
  // wait until it has rendered, or stop at the first page error.
  const rendered = page.waitForFunction(() => window.__chart, null, {
    timeout: 60000,
  });
  const failed = new Promise((_, reject) =>
    page.on("pageerror", (e) => reject(e))
  );
  await Promise.race([rendered, failed]);
  await page.evaluate(async () => {
    const node = window.__chart;
    const wrap = document.createElement("div");
    wrap.id = "__out";
    wrap.style.display = "inline-block";
    wrap.style.padding = "10px";
    wrap.append(node);
    document.body.append(wrap);
    await document.fonts.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  if (errors.length) console.error(errors.join("\n"));
  await page.locator("#__out").screenshot({ path: output });
} finally {
  await browser.close();
}
