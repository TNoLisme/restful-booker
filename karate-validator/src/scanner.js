const { globSync } = require("glob");
const path = require("path");

/**
 * Scan files matching the given glob patterns.
 * @param {string[]} patterns
 * @returns {string[]} absolute file paths
 */
function scanFiles(patterns) {
  const files = new Set();

  for (const pattern of patterns) {
    const matches = globSync(pattern, {
      nodir: true,
      absolute: true,
    });

    for (const f of matches) {
      // Only include .feature files
      if (f.endsWith(".feature")) {
        files.add(path.normalize(f));
      }
    }
  }

  return Array.from(files).sort();
}

module.exports = { scanFiles };
