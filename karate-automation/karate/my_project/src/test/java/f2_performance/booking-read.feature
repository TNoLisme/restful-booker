Feature: Booking read under load

Scenario: Get booking detail using an id from list
  Given url baseUrl
  And path 'booking'
  And header Accept = 'application/json'
  When method get
  Then status 200
  And match response == '#[]'
  And match each response contains { bookingid: '#number' }

  * def bookingId = response[0].bookingid
  * karate.pause(150)

  Given url baseUrl
  And path 'booking', bookingId
  And header Accept = 'application/json'
  When method get
  Then status 200
  And match response contains { firstname: '#string', lastname: '#string', totalprice: '#number', depositpaid: '#boolean', bookingdates: { checkin: '#string', checkout: '#string' } }
