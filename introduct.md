# Tổng quan dự án Restful-Booker Automation

## 1. Giới thiệu (Introduction)
Dự án này là một framework kiểm thử tự động (Automation Testing Framework) sử dụng công cụ **Karate** để thực hiện kiểm thử API cho hệ thống **Restful-Booker**. 
**Restful-Booker** là một API mô phỏng hệ thống đặt phòng khách sạn, được cộng đồng sử dụng phổ biến nhằm mục đích học tập và thực hành Automation Test, API Testing, Security Testing...

## 2. Cấu trúc thư mục dự án
Dự án hiện tại được chia thành 2 thư mục chính:

- **`karate-automation/`**: 
  Thư mục chứa toàn bộ kịch bản kiểm thử tự động. Project này được xây dựng dựa trên Maven (`pom.xml`) và sử dụng Java kết hợp với Karate Framework.
  - Thư mục `src/test/java/`: Nơi định nghĩa các kịch bản kiểm thử dưới dạng file `.feature` (ngôn ngữ Gherkin/BDD).
  - File `karate-config.js`: File cấu hình môi trường cho Karate. Mặc định framework hỗ trợ cấu hình chạy trên hai môi trường:
    - `dev`: Gọi API trực tiếp đến hệ thống được host trên cloud (`https://restful-booker.herokuapp.com`).
    - `local`: Gọi API đến hệ thống được host dưới local (`http://localhost:3001`).
  - Thư mục `auth/`: Chứa các kịch bản kiểm thử API xác thực (ví dụ: `create-token.feature` để sinh token sử dụng cho các API yêu cầu quyền admin).

- **`app-code/`**: 
  Thư mục dự kiến chứa mã nguồn của hệ thống Restful-Booker (để phục vụ việc khởi chạy ứng dụng localhost). 

## 3. Các chức năng chính của Repository
1. **Quản lý kịch bản kiểm thử API**: Viết kịch bản kiểm thử dưới dạng Behavior-Driven Development (BDD), dễ đọc và dễ bảo trì.
2. **Khởi tạo và tái sử dụng Data/Token**: Có chức năng gọi API Auth để lấy Token, sau đó tái sử dụng token này làm biến toàn cục (`authToken`) để xác thực cho các API bảo mật (tạo, sửa, xóa đặt phòng).
3. **Cấu hình đa môi trường (Multi-environment)**: Dễ dàng switch giữa môi trường cloud (heroku) và local (localhost) chỉ bằng việc truyền biến môi trường thông qua dòng lệnh.
4. **Kiểm tra tính đúng đắn của Restful API**: Tự động so sánh (assert) HTTP Status Code, cấu trúc dữ liệu trả về (JSON schema) và giá trị của từng field (ví dụ: `response.token == '#string'`).
