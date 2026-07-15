// Minifies the deployed stylesheet in place after Eleventy writes _site/.
// The source file in assets/ stays readable; only the build output shrinks.
const fs = require("fs");
const path = require("path");
const CleanCSS = require("clean-css");

const target = path.resolve(__dirname, "..", "_site", "assets", "css", "styles.css");

const source = fs.readFileSync(target, "utf8");
const result = new CleanCSS({ level: 1 }).minify(source);

if (result.errors.length) {
  console.error("CSS minification failed:", result.errors.join("; "));
  process.exit(1);
}

fs.writeFileSync(target, result.styles);

const before = (source.length / 1024).toFixed(1);
const after = (result.styles.length / 1024).toFixed(1);
console.log(`Minified styles.css: ${before} KB -> ${after} KB`);
