Feature: Delete Booking API

  Background:
    * url baseUrl
    * configure headers = { 'Accept': '*/*' }

    # Login lấy token
    Given path '/auth'
    And request
    """
    {
      "username": "admin",
      "password": "password123"
    }
    """
    When method post
    Then status 200

    * def token = response.token


  Scenario: DEL-EP-01 xoá thành công với token hợp lệ

    Given path '/booking/2'
    And header Cookie = 'token=' + token
    When method delete
    Then status 201


  Scenario: DEL-EP-02 xoá không hợp lệ: không có token

    Given path '/booking/3'
    When method delete
    Then status 403


  Scenario: DEL-EP-03 xoá không hợp lệ: token sai

    Given path '/booking/3'
    And header Cookie = 'token=faketoken123'
    When method delete
    Then status 403


  Scenario: DEL-EP-04 xoá booking đã bị xoá

    # Xoá lần đầu
    Given path '/booking/4'
    And header Cookie = 'token=' + token
    When method delete
    Then status 201

    # Xoá lần hai
    Given path '/booking/4'
    And header Cookie = 'token=' + token
    When method delete
    Then status 405


  Scenario: DEL-EP-05 xoá booking không tồn tại

    Given path '/booking/999999'
    And header Cookie = 'token=' + token
    When method delete
    Then status 405

