"use strict";


const fs   = require("fs");
const path = require("path");

const RULES_PATH = path.join(__dirname, "all_rule.json");
if (!fs.existsSync(RULES_PATH)) {
  throw new Error(`[syntax.js] Không tìm thấy file rules: ${RULES_PATH}`);
}
const ALL_RULES = JSON.parse(fs.readFileSync(RULES_PATH, "utf8")).rules;

/**
 * Parse một dòng thành token có type rõ ràng.
 * Types: BLANK | COMMENT | TAG | FEATURE | BACKGROUND | SCENARIO |
 *        SCENARIO_OUTLINE | EXAMPLES | STEP | TABLE_ROW | DOCSTRING_DELIM | UNKNOWN
 */
function parseLine(raw, lineNo) {
  const trimmed = raw.trim();

  if (trimmed === "")                         return { type: "BLANK",            raw, lineNo };
  if (trimmed.startsWith("#"))                return { type: "COMMENT",          raw, lineNo };
  if (trimmed.startsWith("@"))                return { type: "TAG",              raw, lineNo };
  if (/^Feature\s*:/.test(trimmed))           return { type: "FEATURE",          raw, lineNo, desc: trimmed.replace(/^Feature\s*:\s*/, "") };
  if (/^Background\s*:/.test(trimmed))        return { type: "BACKGROUND",       raw, lineNo, desc: trimmed.replace(/^Background\s*:\s*/, "") };
  if (/^Scenario Outline\s*:/.test(trimmed))  return { type: "SCENARIO_OUTLINE", raw, lineNo, desc: trimmed.replace(/^Scenario Outline\s*:\s*/, "") };
  if (/^Scenario\s*:/.test(trimmed))          return { type: "SCENARIO",         raw, lineNo, desc: trimmed.replace(/^Scenario\s*:\s*/, "") };
  if (/^Examples\s*:/.test(trimmed))          return { type: "EXAMPLES",         raw, lineNo };
  if (trimmed.startsWith('"""'))              return { type: "DOCSTRING_DELIM",  raw, lineNo };
  if (/^\|.*\|$/.test(trimmed))              return { type: "TABLE_ROW",        raw, lineNo, text: trimmed };

  // Step: bắt đầu bằng keyword hợp lệ
  const stepMatch = trimmed.match(/^(Given|When|Then|And|But|\*)\s+(.*)/s);
  if (stepMatch) return { type: "STEP", raw, lineNo, keyword: stepMatch[1], body: stepMatch[2].trim() };

  return { type: "UNKNOWN", raw, lineNo };
}

/**
 * Chuyển raw text → danh sách blocks có cấu trúc.
 * Mỗi block:  { type, lineNo, desc?, steps:[], examples?: { lineNo, rows:[] } }
 */
function buildBlocks(rawText) {
  const rawLines = rawText.split(/\r?\n/);
  const blocks   = [];
  let current    = null;
  let inExamples = false;
  let inDocStr   = false;

  for (let i = 0; i < rawLines.length; i++) {
    const tok = parseLine(rawLines[i], i + 1);

    // ── DocString ──────────────────────────────────────────────────────────
    if (tok.type === "DOCSTRING_DELIM") {
      inDocStr = !inDocStr;
      if (current?.steps) current.steps.push(tok);
      continue;
    }
    if (inDocStr) {
      // nội dung bên trong """ — bỏ qua parse thêm
      if (current?.steps) current.steps.push({ type: "DOCSTRING_CONTENT", raw: rawLines[i], lineNo: i + 1 });
      continue;
    }

    // ── Block-level keywords ───────────────────────────────────────────────
    if (tok.type === "FEATURE") {
      current    = { type: "FEATURE", lineNo: tok.lineNo, desc: tok.desc };
      inExamples = false;
      blocks.push(current);
      continue;
    }
    if (tok.type === "BACKGROUND") {
      current    = { type: "BACKGROUND", lineNo: tok.lineNo, desc: tok.desc, steps: [] };
      inExamples = false;
      blocks.push(current);
      continue;
    }
    if (tok.type === "SCENARIO" || tok.type === "SCENARIO_OUTLINE") {
      current    = { type: tok.type, lineNo: tok.lineNo, desc: tok.desc, steps: [], examples: null };
      inExamples = false;
      blocks.push(current);
      continue;
    }
    if (tok.type === "EXAMPLES") {
      inExamples = true;
      if (current && (current.type === "SCENARIO_OUTLINE" || current.type === "SCENARIO")) {
        current.examples = { lineNo: tok.lineNo, rows: [] };
      }
      continue;
    }

    // ── TABLE_ROW: phân vào examples hoặc steps ───────────────────────────
    if (tok.type === "TABLE_ROW") {
      if (inExamples && current?.examples) {
        current.examples.rows.push(tok);
      } else if (current?.steps !== undefined) {
        current.steps.push(tok);
      }
      continue;
    }

    // ── Step / Unknown ─────────────────────────────────────────────────────
    if ((tok.type === "STEP" || tok.type === "UNKNOWN") && current?.steps !== undefined) {
      inExamples = false; // step mới → thoát khỏi Examples context
      current.steps.push(tok);
      continue;
    }
  }

  return { rawLines, blocks };
}

// ═════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/** Tạo issue object theo chuẩn output của rule module */
function mkIssue(rule, line, col, message, suggestion) {
  return {
    ruleId:     rule.id,
    severity:   rule.severity,
    line:       line || 1,
    col:        col  || 1,
    message,
    suggestion: suggestion || rule.description,
  };
}

/** Parse một dòng table "| a | b | c |" → ["a","b","c"] */
function parseTableRow(text) {
  return text.split("|").slice(1, -1).map(c => c.trim());
}

// ═════════════════════════════════════════════════════════════════════════════
// CHECK IMPLEMENTATIONS
// Mỗi hàm nhận { rule, blocks, rawLines } → trả về Issue[]
// ═════════════════════════════════════════════════════════════════════════════

const CHECKS = {

  // ── F-001 ─ Feature phải là keyword block đầu tiên ────────────────────────
  FIRST_KEYWORD({ rule, blocks }) {
    const first = blocks.find(b => !["COMMENT", "TAG", "BLANK"].includes(b.type));
    if (!first || first.type !== "FEATURE") {
      return [mkIssue(rule, first?.lineNo ?? 1, 1,
        "Không tìm thấy 'Feature:' — file phải bắt đầu bằng từ khóa Feature:",
        "Dòng đầu tiên (không tính comment/blank) phải là: Feature: <mô tả>")];
    }
    return [];
  },

  // ── F-002 / S-001 ─ Keyword phải có mô tả ────────────────────────────────
  KEYWORD_HAS_DESCRIPTION({ rule, blocks }) {
    const errors  = [];
    const kw      = rule.params.keyword.replace(":", "").trim();
    const variants = (rule.params.variants || []).map(v => v.replace(":", "").trim());
    const targets  = [kw, ...variants];

    for (const b of blocks) {
      const label = b.type === "SCENARIO_OUTLINE" ? "Scenario Outline" : b.type;
      if (!targets.includes(label)) continue;
      if (!b.desc || b.desc.trim() === "") {
        errors.push(mkIssue(rule, b.lineNo, 1,
          `'${label}:' không có mô tả — phần text sau dấu ':' là bắt buộc`,
          `Ví dụ: ${label}: <mô tả rõ ràng>`));
      }
    }
    return errors;
  },

  // ── F-003 / B-001 / F-004 ─ Đếm số lần xuất hiện keyword ─────────────────
  COUNT_KEYWORD({ rule, blocks }) {
    const errors   = [];
    const kwNorm   = rule.params.keyword.toUpperCase().replace(/\s+/g, "_");
    const variants = (rule.params.includeVariants || []).map(v => v.toUpperCase().replace(/\s+/g, "_"));
    const targets  = [kwNorm, ...variants];
    const found    = blocks.filter(b => targets.includes(b.type));
    const { min, max } = rule.params;

    if (min != null && found.length < min) {
      errors.push(mkIssue(rule, 1, 1,
        `'${rule.params.keyword}' phải xuất hiện ít nhất ${min} lần (hiện tại: ${found.length})`,
        `Thêm ít nhất một khối ${rule.params.keyword}`));
    }
    if (max != null && found.length > max) {
      errors.push(mkIssue(rule, found[max].lineNo, 1,
        `'${rule.params.keyword}' chỉ được xuất hiện tối đa ${max} lần (hiện tại: ${found.length})`,
        `Gộp các khai báo ${rule.params.keyword} thành một`));
    }
    return errors;
  },

  // ── F-005 ─ Thứ tự Feature → Background → Scenario ───────────────────────
  BLOCK_ORDER({ rule, blocks }) {
    const errors = [];
    let foundScenario = false;
    for (const b of blocks) {
      if (b.type === "BACKGROUND") {
        if (foundScenario)
          errors.push(mkIssue(rule, b.lineNo, 1,
            "'Background:' phải đặt trước tất cả Scenario",
            "Di chuyển khối Background lên trước Scenario đầu tiên"));
      }
      if (b.type === "SCENARIO" || b.type === "SCENARIO_OUTLINE") foundScenario = true;
    }
    return errors;
  },

  // ── B-002 / S-002 ─ Children phải thụt lề hơn parent ────────────────────
  CHILDREN_INDENTED({ rule, blocks, rawLines }) {
    const errors     = [];
    const parentKey  = rule.params.parent.toUpperCase().replace(/\s+/g, "_");
    const targets    = parentKey === "SCENARIO"
      ? ["SCENARIO", "SCENARIO_OUTLINE"]
      : [parentKey];

    for (const b of blocks) {
      if (!targets.includes(b.type)) continue;
      const parentIndent = rawLines[b.lineNo - 1].match(/^(\s*)/)[1].length;
      for (const step of (b.steps || [])) {
        if (["DOCSTRING_DELIM", "DOCSTRING_CONTENT", "TABLE_ROW", "BLANK"].includes(step.type)) continue;
        const stepIndent = step.raw.match(/^(\s*)/)[1].length;
        if (stepIndent <= parentIndent) {
          errors.push(mkIssue(rule, step.lineNo, stepIndent + 1,
            `Step phải thụt lề vào so với '${rule.params.parent}:' ở dòng ${b.lineNo}`,
            `Thêm ít nhất một khoảng trắng/tab trước step`));
        }
      }
    }
    return errors;
  },

  // ── B-003 / S-003 ─ Step phải bắt đầu bằng keyword hợp lệ ───────────────
  STEP_KEYWORDS({ rule, blocks }) {
    const errors = [];
    const parent = rule.params.parent.toUpperCase().replace(/\s+/g, "_");

    const targets = parent === "SCENARIO"
      ? ["SCENARIO", "SCENARIO_OUTLINE"]
      : [parent];

    const keywords = new Set(
      (rule.params.validKeywords || [])
        .map(k => k === "*" ? "STAR" : k.toUpperCase())
    );

    for (const b of blocks) {
      if (!targets.includes(b.type)) continue;

      let inDoc = false;
      let started = false;

      for (const s of (b.steps || [])) {

        if (s.type === "DOCSTRING_DELIM") {
          inDoc = !inDoc;
          continue;
        }

        if (
          (inDoc && rule.params.excludeDocString) ||
          (s.type === "TABLE_ROW" && rule.params.excludeTable) ||
          ["DOCSTRING_CONTENT", "BLANK"].includes(s.type)
        ) continue;

        if (keywords.has(s.type)) {
          started = true;
          continue;
        }

        // cho phép description trước step đầu tiên
        if (!started && s.type === "UNKNOWN") continue;

        if (s.type === "UNKNOWN") {
          errors.push(
            mkIssue(
              rule,
              s.lineNo,
              1,
              `Dòng thiếu keyword hợp lệ: "${s.raw.trim()}"`,
              `Bắt đầu bằng một trong: ${rule.params.validKeywords.join(", ")}`
            )
          );
        }
      }
    }

    return errors;
  },

  // ── B-004 ─ Cấm pattern trong block ──────────────────────────────────────
  FORBIDDEN_STEP_IN_BLOCK({ rule, blocks }) {
    const errors    = [];
    const parentKey = rule.params.parent.toUpperCase().replace(/\s+/g, "_");
    const re        = new RegExp(rule.params.forbiddenPattern, rule.params.flags || "");

    for (const b of blocks) {
      if (b.type !== parentKey) continue;
      for (const step of (b.steps || [])) {
        if (re.test(step.raw)) {
          errors.push(mkIssue(rule, step.lineNo, 1,
            `Không nên có '${step.raw.trim()}' trong '${rule.params.parent}'`,
            "Background chỉ nên dùng để setup dữ liệu, không nên thực hiện HTTP call hoàn chỉnh"));
        }
      }
    }
    return errors;
  },

  // ── S-004 ─ Scenario phải có ít nhất N step ──────────────────────────────
  BLOCK_HAS_CHILDREN({ rule, blocks }) {
    const errors  = [];
    const targets = ["SCENARIO", "SCENARIO_OUTLINE"];
    for (const b of blocks) {
      if (!targets.includes(b.type)) continue;
      const realSteps = (b.steps || []).filter(s => s.type === "STEP" || s.type === "UNKNOWN");
      if (realSteps.length < rule.params.min) {
        errors.push(mkIssue(rule, b.lineNo, 1,
          `'${b.type}' "${b.desc}" phải có ít nhất ${rule.params.min} step (hiện tại: ${realSteps.length})`,
          "Thêm ít nhất một step vào Scenario"));
      }
    }
    return errors;
  },

  // ── S-005 ─ Given - When -Then ──────────────────────────────
  STEP_ORDER({ rule, blocks }) {
    const errors = [];
    const targets = ["SCENARIO", "SCENARIO_OUTLINE"];

    for (const b of blocks) {
      if (!targets.includes(b.type)) continue;

      // Lọc chỉ lấy các keyword chính, bỏ *, And, But
      const mainSteps = (b.steps || []).filter(
        (s) => s.type === "STEP" && ["Given", "When", "Then"].includes(s.keyword)
      );

      // Scan ngược: với mỗi When/Then, tìm anchor hợp lệ phía trên
      for (let i = 0; i < mainSteps.length; i++) {
        const step = mainSteps[i];
        const kw = step.keyword;

        if (kw === "Given") {
          // Given không cần điều kiện gì từ phía trên
          continue;
        }

        if (kw === "When") {
          // Scan ngược: cần gặp Given trước khi gặp Then hoặc When khác
          let valid = false;
          for (let j = i - 1; j >= 0; j--) {
            const prev = mainSteps[j].keyword;
            if (prev === "Given") { valid = true; break; }
            if (prev === "Then" || prev === "When") { valid = false; break; }
          }
          if (!valid) {
            errors.push(
              mkIssue(
                rule,
                step.lineNo,
                1,
                `'When' không có 'Given' đứng trước`,
                "When phải đứng sau một Given trong cùng khối"
              )
            );
          }
          continue;
        }

        if (kw === "Then") {
          // Scan ngược: cần gặp Given hoặc When trước khi gặp Then khác
          let valid = false;
          for (let j = i - 1; j >= 0; j--) {
            const prev = mainSteps[j].keyword;
            if (prev === "Given" || prev === "When") { valid = true; break; }
            if (prev === "Then") { valid = false; break; }
          }
          if (!valid) {
            errors.push(
              mkIssue(
                rule,
                step.lineNo,
                1,
                `'Then' không có 'Given' hoặc 'When' đứng trước`,
                "Then phải đứng sau Given hoặc When trong cùng khối"
              )
            );
          }
          continue;
        }
      }
    }

    return errors;
  },

  // ── S-006 ─ And/But không được là step đầu tiên ──────────────────────────
  FIRST_STEP_NOT({ rule, blocks }) {
    const errors   = [];
    const targets  = ["SCENARIO", "SCENARIO_OUTLINE"];
    const forbidden = rule.params.forbiddenFirstKeywords;
    for (const b of blocks) {
      if (!targets.includes(b.type)) continue;
      const firstStep = (b.steps || []).find(s => s.type === "STEP");
      if (firstStep && forbidden.includes(firstStep.keyword)) {
        errors.push(mkIssue(rule, firstStep.lineNo, 1,
          `'${firstStep.keyword}' không được là step đầu tiên trong Scenario`,
          `Thay '${firstStep.keyword}' bằng Given/When/Then`));
      }
    }
    return errors;
  },

  // ── O-001 ─ Scenario Outline phải có Examples ────────────────────────────
  OUTLINE_HAS_EXAMPLES({ rule, blocks }) {
    return blocks
      .filter(b => b.type === "SCENARIO_OUTLINE" && (!b.examples || b.examples.rows.length === 0))
      .map(b => mkIssue(rule, b.lineNo, 1,
        `Scenario Outline "${b.desc}" không có khối 'Examples:'`,
        "Thêm khối Examples: với header và ít nhất 1 dòng data"));
  },

  // ── O-002 ─ Examples phải có header + >=1 data row ───────────────────────
  EXAMPLES_TABLE_STRUCTURE({ rule, blocks }) {
    const errors = [];

    for (const b of blocks) {
      if (b.type !== "SCENARIO_OUTLINE" || !b.examples) {
        continue;
      }
      const rows = b.examples.rows || [];

      const isDynamicExamples = (rows) => {
        if (!rows || rows.length === 0) return false;

        const firstRow = rows[0].text?.trim() || "";

        return /read\s*\(/.test(firstRow) ||
          /karate\.read\s*\(/.test(firstRow) ||
          /karate\.setup\(\)(\.[a-zA-Z_][a-zA-Z0-9_]*)?/.test(firstRow);
      };

      if (isDynamicExamples(rows)) {
        continue;
      }
      const needed = 1 + rule.params.minDataRows;
      if (rows.length < needed) {
        errors.push(
          mkIssue(
            rule,
            b.examples.lineNo,
            1,
            `Examples cần ít nhất 1 dòng header + ${rule.params.minDataRows} dòng data (hiện có ${rows.length} dòng)`,
            "Dòng đầu là header | col1 | col2 |, từ dòng 2 là data"
          )
        );
      }
    }
    return errors;
  },

  // ── O-003 ─ Số cột phải nhất quán ────────────────────────────────────────
  TABLE_COLUMN_CONSISTENCY({ rule, blocks }) {
    const errors = [];
    for (const b of blocks) {
      if (!b.examples || b.examples.rows.length === 0) continue;
      const headerCols = parseTableRow(b.examples.rows[0].text);
      for (let i = 1; i < b.examples.rows.length; i++) {
        const cols = parseTableRow(b.examples.rows[i].text);
        if (cols.length !== headerCols.length) {
          errors.push(mkIssue(rule, b.examples.rows[i].lineNo, 1,
            `Số cột không khớp: header có ${headerCols.length} cột, dòng ${i + 1} có ${cols.length} cột`,
            "Đảm bảo mỗi dòng data có đúng số cột bằng header"));
        }
      }
    }
    return errors;
  },

  // ── O-004 ─ Placeholder <name> phải tồn tại trong Examples header ─────────
  PLACEHOLDER_IN_EXAMPLES({ rule, blocks }) {
    const errors = [];
    for (const b of blocks) {
      if (b.type !== "SCENARIO_OUTLINE") continue;
      if (!b.examples || b.examples.rows.length === 0) continue;
      const allText      = [b.desc, ...(b.steps || []).map(s => s.raw)].join("\n");
      const placeholders = [...allText.matchAll(/<([^>]+)>/g)].map(m => m[1]);
      const headers      = parseTableRow(b.examples.rows[0].text);
      for (const ph of placeholders) {
        if (!headers.includes(ph)) {
          errors.push(mkIssue(rule, b.lineNo, 1,
            `Placeholder <${ph}> không có cột tương ứng trong Examples`,
            `Các cột hiện có: ${headers.join(", ")} — kiểm tra lại tên (case-sensitive)`));
        }
      }
    }
    return errors;
  },

  // ── O-005 ─ Examples header không trùng tên ──────────────────────────────
  TABLE_UNIQUE_HEADERS({ rule, blocks }) {
    const errors = [];
    for (const b of blocks) {
      if (!b.examples || b.examples.rows.length === 0) continue;
      const headers = parseTableRow(b.examples.rows[0].text);
      const seen    = new Set();
      for (const h of headers) {
        if (seen.has(h))
          errors.push(mkIssue(rule, b.examples.rows[0].lineNo, 1,
            `Tên cột '${h}' bị trùng trong Examples header`,
            "Mỗi cột phải có tên duy nhất"));
        seen.add(h);
      }
    }
    return errors;
  },

  // ── O-006 ─ Mọi cột trong Examples nên được dùng ─────────────────────────
  EXAMPLES_COLUMN_USED({ rule, blocks }) {
    const errors = [];

    for (const b of blocks) {

      if (
        b.type !== "SCENARIO_OUTLINE" ||
        !b.examples ||
        b.examples.rows.length === 0
      ) continue;

      const firstRow = b.examples.rows[0].text || "";

      if (/\b(read|karate\.read|karate\.setup)\s*\(/.test(firstRow)) {
        continue;
      }

      const headers = parseTableRow(firstRow)
        .map(h => h.replace(/[^a-zA-Z0-9_]+$/, ""));

      const allText = [
        b.desc,
        ...(b.steps || []).map(s => s.raw)
      ].join("\n");

      for (const h of headers) {

        if (new RegExp(`\\b${h}\\b`).test(allText)) {
          continue;
        }

        errors.push(
          mkIssue(
            rule,
            b.examples.rows[0].lineNo,
            1,
            `Cột '${h}' trong Examples không được dùng trong bất kỳ step nào (dead data)`,
            `Xóa cột '${h}' hoặc thêm placeholder <${h}> vào step tương ứng`
          )
        );
      }
    }

    return errors;
  },

  // ── E-001…E-006 / H-002 / H-004 / H-006 / D-003…D-005 ─ Regex matching ───
  REGEX_STEP_PATTERN({ rule, blocks }) {
    const errors = [];
    const { triggerPattern, validPattern, invalidPattern, flags = "", message } = rule.params;
    const triggerRe = triggerPattern  ? new RegExp(triggerPattern,  flags) : null;
    const validRe   = validPattern    ? new RegExp(validPattern,    flags) : null;
    const invalidRe = invalidPattern  ? new RegExp(invalidPattern,  flags) : null;

    let inDocStr = false;
    for (const b of blocks) {
      for (const step of (b.steps || [])) {
        if (step.type === "DOCSTRING_DELIM") { inDocStr = !inDocStr; continue; }
        if (inDocStr || ["TABLE_ROW", "DOCSTRING_CONTENT", "BLANK"].includes(step.type)) continue;

        const line = step.raw;
        if (triggerRe && !triggerRe.test(line)) continue;

        if (invalidRe && invalidRe.test(line)) {
          errors.push(mkIssue(rule, step.lineNo, 1, message));
        } else if (validRe && !invalidRe && !validRe.test(line)) {
          errors.push(mkIssue(rule, step.lineNo, 1, `${message}: "${line.trim()}"`));
        }
      }
    }
    return errors;
  },

  // ── E-003 ─ Ngoặc cân bằng trong JSON inline ─────────────────────────────
  BALANCED_BRACKETS({ rule, blocks }) {
    const errors     = [];
    const triggerKws = rule.params.triggerKeywords;
    let inDocStr     = false;

    for (const b of blocks) {
      for (const step of (b.steps || [])) {
        if (step.type === "DOCSTRING_DELIM") { inDocStr = !inDocStr; continue; }
        if (inDocStr || step.type !== "STEP") continue;
        if (!triggerKws.some(kw => step.body === kw || step.body.startsWith(kw + " "))) continue;

        // Strip string literals trước khi đếm ngoặc
        const stripped = step.raw.replace(/"[^"]*"|'[^']*'/g, '""');
        let curly = 0, square = 0;
        for (const ch of stripped) {
          if (ch === "{") curly++;  else if (ch === "}") curly--;
          if (ch === "[") square++; else if (ch === "]") square--;
        }
        if (curly !== 0)
          errors.push(mkIssue(rule, step.lineNo, 1,
            `Ngoặc nhọn {} không cân bằng (${curly > 0 ? `thiếu ${curly} dấu }` : `thừa ${-curly} dấu }`})`,
            "Kiểm tra lại JSON object trong step này"));
        if (square !== 0)
          errors.push(mkIssue(rule, step.lineNo, 1,
            `Ngoặc vuông [] không cân bằng (${square > 0 ? `thiếu ${square} dấu ]` : `thừa ${-square} dấu ]`})`,
            "Kiểm tra lại JSON array trong step này"));
      }
    }
    return errors;
  },

  // ── E-005 ─ Biến phải được def trước khi dùng ────────────────────────────
  VARIABLE_DEFINED_BEFORE_USE({ rule, blocks }) {
    const errors = [];
    const builtin = new Set(rule.params.builtinVars || []);

    // vars từ Background
    const bgVars = new Set();
    const bg = blocks.find(b => b.type === "BACKGROUND");

    for (const step of (bg?.steps || [])) {
      const m = step.raw?.match(/\*\s+def\s+([a-zA-Z_]\w*)\s*=/);
      if (m) bgVars.add(m[1]);
    }

    // collect vars được inject qua call
    const injectedVars = new Set();

    for (const b of blocks) {
      for (const step of (b.steps || [])) {

        // ví dụ:
        // * def data = raw.map(x => ({ email: ..., password: ..., error: ... }))
        const obj = step.raw.match(
          /\(\s*\{\s*([^}]+)\s*\}\s*\)/
        );

        if (!obj) continue;

        for (const m of obj[1].matchAll(/([a-zA-Z_]\w*)\s*:/g)) {
          injectedVars.add(m[1]);
        }
      }
    }

    for (const b of blocks) {

      if (!["SCENARIO", "SCENARIO_OUTLINE"].includes(b.type)) {
        continue;
      }

      const exampleCols = b.examples?.rows?.length
        ? new Set(
            parseTableRow(b.examples.rows[0].text)
              .map(h => h.replace(/[^a-zA-Z0-9_]+$/, ""))
          )
        : new Set();

      const localVars = new Set([
        ...bgVars,
        ...builtin,
        ...exampleCols,
        ...injectedVars
      ]);

      for (const step of (b.steps || [])) {

        if (step.type !== "STEP") continue;

        // def var
        const defM = step.raw.match(
          /\*\s+def\s+([a-zA-Z_]\w*)\s*=/
        );

        if (defM) {
          localVars.add(defM[1]);
          continue;
        }

        // #(var)
        const usages = [
          ...step.raw.matchAll(/#\(([a-zA-Z_]\w*)[^)]*\)/g)
        ].map(m => m[1]);

        for (const v of usages) {

          if (localVars.has(v)) continue;

          errors.push(
            mkIssue(
              rule,
              step.lineNo,
              1,
              `Biến '${v}' được dùng trong #(${v}) nhưng chưa được 'def' trước đó`,
              `Thêm: * def ${v} = <giá_trị> trước step này`
            )
          );
        }
      }
    }

    return errors;
  },

  // ── H-001 ─ url phải được set trước method ───────────────────────────────
  URL_BEFORE_METHOD({ rule, blocks }) {
    const errors  = [];
    const bg      = blocks.find(b => b.type === "BACKGROUND");
    const bgHasUrl = bg
      ? (bg.steps || []).some(s => s.type === "STEP" && /\burl\b/.test(s.body))
      : false;

    for (const b of blocks) {
      if (!["SCENARIO", "SCENARIO_OUTLINE"].includes(b.type)) continue;
      let hasUrl = bgHasUrl;
      for (const step of (b.steps || [])) {
        if (step.type !== "STEP") continue;
        if (/^(url|path)\s+/.test(step.body)) { hasUrl = true; continue; }
        if (/^method\s+/i.test(step.body) && !hasUrl) {
          errors.push(mkIssue(rule, step.lineNo, 1,
            "'method' được gọi nhưng chưa có 'url' nào được set trong Scenario này hoặc Background",
            "Thêm: Given url '<endpoint>' trước bước 'When method ...'"));
        }
      }
    }
    return errors;
  },

  // ── H-003 ─ request nên có trước method post/put/patch ───────────────────
  REQUEST_BEFORE_METHOD({ rule, blocks }) {
    const errors      = [];
    const bodyMethods = new Set(rule.params.methodsRequiringBody.map(m => m.toLowerCase()));

    for (const b of blocks) {
      if (!["SCENARIO", "SCENARIO_OUTLINE"].includes(b.type)) continue;
      let hasRequest = false;
      for (const step of (b.steps || [])) {
        if (step.type !== "STEP") continue;
        if (/^request\s+/.test(step.body)) { hasRequest = true; continue; }
        const methodM = step.body.match(/^method\s+(\w+)/i);
        if (methodM) {
          if (bodyMethods.has(methodM[1].toLowerCase()) && !hasRequest) {
            errors.push(mkIssue(rule, step.lineNo, 1,
              `'method ${methodM[1]}' không có bước 'request' body trước đó`,
              "Thêm: And request <body> trước bước 'When method ...'"));
          }
          hasRequest = false; // reset sau mỗi lần gọi
        }
      }
    }
    return errors;
  },

  // ── H-005 ─ path yêu cầu base url ────────────────────────────────────────
  PATH_REQUIRES_BASE_URL({ rule, blocks }) {
    const errors  = [];
    const bg      = blocks.find(b => b.type === "BACKGROUND");
    const bgHasUrl = bg
      ? (bg.steps || []).some(s => s.type === "STEP" && /^url\s+/.test(s.body))
      : false;

    for (const b of blocks) {
      if (!["SCENARIO", "SCENARIO_OUTLINE"].includes(b.type)) continue;
      let hasUrl = bgHasUrl;
      for (const step of (b.steps || [])) {
        if (step.type !== "STEP") continue;
        if (/^url\s+/.test(step.body)) { hasUrl = true; continue; }
        if (/^path\s+/.test(step.body) && !hasUrl) {
          errors.push(mkIssue(rule, step.lineNo, 1,
            "'path' được dùng nhưng chưa có 'url' base nào được set",
            "Đặt 'url' trong Background hoặc trước bước 'path'"));
        }
      }
    }
    return errors;
  },

  // ── D-001 ─ DocString phải mở và đóng bằng """ ───────────────────────────
  DOCSTRING_BALANCED({ rule, rawLines }) {
    const errors = [];
    let open = false, openLine = -1;
    for (let i = 0; i < rawLines.length; i++) {
      if (rawLines[i].trim().startsWith('"""')) {
        if (!open) { open = true; openLine = i + 1; }
        else       { open = false; }
      }
    }
    if (open)
      errors.push(mkIssue(rule, openLine, 1,
        `Doc String mở tại dòng ${openLine} nhưng không có dòng đóng """`,
        `Thêm dòng """ để đóng Doc String`));
    return errors;
  },

  // ── D-002 ─ Table format: | ở đầu và cuối mỗi dòng ──────────────────────
  TABLE_FORMAT({ rule, rawLines }) {
    const errors = [];
    let inDocStr = false;

    for (let i = 0; i < rawLines.length; i++) {
        const t = rawLines[i].trim();

        if (t.startsWith('"""')) {
        inDocStr = !inDocStr;
        continue;
        }

        if (inDocStr) continue;

        // Ignore logical OR / double pipes
        if (t.includes("||")) continue;

        // Detect likely markdown table
        const pipeCount = (t.match(/\|/g) || []).length;

        const isLikelyTable =
        pipeCount >= 2;

        if (
        isLikelyTable &&
        (!t.startsWith("|") || !t.endsWith("|"))
        ) {
        errors.push(
            mkIssue(
            rule,
            i + 1,
            1,
            `Dòng table phải bắt đầu và kết thúc bằng |: "${t}"`,
            "Ví dụ đúng: | col1 | col2 |"
            )
        );
        }
    }

    return errors;
    },
};

function runValidation(ast, onlyIds) {
  // ── Đọc nội dung ──────────────────────────────────────────────────────────
  let rawText = ast.rawText;
  if (!rawText) {
    if (!ast.filePath || !fs.existsSync(ast.filePath)) {
      return [{
        ruleId: "syntax", severity: "ERROR", line: 1, col: 1,
        message: "Không thể đọc file: filePath không tồn tại và rawText không được cung cấp",
        suggestion: "Truyền ast.rawText hoặc ast.filePath hợp lệ",
      }];
    }
    rawText = fs.readFileSync(ast.filePath, "utf8");
  }

  // ── Parse ─────────────────────────────────────────────────────────────────
  const { rawLines, blocks } = buildBlocks(rawText);
  const ctx = { blocks, rawLines };

  // ── Chọn rules cần chạy ───────────────────────────────────────────────────
  const activeRules = onlyIds?.length
    ? ALL_RULES.filter(r => onlyIds.includes(r.id))
    : ALL_RULES;

  // ── Chạy từng rule ────────────────────────────────────────────────────────
  const issues = [];
  for (const rule of activeRules) {
    const checkFn = CHECKS[rule.check];
    if (!checkFn) {
      // Rule có trong JSON nhưng chưa implement check → WARN nội bộ
      issues.push({
        ruleId:     rule.id,
        severity:   "WARN",
        line:       0,
        col:        0,
        message:    `[syntax.js] Check type '${rule.check}' chưa được implement`,
        suggestion: `Thêm CHECKS['${rule.check}'] vào syntax.js`,
      });
      continue;
    }
    try {
      const found = checkFn({ rule, ...ctx });
      issues.push(...found);
    } catch (err) {
      issues.push({
        ruleId:     rule.id,
        severity:   "ERROR",
        line:       0,
        col:        0,
        message:    `[syntax.js internal error] Rule ${rule.id}: ${err.message}`,
        suggestion: "Kiểm tra lại logic của rule hoặc báo cáo bug",
      });
    }
  }

  return issues.sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}


module.exports = {
  id:          "KRTV-SYNTAX",
  name:        "karate-syntax-all-rules",
  severity:    "ERROR",
  description: "Kiểm tra toàn bộ syntax rules của Karate DSL .feature file (load từ karate-rules.json)",

  /**
   * Hàm validate — interface tương thích với rule module pattern.
   *
   * @param {object} ast         — { filePath?, rawText? }
   * @param {object} [options]   — { onlyIds?: string[] }
   * @returns {Issue[]}          — mảng issues, mỗi phần tử có: { ruleId, severity, line, col, message, suggestion }
   */
  validate(ast, options = {}) {
    return runValidation(ast, options.onlyIds);
  },
};
