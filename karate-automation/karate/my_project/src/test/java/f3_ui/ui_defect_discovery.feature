Feature: UI defect discovery

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Invalid login must not open the dashboard
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When clear('[data-testid=login-password]')
    And input('[data-testid=login-password]', 'bad-password')
    And click('[data-testid=login-submit]')
    Then waitForText('[data-testid=toast-stack]', 'Bad credentials')
    And match exists('[data-testid=app-shell]') == false

  Scenario: Create form with missing required firstname is invalid
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    And waitFor('[data-testid=app-shell]')
    And click('[data-testid=nav-create]')
    Then waitFor('[data-testid=create-form]')
    When clear('[data-testid=create-firstname]')
    * def valid = script("document.querySelector('[data-testid=create-form]').checkValidity()")
    Then match valid == false

  Scenario: Update and delete unknown booking ids report errors
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    And waitFor('[data-testid=app-shell]')

    When click('[data-testid=nav-update]')
    And waitFor('[data-testid=update-form]')
    And clear('[data-testid=update-id]')
    And input('[data-testid=update-id]', '999999')
    And click('[data-testid=update-submit]')
    Then waitForText('[data-testid=response-panel]', 'Request failed')
    And waitForText('[data-testid=response-json]', '405')

    When click('[data-testid=nav-delete]')
    And waitFor('[data-testid=delete-form]')
    And clear('[data-testid=delete-id]')
    And input('[data-testid=delete-id]', '999999')
    And click('[data-testid=delete-submit]')
    Then waitForText('[data-testid=response-panel]', 'Request failed')
    And waitForText('[data-testid=response-json]', '405')

  Scenario: Expected defect - sidebar labels should match their API pages
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    Then waitFor('[data-testid=app-shell]')
    And match text('[data-testid=nav-list]') contains 'Get Booking IDs'
    And match text('[data-testid=nav-detail]') contains 'Get Booking'

  Scenario: Expected defect - landing target blank links should protect opener
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    Then match attribute('[data-testid=landing-ministry]', 'rel') contains 'noopener'
    And match attribute('[data-testid=landing-book-ai]', 'rel') contains 'noopener'
    And match attribute('[data-testid=landing-book-api]', 'rel') contains 'noopener'
    And match attribute('[data-testid=landing-mot-pro]', 'rel') contains 'noopener'
