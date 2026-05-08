Feature: Lấy Booking (Kiểm thử dòng điều khiển C1, C2)

  Background:
    * url baseUrl

  # Kịch bản kích hoạt dòng 93: if(typeof(req.query.firstname) != 'undefined')
  Scenario: Tìm kiếm booking theo firstname
    Given path 'booking'
    And param firstname = 'Sally'
    When method get
    Then status 200
    And match response == '#[]'

  # Kịch bản kích hoạt dòng 101 và 105: checkin và checkout filter
  Scenario: Tìm kiếm booking theo ngày checkin và checkout
    Given path 'booking'
    And param checkin = '2014-03-13'
    And param checkout = '2014-05-21'
    When method get
    Then status 200
    And match response == '#[]'
