Feature: Invalid HTTP method

  Scenario: Use unsupported HTTP verb
    Given url 'https://api.example.com'
    And path '/users'
    When method FETCH
    Then status 200
