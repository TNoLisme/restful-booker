Feature: noSQL Injection attempt

Scenario: NoSQL Injection attempt
  Given url 'https://restful-booker.herokuapp.com/auth'
  And request { username: { "$ne": null }, password: { "$ne": null } }
  When method post
  Then match response.reason == 'Bad credentials'
