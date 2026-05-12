@smoke @regression
Feature: Product catalog API

  @happy-path
  Scenario: Get product list
    Given url 'https://api.example.com'
    And path '/products'
    When method GET
    Then status 200
    And match response == '#[] #object'

  @negative @skip
  Scenario: Get non-existent product
    Given url 'https://api.example.com'
    And path '/products/99999'
    When method GET
    Then status 404
