/**
 * KRTV-S004 — inconsistent-indentation
 * Indent phải nhất quán trong toàn file (chỉ dùng spaces, không mix tabs).
 * Cũng cảnh báo nếu dùng tab thay vì space.
 */
module.exports = {
  id: "KRTV-S004",
  name: "inconsistent-indentation",
  severity: "WARN",
  description: "Không được mix tab và space; indent phải nhất quán",

  validate(ast) {
    const errors = [];
    if (!ast.rawLines) return errors;

    let hasTab = false;
    let hasSpace = false;

    for (let i = 0; i < ast.rawLines.length; i++) {
      const line = ast.rawLines[i];
      if (!line.trim()) continue; // skip blank lines

      const leadingTab = /^\t/.test(line);
      const leadingSpace = /^ /.test(line);

      if (leadingTab) hasTab = true;
      if (leadingSpace) hasSpace = true;

      if (leadingTab) {
        errors.push({
          ruleId: "KRTV-S004",
          severity: "WARN",
          line: i + 1,
          col: 1,
          message: "Dòng dùng tab để indent — nên dùng spaces",
          suggestion: "Thay tab bằng 2 hoặc 4 spaces cho nhất quán",
        });
      }
    }

    // If both tabs and spaces are found across file, add summary error
    if (hasTab && hasSpace) {
      errors.unshift({
        ruleId: "KRTV-S004",
        severity: "ERROR",
        line: 1,
        col: 1,
        message: "File dùng cả tab lẫn space để indent — hãy chọn một loại",
        suggestion: "Cấu hình editor để tự động chuyển tab → spaces",
      });
    }

    return errors;
  },
};
