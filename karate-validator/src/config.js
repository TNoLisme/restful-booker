const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  rules: {
    disable: [],
  },
  ignore: [],
};

/**
 * Load config from YAML file if it exists.
 * Falls back to DEFAULT_CONFIG if not found.
 * NOTE: We parse YAML manually (simple key: value) to avoid extra deps.
 */
function loadConfig(configPath) {
  const resolved = path.resolve(process.cwd(), configPath || "karate-validator.config.yaml");

  if (!fs.existsSync(resolved)) {
    return DEFAULT_CONFIG;
  }

  try {
    const raw = fs.readFileSync(resolved, "utf-8");
    return parseSimpleYaml(raw);
  } catch (err) {
    console.warn(`⚠  Không đọc được config file: ${err.message}. Dùng cấu hình mặc định.`);
    return DEFAULT_CONFIG;
  }
}

/**
 * Very minimal YAML parser for our config format.
 * Supports: string keys, string/array values, nested objects one level deep.
 * For production, replace with 'js-yaml' package.
 */
function parseSimpleYaml(raw) {
  const config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  const lines = raw.split("\n");

  let currentSection = null;
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const arrayItem = line.match(/^\s+-\s+(.+)/);
    if (arrayItem && currentSection && currentKey) {
      const val = arrayItem[1].trim();
      if (!config[currentSection]) config[currentSection] = {};
      if (!config[currentSection][currentKey]) config[currentSection][currentKey] = [];
      config[currentSection][currentKey].push(val);
      continue;
    }

    const sectionMatch = line.match(/^([a-zA-Z_]+)\s*:/);
    if (sectionMatch && !line.startsWith(" ")) {
      currentSection = sectionMatch[1];
      currentKey = null;
      if (!config[currentSection]) config[currentSection] = {};
      continue;
    }

    const keyMatch = line.match(/^\s+([a-zA-Z_]+)\s*:(.*)/);
    if (keyMatch && currentSection) {
      currentKey = keyMatch[1];
      const val = keyMatch[2].trim();
      if (val) {
        if (!config[currentSection]) config[currentSection] = {};
        config[currentSection][currentKey] = val;
      }
    }
  }

  return config;
}

module.exports = { loadConfig };
