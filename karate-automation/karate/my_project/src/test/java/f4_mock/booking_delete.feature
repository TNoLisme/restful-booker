Feature: DELETE /booking/{id} mock

  Scenario: delete booking
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.delete(id, cookie, authorization)
    * def responseStatus = result.status
    * def response = result.body
