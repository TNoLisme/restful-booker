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
node src/cli.js validate "/*.feature"
```

### 2. Chỉ báo ERROR (bỏ qua WARN)

```bash
node src/cli.js validate "/*.feature" --level error
```

### 3. Output dạng JSON (dùng cho CI/CD đọc)

```bash
node src/cli.js validate "../features/**/*.feature" --format json
```

### 4. Dùng config tùy chỉnh

```bash
node src/cli.js validate "../features/**/*.feature" --config ./karate-validator.config.yaml
```