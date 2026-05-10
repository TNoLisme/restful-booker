Feature: Dashboard navigation

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Sidebar pages render the expected screen
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    Then waitFor('[data-testid=app-shell]')
    And waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=nav-list]')
    Then waitForText('[data-testid=page-title]', 'Get Booking IDs')
    And waitFor('[data-testid=list-form]')

    When click('[data-testid=nav-detail]')
    Then waitForText('[data-testid=page-title]', 'Get Booking')
    And waitFor('[data-testid=detail-form]')

    When click('[data-testid=nav-create]')
    Then waitForText('[data-testid=page-title]', 'Tao booking moi')
    And waitFor('[data-testid=create-form]')

    When click('[data-testid=nav-update]')
    Then waitForText('[data-testid=page-title]', 'Cap nhat toan bo')
    And waitFor('[data-testid=update-form]')

    When click('[data-testid=nav-patch]')
    Then waitForText('[data-testid=page-title]', 'Cap nhat mot phan')
    And waitFor('[data-testid=patch-form]')

    When click('[data-testid=nav-delete]')
    Then waitForText('[data-testid=page-title]', 'Xoa booking')
    And waitFor('[data-testid=delete-form]')

    When click('[data-testid=nav-ping]')
    Then waitForText('[data-testid=page-title]', 'Kiem tra he thong')
    And waitFor('[data-testid=ping-form]')

  Scenario: Dashboard action cards navigate to API pages
    Given driver webUrl
    And waitFor('[data-testid=login-shell]')
    When click('[data-testid=login-submit]')
    Then waitFor('[data-testid=app-shell]')

    When click('[data-testid=action-list]')
    Then waitForText('[data-testid=page-title]', 'Get Booking IDs')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-detail]')
    Then waitForText('[data-testid=page-title]', 'Get Booking')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-create]')
    Then waitForText('[data-testid=page-title]', 'Tao booking moi')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-update]')
    Then waitForText('[data-testid=page-title]', 'Cap nhat toan bo')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-patch]')
    Then waitForText('[data-testid=page-title]', 'Cap nhat mot phan')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-delete]')
    Then waitForText('[data-testid=page-title]', 'Xoa booking')
    When click('[data-testid=nav-dashboard]')
    Then waitForText('[data-testid=page-title]', 'Restful-Booker Dashboard')

    When click('[data-testid=action-ping]')
    Then waitForText('[data-testid=page-title]', 'Kiem tra he thong')
