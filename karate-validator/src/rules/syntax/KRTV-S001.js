/**
 * KRTV-S001 — missing-feature-keyword
 * File phải có từ khóa Feature: ở cấp cao nhất.
 */
module.exports = {
  id: "KRTV-S001",
  name: "missing-feature-keyword",
  severity: "ERROR",
  description: "File .feature phải bắt đầu bằng 'Feature:'",

  validate(ast) {
    const errors = [];

    // Check parse errors that mention Feature keyword
    if (ast.parseErrors && ast.parseErrors.length > 0) {
      for (const pe of ast.parseErrors) {
        if (/Feature/i.test(pe.message)) {
          errors.push({
            ruleId: "KRTV-S001",
            severity: "ERROR",
            line: pe.line || 1,
            col: pe.col || 1,
            message: pe.message,
            suggestion: "Dòng đầu tiên (không tính comment và blank line) phải là: Feature: <tên feature>",
          });
        }
      }
      if (errors.length > 0) return errors;
    }

    if (!ast.feature) {
      errors.push({
        ruleId: "KRTV-S001",
        severity: "ERROR",
        line: 1,
        col: 1,
        message: "Không tìm thấy từ khóa 'Feature:' trong file",
        suggestion: "Dòng đầu tiên (không tính comment và blank line) phải là: Feature: <tên feature>",
      });
    }

    return errors;
  },
};
