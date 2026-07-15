const fs = require("fs");
const markdownIt = require("markdown-it");
const Image = require("@11ty/eleventy-img");

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
  const HERO_WIDTHS = [400, 800, 1200, 1600, 2400];
  const CARD_WIDTHS = [400, 800, 1200];

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

  eleventyConfig.addPassthroughCopy("assets/css");
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

  // Resolve the homepage carousel config into a flat list of renderable
  // slides ({ src, alt }), skipping entries with no usable image so the
  // template's slide count and aria-labels stay accurate.
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
        const src = slide.image || projectData.heroImage;
        if (!src) return null;
        return {
          src,
          alt: slide.alt || projectData.heroAlt || projectData.title || "",
        };
      })
      .filter(Boolean);
  });

  // Drop gallery items that have no usable image path so templates can rely
  // on a clean list and skip rendering empty <img> tags.
  eleventyConfig.addFilter("withImage", (items) => {
    return (items || []).filter((item) => item && item.image);
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
        ? `/curated_services/${item.data.slug}.html`
        : `/projects/${item.data.slug}.html`,
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
