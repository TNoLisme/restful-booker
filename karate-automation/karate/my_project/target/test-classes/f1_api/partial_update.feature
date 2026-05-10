Feature: API PartialUpdateBooking

  Background:
    * url baseUrl
    * def schema = read('classpath:f1_api/booking-schema.json')
    * def createPayload = { firstname: 'Base', lastname: 'User', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2024-01-01', checkout: '2024-01-10' } }

  Scenario Outline: <id>. <desc>
    # 1. Prepare: Auto Create a booking
    * def res = karate.call('classpath:f1_api/create-helper.feature', { payload: createPayload })
    * def bookingId = res.id

    # 2. Execute PATCH
    Given path 'booking', bookingId
    And header Accept = 'application/json'
    And header Content-Type = 'application/json'
    And header Cookie = useValidToken ? 'token=' + authToken : 'token=invalid'
    And request <payload>
    When method patch
    Then status <status>

    Examples:
      | id | useValidToken | payload                               | status | desc                                  |
      | 1  | true          | { firstname: 'Patched' }              | 200    | Hợp lệ (1 field)                      |
      | 2  | false         | { firstname: 'Patched' }              | 403    | Sai Token                             |
      | 3  | true          | { totalprice: 'abc' }                 | 400    | Sai kiểu dữ liệu trường sửa (Kỳ vọng 400) |
      | 4  | true          | { firstname: null }                   | 400    | Sửa field bắt buộc thành null (Kỳ vọng 400)|
