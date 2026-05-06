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
    if (classNames) attrs.class = classNames;
    return Image.generateHTML(metadata, attrs);
  }
  eleventyConfig.addAsyncShortcode("image", imageShortcode);

  // Map the persistent generated-images dir to /img/ in the deploy output.
  eleventyConfig.addPassthroughCopy({ "assets/_generated/img": "img" });

  eleventyConfig.addPassthroughCopy("assets");
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

  eleventyConfig.addFilter("take", (items, count) => {
    return (items || []).slice(0, count);
  });

  eleventyConfig.addFilter("notDraft", (items) => {
    return (items || []).filter((item) => !isDraft(item));
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

  eleventyConfig.addFilter("homeCardSpan", (item, count) => {
    const explicit = item && item.relation && item.relation.cardSpan;
    if (count === 1) return "";
    if (count === 2) return "span-6";
    if (explicit) return explicit;
    return "span-4";
  });

  // Map friendly project listing span tokens to the responsive CSS classes
  // used on /projects.html. Falls back to a legacy `gridClass` string when
  // present, then to the default third-width span.
  const GRID_SPAN_PRESETS = {
    third: "col-span-4 lg:col-span-4 md:col-span-3 sm:col-span-2",
    "two-fifths": "col-span-5 lg:col-span-5 md:col-span-6 sm:col-span-2",
    "three-fifths": "col-span-7 lg:col-span-7 md:col-span-6 sm:col-span-2",
    "two-thirds-compact": "col-span-8 lg:col-span-8 md:col-span-3 sm:col-span-2",
    "two-thirds": "col-span-8 lg:col-span-8 md:col-span-6 sm:col-span-2",
  };

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

  eleventyConfig.addFilter("projectGridClass", (data) => {
    if (!data) return GRID_SPAN_PRESETS.third;
    const token = data.gridSpan;
    if (token && GRID_SPAN_PRESETS[token]) return GRID_SPAN_PRESETS[token];
    if (data.gridClass) return data.gridClass;
    return GRID_SPAN_PRESETS.third;
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

  eleventyConfig.addFilter("assetPath", (path, depth = 0) => {
    if (!path) return "";
    if (/^(https?:)?\/\//.test(path) || path.startsWith("mailto:")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${"../".repeat(depth)}${clean}`;
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
