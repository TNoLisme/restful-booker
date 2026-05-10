Feature: API GetBookingIds

  Background:
    * url baseUrl

  Scenario Outline: <id>. <desc>
    Given path 'booking'
    And params queryParams
    When method get
    Then status <status>
    * if (responseStatus == 200) karate.match(response, '#[]')

    Examples:
      | id | queryParams                                    | status | desc                          |
      | 1  | {}                                             | 200    | Không có tham số              |
      | 2  | { firstname: 'Sally' }                         | 200    | Lọc theo firstname            |
      | 3  | { checkin: '2018-01-01' }                      | 200    | Lọc theo checkin hợp lệ       |
      | 4  | { checkin: 'chuoi-linh-tinh' }                 | 400    | Lọc checkin sai format (Bẫy 400) |
      | 5  | { firstname: "' OR 1=1 --" }                   | 200    | SQL Injection payload         |
