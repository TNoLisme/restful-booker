Feature: Auth UI

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Login success and logout
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When clear('[data-testid=login-username]')
    And input('[data-testid=login-username]', 'admin')
    And clear('[data-testid=login-password]')
    And input('[data-testid=login-password]', 'password123')
    And click('[data-testid=login-submit]')
    Then waitFor('[data-testid=app-shell]')
    And waitForText('[data-testid=session-card]', 'Admin active')
    And waitForText('[data-testid=response-panel]', 'POST /auth response')
    And waitForText('[data-testid=response-json]', 'token')
    When click('[data-testid=logout-button]')
    Then waitFor('[data-testid=login-shell]')

  Scenario: Invalid login stays on login screen and reports error
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When clear('[data-testid=login-username]')
    And input('[data-testid=login-username]', 'admin')
    And clear('[data-testid=login-password]')
    And input('[data-testid=login-password]', 'wrong-password')
    And click('[data-testid=login-submit]')
    Then waitFor('[data-testid=login-shell]')
    And waitForText('[data-testid=toast-stack]', 'Bad credentials')
    And match exists('[data-testid=app-shell]') == false
