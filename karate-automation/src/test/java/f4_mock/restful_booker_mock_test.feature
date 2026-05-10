Feature: Restful Booker mock server smoke test

  Scenario: run CRUD flow against the Karate mock server
    * url karate.properties['mockBaseUrl']

    Given path 'ping'
    When method get
    Then status 201

    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    And match response == { token: '#string' }
    * def token = response.token

    Given path 'booking'
    When method get
    Then status 200
    And match response == '#[]'

    * def payload = { firstname: 'Mock', lastname: 'User', totalprice: 150, depositpaid: true, bookingdates: { checkin: '2026-05-09', checkout: '2026-05-10' }, additionalneeds: 'Breakfast' }
    Given path 'booking'
    And header Accept = 'application/json'
    And request payload
    When method post
    Then status 200
    And match response.booking == payload
    * def bookingId = response.bookingid

    Given path 'booking', bookingId
    When method get
    Then status 200
    And match response == payload

    * def updated = { firstname: 'Updated', lastname: 'User', totalprice: 175, depositpaid: false, bookingdates: { checkin: '2026-06-01', checkout: '2026-06-02' }, additionalneeds: 'Wifi' }
    Given path 'booking', bookingId
    And header Accept = 'application/json'
    And header Cookie = 'token=invalid'
    And request updated
    When method put
    Then status 403

    Given path 'booking', bookingId
    And header Accept = 'application/json'
    And header Cookie = 'token=' + token
    And request updated
    When method put
    Then status 200
    And match response == updated

    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And request { firstname: 'Patched' }
    When method patch
    Then status 200
    And match response.firstname == 'Patched'
    And match response.lastname == 'User'

    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    When method delete
    Then status 201

    Given path 'booking', bookingId
    When method get
    Then status 404

    Given path 'booking'
    And param checkin = 'not-a-date'
    When method get
    Then status 400
