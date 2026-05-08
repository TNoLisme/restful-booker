const fs = require("fs");
const { GherkinStreams } = require("@cucumber/gherkin");
const { IdGenerator } = require("@cucumber/messages");
const { Readable } = require("stream");

/**
 * Parse a .feature file into a KarateAST object.
 * Throws an error (with .line/.col) if the file cannot be parsed.
 */
function parseFeatureFile(filePath) {
  const source = fs.readFileSync(filePath, "utf-8");
  return parseFeatureSource(source, filePath);
}

/**
 * Parse raw source text into a KarateAST.
 */
function parseFeatureSource(source, filePath = "<unknown>") {
  // ── Step 1: Gherkin parse ──────────────────────────────────────────────────
  const gherkinDoc = parseGherkin(source, filePath);

  // ── Step 2: Build KarateAST from GherkinDocument ──────────────────────────
  return buildKarateAST(gherkinDoc, source, filePath);
}

// ─── Gherkin parsing (synchronous via manual tokenisation) ─────────────────
function parseGherkin(source, filePath) {
  const lines = source.split("\n");
  const doc = {
    filePath,
    rawLines: lines,
    feature: null,
    parseErrors: [],
  };

  let i = 0;

  // Skip leading blank lines, comments, and tag lines (@ lines before Feature)
  while (i < lines.length && /^\s*(#.*|@.*)?$/.test(lines[i])) i++;

  // Feature line
  const featureLine = lines[i];
  if (featureLine === undefined) {
    doc.parseErrors.push({ line: 1, col: 1, message: "File trống hoặc chỉ có comments" });
    return doc;
  }

  const featureMatch = featureLine.match(/^(\s*)(Feature\s*):(.*)/i);
  if (!featureMatch) {
    doc.parseErrors.push({
      line: i + 1,
      col: 1,
      message: `Dòng đầu tiên phải là 'Feature:' nhưng tìm thấy: "${featureLine.trim()}"`,
    });
    // Continue parsing anyway to collect more errors
  }

  doc.feature = {
    line: i + 1,
    name: featureMatch ? featureMatch[3].trim() : "",
    background: null,
    scenarios: [],
    tags: collectTagsAbove(lines, i),
  };

  i++;

  // ── Parse body of feature ────────────────────────────────────────────────
  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed || trimmed.startsWith("#")) { i++; continue; }

    // Background
    if (/^Background\s*:/i.test(trimmed)) {
      doc.feature.background = { line: i + 1, steps: [] };
      i++;
      i = collectSteps(lines, i, doc.feature.background.steps);
      continue;
    }

    // Scenario / Scenario Outline
    const scenarioMatch = trimmed.match(/^(Scenario(?:\s+Outline)?|Example)\s*:(.*)/i);
    if (scenarioMatch) {
      const tags = collectTagsAbove(lines, i);
      const scenario = {
        line: i + 1,
        keyword: scenarioMatch[1],
        name: scenarioMatch[2].trim(),
        tags,
        steps: [],
        examples: null,
      };
      doc.feature.scenarios.push(scenario);
      i++;
      i = collectSteps(lines, i, scenario.steps);

      // Examples table for Scenario Outline
      if (/^Examples\s*:/i.test((lines[i] || "").trim())) {
        scenario.examples = { line: i + 1, rows: [] };
        i++;
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          scenario.examples.rows.push({ line: i + 1, raw: lines[i].trim() });
          i++;
        }
      }
      continue;
    }

    i++;
  }

  return doc;
}

function collectTagsAbove(lines, scenarioLineIdx) {
  const tags = [];
  let j = scenarioLineIdx - 1;
  while (j >= 0 && /^\s*(@\S+(\s+@\S+)*\s*$|^\s*$)/.test(lines[j])) {
    const tagMatches = lines[j].match(/@\S+/g);
    if (tagMatches) tags.push(...tagMatches.map(t => ({ name: t, line: j + 1 })));
    j--;
  }
  return tags;
}

function collectSteps(lines, startIdx, stepsArr) {
  let i = startIdx;
  const stepKeywords = /^\s*(Given|When|Then|And|But|\*)\s+/i;
  const stopKeywords = /^\s*(Scenario|Background|Examples?|@|Feature)\s*[:\s]/i;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed || trimmed.startsWith("#")) { i++; continue; }
    if (stopKeywords.test(trimmed)) break;

    const stepMatch = raw.match(/^(\s*)(Given|When|Then|And|But|\*)(\s+)(.*)/i);
    if (stepMatch) {
      stepsArr.push({
        line: i + 1,
        col: stepMatch[1].length + 1,
        keyword: stepMatch[2],
        text: stepMatch[4],
        raw: raw,
      });
    }
    i++;
  }
  return i;
}

// ─── Build KarateAST ────────────────────────────────────────────────────────
function buildKarateAST(gherkinDoc, source, filePath) {
  const ast = {
    filePath,
    source,
    rawLines: gherkinDoc.rawLines,
    parseErrors: gherkinDoc.parseErrors,
    feature: gherkinDoc.feature
      ? enrichFeature(gherkinDoc.feature)
      : null,
  };
  return ast;
}

function enrichFeature(feature) {
  return {
    ...feature,
    background: feature.background
      ? enrichStepsContainer(feature.background)
      : null,
    scenarios: feature.scenarios.map(enrichScenario),
  };
}

function enrichScenario(scenario) {
  return {
    ...scenario,
    steps: enrichSteps(scenario.steps),
  };
}

function enrichStepsContainer(container) {
  return {
    ...container,
    steps: enrichSteps(container.steps),
  };
}

// Karate-specific step analysis
const KARATE_KEYWORDS = [
  "url", "path", "method", "status", "request", "response",
  "match", "set", "remove", "configure", "call", "callonce",
  "read", "print", "def", "assert", "eval", "replace",
  "param", "params", "header", "headers", "cookie", "cookies",
  "form", "multipart", "retry", "soap", "xml", "xmlpath",
  "json", "string", "bytes", "table", "text", "doc",
  "karate.set", "karate.get", "karate.call",
];

const MATCH_MARKERS = [
  "#string", "#number", "#boolean", "#array", "#object",
  "#null", "#notnull", "#present", "#notpresent", "#ignore",
  "#uuid", "#date", "#regex", "#[", "#(", "##",
];

function enrichSteps(steps) {
  return steps.map(step => {
    const text = step.text || "";
    const enriched = { ...step, karateKeyword: null, karateArgs: null };

    // Detect karate keyword at start of step text
    for (const kw of KARATE_KEYWORDS) {
      const regex = new RegExp(`^${escapeRegex(kw)}(\\s+|$)`, "i");
      if (regex.test(text)) {
        enriched.karateKeyword = kw.toLowerCase();
        enriched.karateArgs = text.slice(kw.length).trim();
        break;
      }
    }

    // Detect match markers used in the step
    enriched.matchMarkers = MATCH_MARKERS.filter(m =>
      text.toLowerCase().includes(m.toLowerCase())
    );

    return enriched;
  });
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { parseFeatureFile, parseFeatureSource };
