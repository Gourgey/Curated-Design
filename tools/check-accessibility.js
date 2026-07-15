"use strict";

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "_site");
const axePath = require.resolve("axe-core/axe.min.js");

const scans = [
  { label: "Homepage mobile", route: "/", width: 390, height: 844, featuredProject: true },
  { label: "Homepage mobile menu", route: "/", width: 390, height: 844, openMenu: true },
  { label: "Work mobile", route: "/projects.html", width: 390, height: 844 },
  {
    label: "Published project mobile",
    route: "/projects/marylebone_residence_lobby.html",
    width: 390,
    height: 844,
    projectCarousel: true,
  },
  {
    label: "Service mobile",
    route: "/curated_services/concept_design.html",
    width: 390,
    height: 844,
    enquiryForm: "service-enquiry",
  },
  { label: "Studio mobile", route: "/about.html", width: 390, height: 844 },
  {
    label: "Contact mobile",
    route: "/contact.html",
    width: 390,
    height: 844,
    enquiryForm: "contact",
  },
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

async function checkFeaturedProject(page) {
  const state = await page.evaluate(() => {
    const carousel = document.querySelector("#portfolio .carousel");
    const links = Array.from(document.querySelectorAll("#portfolio .featured-project"));
    const slides = Array.from(document.querySelectorAll("#portfolio .slide"));
    const dots = Array.from(document.querySelectorAll("#portfolio .dots button"));
    return {
      linkCount: links.length,
      hrefs: links.map((link) => link.getAttribute("href")),
      titles: links.map((link) => link.querySelector(".featured-project__title")?.textContent.trim()),
      statuses: links.map((link) => link.querySelector(".featured-project__status")?.textContent.trim()),
      carouselControls: document.querySelectorAll("#portfolio .ctrl, #portfolio .dots").length,
      carouselLabel: carousel?.getAttribute("aria-label"),
      activeSlides: slides.filter((slide) => slide.getAttribute("aria-current") === "true").length,
      hiddenSlides: slides.filter((slide) => slide.getAttribute("aria-hidden") === "true").length,
      dotCount: dots.length,
      activeDots: dots.filter((dot) => dot.getAttribute("aria-current") === "true").length,
    };
  });
  const expectedHrefs = [
    "/projects/garden_restaurant.html",
    "/projects/shoreditch_office.html",
  ];
  if (
    state.linkCount !== 2 ||
    JSON.stringify(state.hrefs) !== JSON.stringify(expectedHrefs) ||
    state.titles.some((title) => !title) ||
    state.statuses.some((status) => status !== "Coming soon") ||
    state.carouselControls !== 3 ||
    !state.carouselLabel ||
    state.activeSlides !== 1 ||
    state.hiddenSlides !== 1 ||
    state.dotCount !== 2 ||
    state.activeDots !== 1
  ) {
    throw new Error(`Homepage featured-project contract failed: ${JSON.stringify(state)}`);
  }

  await page.focus("#portfolio .carousel");
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => {
    const slides = document.querySelectorAll("#portfolio .slide");
    const dots = document.querySelectorAll("#portfolio .dots button");
    return slides[1]?.getAttribute("aria-current") === "true" && dots[1]?.getAttribute("aria-current") === "true";
  });
  await page.click("#portfolio .dots button:first-child");
}

async function checkProjectCarousel(page) {
  const initialState = await page.evaluate(() => {
    const carousel = document.querySelector("[data-project-carousel]");
    const slides = Array.from(carousel?.querySelectorAll("[role='group'][aria-roledescription='slide']") || []);
    const dots = Array.from(carousel?.querySelectorAll("[data-project-carousel-dots] button") || []);
    return {
      carouselLabel: carousel?.getAttribute("aria-label"),
      slideCount: slides.length,
      activeSlides: slides.filter((slide) => slide.getAttribute("aria-current") === "true").length,
      hiddenSlides: slides.filter((slide) => slide.getAttribute("aria-hidden") === "true").length,
      dotCount: dots.length,
      activeDots: dots.filter((dot) => dot.getAttribute("aria-current") === "true").length,
      nonButtonControls: Array.from(carousel?.querySelectorAll("button") || []).filter(
        (button) => button.type !== "button",
      ).length,
    };
  });
  if (
    !initialState.carouselLabel ||
    initialState.slideCount !== 3 ||
    initialState.activeSlides !== 1 ||
    initialState.hiddenSlides !== 2 ||
    initialState.dotCount !== 3 ||
    initialState.activeDots !== 1 ||
    initialState.nonButtonControls !== 0
  ) {
    throw new Error(`Project carousel initial state failed: ${JSON.stringify(initialState)}`);
  }

  await page.focus("[data-project-carousel]");
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction(() => {
    const slides = document.querySelectorAll("[data-project-carousel] [aria-roledescription='slide']");
    const dots = document.querySelectorAll("[data-project-carousel-dots] button");
    return slides[1]?.getAttribute("aria-current") === "true" && dots[1]?.getAttribute("aria-current") === "true";
  });
  await page.click("[data-project-carousel-dots] button:first-child");
  await page.waitForFunction(() =>
    document
      .querySelector("[data-project-carousel] [aria-roledescription='slide']")
      ?.getAttribute("aria-current") === "true",
  );
}

async function checkEnquiryForm(page, expectedName) {
  const selector = `[data-enhanced-netlify-form][name="${expectedName}"]`;
  const initialState = await page.evaluate((formSelector) => {
    const form = document.querySelector(formSelector);
    const success = document.getElementById(form?.getAttribute("data-success-target"));
    const error = form?.querySelector("[data-form-error]");
    const privacyLink = form?.querySelector('a[href="/privacy-notice.html"]');
    const honeypot = form?.querySelector('[name="bot-field"]');
    return {
      formCount: document.querySelectorAll(formSelector).length,
      action: form?.getAttribute("action"),
      method: form?.getAttribute("method")?.toLowerCase(),
      submitType: form?.querySelector("[data-form-submit]")?.getAttribute("type"),
      successHidden: success ? getComputedStyle(success).display === "none" : false,
      errorHidden: error ? getComputedStyle(error).display === "none" : false,
      honeypotHidden: honeypot ? honeypot.getClientRects().length === 0 : false,
      privacyHref: privacyLink?.getAttribute("href"),
    };
  }, selector);

  if (
    initialState.formCount !== 1 ||
    initialState.action !== "/thank-you/" ||
    initialState.method !== "post" ||
    initialState.submitType !== "submit" ||
    !initialState.successHidden ||
    !initialState.errorHidden ||
    !initialState.honeypotHidden ||
    initialState.privacyHref !== "/privacy-notice.html"
  ) {
    throw new Error(`Enquiry form fallback contract failed: ${JSON.stringify(initialState)}`);
  }

  const validBeforeSubmit = await page.evaluate((formSelector) => {
    const form = document.querySelector(formSelector);
    form.querySelectorAll("[required]").forEach((field) => {
      field.value = field.type === "email" ? "studio@example.com" : "Test project enquiry";
    });
    window.fetch = async () => ({ ok: false, status: 503 });
    const valid = form.checkValidity();
    form.requestSubmit();
    return valid;
  }, selector);
  if (!validBeforeSubmit) throw new Error(`${expectedName} test data did not satisfy form validation.`);

  await page.waitForFunction(
    (formSelector) => {
      const form = document.querySelector(formSelector);
      const error = form.querySelector("[data-form-error]");
      return !error.classList.contains("hidden") && document.activeElement === error;
    },
    {},
    selector,
  );
  const failureState = await page.evaluate((formSelector) => {
    const form = document.querySelector(formSelector);
    const error = form.querySelector("[data-form-error]");
    const submit = form.querySelector("[data-form-submit]");
    const label = form.querySelector("[data-form-submit-label]");
    return {
      errorFocused: document.activeElement === error,
      submitEnabled: !submit.disabled,
      labelRestored: label.textContent.trim() !== "Sending…",
      valuesPreserved: Array.from(form.querySelectorAll("[required]")).every(
        (field) => field.value.length > 0,
      ),
    };
  }, selector);
  if (Object.values(failureState).some((value) => !value)) {
    throw new Error(`Enquiry form failure state failed: ${JSON.stringify(failureState)}`);
  }

  await page.evaluate((formSelector) => {
    window.fetch = async () => ({ ok: true, status: 200 });
    document.querySelector(formSelector).requestSubmit();
  }, selector);
  await page.waitForFunction(
    (formSelector) => {
      const form = document.querySelector(formSelector);
      const success = document.getElementById(form.getAttribute("data-success-target"));
      return form.classList.contains("hidden") &&
        !success.classList.contains("hidden") &&
        document.activeElement === success;
    },
    {},
    selector,
  );
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
      if (scan.featuredProject) await checkFeaturedProject(page);
      if (scan.projectCarousel) await checkProjectCarousel(page);
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
      if (scan.enquiryForm) await checkEnquiryForm(page, scan.enquiryForm);
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
    `Accessibility check passed: ${scans.length} representative Axe scans plus navigation, featured-project, carousel, and enquiry-form interaction smoke tests; no critical/serious violations, ${nonBlockingViolationCount} non-blocking violation(s).`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
