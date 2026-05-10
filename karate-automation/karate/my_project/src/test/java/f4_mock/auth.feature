Feature: POST /auth mock

  Scenario: create authentication token
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.authenticate(request)
    * def responseStatus = result.status
    * def body = result.body
