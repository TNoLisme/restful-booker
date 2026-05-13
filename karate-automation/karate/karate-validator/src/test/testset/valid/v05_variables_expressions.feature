Feature: Variable and expression usage

  Scenario: Use variables in request
    * def baseUrl = 'https://api.example.com'
    * def userId = 42
    * def payload = { id: '#(userId)', active: true }

    Given url baseUrl
    And path '/users/' + userId
    And request payload
    When method PUT
    Then status 200
    And match response.id == '#(userId)'
    And match response.active == true
