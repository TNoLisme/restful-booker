Feature: Kiểm thử Giao diện (UI Smoke Test)

  Background:
    # Cấu hình sử dụng Chrome
    * configure driver = { type: 'chrome' }

  Scenario: Truy cập trang chủ Restful-Booker
    # Mở trình duyệt và truy cập trang chủ API (chỉ để verify Chrome mở được)
    Given driver baseUrl
    * delay(1000)
    * print 'UI Smoke Test executed successfully'
