Feature: Scenario Outline without Examples

  Scenario Outline: Login as <role>
    Given url 'https://api.example.com'
    And path '/auth/login'
    And request { username: '<username>', password: '<password>' }
    When method POST
    Then status <expectedStatus>
