/**
 * KRTV-S003 — invalid-step-keyword
 * Step phải bắt đầu bằng: Given / When / Then / And / But / *
 * Phát hiện các dòng trong scenario trông như step nhưng thiếu keyword.
 */
module.exports = {
  id: "KRTV-S003",
  name: "invalid-step-keyword",
  severity: "ERROR",
  description: "Step phải bắt đầu bằng Given / When / Then / And / But / *",

  validate(ast) {
    const errors = [];
    if (!ast.feature) return errors;

    const validKeywords = /^(Given|When|Then|And|But|\*)\s+/i;

    // Check inside each scenario that all steps have valid keywords
    // (Our parser already extracts valid steps; this rule catches lines
    //  that were skipped because they don't match step pattern but look
    //  like intended steps - i.e. lines with karate DSL keywords at col > 1
    //  that are NOT preceded by a step keyword)
    const allScenarios = [
      ...(ast.feature.background ? [ast.feature.background] : []),
      ...ast.feature.scenarios,
    ];

    for (const container of allScenarios) {
      for (const step of container.steps) {
        if (!validKeywords.test(step.raw.trim())) {
          errors.push({
            ruleId: "KRTV-S003",
            severity: "ERROR",
            line: step.line,
            col: step.col,
            message: `Step không có keyword hợp lệ: "${step.raw.trim()}"`,
            suggestion: "Thêm '* ' hoặc 'Given/When/Then ' trước step",
          });
        }
      }
    }

    return errors;
  },
};
