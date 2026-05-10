Feature: Booking

Background:
    * def urlBase = 'http://127.0.0.1:3001/booking'
    * configure headers = { 'Accept': '*/*' }

Scenario: GBK-EP-01 - Get booking detail by id
    Given url urlBase + '/1'
    When method get
    Then status 200

    # verify response structure
    And match response ==
    """
    {
        firstname: '#string',
        lastname: '#string',
        totalprice: '#number',
        depositpaid: '#boolean',
        bookingdates:
        {
            checkin: '#string',
            checkout: '#string'
        },
        additionalneeds: '##string'
    }
    """
Scenario: GBK-EP2-02 - Miền dữ liệu không hợp lệ
    Given url urlBase + '/a'
    When method get
    Then status 404

Scenario: GBK-BVA-01- Min+
    Given url urlBase + '/2'
    When method get
    Then status 200

    And match response ==
    """
    {
        firstname: '#string',
        lastname: '#string',
        totalprice: '#number',
        depositpaid: '#boolean',
        bookingdates:
        {
            checkin: '#string',
            checkout: '#string'
        },
        additionalneeds: '##string'
    }
    """
Scenario: GBK-BVA-02- nom
    Given url urlBase + '/5'
    When method get
    Then status 200

    And match response ==
    """
    {
        firstname: '#string',
        lastname: '#string',
        totalprice: '#number',
        depositpaid: '#boolean',
        bookingdates:
        {
            checkin: '#string',
            checkout: '#string'
        },
        additionalneeds: '##string'
    }
    """
Scenario: GBK-BVA-03- Max-
    Given url urlBase + '/9'
    When method get
    Then status 200

    And match response ==
    """
    {
        firstname: '#string',
        lastname: '#string',
        totalprice: '#number',
        depositpaid: '#boolean',
        bookingdates:
        {
            checkin: '#string',
            checkout: '#string'
        },
        additionalneeds: '##string'
    }
    """
Scenario: GBK-BVA-04- Max
    Given url urlBase + '/10'
    When method get
    Then status 200

    And match response ==
    """
    {
        firstname: '#string',
        lastname: '#string',
        totalprice: '#number',
        depositpaid: '#boolean',
        bookingdates:
        {
            checkin: '#string',
            checkout: '#string'
        },
        additionalneeds: '##string'
    }
    """