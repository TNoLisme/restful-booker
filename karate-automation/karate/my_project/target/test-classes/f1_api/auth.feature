Feature: API Auth (CreateToken)

  Background:
    * url baseUrl

  @setup
  Scenario:
    * def fuzzer = call read('classpath:f1_api/fuzzing-helper.js')
    * def authData = fuzzer.getAuthFuzzData()

  Scenario Outline: <id>. Xác thực với <desc>
    Given path 'auth'
    And request { username: '#(user)', password: '#(pass)' }
    When method post
    Then status <status>
    # Cạm bẫy Fake 200 OK: Mặc dù 200 nhưng body phải đúng expected (Token hoặc Reason)
    And match response == <exp>

    Examples:
      | karate.setup().authData |
