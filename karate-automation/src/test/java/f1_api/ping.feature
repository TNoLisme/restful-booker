Feature: API Ping

  Background:
    * url baseUrl

  Scenario: Health check trả về 201 Created
    Given path 'ping'
    When method get
    Then status 201
    And match response == 'Created'
