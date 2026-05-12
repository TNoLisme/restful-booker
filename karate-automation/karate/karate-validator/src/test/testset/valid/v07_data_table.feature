Feature: Batch validation using data table

  Scenario: Validate multiple status codes in table
    Given url 'https://api.example.com'
    And path '/health'
    When method GET
    Then status 200
    And match response contains
      | field   | value |
      | status  | ok    |
      | version | v2    |
