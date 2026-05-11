# App-Code Restful-Booker

`app-code` là phần ứng dụng được dùng làm đối tượng kiểm thử. Thư mục này gồm backend Restful-Booker và frontend React/Vite.

## Backend

Backend là ứng dụng Node.js/Express, cung cấp API Restful-Booker và landing page gốc.

Chạy backend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

URL mặc định:

```text
http://localhost:3001
```

Kiểm tra nhanh:

```powershell
curl http://localhost:3001/ping
```

## Frontend

Frontend nằm trong:

```text
app-code/web
```

Chạy frontend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code\web
npm install
npm run dev
```

URL mặc định:

```text
http://localhost:5173
```

Frontend gọi API qua proxy `/api` của Vite về backend `http://localhost:3001`.

## Khi chạy kiểm thử

- F1 API, F2 performance và F3 UI cần backend chạy ở port `3001`.
- F3 UI cần thêm frontend chạy ở port `5173`.
- F4 mock không cần backend thật vì tự khởi động mock server bằng Karate.
