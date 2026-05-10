Feature: Admin write flow under load

Background:
  * def creds = { username: 'admin', password: 'password123' }

Scenario: Create -> update -> patch -> delete with assertions
  Given url baseUrl
  And path 'auth'
  And request creds
  When method post
  Then status 200
  And match response.token == '#string'

  * def token = response.token
  * karate.pause(150)

  Given url baseUrl
  And path 'booking'
  And header Accept = 'application/json'
  And header Content-Type = 'application/json'
  And request
  """
  {
    "firstname": "Perf",
    "lastname": "User",
    "totalprice": 123,
    "depositpaid": true,
    "bookingdates": { "checkin": "2026-06-01", "checkout": "2026-06-03" },
    "additionalneeds": "Breakfast"
  }
  """
  When method post
  Then status 200
  And match response.bookingid == '#number'

  * def bookingId = response.bookingid
  * karate.pause(150)

  Given url baseUrl
  And path 'booking', bookingId
  And header Accept = 'application/json'
  When method get
  Then status 200
  * set response.firstname = 'PerfUpdated'

  Given url baseUrl
  And path 'booking', bookingId
  And header Content-Type = 'application/json'
  And header Accept = 'application/json'
  And header Cookie = 'token=' + token
  And request response
  When method put
  Then status 200
  And match response.firstname == 'PerfUpdated'

  * karate.pause(150)

  Given url baseUrl
  And path 'booking', bookingId
  And header Content-Type = 'application/json'
  And header Accept = 'application/json'
  And header Cookie = 'token=' + token
  And request { firstname: 'PerfPatched' }
  When method patch
  Then status 200
  And match response.firstname == 'PerfPatched'

  * karate.pause(150)

  Given url baseUrl
  And path 'booking', bookingId
  And header Cookie = 'token=' + token
  When method delete
  Then status 201
