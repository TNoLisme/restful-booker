Feature: Configure and print usage

  Scenario: Set config and debug output
    * configure connectTimeout = 5000
    * configure readTimeout = 10000
    * configure ssl = true

    Given url 'https://api.example.com'
    And path '/ping'
    When method GET
    Then status 200
    * print 'Response is:', response
    * print 'Status:', responseStatus
