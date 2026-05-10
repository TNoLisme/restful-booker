Feature: GET /booking/{id} mock

  Scenario: get booking by ID
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.get(id)
    * def responseStatus = result.status
    * def response = result.body
