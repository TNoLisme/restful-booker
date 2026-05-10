Feature: Booking list under load

Scenario: List booking ids (optionally filtered)
  Given url baseUrl
  And path 'booking'
  And header Accept = 'application/json'
  When method get
  Then status 200
  And match response == '#[]'
  And match each response contains { bookingid: '#number' }

  * karate.pause(200)

  Given url baseUrl
  And path 'booking'
  And header Accept = 'application/json'
  And param firstname = 'Susan'
  When method get
  Then status 200
  And match response == '#[]'
  And match each response contains { bookingid: '#number' }
