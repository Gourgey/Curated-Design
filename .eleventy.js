const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  const md = markdownIt({ html: true, breaks: false, linkify: true });

  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy({ public: "/" });

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

  eleventyConfig.addFilter("assetPath", (path, depth = 0) => {
    if (!path) return "";
    if (/^(https?:)?\/\//.test(path) || path.startsWith("mailto:")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${"../".repeat(depth)}${clean}`;
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
