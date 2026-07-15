"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const ignoredDirectories = new Set([
  ".git",
  ".claude",
  "_site",
  "node_modules",
  "_generated",
]);

function collectJavaScriptFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectJavaScriptFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".js") ? [absolutePath] : [];
  });
}

const files = collectJavaScriptFiles(root).sort();
const failures = [];

files.forEach((file) => {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    failures.push({ file, output: result.stderr || result.stdout });
  }
});

if (failures.length) {
  failures.forEach(({ file, output }) => {
    console.error(`JavaScript syntax check failed: ${path.relative(root, file)}`);
    console.error(output.trim());
  });
  process.exitCode = 1;
} else {
  console.log(`JavaScript syntax check passed: ${files.length} files.`);
}
