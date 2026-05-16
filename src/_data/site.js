const fs = require("fs");
const path = require("path");

function readJson(relativePath) {
  const filePath = path.join(__dirname, "..", "content", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileVersion(relativePath) {
  const filePath = path.join(__dirname, "..", "..", relativePath);
  return Math.round(fs.statSync(filePath).mtimeMs).toString(36);
}

module.exports = {
  settings: readJson("settings.json"),
  cssVersion: fileVersion("assets/css/styles.css"),
  home: readJson("pages/home.json"),
  about: readJson("pages/about.json"),
  contact: readJson("pages/contact.json"),
  projectsPage: readJson("pages/projects.json")
};
