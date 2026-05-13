Feature: Partial Update Booking API

  Background:
    * url 'https://restful-booker.herokuapp.com'
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

  Scenario: PAT-EP-01 cập nhật 1 field

    Given path '/booking/1'
    When method get
    Then status 200

    * def oldLastname = response.lastname
    * def oldTotalprice = response.totalprice

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {
      "firstname": "UpdatedName2"
    }
    """
    When method patch
    Then status 200

    And match response.firstname == 'UpdatedName2'
    And match response.lastname == oldLastname
    And match response.totalprice == oldTotalprice


  Scenario: PAT-EP-02 cập nhật nhiều field cùng lúc

    Given path '/booking/1'
    When method get
    Then status 200

    * def oldDepositpaid = response.depositpaid

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {
      "firstname": "New",
      "lastname": "Name",
      "totalprice": 200
    }
    """
    When method patch
    Then status 200

    And match response.firstname == 'New'
    And match response.lastname == 'Name'
    And match response.totalprice == 200
    And match response.depositpaid == oldDepositpaid


  Scenario: PAT-EP-03 cập nhật không hợp lệ: không có token

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And request
    """
    {
      "firstname": "UpdatedName"
    }
    """
    When method patch
    Then status 403


  Scenario: PAT-EP-04 field không tồn tại trong schema

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {
      "unknownfield": "value",
      "firstname": "Real"
    }
    """
    When method patch
    Then status 200

    And match response.firstname == 'Real'
    And match response !contains { unknownfield: 'value' }


  Scenario: PAT-BVA-01 body rỗng {}

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {}
    """
    When method patch
    Then status 200


  Scenario: PAT-BVA-02 firstname là chuỗi rỗng

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {
      "firstname": ""
    }
    """
    When method patch

    Then print responseStatus
    And print response


  Scenario: PAT-BVA-03 totalprice = 0

    Given path '/booking/1'
    And header Content-Type = 'application/json'
    And header Cookie = 'token=' + token
    And request
    """
    {
      "totalprice": 0
    }
    """
    When method patch
    Then status 200

    And match response.totalprice == 0