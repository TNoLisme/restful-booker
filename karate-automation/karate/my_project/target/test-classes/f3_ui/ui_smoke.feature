Feature: Kiểm thử Giao diện (UI Smoke Test)

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Truy cập trang chủ Restful-Booker
    Given driver baseUrl
    * delay(1000)
    * print 'UI Smoke Test executed successfully'
