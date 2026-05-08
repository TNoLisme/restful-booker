@ignore
Feature: Delete Helper
  Scenario:
    Given url baseUrl
    And path 'booking', id
    And header Cookie = 'token=' + authToken
    When method delete
    Then status 201
