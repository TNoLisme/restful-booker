Feature: Bad tag format

smoke regression
Feature: Product API with bad tags

  happy-path
  Scenario: Get products
    Given url 'https://api.example.com'
    And path '/products'
    When method GET
    Then status 200
