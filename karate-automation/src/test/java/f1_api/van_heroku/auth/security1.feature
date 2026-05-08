Feature: SQL Injection attempt
Scenario: SQL Injection attempt
  Given url 'https://restful-booker.herokuapp.com/auth'
  And request { username: "admin' OR '1'='1", password: "anything" }
  When method post
  Then status 200
  And match response == { reason: 'Bad credentials' }
