@ignore
Feature: Check Deleted Helper
  Scenario:
    Given url baseUrl
    And path 'booking', id
    When method get
    Then status 404
