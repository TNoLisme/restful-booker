Feature: GET /booking mock

  Scenario: list booking IDs
    * def MockData = Java.type('f4_mock.MockData')
    * def responseStatus = 200
    * def response = MockData.listIds(requestParams)
