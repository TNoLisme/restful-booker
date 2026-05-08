Feature: Tạo mới Booking (Giá trị biên & Faker)

  Background:
    * url baseUrl
    * def DataFaker = Java.type('net.datafaker.Faker')
    * def faker = new DataFaker()
    * def randomFirstName = faker.name().firstName()
    * def randomLastName = faker.name().lastName()
    * def randomPrice = faker.number().numberBetween(10, 1000)
    * def schema = read('classpath:booker/api/booking/booking-schema.json')

  Scenario: Tạo booking thành công với dữ liệu động (Fuzzing)
    Given path 'booking'
    And header Accept = 'application/json'
    And request
    """
    {
      "firstname": "#(randomFirstName)",
      "lastname": "#(randomLastName)",
      "totalprice": "#(randomPrice)",
      "depositpaid": true,
      "bookingdates": {
        "checkin": "2024-01-01",
        "checkout": "2024-01-15"
      },
      "additionalneeds": "Breakfast"
    }
    """
    When method post
    Then status 200
    And match response.bookingid == '#number'
    # Schema Validation
    And match response.booking == schema
    # Kiểm tra khoảng giá trị (Range Validation)
    And match response.booking.totalprice == '#? _ >= 0 && _ <= 10000'
