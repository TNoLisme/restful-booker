# Restful-Booker Karate Testing

Thư mục này chứa bộ kiểm thử Karate chính cho dự án Restful-Booker local. Bộ test được thiết kế để phát hiện lỗi thật, vì vậy một số testcase có thể fail khi API hoặc UI không đáp ứng đúng kỳ vọng.

## Cấu trúc kiểm thử

- `src/test/java/f1_api`: API regression testing.
- `src/test/java/perf`: performance testing bằng Karate Gatling Java DSL.
- `src/test/java/f3_ui`: UI testing bằng Karate driver.
- `src/test/java/f4_mock`: mock server và mock testing.
- `scripts/run-tests.ps1`: script chạy từng nhóm test hoặc toàn bộ F1-F4.

## Điều kiện trước khi chạy

Cần có:

- Java 21.
- Maven.
- Node.js.
- Chrome nếu chạy F3 UI testing.

Với F1, F2 và F3, cần backend chạy ở `http://localhost:3001`.

Với F3, cần thêm React web chạy ở `http://localhost:5173`.

## Lệnh chạy chuẩn

Từ thư mục này:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
```

Chạy từng nhóm:

```powershell
.\scripts\run-tests.ps1 f1
.\scripts\run-tests.ps1 f2
.\scripts\run-tests.ps1 f3
.\scripts\run-tests.ps1 f4
```

Chạy toàn bộ:

```powershell
.\scripts\run-tests.ps1 all
```

Khi chạy `all`, script không dừng sớm nếu một nhóm fail. Sau khi chạy xong, script sinh báo cáo tổng hợp ở:

```text
target/reports/summary.html
target/reports/summary.md
```

## F1 API Testing

F1 kiểm thử các endpoint Restful-Booker:

- Auth: token, boundary input, SQL/NoSQL injection, user enumeration, timing, randomness và brute force.
- Booking read: lấy danh sách booking, filter, lấy chi tiết theo id.
- Booking write: create, update, patch, delete.
- Ping: kiểm tra `/ping`.

Lệnh Maven trực tiếp:

```powershell
mvn clean test -Dtest=ApiTest
```

Report:

```text
target/reports/f1_api/karate-summary.html
```

## F2 Performance Testing

F2 dùng Gatling để chạy performance test từ Karate feature.

Lệnh Maven trực tiếp:

```powershell
mvn clean test-compile gatling:test -Pgatling
```

Report:

```text
target/reports/f2_performance
```

## F3 UI Testing

F3 kiểm thử landing page ở `3001` và React dashboard ở `5173`.

Lệnh Maven trực tiếp:

```powershell
mvn clean test -Dtest=UiTest
```

Report:

```text
target/reports/f3_ui/karate-summary.html
```

## F4 Mock Testing

F4 tự khởi động mock server Restful-Booker rồi chạy smoke test trên mock API.

Lệnh Maven trực tiếp:

```powershell
mvn clean test -Dtest=MockRunner
```

Report:

```text
target/reports/f4_mock/karate-summary.html
target/reports/f4_mock/mockserver-summary.html
```

## Ghi chú về kết quả fail

Test fail không luôn có nghĩa là bộ test sai. Trong dự án này, test được viết để phát hiện lỗi thật của API hoặc UI. Khi có fail, cần đọc report để phân biệt:

- Fail do lỗi cấu hình môi trường.
- Fail do backend/frontend chưa chạy.
- Fail do bug thật trong sản phẩm.
- Fail do testcase đang kiểm tra một hành vi bảo mật hoặc biên.
