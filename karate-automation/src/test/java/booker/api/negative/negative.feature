Feature: Kiểm thử các trường hợp ngoại lệ (Negative Test)

  Background:
    * url baseUrl

  # Kích hoạt nhánh dòng 188: else { res.sendStatus(404) }
  Scenario: Lấy booking với ID không tồn tại
    Given path 'booking', 999999
    When method get
    Then status 404

  # Kích hoạt nhánh dòng 460: else { res.sendStatus(403) } - Lỗi thiếu Auth
  Scenario: Cập nhật booking không có Token
    Given path 'booking', 1
    And request { firstname: 'Test', lastname: 'Test', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2024-01-01', checkout: '2024-01-02' } }
    When method put
    Then status 403
