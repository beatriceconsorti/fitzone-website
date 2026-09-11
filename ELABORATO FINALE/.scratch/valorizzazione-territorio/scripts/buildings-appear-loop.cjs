/**
 * Feedback loop: after refresh, 3D buildings must be in the scene within 400ms.
 * Red = user's symptom (refresh, no buildings yet).
 * Usage: npx --yes -p puppeteer-core node scripts/buildings-appear-loop.cjs
 */
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer-core");

const URL =
  process.env.PROTO_URL ||
  "http://localhost:59593/prototype-mappa.html?loop=1#variant=A";
const IMMEDIATE_MS = 400;
const BUDGET_MS = 15000;

const CHROMES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  path.join(
    process.env.LOCALAPPDATA || "",
    "Google\\Chrome\\Application\\chrome.exe"
  ),
  path.join(
    process.env.PROGRAMFILES || "",
    "Microsoft\\Edge\\Application\\msedge.exe"
  ),
].filter(Boolean);

function chromePath() {
  for (const p of CHROMES) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error("Chrome/Edge not found");
}

async function sample(page) {
  return page.evaluate(() => {
    const a = window.__buildingsAppear || null;
    const canvas = document.querySelector("#map canvas");
    return {
      now: performance.now(),
      appear: a,
      canvas: !!canvas,
    };
  });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--use-gl=angle", "--hide-scrollbars"],
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(BUDGET_MS);
  const navStart = Date.now();
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  const samples = [];
  const tEnd = Date.now() + BUDGET_MS;
  let firstGeo = null;
  while (Date.now() < tEnd) {
    const s = await sample(page);
    samples.push({ wallMs: Date.now() - navStart, ...s });
    if (
      !firstGeo &&
      s.appear &&
      (s.appear.sceneReadyMs != null || s.appear.geojsonMs != null)
    ) {
      firstGeo = s;
      break;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  await browser.close();

  const last = samples[samples.length - 1];
  const a = last && last.appear;
  const afterMapMs =
    a && a.osmbMs != null && a.sceneReadyMs != null
      ? a.sceneReadyMs - a.osmbMs
      : a && a.osmbMs != null && a.geojsonMs != null
        ? a.geojsonMs - a.osmbMs
        : null;
  const red = afterMapMs == null || afterMapMs > IMMEDIATE_MS;
  const report = {
    url: URL,
    immediateMs: IMMEDIATE_MS,
    red,
    reason: red
      ? "buildings not in scene within " +
        IMMEDIATE_MS +
        "ms after OSMBuildings init"
      : "buildings present within " +
        IMMEDIATE_MS +
        "ms after OSMBuildings init",
    afterMapMs,
    how: a && a.how,
    firstGeoWallMs: firstGeo ? firstGeo.wallMs : null,
    last: last,
    sampleCount: samples.length,
  };
  console.log(JSON.stringify(report, null, 2));
  process.exit(red ? 1 : 0);
})().catch((err) => {
  console.error(err);
  process.exit(2);
});
