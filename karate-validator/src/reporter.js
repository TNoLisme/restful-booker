const path = require("path");

const SEVERITY_ORDER = { ERROR: 0, WARN: 1, INFO: 2 };

const ICONS = {
  ERROR: "✖",
  WARN:  "⚠",
  INFO:  "ℹ",
};

// ANSI colors
const COLOR = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  green:  "\x1b[32m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
  white:  "\x1b[97m",
};

class Reporter {
  constructor({ format = "text", level = "warn", color = true } = {}) {
    this.format = format;
    this.minSeverity = SEVERITY_ORDER[level.toUpperCase()] ?? 1;
    this.useColor = color && process.stdout.isTTY !== false;
  }

  c(code, str) {
    if (!this.useColor) return str;
    return `${code}${str}${COLOR.reset}`;
  }

  report(results, { totalFiles, totalErrors, totalWarns }) {
    if (this.format === "json") {
      this._reportJson(results, { totalFiles, totalErrors, totalWarns });
    } else {
      this._reportText(results, { totalFiles, totalErrors, totalWarns });
    }
  }

  _reportText(results, { totalFiles, totalErrors, totalWarns }) {
    const c = this.c.bind(this);
    const divider = "═".repeat(60);

    console.log("\n" + c(COLOR.bold, divider));
    console.log(c(COLOR.bold + COLOR.white, "  KARATE VALIDATOR — Kết quả kiểm tra"));
    console.log(c(COLOR.bold, divider));

    let filesWithIssues = 0;

    for (const { file, errors } of results) {
      const filtered = errors.filter(e => SEVERITY_ORDER[e.severity] <= this.minSeverity);
      if (filtered.length === 0) continue;

      filesWithIssues++;
      const relPath = path.relative(process.cwd(), file);
      console.log("\n" + c(COLOR.cyan, `📁 ${relPath}`));

      const sorted = [...filtered].sort((a, b) => a.line - b.line);
      for (const err of sorted) {
        const icon  = ICONS[err.severity] || "·";
        const color = err.severity === "ERROR" ? COLOR.red : err.severity === "WARN" ? COLOR.yellow : COLOR.gray;

        console.log(
          c(color, `  ${icon} [${err.severity}]`) +
          c(COLOR.gray, ` ${err.ruleId}`) +
          c(COLOR.bold, ` · Dòng ${err.line}`) +
          (err.col ? c(COLOR.gray, `:${err.col}`) : "")
        );
        console.log(`      ${err.message}`);
        if (err.suggestion) {
          console.log(c(COLOR.gray, `      → ${err.suggestion}`));
        }
      }
    }

    // Files with no issues
    const cleanFiles = totalFiles - filesWithIssues;

    console.log("\n" + c(COLOR.bold, divider));

    const filesSummary = `  Tổng kết: ${totalFiles} file kiểm tra`;
    console.log(filesSummary);

    if (totalErrors > 0) {
      console.log(c(COLOR.red,    `             ${totalErrors} ERROR  (bắt buộc sửa)`));
    }
    if (totalWarns > 0) {
      console.log(c(COLOR.yellow, `             ${totalWarns} WARN   (nên xem xét)`));
    }
    if (cleanFiles > 0 && (totalErrors > 0 || totalWarns > 0)) {
      console.log(c(COLOR.green,  `             ${cleanFiles} file không có vấn đề`));
    }

    if (totalErrors === 0 && totalWarns === 0) {
      console.log(c(COLOR.green, `  Kết quả:   ✔ PASSED — tất cả file hợp lệ`));
    } else if (totalErrors > 0) {
      console.log(c(COLOR.red,   `  Kết quả:   ✖ FAILED`));
    } else {
      console.log(c(COLOR.yellow, `  Kết quả:   ⚠ PASSED WITH WARNINGS`));
    }

    console.log(c(COLOR.bold, divider) + "\n");
  }

  _reportJson(results, summary) {
    const output = {
      summary,
      files: results.map(({ file, errors }) => ({
        file,
        errorCount:  errors.filter(e => e.severity === "ERROR").length,
        warnCount:   errors.filter(e => e.severity === "WARN").length,
        violations:  errors,
      })),
    };
    console.log(JSON.stringify(output, null, 2));
  }
}

module.exports = { Reporter };
