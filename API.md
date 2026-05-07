# Chi tiết dự án Restful-Booker API

Tài liệu này mô tả chi tiết các API hiện có của hệ thống Restful-Booker, bao gồm thông tin về phương thức (Method), Endpoint, dữ liệu đầu vào (Request/Input) và dữ liệu đầu ra (Response/Output).

Base URL: 
- Cloud: `https://restful-booker.herokuapp.com`
- Local: `http://localhost:3001` (nếu có khởi chạy mã nguồn)

---

## 1. Authentication (Xác thực)

### 1.1. Create Token
Tạo một authentication token mới (token này cần thiết cho các API yêu cầu quyền truy cập (PUT, PATCH, DELETE)).

- **Method:** `POST`
- **Endpoint:** `/auth`
- **Request Headers:**
  - `Content-Type: application/json`
- **Dữ liệu vào (Input Body):**
  ```json
  {
      "username" : "admin",
      "password" : "password123"
  }
  ```
- **Dữ liệu ra (Output Body):**
  ```json
  {
      "token": "1a2b3c4d5e6f7g8"
  }
  ```
  *(Status Code trả về: 200 OK)*

---

## 2. Booking (Đặt phòng)

### 2.1. GetBookingIds
Lấy danh sách tất cả các ID của các lượt đặt phòng đã có trong hệ thống. Hỗ trợ lọc danh sách dựa trên tên, ngày checkin, checkout.

- **Method:** `GET`
- **Endpoint:** `/booking`
- **Query Parameters (Tùy chọn):**
  - `firstname`: Lọc theo tên.
  - `lastname`: Lọc theo họ.
  - `checkin`: Lọc theo ngày checkin (YYYY-MM-DD).
  - `checkout`: Lọc theo ngày checkout (YYYY-MM-DD).
- **Dữ liệu vào (Input):** Không có Body.
- **Dữ liệu ra (Output Body):** Danh sách các ID.
  ```json
  [
      { "bookingid": 1 },
      { "bookingid": 2 },
      { "bookingid": 3 }
  ]
  ```

### 2.2. GetBooking
Truy xuất chi tiết của một lượt đặt phòng dựa vào ID.

- **Method:** `GET`
- **Endpoint:** `/booking/:id` (Ví dụ: `/booking/1`)
- **Dữ liệu vào:** Không có Body.
- **Dữ liệu ra (Output Body):**
  ```json
  {
      "firstname": "Sally",
      "lastname": "Brown",
      "totalprice": 111,
      "depositpaid": true,
      "bookingdates": {
          "checkin": "2013-02-23",
          "checkout": "2014-10-23"
      },
      "additionalneeds": "Breakfast"
  }
  ```

### 2.3. CreateBooking
Tạo một lượt đặt phòng mới trong hệ thống.

- **Method:** `POST`
- **Endpoint:** `/booking`
- **Request Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Dữ liệu vào (Input Body):**
  ```json
  {
      "firstname" : "Jim",
      "lastname" : "Brown",
      "totalprice" : 111,
      "depositpaid" : true,
      "bookingdates" : {
          "checkin" : "2018-01-01",
          "checkout" : "2019-01-01"
      },
      "additionalneeds" : "Breakfast"
  }
  ```
- **Dữ liệu ra (Output Body):**
  ```json
  {
      "bookingid": 1,
      "booking": {
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
  }
  ```

### 2.4. UpdateBooking
Cập nhật toàn bộ thông tin của một lượt đặt phòng hiện có. **Yêu cầu xác thực**.

- **Method:** `PUT`
- **Endpoint:** `/booking/:id`
- **Request Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Cookie: token=<giá_trị_token>` (Hoặc dùng `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`)
- **Dữ liệu vào (Input Body):** Giống cấu trúc khi tạo mới.
  ```json
  {
      "firstname" : "James",
      "lastname" : "Brown",
      "totalprice" : 111,
      "depositpaid" : true,
      "bookingdates" : {
          "checkin" : "2018-01-01",
          "checkout" : "2019-01-01"
      },
      "additionalneeds" : "Breakfast"
  }
  ```
- **Dữ liệu ra (Output Body):** Thông tin đặt phòng sau khi đã cập nhật.
  ```json
  {
      "firstname" : "James",
      "lastname" : "Brown",
      "totalprice" : 111,
      "depositpaid" : true,
      "bookingdates" : {
          "checkin" : "2018-01-01",
          "checkout" : "2019-01-01"
      },
      "additionalneeds" : "Breakfast"
  }
  ```

### 2.5. PartialUpdateBooking
Cập nhật một phần thông tin của lượt đặt phòng hiện có (Ví dụ chỉ cập nhật Tên và Giá). **Yêu cầu xác thực**.

- **Method:** `PATCH`
- **Endpoint:** `/booking/:id`
- **Request Headers:**
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `Cookie: token=<giá_trị_token>` (Hoặc dùng `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`)
- **Dữ liệu vào (Input Body):** Các trường cần cập nhật.
  ```json
  {
      "firstname" : "James",
      "lastname" : "Brown"
  }
  ```
- **Dữ liệu ra (Output Body):** Trả về toàn bộ thông tin đối tượng đã được cập nhật.
  ```json
  {
      "firstname" : "James",
      "lastname" : "Brown",
      "totalprice" : 111,
      "depositpaid" : true,
      "bookingdates" : {
          "checkin" : "2018-01-01",
          "checkout" : "2019-01-01"
      },
      "additionalneeds" : "Breakfast"
  }
  ```

### 2.6. DeleteBooking
Xóa một lượt đặt phòng trong hệ thống. **Yêu cầu xác thực**.

- **Method:** `DELETE`
- **Endpoint:** `/booking/:id`
- **Request Headers:**
  - `Cookie: token=<giá_trị_token>` (Hoặc dùng `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`)
- **Dữ liệu vào:** Không có Body.
- **Dữ liệu ra:** Trả về Status Code `201 Created` biểu thị xóa thành công (Không có JSON body).

---

## 3. Ping (Health Check)

### 3.1. Ping
Kiểm tra trạng thái hoạt động của hệ thống (API đang up hay down).

- **Method:** `GET`
- **Endpoint:** `/ping`
- **Dữ liệu vào:** Không
- **Dữ liệu ra:** Trả về Status Code `201 Created` nếu server đang hoạt động bình thường (Không có JSON body).
