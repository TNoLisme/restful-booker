Feature: Unresolved placeholder

  Scenario Outline: Create user <username>
    Given url 'https://api.example.com'
    And request { username: '<username>', role: '<undefinedPlaceholder>' }
    When method POST
    Then status 201

    Examples:
      | username |
      | alice    |
      | bob      |
