# Kế hoạch Triển khai Mock Server cho Restful-Booker

Dưới đây là kế hoạch chi tiết từng bước để xây dựng một Mock Server sử dụng Karate framework để giả lập các API của hệ thống Restful-Booker.

## 1. Chuẩn bị và Phân tích (Preparation)
- [ ] **Liệt kê các API cần giả lập**: Xác định các endpoint quan trọng như `/auth`, `/booking`, `/booking/{id}`.
- [ ] **Xác định cấu trúc dữ liệu**: Lưu lại mẫu Request và Response (JSON) cho từng trường hợp thành công (200 OK) và thất bại (400, 401, 404).

## 2. Xây dựng Mock Feature File
- [ ] **Tạo file `auth_mock.feature`**: (Đã có cơ bản) Cần bổ sung các trường hợp:
    - [ ] Login thành công (trả về token).
    - [ ] Login thất bại (sai username/password).
- [ ] **Tạo file `booking_mock.feature`**: Giả lập các thao tác:
    - [ ] `GET /booking`: Trả về danh sách ID.
    - [ ] `GET /booking/{id}`: Trả về thông tin chi tiết booking.
    - [ ] `POST /booking`: Tạo mới booking.
    - [ ] `PUT/PATCH /booking/{id}`: Cập nhật booking (yêu cầu check token).
    - [ ] `DELETE /booking/{id}`: Xóa booking.

## 3. Cấu hình Logic xử lý trong Mock
- [ ] **Sử dụng các hàm có sẵn của Karate**:
    - `pathMatches('/path')`: Kiểm tra đường dẫn.
    - `methodIs('post')`: Kiểm tra phương thức HTTP.
    - `request`: Truy cập dữ liệu gửi lên từ client.
- [ ] **Giả lập trạng thái (Stateful Mocking)**: (Nâng cao) Nếu cần, khởi tạo một mảng `bookings` trong phần `Background` để có thể thêm/sửa/xóa dữ liệu ảo.

## 4. Tạo Runner để khởi động Mock Server
- [ ] **Chỉnh sửa/Tạo mới `MockRunner.java`**:
    - [ ] Sử dụng `com.intuit.karate.core.MockServer`.
    - [ ] Cấu hình port cố định (ví dụ: `8080`) hoặc port ngẫu nhiên.
    - [ ] Thêm phương thức để Start và Stop server thủ công hoặc tự động khi chạy test.

## 5. Tích hợp vào Quy trình Testing
- [ ] **Cập nhật `karate-config.js`**:
    - [ ] Thêm biến để chuyển đổi giữa `real server` và `mock server`.
    - [ ] Tự động lấy URL của Mock Server nếu đang ở chế độ mock.
- [ ] **Viết Test Script kiểm thử Mock**: Tạo các file `.feature` trong thư mục test để gọi vào Mock Server và kiểm tra xem Mock có hoạt động đúng như mong đợi không.

## 6. Kiểm tra và Tối ưu hóa
- [ ] **Chạy thử toàn bộ**: Đảm bảo Mock Server phản hồi đúng cho tất cả các kịch bản.
- [ ] **Xử lý các trường hợp biên**: Giả lập các lỗi network, timeout hoặc dữ liệu không hợp lệ để kiểm tra độ bền của client.
- [ ] **Tài liệu hóa**: Ghi chú lại cách khởi động và các hạn chế của Mock Server.
