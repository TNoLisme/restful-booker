Feature: Giả lập API Xác thực (Auth Mock)

  Scenario: pathMatches('/auth') && methodIs('post')
    # Giả lập trả về token thành công mà không cần server thật
    * def response = { token: 'mock-token-12345' }
    * def responseStatus = 200

  Scenario:
    # Bắt tất cả các luồng request khác không hợp lệ
    * def response = { error: 'Not Found' }
    * def responseStatus = 404
