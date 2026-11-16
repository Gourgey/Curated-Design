"use strict";

// Shared data for ProcureCore's account-link pages (/auth/*).
const apps = require("../_data/apps.js");

const procurecore = apps.items.find((app) => app.slug === "procurecore");
if (!procurecore || !procurecore.appStoreUrl) {
  throw new Error("src/auth: ProcureCore's appStoreUrl is missing from src/_data/apps.js");
}

module.exports = {
  layout: "layouts/procurecore-auth.njk",
  eleventyExcludeFromCollections: true,
  // Extension-less output so the exact universal-link paths are served
  // directly, without Netlify's Pretty URLs adding a trailing slash.
  eleventyAllowMissingExtension: true,
  procurecoreAppStoreUrl: procurecore.appStoreUrl,
};
