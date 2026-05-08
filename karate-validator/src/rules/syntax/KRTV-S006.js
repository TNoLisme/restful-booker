/**
 * KRTV-S006 — examples-table-missing-header
 * Scenario Outline phải có Examples: với ít nhất 2 dòng (header + 1 data row).
 * Nếu chỉ có header mà không có data → WARN.
 * Nếu không có header (bảng rỗng) → ERROR.
 */
module.exports = {
  id: "KRTV-S006",
  name: "examples-table-missing-header",
  severity: "ERROR",
  description: "Scenario Outline phải có Examples table với header và ít nhất 1 data row",

  validate(ast) {
    const errors = [];
    if (!ast.feature) return errors;

    for (const scenario of ast.feature.scenarios) {
      const isOutline = /outline/i.test(scenario.keyword);

      if (isOutline) {
        if (!scenario.examples) {
          errors.push({
            ruleId: "KRTV-S006",
            severity: "ERROR",
            line: scenario.line,
            col: 1,
            message: `Scenario Outline '${scenario.name}' thiếu phần 'Examples:'`,
            suggestion: "Thêm:\n    Examples:\n      | param1 | param2 |\n      | value1 | value2 |",
          });
          continue;
        }

        if (scenario.examples.rows.length === 0) {
          errors.push({
            ruleId: "KRTV-S006",
            severity: "ERROR",
            line: scenario.examples.line,
            col: 1,
            message: "Examples table không có dòng nào",
            suggestion: "Thêm header row rồi data row: | tên_cột | ... |",
          });
        } else if (scenario.examples.rows.length === 1) {
          errors.push({
            ruleId: "KRTV-S006",
            severity: "WARN",
            line: scenario.examples.line,
            col: 1,
            message: "Examples table chỉ có header, không có data row",
            suggestion: "Thêm ít nhất 1 dòng dữ liệu bên dưới header",
          });
        }
      }
    }

    return errors;
  },
};
