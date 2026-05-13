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

--------------------------------------------------------------------------
## Kết quả test với version 1
### Bộ test
- Vì không có một bộ các file .feature được khẳng định là đúng hay sai nên để tạo được bộ test đánh giá sản phâm này em chủ động tạo 1 bộ gồm 10 file chạy được và 15 file có chữa lỗi (chạy sẽ làm tool bị treo)

Kết quả chạy:
Pass: 11
Fail: 14
Trong đó có:
Error: 17
Warn: 6

### Chỉ số đánh giá
TP: 10/11  || FP: 14/15
TN: 1/11   || FN: 0/15

Đánh giá cụ thể hơn với các cờ EROR và WARN:
ERROR: TP: 17/17

-> TP đạt 10/11 vì một file có lỗi missing method http không nằm trong bộ rule.