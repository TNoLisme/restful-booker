Feature: Create Booking API

Background:
    * def urlBase = 'http://127.0.0.1:3001/booking'
    * configure headers = { 'Accept': '*/*' }


Scenario: CBK-EP-01 - Đầy đủ field hợp lệ
    Given url urlBase
    And request
    """
    {
        "firstname": "Jim",
        "lastname": "Brown",
        "totalprice": 150,
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2025-06-01",
            "checkout": "2025-06-05"
        },
        "additionalneeds": "Breakfast"
    }
    """
    When method post
    Then status 200

    And match response ==
    """
    {
        bookingid: '#number',
        booking:
        {
            firstname: 'Jim',
            lastname: 'Brown',
            totalprice: 150,
            depositpaid: true,
            bookingdates:
            {
                checkin: '2025-06-01',
                checkout: '2025-06-05'
            },
            additionalneeds: 'Breakfast'
        }
    }
    """

Scenario: CBK-EP-02 - Thiếu firstname
    Given url urlBase
    And request
    """
    {
        "lastname": "Brown",
        "totalprice": 150,
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2025-06-01",
            "checkout": "2025-06-05"
        }
    }
    """
    When method post

    * assert responseStatus == 400 || responseStatus == 500

Scenario: CBK-EP-03 - Thiếu bookingdates
    Given url urlBase
    And request
    """
    {
        "firstname": "Jim",
        "lastname": "Brown",
        "totalprice": 150,
        "depositpaid": true
    }
    """
    When method post

    * assert responseStatus == 400 || responseStatus == 500

Scenario: CBK-EP-04 - depositpaid = false
    Given url urlBase
    And request
    """
    {
        "firstname": "Jim",
        "lastname": "Brown",
        "totalprice": 150,
        "depositpaid": false,
        "bookingdates": {
            "checkin": "2025-06-01",
            "checkout": "2025-06-05"
        },
        "additionalneeds": "Breakfast"
    }
    """
    When method post
    Then status 200

    And match response.booking.depositpaid == false

Scenario: CBK-EP-05 - totalprice sai kiểu dữ liệu
    Given url urlBase
    And request
    """
    {
        "firstname": "Jim",
        "lastname": "Brown",
        "totalprice": "onehundred",
        "depositpaid": true,
        "bookingdates": {
            "checkin": "2025-06-01",
            "checkout": "2025-06-05"
        },
        "additionalneeds": "Breakfast"
    }
    """
    When method post

    * assert responseStatus == 200 || responseStatus == 400 || responseStatus == 500