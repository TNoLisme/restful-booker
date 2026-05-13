Feature: Non-numeric status check

  Scenario: Status code is a string
    Given url 'https://api.example.com'
    And path '/users'
    When method GET
    Then status OK
