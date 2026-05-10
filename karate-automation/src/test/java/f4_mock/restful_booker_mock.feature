Feature: Restful Booker API Mock

  Background:
    * configure cors = true
    * configure responseHeaders = { 'Content-Type': 'application/json' }
    * def validToken = 'mock-token-12345'
    * def bookings =
      """
      {
        "1": {
          "firstname": "Sally",
          "lastname": "Brown",
          "totalprice": 111,
          "depositpaid": true,
          "bookingdates": {
            "checkin": "2018-01-01",
            "checkout": "2019-01-01"
          },
          "additionalneeds": "Breakfast"
        },
        "2": {
          "firstname": "Jim",
          "lastname": "Wilson",
          "totalprice": 222,
          "depositpaid": false,
          "bookingdates": {
            "checkin": "2024-01-01",
            "checkout": "2024-01-10"
          },
          "additionalneeds": "Wifi"
        }
      }
      """
    * def counter = { next: 3 }
    * def isDate = function(value){ return typeof value == 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) }
    * def isPositiveId = function(value){ return /^[0-9]+$/.test(value + '') && parseInt(value) > 0 }
    * def hasValidToken =
      """
      function() {
        var cookie = requestHeaders['cookie'] || requestHeaders['Cookie'];
        var cookieText = cookie ? (cookie + '') : '';
        if (cookieText.indexOf('token=' + validToken) >= 0) {
          return true;
        }
        var auth = requestHeaders['authorization'] || requestHeaders['Authorization'];
        var authText = auth ? (auth + '') : '';
        return authText.indexOf('Basic YWRtaW46cGFzc3dvcmQxMjM=') >= 0;
      }
      """
    * def acceptsJson =
      """
      function() {
        var accept = requestHeaders['accept'] || requestHeaders['Accept'];
        if (!accept) {
          return true;
        }
        return (accept + '').toLowerCase().indexOf('xml') < 0;
      }
      """
    * def isBookingPayload =
      """
      function(body) {
        if (!body) {
          return false;
        }
        if (typeof body.firstname != 'string' || body.firstname.length == 0) {
          return false;
        }
        if (typeof body.lastname != 'string' || body.lastname.length == 0) {
          return false;
        }
        if (typeof body.totalprice != 'number' || body.totalprice < 0) {
          return false;
        }
        if (typeof body.depositpaid != 'boolean') {
          return false;
        }
        if (!body.bookingdates || !isDate(body.bookingdates.checkin) || !isDate(body.bookingdates.checkout)) {
          return false;
        }
        return body.additionalneeds == null || typeof body.additionalneeds == 'string';
      }
      """
    * def listBookingIds =
      """
      function() {
        var firstname = paramValue('firstname');
        var lastname = paramValue('lastname');
        var checkin = paramValue('checkin');
        var checkout = paramValue('checkout');
        if ((checkin && !isDate(checkin)) || (checkout && !isDate(checkout))) {
          return null;
        }
        var result = [];
        for (var id in bookings) {
          var booking = bookings[id];
          var matches = true;
          if (firstname && booking.firstname != firstname) {
            matches = false;
          }
          if (lastname && booking.lastname != lastname) {
            matches = false;
          }
          if (checkin && booking.bookingdates.checkin != checkin) {
            matches = false;
          }
          if (checkout && booking.bookingdates.checkout != checkout) {
            matches = false;
          }
          if (matches) {
            result.push({ bookingid: parseInt(id) });
          }
        }
        return result;
      }
      """
    * def mergeBooking =
      """
      function(current, patch) {
        var updated = {};
        for (var key in current) {
          updated[key] = current[key];
        }
        for (var key in patch) {
          if (key == 'bookingdates' && patch[key] && current[key]) {
            updated[key] = {};
            for (var dateKey in current[key]) {
              updated[key][dateKey] = current[key][dateKey];
            }
            for (var dateKey in patch[key]) {
              updated[key][dateKey] = patch[key][dateKey];
            }
          } else {
            updated[key] = patch[key];
          }
        }
        return updated;
      }
      """
    * def removeBooking = function(id){ delete bookings[id] }

  Scenario: pathMatches('/ping') && methodIs('get')
    * def responseStatus = 201
    * def response = ''

  Scenario: pathMatches('/auth') && methodIs('post')
    * def validCredentials = request && request.username == 'admin' && request.password == 'password123'
    * def response = validCredentials ? { token: validToken } : { reason: 'Bad credentials' }
    * def responseStatus = 200

  Scenario: pathMatches('/booking') && methodIs('get')
    * def ids = listBookingIds()
    * def responseStatus = ids == null ? 400 : 200
    * def response = ids == null ? { error: 'Bad Request' } : ids

  Scenario: pathMatches('/booking/{id}') && methodIs('get')
    * def id = pathParams.id
    * def numeric = isPositiveId(id)
    * def booking = numeric ? bookings[id] : null
    * def responseStatus = numeric ? (booking ? 200 : 404) : 400
    * def response = numeric ? (booking ? booking : { error: 'Not Found' }) : { error: 'Bad Request' }

  Scenario: pathMatches('/booking') && methodIs('post')
    * def validBooking = isBookingPayload(request)
    * def id = counter.next
    * if (validBooking) bookings['' + id] = request
    * if (validBooking) counter.next = counter.next + 1
    * def responseStatus = validBooking ? 200 : 400
    * def response = validBooking ? { bookingid: id, booking: request } : { error: 'Bad Request' }

  Scenario: pathMatches('/booking/{id}') && methodIs('put')
    * def id = pathParams.id
    * def numeric = isPositiveId(id)
    * def authorized = hasValidToken()
    * def validAccept = acceptsJson()
    * def validBooking = isBookingPayload(request)
    * def exists = numeric && bookings[id]
    * if (numeric && authorized && validAccept && validBooking && exists) bookings[id] = request
    * def responseStatus = !numeric ? 400 : (!authorized ? 403 : (!validAccept ? 400 : (!validBooking ? 400 : (exists ? 200 : 405))))
    * def response = responseStatus == 200 ? bookings[id] : { error: 'Request rejected' }

  Scenario: pathMatches('/booking/{id}') && methodIs('patch')
    * def id = pathParams.id
    * def numeric = isPositiveId(id)
    * def authorized = hasValidToken()
    * def exists = numeric && bookings[id]
    * def patched = exists ? mergeBooking(bookings[id], request) : null
    * def validBooking = patched ? isBookingPayload(patched) : false
    * if (numeric && authorized && exists && validBooking) bookings[id] = patched
    * def responseStatus = !numeric ? 400 : (!authorized ? 403 : (!exists ? 405 : (!validBooking ? 400 : 200)))
    * def response = responseStatus == 200 ? bookings[id] : { error: 'Request rejected' }

  Scenario: pathMatches('/booking/{id}') && methodIs('delete')
    * def id = pathParams.id
    * def numeric = isPositiveId(id)
    * def authorized = hasValidToken()
    * def exists = numeric && bookings[id]
    * if (numeric && authorized && exists) removeBooking(id)
    * def responseStatus = !numeric ? 400 : (!authorized ? 403 : (exists ? 201 : 405))
    * def response = responseStatus == 201 ? '' : { error: 'Request rejected' }

  Scenario:
    * def responseStatus = 404
    * def response = { error: 'Not Found' }
