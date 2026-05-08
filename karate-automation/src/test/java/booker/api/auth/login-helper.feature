Feature: Lấy Token phục vụ Declarative Auth

  Scenario: Tạo xác thực admin
    Given url baseUrl
    And path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    And match response.token == '#string'
    * def authToken = response.token
