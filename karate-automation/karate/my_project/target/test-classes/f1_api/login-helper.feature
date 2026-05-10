@ignore
Feature: Login Helper

  Scenario:
    Given url baseUrl
    And path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    * def authToken = response.token
