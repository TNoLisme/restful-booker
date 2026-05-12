Feature: First feature block

  Scenario: First scenario
    Given url 'https://api.example.com'
    When method GET
    Then status 200

Feature: Second feature block in same file

  Scenario: Second scenario
    Given url 'https://api.example.com'
    When method GET
    Then status 200
