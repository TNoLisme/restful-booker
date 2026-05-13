Feature: Login validation with multiple users

  Scenario Outline: Login with <role> credentials
    Given url 'https://api.example.com'
    And path '/auth/login'
    And request { username: '<username>', password: '<password>' }
    When method POST
    Then status <expectedStatus>

    Examples:
      | role  | username | password | expectedStatus |
      | admin | admin    | secret   | 200            |
      | guest | guest    | pass123  | 200            |
      | bad   | hacker   | wrong    | 401            |
