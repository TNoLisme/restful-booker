Feature: Ping performance check

Scenario: GET /ping should be healthy
  Given url baseUrl
  And path 'ping'
  When method get
  Then status 201

