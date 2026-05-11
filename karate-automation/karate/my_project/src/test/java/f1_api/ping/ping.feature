Feature: Ping API

  Background:
    * url baseUrl
    * configure headers = { 'Accept': '*/*' }


  Scenario: PNG-EP-01 Health check cơ bản

    Given path '/ping'
    When method get
    Then status 201

    And match response == 'Created'


  Scenario: PNG-EP-02 Sai HTTP method POST /ping

    Given path '/ping'
    When method post

    Then assert responseStatus == 404 || responseStatus == 405
