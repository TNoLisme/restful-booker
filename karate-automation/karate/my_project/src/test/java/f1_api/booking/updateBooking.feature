Feature: Update firstname of booking

  Background:
    * url baseUrl
    * configure headers = { 'Accept': '*/*' }

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

  Scenario: UPD-EP-01 cập nhật hợp lệ

    Given path '/booking/1'
    When method get
    Then status 200

    * set response.firstname = 'UpdatedName'

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And header Cookie = 'token=' + token
    And request response
    When method put
    Then status 200

    And match response.firstname == 'UpdatedName'

  Scenario: UPD-EP-02 cập nhật không hợp lệ: không có token
    Given path '/booking/1'
    When method get
    Then status 200

    * set response.firstname = 'UpdatedName'

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And request response
    When method put
    Then status 403

Scenario: UPD-EP-03 cập nhật không hợp lệ: Token sai
    Given path '/booking/1'
    When method get
    Then status 200

    * set response.firstname = 'UpdatedName'

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And header Cookie = 'token=error'
    And request response
    When method put
    Then status 403
Scenario: UPD-EP-04 cập nhật không hợp lệ: Booking không tồn tại
    Given path '/booking/1'
    When method get
    Then status 200

    * set response.firstname = 'UpdatedName'

    Given path '/booking/999999'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And header Cookie = 'token=' + token
    And request response
    When method put
    Then status 405
Scenario: UPD-EP-05 cập nhật không hợp lệ: Body thiếu
    Given path '/booking/1'
    When method get
    Then status 200

    * set response.firstname = 'UpdatedName'
    * remove response.lastname

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Accept = 'application/json'
    And header Cookie = 'token=' + token
    And request response
    When method put
    Then status 400
