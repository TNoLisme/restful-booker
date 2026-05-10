Feature: PUT /booking/{id} mock

  Scenario: replace booking
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.update(id, request, cookie, authorization)
    * def responseStatus = result.status
    * def response = result.body
