Feature: Restful-Booker Karate mock server

  Background:
    * configure cors = true
    * configure responseHeaders = { 'Content-Type': 'application/json' }
    * def MockData = Java.type('f4_mock.MockData')
    * def firstHeader =
      """
      function(name) {
        if (!requestHeaders) return null;
        var lower = name.toLowerCase();
        for (var key in requestHeaders) {
          if (key.toLowerCase() == lower) {
            var value = requestHeaders[key];
            return Array.isArray(value) ? value[0] : value;
          }
        }
        return null;
      }
      """

  Scenario: pathMatches('/ping') && methodIs('get')
    * def result = call read('ping.feature')
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/auth') && methodIs('post')
    * def result = call read('auth.feature')
    * def responseStatus = result.responseStatus
    * def response = result.body

  Scenario: pathMatches('/booking') && methodIs('get')
    * def result = call read('booking_list.feature')
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/booking/{id}') && methodIs('get')
    * def bookingId = pathParams.id
    * def result = call read('booking_get.feature') { id: '#(bookingId)' }
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/booking') && methodIs('post')
    * def result = call read('booking_create.feature')
    * def responseStatus = result.responseStatus
    * def response = result.body

  Scenario: pathMatches('/booking/{id}') && methodIs('put')
    * def bookingId = pathParams.id
    * def cookie = firstHeader('cookie')
    * def authorization = firstHeader('authorization')
    * def result = call read('booking_update.feature') { id: '#(bookingId)', cookie: '#(cookie)', authorization: '#(authorization)' }
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/booking/{id}') && methodIs('patch')
    * def bookingId = pathParams.id
    * def cookie = firstHeader('cookie')
    * def authorization = firstHeader('authorization')
    * def result = call read('booking_patch.feature') { id: '#(bookingId)', cookie: '#(cookie)', authorization: '#(authorization)' }
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/booking/{id}') && methodIs('delete')
    * def bookingId = pathParams.id
    * def cookie = firstHeader('cookie')
    * def authorization = firstHeader('authorization')
    * def result = call read('booking_delete.feature') { id: '#(bookingId)', cookie: '#(cookie)', authorization: '#(authorization)' }
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario: pathMatches('/reset') && methodIs('post')
    * def result = call read('reset.feature')
    * def responseStatus = result.responseStatus
    * def response = result.response

  Scenario:
    * def responseStatus = 404
    * def response = { error: 'Not Found' }
