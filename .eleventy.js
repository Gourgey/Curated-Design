const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true, breaks: false, linkify: true });

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
