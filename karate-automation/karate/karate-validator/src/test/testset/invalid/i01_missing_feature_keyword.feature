  Scenario: Login without feature header
    Given url 'https://api.example.com'
    And path '/auth/login'
    When method POST
    Then status 200
