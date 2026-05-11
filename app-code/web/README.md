# Restful-Booker Web

Đây là giao diện React/Vite dùng cho UI testing bằng Karate.

## Chạy web

Chạy backend trước:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code
npm install
npm start
```

Sau đó chạy frontend:

```powershell
cd D:\school\KTDBCLPM\Project\restful-booker\app-code\web
npm install
npm run dev
```

URL mặc định:

```text
http://localhost:5173
```

API mặc định là `/api`, được Vite proxy về:

```text
http://localhost:3001
```

## Chức năng chính

- Đăng nhập admin bằng API `POST /auth`.
- Dashboard điều hướng tới từng nhóm API.
- Lọc danh sách booking theo first name, last name, checkin và checkout.
- Xem chi tiết booking.
- Tạo, cập nhật toàn bộ, cập nhật một phần và xóa booking.
- Kiểm tra trạng thái server bằng `GET /ping`.
