const path = require("path");
const fs = require("fs");

const SEVERITY_ORDER = { ERROR: 0, WARN: 1, INFO: 2 };

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
    this._saveJsonReport(results, { totalFiles, totalErrors, totalWarns});
  }

  _reportText(results, { totalFiles, totalErrors, totalWarns }) {
    const c = this.c.bind(this);
    const divider = "═".repeat(60);

    let filesWithIssues = 0;
    for (const { errors } of results) {
      const filtered = errors.filter(
        e => SEVERITY_ORDER[e.severity] <= this.minSeverity
      );

      if (filtered.length > 0) {
        filesWithIssues++;
      }
    }
    const cleanFiles = totalFiles - filesWithIssues;

    console.log("\n" + c(COLOR.bold, divider));
    console.log(c(COLOR.bold + COLOR.white, "  KARATE VALIDATOR — Kết quả kiểm tra"));
    console.log(c(COLOR.bold, divider));

    console.log(`  Tổng file kiểm tra : ${totalFiles}`);
    if (totalErrors > 0) {
      console.log(c(COLOR.red, `  ERROR              : ${totalErrors}`));
    }
    if (totalWarns > 0) {
      console.log(c(COLOR.yellow, `  WARN               : ${totalWarns}`));
    }
    console.log(c(COLOR.green, `  File hợp lệ        : ${cleanFiles}`));
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

  _saveJsonReport(results, { totalFiles, totalErrors, totalWarns }) {
    const reportPath = path.resolve(
      process.cwd(),
      "src",
      "report",
      "karate-validator-report.json"
    );

    let filesWithIssues = 0;

    const normalizedResults = results
      .map(({ file, errors }) => {
        const filtered = errors.filter(
          e => SEVERITY_ORDER[e.severity] <= this.minSeverity
        );

        if (filtered.length > 0) {
          filesWithIssues++;
        }

        return {
          file: path.relative(process.cwd(), file),
          errors: filtered
        };
      })
      .filter(r => r.errors.length > 0);

    const report = {
      summary: {
        totalFiles,
        totalErrors,
        totalWarns,
        cleanFiles: totalFiles - filesWithIssues,
        status:
          totalErrors > 0
            ? "FAILED"
            : totalWarns > 0
              ? "PASSED_WITH_WARNINGS"
              : "PASSED"
      },
      generatedAt: new Date().toISOString(),
      results: normalizedResults
    };

    fs.writeFileSync(
      reportPath,
      JSON.stringify(report, null, 2),
      "utf8"
    );

    console.log(`JSON report saved: ${reportPath}`);
  }
}

module.exports = { Reporter };
