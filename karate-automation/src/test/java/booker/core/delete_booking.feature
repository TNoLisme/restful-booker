Feature: API DeleteBooking

  Background:
    * url baseUrl
    * def createPayload = { firstname: 'Base', lastname: 'User', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2024-01-01', checkout: '2024-01-10' } }

  Scenario Outline: <id>. <desc>
    # 1. Prepare: Auto Create a booking for a fresh ID
    * def res = karate.call('classpath:booker/custom/create-helper.feature', { payload: createPayload })
    * def validId = res.id
    * def targetId = <targetIdExpr>

    # 2. Execute DELETE
    Given path 'booking', targetId
    And header Cookie = useValidToken ? 'token=' + authToken : 'token=invalid'
    When method delete
    Then status <status>

    Examples:
      | id | targetIdExpr | useValidToken | status | desc                          |
      | 1  | validId      | true          | 201    | Xóa thành công ID hợp lệ      |
      | 2  | validId      | false         | 403    | Sai Token (403 Forbidden)     |
      | 3  | 9999999      | true          | 405    | ID không tồn tại (Kỳ vọng 405)|
      | 4  | 'abc'        | true          | 400    | ID là chữ cái (Kỳ vọng 400)   |
