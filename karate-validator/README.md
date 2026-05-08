# karate-validator

Validate cú pháp các file `.feature` của Karate DSL trước khi chạy test.

## Cài đặt

```bash
cd karate/karate-validator
npm install
```

## Cú pháp chạy

### 1. Validate toàn bộ feature files trong project

```bash
node src/cli.js validate "../features/**/*.feature"
```

### 2. Validate 1 file cụ thể

```bash
node src/cli.js validate "../features/auth/login.feature"
```

### 3. Validate nhiều thư mục

```bash
node src/cli.js validate "../features/auth/**" "../features/payment/**"
```

### 4. Chỉ báo ERROR (bỏ qua WARN)

```bash
node src/cli.js validate "../features/**/*.feature" --level error
```

### 5. Output dạng JSON (dùng cho CI/CD đọc)

```bash
node src/cli.js validate "../features/**/*.feature" --format json
```

### 6. Dùng config tùy chỉnh

```bash
node src/cli.js validate "../features/**/*.feature" --config ./karate-validator.config.yaml
```

### 7. Chạy test nội bộ của validator

```bash
npm test
```

---

## Cấu trúc thư mục

```
karate-validator/
├── src/
│   ├── cli.js              ← Entry point (cờ chạy)
│   ├── scanner.js          ← Scan file theo glob
│   ├── parser.js           ← Parse .feature → AST
│   ├── reporter.js         ← In kết quả ra terminal
│   ├── config.js           ← Đọc file cấu hình
│   └── rules/
│       ├── index.js        ← Registry tất cả rules
│       ├── syntax/         ← Rules S001–S007 (đã implement)
│       ├── semantic/       ← Rules E001–E006 (TODO)
│       └── convention/     ← Rules C001–C005 (TODO)
├── tests/
│   ├── run-tests.js        ← Test runner
│   └── fixtures/
│       ├── valid/          ← File .feature hợp lệ
│       └── invalid/        ← File .feature có lỗi cố ý
└── karate-validator.config.yaml
```

---

## Rules đã implement

| ID         | Tên                        | Mức   | Mô tả                                          |
|------------|----------------------------|-------|------------------------------------------------|
| KRTV-S001  | missing-feature-keyword    | ERROR | File phải có `Feature:`                        |
| KRTV-S002  | scenario-missing-name      | WARN  | Scenario phải có tên                           |
| KRTV-S003  | invalid-step-keyword       | ERROR | Step phải bắt đầu bằng Given/When/Then/And/\* |
| KRTV-S004  | inconsistent-indentation   | WARN  | Không mix tab và space                         |
| KRTV-S005  | unclosed-string            | ERROR | String phải đóng ngoặc đúng                    |
| KRTV-S006  | examples-table-missing     | ERROR | Scenario Outline phải có Examples table        |
| KRTV-S007  | invalid-tag-format         | ERROR | Tag phải bắt đầu bằng `@`                     |

## Rules chờ implement

| ID         | Tên                     | Tầng      |
|------------|-------------------------|-----------|
| KRTV-E001  | method-before-url       | Semantic  |
| KRTV-E002  | invalid-http-method     | Semantic  |
| KRTV-E003  | invalid-match-marker    | Semantic  |
| KRTV-E004  | invalid-status-code     | Semantic  |
| KRTV-E005  | call-file-not-found     | Semantic  |
| KRTV-E006  | undefined-variable      | Semantic  |
| KRTV-C001  | missing-scenario-tag    | Convention|
| KRTV-C002  | duplicate-scenario-name | Convention|
| KRTV-C003  | too-many-steps          | Convention|
| KRTV-C004  | background-too-long     | Convention|
| KRTV-C005  | hardcoded-url           | Convention|

---

## Thêm Rule mới

1. Tạo file mới trong `src/rules/syntax/` hoặc `src/rules/semantic/` hoặc `src/rules/convention/`
2. Implement interface:
   ```js
   module.exports = {
     id: "KRTV-X001",
     name: "rule-name",
     severity: "ERROR",   // hoặc "WARN" / "INFO"
     validate(ast, filePath) {
       const errors = [];
       // ... logic kiểm tra
       // errors.push({ ruleId, severity, line, col, message, suggestion })
       return errors;
     }
   };
   ```
3. Đăng ký trong `src/rules/index.js`

---

## Tích hợp CI/CD (GitHub Actions)

```yaml
- name: Validate Karate feature files
  run: |
    cd karate/karate-validator
    npm install
    node src/cli.js validate "../features/**/*.feature"
```

Exit code `1` nếu có ERROR → CI pipeline tự động fail.

## Pre-commit Hook

```bash
# .git/hooks/pre-commit
CHANGED=$(git diff --cached --name-only | grep "\.feature$")
if [ -n "$CHANGED" ]; then
  node karate/karate-validator/src/cli.js validate $CHANGED
  if [ $? -ne 0 ]; then exit 1; fi
fi
```
