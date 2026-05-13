Feature: Basic user login API

  Scenario: Successful login with valid credentials
    Given url 'https://api.example.com'
    And path '/auth/login'
    And request { username: 'admin', password: 'secret' }
    When method POST
    Then status 200
    And match response.token != null
