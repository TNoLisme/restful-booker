Feature: API CreateBooking

  Background:
    * url baseUrl
    * def schema = read('classpath:f1_api/booking-schema.json')

  @setup
  Scenario:
    * def fuzzer = call read('classpath:f1_api/fuzzing-helper.js')
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
