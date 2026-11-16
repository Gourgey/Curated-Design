"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const apps = require("../src/_data/apps.js");

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
const publicHtmlFiles = htmlFiles;
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
const confirmRoute = "/auth/confirm";
const linkProblemRoute = "/auth/link-problem";
const aasaPath = path.join(outputRoot, ".well-known/apple-app-site-association");
const netlifyConfigPath = path.join(root, "netlify.toml");
const supabaseJsUrl =
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js";

// ProcureCore account-link pages: shared requirements.
const authPages = [
  {
    route: recoveryRoute,
    title: "Reset your password – ProcureCore",
    headings: ["Reset your password in ProcureCore", "This reset link has expired"],
    scripts: ["/assets/js/procurecore-auth-recovery.js"],
  },
  {
    route: confirmRoute,
    title: "Confirm your email – ProcureCore",
    headings: [
      "Confirming your email…",
      "Your email is confirmed",
      "This link has already been used or has expired",
      "Confirm your ProcureCore email",
      "We couldn&#39;t reach ProcureCore|We couldn't reach ProcureCore",
    ],
    scripts: ["/assets/js/procurecore-auth-confirm.js"],
  },
  {
    route: linkProblemRoute,
    title: "Link didn't work – ProcureCore|Link didn&#39;t work – ProcureCore",
    headings: ["This ProcureCore link didn't work|This ProcureCore link didn&#39;t work"],
    scripts: [],
  },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function anyOf(alternatives) {
  return alternatives.split("|").map(escapeRegExp).join("|");
}

const authHtml = {};
authPages.forEach((page) => {
  const file = path.join(outputRoot, page.route.slice(1));
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    fail(file, `ProcureCore link page was not generated at ${page.route}`);
    return;
  }
  const html = fs.readFileSync(file, "utf8");
  authHtml[page.route] = html;

  if (!new RegExp(`<title>\\s*(${anyOf(page.title)})\\s*</title>`).test(html)) {
    fail(file, `missing <title>${page.title.split("|")[0]}</title>`);
  }
  page.headings.forEach((heading) => {
    if (!new RegExp(`<h1\\b[^>]*>\\s*(${anyOf(heading)})\\s*</h1>`).test(html)) {
      fail(file, `missing heading "${heading.split("|")[0]}"`);
    }
  });
  if (!/<meta\s+name=["']robots["']\s+content=["']noindex["']/i.test(html)) {
    fail(file, 'must carry <meta name="robots" content="noindex">');
  }
  if (!/<meta\s+name=["']referrer["']\s+content=["']no-referrer["']/i.test(html)) {
    fail(file, "must prevent the link URL from being sent as a referrer");
  }
  if (!/<main\b[^>]*\bid=["']main-content["']/i.test(html)) {
    fail(file, "main landmark must provide the #main-content skip-link target");
  }
  if (/<form\b/i.test(html)) fail(file, "must not contain a form");

  const scriptSrcs = Array.from(
    html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi),
    (match) => match[1],
  );
  const inlineScripts = Array.from(html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>/gi));
  if (inlineScripts.length) fail(file, "must not contain inline scripts");
  if (JSON.stringify(scriptSrcs) !== JSON.stringify(page.scripts)) {
    fail(
      file,
      `scripts must be exactly ${JSON.stringify(page.scripts)}, found ${JSON.stringify(scriptSrcs)}`,
    );
  }

  const links = Array.from(html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi), (m) => m[1]);
  if (!links.includes("/apps/procurecore/support/")) {
    fail(file, "missing the ProcureCore support link");
  }
  if (!links.some((href) => /^https:\/\/apps\.apple\.com\/.+\/id\d+$/.test(href))) {
    fail(file, "missing the ProcureCore App Store link");
  }
  links.forEach((href) => {
    if (href.includes("?") || href.includes("#TEST_VALUE")) {
      fail(file, `link must not include link parameters or probe values: "${href}"`);
    }
  });
  ["token", "OTP", "universal link", "error_code", "otp_expired"].forEach((word) => {
    const visibleText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<[^>]+>/g, " ");
    if (new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(visibleText)) {
      fail(file, `visible copy must not use the technical word "${word}"`);
    }
  });
});

// The recovery page must never use up the one-time link: its script may only
// read the URL for an error, never make a request.
const recoveryScriptPath = path.join(outputRoot, "assets/js/procurecore-auth-recovery.js");
if (fs.existsSync(recoveryScriptPath)) {
  const recoveryScript = fs.readFileSync(recoveryScriptPath, "utf8");
  ["supabase", "fetch(", "XMLHttpRequest", "sendBeacon", "verifyOtp", "import("].forEach(
    (unsafe) => {
      if (recoveryScript.toLowerCase().includes(unsafe.toLowerCase())) {
        fail(recoveryScriptPath, `must not contact any server ("${unsafe}" found)`);
      }
    },
  );
} else {
  fail(recoveryScriptPath, "recovery script was not copied to the output");
}

const confirmScriptPath = path.join(outputRoot, "assets/js/procurecore-auth-confirm.js");
if (fs.existsSync(confirmScriptPath)) {
  const confirmScript = fs.readFileSync(confirmScriptPath, "utf8");
  [
    [supabaseJsUrl, "the pinned supabase-js URL"],
    ["SUPABASE_JS_INTEGRITY", "a Subresource Integrity hash"],
    ["persistSession: false", "persistSession: false"],
    ["autoRefreshToken: false", "autoRefreshToken: false"],
    ["detectSessionInUrl: false", "detectSessionInUrl: false"],
    ['signOut({ scope: "local" })', "a local sign-out after confirming"],
    ["history.replaceState", "removal of the link from the address bar"],
  ].forEach(([needle, label]) => {
    if (!confirmScript.includes(needle)) fail(confirmScriptPath, `must include ${label}`);
  });
  if (!/SUPABASE_PUBLISHABLE_KEY = "sb_publishable_[A-Za-z0-9_-]+"/.test(confirmScript)) {
    fail(confirmScriptPath, "must contain the project's publishable key");
  }
  if (/sb_secret_|service_role/.test(confirmScript)) {
    fail(confirmScriptPath, "must never contain a secret or service_role key");
  }
} else {
  fail(confirmScriptPath, "confirm script was not copied to the output");
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
[recoveryRoute, confirmRoute, linkProblemRoute].forEach((route) => {
  const block = netlifyHeaderBlocks.find((candidate) =>
    new RegExp(`^\\s*for\\s*=\\s*["']${route}["']`, "m").test(candidate),
  );
  if (!block) {
    fail(netlifyConfigPath, `missing the ${route} header configuration`);
    return;
  }
  [
    [/Content-Type\s*=\s*"text\/html;\s*charset=UTF-8"/, "text/html content type"],
    [/Cache-Control\s*=\s*"no-store"/, "no-store cache policy"],
    [/Referrer-Policy\s*=\s*"no-referrer"/, "no-referrer policy"],
    [/X-Robots-Tag\s*=\s*"noindex,\s*nofollow,\s*noarchive"/, "noindex policy"],
    [/Content-Security-Policy\s*=\s*"default-src 'none';/, "default-deny CSP"],
  ].forEach(([pattern, label]) => {
    if (!pattern.test(block)) fail(netlifyConfigPath, `${route} is missing its ${label}`);
  });
  const csp = (block.match(/Content-Security-Policy\s*=\s*"([^"]*)"/) || [])[1] || "";
  if (route === confirmRoute) {
    if (!csp.includes(`script-src 'self' ${supabaseJsUrl};`)) {
      fail(netlifyConfigPath, `${route} CSP must allow only itself and ${supabaseJsUrl}`);
    }
    if (!csp.includes("connect-src https://keplgxmiazyzdetgvzxc.supabase.co;")) {
      fail(netlifyConfigPath, `${route} CSP must allow connections only to the Supabase project`);
    }
  } else if (/https?:/.test(csp)) {
    fail(netlifyConfigPath, `${route} CSP must not allow any other origin`);
  }
});

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

// The ProcureCore how-to guide is not a policy page (so it is outside the
// cross-link rule above), but it must not repeat a superseded claim either.
{
  const file = path.join(outputRoot, "apps/procurecore/guide/index.html");
  if (!fs.existsSync(file)) {
    fail(sitemapPath, "ProcureCore guide was not generated: /apps/procurecore/guide/");
  } else {
    const html = fs.readFileSync(file, "utf8");
    staleProcureCoreClaims.forEach((pattern) => {
      if (pattern.test(html)) fail(file, `contains stale ProcureCore claim matching ${pattern}`);
    });
  }
}

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

const procureCoreTermsPath = path.join(outputRoot, "apps/procurecore/terms/index.html");
const procureCoreSchedulePath = path.join(
  outputRoot,
  "apps/procurecore/data-processing/index.html",
);
const procureCoreTerms = fs.readFileSync(procureCoreTermsPath, "utf8");
const procureCoreSchedule = fs.readFileSync(procureCoreSchedulePath, "utf8");

// The data processing schedule cross-references the Terms' section 5 heading by name.
// Renaming that heading would leave a processor contract pointing at a section that does
// not exist, so each side is asserted against the other.
const confidentialityHeading = "User content and confidentiality";
const termsSectionTitles = Array.from(
  procureCoreTerms.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi),
  (match) =>
    match[1]
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\d+\.\s*/, ""),
);
if (!termsSectionTitles.includes(confidentialityHeading)) {
  fail(
    procureCoreTermsPath,
    `no Terms section is titled "${confidentialityHeading}", which the data processing schedule references by name; rename both together`,
  );
}
if (!procureCoreSchedule.includes(`${confidentialityHeading} section of the Terms`)) {
  fail(
    procureCoreSchedulePath,
    `schedule must reference the "${confidentialityHeading} section of the Terms"; update it together with the Terms section 5 heading`,
  );
}

// The liability cap is struck out whole rather than read down if a court finds it
// unreasonable, so both of its load-bearing properties are asserted.
if (!procureCoreTerms.includes("£150")) {
  fail(
    procureCoreTermsPath,
    "liability cap is missing its £150 floor; without it the cap is a total exclusion for any customer who has paid nothing",
  );
}
const capSubordinations =
  procureCoreTerms.match(/Subject to the first paragraph of this section/g) || [];
if (capSubordinations.length !== 2) {
  fail(
    procureCoreTermsPath,
    `"Subject to the first paragraph of this section" must appear exactly twice (found ${capSubordinations.length}): once for the monetary cap and once for the indirect-loss exclusion, each subordinating it to the statutory carve-outs`,
  );
}

// concinnity and CuratedLedger are local-first apps with no Curated Design account or
// server. Every such app's pages must never
// claim an account, a subscription or payment, server-side storage,
// or that turning sync off deletes iCloud data. Each app then lists the features it
// does not have, so copy borrowed from a sibling app cannot publish them.
const localFirstClaims = [
  /\b(?:create|sign in to|sign up for) (?:an? |your )?(?:[a-z]+ )?account/i,
  /\bsubscription/i,
  /\bin-app purchase/i,
  /our (?:servers?|backend)/i,
  /turning (?:iCloud )?sync off (?:deletes|removes|erases)/i,
];
const localFirstApps = [
  {
    name: "concinnity",
    slug: "concinnity",
    // No App Store listing yet.
    unsupportedClaims: [/apps\.apple\.com/i, /Download on the App Store/i],
  },
  {
    name: "CuratedLedger",
    slug: "curatedledger",
    // No in-app sync switch, widgets, Live Activities, Siri or Shortcuts, calendar
    // access, or Mac version.
    unsupportedClaims: [
      /sync (?:on or off|off) in (?:the app|CuratedLedger)/i,
      /\bwidgets?\b/i,
      /Live Activit/i,
      /\bSiri\b/i,
      /\bShortcuts\b/i,
      /\bApp Intents\b/i,
      /\bcalendars?\b/i,
      /\bMac\b|\bmacOS\b/,
    ],
  },
  {
    name: "Mythos Log",
    slug: "mythos-log",
    kinds: ["privacy", "support", "terms"],
    // iPhone and iPad only, with no Live Activities or calendar access.
    unsupportedClaims: [
      /apps\.apple\.com/i,
      /Download on the App Store/i,
      /Live Activit/i,
      /\bcalendars?\b/i,
      /\bMac\b|\bmacOS\b/,
    ],
  },
  {
    name: "Locis",
    slug: "locis",
    // iPhone only, with nothing stored off the device: no iCloud sync, iPad or Mac
    // version, widgets, or notifications.
    unsupportedClaims: [
      /apps\.apple\.com/i,
      /Download on the App Store/i,
      /\biCloud\b/i,
      /\bCloudKit\b/i,
      /\biPad\b/,
      /\bMac\b|\bmacOS\b/,
      /\bwidgets?\b/i,
      /\bnotifications?\b/i,
    ],
  },
];
const appsIndexPath = path.join(outputRoot, "apps/index.html");
const appsIndexHtml = fs.readFileSync(appsIndexPath, "utf8");
localFirstApps.forEach((app) => {
  // Every local-first app except Locis also has a how-to guide; it is held to
  // the same claim rules as the app's support and policy pages.
  const kinds = (app.kinds || ["privacy", "support"]).concat(app.slug === "locis" ? [] : ["guide"]);
  const routes = [`/apps/${app.slug}/`, ...kinds.map((kind) => `/apps/${app.slug}/${kind}/`)];
  routes.forEach((route) => {
    const file = path.join(outputRoot, route.slice(1), "index.html");
    if (!fs.existsSync(file)) {
      fail(sitemapPath, `${app.name} page was not generated: ${route}`);
      return;
    }
    const html = fs.readFileSync(file, "utf8");
    const expectedCanonical = `https://curateddesign.studio${route}`;
    if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) {
      fail(file, `canonical URL is not ${expectedCanonical}`);
    }
    if (!sitemap.includes(`<loc>${expectedCanonical}</loc>`)) {
      fail(sitemapPath, `${app.name} route is missing from sitemap: ${route}`);
    }
    if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
      fail(file, `${app.name} page must be indexable`);
    }
    if (!html.includes(`href="mailto:${supportEmail}"`)) {
      fail(file, `missing a mailto link to ${supportEmail}`);
    }
    const main = (html.match(/<main\b[\s\S]*?<\/main>/i) || [""])[0];
    localFirstClaims.concat(app.unsupportedClaims).forEach((pattern) => {
      if (pattern.test(main)) {
        fail(file, `contains an unsupported ${app.name} claim matching ${pattern}`);
      }
    });
  });
  if (!appsIndexHtml.includes(`href="/apps/${app.slug}/"`)) {
    fail(appsIndexPath, `missing the ${app.name} card`);
  }
  const landingPath = path.join(outputRoot, `apps/${app.slug}/index.html`);
  if (fs.existsSync(landingPath)) {
    const landing = fs.readFileSync(landingPath, "utf8");
    kinds.forEach((kind) => {
      if (!landing.includes(`href="/apps/${app.slug}/${kind}/"`)) {
        fail(landingPath, `missing ${kind} link`);
      }
    });
  }
});
if (
  appsIndexHtml.indexOf('id="app-curatedledger"') < appsIndexHtml.indexOf('id="app-concinnity"')
) {
  fail(appsIndexPath, "the CuratedLedger card must come after concinnity");
}
if (
  appsIndexHtml.indexOf('id="app-mythos-log"') < appsIndexHtml.indexOf('id="app-curatedledger"')
) {
  fail(appsIndexPath, "the Mythos Log card must come after CuratedLedger");
}

// App Review checks the Mythos Log privacy policy's Apple Health disclosures against the
// app's HealthKit entitlement: read-only workout access that is off until connected.
const mythosPrivacyPath = path.join(outputRoot, "apps/mythos-log/privacy/index.html");
const mythosPrivacy = fs.readFileSync(mythosPrivacyPath, "utf8");
[
  "<h2>Apple Health</h2>",
  "Mythos Log does not write any data to Apple Health.",
  "Health data is never used for advertising or marketing, never sold, and never shared with third parties.",
  "Settings &gt; Health &gt; Data Access &amp; Devices &gt; Mythos Log",
  "Settings &gt; [your name] &gt; iCloud &gt; Manage Storage &gt; Mythos Log",
  "not directed at children under 13",
].forEach((expected) => {
  if (!mythosPrivacy.includes(expected)) {
    fail(mythosPrivacyPath, `missing required privacy content: ${expected}`);
  }
});
const mythosHealthRemoval =
  "access in Settings &gt; Health &gt; Data Access &amp; Devices stops workout reading and does not delete anything from Apple Health.";
[mythosPrivacyPath, path.join(outputRoot, "apps/mythos-log/support/index.html")].forEach((file) => {
  if (!fs.readFileSync(file, "utf8").includes(mythosHealthRemoval)) {
    fail(file, "Deleting Data must say that removing Health access stops workout reading");
  }
});

// Every app privacy policy and terms page names the publisher as Curated Design Limited,
// with its company number, as concinnity's policy does.
apps.items.forEach((app) => {
  (app.supportPages || ["privacy", "support", "terms"])
    .filter((kind) => kind === "privacy" || kind === "terms")
    .forEach((kind) => {
      const file = path.join(outputRoot, `apps/${app.slug}/${kind}/index.html`);
      const html = fs.readFileSync(file, "utf8");
      if (!html.includes("Curated Design Limited") || !html.includes("16720521")) {
        fail(file, "must name Curated Design Limited and its company number as the publisher");
      }
      if (/published by Curated Design Studio/i.test(html)) {
        fail(file, "names Curated Design Studio as the publisher; use Curated Design Limited");
      }
    });
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

[path.join(outputRoot, "thank-you/index.html")].forEach((file) => {
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
