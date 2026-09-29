const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function readJson(relativePath) {
  const filePath = path.join(__dirname, "..", "content", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileVersion(relativePath) {
  const filePath = path.join(__dirname, "..", "..", relativePath);
  const contents = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(contents).digest("hex").slice(0, 10);
}

// One stamp for all front-end scripts, so a changed script is re-fetched
// instead of served from a stale browser cache.
function scriptsVersion() {
  const dir = path.join(__dirname, "..", "..", "assets", "js");
  const hash = crypto.createHash("sha256");
  fs.readdirSync(dir)
    .filter((name) => name.endsWith(".js"))
    .sort()
    .forEach((name) => hash.update(fs.readFileSync(path.join(dir, name))));
  return hash.digest("hex").slice(0, 10);
}

module.exports = {
  settings: readJson("settings.json"),
  cssVersion: fileVersion("assets/css/styles.css"),
  jsVersion: scriptsVersion(),
  currentYear: new Date().getFullYear(),
  home: readJson("pages/home.json"),
  about: readJson("pages/about.json"),
  contact: readJson("pages/contact.json"),
  projectsPage: readJson("pages/projects.json"),
  servicesPage: readJson("pages/services.json")
};
