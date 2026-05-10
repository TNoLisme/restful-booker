Feature: POST /booking mock

  Scenario: create booking
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.create(request)
    * def responseStatus = result.status
    * def body = result.body
