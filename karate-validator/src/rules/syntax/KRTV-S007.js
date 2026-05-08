/**
 * KRTV-S007 — invalid-tag-format
 * Tag phải bắt đầu bằng @ và không chứa khoảng trắng.
 * Phát hiện các tag viết sai kiểu: #smoke, smoke, @smoke tag.
 */
module.exports = {
  id: "KRTV-S007",
  name: "invalid-tag-format",
  severity: "ERROR",
  description: "Tag phải bắt đầu bằng '@' và không chứa khoảng trắng",

  validate(ast) {
    const errors = [];
    if (!ast.feature) return errors;

    // Check raw lines for lines that look like tag lines but are malformed
    if (!ast.rawLines) return errors;

    // A tag line is a line where ALL non-empty tokens start with @
    // We detect lines just before Scenario/Background that have words NOT starting with @
    const scenarioLineNums = new Set(
      ast.feature.scenarios.map(s => s.line)
    );
    if (ast.feature.background) scenarioLineNums.add(ast.feature.background.line);

    for (const lineNum of scenarioLineNums) {
      let j = lineNum - 2; // line above (0-indexed)
      while (j >= 0) {
        const raw = ast.rawLines[j];
        const trimmed = raw ? raw.trim() : "";

        if (!trimmed) break; // blank line stops tag search
        if (trimmed.startsWith("#")) { j--; continue; } // comment, skip

        // If line contains @ it might be a tag line
        if (trimmed.includes("@")) {
          const tokens = trimmed.split(/\s+/);
          for (const token of tokens) {
            if (!token.startsWith("@")) {
              errors.push({
                ruleId: "KRTV-S007",
                severity: "ERROR",
                line: j + 1,
                col: raw.indexOf(token) + 1,
                message: `Token '${token}' trong dòng tag không bắt đầu bằng '@'`,
                suggestion: `Sửa thành '@${token}' hoặc xóa token không hợp lệ`,
              });
            }
          }
        }

        break;
      }
    }

    // Also check tags collected by parser
    const allTags = [
      ...(ast.feature.tags || []),
      ...ast.feature.scenarios.flatMap(s => s.tags || []),
    ];

    for (const tag of allTags) {
      if (!tag.name.startsWith("@")) {
        errors.push({
          ruleId: "KRTV-S007",
          severity: "ERROR",
          line: tag.line,
          col: 1,
          message: `Tag '${tag.name}' không bắt đầu bằng '@'`,
          suggestion: `Sửa thành '@${tag.name.replace(/^[^a-zA-Z0-9]/, "")}'`,
        });
      }
      if (/\s/.test(tag.name)) {
        errors.push({
          ruleId: "KRTV-S007",
          severity: "ERROR",
          line: tag.line,
          col: 1,
          message: `Tag '${tag.name}' chứa khoảng trắng — không hợp lệ`,
          suggestion: "Dùng dấu gạch dưới thay khoảng trắng: @my_tag",
        });
      }
    }

    return errors;
  },
};
