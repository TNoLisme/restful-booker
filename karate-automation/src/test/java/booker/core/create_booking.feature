Feature: API CreateBooking

  Background:
    * url baseUrl
    * def schema = read('classpath:booker/core/booking-schema.json')

  @setup
  Scenario:
    * def fuzzer = call read('classpath:booker/core/fuzzing-helper.js')
    * def createData = fuzzer.getCreateFuzzData()

  Scenario Outline: <id>. <desc>
    Given path 'booking'
    And header Accept = 'application/json'
    And request { firstname: '#(fn)', lastname: '#(ln)', totalprice: '#(p)', depositpaid: '#(d)', bookingdates: { checkin: '#(ci)', checkout: '#(co)' }, additionalneeds: '#(ex)' }
    When method post
    Then status <status>
    
    * if (responseStatus == 200) karate.match(response.booking, schema)

    Examples:
      | karate.setup().createData |
