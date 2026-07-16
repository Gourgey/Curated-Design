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

module.exports = {
  settings: readJson("settings.json"),
  cssVersion: fileVersion("assets/css/styles.css"),
  currentYear: new Date().getFullYear(),
  home: readJson("pages/home.json"),
  about: readJson("pages/about.json"),
  contact: readJson("pages/contact.json"),
  projectsPage: readJson("pages/projects.json"),
  servicesPage: readJson("pages/services.json")
};
