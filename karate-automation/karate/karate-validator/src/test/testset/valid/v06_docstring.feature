Feature: DocString request body

  Scenario: Create order with JSON docstring
    Given url 'https://api.example.com'
    And path '/orders'
    And header Content-Type = 'application/json'
    And request
      """
      {
        "customerId": 101,
        "items": [
          { "productId": 1, "qty": 2 },
          { "productId": 5, "qty": 1 }
        ],
        "note": "urgent"
      }
      """
    When method POST
    Then status 201
    And match response.orderId == '#number'
