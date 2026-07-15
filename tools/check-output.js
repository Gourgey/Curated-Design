"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const root = path.resolve(__dirname, "..");
const outputRoot = path.join(root, "_site");
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath];
  });
}

function fail(file, message) {
  errors.push(`${path.relative(outputRoot, file)}: ${message}`);
}

function countMatches(value, pattern) {
  return Array.from(value.matchAll(pattern)).length;
}

function stripUrlSuffix(url) {
  return url.split("#", 1)[0].split("?", 1)[0];
}

function resolveOutputTarget(sourceFile, rawUrl) {
  const cleanUrl = stripUrlSuffix(rawUrl);
  if (!cleanUrl) return sourceFile;
  let target = cleanUrl.startsWith("/")
    ? path.join(outputRoot, decodeURIComponent(cleanUrl.slice(1)))
    : path.resolve(path.dirname(sourceFile), decodeURIComponent(cleanUrl));

  if (cleanUrl.endsWith("/") || (fs.existsSync(target) && fs.statSync(target).isDirectory())) {
    target = path.join(target, "index.html");
  }
  return target;
}

function isExternalUrl(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

if (!fs.existsSync(outputRoot)) {
  console.error("Generated site is missing. Run npm run build before check:site.");
  process.exit(1);
}

const files = walk(outputRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html")).sort();
const publicHtmlFiles = htmlFiles.filter(
  (file) => path.relative(outputRoot, file) !== path.join("admin", "index.html"),
);
let imageCount = 0;
let formCount = 0;
let internalLinkCount = 0;

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  imageCount += countMatches(html, /<img\b/gi);
  formCount += countMatches(html, /<form\b/gi);

  if (publicHtmlFiles.includes(file)) {
    if (!/<title>\s*[^<]+\s*<\/title>/i.test(html)) fail(file, "missing non-empty title");
    if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']/i.test(html)) {
      fail(file, "missing non-empty meta description");
    }
    if (countMatches(html, /<main\b/gi) !== 1) fail(file, "must contain exactly one main landmark");
    if (!/<main\b[^>]*\bid=["']main-content["']/i.test(html)) {
      fail(file, "main landmark must provide the #main-content skip-link target");
    }
    if (countMatches(html, /<h1\b/gi) !== 1) fail(file, "must contain exactly one h1");
  }

  const ids = Array.from(html.matchAll(/\sid=["']([^"']+)["']/gi), (match) => match[1]);
  const seenIds = new Set();
  ids.forEach((id) => {
    if (seenIds.has(id)) fail(file, `duplicate id "${id}"`);
    seenIds.add(id);
  });

  const attributes = Array.from(
    html.matchAll(/\s(href|src)=["']([^"']+)["']/gi),
    (match) => ({ name: match[1].toLowerCase(), value: match[2] }),
  );
  internalLinkCount += Array.from(
    html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi),
    (match) => match[1],
  ).filter((value) => !isExternalUrl(value)).length;
  attributes.forEach(({ name, value }) => {
    if (!value || value.startsWith("#") || isExternalUrl(value)) {
      return;
    }
    const target = resolveOutputTarget(file, value);
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      fail(file, `${name} points to missing local target "${value}"`);
      return;
    }

    const fragment = value.includes("#") ? value.slice(value.indexOf("#") + 1).split("?", 1)[0] : "";
    if (fragment && target.endsWith(".html")) {
      const targetHtml = fs.readFileSync(target, "utf8");
      const escapedFragment = fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (!new RegExp(`\\sid=["']${escapedFragment}["']`, "i").test(targetHtml)) {
        fail(file, `fragment target "${value}" does not exist`);
      }
    }
  });

  Array.from(html.matchAll(/\ssrcset=["']([^"']+)["']/gi), (match) => match[1]).forEach(
    (srcset) => {
      srcset.split(",").forEach((candidate) => {
        const value = candidate.trim().split(/\s+/, 1)[0];
        if (!value || isExternalUrl(value)) return;
        const target = resolveOutputTarget(file, value);
        if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
          fail(file, `srcset points to missing local target "${value}"`);
        }
      });
    },
  );
});

const sitemapPath = path.join(outputRoot, "sitemap.xml");
const sitemap = fs.readFileSync(sitemapPath, "utf8");
const projectEntries = fs
  .readdirSync(path.join(root, "src/content/projects"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => matter.read(path.join(root, "src/content/projects", file)).data);

projectEntries.forEach((project) => {
  const route = `/projects/${project.slug}.html`;
  const outputPath = path.join(outputRoot, route.slice(1));
  const sitemapHasRoute = sitemap.includes(route);
  if (project.status === "draft") {
    if (fs.existsSync(outputPath)) fail(outputPath, "draft project was generated");
    if (sitemapHasRoute) fail(sitemapPath, `draft project appears in sitemap: ${route}`);
    return;
  }

  if (!fs.existsSync(outputPath)) {
    fail(sitemapPath, `non-draft project page was not generated: ${route}`);
    return;
  }
  const html = fs.readFileSync(outputPath, "utf8");
  if (project.status === "coming_soon") {
    if (!/<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i.test(html)) {
      fail(outputPath, "coming-soon project must be noindex, follow");
    }
    if (sitemapHasRoute) fail(sitemapPath, `coming-soon project appears in sitemap: ${route}`);
  } else if (!sitemapHasRoute) {
    fail(sitemapPath, `published project is missing from sitemap: ${route}`);
  }
});

htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  Array.from(html.matchAll(/<form\b[^>]*\bdata-netlify=["']true["'][^>]*>/gi), (match) => match[0]).forEach(
    (formTag) => {
      if (!/\baction=["']\/thank-you\/["']/i.test(formTag)) {
        fail(file, "Netlify form must use /thank-you/ as its non-JavaScript success destination");
      }
    },
  );
});

[
  path.join(outputRoot, "admin/index.html"),
  path.join(outputRoot, "thank-you/index.html"),
].forEach((file) => {
  const html = fs.readFileSync(file, "utf8");
  if (!/<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i.test(html)) {
    fail(file, "support page must be noindex, follow");
  }
});

if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  console.error(`Generated-site check failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(
    `Generated-site check passed: ${htmlFiles.length} HTML pages, ${imageCount} images, ${formCount} forms, ${internalLinkCount} internal link references.`,
  );
}
