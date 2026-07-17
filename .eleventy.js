const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");
const markdownIt = require("markdown-it");
const matter = require("gray-matter");
const Image = require("@11ty/eleventy-img");
const sharp = require("sharp");
const { build: buildCss } = require("./tools/build-css.js");

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true, breaks: false, linkify: true });

  // Async image shortcode — generates AVIF + WebP responsive variants for any
  // local image referenced from project templates. Source paths starting with
  // "/" are resolved relative to the repo root (matching the on-disk layout
  // of the passthrough-copied `assets/` folder). Empty `src` returns an empty
  // string so callers don't need to wrap shortcode calls in their own guard.
  //
  // Derivatives land in `assets/_generated/img/` (gitignored, persistent across
  // `npm run clean`) and are passthrough-copied to `_site/img/` on each build.
  // This keeps incremental + clean builds fast — sharp only re-encodes when a
  // source image changes.
  const HERO_WIDTHS = [400, 640, 800, 1200, 1600, 2400];
  const CARD_WIDTHS = [400, 640, 800, 1200];

  async function imageShortcode(src, alt, sizes, loading, classNames, variant) {
    if (!src) return "";
    const inputPath = src.startsWith("/") ? `.${src}` : src;
    const widths = variant === "card" ? CARD_WIDTHS : HERO_WIDTHS;
    const metadata = await Image(inputPath, {
      widths,
      formats: ["avif", "webp"],
      outputDir: "./assets/_generated/img/",
      urlPath: "/img/",
    });
    const attrs = {
      alt: alt || "",
      sizes: sizes || "100vw",
      loading: loading || "lazy",
      decoding: "async",
    };
    // Eager images are above the fold — tell the browser to fetch them first.
    if (attrs.loading === "eager") attrs.fetchpriority = "high";
    if (classNames) attrs.class = classNames;
    return Image.generateHTML(metadata, attrs);
  }
  eleventyConfig.addAsyncShortcode("image", imageShortcode);

  // Social share images (P5.5) need a real, fixed 1200x630 asset -- OG/Twitter
  // crawlers don't do responsive selection, and the raw hero/cover photos
  // this site otherwise uses are neither that size nor that aspect ratio.
  // Rather than requiring new cropped photography, generate one deterministic
  // cover-fit crop per source image (cached by a hash of the source path, in
  // the same persistent generated dir + copy-after-build hook as the {%
  // image %} shortcode above) and expose a src -> URL lookup to templates.
  //
  // This runs as a plain synchronous-lookup Nunjucks filter, not an async
  // shortcode, and the actual image generation happens up front in
  // "eleventy.before" (see below) rather than lazily during template
  // rendering -- calling an async shortcode from inside a `{% set %}...
  // {% endset %}` capture silently produced an empty string here (Nunjucks
  // shortcodes are tags, not callable expressions, and this Eleventy/Nunjucks
  // setup has a documented history of async work not resolving correctly
  // when threaded through `{% set %}`, see P2.3's card-consolidation note).
  // Width/height are always exactly 1200x630 by construction, so callers can
  // hardcode the og:image:width/height meta values rather than needing them
  // returned here.
  const shareImageMap = new Map();
  async function generateShareImage(src) {
    if (!src || shareImageMap.has(src)) return;
    const inputPath = src.startsWith("/") ? `.${src}` : src;
    if (!fs.existsSync(inputPath)) return;
    const hash = crypto.createHash("sha1").update(inputPath).digest("hex").slice(0, 10);
    const outputDir = "./assets/_generated/img";
    const outputName = `share-${hash}.jpg`;
    const outputPath = `${outputDir}/${outputName}`;
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputDir, { recursive: true });
      await sharp(inputPath).resize(1200, 630, { fit: "cover" }).jpeg({ quality: 82 }).toFile(outputPath);
    }
    shareImageMap.set(src, `/img/${outputName}`);
  }
  eleventyConfig.on("eleventy.before", async () => {
    const settings = JSON.parse(fs.readFileSync("./src/content/settings.json", "utf8"));
    const sources = [settings.shareImage];
    for (const dir of ["./src/content/projects", "./src/content/services"]) {
      const key = dir.endsWith("projects") ? "heroImage" : "coverImage";
      for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
        const { data } = matter.read(path.join(dir, file));
        if (data[key]) sources.push(data[key]);
      }
    }
    await Promise.all(sources.filter(Boolean).map(generateShareImage));
  });
  eleventyConfig.addFilter("shareImageUrl", (src) => (src && shareImageMap.get(src)) || "");

  // Sitemap <lastmod> (P5.5) -- the source file's last real commit date is a
  // genuinely dependable content date for a git-backed site, unlike
  // filesystem mtimes (a fresh checkout resets those to checkout time, not
  // the actual last edit). Falls back to the build time only if git isn't
  // available or the file has no history yet (e.g. uncommitted new content),
  // so a missing/shallow git history never breaks the build.
  const buildTime = new Date().toISOString();
  const lastmodCache = new Map();
  eleventyConfig.addFilter("lastmod", (inputPath) => {
    if (!inputPath) return buildTime;
    if (lastmodCache.has(inputPath)) return lastmodCache.get(inputPath);
    let result = buildTime;
    try {
      const output = execFileSync("git", ["log", "-1", "--format=%cI", "--", inputPath], {
        encoding: "utf8",
      }).trim();
      if (output) result = output;
    } catch {
      // Fall through to buildTime.
    }
    lastmodCache.set(inputPath, result);
    return result;
  });

  // Copy the persistent generated-images dir to /img/ in the deploy output.
  // This must run AFTER the build (not as a passthrough copy): the shortcode
  // writes new derivatives while templates render, and a passthrough copy
  // evaluated at build start would miss them.
  eleventyConfig.on("eleventy.after", ({ dir }) => {
    const generated = "./assets/_generated/img";
    if (fs.existsSync(generated)) {
      fs.cpSync(generated, `${dir.output}/img`, { recursive: true });
    }
  });

  // assets/css/styles.css is generated from assets/css-partials/*.css (see
  // tools/build-css.js). Rebuild it before each build -- including each
  // incremental rebuild `eleventy --serve` triggers on file change -- so a
  // partial edit is never silently stale in the passthrough-copied output.
  eleventyConfig.addWatchTarget("assets/css-partials");
  eleventyConfig.on("eleventy.before", () => buildCss());

  eleventyConfig.addPassthroughCopy("assets/css");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("assets/images");
  eleventyConfig.addPassthroughCopy("assets/js");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy({ public: "/" });

  const isDraft = (item) => {
    return item && item.data && item.data.status === "draft";
  };

  eleventyConfig.addFilter("markdownify", (value) => {
    if (!value) return "";
    return md.render(value);
  });

  eleventyConfig.addFilter("sortByOrder", (items) => {
    return [...(items || [])].sort((a, b) => {
      const aOrder = a.data && Number.isFinite(a.data.order) ? a.data.order : 999;
      const bOrder = b.data && Number.isFinite(b.data.order) ? b.data.order : 999;
      return aOrder - bOrder;
    });
  });

  eleventyConfig.addFilter("where", (items, key, value) => {
    return (items || []).filter((item) => item.data && item.data[key] === value);
  });

  // Order-based, wrap-around "next project" lookup for the project-detail
  // template's related-work link (see build plan P3.4). Returns null when
  // there is nothing to link to (fewer than two listed projects, or the
  // current slug isn't in the listed set).
  eleventyConfig.addFilter("nextProject", (projects, currentSlug) => {
    const list = [...(projects || [])]
      .filter((item) => item.data && item.data.showInProjects === true)
      .sort((a, b) => {
        const aOrder = a.data && Number.isFinite(a.data.order) ? a.data.order : 999;
        const bOrder = b.data && Number.isFinite(b.data.order) ? b.data.order : 999;
        return aOrder - bOrder;
      });
    if (list.length < 2) return null;
    const index = list.findIndex((item) => item.data && item.data.slug === currentSlug);
    if (index === -1) return null;
    return list[(index + 1) % list.length];
  });

  eleventyConfig.addFilter("resolveEntries", (relations, items, relationKey) => {
    const bySlug = new Map(
      (items || [])
        .filter((item) => item.data && item.data.slug)
        .map((item) => [item.data.slug, item]),
    );

    return (relations || [])
      .map((relation) => {
        const slug = typeof relation === "string" ? relation : relation && relation[relationKey];
        const item = bySlug.get(slug);
        if (!item || isDraft(item)) return null;
        return {
          relation: relation || {},
          data: item.data,
          url: item.url,
          page: item.page,
        };
      })
      .filter(Boolean);
  });

  // Resolve the homepage carousel config into linked, labelled project
  // slides. Coming-soon entries remain eligible when explicitly curated, but
  // their status is carried into the visible overlay.
  eleventyConfig.addFilter("carouselSlides", (slides, projects) => {
    const bySlug = new Map(
      (projects || [])
        .filter((item) => item.data && item.data.slug)
        .map((item) => [item.data.slug, item]),
    );

    return (slides || [])
      .map((slide) => {
        const project = bySlug.get(slide.project);
        const projectData = project && !isDraft(project) ? project.data : {};
        if (!new Set(["published", "coming_soon"]).has(projectData.status)) return null;
        const src = slide.image || projectData.heroImage;
        if (!src) return null;
        return {
          src,
          alt: slide.alt || projectData.heroAlt || projectData.title || "",
          title: projectData.title || "Project",
          kicker: projectData.kicker || projectData.category || "Featured work",
          statusLabel:
            projectData.status === "coming_soon"
              ? projectData.statusLabel || "Coming soon"
              : "",
          url: `/work/${projectData.slug}/`,
        };
      })
      .filter(Boolean);
  });

  // Drop gallery items that have no usable image path so templates can rely
  // on a clean list and skip rendering empty <img> tags.
  eleventyConfig.addFilter("withImage", (items) => {
    return (items || []).filter((item) => item && item.image);
  });

  // Drop a gallery item that repeats a given image path (the project hero,
  // typically) so the hero and gallery carousel never show the same photo
  // twice -- see build plan P4.4.
  eleventyConfig.addFilter("excludeImage", (items, src) => {
    if (!src) return items || [];
    return (items || []).filter((item) => item.image !== src);
  });

  // Group a project list by the supplied category list, returning only
  // categories that actually contain projects so the listing template can
  // skip empty sections + pill-menu links.
  eleventyConfig.addFilter("groupByCategory", (categories, projects) => {
    return (categories || [])
      .map((category) => ({
        category,
        projects: (projects || []).filter(
          (project) => project.data && project.data.category === category.label,
        ),
      }))
      .filter((entry) => entry.projects.length > 0);
  });

  eleventyConfig.addFilter("jsonify", (value) => {
    return JSON.stringify(value, null, 2);
  });

  eleventyConfig.addFilter("mapData", (items) => {
    return (items || []).map((item) => ({
      title: item.data.title,
      slug: item.data.slug,
      status: item.data.status,
      statusLabel: item.data.statusLabel || "",
      summary: item.data.summary || item.data.subtitle || item.data.lead || "",
      kicker: item.data.kicker || "",
      category: item.data.category || "",
      cardImage: item.data.cardImage,
      cardAlt: item.data.cardAlt || item.data.title,
      coverImage: item.data.coverImage || "",
      coverAlt: item.data.coverAlt || "",
      heroImage: item.data.heroImage || "",
      heroAlt: item.data.heroAlt || "",
      imagePool: [
        item.data.cardImage,
        item.data.heroImage,
        ...(((item.data.gallery && item.data.gallery.images) || []).map((image) => image.image)),
      ].filter(Boolean),
      url: [].concat(item.data.tags || []).includes("service")
        ? `/services/${item.data.slug}/`
        : `/work/${item.data.slug}/`,
    }));
  });

  eleventyConfig.addCollection("publishedService", (collectionApi) => {
    return collectionApi.getFilteredByTag("service").filter((item) => !isDraft(item));
  });

  eleventyConfig.addCollection("publishedProject", (collectionApi) => {
    return collectionApi.getFilteredByTag("project").filter((item) => !isDraft(item));
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md"]
  };
};
