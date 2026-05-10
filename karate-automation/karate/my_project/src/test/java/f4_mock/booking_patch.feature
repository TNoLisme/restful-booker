Feature: PATCH /booking/{id} mock

  Scenario: partially update booking
    * def MockData = Java.type('f4_mock.MockData')
    * def result = MockData.patch(id, request, cookie, authorization)
    * def responseStatus = result.status
    * def response = result.body
