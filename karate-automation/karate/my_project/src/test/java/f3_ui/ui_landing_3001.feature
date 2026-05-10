Feature: Landing page on port 3001

  Background:
    * configure driver = { type: 'chrome' }

  Scenario: Landing page content, buttons, links and assets render
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    Then waitForText('body', 'An API playground created by')
    And waitForText('body', 'Support me and Restful-Booker')
    And waitForText('body', 'Buy AI-Assisted Testing')
    And waitForText('body', 'Buy Testing Web APIs')
    And waitForText('body', 'Go Pro with Ministry of Testing')
    And waitFor('[data-testid=landing-signin]')
    And waitFor('[data-testid=landing-author]')
    And waitFor('[data-testid=landing-twitter]')
    And waitFor('[data-testid=landing-website]')
    And waitFor('[data-testid=landing-code]')
    And waitFor('[data-testid=landing-api-docs-top]')
    And waitFor('[data-testid=landing-api-docs-inline]')
    And waitFor('[data-testid=landing-ministry]')
    And waitFor('[data-testid=landing-book-ai]')
    And waitFor('[data-testid=landing-book-api]')
    And waitFor('[data-testid=landing-mot-pro]')
    And match attribute('[data-testid=landing-book-ai-image]', 'src') contains '/images/ai-assisted-testing.jpg'
    And match attribute('[data-testid=landing-book-api-image]', 'src') contains '/images/testing-web-apis.jpg'
    And match attribute('[data-testid=landing-mot-pro-image]', 'src') contains '/images/motpro.png'

  Scenario: Internal API Docs links open and browser can return to landing page
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    When click('[data-testid=landing-api-docs-top]')
    Then waitForUrl('/apidoc/index.html')
    And match driver.url contains '/apidoc/index.html'
    When driver.back()
    Then waitForText('body', 'Welcome to Restful-Booker')

    When click('[data-testid=landing-api-docs-inline]')
    Then waitForUrl('/apidoc/index.html')
    And match driver.url contains '/apidoc/index.html'
    When driver.back()
    Then waitForText('body', 'Welcome to Restful-Booker')

  Scenario: Header external links are clickable and can return to landing page
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    And match attribute('[data-testid=landing-author]', 'href') contains 'mwtestconsultancy.co.uk'
    When click('[data-testid=landing-author]')
    Then waitUntil("location.hostname !== 'localhost'")
    And match driver.url !contains 'localhost:3001'
    When driver baseUrl
    Then waitForText('body', 'Welcome to Restful-Booker')

    And match attribute('[data-testid=landing-twitter]', 'href') contains '2bittester'
    When click('[data-testid=landing-twitter]')
    Then waitUntil("location.href.indexOf('2bittester') > -1 || location.hostname !== 'localhost'")
    And match driver.url !contains 'localhost:3001'
    When driver baseUrl
    Then waitForText('body', 'Welcome to Restful-Booker')

    And match attribute('[data-testid=landing-website]', 'href') contains 'mwtestconsultancy.co.uk'
    When click('[data-testid=landing-website]')
    Then waitUntil("location.hostname !== 'localhost'")
    And match driver.url !contains 'localhost:3001'
    When driver baseUrl
    Then waitForText('body', 'Welcome to Restful-Booker')

    And match attribute('[data-testid=landing-code]', 'href') contains 'github.com/mwinteringham/restful-booker'
    When click('[data-testid=landing-code]')
    Then waitUntil("location.hostname !== 'localhost'")
    And match driver.url !contains 'localhost:3001'
    When driver baseUrl
    Then waitForText('body', 'Welcome to Restful-Booker')

  Scenario: Ministry text support link fires click with the expected external URL
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    And match attribute('[data-testid=landing-ministry]', 'href') contains 'ministryoftesting.com/go-pro'
    And script("window.__clickedLandingHref = null")
    And script("document.querySelector('[data-testid=landing-ministry]').addEventListener('click', function(e){ e.preventDefault(); window.__clickedLandingHref = this.href; }, { once: true })")
    When scroll('[data-testid=landing-ministry]')
    And click('[data-testid=landing-ministry]')
    Then waitUntil("window.__clickedLandingHref && window.__clickedLandingHref.indexOf('ministryoftesting.com/go-pro') > -1")
    And match driver.url contains 'localhost:3001'

  Scenario: AI book image link fires click with the expected external URL
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    And match attribute('[data-testid=landing-book-ai]', 'href') contains 'bit.ly/ai-testing'
    And script("window.__clickedLandingHref = null")
    And script("document.querySelector('[data-testid=landing-book-ai]').addEventListener('click', function(e){ e.preventDefault(); window.__clickedLandingHref = this.href; }, { once: true })")
    When scroll('[data-testid=landing-book-ai]')
    And click('[data-testid=landing-book-ai-image]')
    Then waitUntil("window.__clickedLandingHref && window.__clickedLandingHref.indexOf('bit.ly/ai-testing') > -1")
    And match driver.url contains 'localhost:3001'

  Scenario: Testing Web APIs book image link fires click with the expected external URL
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    And match attribute('[data-testid=landing-book-api]', 'href') contains 'bit.ly/testwebapis'
    And script("window.__clickedLandingHref = null")
    And script("document.querySelector('[data-testid=landing-book-api]').addEventListener('click', function(e){ e.preventDefault(); window.__clickedLandingHref = this.href; }, { once: true })")
    When scroll('[data-testid=landing-book-api]')
    And click('[data-testid=landing-book-api-image]')
    Then waitUntil("window.__clickedLandingHref && window.__clickedLandingHref.indexOf('bit.ly/testwebapis') > -1")
    And match driver.url contains 'localhost:3001'

  Scenario: Ministry Pro image link fires click with the expected external URL
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    And match attribute('[data-testid=landing-mot-pro]', 'href') contains 'ministryoftesting.com/go-pro'
    And script("window.__clickedLandingHref = null")
    And script("document.querySelector('[data-testid=landing-mot-pro]').addEventListener('click', function(e){ e.preventDefault(); window.__clickedLandingHref = this.href; }, { once: true })")
    When scroll('[data-testid=landing-mot-pro]')
    And click('[data-testid=landing-mot-pro-image]')
    Then waitUntil("window.__clickedLandingHref && window.__clickedLandingHref.indexOf('ministryoftesting.com/go-pro') > -1")
    And match driver.url contains 'localhost:3001'

  Scenario: Sign In opens the React UI login screen
    Given driver baseUrl
    And waitForText('body', 'Welcome to Restful-Booker')
    When click('[data-testid=landing-signin]')
    Then waitForUrl(webUrl)
    And waitFor('[data-testid=login-shell]')
