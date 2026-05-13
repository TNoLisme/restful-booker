Feature: Orphan And step

  Scenario: And used as first step
    And path '/users'
    And request { name: 'test' }
    When method POST
    Then status 201
