Feature: Empty scenario body

  Scenario: This scenario has no steps

  Scenario: This one is fine
    Given url 'https://api.example.com'
    When method GET
    Then status 200
