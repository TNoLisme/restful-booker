Feature: Reuse feature with call

  Scenario: Create and then delete a resource
    * def createResult = call read('v01_basic_feature.feature')
    * def token = createResult.response.token

    Given url 'https://api.example.com'
    And path '/sessions/' + token
    And header Authorization = 'Bearer ' + token
    When method DELETE
    Then status 204
