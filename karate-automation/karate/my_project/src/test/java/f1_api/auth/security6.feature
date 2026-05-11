Feature: Token should be random

Scenario: Token should be random
  Given url baseUrl + '/auth'
  And request { username: 'admin', password: 'password123' }
  When method post
  Then def token1 = response.token

  Given url baseUrl + '/auth'
  And request { username: 'admin', password: 'password123' }
  When method post
  Then def token2 = response.token

  And match token1 != token2
