Feature: API GetBooking

  Background:
    * url baseUrl
    * def schema = read('classpath:f1_api/booking-schema.json')

  Scenario: 0. Chuẩn bị dữ liệu (Lấy 1 ID hợp lệ)
    Given path 'booking'
    When method get
    Then status 200
    * def validId = response[0].bookingid

  Scenario Outline: <id>. <desc>
    Given path 'booking', bookingId
    And header Accept = 'application/json'
    When method get
    Then status <status>
    * if (responseStatus == 200) karate.match(response, schema)

    Examples:
      | id | bookingId   | status | desc                         |
      | 1  | validId     | 200    | ID hợp lệ (Gọi từ scenario 0)|
      | 2  | 999999      | 404    | ID không tồn tại             |
      | 3  | 'abc'       | 400    | ID là chữ cái                |
      | 4  | -1          | 400    | ID số âm                     |
