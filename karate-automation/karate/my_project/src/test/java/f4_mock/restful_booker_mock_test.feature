Feature: Restful-Booker mock server smoke tests

  Background:
    * url karate.properties['mockBaseUrl']

  Scenario: GET /ping returns 201
    Given path 'ping'
    When method get
    Then status 201

  Scenario: POST /reset restores initial mock data
    Given path 'reset'
    When method post
    Then status 200
    And match response == { message: 'Data reset successful' }

    Given path 'booking'
    When method get
    Then status 200
    And match response == '#[5]'

  Scenario: POST /auth returns token for valid credentials
    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    And match response == { token: '#string' }

  Scenario: POST /auth returns bad credentials for invalid login
    Given path 'auth'
    And request { username: 'admin', password: 'wrong' }
    When method post
    Then status 200
    And match response == { reason: 'Bad credentials' }

  Scenario: GET /booking lists and filters booking IDs
    Given path 'reset'
    When method post
    Then status 200

    Given path 'booking'
    When method get
    Then status 200
    And match response == '#[5]'
    And match each response == { bookingid: '#number' }

    Given path 'booking'
    And param firstname = 'Sally'
    And param lastname = 'Brown'
    When method get
    Then status 200
    And match response == [ { bookingid: 1 } ]

  Scenario: GET /booking/{id} returns booking detail and 404
    Given path 'reset'
    When method post
    Then status 200

    Given path 'booking', 1
    When method get
    Then status 200
    And match response ==
      """
      {
        firstname: 'Sally',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: { checkin: '2013-02-23', checkout: '2014-10-23' },
        additionalneeds: 'Breakfast'
      }
      """

    Given path 'booking', 999999
    When method get
    Then status 404

  Scenario: POST /booking creates a booking
    * def payload =
      """
      {
        firstname: 'Jim',
        lastname: 'Brown',
        totalprice: 111,
        depositpaid: true,
        bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
        additionalneeds: 'Breakfast'
      }
      """
    Given path 'booking'
    And request payload
    When method post
    Then status 200
    And match response == { bookingid: '#number', booking: '#(payload)' }

    Given path 'booking', response.bookingid
    When method get
    Then status 200
    And match response == payload

  Scenario: PUT /booking/{id} requires auth and replaces booking
    * def payload =
      """
      {
        firstname: 'Put',
        lastname: 'Before',
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
        additionalneeds: 'Breakfast'
      }
      """
    * def updated =
      """
      {
        firstname: 'Put',
        lastname: 'After',
        totalprice: 222,
        depositpaid: false,
        bookingdates: { checkin: '2018-02-01', checkout: '2019-02-01' },
        additionalneeds: 'Dinner'
      }
      """
    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    * def token = response.token

    Given path 'booking'
    And request payload
    When method post
    Then status 200
    * def bookingId = response.bookingid

    Given path 'booking', bookingId
    And request updated
    When method put
    Then status 403

    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    And request updated
    When method put
    Then status 200
    And match response == updated

  Scenario: PATCH /booking/{id} supports Basic Auth
    * def payload =
      """
      {
        firstname: 'Patch',
        lastname: 'Before',
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
        additionalneeds: 'Breakfast'
      }
      """
    Given path 'booking'
    And request payload
    When method post
    Then status 200
    * def bookingId = response.bookingid

    Given path 'booking', bookingId
    And header Authorization = 'Basic YWRtaW46cGFzc3dvcmQxMjM='
    And request { firstname: 'Patched', bookingdates: { checkout: '2019-03-01' } }
    When method patch
    Then status 200
    And match response.firstname == 'Patched'
    And match response.lastname == 'Before'
    And match response.bookingdates == { checkin: '2018-01-01', checkout: '2019-03-01' }

  Scenario: DELETE /booking/{id} requires auth and removes booking
    * def payload =
      """
      {
        firstname: 'Delete',
        lastname: 'Me',
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: '2018-01-01', checkout: '2019-01-01' },
        additionalneeds: 'Breakfast'
      }
      """
    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    * def token = response.token

    Given path 'booking'
    And request payload
    When method post
    Then status 200
    * def bookingId = response.bookingid

    Given path 'booking', bookingId
    When method delete
    Then status 403

    Given path 'booking', bookingId
    And header Cookie = 'token=' + token
    When method delete
    Then status 201

    Given path 'booking', bookingId
    When method get
    Then status 404

    Given path 'booking', 999999
    And header Cookie = 'token=' + token
    When method delete
    Then status 405
