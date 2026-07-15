// Concatenates assets/css-partials/*.css (in filename order) into
// assets/css/styles.css. Must run before Eleventy's passthrough copy of
// assets/css, since that copy is what ships styles.css to _site/.
//
// assets/css/styles.css is a generated file from this point on -- edit the
// partials in assets/css-partials/ instead. This first split preserves each
// partial's exact original relative order (no rules were reordered), so the
// concatenated output is guaranteed byte-identical to the pre-split source;
// see the partials' own numbering for the source line ranges they came from.
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const partialsDir = path.join(root, "assets", "css-partials");
const outputFile = path.join(root, "assets", "css", "styles.css");

function build() {
  const partials = fs
    .readdirSync(partialsDir)
    .filter((file) => file.endsWith(".css"))
    .sort();

  if (!partials.length) {
    throw new Error(`No CSS partials found in ${path.relative(root, partialsDir)}`);
  }

  const banner =
    "/* GENERATED FILE -- do not edit directly.\n" +
    `   Source partials: assets/css-partials/ (${partials.join(", ")})\n` +
    "   Rebuild with: node tools/build-css.js (also runs automatically as part of npm run build\n" +
    "   and npm start) */\n\n";

  const combined =
    banner +
    partials
      .map((file) => fs.readFileSync(path.join(partialsDir, file), "utf8"))
      .join("");

  fs.writeFileSync(outputFile, combined);
  return partials.length;
}

module.exports = { build };

if (require.main === module) {
  const count = build();
  console.log(`Built assets/css/styles.css from ${count} partials.`);
}
