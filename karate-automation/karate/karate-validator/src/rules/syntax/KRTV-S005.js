/**
 * KRTV-S005 — unclosed-string
 * String trong step phải đóng ngoặc đúng (' hoặc ").
 * Phát hiện cặp quote không khớp trên cùng một dòng.
 */
module.exports = {
  id: "KRTV-S005",
  name: "unclosed-string",
  severity: "ERROR",
  description: "String phải được đóng ngoặc đúng (' hoặc \")",

  validate(ast) {
    const errors = [];
    if (!ast.feature) return errors;

    const allContainers = [
      ...(ast.feature.background ? [ast.feature.background] : []),
      ...ast.feature.scenarios,
    ];

    for (const container of allContainers) {
      for (const step of container.steps) {
        const text = step.text || "";

        // Count unescaped single quotes
        const singleQuotes = (text.match(/(?<!\\)'/g) || []).length;
        // Count unescaped double quotes
        const doubleQuotes = (text.match(/(?<!\\)"/g) || []).length;

        // Skip doc-string indicators (""")
        if (text.includes('"""')) continue;

        if (singleQuotes % 2 !== 0) {
          errors.push({
            ruleId: "KRTV-S005",
            severity: "ERROR",
            line: step.line,
            col: step.col,
            message: `Single quote (') chưa được đóng: ${text}`,
            suggestion: "Kiểm tra lại số lượng dấu ' — phải xuất hiện theo cặp",
          });
        }

        if (doubleQuotes % 2 !== 0) {
          errors.push({
            ruleId: "KRTV-S005",
            severity: "ERROR",
            line: step.line,
            col: step.col,
            message: `Double quote (\") chưa được đóng: ${text}`,
            suggestion: 'Kiểm tra lại số lượng dấu " — phải xuất hiện theo cặp',
          });
        }
      }
    }

    return errors;
  },
};
