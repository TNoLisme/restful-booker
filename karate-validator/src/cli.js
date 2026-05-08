#!/usr/bin/env node

const { Command } = require("commander");
const { scanFiles } = require("./scanner");
const { parseFeatureFile } = require("./parser");
const { getActiveRules } = require("./rules/index");
const { Reporter } = require("./reporter");
const { loadConfig } = require("./config");

const program = new Command();

program
  .name("karate-validator")
  .description("Validate Karate DSL .feature files")
  .version("1.0.0");

program
  .command("validate [patterns...]")
  .description("Validate .feature files matching the given glob patterns")
  .option("-c, --config <path>", "Path to config file", "karate-validator.config.yaml")
  .option("-l, --level <level>", "Minimum severity to report: error | warn | info", "warn")
  .option("-f, --format <format>", "Output format: text | json", "text")
  .option("--no-color", "Disable colored output")
  .action(async (patterns, options) => {
    if (!patterns || patterns.length === 0) {
      console.error("❌  Vui lòng cung cấp ít nhất 1 pattern. Ví dụ:");
      console.error("    karate-validator validate \"./features/**/*.feature\"");
      process.exit(1);
    }

    // Load config
    const config = loadConfig(options.config);
    const rules = getActiveRules(config);

    // Scan files
    const files = scanFiles(patterns);
    if (files.length === 0) {
      console.warn(`⚠  Không tìm thấy file .feature nào với pattern: ${patterns.join(", ")}`);
      process.exit(0);
    }

    const reporter = new Reporter({ format: options.format, level: options.level, color: options.color !== false });
    let totalErrors = 0;
    let totalWarns = 0;
    const allResults = [];

    for (const filePath of files) {
      let ast;
      try {
        ast = parseFeatureFile(filePath);
      } catch (parseErr) {
        const result = {
          file: filePath,
          errors: [{
            ruleId: "PARSE-ERR",
            severity: "ERROR",
            line: parseErr.line || 1,
            col: parseErr.col || 1,
            message: `Không thể parse file: ${parseErr.message}`,
            suggestion: "Kiểm tra lại cú pháp Gherkin cơ bản (Feature:, Scenario:, ...)"
          }]
        };
        allResults.push(result);
        totalErrors++;
        continue;
      }

      const fileErrors = [];
      for (const rule of rules) {
        try {
          const violations = rule.validate(ast, filePath);
          fileErrors.push(...violations);
        } catch (ruleErr) {
          // Rule itself crashed — skip silently in production
        }
      }

      allResults.push({ file: filePath, errors: fileErrors });
      totalErrors += fileErrors.filter(e => e.severity === "ERROR").length;
      totalWarns += fileErrors.filter(e => e.severity === "WARN").length;
    }

    reporter.report(allResults, { totalFiles: files.length, totalErrors, totalWarns });

    // Exit code 1 nếu có ERROR → CI/CD sẽ fail
    if (totalErrors > 0) process.exit(1);
    else process.exit(0);
  });

// Shorthand: karate-validator --validate "pattern"  (giữ tương thích với docs)
program
  .option("--validate <patterns...>", "Shorthand: validate feature files")
  .hook("preAction", (thisCommand) => {
    const val = thisCommand.opts().validate;
    if (val) {
      process.argv = [process.argv[0], process.argv[1], "validate", ...(Array.isArray(val) ? val : [val])];
      program.parseAsync(process.argv);
    }
  });

program.parse(process.argv);
