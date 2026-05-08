/**
 * KRTV-S002 — scenario-missing-name
 * Mỗi Scenario / Scenario Outline phải có tên (không để trống sau dấu :).
 */
module.exports = {
  id: "KRTV-S002",
  name: "scenario-missing-name",
  severity: "WARN",
  description: "Scenario phải có tên mô tả",

  validate(ast) {
    const errors = [];
    if (!ast.feature) return errors;

    for (const scenario of ast.feature.scenarios) {
      if (!scenario.name || scenario.name.trim() === "") {
        errors.push({
          ruleId: "KRTV-S002",
          severity: "WARN",
          line: scenario.line,
          col: 1,
          message: `${scenario.keyword}: không có tên`,
          suggestion: `Đặt tên mô tả, ví dụ: ${scenario.keyword}: Login thành công với tài khoản hợp lệ`,
        });
      }
    }

    return errors;
  },
};
