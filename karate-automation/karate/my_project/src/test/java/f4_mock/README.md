# Restful-Booker Karate Mock Server

Thư mục này chứa mock server Restful-Booker viết bằng Karate. Mock server dùng để kiểm thử độc lập khi không muốn phụ thuộc backend thật.

Mock server bám theo các API chính:

- `GET /ping`
- `POST /auth`
- `GET /booking`
- `GET /booking/{id}`
- `POST /booking`
- `PUT /booking/{id}`
- `PATCH /booking/{id}`
- `DELETE /booking/{id}`

Mỗi API được tách thành một handler `.feature` riêng:

- `ping.feature`
- `auth.feature`
- `booking_list.feature`
- `booking_get.feature`
- `booking_create.feature`
- `booking_update.feature`
- `booking_patch.feature`
- `booking_delete.feature`
- `reset.feature`

`restful_booker_mock.feature` đóng vai trò dispatcher, route request đến đúng handler.

## Chạy mock server

Từ thư mục `karate-automation/karate/my_project`:

```powershell
mvn test-compile exec:java -Dexec.mainClass=f4_mock.RestfulBookerMockServer
```

Mặc định server chạy tại:

```text
http://localhost:9090
```

Có thể truyền port khác:

```powershell
mvn test-compile exec:java -Dexec.mainClass=f4_mock.RestfulBookerMockServer -Dexec.args="3001"
```

## Auth

`PUT`, `PATCH`, `DELETE` yêu cầu một trong hai cách xác thực:

- `Cookie: token=<token>` với token lấy từ `POST /auth`
- `Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=`

## Test nhanh

```powershell
mvn clean test -Dtest=MockRunner
```

Sau khi chạy, mở report mock server tại:

```text
target/reports/f4_mock/mockserver-summary.html
```

Mock có thêm endpoint tiện ích `POST /reset` để đưa dữ liệu test về trạng thái ban đầu.
