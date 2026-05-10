Feature: Booking read UI

  Background:
    * configure driver = { type: 'chrome' }
    * def seedBooking =
    """
    {
      "firstname": "UiRead",
      "lastname": "Case",
      "totalprice": 151,
      "depositpaid": true,
      "bookingdates": { "checkin": "2026-05-12", "checkout": "2026-05-14" },
      "additionalneeds": "Breakfast"
    }
    """
    Given url baseUrl
    And path 'booking'
    And header Accept = 'application/json'
    And request seedBooking
    When method post
    Then status 200
    * def createdId = response.bookingid

  Scenario: List bookings with empty, firstname, lastname and date filters
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    And waitFor('[data-testid=app-shell]')
    And click('[data-testid=nav-list]')
    Then waitFor('[data-testid=list-form]')

    When click('[data-testid=list-submit]')
    Then waitForText('[data-testid=response-panel]', 'GET /booking IDs response')

    When clear('[data-testid=list-firstname]')
    And input('[data-testid=list-firstname]', 'UiRead')
    And click('[data-testid=list-submit]')
    Then waitForText('[data-testid=booking-table-wrap]', 'UiRead')
    And waitForText('[data-testid=response-panel]', 'GET /booking IDs response')

    When clear('[data-testid=list-firstname]')
    And clear('[data-testid=list-lastname]')
    And input('[data-testid=list-lastname]', 'Case')
    And click('[data-testid=list-submit]')
    Then waitForText('[data-testid=booking-table-wrap]', 'Case')
    And waitForText('[data-testid=response-panel]', 'GET /booking IDs response')

    When clear('[data-testid=list-lastname]')
    And input('[data-testid=list-checkin]', '2026-05-12')
    And input('[data-testid=list-checkout]', '2026-05-14')
    And click('[data-testid=list-submit]')
    Then waitForText('[data-testid=booking-table-wrap]', 'UiRead')
    And waitForText('[data-testid=response-panel]', 'GET /booking IDs response')

  Scenario: Get booking detail by id and report not found id
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    And waitFor('[data-testid=app-shell]')
    And click('[data-testid=nav-detail]')
    Then waitFor('[data-testid=detail-form]')
    When clear('[data-testid=detail-id]')
    And input('[data-testid=detail-id]', createdId)
    And click('[data-testid=detail-submit]')
    Then waitForText('[data-testid=booking-detail]', 'UiRead Case')
    And waitForText('[data-testid=response-json]', 'UiRead')

    When clear('[data-testid=detail-id]')
    And input('[data-testid=detail-id]', '999999')
    And click('[data-testid=detail-submit]')
    Then waitForText('[data-testid=response-panel]', 'Request failed')
    And waitForText('[data-testid=response-json]', '404')
