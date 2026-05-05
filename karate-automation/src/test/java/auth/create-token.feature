Feature: Authentication API

  Background:
    * url baseUrl

  Scenario: Tạo Token thành công với tài khoản admin
    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    And match response.token == '#string'
    # Lưu token vào biến để các scenario khác có thể dùng
    * def authToken = response.token