"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "_site");
const axePath = require.resolve("axe-core/axe.min.js");

const scans = [
  { label: "Homepage mobile", route: "/", width: 390, height: 844 },
  { label: "Homepage mobile menu", route: "/", width: 390, height: 844, openMenu: true },
  { label: "Work mobile", route: "/projects.html", width: 390, height: 844 },
  {
    label: "Published project mobile",
    route: "/projects/marylebone_residence_lobby.html",
    width: 390,
    height: 844,
  },
  {
    label: "Service mobile",
    route: "/curated_services/concept_design.html",
    width: 390,
    height: 844,
  },
  { label: "Studio mobile", route: "/about.html", width: 390, height: 844 },
  { label: "Contact mobile", route: "/contact.html", width: 390, height: 844 },
  { label: "Homepage desktop", route: "/", width: 1440, height: 1000 },
];

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}

function routeToFile(route) {
  let relativePath = route.replace(/^\/+/, "");
  if (!relativePath || route.endsWith("/")) relativePath = path.join(relativePath, "index.html");
  return path.join(outputRoot, relativePath);
}

function localFileForRequest(requestUrl) {
  if (!requestUrl.startsWith("file:")) return null;
  const pathname = decodeURIComponent(new URL(requestUrl).pathname);
  if (pathname === outputRoot || pathname.startsWith(`${outputRoot}${path.sep}`)) {
    return pathname;
  }
  return path.join(outputRoot, pathname.replace(/^\/+/, ""));
}

async function main() {
  if (!fs.existsSync(outputRoot)) {
    throw new Error("Generated site is missing. Run npm run build before check:a11y.");
  }

  const executablePath = findChrome();
  if (!executablePath) {
    throw new Error("Chrome or Chromium was not found. Set CHROME_PATH to its executable.");
  }

  let browser;
  const failures = [];
  let nonBlockingViolationCount = 0;

  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
    });

    for (const scan of scans) {
      console.log(`Scanning: ${scan.label}`);
      const page = await browser.newPage();
      await page.setViewport({ width: scan.width, height: scan.height, deviceScaleFactor: 1 });
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["font", "image", "media"].includes(request.resourceType())) {
          return request.abort();
        }
        if (request.url().startsWith("data:")) return request.continue();
        const file = localFileForRequest(request.url());
        if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) return request.abort();
        return request.respond({
          status: 200,
          contentType: contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
          body: fs.readFileSync(file),
        });
      });

      await page.goto(pathToFileURL(routeToFile(scan.route)).href, {
        waitUntil: "domcontentloaded",
      });
      if (scan.openMenu) {
        await page.click("[aria-controls='floatingPillMenu']");
        await page.waitForSelector("#floatingNavPill.is-open");
        await page.waitForFunction(() =>
          document.activeElement.matches("#floatingPillMenu a[href]"),
        );
        await page.keyboard.down("Shift");
        await page.keyboard.press("Tab");
        await page.keyboard.up("Shift");
        const shiftTabTarget = await page.evaluate(() => document.activeElement.getAttribute("aria-controls"));
        if (shiftTabTarget !== "floatingPillMenu") {
          throw new Error("Mobile menu focus trap did not move backwards to the menu trigger.");
        }
        await page.keyboard.press("Tab");
      }
      await page.addScriptTag({ path: axePath });
      const results = await page.evaluate(async () => {
        return window.axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
          },
          resultTypes: ["violations"],
        });
      });

      const blocking = results.violations.filter(
        (violation) => violation.impact === "critical" || violation.impact === "serious",
      );
      nonBlockingViolationCount += results.violations.length - blocking.length;
      blocking.forEach((violation) => {
        failures.push({
          scan: scan.label,
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          targets: violation.nodes.flatMap((node) => node.target.map(String)),
        });
      });
      if (scan.openMenu) {
        await page.keyboard.press("Escape");
        await page.waitForFunction(() =>
          document.querySelector("[aria-controls='floatingPillMenu']").getAttribute("aria-expanded") ===
          "false",
        );
        const closeState = await page.evaluate(() => ({
          focusRestored:
            document.activeElement.getAttribute("aria-controls") === "floatingPillMenu",
          scrollUnlocked: !document.body.classList.contains("nav-open"),
          mainAvailable: !document.querySelector("main").inert,
        }));
        if (!closeState.focusRestored || !closeState.scrollUnlocked || !closeState.mainAvailable) {
          throw new Error("Mobile menu did not restore focus and background state after Escape.");
        }
      }
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
  }

  if (failures.length) {
    failures.forEach((failure) => {
      console.error(
        `ERROR: ${failure.scan}: [${failure.impact}] ${failure.id} — ${failure.help}`,
      );
      console.error(`  ${failure.targets.join("\n  ")}`);
    });
    throw new Error(`Accessibility check found ${failures.length} critical/serious violation(s).`);
  }

  console.log(
    `Accessibility check passed: ${scans.length} representative Axe scans plus the mobile-menu focus smoke test, no critical/serious violations, ${nonBlockingViolationCount} non-blocking violation(s).`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
