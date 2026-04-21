const fs = require("fs");
const path = require("path");

function readJson(relativePath) {
  const filePath = path.join(__dirname, "..", "content", relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

module.exports = {
  settings: readJson("settings.json"),
  home: readJson("pages/home.json"),
  about: readJson("pages/about.json"),
  contact: readJson("pages/contact.json"),
  projectsPage: readJson("pages/projects.json")
};
