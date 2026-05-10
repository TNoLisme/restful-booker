Feature: API UpdateBooking

  Background:
    * url baseUrl
    * def schema = read('classpath:f1_api/booking-schema.json')
    * def createPayload = { firstname: 'Base', lastname: 'User', totalprice: 100, depositpaid: true, bookingdates: { checkin: '2024-01-01', checkout: '2024-01-10' } }

  Scenario Outline: <id>. <desc>
    # 1. Prepare: Auto Create a booking to get a fresh ID
    * def res = karate.call('classpath:f1_api/create-helper.feature', { payload: createPayload })
    * def bookingId = res.id

    # 2. Execute PUT
    Given path 'booking', bookingId
    And header Accept = '<acceptHeader>'
    And header Content-Type = 'application/json'
    And header Cookie = useValidToken ? 'token=' + authToken : 'token=invalid'
    And request <payload>
    When method put
    Then status <status>

    Examples:
      | id | useValidToken | acceptHeader     | payload                                                                                                                                     | status | desc                                      |
      | 1  | true          | application/json | { firstname: 'Upd', lastname: 'User', totalprice: 200, depositpaid: false, bookingdates: { checkin: '2024-02-01', checkout: '2024-02-10' } } | 200    | Hợp lệ hoàn toàn                          |
      | 2  | false         | application/json | { firstname: 'Upd', lastname: 'User', totalprice: 200, depositpaid: false, bookingdates: { checkin: '2024-02-01', checkout: '2024-02-10' } } | 403    | Token sai (Kỳ vọng 403)                   |
      | 3  | true          | application/xml  | { firstname: 'Upd', lastname: 'User', totalprice: 200, depositpaid: false, bookingdates: { checkin: '2024-02-01', checkout: '2024-02-10' } } | 400    | Test Accept: XML (Có thể crash Server 500)|
      | 4  | true          | application/json | {}                                                                                                                                          | 400    | Payload rỗng (Kỳ vọng 400, có thể 500)    |
      | 5  | true          | application/json | { firstname: 'Upd', lastname: 'User', totalprice: -100, depositpaid: false, bookingdates: { checkin: '2024-02-01', checkout: '2024-02-10'} } | 400    | Giá trị âm (Kỳ vọng 400, có thể 200)      |
