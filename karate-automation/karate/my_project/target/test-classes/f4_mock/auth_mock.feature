Feature: Giả lập API Xác thực (Auth Mock)

  Scenario: pathMatches('/auth') && methodIs('post')
    * def response = { token: 'mock-token-12345' }
    * def responseStatus = 200

  Scenario:
    * def response = { error: 'Not Found' }
    * def responseStatus = 404
