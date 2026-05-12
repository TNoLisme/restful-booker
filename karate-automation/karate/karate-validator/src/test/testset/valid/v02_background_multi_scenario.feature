Feature: User management API

  Background:
    Given url 'https://api.example.com'
    And header Authorization = 'Bearer test-token'

  Scenario: Get all users
    Given path '/users'
    When method GET
    Then status 200
    And match response == '#array'

  Scenario: Get user by ID
    Given path '/users/1'
    When method GET
    Then status 200
    And match response.id == 1
    And match response.name == '#string'
