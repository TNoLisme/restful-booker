Feature: User enumeration

Scenario: User enumeration check
  Given url 'https://restful-booker.herokuapp.com/auth'
  And request { username: 'admin', password: 'wrong' }
  When method post
  Then match response.reason == 'Bad credentials'

Scenario: Non-existing user
  Given url 'https://restful-booker.herokuapp.com/auth'
  And request { username: 'not_exist_user', password: 'wrong' }
  When method post
  Then match response.reason == 'Bad credentials'