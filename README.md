# Restful-Booker Local Testing Project

Đây là dự án Restful-Booker dùng để thực hành kiểm thử API, UI, performance, mock server và CI gate bằng Karate. Dự án có cả mã nguồn ứng dụng chạy local và bộ kiểm thử tự động từ F1 đến F4.

## 1. Tổng quan dự án

Restful-Booker mô phỏng hệ thống đặt phòng khách sạn. Ứng dụng cung cấp API CRUD cho booking, API xác thực admin, API kiểm tra trạng thái server và giao diện web để thao tác với các API đó.

Các mục tiêu chính của repository:

- Chạy ứng dụng Restful-Booker local để phục vụ kiểm thử.
- Viết và chạy API testing bằng Karate.
- Viết và chạy performance testing bằng Karate Gatling.
- Viết và chạy UI testing bằng Karate UI.
- Viết và chạy mock testing bằng Karate mock server.
- Cấu hình GitHub Actions CI gate và local pre-push hook để kiểm tra tự động khi push hoặc pull request.

## 2. Cấu trúc thư mục

- `app-code`: mã nguồn ứng dụng Restful-Booker.
  - Backend Express chạy mặc định tại `http://localhost:3001`.
  - Frontend React/Vite nằm trong `app-code/web`, chạy mặc định tại `http://localhost:5173`.
- `karate-automation/karate/my_project`: bộ kiểm thử chính của dự án.
  - `src/test/java/f1_api`: API testing.
  - `src/test/java/f2_performance`: performance testing bằng Karate Gatling.
  - `src/test/java/f3_ui`: UI testing.
  - `src/test/java/f4_mock`: mock testing.
  - `scripts/run-tests.ps1`: script chạy từng nhóm test hoặc chạy toàn bộ F1-F4.
- `.github/workflows/app-code-api-gate.yml`: GitHub Actions workflow. Hiện tại workflow đang chạy F4 mock testing để demo CI pass ổn định.
- `.githooks/pre-push`: local pre-push hook. File này có sẵn 2 kịch bản gate: F1 fail có chủ đích và F4 pass ổn định.
- `scripts/install-pre-push-hook.ps1`: script cài đặt Git hook local.

## 3. API chính của Restful-Booker

Base URL khi chạy local:

```text
http://localhost:3001
```

Base URL cloud tham khảo:

```text
https://restful-booker.herokuapp.com
```

### Authentication

Tạo token admin:

```http
POST /auth
```

Body mẫu:

```json
{
  "username": "admin",
  "password": "password123"
}
```

Response thành công:

```json
{
  "token": "1a2b3c4d5e6f7g8"
}
```

Token được dùng cho các API cần quyền admin như `PUT`, `PATCH`, `DELETE`.

### Booking

Lấy danh sách booking id:

```http
GET /booking
```

Hỗ trợ query:

- `firstname`
- `lastname`
- `checkin`
- `checkout`

Lấy chi tiết booking:

```http
GET /booking/:id
```

Tạo booking:

```http
POST /booking
```

Body mẫu:

```json
{
  "firstname": "Jim",
  "lastname": "Brown",
  "totalprice": 111,
  "depositpaid": true,
  "bookingdates": {
    "checkin": "2018-01-01",
    "checkout": "2019-01-01"
  },
  "additionalneeds": "Breakfast"
}
```

Cập nhật toàn bộ booking:

```http
PUT /booking/:id
```

Cập nhật một phần booking:

```http
PATCH /booking/:id
```

Xóa booking:

```http
DELETE /booking/:id
```

### Ping

Kiểm tra server đang hoạt động:

```http
GET /ping
```

Theo chuẩn Restful-Booker, API này trả status `201` khi server online.

## 4. Giao diện web

Frontend trong `app-code/web` là giao diện quản lý Restful-Booker. Giao diện phục vụ thao tác và kiểm thử UI cho các chức năng:

- Đăng nhập admin bằng `/auth`.
- Xem danh sách booking bằng `/booking`.
- Lọc booking theo firstname, lastname, checkin, checkout.
- Xem chi tiết booking bằng `/booking/:id`.
- Tạo booking bằng `POST /booking`.
- Cập nhật toàn bộ booking bằng `PUT /booking/:id`.
- Cập nhật một phần booking bằng `PATCH /booking/:id`.
- Xóa booking bằng `DELETE /booking/:id`.
- Kiểm tra trạng thái server bằng `/ping`.

UI được thiết kế theo hướng dashboard hiện đại, có sidebar, form thao tác API, response panel, trạng thái đăng nhập và trạng thái server.

## 5. Chạy ứng dụng local

Chạy backend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Backend chạy tại:

```text
http://localhost:3001
```

Chạy frontend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code\web
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## 6. Các nhóm kiểm thử

### F1 API testing

F1 kiểm thử API thật của backend local `app-code`. Nhóm này bao phủ auth, booking, security, boundary và negative cases.

Một số testcase F1 có thể fail có chủ đích để chứng minh bộ test phát hiện lỗi thật của API.

Điều kiện chạy:

- Backend `app-code` chạy tại `http://localhost:3001`.

Lệnh chạy:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f1
```

Hoặc chạy Maven trực tiếp:

```powershell
mvn clean test -Dtest=ApiTest
```

### F2 performance testing

F2 dùng Karate Gatling để chạy performance testing. Test logic vẫn nằm trong Karate feature, còn Gatling chịu trách nhiệm mô hình tải và báo cáo hiệu năng.

Điều kiện chạy:

- Backend `app-code` chạy tại `http://localhost:3001`.

Lệnh chạy:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f2
```

Hoặc chạy Maven trực tiếp:

```powershell
mvn clean test-compile gatling:test -P gatling
```

### F3 UI testing

F3 dùng Karate UI để kiểm thử landing page gốc ở `localhost:3001` và React dashboard ở `localhost:5173`.

Một số testcase F3 có thể fail có chủ đích để chỉ ra lỗi UI, ví dụ label chưa rõ nghĩa hoặc link ngoài thiếu thuộc tính bảo vệ.

Điều kiện chạy:

- Backend `app-code` chạy tại `http://localhost:3001`.
- Frontend React chạy tại `http://localhost:5173`.
- Máy có Chrome hoặc trình duyệt tương thích với Karate UI.

Lệnh chạy:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f3
```

Hoặc chạy Maven trực tiếp:

```powershell
mvn clean test -Dtest=UiTest
```

### F4 mock testing

F4 dùng Karate mock server để kiểm thử luồng Restful-Booker trên môi trường mock. Nhóm này ổn định hơn vì không phụ thuộc backend thật.

F4 phù hợp để demo test pass và demo CI gate xanh.

Điều kiện chạy:

- Không cần chạy backend `app-code`.

Lệnh chạy:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f4
```

Hoặc chạy Maven trực tiếp:

```powershell
mvn clean test -Dtest=MockRunner
```

## 7. Chạy toàn bộ test và xem report

Chạy toàn bộ F1-F4:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 all
```

Khi chạy `all`, script sẽ chạy lần lượt F1, F2, F3, F4. Nếu một nhóm fail, các nhóm sau vẫn tiếp tục chạy để tạo đủ báo cáo tổng hợp.

Report được sinh trong:

```text
D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project\target\reports
```

Các report chính:

- `f1_api/karate-summary.html`: báo cáo F1 API testing.
- `f2_performance/.../index.html`: báo cáo F2 performance testing.
- `f3_ui/karate-summary.html`: báo cáo F3 UI testing.
- `f4_mock/karate-summary.html`: báo cáo F4 mock testing.
- `summary.md`: báo cáo tổng hợp dạng Markdown.
- `summary.html`: báo cáo tổng hợp dạng HTML.

## 8. GitHub Actions CI gate

Workflow CI nằm tại:

```text
.github/workflows/app-code-api-gate.yml
```

Workflow tự chạy khi có `push` hoặc `pull_request` chạm vào một trong các path:

- `app-code/**`
- `karate-automation/karate/my_project/**`
- `.github/workflows/app-code-api-gate.yml`

CI hiện tại đang chạy F4 mock testing:

```bash
mvn -B -ntp clean test -Dtest=MockRunner
```

Lý do chọn F4 cho CI hiện tại:

- F4 ổn định hơn F1 vì dùng mock server.
- Không cần start backend thật.
- Phù hợp để demo pipeline pass.

Nếu muốn CI phát hiện lỗi API thật bằng F1, đổi workflow sang:

```bash
mvn -B -ntp clean test -Dtest=ApiTest
```

Khi đổi về F1, workflow cũng cần có các bước setup Node.js, install backend, start backend `app-code` và wait `/ping`.

Artifact của CI upload thư mục:

```text
karate-automation/karate/my_project/target/reports
```

Sau khi push, xem CI tại:

```text
GitHub repository -> Actions -> chọn workflow run mới nhất
```

## 9. Local pre-push hook

Pre-push hook nằm tại:

```text
.githooks/pre-push
```

Cài hook:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install-pre-push-hook.ps1
```

Kiểm tra hook đã được bật:

```powershell
git config --get core.hooksPath
```

Kết quả đúng:

```text
.githooks
```

Hook tự chạy khi bạn push:

```powershell
git push
```

Hook hiện xét cùng nhóm path với CI:

- `app-code/**`
- `karate-automation/karate/my_project/**`
- `.github/workflows/app-code-api-gate.yml`

Nếu commit sắp push không chạm vào các path trên, hook sẽ bỏ qua.

### Đổi kịch bản pre-push F1 hoặc F4

Trong `.githooks/pre-push` có đoạn cấu hình:

```sh
# PRE_PUSH_SUITE=f1
PRE_PUSH_SUITE=f4
```

Mặc định đang chạy F4 để demo pass:

```sh
PRE_PUSH_SUITE=f4
```

Muốn demo pre-push fail bằng F1, đổi thành:

```sh
PRE_PUSH_SUITE=f1
# PRE_PUSH_SUITE=f4
```

Ý nghĩa:

- `f1`: chạy `mvn clean test -Dtest=ApiTest`, cần backend local, có thể fail có chủ đích để demo chặn push.
- `f4`: chạy `mvn clean test -Dtest=MockRunner`, không cần backend thật, phù hợp demo pass.

## 10. Luồng demo đề xuất

Demo test pass:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f4
```

Demo test phát hiện lỗi:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 f1
```

Demo report tổng hợp:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
.\scripts\run-tests.ps1 all
```

Demo CI pass:

- Giữ workflow chạy F4 `MockRunner`.
- Push code lên GitHub.
- Mở tab Actions để xem workflow xanh.

Demo pre-push fail:

- Đổi `.githooks/pre-push` sang `PRE_PUSH_SUITE=f1`.
- Tạo commit có thay đổi trong path được gate.
- Chạy `git push`.
- Hook sẽ chạy F1 trước khi push và chặn push nếu F1 fail.
