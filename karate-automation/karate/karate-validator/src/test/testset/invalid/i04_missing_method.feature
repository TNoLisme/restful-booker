Feature: Missing HTTP method

  Scenario: Forget to call method
    Given url 'https://api.example.com'
    And path '/users'
    And request { name: 'test' }
    Then status 201
