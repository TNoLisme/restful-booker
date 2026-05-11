Feature: Timing attack check

Scenario: Timing attack check
  Given url baseUrl + '/auth'
  And request { username: 'admin', password: 'wrong' }
  When method post
  Then def time1 = responseTime

  Given url baseUrl + '/auth'
  And request { username: 'fakeuser', password: 'wrong' }
  When method post
  Then def time2 = responseTime

  * print 'time1:', time1, 'time2:', time2
