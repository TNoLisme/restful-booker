@ignore
Feature: Create Helper
  Scenario:
    Given url baseUrl
    And path 'booking'
    And header Accept = 'application/json'
    And request payload
    When method post
    Then status 200
    * def id = response.bookingid
