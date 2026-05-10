Feature: BookingIds

Background:
    * def urlBase = 'http://127.0.0.1:3001/booking'

Scenario: GBK-EP-01  get booking ids and validate response
    Given url urlBase
    When method get
    Then status 200

    * match response == '#[]'
    * match each response contains { bookingid: '#number' }
    * assert response.length > 0

Scenario: GBK-EP-02 - Filter theo firstname tồn tại
    Given url urlBase
    And param firstname = 'Susan'
    When method get
    Then status 200
    * match response == '#[]'
    * match each response contains { bookingid: '#number' }

Scenario: GBK-EP-03 - Filter theo lastname tồn tại
    Given url urlBase
    And param lastname = 'Brown'
    When method get
    Then status 200
    * match response == '#[]'
    * match each response contains { bookingid: '#number' }

Scenario: GBK-EP-04 - Filter kết hợp firstname + lastname
    Given url urlBase
    And param firstname = 'Jim'
    And param lastname = 'Jones'
    When method get
    Then status 200
    * match response == '#[]'
    * if (response.length == 0) karate.log('No matching booking found - PASS')


Scenario: GBK-EP-05 - Filter không khớp bất kỳ record nào
    Given url urlBase
    And param firstname = 'XYZNotExist'
    When method get
    Then status 200
    * match response == []

# BVA TEST CASES

Scenario: GBK-BVA-01 - firstname = chuỗi 1 ký tự
    Given url urlBase
    And param firstname = 'J'
    When method get
    Then status 200
    * match response == '#[]'

Scenario: GBK-BVA-02 - firstname = chuỗi rỗng
    Given url urlBase
    And param firstname = ''
    When method get
    Then status 200
    * match response == '#[]'

Scenario: GBK-BVA-03 - checkin ngày hợp lệ đúng format
    Given url urlBase
    And param checkin = '2025-12-31'
    When method get
    Then status 200
    * match response == '#[]'

Scenario: GBK-BVA-04 - checkin sai định dạng
    Given url urlBase
    And param checkin = '31-12-2025'
    When method get
    * assert responseStatus == 200 || responseStatus == 400

Scenario: GBK-BVA-05 - checkout nhỏ hơn checkin
    Given url urlBase
    And param checkin = '2025-12-31'
    And param checkout = '2025-01-01'
    When method get
    * assert responseStatus == 200 || responseStatus == 400