# Specs: Restful-Booker Web Interface

## 1. Yêu cầu chung
Xây dựng một giao diện web hiện đại, dễ sử dụng để quản lý hệ thống đặt phòng khách sạn dựa trên các API của Restful-Booker.

## 2. Danh sách chức năng & API tương ứng
Web phải sử dụng đầy đủ các API được liệt kê trong `API.md`:

| Chức năng | API Endpoint | Method | Ghi chú |
| :--- | :--- | :--- | :--- |
| Đăng nhập Admin | `/auth` | POST | Lấy token để thực hiện các thao tác sửa/xóa. |
| Danh sách đặt phòng | `/booking` | GET | Hiển thị danh sách ID, hỗ trợ lọc theo tên, ngày. |
| Chi tiết đặt phòng | `/booking/:id` | GET | Xem thông tin chi tiết của một khách hàng. |
| Tạo mới đặt phòng | `/booking` | POST | Form nhập liệu đầy đủ các trường. |
| Cập nhật thông tin | `/booking/:id` | PUT | Cập nhật toàn bộ thông tin (Yêu cầu Token). |
| Cập nhật một phần | `/booking/:id` | PATCH | Sửa nhanh một vài trường (Yêu cầu Token). |
| Xóa đặt phòng | `/booking/:id` | DELETE | Xóa bản ghi (Yêu cầu Token). |
| Kiểm tra hệ thống | `/ping` | GET | Hiển thị trạng thái server (Online/Offline). |

## 3. Thiết kế Giao diện (UI/UX)
- **Phong cách**: Premium, sử dụng Glassmorphism hoặc Dark Mode hiện đại.
- **Màu sắc**: Chủ đạo là Xanh Indigo (#4F46E5) và Trắng/Xám cao cấp.
- **Thành phần**:
    - **Sidebar**: Điều hướng giữa Dashboard, Tạo mới, và Đăng nhập.
    - **Dashboard**: Dạng bảng hoặc Card, có thanh tìm kiếm và bộ lọc ngày tháng.
    - **Modal/Drawer**: Hiển thị chi tiết và form chỉnh sửa để tối ưu không gian.
    - **Notifications**: Thông báo Toast khi thao tác thành công hoặc thất bại.

## 4. Dữ liệu Mock (Mock Data)
Do yêu cầu hiển thị nhiều dữ liệu mẫu, hệ thống sẽ sử dụng bộ dữ liệu mock sau (mở rộng từ `API.md`):
- **Sản phẩm (Phòng/Dịch vụ)**: Mock ít nhất 20 bản ghi với các biến thể về tên khách, giá tiền, và yêu cầu thêm (Breakfast, Airport Shuttle, Extra Bed, High Floor, etc.).
- **Trạng thái**: Mô phỏng cả trạng thái đã thanh toán cọc (`depositpaid: true/false`).

## 5. Hướng dẫn sử dụng
1. **Trang Dashboard**: Xem toàn bộ danh sách đặt phòng. Sử dụng thanh tìm kiếm phía trên để lọc theo tên khách.
2. **Xem chi tiết**: Nhấn vào một dòng trong danh sách để xem thông tin chi tiết và các yêu cầu bổ sung.
3. **Tạo mới**: Truy cập mục "New Booking", điền thông tin và nhấn "Save".
4. **Quản trị (Sửa/Xóa)**:
    - Nhấn "Login" và nhập `admin` / `password123`.
    - Sau khi đăng nhập thành công, các nút "Edit" và "Delete" sẽ xuất hiện trong phần chi tiết.
5. **Kiểm tra kết nối**: Nhìn vào biểu tượng ở góc dưới màn hình để biết server có đang hoạt động không.

## 6. Công nghệ sử dụng
- **Framework**: React (Vite).
- **Styling**: Vanilla CSS (Variables, Flexbox, Grid).
- **Animation**: Framer Motion.
- **Icons**: Lucide React.
