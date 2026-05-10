Feature: POST /reset mock utility

  Scenario: reset mock data
    * def MockData = Java.type('f4_mock.MockData')
    * eval MockData.reset()
    * def responseStatus = 200
    * def response = { message: 'Data reset successful' }
