Feature: Create Token API - boundary

Scenario Outline: <desc>
  Given url 'https://restful-booker.herokuapp.com/auth'
  And request { username: '<user>', password: '<pass>' }
  When method post
  Then match response contains <result>

Examples:
|desc   | user    | pass         | result                     |
|TOKEN1 | admin   | password123  | { token: '#string' }       |
|TOKEN2 | admin   | pass         | { reason: 'Bad credentials' } |
|TOKEN3 | ad      | password123  | { reason: 'Bad credentials' } |
|TOKEN4 | ad      | pass         | { reason: 'Bad credentials' } |