Feature: Luồng Dòng dữ liệu (Data Flow Lifecycle)

  Background:
    * url baseUrl
    * def schema = read('classpath:booker/api/booking/booking-schema.json')

  Scenario: Vòng đời của một Booking (Tạo -> Lấy -> Sửa -> Xóa)
    # 1. Tạo mới Booking
    Given path 'booking'
    And request { firstname: 'Life', lastname: 'Cycle', totalprice: 150, depositpaid: false, bookingdates: { checkin: '2024-10-10', checkout: '2024-10-15' } }
    And header Accept = 'application/json'
    When method post
    Then status 200
    * def id = response.bookingid

    # 2. Lấy chi tiết Booking vừa tạo
    Given path 'booking', id
    And header Accept = 'application/json'
    When method get
    Then status 200
    And match response == schema
    And match response.firstname == 'Life'

    # 3. Cập nhật Booking (Sử dụng authToken từ Declarative Auth)
    Given path 'booking', id
    And header Cookie = 'token=' + authToken
    And header Accept = 'application/json'
    And request { firstname: 'LifeUpdated', lastname: 'Cycle', totalprice: 200, depositpaid: true, bookingdates: { checkin: '2024-10-10', checkout: '2024-10-15' }, additionalneeds: 'Lunch' }
    When method put
    Then status 200
    And match response.firstname == 'LifeUpdated'

    # 4. Xóa Booking
    Given path 'booking', id
    And header Cookie = 'token=' + authToken
    When method delete
    Then status 201

    # 5. Kiểm tra Booking đã xóa
    Given path 'booking', id
    When method get
    Then status 404
