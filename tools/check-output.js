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

  const attributes = Array.from(html.matchAll(/\s(href|src)=["']([^"']+)["']/gi), (match) => ({
    name: match[1].toLowerCase(),
    value: match[2],
  }));
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

    const fragment = value.includes("#")
      ? value.slice(value.indexOf("#") + 1).split("?", 1)[0]
      : "";
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
const procureCoreAppID = "5865Y52YG7.studio.curateddesign.ProcureCore";
const recoveryRoute = "/auth/recovery";
const recoveryPath = path.join(outputRoot, recoveryRoute.slice(1));
const aasaPath = path.join(outputRoot, ".well-known/apple-app-site-association");
const netlifyConfigPath = path.join(root, "netlify.toml");

if (!fs.existsSync(recoveryPath) || !fs.statSync(recoveryPath).isFile()) {
  fail(recoveryPath, `recovery fallback was not generated at ${recoveryRoute}`);
} else {
  const recoveryHtml = fs.readFileSync(recoveryPath, "utf8");
  if (!/<h1\b[^>]*>\s*Open this link in ProcureCore\s*<\/h1>/i.test(recoveryHtml)) {
    fail(recoveryPath, "missing the recovery fallback heading");
  }
  if (
    !recoveryHtml.includes(
      "This password-reset universal link is currently for iPhone or iPad.",
    )
  ) {
    fail(recoveryPath, "must identify the current universal-link flow as iPhone/iPad-only");
  }
  if (!/<main\b[^>]*\bid=["']main-content["']/i.test(recoveryHtml)) {
    fail(recoveryPath, "main landmark must provide the #main-content skip-link target");
  }
  if (!/<meta\s+name=["']referrer["']\s+content=["']no-referrer["']/i.test(recoveryHtml)) {
    fail(recoveryPath, "must prevent the recovery URL from being sent as a referrer");
  }
  if (/<script\b/i.test(recoveryHtml)) {
    fail(recoveryPath, "must not contain client-side scripts");
  }
  if (/<form\b/i.test(recoveryHtml)) {
    fail(recoveryPath, "must not contain a form");
  }
  const recoveryLinks = Array.from(
    recoveryHtml.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi),
    (match) => match[1],
  );
  if (!recoveryLinks.includes("/apps/procurecore/support/")) {
    fail(recoveryPath, "missing the ProcureCore support link");
  }
  recoveryLinks.forEach((href) => {
    if (href.includes("?") || href.includes("#TEST_VALUE")) {
      fail(recoveryPath, `link must not include recovery parameters or probe values: "${href}"`);
    }
  });
  [
    "TEST_VALUE",
    "URLSearchParams",
    "location.search",
    "location.hash",
    "document.URL",
    "document.referrer",
  ].forEach((unsafeValue) => {
    if (recoveryHtml.includes(unsafeValue)) {
      fail(recoveryPath, `must not read or render URL data: "${unsafeValue}"`);
    }
  });
}

if (!fs.existsSync(aasaPath) || !fs.statSync(aasaPath).isFile()) {
  fail(aasaPath, "Apple App Site Association document was not generated");
} else {
  let aasa;
  try {
    aasa = JSON.parse(fs.readFileSync(aasaPath, "utf8"));
  } catch (error) {
    fail(aasaPath, `invalid JSON: ${error.message}`);
  }

  if (aasa) {
    if (
      !Array.isArray(aasa.webcredentials && aasa.webcredentials.apps) ||
      !aasa.webcredentials.apps.includes(procureCoreAppID)
    ) {
      fail(aasaPath, `webcredentials.apps is missing ${procureCoreAppID}`);
    }

    const details = aasa.applinks && aasa.applinks.details;
    const hasRecoveryComponent =
      Array.isArray(details) &&
      details.some(
        (detail) =>
          Array.isArray(detail.appIDs) &&
          detail.appIDs.includes(procureCoreAppID) &&
          Array.isArray(detail.components) &&
          detail.components.some((component) => component["/"] === recoveryRoute),
      );
    if (!hasRecoveryComponent) {
      fail(
        aasaPath,
        `applinks.details is missing ${procureCoreAppID} with the exact ${recoveryRoute} component`,
      );
    }
  }
}

const netlifyConfig = fs.readFileSync(netlifyConfigPath, "utf8");
const netlifyHeaderBlocks = netlifyConfig.split(/(?=\[\[headers\]\])/);
const recoveryHeaderBlock = netlifyHeaderBlocks.find((block) =>
  /^\s*for\s*=\s*["']\/auth\/recovery["']/m.test(block),
);
if (!recoveryHeaderBlock) {
  fail(netlifyConfigPath, "missing the /auth/recovery header configuration");
} else {
  [
    [/Content-Type\s*=\s*"text\/html;\s*charset=UTF-8"/, "text/html content type"],
    [/Cache-Control\s*=\s*"no-store"/, "no-store cache policy"],
    [/Referrer-Policy\s*=\s*"no-referrer"/, "no-referrer policy"],
    [/X-Robots-Tag\s*=\s*"noindex,\s*nofollow,\s*noarchive"/, "noindex policy"],
  ].forEach(([pattern, label]) => {
    if (!pattern.test(recoveryHeaderBlock)) {
      fail(netlifyConfigPath, `/auth/recovery is missing its ${label}`);
    }
  });
}

const procureCoreRoutes = [
  "/apps/procurecore/",
  "/apps/procurecore/privacy/",
  "/apps/procurecore/terms/",
  "/apps/procurecore/support/",
  "/apps/procurecore/data-processing/",
];
const procureCorePolicyRoutes = procureCoreRoutes.slice(1);
// The data processing schedule is a processor contract, not a user-controls page, so it
// carries no account-deletion copy. That assertion covers the pages that do.
const procureCoreAccountRoutes = procureCorePolicyRoutes.filter(
  (route) => route !== "/apps/procurecore/data-processing/",
);
const currentCompanyName = "Curated Design Limited";
const currentCompanyNumber = "16720521";
const currentRegisteredOffice = "Floor 1, 8 Park Crescent, London W1B 1PG";
const supportEmail = "info@curateddesign.studio";
const staleProcureCoreClaims = [
  /optional iCloud sync/i,
  /private iCloud database/i,
  /does not operate a server/i,
  /does not require (?:you to create )?an account/i,
  /there is no Curated Design login/i,
  /does not include any third-party SDKs/i,
  /does not include analytics/i,
  /placements? that reference it will reconcile/i,
  /delete the app and remove ProcureCore data/i,
  /iCloud Drive/i,
  /Start account deletion from/i,
  /initiate account deletion/i,
  /account-deletion process can be initiated/i,
  /does not currently provide a self-service password-reset control/i,
];

procureCoreRoutes.forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  if (!fs.existsSync(file)) {
    fail(sitemapPath, `ProcureCore page was not generated: ${route}`);
    return;
  }

  const html = fs.readFileSync(file, "utf8");
  const expectedCanonical = `https://curateddesign.studio${route}`;
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
    fail(file, `canonical URL is not ${expectedCanonical}`);
  }
  if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
    fail(sitemapPath, `ProcureCore route is missing from sitemap: ${route}`);
  }

  staleProcureCoreClaims.forEach((pattern) => {
    if (pattern.test(html)) fail(file, `contains stale ProcureCore claim matching ${pattern}`);
  });

  if (/(?:Curated Design Ltd|13048992)/i.test(html)) {
    fail(file, "contains superseded company identity");
  }

  const descriptionTags = Array.from(
    html.matchAll(
      /<meta\s+(?:name=["'](?:description|twitter:description)["']|property=["']og:description["'])\s+content=["']([^"']+)["']/gi,
    ),
    (match) => match[1],
  );
  descriptionTags.forEach((description) => {
    if (/(?:iCloud|CloudKit|no server|no third-party)/i.test(description)) {
      fail(file, `metadata contains a stale service claim: "${description}"`);
    }
  });
});

const procureCoreLanding = fs.readFileSync(
  path.join(outputRoot, "apps/procurecore/index.html"),
  "utf8",
);
["privacy", "terms", "support", "data-processing"].forEach((kind) => {
  const href = `/apps/procurecore/${kind}/`;
  if (!procureCoreLanding.includes(`href="${href}"`)) {
    fail(path.join(outputRoot, "apps/procurecore/index.html"), `missing ${kind} link`);
  }
});

procureCorePolicyRoutes.forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  const html = fs.readFileSync(file, "utf8");
  procureCorePolicyRoutes
    .filter((otherRoute) => otherRoute !== route)
    .forEach((otherRoute) => {
      if (!html.includes(`href="${otherRoute}"`) && !html.includes(`href="${otherRoute}#`)) {
        fail(file, `missing cross-link to ${otherRoute}`);
      }
    });
});

const procureCorePrivacy = fs.readFileSync(
  path.join(outputRoot, "apps/procurecore/privacy/index.html"),
  "utf8",
);
if (!procureCorePrivacy.includes('id="your-rights"')) {
  fail(
    path.join(outputRoot, "apps/procurecore/privacy/index.html"),
    "missing #your-rights privacy-choices anchor",
  );
}

const publicHtml = htmlFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
if (/(?:Curated Design Ltd|13048992)/i.test(publicHtml)) {
  fail(outputRoot, "generated public HTML contains superseded company identity");
}

["/company-information/", "/privacy-notice/", "/terms-of-business/"].forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  const html = fs.readFileSync(file, "utf8");
  [currentCompanyName, currentCompanyNumber, currentRegisteredOffice, supportEmail].forEach(
    (expected) => {
      if (!html.includes(expected)) fail(file, `missing current company detail: ${expected}`);
    },
  );
});

procureCorePolicyRoutes.forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  const html = fs.readFileSync(file, "utf8");
  [currentCompanyName, supportEmail].forEach((expected) => {
    if (!html.includes(expected)) fail(file, `missing current company detail: ${expected}`);
  });
});

["/apps/procurecore/privacy/", "/apps/procurecore/terms/"].forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  const html = fs.readFileSync(file, "utf8");
  [currentCompanyNumber, currentRegisteredOffice].forEach((expected) => {
    if (!html.includes(expected)) fail(file, `missing current company detail: ${expected}`);
  });
});

procureCoreAccountRoutes.forEach((route) => {
  const file = path.join(outputRoot, route.slice(1), "index.html");
  const html = fs.readFileSync(file, "utf8");
  [
    "You can delete your account from Settings, then Delete Account.",
    "Deletion is permanent and cannot be undone.",
    "Cancel that separately in your Apple account settings.",
    `href="mailto:${supportEmail}"`,
  ].forEach((expected) => {
    if (!html.includes(expected)) fail(file, `missing account-deletion content: ${expected}`);
  });
});

const procureCoreSupport = fs.readFileSync(
  path.join(outputRoot, "apps/procurecore/support/index.html"),
  "utf8",
);
[
  "Forgot password?",
  "on the ProcureCore sign-in screen and follow the emailed link on the same device.",
  "This works on iPhone, iPad and Mac.",
  `href="mailto:${supportEmail}"`,
].forEach((expected) => {
  if (!procureCoreSupport.includes(expected)) {
    fail(
      path.join(outputRoot, "apps/procurecore/support/index.html"),
      `missing password-recovery content: ${expected}`,
    );
  }
});

const projectEntries = fs
  .readdirSync(path.join(root, "src/content/projects"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => matter.read(path.join(root, "src/content/projects", file)).data);

projectEntries.forEach((project) => {
  const route = `/work/${project.slug}/`;
  const outputPath = path.join(outputRoot, route.slice(1), "index.html");
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
  Array.from(
    html.matchAll(/<form\b[^>]*\bdata-netlify=["']true["'][^>]*>/gi),
    (match) => match[0],
  ).forEach((formTag) => {
    if (!/\baction=["']\/thank-you\/["']/i.test(formTag)) {
      fail(file, "Netlify form must use /thank-you/ as its non-JavaScript success destination");
    }
  });
});

[path.join(outputRoot, "admin/index.html"), path.join(outputRoot, "thank-you/index.html")].forEach(
  (file) => {
    const html = fs.readFileSync(file, "utf8");
    if (!/<meta\s+name=["']robots["']\s+content=["']noindex,\s*follow["']/i.test(html)) {
      fail(file, "support page must be noindex, follow");
    }
  },
);

if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  console.error(`Generated-site check failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(
    `Generated-site check passed: ${htmlFiles.length} HTML pages, ${imageCount} images, ${formCount} forms, ${internalLinkCount} internal link references.`,
  );
}
