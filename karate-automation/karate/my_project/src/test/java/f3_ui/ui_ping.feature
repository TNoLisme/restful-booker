Feature: Ping UI

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Ping page shows API health result
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    And waitFor('[data-testid=app-shell]')
    And click('[data-testid=nav-ping]')
    Then waitFor('[data-testid=ping-form]')
    When click('[data-testid=ping-submit]')
    Then waitForText('[data-testid=ping-state]', 'Server online')
    And waitForText('[data-testid=response-panel]', 'GET /ping response')
    And waitForText('[data-testid=response-json]', '201')
