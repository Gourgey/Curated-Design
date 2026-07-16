"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "_site");
const outputArgument = process.argv.find((argument) => argument.startsWith("--output="));
const onlyArgument = process.argv.find((argument) => argument.startsWith("--only="));
const stylesheetGitRefArgument = process.argv.find((argument) =>
  argument.startsWith("--stylesheet-git-ref="),
);
const stylesheetFileArgument = process.argv.find((argument) =>
  argument.startsWith("--stylesheet-file="),
);
const widthsArgument = process.argv.find((argument) => argument.startsWith("--widths="));
const referenceRoot = outputArgument
  ? path.resolve(root, outputArgument.slice("--output=".length))
  : path.join(root, "tests/visual/reference");
const only = onlyArgument ? onlyArgument.slice("--only=".length) : "";
const stylesheetGitRef = stylesheetGitRefArgument
  ? stylesheetGitRefArgument.slice("--stylesheet-git-ref=".length)
  : "";
const stylesheetFile = stylesheetFileArgument
  ? stylesheetFileArgument.slice("--stylesheet-file=".length)
  : "";
const stylesheetOverride = stylesheetGitRef
  ? execFileSync("git", ["show", `${stylesheetGitRef}:assets/css/styles.css`], {
      cwd: root,
      encoding: "utf8",
    })
  : stylesheetFile
    ? fs.readFileSync(path.resolve(root, stylesheetFile), "utf8")
    : "";
const widths = widthsArgument
  ? widthsArgument
      .slice("--widths=".length)
      .split(",")
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isFinite(value) && value > 0)
  : [390, 768, 1440];
const pages = [
  { name: "home", route: "/" },
  { name: "work", route: "/projects.html" },
  { name: "services-index", route: "/curated_services.html" },
  { name: "studio", route: "/about.html" },
  { name: "contact", route: "/contact.html" },
  { name: "project", route: "/projects/marylebone_residence_lobby.html" },
  { name: "service", route: "/curated_services/concept_design.html" },
  { name: "apps-index", route: "/apps/index.html" },
];

const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
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

async function preparePage(browser, route, width) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width <= 390 ? 844 : width <= 768 ? 1024 : 1000 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setRequestInterception(true);
  page.on("request", (request) => {
    const file = localFileForRequest(request.url());
    if (file && fs.existsSync(file) && fs.statSync(file).isFile()) {
      const isStylesheet = path.normalize(file) === path.join(outputRoot, "assets", "css", "styles.css");
      request.respond({
        status: 200,
        contentType: contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream",
        body: isStylesheet && stylesheetOverride ? stylesheetOverride : fs.readFileSync(file),
      });
      return;
    }
    if (request.url().startsWith("https://fonts.googleapis.com/") || request.url().startsWith("https://fonts.gstatic.com/")) {
      request.continue();
      return;
    }
    request.abort();
  });

  await page.goto(pathToFileURL(routeToFile(route)).href, { waitUntil: "load" });
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.max(400, window.innerHeight * 0.75)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 30));
    }
    window.scrollTo(0, 0);
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  });
  return page;
}

async function capture(page, name, width, fullPage = true) {
  const file = path.join(referenceRoot, `${name}-${width}.webp`);
  await page.screenshot({ path: file, type: "webp", quality: 82, fullPage });
  console.log(path.relative(root, file));
}

async function main() {
  const executablePath = findChrome();
  if (!executablePath) throw new Error("Chrome or Chromium was not found. Set CHROME_PATH.");
  fs.mkdirSync(referenceRoot, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--allow-file-access-from-files"],
  });

  try {
    for (const entry of pages.filter((entry) => !only || entry.name === only)) {
      for (const width of widths) {
        const page = await preparePage(browser, entry.route, width);
        await capture(page, entry.name, width);
        await page.close();
      }
    }

    for (const width of only && only !== "navigation-open" ? [] : [390, 768]) {
      const page = await preparePage(browser, "/", width);
      await page.click("[aria-controls='floatingPillMenu']");
      await page.waitForSelector("#floatingNavPill.is-open");
      await capture(page, "navigation-open", width, false);
      await page.close();
    }

    for (const width of only && !only.startsWith("contact-") ? [] : widths) {
      const errorPage = await preparePage(browser, "/contact.html", width);
      await errorPage.evaluate(() => {
        const error = document.querySelector("#contactFormError");
        error.classList.remove("hidden");
        error.setAttribute("tabindex", "-1");
      });
      if (!only || only === "contact-error") await capture(errorPage, "contact-error", width);
      await errorPage.close();

      const successPage = await preparePage(browser, "/contact.html", width);
      await successPage.evaluate(() => {
        document.querySelector("#contactForm").classList.add("hidden");
        document.querySelector("#contactFormSuccess").classList.remove("hidden");
      });
      if (!only || only === "contact-success") await capture(successPage, "contact-success", width);
      await successPage.close();
    }
  } finally {
    await browser.close();
  }

  const files = fs.readdirSync(referenceRoot).filter((file) => file.endsWith(".webp"));
  const bytes = files.reduce((total, file) => total + fs.statSync(path.join(referenceRoot, file)).size, 0);
  console.log(`Captured ${files.length} references (${(bytes / 1024 / 1024).toFixed(1)} MiB).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
