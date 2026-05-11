# Restful-Booker Local Testing Project

Đây là dự án Restful-Booker dùng để thực hành kiểm thử API, UI, performance, mock server và CI gate bằng Karate.

## Cấu trúc dự án

- `app-code`: mã nguồn ứng dụng Restful-Booker, gồm backend Express chạy ở `http://localhost:3001` và frontend React/Vite trong `app-code/web` chạy ở `http://localhost:5173`.
- `karate-automation/karate/my_project`: bộ kiểm thử chính của dự án, gồm F1 API, F2 performance, F3 UI và F4 mock testing.
- `.github/workflows/app-code-api-gate.yml`: GitHub Actions workflow chạy F1 API regression khi có thay đổi liên quan đến `app-code` hoặc bộ test.
- `.githooks/pre-push`: hook local để chặn push nếu thay đổi `app-code` làm F1 API test fail.

## Chạy ứng dụng

Chạy backend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Backend mặc định chạy tại:

```text
http://localhost:3001
```

Chạy frontend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code\web
npm install
npm run dev
```

Frontend mặc định chạy tại:

```text
http://localhost:5173
```

## Chạy kiểm thử

Tất cả lệnh kiểm thử chạy từ:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\karate-automation\karate\my_project
```

Chạy từng nhóm test:

```powershell
.\scripts\run-tests.ps1 f1
.\scripts\run-tests.ps1 f2
.\scripts\run-tests.ps1 f3
.\scripts\run-tests.ps1 f4
```

Chạy toàn bộ F1-F4:

```powershell
.\scripts\run-tests.ps1 all
```

Khi chạy `all`, script sẽ chạy lần lượt F1, F2, F3, F4. Nếu một nhóm fail, các nhóm sau vẫn tiếp tục chạy để tạo đủ báo cáo tổng hợp.

## Vị trí báo cáo

Các báo cáo được sinh trong:

```text
karate-automation/karate/my_project/target/reports
```

Các thư mục chính:

- `f1_api`: báo cáo API testing.
- `f2_performance`: báo cáo Gatling performance testing.
- `f3_ui`: báo cáo UI testing.
- `f4_mock`: báo cáo mock testing.
- `summary.md` và `summary.html`: báo cáo tổng hợp F1-F4.

## CI API Gate

Workflow `.github/workflows/app-code-api-gate.yml` chạy trên `push` và `pull_request` khi thay đổi chạm vào:

- `app-code/**`
- `karate-automation/karate/my_project/**`
- `.github/workflows/app-code-api-gate.yml`

CI hiện chỉ chạy F1 API regression để giữ pipeline nhanh và ổn định:

```bash
mvn -B -ntp clean test -Dtest=ApiTest
```

Artifact của CI upload thư mục:

```text
karate-automation/karate/my_project/target/reports
```

## Pre-push hook local

Cài hook:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-pre-push-hook.ps1
```

Hook chỉ chạy khi commit sắp push có thay đổi trong `app-code/**`. Nếu F1 API test fail, Git sẽ chặn push trên máy local.
