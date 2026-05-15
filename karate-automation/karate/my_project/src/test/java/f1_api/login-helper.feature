Feature: Login Helper

  Background:
    * url baseUrl

  Scenario: Get auth token
    Given path '/auth'
    And request
    """
    {
      "username": "admin",
      "password": "password123"
    }
    """
    When method post
    Then status 200

    * def authToken = 'token=' + response.token