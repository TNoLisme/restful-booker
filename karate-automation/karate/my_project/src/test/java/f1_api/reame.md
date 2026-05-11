## Kiểm thử API
### auth
- đăc điểm dữ liệu đầu vào:
+ Dữ liệu string không có ràng buộc số lượng nhất định
+ Trường username và password độc lập
-> Sử dụng kiểm thử phân hoạch tương đương kết hợp với kiểm thử bảo mật (Áp dụng cho trang login)

Cụ thể:
1. Kiểm thử phân hoạch
Username: T-F
password: T-F
-> 4 testcase (T-T); (T-F); (F-T); (F-F)
2. Kiểm thử bảo mật (tham khảo top 10 owasp 2022)
+ Sql injection
+ no sql injection
+ ...
### GetBookingIds
