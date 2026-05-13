Feature: Schema validation with match

  Scenario: Validate response schema strictly
    Given url 'https://api.example.com'
    And path '/users/1'
    When method GET
    Then status 200
    And match response ==
      """
      {
        "id": "#number",
        "name": "#string",
        "email": "#regex .+@.+\\..+",
        "roles": "#[] #string",
        "active": "#boolean",
        "createdAt": "#? _ != null"
      }
      """
