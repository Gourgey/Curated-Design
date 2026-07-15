"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const root = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function requireValue(value, label) {
  if (value === undefined || value === null || value === "") {
    fail(`${label} is required`);
  }
}

function readJson(relativePath) {
  const absolutePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return {};
  }
}

function readFrontMatterDirectory(relativeDirectory) {
  const absoluteDirectory = path.join(root, relativeDirectory);
  return fs
    .readdirSync(absoluteDirectory)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const relativePath = path.join(relativeDirectory, file);
      try {
        return {
          file,
          relativePath,
          data: matter.read(path.join(root, relativePath)).data,
        };
      } catch (error) {
        fail(`${relativePath} has invalid front matter: ${error.message}`);
        return { file, relativePath, data: {} };
      }
    });
}

function validateLocalImage(imagePath, label) {
  if (!imagePath) return;
  if (typeof imagePath !== "string" || !imagePath.startsWith("/assets/images/")) {
    fail(`${label} must be a root-relative path below /assets/images/`);
    return;
  }

  const absolutePath = path.join(root, imagePath.slice(1));
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    fail(`${label} references missing file ${imagePath}`);
  }
}

function validateUniqueSlugs(entries, label) {
  const seen = new Map();
  entries.forEach((entry) => {
    const slug = entry.data.slug;
    if (!slug) return;
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(slug)) {
      fail(`${entry.relativePath}: slug "${slug}" must use lowercase snake_case`);
    }
    if (seen.has(slug)) {
      fail(`${entry.relativePath}: duplicate ${label} slug "${slug}" also used by ${seen.get(slug)}`);
    } else {
      seen.set(slug, entry.relativePath);
    }
  });
}

function validateRelationList(relations, relationKey, entriesBySlug, label, options = {}) {
  (relations || []).forEach((relation, index) => {
    const slug = typeof relation === "string" ? relation : relation && relation[relationKey];
    const entry = entriesBySlug.get(slug);
    if (!slug || !entry) {
      fail(`${label}[${index}] references unknown ${relationKey} "${slug || ""}"`);
      return;
    }
    if (entry.data.status === "draft") {
      fail(`${label}[${index}] references draft entry "${slug}"`);
    }
    if (options.requiredStatus && entry.data.status !== options.requiredStatus) {
      fail(
        `${label}[${index}] references ${entry.data.status} entry "${slug}"; ` +
          `${options.requiredStatus} is required`,
      );
    }
    if (options.allowedStatuses && !options.allowedStatuses.includes(entry.data.status)) {
      fail(
        `${label}[${index}] references ${entry.data.status} entry "${slug}"; ` +
          `allowed statuses are ${options.allowedStatuses.join(", ")}`,
      );
    }
    if (relation && relation.image) {
      validateLocalImage(relation.image, `${label}[${index}].image`);
    }
  });
}

const allowedStatuses = new Set(["published", "coming_soon", "draft"]);
const projects = readFrontMatterDirectory("src/content/projects");
const services = readFrontMatterDirectory("src/content/services");

validateUniqueSlugs(projects, "project");
validateUniqueSlugs(services, "service");

projects.forEach((entry) => {
  const { data, relativePath } = entry;
  const prefix = `${relativePath}:`;
  requireValue(data.title, `${prefix} title`);
  requireValue(data.slug, `${prefix} slug`);
  requireValue(data.category, `${prefix} category`);
  requireValue(data.status, `${prefix} status`);

  if (!allowedStatuses.has(data.status)) {
    fail(`${prefix} status "${data.status}" is not supported`);
  }
  if (data.permalink !== false) {
    fail(`${prefix} permalink must remain false; the pagination template owns public URLs`);
  }
  if (data.status === "draft" && data.showInProjects !== false) {
    fail(`${prefix} drafts must set showInProjects: false`);
  }
  if (data.status === "published") {
    requireValue(data.lead, `${prefix} lead for published project`);
    requireValue(data.body, `${prefix} body for published project`);
  }
  if (data.status === "coming_soon" && !data.statusLabel) {
    warn(`${prefix} coming-soon project relies on the default status label`);
  }

  if (data.status !== "draft") {
    requireValue(data.cardImage, `${prefix} cardImage`);
    requireValue(data.cardAlt, `${prefix} cardAlt`);
    requireValue(data.heroImage, `${prefix} heroImage`);
    requireValue(data.heroAlt, `${prefix} heroAlt`);
  }
  validateLocalImage(data.cardImage, `${prefix} cardImage`);
  validateLocalImage(data.heroImage, `${prefix} heroImage`);

  const galleryImages = (data.gallery && data.gallery.images) || [];
  const seenGalleryImages = new Set();
  galleryImages.forEach((item, index) => {
    if (!item || !item.image) return;
    validateLocalImage(item.image, `${prefix} gallery.images[${index}].image`);
    requireValue(item.alt, `${prefix} gallery.images[${index}].alt`);
    if (item.image === data.heroImage) {
      fail(`${prefix} gallery repeats heroImage ${item.image}`);
    }
    if (seenGalleryImages.has(item.image)) {
      fail(`${prefix} gallery repeats image ${item.image}`);
    }
    seenGalleryImages.add(item.image);
  });
});

services.forEach((entry) => {
  const { data, relativePath } = entry;
  const prefix = `${relativePath}:`;
  requireValue(data.title, `${prefix} title`);
  requireValue(data.slug, `${prefix} slug`);
  requireValue(data.status, `${prefix} status`);
  if (!allowedStatuses.has(data.status)) {
    fail(`${prefix} status "${data.status}" is not supported`);
  }
  if (data.permalink !== false) {
    fail(`${prefix} permalink must remain false; the pagination template owns public URLs`);
  }
  if (data.status !== "draft") {
    requireValue(data.summary, `${prefix} summary`);
    requireValue(data.cardImage, `${prefix} cardImage`);
    requireValue(data.cardAlt, `${prefix} cardAlt`);
    requireValue(data.coverImage, `${prefix} coverImage`);
    requireValue(data.coverAlt, `${prefix} coverAlt`);
    requireValue(data.intro, `${prefix} intro`);
  }
  validateLocalImage(data.cardImage, `${prefix} cardImage`);
  validateLocalImage(data.coverImage, `${prefix} coverImage`);
});

const settings = readJson("src/content/settings.json");
const home = readJson("src/content/pages/home.json");
[
  "studioName",
  "email",
  "location",
  "primaryCtaText",
  "primaryCtaUrl",
  "siteUrl",
  "description",
  "shareImage",
].forEach((field) => requireValue(settings[field], `src/content/settings.json: ${field}`));
validateLocalImage(settings.shareImage, "src/content/settings.json: shareImage");

const projectsBySlug = new Map(projects.map((entry) => [entry.data.slug, entry]));
const servicesBySlug = new Map(services.map((entry) => [entry.data.slug, entry]));
validateRelationList(
  home.carousel && home.carousel.slides,
  "project",
  projectsBySlug,
  "home.carousel.slides",
  { allowedStatuses: ["published", "coming_soon"] },
);
validateRelationList(
  home.collectionsSection && home.collectionsSection.featuredProjects,
  "project",
  projectsBySlug,
  "home.collectionsSection.featuredProjects",
  { requiredStatus: "published" },
);
validateRelationList(
  home.servicesSection && home.servicesSection.featuredServices,
  "service",
  servicesBySlug,
  "home.servicesSection.featuredServices",
  { requiredStatus: "published" },
);
validateLocalImage(home.philosophy && home.philosophy.image, "home.philosophy.image");
if (home.philosophy && home.philosophy.image && !home.philosophy.imageAlt) {
  warn("home.philosophy.imageAlt is empty; confirm whether the image is decorative");
}

const cmsConfig = fs.readFileSync(path.join(root, "admin/config.yml"), "utf8");
[
  "primaryCtaUrl",
  "shareImage",
  "gallery",
  "articleHeading",
  "status",
].forEach((field) => {
  const fieldPattern = new RegExp(`name:\\s*["']?${field}["']?`);
  if (!fieldPattern.test(cmsConfig)) {
    fail(`admin/config.yml does not preserve editable field "${field}"`);
  }
});

const publishedProjects = projects.filter((entry) => entry.data.status === "published");
if (publishedProjects.length < 3) {
  warn(
    `Only ${publishedProjects.length} project is marked published; the overhaul target is at least 2–3 complete case studies`,
  );
}

warnings.forEach((message) => console.warn(`WARN: ${message}`));
if (errors.length) {
  errors.forEach((message) => console.error(`ERROR: ${message}`));
  console.error(`Content check failed with ${errors.length} error(s).`);
  process.exitCode = 1;
} else {
  console.log(
    `Content check passed: ${projects.length} projects, ${services.length} services, ${warnings.length} warning(s).`,
  );
}
