Feature: Wrong step order

  Scenario: Then appears before When
    Given url 'https://api.example.com'
    And path '/users'
    Then status 200
    When method GET
