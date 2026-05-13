Feature: Unclosed DocString

  Scenario: Request with unclosed triple-quote
    Given url 'https://api.example.com'
    And path '/orders'
    And request
      """
      {
        "customerId": 101,
        "items": []
    When method POST
    Then status 201
