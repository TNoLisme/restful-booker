Feature: Column mismatch in Examples

  Scenario Outline: Login as <role>
    Given url 'https://api.example.com'
    And request { username: '<username>', password: '<password>' }
    When method POST
    Then status <expectedStatus>

    Examples:
      | role  | user  | pass  |
      | admin | admin | secret |
