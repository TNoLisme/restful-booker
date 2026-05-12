Feature: Background placed after Scenario

  Scenario: First scenario
    Given url 'https://api.example.com'
    When method GET
    Then status 200

  Background:
    Given header Authorization = 'Bearer token'
