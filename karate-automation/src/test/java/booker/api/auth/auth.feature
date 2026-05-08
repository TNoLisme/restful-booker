Feature: API Xác thực (Auth)

  Background:
    * url baseUrl

  # Kịch bản này kích hoạt nhánh if(req.body.username === "admin" && req.body.password === "password123") (Branch C2)
  Scenario: Đăng nhập thành công với thông tin hợp lệ
    Given path 'auth'
    And request { username: 'admin', password: 'password123' }
    When method post
    Then status 200
    And match response.token == '#string'

  # Kịch bản này kích hoạt nhánh else trả về "Bad credentials" (Branch C2)
  Scenario: Đăng nhập thất bại với sai password
    Given path 'auth'
    And request { username: 'admin', password: 'wrongpassword' }
    When method post
    Then status 200
    And match response.reason == 'Bad credentials'
