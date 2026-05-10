Feature: UI smoke

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: React login screen renders
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    Then waitForText('body', 'Restful Booker Admin')
    And waitFor('[data-testid=login-username]')
    And waitFor('[data-testid=login-password]')
    And waitFor('[data-testid=login-submit]')
