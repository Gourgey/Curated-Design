// Local preview of _site/ that applies netlify.toml's [[headers]] rules, so
// pages are tested under the same Content-Type and Content-Security-Policy
// they get in production (e.g. the extension-less /auth/* pages).
//
// Precedence mirrors what the live site does: when several rules set the
// same header, the most specific "for" pattern wins (an exact path beats a
// splat). Usage: node tools/preview-server.js [port] [--offline]
"use strict";

const fs = require("fs");
const http = require("http");
const path = require("path");

const root = path.resolve(__dirname, "..");
const siteRoot = path.join(root, "_site");
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const port = Number(args.find((arg) => /^\d+$/.test(arg)) || process.env.PORT || 4174);

const types = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "text/javascript; charset=UTF-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".xml": "application/xml",
  ".txt": "text/plain; charset=UTF-8",
};

function parseHeaderRules() {
  const toml = fs.readFileSync(path.join(root, "netlify.toml"), "utf8");
  return toml
    .split(/(?=\[\[headers\]\])/)
    .filter((block) => block.startsWith("[[headers]]"))
    .map((block) => {
      const forMatch = block.match(/^\s*for\s*=\s*"([^"]+)"/m);
      const values = {};
      const valuesSection = block.split(/\[headers\.values\]/)[1] || "";
      valuesSection.split("\n").forEach((line) => {
        const m = line.match(/^\s*([A-Za-z-]+)\s*=\s*"(.*)"\s*$/);
        if (m) values[m[1]] = m[2];
      });
      return { pattern: forMatch && forMatch[1], values };
    })
    .filter((rule) => rule.pattern);
}

function matches(pattern, pathname) {
  if (pattern.endsWith("/*")) return pathname.startsWith(pattern.slice(0, -1));
  return pattern === pathname;
}

function specificity(pattern) {
  return pattern.endsWith("*") ? pattern.length : 10000 + pattern.length;
}

function headersFor(pathname) {
  const result = {};
  parseHeaderRules()
    .filter((rule) => matches(rule.pattern, pathname))
    .sort((a, b) => specificity(a.pattern) - specificity(b.pattern))
    .forEach((rule) => Object.assign(result, rule.values));
  return result;
}

// Exact-path rules from the built _redirects file (this site uses no splats
// or placeholders), matched with or without a trailing slash as Netlify does.
function redirectFor(pathname) {
  const file = path.join(siteRoot, "_redirects");
  if (!fs.existsSync(file)) return null;
  const strip = (value) => (value.length > 1 ? value.replace(/\/$/, "") : value);
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const [from, to, status] = line.trim().split(/\s+/);
    if (!from || from.startsWith("#") || !to) continue;
    if (strip(from) === strip(pathname)) return { to, status: Number(status) || 301 };
  }
  return null;
}

function resolveFile(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = path.normalize(path.join(siteRoot, decoded));
  if (!candidate.startsWith(siteRoot)) return null;
  for (const option of [candidate, path.join(candidate, "index.html"), `${candidate}.html`]) {
    if (fs.existsSync(option) && fs.statSync(option).isFile()) return option;
  }
  return null;
}

http
  .createServer((req, res) => {
    const { pathname } = new URL(req.url, "http://localhost");
    const redirect = redirectFor(pathname);
    if (redirect) {
      res.writeHead(redirect.status, { Location: redirect.to });
      res.end();
      return;
    }
    const file = resolveFile(pathname);
    const headers = headersFor(pathname);
    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    const type = types[path.extname(file)] || "application/octet-stream";
    // Local preview is plain http: upgrade-insecure-requests and HSTS would
    // break same-origin loads here, so drop them.
    if (headers["Content-Security-Policy"]) {
      headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace(
        /;?\s*upgrade-insecure-requests/,
        "",
      );
    }
    delete headers["Strict-Transport-Security"];
    // --offline: block every cross-origin request (e.g. /auth/confirm's call
    // to Supabase) to exercise network-failure handling.
    if (offline && headers["Content-Security-Policy"]) {
      headers["Content-Security-Policy"] = headers["Content-Security-Policy"].replace(
        /connect-src [^;]*/,
        "connect-src 'self'",
      );
    }
    res.writeHead(200, { "Content-Type": type, ...headers });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => {
    console.log(`Previewing _site with netlify.toml headers at http://localhost:${port}`);
  });
