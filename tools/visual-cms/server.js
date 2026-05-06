const fs = require("fs");
const http = require("http");
const path = require("path");
const matter = require("gray-matter");

const rootDir = path.resolve(__dirname, "..", "..");
const siteDir = path.join(rootDir, "_site");
const cmsDir = path.join(__dirname, "web");
const assetsDir = path.join(rootDir, "assets");
const homePath = path.join(rootDir, "src", "content", "pages", "home.json");
const pagePaths = {
  about: path.join(rootDir, "src", "content", "pages", "about.json"),
  contact: path.join(rootDir, "src", "content", "pages", "contact.json"),
  projectsPage: path.join(rootDir, "src", "content", "pages", "projects.json"),
};
const servicesDir = path.join(rootDir, "src", "content", "services");
const projectsDir = path.join(rootDir, "src", "content", "projects");
const projectImagesDir = path.join(assetsDir, "images", "projects");

const port = Number(process.env.PORT || process.argv[2] || 4311);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function readEntry(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  return {
    filePath,
    body: parsed.content || "",
    data: parsed.data || {},
  };
}

function writeEntry(entry, data) {
  const next = matter.stringify(entry.body || "", data, { lineWidth: -1 });
  fs.writeFileSync(entry.filePath, next);
}

function normalizeAssetPath(value) {
  if (!value || /^(https?:)?\/\//.test(value)) return value || "";
  return value.startsWith("/") ? value : `/${value}`;
}

function sanitizeSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function sanitizeFilename(value) {
  const parsed = path.parse(String(value || "image"));
  const name = sanitizeSlug(parsed.name) || "image";
  const ext = (parsed.ext || ".png").toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${name}${ext || ".png"}`;
}

function isImageFile(name) {
  return /\.(png|jpe?g|webp|avif|gif|svg)$/i.test(name);
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function collectEntryImages(data, type) {
  const images = [
    data.cardImage,
    data.heroImage,
    data.coverImage,
    data.image,
    data.listingImage,
    ...(((data.gallery && data.gallery.images) || []).map((item) => item.image)),
  ].map(normalizeAssetPath);

  if (type === "project" && data.slug) {
    const folder = path.join(projectImagesDir, data.slug);
    if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
      fs.readdirSync(folder)
        .filter(isImageFile)
        .sort()
        .forEach((name) => images.push(`/assets/images/projects/${data.slug}/${name}`));
    }
  }

  return uniq(images);
}

function readEntries(dir, type) {
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const entry = readEntry(path.join(dir, name));
      return normalizeEntry(entry, type, name);
    })
    .sort((a, b) => {
      const aOrder = Number.isFinite(a.order) ? a.order : 999;
      const bOrder = Number.isFinite(b.order) ? b.order : 999;
      return aOrder - bOrder;
    });
}

function normalizeEntry(entry, type, filename) {
  const data = entry.data;
  const slug = data.slug || filename.replace(/\.md$/, "");
  const url =
    type === "service"
      ? `/curated_services/${slug}.html`
      : `/projects/${slug}.html`;

  return {
    ...data,
    type,
    filename,
    body: data.body || (entry.body || "").trim(),
    title: data.title || slug,
    slug,
    status: data.status || "published",
    statusLabel: data.statusLabel || "",
    order: data.order,
    category: data.category || "",
    kicker: data.kicker || "",
    summary: data.summary || data.subtitle || data.lead || "",
    subtitle: data.subtitle || "",
    cardImage: data.cardImage || "",
    cardAlt: data.cardAlt || data.title || "",
    coverImage: data.coverImage || "",
    coverAlt: data.coverAlt || "",
    heroImage: data.heroImage || "",
    heroAlt: data.heroAlt || "",
    imagePool: collectEntryImages({ ...data, slug }, type),
    url,
    affects:
      type === "service"
        ? ["Homepage service cards", "Service detail page"]
        : ["Homepage collection cards", "Projects listing cards", "Project detail page"],
  };
}

function readAllContent() {
  const home = readJson(homePath);
  const pages = Object.fromEntries(
    Object.entries(pagePaths).map(([name, filePath]) => [name, readJson(filePath)]),
  );
  const services = readEntries(servicesDir, "service");
  const projects = readEntries(projectsDir, "project");

  return {
    home,
    pages,
    services,
    projects,
    resolvedHome: resolveHome(home, services, projects),
  };
}

function resolveHome(home, services, projects) {
  const serviceBySlug = new Map(services.map((item) => [item.slug, item]));
  const projectBySlug = new Map(projects.map((item) => [item.slug, item]));

  return {
    featuredServices: ((home.servicesSection && home.servicesSection.featuredServices) || []).map((relation) => ({
      relation,
      entry: serviceBySlug.get(relation.service) || null,
    })),
    featuredProjects: ((home.collectionsSection && home.collectionsSection.featuredProjects) || []).map((relation) => ({
      relation,
      entry: projectBySlug.get(relation.project) || null,
    })),
  };
}

function projectCardClass(relation, count) {
  if (count === 1) return "";
  if (count === 2) return "span-6";
  return relation.cardSpan || "span-4";
}

function validateHome(home, services, projects) {
  const serviceSlugs = new Set(services.map((item) => item.slug));
  const projectSlugs = new Set(projects.filter((item) => item.status !== "draft").map((item) => item.slug));
  const carouselProjects = ((home.carousel && home.carousel.slides) || [])
    .map((item) => item.project)
    .filter(Boolean)
    .filter((slug) => !projectSlugs.has(slug));
  const missingServices = ((home.servicesSection && home.servicesSection.featuredServices) || [])
    .map((item) => item.service)
    .filter((slug) => !serviceSlugs.has(slug));
  const missingProjects = ((home.collectionsSection && home.collectionsSection.featuredProjects) || [])
    .map((item) => item.project)
    .filter((slug) => !projectSlugs.has(slug));

  if (carouselProjects.length || missingServices.length || missingProjects.length) {
    return {
      ok: false,
      message: [
        carouselProjects.length ? `Missing carousel projects: ${carouselProjects.join(", ")}` : "",
        missingServices.length ? `Missing services: ${missingServices.join(", ")}` : "",
        missingProjects.length ? `Missing projects: ${missingProjects.join(", ")}` : "",
      ].filter(Boolean).join("; "),
    };
  }

  return { ok: true };
}

function projectWarnings(data) {
  if (data.status !== "published") return [];
  const warnings = [];
  if ((data.statusLabel || "").toLowerCase().includes("coming soon")) {
    warnings.push("Published projects do not render the Coming soon label; clear Status Label when ready.");
  }
  if (!data.lead) warnings.push("Published project is missing Lead.");
  if (!data.body) warnings.push("Published project is missing Body.");
  if (!data.facts || !data.facts.length) warnings.push("Published project is missing Facts.");
  if (!data.gallery || !data.gallery.images || !data.gallery.images.length) warnings.push("Published project is missing Gallery images.");
  if (!data.ctaHeading) warnings.push("Published project is missing CTA Heading.");
  if (!data.ctaText) warnings.push("Published project is missing CTA Text.");
  return warnings;
}

function writeProjectEntry(entry, fields) {
  const nextData = { ...entry.data, ...fields };
  if (nextData.status === "coming_soon" && !nextData.statusLabel) {
    nextData.statusLabel = "Coming soon";
  }
  if (nextData.status === "published" && (nextData.statusLabel || "").toLowerCase().includes("coming soon")) {
    nextData.statusLabel = "";
  }
  writeEntry(entry, nextData);
  return projectWarnings(nextData);
}

function findEntryBySlug(dir, slug) {
  const files = fs.readdirSync(dir).filter((name) => name.endsWith(".md"));
  for (const name of files) {
    const entry = readEntry(path.join(dir, name));
    if (entry.data.slug === slug) {
      entry.filename = name;
      return entry;
    }
  }
  return null;
}

function pickFields(source, allowed) {
  return allowed.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      result[key] = source[key];
    }
    return result;
  }, {});
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".html": "text/html; charset=utf-8",
  }[ext] || "application/octet-stream";
}

function serveFile(res, filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200, {
    "content-type": contentType(filePath),
    "cache-control": "no-store",
  });
  fs.createReadStream(filePath).pipe(res);
}

function safeJoin(base, pathname) {
  const resolved = path.resolve(base, pathname.replace(/^\/+/, ""));
  if (!resolved.startsWith(base)) return null;
  return resolved;
}

function listDirImages(absDir, urlPrefix) {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return [];
  return fs
    .readdirSync(absDir)
    .filter(isImageFile)
    .sort()
    .map((name) => ({ filename: name, path: `${urlPrefix}/${name}` }));
}

function listSiteRootImages(absDir, urlPrefix) {
  if (!fs.existsSync(absDir) || !fs.statSync(absDir).isDirectory()) return { backgrounds: [], other: [] };
  const backgrounds = [];
  const other = [];
  for (const name of fs.readdirSync(absDir).sort()) {
    const full = path.join(absDir, name);
    if (!fs.statSync(full).isFile() || !isImageFile(name)) continue;
    const entry = { filename: name, path: `${urlPrefix}/${name}` };
    if (/^background[-._]/i.test(name)) backgrounds.push(entry);
    else other.push(entry);
  }
  return { backgrounds, other };
}

function buildImageBuckets(content) {
  const projects = (content.projects || []).map((project) => {
    const folder = path.join(projectImagesDir, project.slug);
    return {
      id: `project:${project.slug}`,
      name: project.title || project.slug,
      slug: project.slug,
      kind: "project",
      url: project.url,
      images: listDirImages(folder, `/assets/images/projects/${project.slug}`),
    };
  });

  const root = listSiteRootImages(path.join(assetsDir, "images"), "/assets/images");
  const siteGroups = [];
  if (root.backgrounds.length) {
    siteGroups.push({
      id: "site:backgrounds",
      name: "Backgrounds",
      kind: "site",
      images: root.backgrounds,
    });
  }
  siteGroups.push({
    id: "site:service-cards",
    name: "Service cards",
    kind: "site",
    images: listDirImages(path.join(assetsDir, "images", "curated_services"), "/assets/images/curated_services"),
  });
  siteGroups.push({
    id: "site:service-covers",
    name: "Service covers",
    kind: "site",
    images: listDirImages(
      path.join(assetsDir, "images", "curated_services", "page_brands"),
      "/assets/images/curated_services/page_brands",
    ),
  });
  siteGroups.push({
    id: "site:logos",
    name: "Logos",
    kind: "site",
    images: listDirImages(path.join(assetsDir, "images", "logos"), "/assets/images/logos"),
  });
  if (root.other.length) {
    siteGroups.push({
      id: "site:other",
      name: "Other",
      kind: "site",
      images: root.other,
    });
  }

  return [
    { id: "projects", name: "Projects", groups: projects.filter((g) => g.images.length) },
    { id: "site", name: "Site", groups: siteGroups.filter((g) => g.images.length) },
  ];
}

async function handleApi(req, res, url) {
  const content = readAllContent();

  if (req.method === "GET" && url.pathname === "/api/content/images") {
    sendJson(res, 200, { buckets: buildImageBuckets(content) });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/content/home") {
    sendJson(res, 200, content);
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/content/services") {
    sendJson(res, 200, { services: content.services });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/content/projects") {
    sendJson(res, 200, { projects: content.projects });
    return;
  }

  const pageMatch = url.pathname.match(/^\/api\/content\/page\/([^/]+)$/);
  if (req.method === "GET" && pageMatch) {
    const pageName = decodeURIComponent(pageMatch[1]);
    if (!pagePaths[pageName]) {
      sendJson(res, 404, { ok: false, message: `Unknown page: ${pageName}` });
      return;
    }
    sendJson(res, 200, { name: pageName, page: readJson(pagePaths[pageName]) });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/content/home") {
    const payload = await readBody(req);
    const nextHome = payload.home || payload;
    const validation = validateHome(nextHome, content.services, content.projects);
    if (!validation.ok) {
      sendJson(res, 400, validation);
      return;
    }
    writeJson(homePath, nextHome);
    sendJson(res, 200, readAllContent());
    return;
  }

  if (req.method === "POST" && pageMatch) {
    const pageName = decodeURIComponent(pageMatch[1]);
    if (!pagePaths[pageName]) {
      sendJson(res, 404, { ok: false, message: `Unknown page: ${pageName}` });
      return;
    }
    const payload = await readBody(req);
    writeJson(pagePaths[pageName], payload.page || payload);
    sendJson(res, 200, readAllContent());
    return;
  }

  const serviceMatch = url.pathname.match(/^\/api\/content\/service\/([^/]+)$/);
  if (req.method === "POST" && serviceMatch) {
    const slug = decodeURIComponent(serviceMatch[1]);
    const entry = findEntryBySlug(servicesDir, slug);
    if (!entry) {
      sendJson(res, 404, { ok: false, message: `Unknown service: ${slug}` });
      return;
    }
    const payload = await readBody(req);
    const fields = pickFields(payload.fields || payload, [
      "title",
      "slug",
      "status",
      "order",
      "summary",
      "cardImage",
      "cardAlt",
      "coverImage",
      "coverAlt",
      "intro",
      "glance",
      "sections",
      "enquiryHeading",
      "enquiryText",
      "ctaHeading",
      "ctaText",
    ]);
    writeEntry(entry, { ...entry.data, ...fields });
    sendJson(res, 200, readAllContent());
    return;
  }

  const projectMatch = url.pathname.match(/^\/api\/content\/project\/([^/]+)$/);
  if (req.method === "POST" && projectMatch) {
    const slug = decodeURIComponent(projectMatch[1]);
    const entry = findEntryBySlug(projectsDir, slug);
    if (!entry) {
      sendJson(res, 404, { ok: false, message: `Unknown project: ${slug}` });
      return;
    }
    const payload = await readBody(req);
    const fields = pickFields(payload.fields || payload, [
      "title",
      "slug",
      "status",
      "statusLabel",
      "order",
      "category",
      "kicker",
      "subtitle",
      "summary",
      "showInProjects",
      "gridClass",
      "cardImage",
      "cardAlt",
      "heroImage",
      "heroAlt",
      "projectTags",
      "articleHeading",
      "lead",
      "body",
      "callout",
      "extraSections",
      "facts",
      "asideText",
      "gallery",
      "ctaHeading",
      "ctaText",
    ]);
    const warnings = writeProjectEntry(entry, fields);
    sendJson(res, 200, { ...readAllContent(), warnings });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/content/project") {
    const payload = await readBody(req);
    const fields = payload.fields || payload;
    const slug = sanitizeSlug(fields.slug || fields.title);
    if (!slug) {
      sendJson(res, 400, { ok: false, message: "Project slug is required." });
      return;
    }
    if (findEntryBySlug(projectsDir, slug) || fs.existsSync(path.join(projectsDir, `${slug}.md`))) {
      sendJson(res, 409, { ok: false, message: `Project already exists: ${slug}` });
      return;
    }
    const entry = {
      filePath: path.join(projectsDir, `${slug}.md`),
      body: "",
      data: {},
    };
    const data = {
      tags: "project",
      permalink: false,
      title: fields.title || slug,
      slug,
      status: fields.status || "draft",
      order: Number(fields.order) || 999,
      category: fields.category || "Residential",
      kicker: fields.kicker || "",
      subtitle: fields.subtitle || fields.summary || "",
      statusLabel: fields.status === "coming_soon" ? "Coming soon" : "",
      showInProjects: fields.showInProjects !== false,
      gridClass: fields.gridClass || "col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2",
      cardImage: fields.cardImage || "",
      cardAlt: fields.cardAlt || fields.title || slug,
      heroImage: fields.heroImage || "",
      heroAlt: fields.heroAlt || fields.title || slug,
      projectTags: fields.projectTags || [],
      articleHeading: fields.articleHeading || "Overview",
      lead: fields.lead || fields.summary || "",
      body: fields.body || "",
      callout: fields.callout || { title: "", text: "" },
      extraSections: fields.extraSections || [],
      facts: fields.facts || [],
      asideText: fields.asideText || "",
      gallery: fields.gallery || { heading: "Gallery", text: "", images: [] },
      ctaHeading: fields.ctaHeading || "",
      ctaText: fields.ctaText || "",
    };
    fs.mkdirSync(path.join(projectImagesDir, slug), { recursive: true });
    writeEntry(entry, data);
    sendJson(res, 201, readAllContent());
    return;
  }

  const uploadMatch = url.pathname.match(/^\/api\/content\/project\/([^/]+)\/upload$/);
  if (req.method === "POST" && uploadMatch) {
    const slug = decodeURIComponent(uploadMatch[1]);
    const entry = findEntryBySlug(projectsDir, slug);
    if (!entry) {
      sendJson(res, 404, { ok: false, message: `Unknown project: ${slug}` });
      return;
    }
    const payload = await readBody(req);
    const filename = sanitizeFilename(payload.filename);
    const match = String(payload.dataUrl || "").match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      sendJson(res, 400, { ok: false, message: "Upload must be an image data URL." });
      return;
    }
    const folder = path.join(projectImagesDir, slug);
    fs.mkdirSync(folder, { recursive: true });
    const filePath = path.join(folder, filename);
    if (fs.existsSync(filePath) && !payload.overwrite) {
      sendJson(res, 409, { ok: false, message: `File already exists: ${filename}` });
      return;
    }
    fs.writeFileSync(filePath, Buffer.from(match[2], "base64"));
    const publicPath = `/assets/images/projects/${slug}/${filename}`;
    const next = readAllContent();
    sendJson(res, 200, { ...next, path: publicPath });
    return;
  }

  sendJson(res, 404, { ok: false, message: "Unknown API route" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    if (url.pathname === "/" || url.pathname === "/visual-cms") {
      res.writeHead(302, { location: "/visual-cms/" });
      res.end();
      return;
    }

    if (url.pathname === "/visual-cms/") {
      serveFile(res, path.join(cmsDir, "index.html"));
      return;
    }

    if (url.pathname.startsWith("/visual-cms/")) {
      const filePath = safeJoin(cmsDir, url.pathname.replace("/visual-cms/", ""));
      serveFile(res, filePath || "");
      return;
    }

    if (url.pathname.startsWith("/assets/")) {
      const filePath = safeJoin(assetsDir, url.pathname.replace("/assets/", ""));
      serveFile(res, filePath || "");
      return;
    }

    const sitePath = url.pathname === "/" ? "index.html" : url.pathname;
    const filePath = safeJoin(siteDir, sitePath);
    if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      serveFile(res, path.join(filePath, "index.html"));
      return;
    }
    serveFile(res, filePath || "");
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Visual CMS running at http://localhost:${port}/visual-cms/`);
  if (!fs.existsSync(path.join(siteDir, "index.html"))) {
    console.log("Tip: run npm run build before using the page preview.");
  }
});
